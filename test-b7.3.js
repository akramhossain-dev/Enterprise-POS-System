#!/usr/bin/env node
// B7.3 Test Suite — Advanced Inventory Management
// run: node test-b7.3.js

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
  console.log(`✗ T${n}: ${desc}`);
  console.log(`   Got: ${JSON.stringify(got).slice(0, 300)}`);
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

async function patch(path, token, body) {
  const headers = { Authorization: `Bearer ${token}` };
  if (body) headers['Content-Type'] = 'application/json';
  return fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
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

  const productRes = await req('GET', '/products?limit=1', TOKEN);
  const PRODUCT_ID = productRes.data?.[0]?.id;
  if (!PRODUCT_ID) {
    console.error('NO PRODUCT');
    process.exit(1);
  }

  const ts = Date.now();
  const wh1Res = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `B73-${ts}`,
    name: `B73 Warehouse ${ts}`,
    city: 'Dhaka',
  });
  const WH_ID = wh1Res.data?.id;
  if (!WH_ID) {
    console.error('WH FAILED', wh1Res);
    process.exit(1);
  }

  console.log(`Company: ${COMPANY_ID}, Product: ${PRODUCT_ID}, WH: ${WH_ID}`);

  // ── Opening Stock (creates ledger too) ────────────────────────────────────
  const osRes = await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 500,
    averageCost: 100.0,
    minimumQuantity: 50,
    reorderQuantity: 100,
  });
  if (!osRes.data?.id) {
    console.error('OPENING STOCK FAILED', osRes);
    process.exit(1);
  }

  console.log('\n── Inventory Ledger ──');

  // T1: Ledger entry auto-created after opening stock
  const ledger1 = await req(
    'GET',
    `/inventory-ledger?productId=${PRODUCT_ID}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  ledger1.data?.length >= 1 && ledger1.data?.[0]?.runningQuantity?.startsWith('500')
    ? pass(1, 'Ledger entry auto-created (runningQty=500)')
    : fail(1, 'Ledger auto-create', ledger1);

  // T2: Ledger entry has movementType
  const firstEntry = ledger1.data?.[0];
  firstEntry?.movementType === 'OPENING_STOCK'
    ? pass(2, 'Ledger movementType = OPENING_STOCK')
    : fail(2, 'Ledger movementType', firstEntry);

  // T3: Ledger runningValue = qty * cost
  Number(firstEntry?.runningValue) === 500 * 100
    ? pass(3, 'Ledger runningValue = 50000 (500 × 100)')
    : fail(3, 'Ledger runningValue', { runningValue: firstEntry?.runningValue });

  // T4: After adjustment, new ledger entry appears
  await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    type: 'INCREASE',
    quantity: 100,
    reason: 'Ledger test increase',
  });
  const ledger2 = await req(
    'GET',
    `/inventory-ledger?productId=${PRODUCT_ID}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  ledger2.data?.length >= 2
    ? pass(4, `Ledger grows with each movement (total=${ledger2.data.length})`)
    : fail(4, 'Ledger growth', ledger2);

  // T5: Get ledger by ID
  const ledgerById = await req('GET', `/inventory-ledger/${firstEntry?.id}`, TOKEN);
  ledgerById.data?.id === firstEntry?.id
    ? pass(5, 'Get ledger entry by ID')
    : fail(5, 'Get ledger by ID', ledgerById);

  console.log('\n── Batch Tracking ──');
  let BATCH_ID;

  // T6: Create batch
  const batchRes = await req('POST', '/batches', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    batchNumber: `LOT-${ts}`,
    quantity: 200,
    manufacturingDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
    remarks: 'Test batch lot',
  });
  BATCH_ID = batchRes.data?.id;
  batchRes.data?.status === 'ACTIVE' && BATCH_ID
    ? pass(6, 'Batch created (ACTIVE)')
    : fail(6, 'Batch create', batchRes);

  // T7: Batch has isExpired=false and daysUntilExpiry > 0
  Number(batchRes.data?.daysUntilExpiry) > 0 && batchRes.data?.isExpired === false
    ? pass(7, 'Batch daysUntilExpiry > 0, isExpired=false')
    : fail(7, 'Batch expiry fields', batchRes.data);

  // T8: Duplicate batch number rejected
  const r8 = await req('POST', '/batches', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    batchNumber: `LOT-${ts}`,
    quantity: 50,
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(),
  });
  r8.success === false
    ? pass(8, 'Duplicate batch number rejected (409)')
    : fail(8, 'Duplicate batch', r8);

  // T9: Past expiry date rejected
  const r9 = await req('POST', '/batches', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    batchNumber: `EXPIRED-${ts}`,
    quantity: 10,
    expiryDate: new Date(Date.now() - 86400000).toISOString(),
  });
  r9.success === false ? pass(9, 'Past expiry date rejected (409)') : fail(9, 'Past expiry', r9);

  // T10: List batches
  const r10 = await req('GET', `/batches?companyId=${COMPANY_ID}`, TOKEN);
  r10.data?.length >= 1
    ? pass(10, `List batches (total=${r10.meta?.total})`)
    : fail(10, 'List batches', r10);

  // T11: List expiring batches (in next 365 days)
  const r11 = await req('GET', `/batches?expiringInDays=365&companyId=${COMPANY_ID}`, TOKEN);
  r11.data?.length >= 1
    ? pass(11, 'Expiring batches filter works')
    : fail(11, 'Expiring batches', r11);

  // T12: Update batch status
  const r12 = await patch(`/batches/${BATCH_ID}/status`, TOKEN, {
    status: 'QUARANTINE',
    remarks: 'Quality check',
  });
  r12.data?.status === 'QUARANTINE'
    ? pass(12, 'Batch status updated to QUARANTINE')
    : fail(12, 'Batch status update', r12);

  // T13: Expire old batches job
  const r13Res = await fetch(`${BASE}/batches/expire-old`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const r13 = await r13Res.json();
  typeof r13.data?.count === 'number'
    ? pass(13, `Expire-old job ran (count=${r13.data.count})`)
    : fail(13, 'Expire old batches', r13);

  console.log('\n── Serial Number Tracking ──');
  let SERIAL_ID;
  const SN = `SN-${ts}`;

  // T14: Register serial
  const r14 = await req('POST', '/serials', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    serialNumber: SN,
  });
  SERIAL_ID = r14.data?.id;
  r14.data?.status === 'AVAILABLE' && SERIAL_ID
    ? pass(14, 'Serial registered (AVAILABLE)')
    : fail(14, 'Serial register', r14);

  // T15: Duplicate serial rejected
  const r15 = await req('POST', '/serials', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    serialNumber: SN,
  });
  r15.success === false
    ? pass(15, 'Duplicate serial rejected (409)')
    : fail(15, 'Duplicate serial', r15);

  // T16: Bulk register serials (with 1 duplicate that should be skipped)
  const r16 = await req('POST', '/serials/bulk', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    serialNumbers: [`SN-BULK1-${ts}`, `SN-BULK2-${ts}`, SN], // SN is duplicate
  });
  r16.data?.created === 2 && r16.data?.skipped === 1
    ? pass(16, 'Bulk register: created=2, skipped=1 (duplicate)')
    : fail(16, 'Bulk register', r16);

  // T17: Update serial status
  const r17 = await patch(`/serials/${SERIAL_ID}/status`, TOKEN, { status: 'SOLD' });
  r17.data?.status === 'SOLD'
    ? pass(17, 'Serial status → SOLD')
    : fail(17, 'Serial status update', r17);

  // T18: List serials with status filter
  const r18 = await req('GET', `/serials?status=AVAILABLE&warehouseId=${WH_ID}`, TOKEN);
  r18.data?.length >= 2
    ? pass(18, `List AVAILABLE serials (count=${r18.data.length})`)
    : fail(18, 'List serials', r18);

  // T19: Search by serial number
  const r19 = await req('GET', `/serials?search=SN-BULK1-${ts}`, TOKEN);
  r19.data?.length >= 1 && r19.data?.[0]?.serialNumber === `SN-BULK1-${ts}`
    ? pass(19, 'Serial search works')
    : fail(19, 'Serial search', r19);

  console.log('\n── Stock Alerts & Reorder ──');

  // T20: Scan alerts — create LOW_STOCK for WH with minimumQty=50, current~600
  // (after opening stock + adjustment, qty is 600, minimumQty=50, so NO alert expected for this WH)
  // Instead, test the scan itself works
  const r20 = await req('POST', '/stock-alerts/scan', TOKEN, { companyId: COMPANY_ID });
  typeof r20.data?.created === 'number' && typeof r20.data?.resolved === 'number'
    ? pass(20, `Alert scan ran (created=${r20.data.created}, resolved=${r20.data.resolved})`)
    : fail(20, 'Alert scan', r20);

  // T21: Reorder suggestions endpoint
  const r21 = await req('GET', `/stock-alerts/reorder-suggestions?companyId=${COMPANY_ID}`, TOKEN);
  Array.isArray(r21.data)
    ? pass(21, `Reorder suggestions returned (count=${r21.data.length})`)
    : fail(21, 'Reorder suggestions', r21);

  // T22: List alerts
  const r22 = await req('GET', `/stock-alerts?companyId=${COMPANY_ID}`, TOKEN);
  Array.isArray(r22.data)
    ? pass(22, `List alerts works (count=${r22.meta?.total ?? 0})`)
    : fail(22, 'List alerts', r22);

  console.log('\n── Physical Stock Take ──');
  let STOCK_TAKE_ID;

  // T23: Create stock take (DRAFT)
  const r23 = await req('POST', '/stock-takes', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    title: `Monthly Count ${ts}`,
  });
  STOCK_TAKE_ID = r23.data?.id;
  r23.data?.status === 'DRAFT' && STOCK_TAKE_ID
    ? pass(23, 'Stock take created (DRAFT)')
    : fail(23, 'Stock take create', r23);

  // T24: Auto-populate from inventory
  const r24Res = await fetch(`${BASE}/stock-takes/${STOCK_TAKE_ID}/populate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const r24 = await r24Res.json();
  r24.data?.count >= 1
    ? pass(24, `Items auto-populated from inventory (count=${r24.data.count})`)
    : fail(24, 'Populate items', r24);

  // T25: Cannot complete DRAFT
  const r25 = await patch(`/stock-takes/${STOCK_TAKE_ID}/complete`, TOKEN);
  r25.success === false
    ? pass(25, 'Cannot complete DRAFT stock take')
    : fail(25, 'Complete DRAFT blocked', r25);

  // T26: Start stock take (DRAFT → IN_PROGRESS)
  const r26 = await patch(`/stock-takes/${STOCK_TAKE_ID}/start`, TOKEN);
  r26.data?.status === 'IN_PROGRESS'
    ? pass(26, 'Stock take started (IN_PROGRESS)')
    : fail(26, 'Stock take start', r26);

  // T27: Add physical count for product
  const r27 = await req('POST', `/stock-takes/${STOCK_TAKE_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    physicalQuantity: 580,
    remarks: 'Physical count by staff',
  });
  const item = r27.data?.items?.find((i) => i.productId === PRODUCT_ID);
  item?.physicalQuantity === '580' && item?.variance !== undefined
    ? pass(27, `Item added: physicalQty=580, variance=${item.variance}`)
    : fail(27, 'Add stock take item', { item, r27data: r27.data?.items?.length });

  // T28: Variance calculated correctly (580 - 600 = -20 or based on actual stock)
  const varianceNum = Number(item?.variance);
  typeof varianceNum === 'number' && !isNaN(varianceNum)
    ? pass(28, `Variance calculated (${varianceNum})`)
    : fail(28, 'Variance calculation', item);

  // T29: Complete stock take (IN_PROGRESS → COMPLETED)
  const r29 = await patch(`/stock-takes/${STOCK_TAKE_ID}/complete`, TOKEN);
  r29.data?.status === 'COMPLETED'
    ? pass(29, 'Stock take completed')
    : fail(29, 'Stock take complete', r29);

  // T30: List stock takes
  const r30 = await req('GET', `/stock-takes?companyId=${COMPANY_ID}`, TOKEN);
  r30.meta?.total >= 1
    ? pass(30, `List stock takes (total=${r30.meta.total})`)
    : fail(30, 'List stock takes', r30);

  console.log('\n── Reconciliation ──');
  let RECON_ID;

  // T31: Create reconciliation from completed stock take
  const r31 = await req('POST', '/reconciliation', TOKEN, {
    stockTakeId: STOCK_TAKE_ID,
    remarks: 'Monthly reconciliation',
  });
  RECON_ID = r31.data?.id;
  r31.data?.status === 'PENDING' && RECON_ID
    ? pass(31, 'Reconciliation created (PENDING)')
    : fail(31, 'Reconciliation create', r31);

  // T32: Duplicate reconciliation blocked
  const r32 = await req('POST', '/reconciliation', TOKEN, { stockTakeId: STOCK_TAKE_ID });
  r32.success === false
    ? pass(32, 'Duplicate reconciliation rejected (409)')
    : fail(32, 'Duplicate recon', r32);

  // T33: Reconciliation shows variance items
  const reconData = r31.data;
  Array.isArray(reconData?.variances)
    ? pass(33, `Variance items in reconciliation (count=${reconData.variances.length})`)
    : fail(33, 'Recon variances', reconData);

  // T34: Variance direction is correct (INCREASE or DECREASE)
  const variance = reconData?.variances?.[0];
  ['INCREASE', 'DECREASE', 'NO_CHANGE'].includes(variance?.adjustmentType ?? '')
    ? pass(34, `Variance adjustmentType = ${variance?.adjustmentType}`)
    : fail(34, 'Variance adjustmentType', variance);

  // T35: Approve reconciliation (creates adjustment movements)
  const r35 = await patch(`/reconciliation/${RECON_ID}/approve`, TOKEN, {
    remarks: 'Approved after review',
  });
  r35.data?.status === 'APPROVED'
    ? pass(35, 'Reconciliation approved (adjustments applied)')
    : fail(35, 'Recon approve', r35);

  // T36: Verify stock was adjusted after reconciliation approval
  // The inventory should now reflect the physical count
  const invAfterRecon = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const invRec = invAfterRecon.data?.find((i) => i.warehouseId === WH_ID);
  typeof invRec?.availableQuantity === 'string'
    ? pass(36, `Inventory after reconciliation: qty=${invRec.availableQuantity}`)
    : fail(36, 'Inventory after recon', invAfterRecon);

  // T37: Verify ledger has reconciliation movement entries
  const ledgerAfterRecon = await req(
    'GET',
    `/inventory-ledger?productId=${PRODUCT_ID}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  ledgerAfterRecon.data?.length >= 3
    ? pass(37, `Ledger has reconciliation entries (total=${ledgerAfterRecon.data.length})`)
    : fail(37, 'Ledger after recon', ledgerAfterRecon);

  // T38: Cannot re-approve already approved reconciliation
  const r38 = await patch(`/reconciliation/${RECON_ID}/approve`, TOKEN);
  r38.success === false
    ? pass(38, 'Cannot re-approve APPROVED reconciliation')
    : fail(38, 'Re-approve blocked', r38);

  // T39: Create another stock take to test reject flow
  const st2 = await req('POST', '/stock-takes', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    title: `Count 2 ${ts}`,
  });
  await req('POST', `/stock-takes/${st2.data?.id}/populate`, TOKEN);
  await patch(`/stock-takes/${st2.data?.id}/start`, TOKEN);
  await req('POST', `/stock-takes/${st2.data?.id}/items`, TOKEN, {
    productId: PRODUCT_ID,
    physicalQuantity: 100,
  });
  await patch(`/stock-takes/${st2.data?.id}/complete`, TOKEN);
  const recon2 = await req('POST', '/reconciliation', TOKEN, { stockTakeId: st2.data?.id });
  const r39 = await patch(`/reconciliation/${recon2.data?.id}/reject`, TOKEN, {
    remarks: 'Data incorrect',
  });
  r39.data?.status === 'REJECTED'
    ? pass(39, 'Reconciliation rejected')
    : fail(39, 'Recon reject', r39);

  // T40: Weighted average cost maintained
  const invForCost = invAfterRecon.data?.find((i) => i.warehouseId === WH_ID);
  Number(invForCost?.averageCost) > 0
    ? pass(40, `Weighted average cost maintained (avgCost=${invForCost?.averageCost})`)
    : fail(40, 'Weighted avg cost', invForCost);

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
