#!/usr/bin/env node
// B7.1 Test Suite — Warehouse & Inventory Foundation
// run: node test-b7.1.js

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
  console.log(`✗ T${n}: ${desc}`);
  console.log(`   Got: ${JSON.stringify(got).slice(0, 200)}`);
  FAIL++;
}

async function req(method, path, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

async function main() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const loginRes = await req('POST', '/auth/login', null, {
    email: 'admin@enterprise-pos.com',
    password: 'admin123',
  });
  const TOKEN = loginRes.data?.accessToken;
  if (!TOKEN) {
    console.error('LOGIN FAILED');
    process.exit(1);
  }

  const companiesRes = await req('GET', '/companies', TOKEN);
  const COMPANY_ID = companiesRes.data?.[0]?.id;
  if (!COMPANY_ID) {
    console.error('NO COMPANY');
    process.exit(1);
  }

  const productsRes = await req('GET', '/products?limit=1', TOKEN);
  const PRODUCT_ID = productsRes.data?.[0]?.id;
  if (!PRODUCT_ID) {
    console.error('NO PRODUCT');
    process.exit(1);
  }

  console.log(`Company: ${COMPANY_ID}`);
  console.log(`Product: ${PRODUCT_ID}`);
  console.log('');

  // ── WAREHOUSE TESTS ───────────────────────────────────────────────────────

  // T1: Create WH-001
  const r1 = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: 'WH-001',
    name: 'Main Warehouse',
    city: 'Dhaka',
    country: 'Bangladesh',
    isDefault: true,
  });
  const WH1_ID = r1.data?.id;
  r1.data?.code === 'WH-001'
    ? pass(1, 'Create Warehouse WH-001')
    : fail(1, 'Create Warehouse WH-001', r1);

  // T2: Create WH-002
  const r2 = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: 'WH-002',
    name: 'Secondary Warehouse',
    city: 'Chittagong',
  });
  const WH2_ID = r2.data?.id;
  r2.data?.code === 'WH-002'
    ? pass(2, 'Create Warehouse WH-002')
    : fail(2, 'Create Warehouse WH-002', r2);

  // T3: Duplicate code rejected
  const r3 = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: 'WH-001',
    name: 'Duplicate',
  });
  r3.success === false && r3.message?.includes('already in use')
    ? pass(3, 'Duplicate Code Rejected (409)')
    : fail(3, 'Duplicate Code Rejected', r3);

  // T4: Invalid code format
  const r4 = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: 'wh 001',
    name: 'Bad Code',
  });
  r4.success === false
    ? pass(4, 'Invalid Code Format Rejected (422)')
    : fail(4, 'Invalid Code Format', r4);

  // T5: Get by ID
  const r5 = await req('GET', `/warehouses/${WH1_ID}`, TOKEN);
  r5.data?.name === 'Main Warehouse'
    ? pass(5, 'Get Warehouse by ID')
    : fail(5, 'Get Warehouse by ID', r5);

  // T6: List
  const r6 = await req('GET', `/warehouses?companyId=${COMPANY_ID}`, TOKEN);
  r6.meta?.total === 2 ? pass(6, 'List Warehouses (total=2)') : fail(6, 'List Warehouses', r6);

  // T7: Search by name
  const r7 = await req('GET', '/warehouses?q=main', TOKEN);
  r7.data?.some((w) => w.name === 'Main Warehouse')
    ? pass(7, 'Search by Name')
    : fail(7, 'Search by Name', r7);

  // T8: Search by city
  const r8 = await req('GET', '/warehouses?q=Chittagong', TOKEN);
  r8.data?.some((w) => w.name === 'Secondary Warehouse')
    ? pass(8, 'Search by City')
    : fail(8, 'Search by City', r8);

  // T9: Filter by status
  const r9 = await req('GET', '/warehouses?status=ACTIVE', TOKEN);
  r9.meta?.total >= 2 ? pass(9, 'Filter by ACTIVE Status') : fail(9, 'Filter by Status', r9);

  // T10: Update
  const r10 = await req('PATCH', `/warehouses/${WH1_ID}`, TOKEN, {
    managerName: 'Ahmed Rahman',
    city: 'Dhaka Updated',
  });
  r10.data?.managerName === 'Ahmed Rahman'
    ? pass(10, 'Update Warehouse')
    : fail(10, 'Update Warehouse', r10);

  // T11: Auth guard
  const r11 = await req('GET', '/warehouses');
  r11.success === false ? pass(11, 'Warehouse Auth Guard (401)') : fail(11, 'Auth Guard', r11);

  console.log('\n── Inventory ──');

  // T12: Opening Stock
  const r12 = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH1_ID,
    productId: PRODUCT_ID,
    quantity: 100,
    averageCost: 50,
    minimumQuantity: 10,
    reorderQuantity: 20,
    maximumQuantity: 500,
  });
  const INV_ID = r12.data?.id;
  r12.data?.hasOpeningStock === true
    ? pass(12, 'Add Opening Stock (201)')
    : fail(12, 'Add Opening Stock', r12);

  // T13: Duplicate opening stock
  const r13 = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH1_ID,
    productId: PRODUCT_ID,
    quantity: 50,
    averageCost: 45,
  });
  r13.success === false && r13.message?.includes('already exists')
    ? pass(13, 'Duplicate Opening Stock Rejected (409)')
    : fail(13, 'Duplicate Opening Stock', r13);

  // T14: Reorder < Min rejected
  const r14 = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH2_ID,
    productId: PRODUCT_ID,
    quantity: 50,
    minimumQuantity: 30,
    reorderQuantity: 5,
  });
  r14.success === false ? pass(14, 'Reorder < Min Rejected (422)') : fail(14, 'Reorder < Min', r14);

  // T15: Get by ID
  const r15 = await req('GET', `/inventory/${INV_ID}`, TOKEN);
  r15.data?.availableQuantity?.startsWith('100')
    ? pass(15, 'Get Inventory by ID (qty=100)')
    : fail(15, 'Get Inventory by ID', r15);

  // T16: By product
  const r16 = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  r16.data?.some((i) => i.warehouseCode === 'WH-001')
    ? pass(16, 'Get Inventory by Product')
    : fail(16, 'Get Inventory by Product', r16);

  // T17: By warehouse
  const r17 = await req('GET', `/inventory/warehouse/${WH1_ID}`, TOKEN);
  r17.data?.length > 0
    ? pass(17, 'Get Inventory by Warehouse')
    : fail(17, 'Get Inventory by Warehouse', r17);

  // T18: List
  const r18 = await req('GET', `/inventory?companyId=${COMPANY_ID}`, TOKEN);
  r18.meta?.total === 1 ? pass(18, 'List Inventory (total=1)') : fail(18, 'List Inventory', r18);

  // T19: Update min stock
  const r19 = await req('PATCH', '/inventory/min-stock', TOKEN, {
    inventoryId: INV_ID,
    minimumQuantity: 15,
    reorderQuantity: 25,
  });
  r19.data?.minimumQuantity?.startsWith('15')
    ? pass(19, 'Update Min Stock')
    : fail(19, 'Update Min Stock', r19);

  // T20: Update reorder level
  const r20 = await req('PATCH', '/inventory/reorder-level', TOKEN, {
    inventoryId: INV_ID,
    reorderQuantity: 30,
  });
  r20.data?.reorderQuantity?.startsWith('30')
    ? pass(20, 'Update Reorder Level')
    : fail(20, 'Update Reorder Level', r20);

  // T21: isOutOfStock=false
  r15.data?.isOutOfStock === false
    ? pass(21, 'isOutOfStock=false (qty=100)')
    : fail(21, 'isOutOfStock flag', r15.data);

  // T22: isLowStock=false (100 > min 10)
  r15.data?.isLowStock === false
    ? pass(22, 'isLowStock=false (qty=100 > min=10)')
    : fail(22, 'isLowStock flag', r15.data);

  // T23: Delete WH with inventory blocked
  const r23 = await fetch(`${BASE}/warehouses/${WH1_ID}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  }).then((r) => r.json());
  r23.success === false && r23.message?.includes('active inventory records')
    ? pass(23, 'Delete WH with Inventory Blocked')
    : fail(23, 'Delete WH with Inventory', r23);

  // T24: Delete empty WH
  const r24 = await fetch(`${BASE}/warehouses/${WH2_ID}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  }).then((r) => r.json());
  r24.success === true && r24.message?.includes('deleted successfully')
    ? pass(24, 'Delete Empty Warehouse OK')
    : fail(24, 'Delete Empty Warehouse', r24);

  // T25: Inventory auth guard
  const r25 = await req('GET', '/inventory');
  r25.success === false
    ? pass(25, 'Inventory Auth Guard (401)')
    : fail(25, 'Inventory Auth Guard', r25);

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`RESULTS: ${PASS} passed / ${FAIL} failed out of ${PASS + FAIL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (FAIL > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
