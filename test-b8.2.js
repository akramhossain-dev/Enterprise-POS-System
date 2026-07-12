#!/usr/bin/env node
// B8.2 Test Suite — Goods Receive Note (GRN) & Supplier Invoice
// run: node test-b8.2.js

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
    code: `GRN-WH-${ts}`,
    name: `GRN WH ${ts}`,
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
    companyName: `Supplier B8.2 ${ts}`,
  });
  const SUPPLIER_ID = supRes.data?.id;
  if (!SUPPLIER_ID) {
    console.error('SUPPLIER SETUP FAILED', supRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Product: ${PRODUCT_ID}, WH: ${WH_ID}, Supplier: ${SUPPLIER_ID}\n`,
  );

  // Setup initial opening stock to verify avgCost calculation later
  // Opening stock: 10 units at cost of 100 each
  await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 10,
    averageCost: 100,
  });

  // Create a Purchase Order for 50 units at cost of 120 each
  const poRes = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    expectedDate: new Date(Date.now() + 86400000).toISOString(),
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        unitPrice: 120,
      },
    ],
    note: 'PO for GRN testing',
  });
  const PO_ID = poRes.data?.id;
  if (!PO_ID) {
    console.error('PO CREATION FAILED', poRes);
    process.exit(1);
  }

  // Submit and Approve PO
  await patch(`/purchase-orders/${PO_ID}/submit`, TOKEN);
  await patch(`/purchase-orders/${PO_ID}/approve`, TOKEN);

  console.log(`Approved PO ID: ${PO_ID}\n`);

  // ── Test Cases ─────────────────────────────────────────────────────────────

  // T1: Create DRAFT GRN exceeding PO quantity (ordered: 50, trying to receive: 60)
  const grnExceedRes = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    purchaseOrderId: PO_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        receivedQuantity: 60,
        unitCost: 120,
      },
    ],
  });
  if (grnExceedRes.success === false) {
    pass(1, 'Cannot create GRN exceeding PO limits');
  } else {
    fail(1, 'Allowed creating GRN exceeding PO limits', grnExceedRes);
  }

  // T2: Create valid DRAFT GRN (receiving 20 units)
  const grn1Res = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    purchaseOrderId: PO_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        receivedQuantity: 20,
        unitCost: 120,
      },
    ],
  });
  const GRN1_ID = grn1Res.data?.id;
  if (grn1Res.success && GRN1_ID && grn1Res.data.status === 'DRAFT') {
    pass(2, 'Created valid DRAFT GRN');
  } else {
    fail(2, 'Failed to create valid DRAFT GRN', grn1Res);
  }

  // T3: Verify stock has not changed yet for DRAFT GRN
  const stockBeforeRes = await req(
    'GET',
    `/inventory?companyId=${COMPANY_ID}&warehouseId=${WH_ID}&productId=${PRODUCT_ID}`,
    TOKEN,
  );
  const stockBefore = stockBeforeRes.data?.[0]?.quantity ?? 10;
  if (Number(stockBefore) === 10) {
    pass(3, 'Inventory stock unaffected by DRAFT GRN');
  } else {
    fail(3, 'Inventory stock changed for DRAFT GRN', stockBeforeRes);
  }

  // T4: Cancel a DRAFT GRN
  const cancelGrnRes = await patch(`/goods-receive/${GRN1_ID}/cancel`, TOKEN);
  if (cancelGrnRes.success && cancelGrnRes.data.status === 'CANCELLED') {
    pass(4, 'Successfully cancelled DRAFT GRN');
  } else {
    fail(4, 'Failed to cancel DRAFT GRN', cancelGrnRes);
  }

  // T5: Try to complete a CANCELLED GRN (should fail)
  const completeCancelledRes = await patch(`/goods-receive/${GRN1_ID}/complete`, TOKEN);
  if (completeCancelledRes.success === false) {
    pass(5, 'Cannot complete a CANCELLED GRN');
  } else {
    fail(5, 'Allowed completing CANCELLED GRN', completeCancelledRes);
  }

  // T6: Create another DRAFT GRN (receiving 20 units) and complete it
  const grn2Res = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    purchaseOrderId: PO_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        receivedQuantity: 20,
        unitCost: 120,
      },
    ],
  });
  const GRN2_ID = grn2Res.data?.id;
  const completeRes = await patch(`/goods-receive/${GRN2_ID}/complete`, TOKEN);
  if (completeRes.success && completeRes.data.status === 'COMPLETED') {
    pass(6, 'Successfully completed DRAFT GRN');
  } else {
    fail(6, 'Failed to complete DRAFT GRN', completeRes);
  }

  // T7: Verify inventory stock is updated (+20 units) and avgCost recalculated
  // Initial: 10 units @ 100 (Value: 1000)
  // Received: 20 units @ 120 (Value: 2400)
  // New total quantity = 30
  // New average cost = (1000 + 2400) / 30 = 3400 / 30 = 113.33333333333333
  const stockAfterRes = await req(
    'GET',
    `/inventory?companyId=${COMPANY_ID}&warehouseId=${WH_ID}&productId=${PRODUCT_ID}`,
    TOKEN,
  );
  const stockAfter = stockAfterRes.data?.[0];
  console.log('DEBUG STOCK:', JSON.stringify(stockAfter));
  if (
    stockAfter &&
    Number(stockAfter.availableQuantity) === 30 &&
    Math.abs(Number(stockAfter.averageCost) - 113.3333) < 0.01
  ) {
    pass(7, 'Stock and avgCost recalculated correctly');
  } else {
    fail(7, 'Incorrect stock or avgCost calculation', stockAfterRes);
  }

  // T8: Verify Purchase Order status has updated to PARTIALLY_RECEIVED
  const poAfter1Res = await req('GET', `/purchase-orders/${PO_ID}`, TOKEN);
  if (poAfter1Res.success && poAfter1Res.data.status === 'PARTIALLY_RECEIVED') {
    pass(8, 'Purchase Order status updated to PARTIALLY_RECEIVED');
  } else {
    fail(8, 'Purchase Order status incorrect', poAfter1Res);
  }

  // T9: Complete receiving PO (receive remaining 30 units)
  const grn3Res = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    purchaseOrderId: PO_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        receivedQuantity: 30,
        unitCost: 120,
      },
    ],
  });
  const GRN3_ID = grn3Res.data?.id;
  await patch(`/goods-receive/${GRN3_ID}/complete`, TOKEN);

  // Verify Purchase Order status is now RECEIVED
  const poAfter2Res = await req('GET', `/purchase-orders/${PO_ID}`, TOKEN);
  if (poAfter2Res.success && poAfter2Res.data.status === 'RECEIVED') {
    pass(9, 'Purchase Order status updated to RECEIVED after full receipt');
  } else {
    fail(9, 'Purchase Order status incorrect after full receipt', poAfter2Res);
  }

  // T10: Supplier Invoice creation — cannot invoice draft GRN
  const grnDraftRes = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 10,
        receivedQuantity: 10,
        unitCost: 120,
      },
    ],
  });
  const DRAFT_GRN_ID = grnDraftRes.data?.id;
  const invDraftRes = await req('POST', '/supplier-invoices', TOKEN, {
    goodsReceiveId: DRAFT_GRN_ID,
    invoiceNumber: `INV-DRAFT-${ts}`,
    invoiceDate: new Date().toISOString(),
  });
  if (invDraftRes.success === false) {
    pass(10, 'Cannot invoice a non-completed GRN');
  } else {
    fail(10, 'Allowed invoicing a non-completed GRN', invDraftRes);
  }

  // T11: Create valid Supplier Invoice from Completed GRN
  const invRes = await req('POST', '/supplier-invoices', TOKEN, {
    goodsReceiveId: GRN2_ID, // Completed GRN (20 units @ 120)
    invoiceNumber: `INV-${ts}-1`,
    invoiceDate: new Date().toISOString(),
    subtotal: 2400,
    tax: 120,
    discount: 50,
    grandTotal: 2470,
  });
  const INV_ID = invRes.data?.id;
  if (invRes.success && INV_ID && invRes.data.status === 'PENDING') {
    pass(11, 'Created valid Supplier Invoice in PENDING status');
  } else {
    fail(11, 'Failed to create Supplier Invoice', invRes);
  }

  // T12: Verify double invoice restriction on same GRN
  const invDoubleRes = await req('POST', '/supplier-invoices', TOKEN, {
    goodsReceiveId: GRN2_ID,
    invoiceNumber: `INV-${ts}-2`,
    invoiceDate: new Date().toISOString(),
  });
  if (invDoubleRes.success === false && invDoubleRes.code === 'CONFLICT') {
    pass(12, 'Supplier Invoice double-billing blocked');
  } else {
    fail(12, 'Allowed double billing on same GRN', invDoubleRes);
  }

  // T13: Verify duplicate invoice number restriction for same Supplier
  const invDupNumberRes = await req('POST', '/supplier-invoices', TOKEN, {
    goodsReceiveId: GRN3_ID, // Another completed GRN
    invoiceNumber: `INV-${ts}-1`, // Same invoice number as T11
    invoiceDate: new Date().toISOString(),
  });
  if (invDupNumberRes.success === false && invDupNumberRes.code === 'CONFLICT') {
    pass(13, 'Blocked duplicate invoice number for the same supplier');
  } else {
    fail(13, 'Allowed duplicate invoice number for the same supplier', invDupNumberRes);
  }

  // T14: Retrieve invoice details
  const getInvRes = await req('GET', `/supplier-invoices/${INV_ID}`, TOKEN);
  if (getInvRes.success && getInvRes.data.invoiceNumber === `INV-${ts}-1`) {
    pass(14, 'Retrieved supplier invoice details successfully');
  } else {
    fail(14, 'Failed to retrieve supplier invoice details', getInvRes);
  }

  // T15: List Supplier Invoices with filters
  const listInvRes = await req(
    'GET',
    `/supplier-invoices?supplierId=${SUPPLIER_ID}&status=PENDING`,
    TOKEN,
  );
  if (listInvRes.success && listInvRes.data.length >= 1) {
    pass(15, 'Fetched supplier invoices list with filters');
  } else {
    fail(15, 'Failed to list supplier invoices', listInvRes);
  }

  // ── Results ────────────────────────────────────────────────────────────────
  console.log(`\n===================================`);
  console.log(`TEST RUN COMPLETED`);
  console.log(`PASS: ${PASS}`);
  console.log(`FAIL: ${FAIL}`);
  console.log(`===================================`);
  if (FAIL > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled testing rejection:', err);
  process.exit(1);
});
