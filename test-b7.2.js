#!/usr/bin/env node
// B7.2 Test Suite — Stock Operations (Movement, Adjustment, Transfer)
// run: node test-b7.2.js

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
  console.log(`✗ T${n}: ${desc}`);
  console.log(`   Got: ${JSON.stringify(got).slice(0, 250)}`);
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

async function del(path, token) {
  return fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
}

// PATCH without body (no Content-Type header needed)
async function patch(path, token) {
  return fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
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

  // ── Warehouses: Create two ────────────────────────────────────────────────
  const ts = Date.now();
  const wh1Res = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `SW1-${ts}`,
    name: 'Source Warehouse B72',
    city: 'Dhaka',
  });
  const WH_FROM = wh1Res.data?.id;
  const wh2Res = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `SW2-${ts}`,
    name: 'Destination Warehouse B72',
    city: 'Chittagong',
  });
  const WH_TO = wh2Res.data?.id;
  if (!WH_FROM || !WH_TO) {
    console.error('WAREHOUSE CREATION FAILED', wh1Res, wh2Res);
    process.exit(1);
  }
  console.log(`WH_FROM: ${WH_FROM}`);
  console.log(`WH_TO: ${WH_TO}`);

  // ── Opening Stock (now creates StockMovement too) ─────────────────────────

  console.log('\n── Opening Stock ──');

  // T1: Opening stock creates inventory + OPENING_STOCK movement
  const r1 = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    quantity: 200,
    averageCost: 50.0,
    minimumQuantity: 10,
    reorderQuantity: 20,
  });
  r1.data?.availableQuantity?.startsWith('200')
    ? pass(1, 'Opening Stock created (qty=200)')
    : fail(1, 'Opening Stock', r1);

  // T2: Verify OPENING_STOCK movement was created
  const movRes = await req(
    'GET',
    `/stock-movements?warehouseId=${WH_FROM}&productId=${PRODUCT_ID}`,
    TOKEN,
  );
  const openingMov = movRes.data?.find((m) => m.movementType === 'OPENING_STOCK');
  openingMov && openingMov.quantity?.startsWith('200')
    ? pass(2, 'OPENING_STOCK movement auto-created')
    : fail(2, 'OPENING_STOCK movement', movRes);

  // T3: Duplicate opening stock blocked
  const r3 = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    quantity: 100,
    averageCost: 50,
    minimumQuantity: 5,
    reorderQuantity: 10,
  });
  r3.success === false
    ? pass(3, 'Duplicate Opening Stock Rejected (409)')
    : fail(3, 'Duplicate Opening Stock', r3);

  // ── Stock Adjustments ─────────────────────────────────────────────────────

  console.log('\n── Stock Adjustments ──');
  let ADJ_ID;

  // T4: INCREASE adjustment
  const r4 = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    type: 'INCREASE',
    quantity: 50,
    reason: 'Extra stock received from supplier directly',
  });
  ADJ_ID = r4.data?.id;
  r4.data?.type === 'INCREASE' && r4.data?.quantity?.startsWith('50')
    ? pass(4, 'INCREASE Adjustment (qty=50)')
    : fail(4, 'INCREASE Adjustment', r4);

  // T5: Verify inventory updated (200 + 50 = 250)
  const invRes = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const inv = invRes.data?.find((i) => i.warehouseId === WH_FROM);
  Number(inv?.availableQuantity) === 250
    ? pass(5, 'Inventory updated after INCREASE (qty=250)')
    : fail(5, 'Inventory after INCREASE', { available: inv?.availableQuantity });

  // T6: ADJUSTMENT_IN movement created
  const movAfterInc = await req(
    'GET',
    `/stock-movements?warehouseId=${WH_FROM}&movementType=ADJUSTMENT_IN`,
    TOKEN,
  );
  movAfterInc.data?.length >= 1
    ? pass(6, 'ADJUSTMENT_IN movement created')
    : fail(6, 'ADJUSTMENT_IN movement', movAfterInc);

  // T7: DAMAGE adjustment
  const r7 = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    type: 'DAMAGE',
    quantity: 10,
    reason: 'Goods damaged in storage',
  });
  r7.data?.type === 'DAMAGE'
    ? pass(7, 'DAMAGE Adjustment (qty=10)')
    : fail(7, 'DAMAGE Adjustment', r7);

  // T8: Verify inventory after DAMAGE (250 - 10 = 240)
  const invAfterDmg = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const invDmg = invAfterDmg.data?.find((i) => i.warehouseId === WH_FROM);
  Number(invDmg?.availableQuantity) === 240
    ? pass(8, 'Inventory updated after DAMAGE (qty=240)')
    : fail(8, 'Inventory after DAMAGE', { available: invDmg?.availableQuantity });

  // T9: Negative stock prevention
  const r9 = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    type: 'DECREASE',
    quantity: 9999,
    reason: 'This should be blocked by negative stock guard',
  });
  r9.success === false
    ? pass(9, 'Negative Stock Prevention')
    : fail(9, 'Negative Stock Prevention', r9);

  // T10: List adjustments
  const r10 = await req('GET', `/stock-adjustments?companyId=${COMPANY_ID}`, TOKEN);
  r10.meta?.total >= 2
    ? pass(10, `List Adjustments (total=${r10.meta?.total})`)
    : fail(10, 'List Adjustments', r10);

  // T11: Get adjustment by ID
  const r11 = await req('GET', `/stock-adjustments/${ADJ_ID}`, TOKEN);
  r11.data?.id === ADJ_ID
    ? pass(11, 'Get Adjustment by ID')
    : fail(11, 'Get Adjustment by ID', r11);

  // T12: Adjustment requires reason (validation)
  const r12 = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    type: 'INCREASE',
    quantity: 5,
    reason: 'ab', // too short
  });
  r12.success === false
    ? pass(12, 'Short reason rejected (422)')
    : fail(12, 'Short reason validation', r12);

  // T13: Quantity 0 rejected
  const r13 = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_FROM,
    productId: PRODUCT_ID,
    type: 'INCREASE',
    quantity: 0,
    reason: 'Zero quantity test',
  });
  r13.success === false ? pass(13, 'Zero Quantity Rejected (422)') : fail(13, 'Zero Quantity', r13);

  // ── Stock Transfer ─────────────────────────────────────────────────────────

  console.log('\n── Stock Transfers ──');
  let TRANSFER_ID;

  // T14: Create transfer (PENDING)
  const r14 = await req('POST', '/stock-transfers', TOKEN, {
    companyId: COMPANY_ID,
    fromWarehouseId: WH_FROM,
    toWarehouseId: WH_TO,
    remarks: 'Transfer goods to secondary warehouse',
    items: [{ productId: PRODUCT_ID, quantity: 40 }],
  });
  TRANSFER_ID = r14.data?.id;
  r14.data?.status === 'PENDING' && TRANSFER_ID
    ? pass(14, 'Create Transfer (PENDING)')
    : fail(14, 'Create Transfer', r14);

  // T15: Same warehouse rejected
  const r15 = await req('POST', '/stock-transfers', TOKEN, {
    companyId: COMPANY_ID,
    fromWarehouseId: WH_FROM,
    toWarehouseId: WH_FROM,
    items: [{ productId: PRODUCT_ID, quantity: 10 }],
  });
  r15.success === false
    ? pass(15, 'Same Warehouse Rejected (422)')
    : fail(15, 'Same Warehouse', r15);

  // T16: Get transfer by ID
  const r16 = await req('GET', `/stock-transfers/${TRANSFER_ID}`, TOKEN);
  r16.data?.status === 'PENDING'
    ? pass(16, 'Get Transfer by ID (PENDING)')
    : fail(16, 'Get Transfer by ID', r16);

  // T17: Cannot complete PENDING transfer
  const r17 = await patch(`/stock-transfers/${TRANSFER_ID}/complete`, TOKEN);
  r17.success === false
    ? pass(17, 'Cannot Complete PENDING Transfer')
    : fail(17, 'Complete PENDING blocked', r17);

  // T18: Approve transfer
  const r18 = await patch(`/stock-transfers/${TRANSFER_ID}/approve`, TOKEN);
  r18.data?.status === 'APPROVED'
    ? pass(18, 'Transfer Approved')
    : fail(18, 'Transfer Approve', r18);

  // T19: Cannot reject APPROVED transfer
  const r19 = await patch(`/stock-transfers/${TRANSFER_ID}/reject`, TOKEN);
  r19.success === false
    ? pass(19, 'Cannot Reject APPROVED Transfer')
    : fail(19, 'Reject APPROVED blocked', r19);

  // T20: Complete transfer (executes TRANSFER_OUT + TRANSFER_IN)
  const r20 = await patch(`/stock-transfers/${TRANSFER_ID}/complete`, TOKEN);
  r20.data?.status === 'COMPLETED'
    ? pass(20, 'Transfer Completed')
    : fail(20, 'Transfer Complete', r20);

  // T21: Verify source inventory decreased (240 - 40 = 200)
  const srcInv = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const srcStock = srcInv.data?.find((i) => i.warehouseId === WH_FROM);
  Number(srcStock?.availableQuantity) === 200
    ? pass(21, 'Source stock decreased after transfer (qty=200)')
    : fail(21, 'Source stock after transfer', { available: srcStock?.availableQuantity });

  // T22: Verify destination inventory created and increased (0 + 40 = 40)
  const destStock = srcInv.data?.find((i) => i.warehouseId === WH_TO);
  Number(destStock?.availableQuantity) === 40
    ? pass(22, 'Destination stock created after transfer (qty=40)')
    : fail(22, 'Destination stock after transfer', { available: destStock?.availableQuantity });

  // T23: TRANSFER_OUT movement created
  const movTransfer = await req(
    'GET',
    `/stock-movements?warehouseId=${WH_FROM}&movementType=TRANSFER_OUT`,
    TOKEN,
  );
  movTransfer.data?.length >= 1
    ? pass(23, 'TRANSFER_OUT movement created')
    : fail(23, 'TRANSFER_OUT movement', movTransfer);

  // T24: TRANSFER_IN movement created
  const movTransferIn = await req(
    'GET',
    `/stock-movements?warehouseId=${WH_TO}&movementType=TRANSFER_IN`,
    TOKEN,
  );
  movTransferIn.data?.length >= 1
    ? pass(24, 'TRANSFER_IN movement created')
    : fail(24, 'TRANSFER_IN movement', movTransferIn);

  // T25: List transfers
  const r25 = await req('GET', `/stock-transfers?companyId=${COMPANY_ID}`, TOKEN);
  r25.meta?.total >= 1
    ? pass(25, `List Transfers (total=${r25.meta?.total})`)
    : fail(25, 'List Transfers', r25);

  // ── Stock Movement Queries ─────────────────────────────────────────────────

  console.log('\n── Stock Movement Queries ──');

  // T26: List all movements for product
  const r26 = await req('GET', `/stock-movements/product/${PRODUCT_ID}`, TOKEN);
  r26.meta?.total >= 3
    ? pass(26, `Get Movements by Product (total=${r26.meta?.total})`)
    : fail(26, 'Movements by Product', r26);

  // T27: List movements by warehouse
  const r27 = await req('GET', `/stock-movements/warehouse/${WH_FROM}`, TOKEN);
  r27.meta?.total >= 3
    ? pass(27, `Get Movements by Warehouse (total=${r27.meta?.total})`)
    : fail(27, 'Movements by Warehouse', r27);

  // T28: Get movement by ID
  const firstMovId = r26.data?.[0]?.id;
  const r28 = firstMovId
    ? await req('GET', `/stock-movements/${firstMovId}`, TOKEN)
    : { success: false };
  r28.data?.id === firstMovId
    ? pass(28, 'Get Movement by ID')
    : fail(28, 'Get Movement by ID', r28);

  // T29: Movement has direction field
  const firstMov = r26.data?.[0];
  firstMov?.direction === 'IN' || firstMov?.direction === 'OUT'
    ? pass(29, 'Movement has direction field (IN/OUT)')
    : fail(29, 'Movement direction field', firstMov);

  // T30: Auth guard
  const r30 = await req('GET', '/stock-movements');
  r30.success === false ? pass(30, 'Stock Movement Auth Guard (401)') : fail(30, 'Auth Guard', r30);

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`RESULTS: ${PASS} passed / ${FAIL} failed out of ${PASS + FAIL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  if (FAIL > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
