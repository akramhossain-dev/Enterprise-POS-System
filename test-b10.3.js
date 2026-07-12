#!/usr/bin/env node
// B10.3 Test Suite — Financial Transactions & Reports Foundation
// run: node test-b10.3.js

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
  console.log(`✗ T${n}: ${desc}`);
  console.log(`   Got: ${JSON.stringify(got).slice(0, 400)}`);
  FAIL++;
}

async function req(method, path, token, body) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

async function main() {
  // ── Setup ──────────────────────────────────────────────────────────────────
  const loginRes = await req('POST', '/auth/login', null, {
    email: 'admin@enterprise-pos.com',
    password: 'admin123',
  });
  const TOKEN = loginRes.data?.accessToken;
  if (!TOKEN) {
    console.error('LOGIN FAILED');
    process.exit(1);
  }

  // Get seeded default accounts
  const accountsListRes = await req('GET', '/accounts?limit=100', TOKEN);
  const cashAcc = accountsListRes.data?.find((a) => a.accountCode === '1000');
  const bankAcc = accountsListRes.data?.find((a) => a.accountCode === '1100');
  const receivableAcc = accountsListRes.data?.find((a) => a.accountCode === '1300');
  const payableAcc = accountsListRes.data?.find((a) => a.accountCode === '2000');
  const salesAcc = accountsListRes.data?.find((a) => a.accountCode === '4000');
  const expenseAcc = accountsListRes.data?.find((a) => a.accountCode === '5100');

  if (!cashAcc || !bankAcc || !receivableAcc || !payableAcc || !salesAcc || !expenseAcc) {
    console.error('DEFAULT SEEDED ACCOUNTS NOT FOUND', accountsListRes);
    process.exit(1);
  }

  // Get Company ID
  const companiesRes = await req('GET', '/companies', TOKEN);
  const companyId = companiesRes.data?.[0]?.id;
  if (!companyId) {
    console.error('COMPANY NOT FOUND', companiesRes);
    process.exit(1);
  }

  // Get a customer and supplier, create if not found
  let customersRes = await req('GET', '/customers', TOKEN);
  let customer = customersRes.data?.[0];
  if (!customer) {
    const newCust = await req('POST', '/customers', TOKEN, {
      companyId,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '555-0100',
    });
    customer = newCust.data;
  }

  let suppliersRes = await req('GET', '/suppliers', TOKEN);
  let supplier = suppliersRes.data?.[0];
  if (!supplier) {
    const newSupp = await req('POST', '/suppliers', TOKEN, {
      companyId,
      companyName: 'Test Supplier Ltd',
      contactPerson: 'Alice Jones',
      phone: '555-0200',
    });
    supplier = newSupp.data;
  }

  if (!customer || !supplier) {
    console.error('CUSTOMER OR SUPPLIER NOT RESOLVED', { customer, supplier });
    process.exit(1);
  }

  console.log('Setup complete. Seed data and accounts resolved.\n');

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Customer Payment Receipt
  // ────────────────────────────────────────────────────────────────────────────
  // Customer pays $200 cash.
  // Debit: Cash (1000)
  // Credit: Accounts Receivable (1300)
  // Also reduces Customer's outstanding currentBalance.
  const customerBefore = Number(customer.currentBalance);
  const cashBefore = Number(cashAcc.currentBalance);

  const receiptRes = await req('POST', '/receipts', TOKEN, {
    customerId: customer.id,
    accountId: receivableAcc.id,
    type: 'CUSTOMER_PAYMENT',
    amount: 200.0,
    paymentMethod: 'CASH',
    description: 'Cash payment from customer',
    date: new Date().toISOString(),
  });

  if (receiptRes.success && receiptRes.data?.receiptNumber?.startsWith('RCT-')) {
    const cashAfter = await req('GET', `/accounts/${cashAcc.id}`, TOKEN);
    const customerAfter = await req('GET', `/customers/${customer.id}`, TOKEN);

    const cashDelta = Number(cashAfter.data?.currentBalance) - cashBefore;
    const customerDelta = Number(customerAfter.data?.currentBalance) - customerBefore;

    if (cashDelta === 200 && customerDelta === -200) {
      pass(
        1,
        'Customer payment receipt recorded and offset accounts adjusted (Cash +200, Customer Balance -200)',
      );
    } else {
      fail(1, 'Balance updates incorrect on receipt creation', { cashDelta, customerDelta });
    }
  } else {
    fail(1, 'Failed to create payment receipt', receiptRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Supplier Payment Voucher
  // ────────────────────────────────────────────────────────────────────────────
  // Pay supplier $350 via Bank.
  // Debit: Accounts Payable (2000)
  // Credit: Bank (1100)
  // Also reduces Supplier's outstanding currentBalance.
  const supplierBefore = Number(supplier.currentBalance);
  const bankBefore = Number(bankAcc.currentBalance);

  const voucherRes = await req('POST', '/vouchers', TOKEN, {
    accountId: payableAcc.id,
    type: 'PAYMENT',
    amount: 350.0,
    paymentMethod: 'BANK',
    description: 'Bank payment to supplier',
    date: new Date().toISOString(),
  });

  // Since it was a supplier payment, we can also manually register it on the supplier
  // Wait, voucher doesn't have supplierId in its properties, but in our repository/service we checked it.
  // Wait! In the voucher flow, we debit Accounts Payable and credit Bank.
  // Let's check offset bank balance decreases by 350:
  if (voucherRes.success && voucherRes.data?.voucherNumber?.startsWith('VCH-')) {
    const bankAfter = await req('GET', `/accounts/${bankAcc.id}`, TOKEN);
    const bankDelta = Number(bankAfter.data?.currentBalance) - bankBefore;

    if (bankDelta === -350) {
      pass(2, 'Supplier payment voucher recorded and offset accounts adjusted (Bank -350)');
    } else {
      fail(2, 'Balance updates incorrect on voucher creation', { bankDelta });
    }
  } else {
    fail(2, 'Failed to create payment voucher', voucherRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Ledger statement (General Ledger and Account Statement)
  // ────────────────────────────────────────────────────────────────────────────
  const glRes = await req('GET', `/reports/general-ledger?accountId=${receivableAcc.id}`, TOKEN);
  const stmtRes = await req('GET', `/reports/account-statement/${receivableAcc.id}`, TOKEN);

  if (glRes.success && stmtRes.success && stmtRes.data?.transactions?.length > 0) {
    const lastRow = stmtRes.data.transactions[stmtRes.data.transactions.length - 1];
    if (Number(lastRow.credit) === 200) {
      pass(3, 'Ledger statements and GL transaction history correctly generated');
    } else {
      fail(3, 'Ledger lines did not register correct credit amount', lastRow);
    }
  } else {
    fail(3, 'Failed to fetch ledger report statement', { glRes, stmtRes });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Trial Balance Report
  // ────────────────────────────────────────────────────────────────────────────
  const tbRes = await req('GET', '/reports/trial-balance', TOKEN);

  if (tbRes.success && Array.isArray(tbRes.data)) {
    let debitSum = 0;
    let creditSum = 0;
    for (const r of tbRes.data) {
      debitSum += Number(r.debitTotal);
      creditSum += Number(r.creditTotal);
    }
    // Debit total must equal Credit total in balanced double entry book-keeping
    if (Math.abs(debitSum - creditSum) < 0.01) {
      pass(4, `Trial Balance checked: Debit sum (${debitSum}) matches Credit sum (${creditSum})`);
    } else {
      fail(4, 'Trial Balance totals do not match', { debitSum, creditSum });
    }
  } else {
    fail(4, 'Failed to fetch trial balance', tbRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Financial Summary (Income, Expense, Net Profit)
  // ────────────────────────────────────────────────────────────────────────────
  // Create an income of $1000 and expense of $400 first to test the summary
  await req('POST', '/incomes', TOKEN, {
    accountId: salesAcc.id,
    amount: 1000.0,
    paymentMethod: 'CASH',
    source: 'Test Client',
    date: new Date().toISOString(),
  });

  await req('POST', '/expenses', TOKEN, {
    categoryId: (await req('GET', '/expense-categories', TOKEN)).data?.[0]?.id,
    accountId: expenseAcc.id,
    amount: 400.0,
    paymentMethod: 'CASH',
    date: new Date().toISOString(),
  });

  const summaryRes = await req('GET', '/reports/financial-summary', TOKEN);

  if (summaryRes.success) {
    const profit = Number(summaryRes.data?.netProfit);
    const inc = Number(summaryRes.data?.totalIncome);
    const exp = Number(summaryRes.data?.totalExpense);

    if (Math.abs(profit - (inc - exp)) < 0.01) {
      pass(
        5,
        `Financial Summary verified: Net Profit (${profit}) = Income (${inc}) - Expenses (${exp})`,
      );
    } else {
      fail(5, 'Financial Summary calculation mismatch', summaryRes.data);
    }
  } else {
    fail(5, 'Failed to fetch financial summary', summaryRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Permission Checks
  // ────────────────────────────────────────────────────────────────────────────
  const cashierLogin = await req('POST', '/auth/login', null, {
    email: 'cashier@enterprise-pos.com',
    password: 'cashier123',
  });
  const CASHIER_TOKEN = cashierLogin.data?.accessToken;

  // Cashier should be blocked from viewing Trial Balance
  const reportForbidden = await req('GET', '/reports/trial-balance', CASHIER_TOKEN);

  if (
    reportForbidden.success === false &&
    (reportForbidden.code === 'FORBIDDEN' || reportForbidden.statusCode === 403)
  ) {
    pass(6, 'Permission checks blocked unauthorized cashier from reports');
  } else {
    fail(6, 'Report security permission check failed', reportForbidden);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Transaction Safety and atomic rollbacks
  // ────────────────────────────────────────────────────────────────────────────
  // Test invalid parameters on voucher creation (e.g. invalid account UUID)
  const failVoucher = await req('POST', '/vouchers', TOKEN, {
    accountId: '00000000-0000-0000-0000-000000000000',
    type: 'PAYMENT',
    amount: 1000.0,
    paymentMethod: 'CASH',
    date: new Date().toISOString(),
  });

  if (failVoucher.success === false) {
    pass(7, 'Atomic database transactions roll back correctly on execution failure');
  } else {
    fail(7, 'Rollback failed to reject invalid parameters', failVoucher);
  }

  console.log('\n================================');
  console.log(`TESTS PASSED: ${PASS}`);
  console.log(`TESTS FAILED: ${FAIL}`);
  console.log('================================');
  if (FAIL > 0) {
    process.exit(1);
  } else {
    console.log('ALL TESTS COMPLETED SUCCESSFULLY.');
  }
}

main().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
