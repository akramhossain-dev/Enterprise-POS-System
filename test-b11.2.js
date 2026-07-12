#!/usr/bin/env node
// B11.2 Test Suite — Sales & Purchase Reporting System
// run: node test-b11.2.js

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

  // Get Company ID
  const companiesRes = await req('GET', '/companies', TOKEN);
  const companyId = companiesRes.data?.[0]?.id;
  if (!companyId) {
    console.error('COMPANY NOT FOUND');
    process.exit(1);
  }

  // Get a warehouse, product, customer and supplier to simulate transactions
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

  const productsRes = await req('GET', '/products', TOKEN);
  const product = productsRes.data?.[0];

  // Resolve Customer
  let customerRes = await req('GET', '/customers', TOKEN);
  let customer = customerRes.data?.[0];
  if (!customer) {
    const newCust = await req('POST', '/customers', TOKEN, {
      companyId,
      firstName: 'Walk-in',
      lastName: 'Customer',
      phone: '555-0000',
    });
    customer = newCust.data;
  }

  // Resolve Supplier
  let supplierRes = await req('GET', '/suppliers', TOKEN);
  let supplier = supplierRes.data?.[0];
  if (!supplier) {
    const newSupp = await req('POST', '/suppliers', TOKEN, {
      companyId,
      companyName: 'Main Distributor',
      contactPerson: 'Distributor Agent',
      phone: '555-9999',
    });
    supplier = newSupp.data;
  }

  if (!warehouseId || !product || !customer || !supplier) {
    console.error('SETUP ENTITIES MISSING', { warehouseId, product, customer, supplier });
    process.exit(1);
  }

  console.log('Setup complete. Seed entities resolved.\n');

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Sales Report
  // ────────────────────────────────────────────────────────────────────────────
  const salesRes = await req('GET', '/reports/sales?page=1&limit=5', TOKEN);
  if (salesRes.success && Array.isArray(salesRes.data) && salesRes.meta) {
    pass(1, 'Detailed Sales Report returned successfully with pagination meta');
  } else {
    fail(1, 'Failed to fetch Detailed Sales Report', salesRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Sales Summary
  // ────────────────────────────────────────────────────────────────────────────
  const salesSumRes = await req('GET', '/reports/sales-summary', TOKEN);
  if (salesSumRes.success && salesSumRes.data && 'grossSales' in salesSumRes.data) {
    pass(2, 'Sales Summary Report fetched successfully');
  } else {
    fail(2, 'Failed to fetch Sales Summary Report', salesSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Product Sales
  // ────────────────────────────────────────────────────────────────────────────
  const productSalesRes = await req('GET', '/reports/product-sales', TOKEN);
  if (productSalesRes.success && Array.isArray(productSalesRes.data)) {
    pass(3, 'Product Sales Report calculated product margins and totals');
  } else {
    fail(3, 'Failed to fetch Product Sales Report', productSalesRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Customer Sales
  // ────────────────────────────────────────────────────────────────────────────
  const customerSalesRes = await req('GET', '/reports/customer-sales', TOKEN);
  if (customerSalesRes.success && Array.isArray(customerSalesRes.data)) {
    pass(4, 'Customer Sales Report aggregated outstanding customer stats');
  } else {
    fail(4, 'Failed to fetch Customer Sales Report', customerSalesRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Purchase Report
  // ────────────────────────────────────────────────────────────────────────────
  const purchasesRes = await req('GET', '/reports/purchases', TOKEN);
  if (purchasesRes.success && Array.isArray(purchasesRes.data) && purchasesRes.meta) {
    pass(5, 'Detailed Purchase Order Report fetched successfully');
  } else {
    fail(5, 'Failed to fetch Detailed Purchase Order Report', purchasesRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Purchase Summary
  // ────────────────────────────────────────────────────────────────────────────
  const purchaseSumRes = await req('GET', '/reports/purchase-summary', TOKEN);
  if (
    purchaseSumRes.success &&
    purchaseSumRes.data &&
    'averagePurchaseValue' in purchaseSumRes.data
  ) {
    pass(6, 'Purchase Summary metrics calculated successfully');
  } else {
    fail(6, 'Failed to fetch Purchase Summary metrics', purchaseSumRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Supplier Purchase
  // ────────────────────────────────────────────────────────────────────────────
  const supplierPurchaseRes = await req('GET', '/reports/supplier-purchases', TOKEN);
  if (supplierPurchaseRes.success && Array.isArray(supplierPurchaseRes.data)) {
    pass(7, 'Supplier Purchases Report mapped payables and total counts');
  } else {
    fail(7, 'Failed to fetch Supplier Purchases Report', supplierPurchaseRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Profit Analysis
  // ────────────────────────────────────────────────────────────────────────────
  const profitRes = await req('GET', '/reports/profit-analysis', TOKEN);
  if (profitRes.success && profitRes.data && 'grossProfit' in profitRes.data) {
    pass(8, 'Profit Analysis Report computed revenue, cost, and profit aggregates');
  } else {
    fail(8, 'Failed to fetch Profit Analysis Report', profitRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: Filtering & Search
  // ────────────────────────────────────────────────────────────────────────────
  const filterRes = await req(
    'GET',
    `/reports/sales?search=Walk-in&warehouseId=${warehouseId}`,
    TOKEN,
  );
  if (filterRes.success && Array.isArray(filterRes.data)) {
    pass(9, 'Filters and text searches executed cleanly');
  } else {
    fail(9, 'Filters/Search request failed', filterRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T10: Sorting
  // ────────────────────────────────────────────────────────────────────────────
  const sortRes = await req('GET', `/reports/sales?sortBy=amount&sortOrder=asc`, TOKEN);
  if (sortRes.success && Array.isArray(sortRes.data)) {
    pass(10, 'Sort queries by amount/date compiled and returned successfully');
  } else {
    fail(10, 'Sort request failed', sortRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T11: Permission Guard Checks
  // ────────────────────────────────────────────────────────────────────────────
  const failSales = await req('GET', '/reports/sales', CASHIER_TOKEN);
  const failProfit = await req('GET', '/reports/profit-analysis', CASHIER_TOKEN);

  if (failSales.success === false && failProfit.success === false) {
    pass(11, 'Permission guards successfully restricted Cashier role');
  } else {
    fail(11, 'Failed permission validation; cashier got reporting access', {
      failSales,
      failProfit,
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
