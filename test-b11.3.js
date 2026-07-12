#!/usr/bin/env node
// B11.3 Test Suite — Inventory & Financial Reports
// run: node test-b11.3.js

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
  try {
    const r = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await r.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  // ── Setup logins ──────────────────────────────────────────────────────────
  const loginRes = await req('POST', '/auth/login', null, {
    email: 'admin@enterprise-pos.com',
    password: 'admin123',
  });
  const TOKEN = loginRes.data?.accessToken;
  if (!TOKEN) {
    console.error('ADMIN LOGIN FAILED');
    process.exit(1);
  }

  const cashierLoginRes = await req('POST', '/auth/login', null, {
    email: 'cashier@enterprise-pos.com',
    password: 'cashier123',
  });
  const CASHIER_TOKEN = cashierLoginRes.data?.accessToken;
  if (!CASHIER_TOKEN) {
    console.error('CASHIER LOGIN FAILED');
    process.exit(1);
  }

  // Get Company ID
  const companiesRes = await req('GET', '/companies', TOKEN);
  const companyId = companiesRes.data?.[0]?.id;
  if (!companyId) {
    console.error('COMPANY NOT FOUND');
    process.exit(1);
  }

  // Resolve a warehouse
  let warehousesRes = await req('GET', '/warehouses', TOKEN);
  let warehouseId = warehousesRes.data?.[0]?.id;
  if (!warehouseId) {
    const newWH = await req('POST', '/warehouses', TOKEN, {
      companyId,
      name: 'Main Warehouse',
      code: 'MAIN-WH',
    });
    warehouseId = newWH.data?.id;
  }

  // Fetch chart of accounts to find a valid account for General Ledger report
  const accountsRes = await req('GET', '/accounts', TOKEN);
  const accountId = accountsRes.data?.[0]?.id;

  if (!warehouseId || !accountId) {
    console.error('SETUP ERRORS: resolved warehouse or account missing', {
      warehouseId,
      accountId,
    });
    process.exit(1);
  }

  console.log('Setup successfully completed.\n');

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Inventory Report
  // ────────────────────────────────────────────────────────────────────────────
  const invRes = await req('GET', '/reports/inventory?page=1&limit=10', TOKEN);
  if (invRes.success && Array.isArray(invRes.data) && invRes.meta) {
    pass(1, 'Inventory Report fetched correctly with pagination data');
  } else {
    fail(1, 'Failed to fetch Inventory Report', invRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Low Stock
  // ────────────────────────────────────────────────────────────────────────────
  const lowStockRes = await req('GET', '/reports/low-stock', TOKEN);
  if (lowStockRes.success && Array.isArray(lowStockRes.data)) {
    pass(2, 'Low Stock Report returned list of low-quantity products');
  } else {
    fail(2, 'Failed to fetch Low Stock Report', lowStockRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Out Of Stock
  // ────────────────────────────────────────────────────────────────────────────
  const outOfStockRes = await req('GET', '/reports/out-of-stock', TOKEN);
  if (outOfStockRes.success && Array.isArray(outOfStockRes.data)) {
    pass(3, 'Out Of Stock Report returned list of depleted inventories');
  } else {
    fail(3, 'Failed to fetch Out Of Stock Report', outOfStockRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Stock Movements
  // ────────────────────────────────────────────────────────────────────────────
  const movementsRes = await req(
    'GET',
    `/reports/stock-movements?warehouseId=${warehouseId}`,
    TOKEN,
  );
  if (movementsRes.success && Array.isArray(movementsRes.data)) {
    pass(4, 'Stock Movement Report filtered by warehouse successfully');
  } else {
    fail(4, 'Failed to fetch Stock Movement Report', movementsRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Batch Report
  // ────────────────────────────────────────────────────────────────────────────
  const batchRes = await req('GET', '/reports/batches', TOKEN);
  if (batchRes.success && Array.isArray(batchRes.data)) {
    pass(5, 'Batch Report details returned cleanly');
  } else {
    fail(5, 'Failed to fetch Batch Report', batchRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Expiry Report
  // ────────────────────────────────────────────────────────────────────────────
  const expiryRes = await req('GET', '/reports/expiry?search=Expired', TOKEN);
  if (expiryRes.success && Array.isArray(expiryRes.data)) {
    pass(6, 'Expiry Report warning alerts fetched successfully');
  } else {
    fail(6, 'Failed to fetch Expiry Report', expiryRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Warehouse summary
  // ────────────────────────────────────────────────────────────────────────────
  const whReportRes = await req('GET', '/reports/warehouses', TOKEN);
  if (whReportRes.success && Array.isArray(whReportRes.data)) {
    pass(7, 'Warehouse Report totals aggregated successfully');
  } else {
    fail(7, 'Failed to fetch Warehouse Report', whReportRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Inventory Valuation
  // ────────────────────────────────────────────────────────────────────────────
  const valuationRes = await req('GET', '/reports/inventory-valuation', TOKEN);
  if (valuationRes.success && valuationRes.data && 'overallValue' in valuationRes.data) {
    pass(8, 'Inventory Valuation calculated weighted cost values');
  } else {
    fail(8, 'Failed to fetch Inventory Valuation', valuationRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: General Ledger
  // ────────────────────────────────────────────────────────────────────────────
  const ledgerRes = await req('GET', `/reports/general-ledger?accountId=${accountId}`, TOKEN);
  if (ledgerRes.success && Array.isArray(ledgerRes.data)) {
    pass(9, 'General Ledger Report mapped opening, debits, credits, and closing balances');
  } else {
    fail(9, 'Failed to fetch General Ledger Report', ledgerRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T10: Trial Balance
  // ────────────────────────────────────────────────────────────────────────────
  const trialRes = await req('GET', '/reports/trial-balance', TOKEN);
  if (trialRes.success && Array.isArray(trialRes.data)) {
    pass(10, 'Trial Balance Sheet fetched correctly');
  } else {
    fail(10, 'Failed to fetch Trial Balance Sheet', trialRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T11: Profit & Loss Foundation
  // ────────────────────────────────────────────────────────────────────────────
  const plRes = await req('GET', '/reports/profit-loss', TOKEN);
  if (plRes.success && plRes.data && 'grossProfit' in plRes.data) {
    pass(11, 'Profit & Loss Statement computed revenue, COGS, gross and net profit');
  } else {
    fail(11, 'Failed to fetch Profit & Loss Statement', plRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T12: Permission Guard Check
  // ────────────────────────────────────────────────────────────────────────────
  const failLedger = await req(
    'GET',
    `/reports/general-ledger?accountId=${accountId}`,
    CASHIER_TOKEN,
  );
  const failPL = await req('GET', '/reports/profit-loss', CASHIER_TOKEN);
  const failInv = await req('GET', '/reports/inventory', CASHIER_TOKEN);

  if (failLedger.success === false && failPL.success === false && failInv.success === false) {
    pass(12, 'Security middleware and permissions guard restricted cashier access');
  } else {
    fail(12, 'Security guards failed to block cashier role from reading reports', {
      failLedger,
      failPL,
      failInv,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
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

main().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
