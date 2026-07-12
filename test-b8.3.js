#!/usr/bin/env node
// B8.3 Test Suite — Purchase Return & Supplier Payment
// run: node test-b8.3.js

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
    code: `PR-WH-${ts}`,
    name: `Return WH ${ts}`,
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
    supplierCode: `SUP-PR-${ts}`,
    companyName: `Supplier B8.3 ${ts}`,
  });
  const SUPPLIER_ID = supRes.data?.id;
  if (!SUPPLIER_ID) {
    console.error('SUPPLIER SETUP FAILED', supRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Product: ${PRODUCT_ID}, WH: ${WH_ID}, Supplier: ${SUPPLIER_ID}\n`,
  );

  // Setup initial opening stock: 100 units at cost of 10 each
  await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 100,
    averageCost: 10,
  });

  // Create PO: 50 units at 10 each
  const poRes = await req('POST', '/purchase-orders', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    expectedDate: new Date(Date.now() + 86400000).toISOString(),
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        unitPrice: 10,
      },
    ],
  });
  const PO_ID = poRes.data?.id;
  await patch(`/purchase-orders/${PO_ID}/submit`, TOKEN);
  await patch(`/purchase-orders/${PO_ID}/approve`, TOKEN);

  // Complete GRN: receive 50 units
  const grnRes = await req('POST', '/goods-receive', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    purchaseOrderId: PO_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 50,
        receivedQuantity: 50,
        unitCost: 10,
      },
    ],
  });
  const GRN_ID = grnRes.data?.id;
  await patch(`/goods-receive/${GRN_ID}/complete`, TOKEN);

  // Create Supplier Invoice
  const invoiceRes = await req('POST', '/supplier-invoices', TOKEN, {
    goodsReceiveId: GRN_ID,
    invoiceNumber: `INV-PR-${ts}`,
    invoiceDate: new Date().toISOString(),
    subtotal: 500,
    tax: 0,
    discount: 0,
    grandTotal: 500,
  });

  // ── Test Cases ─────────────────────────────────────────────────────────────

  // T1: Verify Supplier Balance Increases to 500 and PURCHASE ledger entry exists
  const bal1Res = await req('GET', `/suppliers/${SUPPLIER_ID}/balance`, TOKEN);
  const led1Res = await req('GET', `/suppliers/${SUPPLIER_ID}/ledger`, TOKEN);
  const purchaseEntry = led1Res.data?.find((e) => e.entryType === 'PURCHASE');

  if (
    bal1Res.success &&
    Number(bal1Res.data?.currentBalance) === 500 &&
    purchaseEntry &&
    Number(purchaseEntry.amount) === 500
  ) {
    pass(1, 'Invoice increased supplier balance and logged PURCHASE entry');
  } else {
    fail(1, 'Invoice balance/ledger check failed', { balance: bal1Res, ledger: led1Res });
  }

  // T2: Create DRAFT Purchase Return for 20 units
  const retRes = await req('POST', '/purchase-returns', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    goodsReceiveId: GRN_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 20,
        unitCost: 10,
      },
    ],
    reason: 'Defective products returned',
  });
  const RETURN_ID = retRes.data?.id;

  if (retRes.success && RETURN_ID && retRes.data.status === 'DRAFT') {
    pass(2, 'Created DRAFT Purchase Return successfully');
  } else {
    fail(2, 'Failed to create DRAFT Purchase Return', retRes);
  }

  // T3: Verify quantity limits: return quantity > GRN received quantity
  const limitRes = await req('POST', '/purchase-returns', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    goodsReceiveId: GRN_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 40, // 20 (draft) + 40 = 60, exceeds GRN received (50)
        unitCost: 10,
      },
    ],
  });

  if (limitRes.success === false) {
    pass(3, 'Cannot create return exceeding GRN quantity limits');
  } else {
    fail(3, 'Allowed return exceeding GRN limits', limitRes);
  }

  // T4: Verify stock has not changed yet for DRAFT return
  const stock1Res = await req(
    'GET',
    `/inventory?companyId=${COMPANY_ID}&warehouseId=${WH_ID}&productId=${PRODUCT_ID}`,
    TOKEN,
  );
  const qty1 = stock1Res.data?.[0]?.availableQuantity; // opening (100) + received (50) = 150
  if (Number(qty1) === 150) {
    pass(4, 'Inventory stock unaffected by DRAFT return');
  } else {
    fail(4, 'Inventory stock changed for DRAFT return', stock1Res);
  }

  // T5: Approve return (transitions DRAFT -> APPROVED)
  const appRes = await patch(`/purchase-returns/${RETURN_ID}/approve`, TOKEN);
  if (appRes.success && appRes.data.status === 'APPROVED') {
    pass(5, 'Approved Purchase Return successfully');
  } else {
    fail(5, 'Failed to approve Purchase Return', appRes);
  }

  // T6: Complete return
  const compRes = await patch(`/purchase-returns/${RETURN_ID}/complete`, TOKEN);
  const stock2Res = await req(
    'GET',
    `/inventory?companyId=${COMPANY_ID}&warehouseId=${WH_ID}&productId=${PRODUCT_ID}`,
    TOKEN,
  );
  const qty2 = stock2Res.data?.[0]?.availableQuantity; // 150 - 20 = 130
  const bal2Res = await req('GET', `/suppliers/${SUPPLIER_ID}/balance`, TOKEN);
  const led2Res = await req('GET', `/suppliers/${SUPPLIER_ID}/ledger`, TOKEN);
  const returnEntry = led2Res.data?.find((e) => e.entryType === 'PURCHASE_RETURN');

  if (
    compRes.success &&
    compRes.data.status === 'COMPLETED' &&
    Number(qty2) === 130 &&
    Number(bal2Res.data?.currentBalance) === 300 &&
    returnEntry &&
    Number(returnEntry.amount) === -200
  ) {
    pass(
      6,
      'Completed return: decreased stock, decreased supplier due, and logged PURCHASE_RETURN entry',
    );
  } else {
    fail(6, 'Failed return completion checks', {
      completion: compRes,
      stock: stock2Res,
      balance: bal2Res,
      ledger: led2Res,
    });
  }

  // T7: Verify Transaction Rollback: Attempt to complete a return with insufficient stock
  // First create a new return for 30 units (DRAFT -> APPROVED)
  const ret2Res = await req('POST', '/purchase-returns', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    goodsReceiveId: GRN_ID,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 30, // valid GRN quantity (remaining GRN quantity: 30)
        unitCost: 10,
      },
    ],
  });
  const RETURN2_ID = ret2Res.data?.id;
  await patch(`/purchase-returns/${RETURN2_ID}/approve`, TOKEN);

  // Now, manually decrease the available warehouse inventory to 10 (so 30 units return is not possible)
  // Create a valid stock adjustment to decrease stock by 125 units (from 130 to 5)
  const adjRes = await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    type: 'DECREASE',
    quantity: 125,
    reason: 'Manual decrease for rollback test',
  });

  // Try to complete return of 30 units (should fail due to insufficient inventory: 5 < 30)
  const failCompRes = await patch(`/purchase-returns/${RETURN2_ID}/complete`, TOKEN);

  // Verify that balance was NOT decreased (still 300) and status was not changed to COMPLETED
  const balRollbackRes = await req('GET', `/suppliers/${SUPPLIER_ID}/balance`, TOKEN);

  if (failCompRes.success === false && Number(balRollbackRes.data?.currentBalance) === 300) {
    pass(7, 'Transaction rolled back successfully when inventory was insufficient');
  } else {
    fail(7, 'Transaction did not rollback correctly', {
      completion: failCompRes,
      balance: balRollbackRes,
    });
  }

  // Restore inventory by increasing stock back by 125 units (from 5 to 130) so we can complete other tests
  await req('POST', '/stock-adjustments', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    type: 'INCREASE',
    quantity: 125,
    reason: 'Manual restore for payment test',
  });

  // T8: Create a Supplier Payment of 150
  const payRes = await req('POST', '/supplier-payments', TOKEN, {
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_ID,
    amount: 150,
    paymentMethod: 'CASH',
    reference: 'REF-PAY-01',
    notes: 'Partial payment',
  });

  const bal3Res = await req('GET', `/suppliers/${SUPPLIER_ID}/balance`, TOKEN);
  const led3Res = await req('GET', `/suppliers/${SUPPLIER_ID}/ledger`, TOKEN);
  const paymentEntry = led3Res.data?.find((e) => e.entryType === 'PAYMENT');

  if (
    payRes.success &&
    Number(bal3Res.data?.currentBalance) === 150 &&
    paymentEntry &&
    Number(paymentEntry.amount) === -150 &&
    Number(paymentEntry.runningBalance) === 150
  ) {
    pass(8, 'Logged payment, decreased supplier due to 150, and created ledger log');
  } else {
    fail(8, 'Payment verification failed', { payment: payRes, balance: bal3Res, ledger: led3Res });
  }

  // T9: Ledger logs list verification
  if (led3Res.success && led3Res.data.length >= 3 && led3Res.meta?.total >= 3) {
    pass(9, 'Ledger list returned paginated ledger history log');
  } else {
    fail(9, 'Ledger list validation failed', led3Res);
  }

  // T10: Supplier balance format verification
  if (
    bal3Res.success &&
    bal3Res.data.supplierId === SUPPLIER_ID &&
    bal3Res.data.companyName &&
    bal3Res.data.supplierCode &&
    Number(bal3Res.data.currentBalance) === 150
  ) {
    pass(10, 'Supplier balance API returns correct properties and formatted string');
  } else {
    fail(10, 'Supplier balance API format failed', bal3Res);
  }

  // T11: Permission Check: try to perform action without token
  const unauthRes = await req('POST', '/purchase-returns', null, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    supplierId: SUPPLIER_ID,
    goodsReceiveId: GRN_ID,
    items: [],
  });

  if (unauthRes.statusCode === 401 || unauthRes.error === 'Unauthorized') {
    pass(11, 'Permission check prevents unauthorized operations');
  } else {
    fail(11, 'Allowed operations without permission token', unauthRes);
  }

  // ── Final Report ───────────────────────────────────────────────────────────
  console.log(`\n================================`);
  console.log(`TESTS PASSED: ${PASS}`);
  console.log(`TESTS FAILED: ${FAIL}`);
  console.log(`================================`);
  if (FAIL > 0) {
    process.exit(1);
  } else {
    console.log('ALL TESTS COMPLETED SUCCESSFULLY.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Unhandled test crash:', err);
  process.exit(1);
});
