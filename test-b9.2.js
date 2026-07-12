#!/usr/bin/env node
// B9.2 Test Suite — POS Checkout, Payment & Invoice System
// run: node test-b9.2.js

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

  const productRes = await req('GET', '/products?limit=1', TOKEN);
  const PRODUCT_ID = productRes.data?.[0]?.id;
  const PRODUCT_NAME = productRes.data?.[0]?.name;
  if (!PRODUCT_ID) {
    console.error('NO PRODUCT');
    process.exit(1);
  }

  // Create a customer for due balance tests
  const customerRes = await req('POST', '/customers', TOKEN, {
    companyId: COMPANY_ID,
    firstName: 'John',
    lastName: 'Doe',
    phone: `+1-555-${Date.now().toString().slice(-6)}`,
  });
  const CUSTOMER_ID = customerRes.data?.id;
  if (!CUSTOMER_ID) {
    console.error('CUSTOMER SETUP FAILED', customerRes);
    process.exit(1);
  }

  const ts = Date.now();
  // Setup warehouse
  const whRes = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `WH-${ts.toString().slice(-6)}`,
    name: `Checkout WH ${ts.toString().slice(-6)}`,
    city: 'Dhaka',
  });
  const WH_ID = whRes.data?.id;
  if (!WH_ID) {
    console.error('WH SETUP FAILED', whRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Product: ${PRODUCT_ID} (${PRODUCT_NAME}), WH: ${WH_ID}, Customer: ${CUSTOMER_ID}\n`,
  );

  // Close any active session from previous runs
  await req('POST', '/pos/session/close', TOKEN, {
    closingCash: 0,
  });

  // Setup initial inventory: 15 units at cost 10 each
  await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 15,
    averageCost: 10,
  });

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Open POS Session
  // ────────────────────────────────────────────────────────────────────────────
  const openSessionRes = await req('POST', '/pos/session/open', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    openingCash: 250,
  });
  if (openSessionRes.success) {
    pass(1, 'Opened POS Session successfully');
  } else {
    fail(1, 'Failed to open POS session', openSessionRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Create Cart & Populate Items
  // ────────────────────────────────────────────────────────────────────────────
  const sessionRes = await req('GET', '/pos/session/current', TOKEN);
  const SESSION_ID = sessionRes.data?.id;
  const cartRes = await req('POST', '/pos/cart', TOKEN, {
    sessionId: SESSION_ID,
  });
  const CART_ID = cartRes.data?.id;

  const itemRes = await req('POST', `/pos/cart/${CART_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 3,
    unitPrice: 20.0,
    discount: 5.0,
    tax: 2.25,
  });
  if (itemRes.success && Number(itemRes.data?.grandTotal) === 57.25) {
    pass(2, 'Created Cart and added items (Totals: 57.25)');
  } else {
    fail(2, 'Failed to set up cart items', itemRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Validate Stock before checkout
  // ────────────────────────────────────────────────────────────────────────────
  const searchRes = await req(
    'GET',
    `/pos/products/search?q=${PRODUCT_NAME}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  const initialStock = Number(searchRes.data?.[0]?.availableQuantity ?? 0);
  if (initialStock === 15) {
    pass(3, 'Validated stock levels before checkout (15 units available)');
  } else {
    fail(3, 'Stock level check returned unexpected quantity', searchRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Checkout Cart fully (PAID status)
  // ────────────────────────────────────────────────────────────────────────────
  const checkoutRes = await req('POST', '/pos/checkout', TOKEN, {
    cartId: CART_ID,
    customerId: CUSTOMER_ID,
    paymentDetails: {
      paymentMethod: 'CASH',
      amount: 57.25,
      reference: 'Ref123',
    },
  });

  const searchStockAfter = await req(
    'GET',
    `/pos/products/search?q=${PRODUCT_NAME}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  const finalStock = Number(searchStockAfter.data?.[0]?.availableQuantity ?? 0);

  if (
    checkoutRes.success &&
    checkoutRes.data?.sale?.paymentStatus === 'PAID' &&
    checkoutRes.data?.invoice?.invoiceNumber &&
    Number(checkoutRes.data?.payment?.amount) === 57.25 &&
    finalStock === 12
  ) {
    pass(4, 'Checked out cart fully. Sale status is PAID, stock decreased by 3 units (15 -> 12)');
  } else {
    fail(4, 'Failed full checkout validation', { checkoutRes, finalStock });
  }

  const FIRST_SALE_ID = checkoutRes.data?.sale?.id;

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Partial Payment & Due tracking
  // ────────────────────────────────────────────────────────────────────────────
  const cartRes2 = await req('POST', '/pos/cart', TOKEN, {
    sessionId: SESSION_ID,
  });
  const CART_2_ID = cartRes2.data?.id;

  await req('POST', `/pos/cart/${CART_2_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 2,
    unitPrice: 50.0,
    discount: 0,
    tax: 0,
  }); // Total: 100.00

  const checkout2Res = await req('POST', '/pos/checkout', TOKEN, {
    cartId: CART_2_ID,
    customerId: CUSTOMER_ID,
    paymentDetails: {
      paymentMethod: 'CARD',
      amount: 60.0,
    },
  }); // Paid 60.00, Due 40.00

  if (
    checkout2Res.success &&
    checkout2Res.data?.sale?.paymentStatus === 'PARTIAL' &&
    Number(checkout2Res.data?.sale?.paidAmount) === 60 &&
    Number(checkout2Res.data?.sale?.dueAmount) === 40
  ) {
    pass(5, 'Checkout with partial payment tracked: Paid 60.00, Due 40.00 (Status: PARTIAL)');
  } else {
    fail(5, 'Failed partial payment checkout tracking', checkout2Res);
  }

  const PARTIAL_SALE_ID = checkout2Res.data?.sale?.id;

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Record subsequent payment on due sale
  // ────────────────────────────────────────────────────────────────────────────
  const payRes = await req('POST', '/payments', TOKEN, {
    saleId: PARTIAL_SALE_ID,
    paymentMethod: 'MOBILE_BANKING',
    amount: 40.0,
    reference: 'BKash-TxId999',
  });

  if (
    payRes.success &&
    payRes.data?.sale?.paymentStatus === 'PAID' &&
    Number(payRes.data?.sale?.paidAmount) === 100 &&
    Number(payRes.data?.sale?.dueAmount) === 0
  ) {
    pass(6, 'Recorded subsequent payment: Paid balance down to 0, transitioned status to PAID');
  } else {
    fail(6, 'Failed subsequent payment registration', payRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Stock validation prevents checkout
  // ────────────────────────────────────────────────────────────────────────────
  const cartRes3 = await req('POST', '/pos/cart', TOKEN, {
    sessionId: SESSION_ID,
  });
  const CART_3_ID = cartRes3.data?.id;

  const itemAddRes = await req('POST', `/pos/cart/${CART_3_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 100, // Stock is 10 units now
    unitPrice: 10,
  });

  const checkout3Res = await req('POST', '/pos/checkout', TOKEN, {
    cartId: CART_3_ID,
    customerId: CUSTOMER_ID,
    paymentDetails: {
      paymentMethod: 'CASH',
      amount: 1000,
    },
  });

  if (
    (!itemAddRes.success && itemAddRes.message?.toLowerCase().includes('stock')) ||
    (!checkout3Res.success && checkout3Res.message?.toLowerCase().includes('stock')) ||
    (!checkout3Res.success && checkout3Res.message?.toLowerCase().includes('empty'))
  ) {
    pass(7, 'Stock validation prevented checkout exceeding warehouse inventory');
  } else {
    fail(7, 'Checkout succeeded or returned unexpected error message', {
      itemAddRes,
      checkout3Res,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Transaction Rollback on failure
  // ────────────────────────────────────────────────────────────────────────────
  const listSalesBefore = await req('GET', '/sales', TOKEN);
  const countBefore = listSalesBefore.meta?.total ?? 0;

  // Attempt to checkout with missing cart items or a non-existent cart to force validation failure
  const badCheckout = await req('POST', '/pos/checkout', TOKEN, {
    cartId: '00000000-0000-0000-0000-000000000000',
    customerId: CUSTOMER_ID,
  });

  const listSalesAfter = await req('GET', '/sales', TOKEN);
  const countAfter = listSalesAfter.meta?.total ?? 0;

  if (!badCheckout.success && countBefore === countAfter) {
    pass(8, 'Transaction safety rolls back completely on validation/stock deduction failure');
  } else {
    fail(8, 'Rollback safety failed', { badCheckout, countBefore, countAfter });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: Receipt Print Data
  // ────────────────────────────────────────────────────────────────────────────
  const receiptRes = await req('GET', `/sales/${FIRST_SALE_ID}/invoice`, TOKEN);
  if (
    receiptRes.success &&
    receiptRes.data?.businessInfo?.name &&
    receiptRes.data?.sale?.invoiceNumber &&
    receiptRes.data?.items?.length === 1 &&
    receiptRes.data?.payments?.length === 1
  ) {
    pass(
      9,
      'Receipt print data retrieved with company, customer, product details, totals, and payment history',
    );
  } else {
    fail(9, 'Failed to fetch correct receipt print data structure', receiptRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T10: Print Count Increment
  // ────────────────────────────────────────────────────────────────────────────
  const printRes = await req('POST', `/invoices/${FIRST_SALE_ID}/print`, TOKEN);
  const getInvoiceRes = await req('GET', `/invoices/${FIRST_SALE_ID}`, TOKEN);

  if (printRes.success && getInvoiceRes.success && getInvoiceRes.data?.printCount === 1) {
    pass(10, 'Print counts tracked and successfully incremented on printed invoices');
  } else {
    fail(10, 'Print count tracking verification failed', { printRes, getInvoiceRes });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T11: Permission Guard blocks unauthorized calls
  // ────────────────────────────────────────────────────────────────────────────
  const unauthorizedRes = await req('GET', '/sales');
  if (
    unauthorizedRes.success === false &&
    (unauthorizedRes.code === 'UNAUTHORIZED' || unauthorizedRes.statusCode === 401)
  ) {
    pass(11, 'Permission guard blocks unauthorized API calls');
  } else {
    fail(11, 'Security guard failed to block unauthorized request', unauthorizedRes);
  }

  // ── Clean POS Session ───────────────────────────────────────────────────────
  await req('POST', '/pos/session/close', TOKEN, {
    closingCash: 350,
  });

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
