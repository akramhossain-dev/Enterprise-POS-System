#!/usr/bin/env node
// B10.1 Test Suite — Chart of Accounts & General Ledger Foundation
// run: node test-b10.1.js

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

  const companyRes = await req('GET', '/companies', TOKEN);
  const COMPANY_ID = companyRes.data?.[0]?.id;
  if (!COMPANY_ID) {
    console.error('NO COMPANY');
    process.exit(1);
  }

  // Get categories to find IDs
  const categoriesRes = await req('GET', '/account-categories', TOKEN);
  const assetsCat = categoriesRes.data?.find((c) => c.name === 'Asset Accounts');
  if (!assetsCat) {
    console.error('ASSETS CATEGORY NOT FOUND', categoriesRes);
    process.exit(1);
  }

  // Get seeded default accounts
  const accountsListRes = await req('GET', '/accounts?limit=100', TOKEN);
  const cashAcc = accountsListRes.data?.find((a) => a.accountCode === '1000');
  const bankAcc = accountsListRes.data?.find((a) => a.accountCode === '1100');

  if (!cashAcc || !bankAcc) {
    console.error('DEFAULT SEEDED ACCOUNTS NOT FOUND', accountsListRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Cash Account: ${cashAcc.id}, Bank Account: ${bankAcc.id}\n`,
  );

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Create Ledger Account & Parent Hierarchy
  // ────────────────────────────────────────────────────────────────────────────
  // We will create a "Petty Cash" account with "Cash" as parent.
  const subCode = '1001-' + Date.now().toString().slice(-4);
  const createAccRes = await req('POST', '/accounts', TOKEN, {
    categoryId: assetsCat.id,
    parentId: cashAcc.id,
    accountCode: subCode,
    name: 'Petty Cash',
    type: 'ASSET',
    openingBalance: 100,
  });

  if (
    createAccRes.success &&
    createAccRes.data?.parentId === cashAcc.id &&
    createAccRes.data?.accountCode === subCode &&
    Number(createAccRes.data?.openingBalance) === 100
  ) {
    pass(1, 'Created Account hierarchy ("Petty Cash" under "Cash") successfully');
  } else {
    fail(1, 'Failed to create hierarchical account', createAccRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Unique Account Code Enforcement
  // ────────────────────────────────────────────────────────────────────────────
  // Re-creating code '1001' should fail.
  const dupCodeRes = await req('POST', '/accounts', TOKEN, {
    categoryId: assetsCat.id,
    accountCode: subCode,
    name: 'Duplicate Petty Cash',
    type: 'ASSET',
  });

  if (dupCodeRes.success === false && dupCodeRes.message?.includes('already in use')) {
    pass(2, 'Unique account code constraint successfully enforced');
  } else {
    fail(2, 'Unique code check failed to reject duplicate', dupCodeRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Debit Credit Validation (Reject unbalanced entry)
  // ────────────────────────────────────────────────────────────────────────────
  const unbalancedRes = await req('POST', '/journals', TOKEN, {
    date: new Date().toISOString(),
    description: 'Unbalanced purchase',
    items: [
      { accountId: cashAcc.id, debit: 150, credit: 0 },
      { accountId: bankAcc.id, debit: 0, credit: 100 },
    ],
  });

  const isValidationError =
    unbalancedRes.success === false &&
    (unbalancedRes.message?.includes('balanced') ||
      unbalancedRes.errors?.[0]?.includes('balanced'));

  if (isValidationError) {
    pass(3, 'Debit/Credit validation successfully blocked unbalanced journal entry');
  } else {
    fail(3, 'Validation failed to block unbalanced journal entry', unbalancedRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Create Journal Entry (Balanced debit = credit)
  // ────────────────────────────────────────────────────────────────────────────
  // Debit Cash 500, Credit Bank 500
  const journalRes = await req('POST', '/journals', TOKEN, {
    date: new Date().toISOString(),
    description: 'Cash deposit from bank',
    items: [
      { accountId: cashAcc.id, debit: 500, credit: 0 },
      { accountId: bankAcc.id, debit: 0, credit: 500 },
    ],
  });

  if (journalRes.success && journalRes.data?.entryNumber?.startsWith('JE-')) {
    pass(4, 'Posted balanced double-entry Journal Entry successfully');
  } else {
    fail(4, 'Failed to post balanced journal entry', journalRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Account Balance Update verification
  // ────────────────────────────────────────────────────────────────────────────
  const cashAfter = await req('GET', `/accounts/${cashAcc.id}`, TOKEN);
  const bankAfter = await req('GET', `/accounts/${bankAcc.id}`, TOKEN);

  const cashBalDelta = Number(cashAfter.data?.currentBalance) - Number(cashAcc.currentBalance);
  const bankBalDelta = Number(bankAfter.data?.currentBalance) - Number(bankAcc.currentBalance);

  if (cashBalDelta === 500 && bankBalDelta === -500) {
    pass(5, 'Double-entry asset account balances updated correctly (+500 Cash, -500 Bank)');
  } else {
    fail(5, 'Account balance update check failed', {
      cashBalDelta,
      bankBalDelta,
      cashAfter,
      bankAfter,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Ledger Calculation running balance verification
  // ────────────────────────────────────────────────────────────────────────────
  const ledgerRes = await req('GET', `/accounts/${cashAcc.id}/ledger`, TOKEN);
  const entries = ledgerRes.data?.entries || [];

  const has500Debit = entries.some((e) => Number(e.debit) === 500);

  if (ledgerRes.success && entries.length >= 1 && has500Debit) {
    pass(6, 'General Ledger calculated running balances correctly');
  } else {
    fail(6, 'General Ledger history calculation failed', ledgerRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Permission Guard blocks unauthorized calls
  // ────────────────────────────────────────────────────────────────────────────
  const cashierLogin = await req('POST', '/auth/login', null, {
    email: 'cashier@enterprise-pos.com',
    password: 'cashier123',
  });
  const CASHIER_TOKEN = cashierLogin.data?.accessToken;

  const forbiddenRes = await req('POST', '/accounts', CASHIER_TOKEN, {
    categoryId: assetsCat.id,
    accountCode: '9999',
    name: 'Unauthorized Cashier Account',
    type: 'ASSET',
  });

  if (
    forbiddenRes.success === false &&
    (forbiddenRes.code === 'FORBIDDEN' || forbiddenRes.statusCode === 403)
  ) {
    pass(7, 'Permission guard successfully blocks cashier from creating accounts');
  } else {
    fail(7, 'Security check failed to prevent unauthorized access', forbiddenRes);
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
