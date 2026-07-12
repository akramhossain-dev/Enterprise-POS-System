/* eslint-disable no-console */
import { PrismaClient, Status, EmployeeStatus, ProductStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding (Phase B5)...');

  // ── Clear in dependency order ──────────────────────────────
  console.log('Clearing existing data...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tax.deleteMany();
  await prisma.businessSetting.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.paymentReceipt.deleteMany();
  await prisma.paymentVoucher.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.journalEntryItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.account.updateMany({ data: { parentId: null } });
  await prisma.account.deleteMany();
  await prisma.accountCategory.deleteMany();
  await prisma.company.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.systemConfig.deleteMany();

  // ── System Configs ─────────────────────────────────────────
  console.log('Seeding system configurations...');
  await prisma.systemConfig.createMany({
    data: [
      { key: 'system.name', value: 'Enterprise POS System', status: Status.ACTIVE },
      { key: 'system.version', value: '1.0.0', status: Status.ACTIVE },
      { key: 'system.maintenance', value: 'false', status: Status.ACTIVE },
    ],
  });

  // ── Permissions ────────────────────────────────────────────
  console.log('Seeding permissions...');
  const permissionsData = [
    // User management
    { name: 'user.create', module: 'users', action: 'create' },
    { name: 'user.read', module: 'users', action: 'read' },
    { name: 'user.update', module: 'users', action: 'update' },
    { name: 'user.delete', module: 'users', action: 'delete' },
    // Role & Permission
    { name: 'role.read', module: 'roles', action: 'read' },
    { name: 'permission.read', module: 'permissions', action: 'read' },
    // Company
    { name: 'company.create', module: 'companies', action: 'create' },
    { name: 'company.read', module: 'companies', action: 'read' },
    { name: 'company.update', module: 'companies', action: 'update' },
    { name: 'company.delete', module: 'companies', action: 'delete' },
    // Branch
    { name: 'branch.create', module: 'branches', action: 'create' },
    { name: 'branch.read', module: 'branches', action: 'read' },
    { name: 'branch.update', module: 'branches', action: 'update' },
    { name: 'branch.delete', module: 'branches', action: 'delete' },
    // Employee
    { name: 'employee.create', module: 'employees', action: 'create' },
    { name: 'employee.read', module: 'employees', action: 'read' },
    { name: 'employee.update', module: 'employees', action: 'update' },
    { name: 'employee.delete', module: 'employees', action: 'delete' },
    // Business Settings
    { name: 'settings.read', module: 'settings', action: 'read' },
    { name: 'settings.update', module: 'settings', action: 'update' },
    { name: 'settings.delete', module: 'settings', action: 'delete' },
    // ── B5: Catalog Permissions ──
    // Category
    { name: 'category.create', module: 'categories', action: 'create' },
    { name: 'category.read', module: 'categories', action: 'read' },
    { name: 'category.update', module: 'categories', action: 'update' },
    { name: 'category.delete', module: 'categories', action: 'delete' },
    // Brand
    { name: 'brand.create', module: 'brands', action: 'create' },
    { name: 'brand.read', module: 'brands', action: 'read' },
    { name: 'brand.update', module: 'brands', action: 'update' },
    { name: 'brand.delete', module: 'brands', action: 'delete' },
    // Unit
    { name: 'unit.create', module: 'units', action: 'create' },
    { name: 'unit.read', module: 'units', action: 'read' },
    { name: 'unit.update', module: 'units', action: 'update' },
    { name: 'unit.delete', module: 'units', action: 'delete' },
    // Tax
    { name: 'tax.create', module: 'taxes', action: 'create' },
    { name: 'tax.read', module: 'taxes', action: 'read' },
    { name: 'tax.update', module: 'taxes', action: 'update' },
    { name: 'tax.delete', module: 'taxes', action: 'delete' },
    // Product
    { name: 'product.create', module: 'products', action: 'create' },
    { name: 'product.read', module: 'products', action: 'read' },
    { name: 'product.update', module: 'products', action: 'update' },
    { name: 'product.delete', module: 'products', action: 'delete' },
    // ── B6.1: Customer Permissions ──
    { name: 'customer.create', module: 'customers', action: 'create' },
    { name: 'customer.view', module: 'customers', action: 'view' },
    { name: 'customer.update', module: 'customers', action: 'update' },
    { name: 'customer.delete', module: 'customers', action: 'delete' },
    // ── B6.2: Supplier Permissions ──
    { name: 'supplier.create', module: 'suppliers', action: 'create' },
    { name: 'supplier.view', module: 'suppliers', action: 'view' },
    { name: 'supplier.update', module: 'suppliers', action: 'update' },
    { name: 'supplier.delete', module: 'suppliers', action: 'delete' },
    // ── B7.1: Warehouse Permissions ──
    { name: 'warehouse.create', module: 'warehouses', action: 'create' },
    { name: 'warehouse.view', module: 'warehouses', action: 'view' },
    { name: 'warehouse.update', module: 'warehouses', action: 'update' },
    { name: 'warehouse.delete', module: 'warehouses', action: 'delete' },
    // ── B7.1: Inventory Permissions ──
    { name: 'inventory.view', module: 'inventory', action: 'view' },
    { name: 'inventory.update', module: 'inventory', action: 'update' },
    { name: 'inventory.opening_stock', module: 'inventory', action: 'opening_stock' },
    // ── B7.2: Stock Operations Permissions ──
    { name: 'stock.view', module: 'stock', action: 'view' },
    { name: 'stock.history', module: 'stock', action: 'history' },
    { name: 'stock.adjust', module: 'stock', action: 'adjust' },
    { name: 'stock.transfer', module: 'stock', action: 'transfer' },
    { name: 'stock.approve', module: 'stock', action: 'approve' },
    // ── B8: Purchase Module Permissions ──
    { name: 'purchase.create', module: 'purchase', action: 'create' },
    { name: 'purchase.view', module: 'purchase', action: 'view' },
    { name: 'purchase.update', module: 'purchase', action: 'update' },
    { name: 'purchase.delete', module: 'purchase', action: 'delete' },
    { name: 'purchase.approve', module: 'purchase', action: 'approve' },
    { name: 'purchase.receive', module: 'purchase', action: 'receive' },
    { name: 'purchase.receive.view', module: 'purchase', action: 'receive.view' },
    { name: 'purchase.receive.complete', module: 'purchase', action: 'receive.complete' },
    { name: 'supplier.invoice.create', module: 'purchase', action: 'invoice.create' },
    { name: 'supplier.invoice.view', module: 'purchase', action: 'invoice.view' },
    { name: 'purchase.return.create', module: 'purchase', action: 'return.create' },
    { name: 'purchase.return.view', module: 'purchase', action: 'return.view' },
    { name: 'purchase.return.approve', module: 'purchase', action: 'return.approve' },
    { name: 'purchase.return.complete', module: 'purchase', action: 'return.complete' },
    { name: 'supplier.payment.create', module: 'purchase', action: 'payment.create' },
    { name: 'supplier.payment.view', module: 'purchase', action: 'payment.view' },
    // ── B9.1: POS & Cart Module Permissions ──
    { name: 'pos.open', module: 'pos', action: 'open' },
    { name: 'pos.close', module: 'pos', action: 'close' },
    { name: 'pos.view', module: 'pos', action: 'view' },
    { name: 'pos.cart.create', module: 'pos', action: 'cart.create' },
    { name: 'pos.cart.update', module: 'pos', action: 'cart.update' },
    // ── B9.2: Checkout, Payment & Invoice Permissions ──
    { name: 'sale.create', module: 'sales', action: 'create' },
    { name: 'sale.view', module: 'sales', action: 'view' },
    { name: 'payment.create', module: 'payment', action: 'create' },
    { name: 'invoice.view', module: 'invoice', action: 'view' },
    { name: 'invoice.print', module: 'invoice', action: 'print' },
    // ── B9.3: Sales Return, Refund & Customer Due Permissions ──
    { name: 'sales.return.create', module: 'sales-return', action: 'create' },
    { name: 'sales.return.view', module: 'sales-return', action: 'view' },
    { name: 'sales.return.approve', module: 'sales-return', action: 'approve' },
    { name: 'sales.return.complete', module: 'sales-return', action: 'complete' },
    { name: 'refund.create', module: 'refund', action: 'create' },
    { name: 'refund.view', module: 'refund', action: 'view' },
    // ── B10.1: Chart of Accounts & Ledger Foundation Permissions ──
    { name: 'account.create', module: 'accounting', action: 'account.create' },
    { name: 'account.view', module: 'accounting', action: 'account.view' },
    { name: 'account.update', module: 'accounting', action: 'account.update' },
    { name: 'account.delete', module: 'accounting', action: 'account.delete' },
    { name: 'ledger.view', module: 'accounting', action: 'ledger.view' },
    // ── B10.2: Income & Expense Management Permissions ──
    { name: 'expense.create', module: 'expense', action: 'create' },
    { name: 'expense.view', module: 'expense', action: 'view' },
    { name: 'expense.update', module: 'expense', action: 'update' },
    { name: 'expense.delete', module: 'expense', action: 'delete' },
    { name: 'income.create', module: 'income', action: 'create' },
    { name: 'income.view', module: 'income', action: 'view' },
    { name: 'income.update', module: 'income', action: 'update' },
    { name: 'income.delete', module: 'income', action: 'delete' },
    // ── B10.3: Financial Transactions & Reports Foundation Permissions ──
    { name: 'financial.transaction.create', module: 'financial-transaction', action: 'create' },
    { name: 'financial.transaction.view', module: 'financial-transaction', action: 'view' },
    { name: 'financial.report.view', module: 'financial-report', action: 'view' },
  ];

  const permissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({ data: perm });
    permissions[perm.name] = created.id;
  }
  console.log(`  Created ${String(permissionsData.length)} permissions`);

  // ── Roles ──────────────────────────────────────────────────
  console.log('Seeding roles...');
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const created = await prisma.role.create({
      data: { name, description: `${name.replace('_', ' ')} system access role` },
    });
    roles[name] = created.id;
  }

  // ── Role → Permission Mapping ──────────────────────────────
  console.log('Mapping permissions to roles...');

  // SUPER_ADMIN & ADMIN → all permissions
  for (const roleKey of ['SUPER_ADMIN', 'ADMIN']) {
    await prisma.rolePermission.createMany({
      data: Object.values(permissions).map((permId) => ({
        roleId: roles[roleKey],
        permissionId: permId,
      })),
    });
  }

  // MANAGER → broad access, no hard deletes on org/finance data
  const managerPerms = [
    'user.create',
    'user.read',
    'user.update',
    'role.read',
    'permission.read',
    'company.read',
    'branch.read',
    'branch.create',
    'branch.update',
    'employee.create',
    'employee.read',
    'employee.update',
    'settings.read',
    'settings.update',
    'category.create',
    'category.read',
    'category.update',
    'brand.create',
    'brand.read',
    'brand.update',
    'unit.create',
    'unit.read',
    'unit.update',
    'tax.create',
    'tax.read',
    'tax.update',
    'product.create',
    'product.read',
    'product.update',
    'product.delete',
  ];
  await prisma.rolePermission.createMany({
    data: managerPerms.map((name) => ({ roleId: roles.MANAGER, permissionId: permissions[name] })),
  });

  // CASHIER → minimal read-only + sales
  const cashierPerms = [
    'product.read',
    'category.read',
    'brand.read',
    'unit.read',
    'tax.read',
    'branch.read',
    'company.read',
    // POS & Cart
    'pos.open',
    'pos.close',
    'pos.view',
    'pos.cart.create',
    'pos.cart.update',
    // Sales, Payments & Invoices
    'sale.create',
    'sale.view',
    'payment.create',
    'invoice.view',
    'invoice.print',
    // Sales Return & Refund
    'sales.return.create',
    'sales.return.view',
    'sales.return.approve',
    'sales.return.complete',
    'refund.create',
    'refund.view',
  ];
  await prisma.rolePermission.createMany({
    data: cashierPerms.map((name) => ({ roleId: roles.CASHIER, permissionId: permissions[name] })),
  });

  // ── Company ─────────────────────────────────────────────────
  console.log('Seeding default company...');
  const company = await prisma.company.create({
    data: {
      name: 'Demo Company',
      email: 'info@demo-company.com',
      phone: '+1-555-000-0001',
      address: '123 Business Ave, Commerce City, CA 90210',
      currency: 'USD',
      taxNumber: 'TAX-000001',
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created company: ${company.name} (${company.id})`);

  // ── Branch ──────────────────────────────────────────────────
  console.log('Seeding default branch...');
  const branch = await prisma.branch.create({
    data: {
      companyId: company.id,
      name: 'Main Branch',
      email: 'main@demo-company.com',
      phone: '+1-555-000-0002',
      address: '123 Business Ave, Commerce City, CA 90210',
      status: Status.ACTIVE,
    },
  });

  // ── Business Settings ───────────────────────────────────────
  console.log('Seeding business settings...');
  await prisma.businessSetting.createMany({
    data: [
      { companyId: company.id, key: 'invoice.prefix', value: 'INV' },
      { companyId: company.id, key: 'invoice.next_number', value: '1001' },
      { companyId: company.id, key: 'pos.tax_inclusive', value: 'false' },
      { companyId: company.id, key: 'pos.allow_credit_sale', value: 'true' },
      { companyId: company.id, key: 'receipt.footer', value: 'Thank you for your business!' },
    ],
  });

  // ── Users ───────────────────────────────────────────────────
  console.log('Seeding default users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@enterprise-pos.com',
      password: await hashPassword('admin123'),
      phone: '1234567890',
      roleId: roles.ADMIN,
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created user: ${adminUser.email} (Password: admin123)`);

  const cashierUser = await prisma.user.create({
    data: {
      name: 'Jane Cashier',
      email: 'cashier@enterprise-pos.com',
      password: await hashPassword('cashier123'),
      phone: '0987654321',
      roleId: roles.CASHIER,
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created user: ${cashierUser.email} (Password: cashier123)`);

  // ── Employee ─────────────────────────────────────────────────
  console.log('Seeding default employee...');
  await prisma.employee.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Admin',
      email: adminUser.email,
      phone: adminUser.phone,
      hireDate: new Date('2026-01-01'),
      status: EmployeeStatus.ACTIVE,
    },
  });

  // ── Catalog: Units ───────────────────────────────────────────
  console.log('Seeding catalog: units...');
  const unitsData = [
    { name: 'Piece', shortName: 'pcs' },
    { name: 'Kilogram', shortName: 'kg' },
    { name: 'Liter', shortName: 'L' },
    { name: 'Box', shortName: 'box' },
    { name: 'Meter', shortName: 'm' },
    { name: 'Dozen', shortName: 'doz' },
  ];
  const unitIds: Record<string, string> = {};
  for (const u of unitsData) {
    const created = await prisma.unit.create({
      data: { companyId: company.id, ...u, status: Status.ACTIVE },
    });
    unitIds[u.shortName] = created.id;
  }
  console.log(`  Created ${String(unitsData.length)} units`);

  // ── Catalog: Categories ──────────────────────────────────────
  console.log('Seeding catalog: categories...');
  const categoriesData = [
    { name: 'General', description: 'Uncategorized products' },
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Groceries', description: 'Food and grocery items' },
    { name: 'Clothing', description: 'Apparel and fashion' },
    { name: 'Beverages', description: 'Drinks and beverages' },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({
      data: { companyId: company.id, ...c, status: Status.ACTIVE },
    });
    categoryIds[c.name] = created.id;
  }
  console.log(`  Created ${String(categoriesData.length)} categories`);

  // ── Catalog: Brands ──────────────────────────────────────────
  console.log('Seeding catalog: brands...');
  const brandsData = [
    { name: 'Generic', description: 'Generic / unbranded products' },
    { name: 'Samsung', description: 'Samsung Electronics' },
    { name: 'Apple', description: 'Apple Inc.' },
  ];
  const brandIds: Record<string, string> = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({
      data: { companyId: company.id, ...b, status: Status.ACTIVE },
    });
    brandIds[b.name] = created.id;
  }
  console.log(`  Created ${String(brandsData.length)} brands`);

  // ── Catalog: Taxes ───────────────────────────────────────────
  console.log('Seeding catalog: taxes...');
  const taxesData = [
    { name: 'VAT 15%', percentage: 15 },
    { name: 'VAT 5%', percentage: 5 },
    { name: 'Tax Free', percentage: 0 },
  ];
  const taxIds: Record<string, string> = {};
  for (const t of taxesData) {
    const created = await prisma.tax.create({
      data: { companyId: company.id, ...t, status: Status.ACTIVE },
    });
    taxIds[t.name] = created.id;
  }
  console.log(`  Created ${String(taxesData.length)} taxes`);

  // ── Catalog: Demo Products ───────────────────────────────────
  console.log('Seeding catalog: demo products...');
  const productsData = [
    {
      name: 'USB-C Cable 1m',
      sku: 'SKU-USBC-001',
      barcode: '1234567890001',
      categoryId: categoryIds.Electronics,
      brandId: brandIds.Generic,
      unitId: unitIds.pcs,
      taxId: taxIds['VAT 15%'],
      purchasePrice: 3.5,
      sellingPrice: 7.99,
      description: 'High-speed USB-C to USB-A cable, 1 meter',
    },
    {
      name: 'Bottled Water 500ml',
      sku: 'SKU-WATER-001',
      barcode: '1234567890002',
      categoryId: categoryIds.Beverages,
      brandId: brandIds.Generic,
      unitId: unitIds.pcs,
      taxId: taxIds['Tax Free'],
      purchasePrice: 0.25,
      sellingPrice: 0.99,
      description: 'Purified bottled water, 500ml',
    },
    {
      name: 'Wireless Mouse',
      sku: 'SKU-MOUSE-001',
      barcode: '1234567890003',
      categoryId: categoryIds.Electronics,
      brandId: brandIds.Generic,
      unitId: unitIds.pcs,
      taxId: taxIds['VAT 15%'],
      purchasePrice: 8.0,
      sellingPrice: 19.99,
      description: 'Ergonomic wireless mouse with USB receiver',
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: { companyId: company.id, status: ProductStatus.ACTIVE, ...p },
    });
  }
  console.log(`  Created ${String(productsData.length)} demo products`);

  // ── Accounting Foundation Seeding (B10.1) ───────────────────
  console.log('Seeding account categories & chart of accounts...');
  const defaultCategories = [
    { name: 'Asset Accounts', type: 'ASSET' as const },
    { name: 'Liability Accounts', type: 'LIABILITY' as const },
    { name: 'Equity Accounts', type: 'EQUITY' as const },
    { name: 'Income Accounts', type: 'INCOME' as const },
    { name: 'Expense Accounts', type: 'EXPENSE' as const },
  ];

  const catIds: Record<string, string> = {};
  for (const cat of defaultCategories) {
    const created = await prisma.accountCategory.create({
      data: { companyId: company.id, name: cat.name, type: cat.type },
    });
    catIds[cat.name] = created.id;
  }

  const defaultAccounts = [
    { code: '1000', name: 'Cash', type: 'ASSET' as const, cat: 'Asset Accounts' },
    { code: '1100', name: 'Bank', type: 'ASSET' as const, cat: 'Asset Accounts' },
    { code: '1200', name: 'Inventory', type: 'ASSET' as const, cat: 'Asset Accounts' },
    { code: '1300', name: 'Accounts Receivable', type: 'ASSET' as const, cat: 'Asset Accounts' },
    {
      code: '2000',
      name: 'Accounts Payable',
      type: 'LIABILITY' as const,
      cat: 'Liability Accounts',
    },
    { code: '4000', name: 'Sales', type: 'INCOME' as const, cat: 'Income Accounts' },
    { code: '5000', name: 'Purchase', type: 'EXPENSE' as const, cat: 'Expense Accounts' },
    { code: '5100', name: 'Expense', type: 'EXPENSE' as const, cat: 'Expense Accounts' },
  ];

  for (const acc of defaultAccounts) {
    await prisma.account.create({
      data: {
        companyId: company.id,
        categoryId: catIds[acc.cat],
        accountCode: acc.code,
        name: acc.name,
        type: acc.type,
        openingBalance: 0,
        currentBalance: 0,
        status: 'ACTIVE',
      },
    });
  }
  console.log('  Seeded 5 categories and 8 chart of accounts');

  const initialExpenseCategories = [
    { name: 'Rent', description: 'Office or warehouse rent' },
    { name: 'Electricity', description: 'Utility bills' },
    { name: 'Transport', description: 'Travel and shipping costs' },
    { name: 'Salary', description: 'Employee payroll' },
    { name: 'Maintenance', description: 'Office and hardware repair' },
    { name: 'Marketing', description: 'Advertising and promotions' },
    { name: 'Other', description: 'Miscellaneous expenses' },
  ];

  for (const cat of initialExpenseCategories) {
    await prisma.expenseCategory.create({
      data: {
        companyId: company.id,
        name: cat.name,
        description: cat.description,
        status: 'ACTIVE',
      },
    });
  }
  console.log('  Seeded 7 default expense categories');

  console.log('✅ Seeding completed successfully! (Phase B5)');
  console.log('');
  console.log('  📧 Admin:   admin@enterprise-pos.com   / admin123');
  console.log('  📧 Cashier: cashier@enterprise-pos.com / cashier123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
