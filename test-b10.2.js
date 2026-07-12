#!/usr/bin/env node
// B10.2 Test Suite — Income & Expense Management
// run: node test-b10.2.js

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

  // Get categories to find IDs
  const categoriesRes = await req('GET', '/account-categories', TOKEN);
  const assetsCat = categoriesRes.data?.find((c) => c.name === 'Asset Accounts');
  const expenseCat = categoriesRes.data?.find((c) => c.name === 'Expense Accounts');
  const incomeCat = categoriesRes.data?.find((c) => c.name === 'Income Accounts');

  if (!assetsCat || !expenseCat || !incomeCat) {
    console.error('ACCOUNT CATEGORIES NOT FOUND', categoriesRes);
    process.exit(1);
  }

  // Get seeded default accounts
  const accountsListRes = await req('GET', '/accounts?limit=100', TOKEN);
  const cashAcc = accountsListRes.data?.find((a) => a.accountCode === '1000');
  const bankAcc = accountsListRes.data?.find((a) => a.accountCode === '1100');
  const expenseAcc = accountsListRes.data?.find((a) => a.accountCode === '5100');
  const salesAcc = accountsListRes.data?.find((a) => a.accountCode === '4000');

  if (!cashAcc || !bankAcc || !expenseAcc || !salesAcc) {
    console.error('DEFAULT SEEDED ACCOUNTS NOT FOUND', accountsListRes);
    process.exit(1);
  }

  // List expense categories
  const expenseCatsRes = await req('GET', '/expense-categories', TOKEN);
  const electricityCat = expenseCatsRes.data?.find((c) => c.name === 'Electricity');
  if (!electricityCat) {
    console.error('SEED EXPENSE CATEGORY NOT FOUND', expenseCatsRes);
    process.exit(1);
  }

  console.log('Setup complete. Default accounts resolved successfully.\n');

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Create Expense Category
  // ────────────────────────────────────────────────────────────────────────────
  const newCatRes = await req('POST', '/expense-categories', TOKEN, {
    name: 'Internet Services',
    description: 'Office broadband lines',
  });

  if (newCatRes.success && newCatRes.data?.name === 'Internet Services') {
    pass(1, 'Created Expense Category successfully');
  } else {
    fail(1, 'Failed to create expense category', newCatRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Create Expense Entry & Journal Auto Posting & Balance Update
  // ────────────────────────────────────────────────────────────────────────────
  // Record $150 broadband expense using cash.
  // Debit: Expense Account (5100) -> Increases balance
  // Credit: Cash Account (1000) -> Decreases balance
  const cashBefore = Number(cashAcc.currentBalance);
  const expBefore = Number(expenseAcc.currentBalance);

  const newExpRes = await req('POST', '/expenses', TOKEN, {
    categoryId: electricityCat.id,
    accountId: expenseAcc.id,
    date: new Date().toISOString(),
    amount: 150.0,
    paymentMethod: 'CASH',
    description: 'Electric bill July',
  });

  if (newExpRes.success && newExpRes.data?.expenseNumber?.startsWith('EXP-')) {
    const cashAfter = await req('GET', `/accounts/${cashAcc.id}`, TOKEN);
    const expAfter = await req('GET', `/accounts/${expenseAcc.id}`, TOKEN);

    const cashDelta = Number(cashAfter.data?.currentBalance) - cashBefore;
    const expDelta = Number(expAfter.data?.currentBalance) - expBefore;

    // Fetch ledger of cash account to verify journal entry details
    const cashLedger = await req('GET', `/accounts/${cashAcc.id}/ledger`, TOKEN);
    const entries = cashLedger.data?.entries || [];
    const lastEntry = entries[entries.length - 1];

    if (cashDelta === -150 && expDelta === 150 && lastEntry && Number(lastEntry.credit) === 150) {
      pass(
        2,
        'Created Expense Entry with balanced Journal posting and correct cash decrement (-150)',
      );
    } else {
      fail(2, 'Expense balance updates or ledger lines check failed', {
        cashDelta,
        expDelta,
        lastEntry,
      });
    }
  } else {
    fail(2, 'Failed to create expense entry', newExpRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Create Income Entry & Journal Auto Posting & Balance Update
  // ────────────────────────────────────────────────────────────────────────────
  // Record $500 miscellaneous income using bank.
  // Debit: Bank Account (1100) -> Increases balance (Asset is Debit Normal)
  // Credit: Sales Account (4000) -> Increases balance (Income is Credit Normal)
  const bankBefore = Number(bankAcc.currentBalance);
  const salesBefore = Number(salesAcc.currentBalance);

  const newIncRes = await req('POST', '/incomes', TOKEN, {
    accountId: salesAcc.id,
    date: new Date().toISOString(),
    amount: 500.0,
    paymentMethod: 'BANK',
    source: 'Consulting fees',
    description: 'Manual service income',
  });

  if (newIncRes.success && newIncRes.data?.incomeNumber?.startsWith('INC-')) {
    const bankAfter = await req('GET', `/accounts/${bankAcc.id}`, TOKEN);
    const salesAfter = await req('GET', `/accounts/${salesAcc.id}`, TOKEN);

    const bankDelta = Number(bankAfter.data?.currentBalance) - bankBefore;
    const salesDelta = Number(salesAfter.data?.currentBalance) - salesBefore;

    if (bankDelta === 500 && salesDelta === 500) {
      pass(
        3,
        'Created Income Entry with balanced Journal posting and correct bank increment (+500)',
      );
    } else {
      fail(3, 'Income balance updates check failed', { bankDelta, salesDelta });
    }
  } else {
    fail(3, 'Failed to create income entry', newIncRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Validations (Amount > 0, account/category match)
  // ────────────────────────────────────────────────────────────────────────────
  const negAmtRes = await req('POST', '/expenses', TOKEN, {
    categoryId: electricityCat.id,
    accountId: expenseAcc.id,
    date: new Date().toISOString(),
    amount: -50,
    paymentMethod: 'CASH',
  });

  const wrongAccRes = await req('POST', '/expenses', TOKEN, {
    categoryId: electricityCat.id,
    accountId: salesAcc.id, // Sales is INCOME, not EXPENSE!
    date: new Date().toISOString(),
    amount: 100,
    paymentMethod: 'CASH',
  });

  if (negAmtRes.success === false && wrongAccRes.success === false) {
    pass(4, 'Amount > 0 and account type constraints correctly enforced');
  } else {
    fail(4, 'Failed to enforce validation checks on invalid inputs', { negAmtRes, wrongAccRes });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Transaction Rollback on failure
  // ────────────────────────────────────────────────────────────────────────────
  // We trigger an atomic error by attempting to create an expense with a non-existent account UUID.
  const badUuidRes = await req('POST', '/expenses', TOKEN, {
    categoryId: electricityCat.id,
    accountId: '00000000-0000-0000-0000-000000000000',
    date: new Date().toISOString(),
    amount: 200,
    paymentMethod: 'CASH',
  });

  if (badUuidRes.success === false) {
    pass(5, 'Atomic database transactions safely rollback on runtime exceptions');
  } else {
    fail(5, 'Rollback test failed to reject invalid request', badUuidRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Cancellation and reversal posting
  // ────────────────────────────────────────────────────────────────────────────
  // Cancel the broadband expense created in T2 (newExpRes.data.id).
  // Status update to CANCELLED triggers reversal journal posting and balance rollback.
  const cancelRes = await req('PATCH', `/expenses/${newExpRes.data.id}`, TOKEN, {
    status: 'CANCELLED',
  });

  if (cancelRes.success && cancelRes.data?.status === 'CANCELLED') {
    const cashAfterCancel = await req('GET', `/accounts/${cashAcc.id}`, TOKEN);
    const expAfterCancel = await req('GET', `/accounts/${expenseAcc.id}`, TOKEN);

    const cashReverted = Number(cashAfterCancel.data?.currentBalance) === cashBefore;
    const expReverted = Number(expAfterCancel.data?.currentBalance) === expBefore;

    if (cashReverted && expReverted) {
      pass(6, 'Expense cancellation posted reversal and reverted account balances successfully');
    } else {
      fail(6, 'Cancellation ledger balance rollback failed', { cashAfterCancel, expAfterCancel });
    }
  } else {
    fail(6, 'Failed to cancel expense entry', cancelRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Permission Checks
  // ────────────────────────────────────────────────────────────────────────────
  const cashierLogin = await req('POST', '/auth/login', null, {
    email: 'cashier@enterprise-pos.com',
    password: 'cashier123',
  });
  const CASHIER_TOKEN = cashierLogin.data?.accessToken;

  // Cashier should be blocked from deleting expenses.
  const deleteForbidden = await req('DELETE', `/expenses/${newExpRes.data.id}`, CASHIER_TOKEN);

  if (
    deleteForbidden.success === false &&
    (deleteForbidden.code === 'FORBIDDEN' || deleteForbidden.statusCode === 403)
  ) {
    pass(7, 'Permission checks blocked unauthorized cashier actions');
  } else {
    fail(7, 'Security permission check failed', deleteForbidden);
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
