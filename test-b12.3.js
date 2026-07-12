#!/usr/bin/env node
// B12.3 Test Suite — Enterprise Settings & System Configuration
// run: node test-b12.3.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
  console.log(`❌ T${n}: ${desc}`);
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
    const data = await r.json();
    return { status: r.status, ...data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('🔄 Bootstrapping test data and sessions...');

  // Setup admin login
  const loginRes = await req('POST', '/auth/login', null, {
    email: 'admin@enterprise-pos.com',
    password: 'admin123',
  });
  const TOKEN = loginRes.data?.accessToken;
  const adminId = loginRes.data?.user?.id;
  if (!TOKEN || !adminId) {
    console.error('ADMIN LOGIN FAILED');
    process.exit(1);
  }

  // Setup cashier login to verify permissions
  const cashierLoginRes = await req('POST', '/auth/login', null, {
    email: 'cashier@enterprise-pos.com',
    password: 'cashier123',
  });
  const CASHIER_TOKEN = cashierLoginRes.data?.accessToken;
  if (!CASHIER_TOKEN) {
    console.error('CASHIER LOGIN FAILED');
    process.exit(1);
  }

  const seededCompany = await prisma.company.findFirst();
  const companyId = seededCompany?.id;
  if (!companyId) {
    console.error('NO COMPANY SEEDED IN DATABASE');
    process.exit(1);
  }

  const seededBranch = await prisma.branch.findFirst();
  const branchId = seededBranch?.id;
  if (!branchId) {
    console.error('NO BRANCH SEEDED IN DATABASE');
    process.exit(1);
  }

  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId,
        branchId,
        name: 'Test Warehouse',
        code: 'WH-TEST',
        address: '123 Test St',
        status: 'ACTIVE',
      },
    });
  }
  const warehouseId = warehouse.id;

  let customer = await prisma.customer.findFirst();
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId,
        fullName: 'Test Customer',
        firstName: 'Test',
        lastName: 'User',
        customerCode: 'CUST-TEST',
        phone: '+12345600',
        email: 'test@customer.com',
        status: 'ACTIVE',
      },
    });
  }
  const customerId = customer.id;

  // Clear existing system settings to start fresh
  await prisma.systemSetting.deleteMany({ where: { companyId } });

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Company Settings PUT & GET
  // ────────────────────────────────────────────────────────────────────────────
  const companyPayload = {
    name: 'Seeded Enterprise Inc.',
    logo: 'https://logo.com/img.png',
    phone: '+123456789',
    email: 'hello@seeded-enterprise.com',
    website: 'https://seeded-enterprise.com',
    address: 'HQ Blvd 100',
    taxNumber: 'TX-100-200',
    registrationNumber: 'REG-55555',
    businessHours: '9am - 6pm',
  };

  const companyPutRes = await req('PUT', '/settings/COMPANY', TOKEN, companyPayload);
  if (companyPutRes.success && companyPutRes.data.name === 'Seeded Enterprise Inc.') {
    pass(1, 'Company Settings updated and returned successfully');
  } else {
    fail(1, 'Failed to update Company Settings', companyPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Branch Settings validation (UUID index record)
  // ────────────────────────────────────────────────────────────────────────────
  const branchPayload = {
    [branchId]: {
      name: 'Central POS Branch',
      address: 'Suite 200',
      phone: '+99887766',
      warehouseId,
      timezone: 'Asia/Dhaka',
    },
  };

  const branchPutRes = await req('PUT', '/settings/BRANCH', TOKEN, branchPayload);
  if (branchPutRes.success && branchPutRes.data[branchId]?.name === 'Central POS Branch') {
    pass(2, 'Branch Settings configured and validated under branch IDs keys');
  } else {
    fail(2, 'Failed to configure Branch Settings', branchPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: POS Settings Zod Validation & Fallbacks
  // ────────────────────────────────────────────────────────────────────────────
  const posPayload = {
    defaultWarehouseId: warehouseId,
    defaultCustomerId: customerId,
    allowNegativeStock: true,
    allowDiscount: true,
    maxDiscountPercent: 25,
    autoOpenSession: true,
    autoPrintReceipt: true,
  };

  const posPutRes = await req('PUT', '/settings/POS', TOKEN, posPayload);
  if (posPutRes.success && posPutRes.data.maxDiscountPercent === 25) {
    pass(3, 'POS Settings successfully validated and saved');
  } else {
    fail(3, 'Failed to configure POS Settings', posPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Invoice Settings Format
  // ────────────────────────────────────────────────────────────────────────────
  const invoicePayload = {
    invoicePrefix: 'INV-ENT-',
    invoiceNumberFormat: 'YYYYMMDD-{seq}',
    receiptFooter: 'Thank you for shopping with us!',
    termsConditions: 'All sales are final',
    printCopies: 2,
  };

  const invoicePutRes = await req('PUT', '/settings/INVOICE', TOKEN, invoicePayload);
  if (invoicePutRes.success && invoicePutRes.data.invoicePrefix === 'INV-ENT-') {
    pass(4, 'Invoice Settings configured successfully');
  } else {
    fail(4, 'Failed to configure Invoice Settings', invoicePutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Tax Settings
  // ────────────────────────────────────────────────────────────────────────────
  const taxPayload = {
    defaultTaxRate: 15.0,
    taxInclusive: false,
    taxExclusive: true,
    taxNumber: 'TX-NUM-1234',
  };

  const taxPutRes = await req('PUT', '/settings/TAX', TOKEN, taxPayload);
  if (taxPutRes.success && taxPutRes.data.defaultTaxRate === 15.0) {
    pass(5, 'Tax Settings configured successfully');
  } else {
    fail(5, 'Failed to configure Tax Settings', taxPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Currency Settings
  // ────────────────────────────────────────────────────────────────────────────
  const currencyPayload = {
    currencyCode: 'BDT',
    currencySymbol: '৳',
    decimalPrecision: 2,
  };

  const currencyPutRes = await req('PUT', '/settings/CURRENCY', TOKEN, currencyPayload);
  if (currencyPutRes.success && currencyPutRes.data.currencyCode === 'BDT') {
    pass(6, 'Currency Settings configured successfully');
  } else {
    fail(6, 'Failed to configure Currency Settings', currencyPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: SMTP Encryption & API Response Masking
  // ────────────────────────────────────────────────────────────────────────────
  const emailPayload = {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    username: 'noreply@gmail.com',
    password: 'smtpSecretPassword123!',
    encryption: 'TLS',
    fromEmail: 'noreply@gmail.com',
    fromName: 'Seeded Sender',
  };

  const emailPutRes = await req('PUT', '/settings/EMAIL', TOKEN, emailPayload);
  if (emailPutRes.success && emailPutRes.data.password === '********') {
    // Read direct from DB to verify it is encrypted
    const dbRecord = await prisma.systemSetting.findFirst({
      where: { companyId, category: 'EMAIL' },
    });

    if (dbRecord && dbRecord.value && dbRecord.value.password !== 'smtpSecretPassword123!') {
      pass(7, 'SMTP credentials successfully encrypted in DB and masked in API response');
    } else {
      fail(7, 'SMTP password was not encrypted in DB', dbRecord?.value);
    }
  } else {
    fail(7, 'Failed to configure EMAIL Settings', emailPutRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Caching and Cache Refresh invalidation on update
  // ────────────────────────────────────────────────────────────────────────────
  // Make a GET to prime cache
  const primeGetRes = await req('GET', '/settings/COMPANY', TOKEN);

  // Make a PATCH to update company phone
  const patchRes = await req('PATCH', '/settings/COMPANY', TOKEN, { phone: '+999999999' });

  // Immediately GET to check if updated phone is returned (demonstrating invalidation)
  const afterGetRes = await req('GET', '/settings/COMPANY', TOKEN);
  if (afterGetRes.success && afterGetRes.data.phone === '+999999999') {
    pass(8, 'Cache successfully invalidated and refreshed on update');
  } else {
    fail(8, 'Settings cache did not refresh updated value', afterGetRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: Permission controls checking settings updates
  // ────────────────────────────────────────────────────────────────────────────
  const cashierPutRes = await req('PUT', '/settings/COMPANY', CASHIER_TOKEN, companyPayload);
  if (cashierPutRes.status === 403) {
    pass(9, 'Unauthorized cashiers successfully blocked from setting updates (403 Forbidden)');
  } else {
    fail(9, 'Cashier was not blocked from settings modifications', cashierPutRes);
  }

  // ── Print Results ──────────────────────────────────────────────────────────
  console.log('\n======================================');
  console.log(`  Tests Passed: ${PASS}`);
  console.log(`  Tests Failed: ${FAIL}`);
  console.log('======================================');

  if (FAIL > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
