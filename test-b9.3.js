#!/usr/bin/env node
// B9.3 Test Suite — POS Sales Return, Refund & Customer Due
// run: node test-b9.3.js

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

  // Create customer
  const customerRes = await req('POST', '/customers', TOKEN, {
    companyId: COMPANY_ID,
    firstName: 'Alice',
    lastName: 'Returns',
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
    code: `SR-WH-${ts.toString().slice(-6)}`,
    name: `SR WH ${ts.toString().slice(-6)}`,
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

  // Open POS Session
  await req('POST', '/pos/session/open', TOKEN, {
    companyId: COMPANY_ID,
    warehouseId: WH_ID,
    openingCash: 200,
  });

  const sessionRes = await req('GET', '/pos/session/current', TOKEN);
  const SESSION_ID = sessionRes.data?.id;

  // Checkout 5 units of product. Total = 100.00
  const cartRes = await req('POST', '/pos/cart', TOKEN, { sessionId: SESSION_ID });
  const CART_ID = cartRes.data?.id;
  await req('POST', `/pos/cart/${CART_ID}/items`, TOKEN, {
    productId: PRODUCT_ID,
    quantity: 5,
    unitPrice: 20.0,
    discount: 0,
    tax: 0,
  });

  // Pay 60.00, Due 40.00
  const checkoutRes = await req('POST', '/pos/checkout', TOKEN, {
    cartId: CART_ID,
    customerId: CUSTOMER_ID,
    paymentDetails: {
      paymentMethod: 'CASH',
      amount: 60.0,
    },
  });

  const SALE_ID = checkoutRes.data?.sale?.id;
  const SALE_ITEM_ID = checkoutRes.data?.sale?.items?.[0]?.id;

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Create Partial Return Draft (return 2 units)
  // ────────────────────────────────────────────────────────────────────────────
  const returnDraftRes = await req('POST', '/sales-returns', TOKEN, {
    saleId: SALE_ID,
    reason: 'Defective units',
    items: [
      {
        saleItemId: SALE_ITEM_ID,
        productId: PRODUCT_ID,
        quantity: 2,
      },
    ],
  }); // Returned value: 40.00 (2 * 20.00)

  if (
    returnDraftRes.success &&
    returnDraftRes.data?.status === 'DRAFT' &&
    Number(returnDraftRes.data?.grandTotal) === 40 &&
    returnDraftRes.data?.items?.length === 1
  ) {
    pass(1, 'Created Draft Sales Return successfully for 2 units (Partial Return)');
  } else {
    fail(1, 'Failed to create draft sales return', returnDraftRes);
  }

  const RETURN_ID = returnDraftRes.data?.id;

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Approve the Return Draft
  // ────────────────────────────────────────────────────────────────────────────
  const approveRes = await req('PATCH', `/sales-returns/${RETURN_ID}/approve`, TOKEN);
  if (approveRes.success && approveRes.data?.status === 'APPROVED') {
    pass(2, 'Approved Sales Return successfully');
  } else {
    fail(2, 'Failed to approve sales return', approveRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Complete Sales Return & verify Stock + Ledger + Customer Balance
  // ────────────────────────────────────────────────────────────────────────────
  const balanceBefore = await req('GET', `/customers/${CUSTOMER_ID}/balance`, TOKEN);
  const balValBefore = Number(balanceBefore.data?.currentBalance);

  const completeRes = await req('PATCH', `/sales-returns/${RETURN_ID}/complete`, TOKEN);

  // Check stock after completion
  const searchStock = await req(
    'GET',
    `/pos/products/search?q=${PRODUCT_NAME}&warehouseId=${WH_ID}`,
    TOKEN,
  );
  const currentStock = Number(searchStock.data?.[0]?.availableQuantity ?? 0);

  // Check customer balance after completion
  const balanceAfter = await req('GET', `/customers/${CUSTOMER_ID}/balance`, TOKEN);
  const balValAfter = Number(balanceAfter.data?.currentBalance);

  // Check customer ledger
  const ledgerRes = await req('GET', `/customers/${CUSTOMER_ID}/ledger`, TOKEN);
  const ledgerItems = ledgerRes.data || [];

  if (
    completeRes.success &&
    completeRes.data?.status === 'COMPLETED' &&
    currentStock === 12 && // 15 originally - 5 sold + 2 returned = 12
    balValBefore === 40 &&
    balValAfter === 0 && // due was 40, returned 40 credit, so outstanding due becomes 0
    ledgerItems.length >= 3 // 1 for SALE, 1 for PAYMENT (from checkout), 1 for RETURN
  ) {
    pass(
      3,
      'Completed Sales Return: stock returned (12 units), customer balance cleared to 0, and ledger updated',
    );
  } else {
    fail(3, 'Failed complete sales return verification', {
      completeRes,
      currentStock,
      balValBefore,
      balValAfter,
      ledgerItems,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Validate Refund (Cash Refund for remaining returned credit)
  // ────────────────────────────────────────────────────────────────────────────
  // Let's create another return for 1 unit (remaining available: 3 units).
  const return2Res = await req('POST', '/sales-returns', TOKEN, {
    saleId: SALE_ID,
    reason: 'Change of mind',
    items: [
      {
        saleItemId: SALE_ITEM_ID,
        productId: PRODUCT_ID,
        quantity: 1,
      },
    ],
  }); // Total: 20.00

  const RETURN_2_ID = return2Res.data?.id;
  await req('PATCH', `/sales-returns/${RETURN_2_ID}/approve`, TOKEN);
  await req('PATCH', `/sales-returns/${RETURN_2_ID}/complete`, TOKEN);

  // Record cash refund of 20.00 for this return
  const refundRes = await req('POST', '/refunds', TOKEN, {
    salesReturnId: RETURN_2_ID,
    amount: 20.0,
    refundMethod: 'CASH',
    reference: 'RefundRef777',
  });

  const balanceAfterRefund = await req('GET', `/customers/${CUSTOMER_ID}/balance`, TOKEN);
  const finalBalVal = Number(balanceAfterRefund.data?.currentBalance);

  if (
    refundRes.success &&
    Number(refundRes.data?.amount) === 20 &&
    finalBalVal === 0 // outstanding due was 0, return of 20 decreased it to -20 (credit), refund of 20 cash returned it to 0
  ) {
    pass(4, 'Recorded CASH refund against completed return: customer balance offset tracked');
  } else {
    fail(4, 'Failed to process refund validation', { refundRes, finalBalVal });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Validate quantity limits prevent double returns
  // ────────────────────────────────────────────────────────────────────────────
  // Original purchased: 5. Already returned: 2 (T1-T3) + 1 (T4) = 3. Remaining: 2.
  // Attempting to return 3 units should fail.
  const badReturnRes = await req('POST', '/sales-returns', TOKEN, {
    saleId: SALE_ID,
    items: [
      {
        saleItemId: SALE_ITEM_ID,
        productId: PRODUCT_ID,
        quantity: 3,
      },
    ],
  });

  if (
    !badReturnRes.success &&
    badReturnRes.message?.includes('exceeds original purchased quantity')
  ) {
    pass(5, 'Validation successfully prevented returning more items than originally purchased');
  } else {
    fail(5, 'Validation failed to block return exceeding purchased quantity limits', badReturnRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Validate Transaction Rollback safety
  // ────────────────────────────────────────────────────────────────────────────
  const listReturnsBefore = await req('GET', '/sales-returns', TOKEN);
  const countBefore = listReturnsBefore.meta?.total ?? 0;

  // Attempting to create return on non-existent sale to check schema/transaction rollback
  const badCreate = await req('POST', '/sales-returns', TOKEN, {
    saleId: '00000000-0000-0000-0000-000000000000',
    items: [
      {
        saleItemId: SALE_ITEM_ID,
        productId: PRODUCT_ID,
        quantity: 1,
      },
    ],
  });

  const listReturnsAfter = await req('GET', '/sales-returns', TOKEN);
  const countAfter = listReturnsAfter.meta?.total ?? 0;

  if (!badCreate.success && countBefore === countAfter) {
    pass(6, 'Transaction rollback successfully preserved DB state on processing failure');
  } else {
    fail(6, 'Transaction rollback safety check failed', { badCreate, countBefore, countAfter });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Permission Guard blocks unauthorized calls
  // ────────────────────────────────────────────────────────────────────────────
  const unauthorizedRes = await req('GET', '/sales-returns');
  if (
    unauthorizedRes.success === false &&
    (unauthorizedRes.code === 'UNAUTHORIZED' || unauthorizedRes.statusCode === 401)
  ) {
    pass(7, 'Permission guard blocks unauthorized sales return API access');
  } else {
    fail(7, 'Security guard failed to block unauthorized request', unauthorizedRes);
  }

  // Clean POS Session
  await req('POST', '/pos/session/close', TOKEN, {
    closingCash: 250,
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
