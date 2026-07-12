#!/usr/bin/env node
// B9.1 Test Suite — POS Core & Cart System
// run: node test-b9.1.js

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

async function del(path, token) {
  return fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
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
  const PRODUCT_NAME = productRes.data?.[0]?.name;
  const PRODUCT_SKU = productRes.data?.[0]?.sku;
  const PRODUCT_BARCODE = productRes.data?.[0]?.barcode;
  if (!PRODUCT_ID) {
    console.error('NO PRODUCT');
    process.exit(1);
  }

  const ts = Date.now();
  // Setup warehouse
  const whRes = await req('POST', '/warehouses', TOKEN, {
    companyId: COMPANY_ID,
    code: `POS-WH-${ts}`,
    name: `POS WH ${ts}`,
    city: 'Dhaka',
  });
  const WH_ID = whRes.data?.id;
  if (!WH_ID) {
    console.error('WH SETUP FAILED', whRes);
    process.exit(1);
  }

  console.log(
    `Setup complete. Company: ${COMPANY_ID}, Product: ${PRODUCT_ID} (${PRODUCT_NAME}), WH: ${WH_ID}\n`,
  );

  // Setup initial inventory: 10 units at cost 10 each
  await req('POST', '/inventory/opening-stock', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    productId: PRODUCT_ID,
    quantity: 10,
    averageCost: 10,
  });

  // ── Test Cases ─────────────────────────────────────────────────────────────

  // T1: Open POS Session
  const openRes = await req('POST', '/pos/session/open', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    openingCash: 100,
  });
  const SESSION_ID = openRes.data?.id;

  if (openRes.success && SESSION_ID && openRes.data.status === 'OPEN') {
    pass(1, 'Opened POS Session successfully');
  } else {
    fail(1, 'Failed to open POS Session', openRes);
  }

  // T2: Get current active session
  const currentRes = await req('GET', '/pos/session/current', TOKEN);
  if (
    currentRes.success &&
    currentRes.data?.id === SESSION_ID &&
    currentRes.data?.status === 'OPEN'
  ) {
    pass(2, 'Retrieved current active POS Session');
  } else {
    fail(2, 'Failed to retrieve current active POS Session', currentRes);
  }

  // T3: Create Cart
  const cartRes = await req('POST', '/pos/cart', TOKEN, {
    sessionId: SESSION_ID,
  });
  const CART_ID = cartRes.data?.id;

  if (cartRes.success && CART_ID && cartRes.data.status === 'ACTIVE') {
    pass(3, 'Created Cart successfully');
  } else {
    fail(3, 'Failed to create Cart', cartRes);
  }

  // T4: Product search (Name, SKU, Barcode)
  const searchNameRes = await req(
    'GET',
    `/pos/products/search?q=${encodeURIComponent(PRODUCT_NAME)}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  const searchSkuRes = await req(
    'GET',
    `/pos/products/search?q=${encodeURIComponent(PRODUCT_SKU)}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  const searchBarcodeRes = await req(
    'GET',
    `/pos/products/search?q=${encodeURIComponent(PRODUCT_BARCODE)}&warehouseId=${WH_ID}`,
    TOKEN,
  );

  const nameMatch = searchNameRes.data?.some((p) => p.id === PRODUCT_ID);
  const skuMatch = searchSkuRes.data?.some((p) => p.id === PRODUCT_ID);
  const barcodeMatch = searchBarcodeRes.data?.some((p) => p.id === PRODUCT_ID);

  if (
    nameMatch &&
    skuMatch &&
    barcodeMatch &&
    Number(searchNameRes.data?.[0]?.availableQuantity) === 10
  ) {
    pass(4, 'Product and barcode search completed matching Name/SKU/Barcode and available stock');
  } else {
    fail(4, 'Product search validation failed', {
      name: searchNameRes,
      sku: searchSkuRes,
      barcode: searchBarcodeRes,
    });
  }

  // T5: Add product to cart (quantity: 3)
  const addRes = await req('POST', `/pos/cart/${CART_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 3,
    unitPrice: 15,
    discount: 5,
    tax: 2.5,
  });
  const item = addRes.data?.items?.[0];

  if (
    addRes.success &&
    item &&
    Number(item.quantity) === 3 &&
    Number(addRes.data.subtotal) === 45 &&
    Number(addRes.data.discount) === 5 &&
    Number(addRes.data.tax) === 2.5 &&
    Number(addRes.data.grandTotal) === 42.5
  ) {
    pass(5, 'Added item to cart and calculated Subtotal - Discount + Tax = Grand Total');
  } else {
    fail(5, 'Failed to add item to cart or check totals', addRes);
  }

  // T6: Stock validation (add quantity: 8, exceeds remaining available stock which is 7 since 3 is in cart?)
  // Note: available stock in inventory is 10. Requesting 8 more in a new add should fail if available stock is 10.
  // Wait, does stock validation check the cart quantity, or does it compare requested against total inventory?
  // Let's check available stock directly: available is 10. If we request 15, it definitely exceeds 10.
  const exceedRes = await req('POST', `/pos/cart/${CART_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 15,
  });

  if (exceedRes.success === false && exceedRes.statusCode === 400) {
    pass(6, 'Stock validation prevented adding item exceeding available quantity');
  } else {
    fail(6, 'Allowed adding item exceeding available stock', exceedRes);
  }

  // T7: Update quantity to 5 (available stock is 10, so 5 is valid)
  const ITEM_ID = item?.id;
  const updateRes = await patch(`/pos/cart/${CART_ID}/items/${ITEM_ID}`, TOKEN, {
    quantity: 5,
    unitPrice: 15,
    discount: 10,
    tax: 4,
  });

  if (
    updateRes.success &&
    updateRes.data?.items?.[0] &&
    Number(updateRes.data.items[0].quantity) === 5 &&
    Number(updateRes.data.subtotal) === 75 &&
    Number(updateRes.data.discount) === 10 &&
    Number(updateRes.data.tax) === 4 &&
    Number(updateRes.data.grandTotal) === 69
  ) {
    pass(7, 'Updated quantity and successfully recalculated cart totals');
  } else {
    fail(7, 'Failed to update quantity or verify cart totals recalculation', updateRes);
  }

  // T8: Remove item from cart
  const removeRes = await del(`/pos/cart/${CART_ID}/items/${ITEM_ID}`, TOKEN);
  if (
    removeRes.success &&
    removeRes.data?.items?.length === 0 &&
    Number(removeRes.data.grandTotal) === 0
  ) {
    pass(8, 'Removed item from cart successfully and reset totals');
  } else {
    fail(8, 'Failed to remove item from cart', removeRes);
  }

  // T9: Clear cart (first add back, then clear)
  await req('POST', `/pos/cart/${CART_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 2,
    unitPrice: 15,
  });
  const clearRes = await del(`/pos/cart/${CART_ID}/items`, TOKEN);

  if (
    clearRes.success &&
    clearRes.data?.items?.length === 0 &&
    Number(clearRes.data.grandTotal) === 0
  ) {
    pass(9, 'Cleared cart items successfully');
  } else {
    fail(9, 'Failed to clear cart items', clearRes);
  }

  // T10: Close POS Session
  const closeRes = await req('POST', '/pos/session/close', TOKEN, {
    closingCash: 250,
  });

  if (
    closeRes.success &&
    closeRes.data?.status === 'CLOSED' &&
    closeRes.data?.closedAt &&
    Number(closeRes.data?.closingCash) === 250
  ) {
    pass(10, 'Closed POS Session successfully');
  } else {
    fail(10, 'Failed to close POS Session', closeRes);
  }

  // T11: Permission Check: try accessing search without token
  const unauthRes = await req('GET', `/pos/products/search?q=Mouse&warehouseId=${WH_ID}`, null);
  if (unauthRes.statusCode === 401 || unauthRes.error === 'Unauthorized') {
    pass(11, 'Permission guard blocks unauthorized operations');
  } else {
    fail(11, 'Allowed operations without authorization token', unauthRes);
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
