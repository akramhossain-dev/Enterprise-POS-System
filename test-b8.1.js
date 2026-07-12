#!/usr/bin/env node
// B8.1 Test Suite — Purchase Order Management
// run: node test-b8.1.js

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
  // Setup warehouse
  const whRes = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `PO-WH-${ts}`,
    name: `PO WH ${ts}`,
    city: 'Dhaka',
  });
  const WH_ID = whRes.data?.id;
  if (!WH_ID) {
    console.error('WH SETUP FAILED', whRes);
    process.exit(1);
  }

  // Setup supplier
  const supRes = await req('POST', '/suppliers', TOKEN, {
    companyId: COMPANY_ID,
    supplierCode: `SUP-${ts}`,
    companyName: `Supplier B8.1 ${ts}`,
  });
  const SUPPLIER_ID = supRes.data?.id;
  if (!SUPPLIER_ID) {
    console.error('SUPPLIER SETUP FAILED', supRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Product: ${PRODUCT_ID}, WH: ${WH_ID}, Supplier: ${SUPPLIER_ID}\n`,
  );

  // Create initial opening stock of 100 for the product in WH so we can verify stock never changes
  await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 100,
    averageCost: 50.0,
    minimumQuantity: 10,
    reorderQuantity: 20,
  });

  // Fetch initial stock
  const initialInvRes = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const initialInv = initialInvRes.data?.find((i) => i.warehouseId === WH_ID);
  const initialQty = initialInv ? Number(initialInv.availableQuantity) : 0;
  console.log(`Initial Inventory Quantity: ${initialQty}\n`);

  console.log('── Validation Checks ──');

  // T1: Validation - Supplier required
  const r1 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    items: [{ productId: PRODUCT_ID, quantity: 10, unitPrice: 100 }],
  });
  r1.success === false
    ? pass(1, 'Supplier validation error caught')
    : fail(1, 'Supplier validation missing', r1);

  // T2: Validation - Warehouse required
  const r2 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 10, unitPrice: 100 }],
  });
  r2.success === false
    ? pass(2, 'Warehouse validation error caught')
    : fail(2, 'Warehouse validation missing', r2);

  // T3: Validation - Minimum one item
  const r3 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [],
  });
  r3.success === false
    ? pass(3, 'Empty items array validation error caught')
    : fail(3, 'Empty items validation missing', r3);

  // T4: Validation - Quantity > 0
  const r4 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 0, unitPrice: 100 }],
  });
  r4.success === false
    ? pass(4, 'Quantity <= 0 validation error caught')
    : fail(4, 'Quantity <= 0 validation missing', r4);

  // T5: Validation - Price > 0
  const r5 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 10, unitPrice: -50 }],
  });
  r5.success === false
    ? pass(5, 'Unit price <= 0 validation error caught')
    : fail(5, 'Unit price <= 0 validation missing', r5);

  console.log('\n── Purchase Order CRUD ──');
  let PO_ID;
  let PO_NUMBER;

  // T6: Create Purchase Order (Draft)
  const r6 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    discount: 50,
    tax: 30,
    shippingCost: 20,
    remarks: 'PO Draft test',
    items: [{ productId: PRODUCT_ID, quantity: 5, unitPrice: 100, discount: 10, tax: 5 }],
  });
  PO_ID = r6.data?.id;
  PO_NUMBER = r6.data?.purchaseOrderNumber;
  r6.data?.status === 'DRAFT' && PO_NUMBER.startsWith('PO-')
    ? pass(6, `Purchase Order created in DRAFT. PO Number: ${PO_NUMBER}`)
    : fail(6, 'Create Draft PO', r6);

  // T7: Totals verification
  // Item total: 5 * 100 - 10 + 5 = 495. Subtotal = 495
  // Grand total: 495 - 50 (PO discount) + 30 (PO tax) + 20 (PO shipping) = 495
  Number(r6.data?.subtotal) === 495 && Number(r6.data?.grandTotal) === 495
    ? pass(7, 'Purchase Order totals calculated correctly (Subtotal=495, Grand Total=495)')
    : fail(7, 'Totals calculation incorrect', r6.data);

  // T8: Update PO in Draft Status
  const r8 = await req('PATCH', `/purchase-orders/${PO_ID}`, TOKEN, {
    remarks: 'PO Updated test remarks',
    discount: 30,
    items: [{ productId: PRODUCT_ID, quantity: 10, unitPrice: 100 }], // Item total = 1000
  });
  // New Grand Total: 1000 - 30 + 30 + 20 = 1020
  Number(r8.data?.grandTotal) === 1020 && r8.data?.remarks === 'PO Updated test remarks'
    ? pass(8, 'Purchase Order updated successfully in DRAFT state')
    : fail(8, 'Update Draft PO failed', r8);

  // T9: Search by Purchase Order Number
  const r9 = await req(
    'GET',
    `/purchase-orders?search=${PO_NUMBER}&companyId=${COMPANY_ID}`,
    TOKEN,
  );
  r9.data?.length === 1 && r9.data?.[0]?.purchaseOrderNumber === PO_NUMBER
    ? pass(9, 'Search PO by PO Number works')
    : fail(9, 'Search by PO number failed', r9);

  // T10: Pagination check
  const r10 = await req('GET', `/purchase-orders?limit=1&companyId=${COMPANY_ID}`, TOKEN);
  r10.data?.length === 1 && r10.meta?.limit === 1
    ? pass(10, 'Pagination (limit=1) works correctly')
    : fail(10, 'Pagination failed', r10);

  console.log('\n── Approval Workflow ──');

  // T11: Submit Draft -> Pending
  const r11 = await patch(`/purchase-orders/${PO_ID}/submit`, TOKEN);
  r11.data?.status === 'PENDING'
    ? pass(11, 'Draft PO submitted to PENDING status')
    : fail(11, 'Submit Draft PO failed', r11);

  // T12: Approve PO (Pending -> Approved)
  const r12 = await patch(`/purchase-orders/${PO_ID}/approve`, TOKEN);
  r12.data?.status === 'APPROVED' && r12.data?.approvedBy !== null
    ? pass(12, 'PO successfully APPROVED by actor')
    : fail(12, 'Approve PO failed', r12);

  // T13: Cannot update or delete approved PO
  const r13 = await req('PATCH', `/purchase-orders/${PO_ID}`, TOKEN, { remarks: 'Hacked update' });
  r13.success === false
    ? pass(13, 'Blocked modifying APPROVED PO (400 Bad Request)')
    : fail(13, 'Modifying approved PO was not blocked', r13);

  // T14: Inventory remains unaffected
  const finalInvRes = await req('GET', `/inventory/product/${PRODUCT_ID}`, TOKEN);
  const finalInv = finalInvRes.data?.find((i) => i.warehouseId === WH_ID);
  const finalQty = finalInv ? Number(finalInv.availableQuantity) : 0;
  finalQty === initialQty
    ? pass(
        14,
        `Business Rule verified: Stock was NOT updated on PO Approval (Qty still = ${finalQty})`,
      )
    : fail(14, 'Inventory was updated', { initialQty, finalQty });

  // T15: Reject workflow
  // Create another PO, submit, then reject
  const po2 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 1, unitPrice: 10 }],
  });
  await patch(`/purchase-orders/${po2.data?.id}/submit`, TOKEN);
  const r15 = await patch(`/purchase-orders/${po2.data?.id}/reject`, TOKEN);
  r15.data?.status === 'REJECTED'
    ? pass(15, 'PO successfully REJECTED')
    : fail(15, 'Reject PO failed', r15);

  // T16: Cancel workflow
  // Create another PO, then cancel
  const po3 = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 1, unitPrice: 10 }],
  });
  const r16 = await patch(`/purchase-orders/${po3.data?.id}/cancel`, TOKEN);
  r16.data?.status === 'CANCELLED'
    ? pass(16, 'PO successfully CANCELLED')
    : fail(16, 'Cancel PO failed', r16);

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
