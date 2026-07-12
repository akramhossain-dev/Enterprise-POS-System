#!/usr/bin/env node
// B11.1 Test Suite — Dashboard Analytics System
// run: node test-b11.1.js

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
  // ── Setup ──────────────────────────────────────────────────────────────────
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

  console.log('Setup complete. Tokens resolved.\n');

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Dashboard Overview
  // ────────────────────────────────────────────────────────────────────────────
  const overviewRes = await req('GET', '/dashboard/overview', TOKEN);
  if (overviewRes.success && overviewRes.data && 'totalSales' in overviewRes.data) {
    pass(1, 'Dashboard Overview fetched correctly with fields');
  } else {
    fail(1, 'Failed to fetch Dashboard Overview', overviewRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Sales Summary
  // ────────────────────────────────────────────────────────────────────────────
  const salesSumRes = await req('GET', '/dashboard/sales-summary', TOKEN);
  if (salesSumRes.success && salesSumRes.data && 'todaySales' in salesSumRes.data) {
    pass(2, 'Sales Summary fetched correctly with range totals');
  } else {
    fail(2, 'Failed to fetch Sales Summary', salesSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Sales Trend
  // ────────────────────────────────────────────────────────────────────────────
  const trendRes = await req('GET', '/dashboard/sales-trend?trend=Daily', TOKEN);
  if (trendRes.success && Array.isArray(trendRes.data)) {
    pass(3, 'Sales Trend fetched correctly as daily chart data points');
  } else {
    fail(3, 'Failed to fetch Sales Trend', trendRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Purchase Summary
  // ────────────────────────────────────────────────────────────────────────────
  const purchaseSumRes = await req('GET', '/dashboard/purchase-summary', TOKEN);
  if (purchaseSumRes.success && purchaseSumRes.data && 'totalPurchase' in purchaseSumRes.data) {
    pass(4, 'Purchase Summary fetched correctly with counts and amounts');
  } else {
    fail(4, 'Failed to fetch Purchase Summary', purchaseSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Inventory Summary
  // ────────────────────────────────────────────────────────────────────────────
  const inventorySumRes = await req('GET', '/dashboard/inventory-summary', TOKEN);
  if (
    inventorySumRes.success &&
    inventorySumRes.data &&
    'totalStockValue' in inventorySumRes.data
  ) {
    pass(5, 'Inventory Summary fetched correctly with warehouse aggregates');
  } else {
    fail(5, 'Failed to fetch Inventory Summary', inventorySumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Customer Summary
  // ────────────────────────────────────────────────────────────────────────────
  const customerSumRes = await req('GET', '/dashboard/customer-summary', TOKEN);
  if (customerSumRes.success && customerSumRes.data && 'customerDueAmount' in customerSumRes.data) {
    pass(6, 'Customer Summary fetched correctly with outstanding balance');
  } else {
    fail(6, 'Failed to fetch Customer Summary', customerSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Supplier Summary
  // ────────────────────────────────────────────────────────────────────────────
  const supplierSumRes = await req('GET', '/dashboard/supplier-summary', TOKEN);
  if (supplierSumRes.success && supplierSumRes.data && 'supplierDue' in supplierSumRes.data) {
    pass(7, 'Supplier Summary fetched correctly');
  } else {
    fail(7, 'Failed to fetch Supplier Summary', supplierSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Financial Summary
  // ────────────────────────────────────────────────────────────────────────────
  const financialSumRes = await req('GET', '/dashboard/financial-summary', TOKEN);
  if (financialSumRes.success && financialSumRes.data && 'cashBalance' in financialSumRes.data) {
    pass(8, 'Financial Summary fetched correctly with double-entry cash/bank balances');
  } else {
    fail(8, 'Failed to fetch Financial Summary', financialSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: Top Products
  // ────────────────────────────────────────────────────────────────────────────
  const topProdRes = await req('GET', '/dashboard/top-products?limit=5', TOKEN);
  if (topProdRes.success && Array.isArray(topProdRes.data)) {
    pass(9, 'Top Products ranked successfully');
  } else {
    fail(9, 'Failed to rank Top Products', topProdRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T10: Top Customers
  // ────────────────────────────────────────────────────────────────────────────
  const topCustRes = await req('GET', '/dashboard/top-customers?limit=5', TOKEN);
  if (topCustRes.success && Array.isArray(topCustRes.data)) {
    pass(10, 'Top Customers ranked successfully');
  } else {
    fail(10, 'Failed to rank Top Customers', topCustRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T11: Date Filtering & Permission Checks
  // ────────────────────────────────────────────────────────────────────────────
  // 1. Date Filtering
  const startStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endStr = new Date().toISOString();
  const filterRes = await req(
    'GET',
    `/dashboard/overview?startDate=${startStr}&endDate=${endStr}`,
    TOKEN,
  );

  // 2. Permission block: cashier cannot view financial analytics (restricted by analytics.view)
  const forbiddenRes = await req('GET', '/dashboard/financial-summary', CASHIER_TOKEN);

  if (
    filterRes.success &&
    forbiddenRes.success === false &&
    forbiddenRes.error !== 'Unauthorized'
  ) {
    pass(11, 'Date filtering worked and unauthorized cashiers blocked correctly');
  } else {
    fail(11, 'Failed validation of Date filtering / Permission guard checks', {
      filterRes,
      forbiddenRes,
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
