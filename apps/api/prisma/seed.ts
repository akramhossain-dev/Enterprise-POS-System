/* eslint-disable no-console */
import {
  PrismaClient,
  Status,
  EmployeeStatus,
  ProductStatus,
  CustomerStatus,
  SupplierStatus,
  WarehouseStatus,
  MovementType,
  PurchaseOrderStatus,
  GoodsReceiveStatus,
  SupplierInvoiceStatus,
  PaymentMethod,
  SupplierLedgerEntryType,
  POSSessionStatus,
  SaleStatus,
  PaymentStatus,
  SalesReturnStatus,
  RefundMethod,
  AccountStatus,
  ExpenseStatus,
  AlertType,
  AlertStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // ── Clear in dependency order ──────────────────────────────
  console.log('Clearing existing data...');

  await prisma.salesReturnItem.deleteMany();
  await prisma.salesReturn.deleteMany();
  await prisma.refund.deleteMany();

  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.pOSSession.deleteMany();

  await prisma.supplierLedgerEntry.deleteMany();
  await prisma.supplierPayment.deleteMany();
  await prisma.purchaseReturnItem.deleteMany();
  await prisma.purchaseReturn.deleteMany();
  await prisma.supplierInvoice.deleteMany();
  await prisma.goodsReceiveItem.deleteMany();
  await prisma.goodsReceive.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequisition.deleteMany();

  await prisma.supplierCreditNote.deleteMany();
  await prisma.supplierDebitNote.deleteMany();

  await prisma.stockTakeItem.deleteMany();
  await prisma.stockTake.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.serialNumber.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.inventoryLedger.deleteMany();
  await prisma.stockTransferItem.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.warehouse.deleteMany();

  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplierAddress.deleteMany();
  await prisma.supplier.deleteMany();

  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tax.deleteMany();

  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.journalEntryItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.account.updateMany({ data: { parentId: null } });
  await prisma.account.deleteMany();
  await prisma.accountCategory.deleteMany();

  await prisma.businessSetting.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.branch.deleteMany();
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
    // Catalog Permissions
    { name: 'category.create', module: 'categories', action: 'create' },
    { name: 'category.read', module: 'categories', action: 'read' },
    { name: 'category.update', module: 'categories', action: 'update' },
    { name: 'category.delete', module: 'categories', action: 'delete' },
    { name: 'brand.create', module: 'brands', action: 'create' },
    { name: 'brand.read', module: 'brands', action: 'read' },
    { name: 'brand.update', module: 'brands', action: 'update' },
    { name: 'brand.delete', module: 'brands', action: 'delete' },
    { name: 'unit.create', module: 'units', action: 'create' },
    { name: 'unit.read', module: 'units', action: 'read' },
    { name: 'unit.update', module: 'units', action: 'update' },
    { name: 'unit.delete', module: 'units', action: 'delete' },
    { name: 'tax.create', module: 'taxes', action: 'create' },
    { name: 'tax.read', module: 'taxes', action: 'read' },
    { name: 'tax.update', module: 'taxes', action: 'update' },
    { name: 'tax.delete', module: 'taxes', action: 'delete' },
    { name: 'product.create', module: 'products', action: 'create' },
    { name: 'product.read', module: 'products', action: 'read' },
    { name: 'product.update', module: 'products', action: 'update' },
    { name: 'product.delete', module: 'products', action: 'delete' },
    // Inventory Permissions
    { name: 'warehouse.create', module: 'warehouses', action: 'create' },
    { name: 'warehouse.read', module: 'warehouses', action: 'read' },
    { name: 'warehouse.update', module: 'warehouses', action: 'update' },
    { name: 'warehouse.delete', module: 'warehouses', action: 'delete' },
    { name: 'inventory.read', module: 'inventory', action: 'read' },
    { name: 'inventory.update', module: 'inventory', action: 'update' },
    { name: 'inventory.adjust', module: 'inventory', action: 'adjust' },
    { name: 'inventory.transfer', module: 'inventory', action: 'transfer' },
    { name: 'inventory.batch', module: 'inventory', action: 'batch' },
    { name: 'inventory.serial', module: 'inventory', action: 'serial' },
    { name: 'stocktake.create', module: 'stocktake', action: 'create' },
    { name: 'stocktake.read', module: 'stocktake', action: 'read' },
    { name: 'stocktake.update', module: 'stocktake', action: 'update' },
    { name: 'reconciliation.create', module: 'reconciliation', action: 'create' },
    { name: 'reconciliation.read', module: 'reconciliation', action: 'read' },
    // Customers & Suppliers
    { name: 'customer.create', module: 'customers', action: 'create' },
    { name: 'customer.read', module: 'customers', action: 'read' },
    { name: 'customer.update', module: 'customers', action: 'update' },
    { name: 'customer.delete', module: 'customers', action: 'delete' },
    { name: 'supplier.create', module: 'suppliers', action: 'create' },
    { name: 'supplier.read', module: 'suppliers', action: 'read' },
    { name: 'supplier.update', module: 'suppliers', action: 'update' },
    { name: 'supplier.delete', module: 'suppliers', action: 'delete' },
    // Purchases
    { name: 'purchase.create', module: 'purchase', action: 'create' },
    { name: 'purchase.view', module: 'purchase', action: 'view' },
    { name: 'purchase.update', module: 'purchase', action: 'update' },
    { name: 'purchase.delete', module: 'purchase', action: 'delete' },
    // POS Core Permissions
    { name: 'pos.open', module: 'pos', action: 'open' },
    { name: 'pos.close', module: 'pos', action: 'close' },
    { name: 'pos.view', module: 'pos', action: 'view' },
    { name: 'pos.checkout', module: 'pos', action: 'checkout' },
    { name: 'pos.return', module: 'pos', action: 'return' },
    // Accounting Permissions
    { name: 'accounting.setup', module: 'accounting', action: 'setup' },
    { name: 'accounting.journal', module: 'accounting', action: 'journal' },
    { name: 'accounting.view', module: 'accounting', action: 'view' },
    { name: 'expense.create', module: 'expense', action: 'create' },
    { name: 'expense.view', module: 'expense', action: 'view' },
    { name: 'income.create', module: 'income', action: 'create' },
    { name: 'income.view', module: 'income', action: 'view' },
    // Reports & Analytics
    { name: 'reports.view', module: 'reports', action: 'view' },
    { name: 'bi.view', module: 'bi', action: 'view' },
    // Audit & System logs
    { name: 'audit.view', module: 'audit', action: 'view' },
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
  for (const roleKey of ['SUPER_ADMIN', 'ADMIN']) {
    await prisma.rolePermission.createMany({
      data: Object.values(permissions).map((permId) => ({
        roleId: roles[roleKey],
        permissionId: permId,
      })),
    });
  }

  // MANAGER → Catalog, Inventory, Customers, Suppliers, Purchases, POS, Accounting, Reports
  const managerPerms = Object.keys(permissions).filter(
    (name) =>
      !name.startsWith('user.') && !name.startsWith('company.') && !name.startsWith('role.'),
  );
  await prisma.rolePermission.createMany({
    data: managerPerms.map((name) => ({
      roleId: roles.MANAGER,
      permissionId: permissions[name],
    })),
  });

  // CASHIER → POS, Catalog read, Customer create/read
  const cashierPerms = [
    'pos.open',
    'pos.close',
    'pos.view',
    'pos.checkout',
    'pos.return',
    'category.read',
    'brand.read',
    'unit.read',
    'tax.read',
    'product.read',
    'customer.create',
    'customer.read',
  ];
  await prisma.rolePermission.createMany({
    data: cashierPerms.map((name) => ({
      roleId: roles.CASHIER,
      permissionId: permissions[name],
    })),
  });

  // ── Company & Branch ─────────────────────────────────────────
  console.log('Seeding default company & branch...');
  const company = await prisma.company.create({
    data: {
      name: 'Demo Company Ltd',
      email: 'info@demo-company.com',
      phone: '555-0199',
      status: Status.ACTIVE,
    },
  });

  const branch = await prisma.branch.create({
    data: {
      companyId: company.id,
      name: 'Main Headquarter Branch',
      email: 'main@demo-company.com',
      phone: '555-0200',
      status: Status.ACTIVE,
    },
  });

  // ── Business Settings ───────────────────────────────────────
  await prisma.businessSetting.createMany({
    data: [
      { companyId: company.id, key: 'pos.receipt_logo', value: '' },
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

  const managerUser = await prisma.user.create({
    data: {
      name: 'System Manager',
      email: 'manager@enterprise-pos.com',
      password: await hashPassword('manager123'),
      phone: '1122334455',
      roleId: roles.MANAGER,
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created user: ${managerUser.email} (Password: manager123)`);

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

  // ── Employees ────────────────────────────────────────────────
  console.log('Seeding default employees...');
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

  await prisma.employee.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      userId: managerUser.id,
      firstName: 'System',
      lastName: 'Manager',
      email: managerUser.email,
      phone: managerUser.phone,
      hireDate: new Date('2026-01-01'),
      status: EmployeeStatus.ACTIVE,
    },
  });

  await prisma.employee.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      userId: cashierUser.id,
      firstName: 'Jane',
      lastName: 'Cashier',
      email: cashierUser.email,
      phone: cashierUser.phone,
      hireDate: new Date('2026-01-01'),
      status: EmployeeStatus.ACTIVE,
    },
  });

  // ── Warehouse ───────────────────────────────────────────────
  console.log('Seeding default warehouse...');
  const warehouse = await prisma.warehouse.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      code: 'WH-MAIN',
      name: 'Main Warehouse',
      status: WarehouseStatus.ACTIVE,
      isDefault: true,
      phone: '1234567890',
      email: 'warehouse@demo-company.com',
      managerName: 'Jane Manager',
      country: 'USA',
      city: 'New York',
      address: 'Central Manhattan Depot',
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
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Groceries', description: 'Food and grocery items' },
    { name: 'Clothing', description: 'Apparel and fashion' },
    { name: 'Beverages', description: 'Drinks and beverages' },
    { name: 'General', description: 'Uncategorized products' },
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
    { name: 'Generic' },
    { name: 'Samsung' },
    { name: 'Apple' },
    { name: 'Nestle' },
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
    { name: 'Tax Free', percentage: 0 },
    { name: 'VAT 5%', percentage: 5 },
    { name: 'VAT 15%', percentage: 15 },
  ];

  const taxIds: Record<string, string> = {};
  for (const t of taxesData) {
    const created = await prisma.tax.create({
      data: { companyId: company.id, ...t, status: Status.ACTIVE },
    });
    taxIds[t.name] = created.id;
  }
  console.log(`  Created ${String(taxesData.length)} taxes`);

  // ── Catalog: Products ────────────────────────────────────────
  console.log('Seeding catalog: products...');
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

  const productIds: Record<string, string> = {};
  for (const p of productsData) {
    const created = await prisma.product.create({
      data: { companyId: company.id, status: ProductStatus.ACTIVE, ...p },
    });
    productIds[p.name] = created.id;
  }
  console.log(`  Created ${String(productsData.length)} products`);

  // ── Inventory & Stock Records ──────────────────────────────
  console.log('Seeding inventory stock records...');
  for (const pName of Object.keys(productIds)) {
    const pId = productIds[pName];
    // Create stock; make USB-C cable run low to show low stock alerts
    const qty = pName === 'USB-C Cable 1m' ? 3.0 : 150.0;

    await prisma.inventory.create({
      data: {
        companyId: company.id,
        warehouseId: warehouse.id,
        productId: pId,
        availableQuantity: qty,
        reservedQuantity: 0.0,
        damagedQuantity: 0.0,
        minimumQuantity: 5.0,
        reorderQuantity: 15.0,
        averageCost:
          pName === 'USB-C Cable 1m' ? 3.5 : pName === 'Bottled Water 500ml' ? 0.25 : 8.0,
        lastPurchasePrice:
          pName === 'USB-C Cable 1m' ? 3.5 : pName === 'Bottled Water 500ml' ? 0.25 : 8.0,
        hasOpeningStock: true,
      },
    });

    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        branchId: branch.id,
        warehouseId: warehouse.id,
        productId: pId,
        movementType: MovementType.OPENING_STOCK,
        quantity: qty,
        previousQuantity: 0.0,
        newQuantity: qty,
        unitCost: pName === 'USB-C Cable 1m' ? 3.5 : pName === 'Bottled Water 500ml' ? 0.25 : 8.0,
        remarks: 'Initial opening stock seeding',
        performedBy: adminUser.id,
      },
    });

    if (pName === 'USB-C Cable 1m') {
      await prisma.stockAlert.create({
        data: {
          companyId: company.id,
          warehouseId: warehouse.id,
          productId: pId,
          alertType: AlertType.LOW_STOCK,
          currentQuantity: qty,
          minimumQuantity: 5.0,
          reorderQuantity: 15.0,
          status: AlertStatus.ACTIVE,
        },
      });
    }
  }

  // ── Customers ───────────────────────────────────────────────
  console.log('Seeding customers...');
  await prisma.customer.create({
    data: {
      companyId: company.id,
      customerCode: 'WALKIN',
      firstName: 'Walk-in',
      lastName: 'Customer',
      fullName: 'Walk-in Customer',
      phone: '0000000000',
      status: CustomerStatus.ACTIVE,
      currentBalance: 0.0,
    },
  });

  const regularCustomer = await prisma.customer.create({
    data: {
      companyId: company.id,
      customerCode: 'CUST001',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'customer@enterprise-pos.com',
      phone: '5551234567',
      status: CustomerStatus.ACTIVE,
      currentBalance: 50.0,
    },
  });

  await prisma.customerAddress.create({
    data: {
      customerId: regularCustomer.id,
      label: 'Billing',
      addressLine1: '123 Main Street',
      city: 'New York',
      country: 'USA',
      isDefault: true,
    },
  });

  // ── Suppliers ───────────────────────────────────────────────
  console.log('Seeding suppliers...');
  const supplier = await prisma.supplier.create({
    data: {
      companyId: company.id,
      supplierCode: 'SUP001',
      companyName: 'Acme Supplies Corp',
      contactPerson: 'Robert Supplier',
      email: 'supplier@enterprise-pos.com',
      phone: '5559876543',
      status: SupplierStatus.ACTIVE,
      openingBalance: 100.0,
      currentBalance: 150.0,
    },
  });

  await prisma.supplierAddress.create({
    data: {
      supplierId: supplier.id,
      label: 'Main Office',
      addressLine1: '456 Industrial Rd',
      city: 'Chicago',
      country: 'USA',
      isDefault: true,
    },
  });

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

  const accountIds: Record<string, string> = {};
  for (const acc of defaultAccounts) {
    const created = await prisma.account.create({
      data: {
        companyId: company.id,
        categoryId: catIds[acc.cat],
        accountCode: acc.code,
        name: acc.name,
        type: acc.type,
        openingBalance: 5000.0,
        currentBalance: 5000.0,
        status: AccountStatus.ACTIVE,
      },
    });
    accountIds[acc.name] = created.id;
  }
  console.log('  Seeded accounts chart');

  const initialExpenseCategories = [
    { name: 'Rent', description: 'Office or warehouse rent' },
    { name: 'Electricity', description: 'Utility bills' },
    { name: 'Transport', description: 'Travel and shipping costs' },
    { name: 'Salary', description: 'Employee payroll' },
    { name: 'Maintenance', description: 'Office and hardware repair' },
  ];

  const expenseCategoryIds: Record<string, string> = {};
  for (const cat of initialExpenseCategories) {
    const created = await prisma.expenseCategory.create({
      data: {
        companyId: company.id,
        name: cat.name,
        description: cat.description,
        status: 'ACTIVE',
      },
    });
    expenseCategoryIds[cat.name] = created.id;
  }

  // ── Purchase Operations (B8.1 & B8.2 & B8.3) ────────────────
  console.log('Seeding purchase operations...');
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      supplierId: supplier.id,
      purchaseOrderNumber: 'PO-2026-0001',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status: PurchaseOrderStatus.COMPLETED,
      subtotal: 80.0,
      discount: 0.0,
      tax: 12.0,
      grandTotal: 92.0,
      remarks: 'Initial stock purchase order',
      createdBy: adminUser.id,
    },
  });

  await prisma.purchaseOrderItem.create({
    data: {
      purchaseOrderId: purchaseOrder.id,
      productId: productIds['Wireless Mouse'],
      quantity: 10.0,
      unitPrice: 8.0,
      discount: 0.0,
      tax: 12.0,
      total: 92.0,
    },
  });

  const goodsReceive = await prisma.goodsReceive.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      supplierId: supplier.id,
      purchaseOrderId: purchaseOrder.id,
      grnNumber: 'GR-2026-0001',
      status: GoodsReceiveStatus.COMPLETED,
      subtotal: 80.0,
      discount: 0.0,
      tax: 12.0,
      grandTotal: 92.0,
      receivedBy: adminUser.id,
      receiveDate: new Date(),
    },
  });

  await prisma.goodsReceiveItem.create({
    data: {
      goodsReceiveId: goodsReceive.id,
      productId: productIds['Wireless Mouse'],
      quantity: 10.0,
      receivedQuantity: 10.0,
      unitCost: 8.0,
      total: 80.0,
    },
  });

  await prisma.supplierInvoice.create({
    data: {
      goodsReceiveId: goodsReceive.id,
      supplierId: supplier.id,
      invoiceNumber: 'SUP-INV-9999',
      invoiceDate: new Date(),
      subtotal: 80.0,
      tax: 12.0,
      discount: 0.0,
      grandTotal: 92.0,
      status: SupplierInvoiceStatus.PENDING,
    },
  });

  const supplierPayment = await prisma.supplierPayment.create({
    data: {
      companyId: company.id,
      supplierId: supplier.id,
      paymentNumber: 'SP-2026-0001',
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.BANK,
      amount: 50.0,
      reference: 'TX-BANK-0099',
      notes: 'Initial payment for SUP-INV-9999',
      createdBy: adminUser.id,
    },
  });

  await prisma.supplierLedgerEntry.create({
    data: {
      companyId: company.id,
      supplierId: supplier.id,
      entryType: SupplierLedgerEntryType.PAYMENT,
      amount: 50.0,
      runningBalance: 42.0,
      referenceId: supplierPayment.id,
      referenceNo: 'SP-2026-0001',
      description: 'Paid for invoice SUP-INV-9999',
    },
  });

  // ── POS Session & Checkout Sales Seeding (B9.1 & B9.2) ───────
  console.log('Seeding sales session & POS transactions...');
  const posSession = await prisma.pOSSession.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      cashierId: adminUser.id,
      sessionNumber: 'POS-2026-0001',
      openingCash: 100.0,
      status: POSSessionStatus.OPEN,
      openedAt: new Date(),
    },
  });

  // Completed sale
  const sale = await prisma.sale.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      customerId: regularCustomer.id,
      sessionId: posSession.id,
      invoiceNumber: 'INV-2026-0001',
      subtotal: 19.99,
      discount: 0.0,
      tax: 3.0,
      grandTotal: 22.99,
      paidAmount: 22.99,
      paymentStatus: PaymentStatus.PAID,
      status: SaleStatus.COMPLETED,
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  const saleItem = await prisma.saleItem.create({
    data: {
      saleId: sale.id,
      productId: productIds['Wireless Mouse'],
      quantity: 1.0,
      unitPrice: 19.99,
      discount: 0.0,
      tax: 3.0,
      total: 22.99,
    },
  });

  await prisma.payment.create({
    data: {
      saleId: sale.id,
      amount: 22.99,
      paymentMethod: PaymentMethod.CASH,
      reference: 'CASH-PAY',
      createdBy: adminUser.id,
    },
  });

  await prisma.invoice.create({
    data: {
      saleId: sale.id,
      invoiceNumber: 'INV-2026-0001',
    },
  });

  // Sales Return & Refund
  const salesReturn = await prisma.salesReturn.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      customerId: regularCustomer.id,
      saleId: sale.id,
      returnNumber: 'RET-2026-0001',
      subtotal: 19.99,
      tax: 3.0,
      discount: 0.0,
      grandTotal: 22.99,
      refundAmount: 22.99,
      status: SalesReturnStatus.COMPLETED,
      reason: 'Defective scrollwheel',
      createdBy: adminUser.id,
    },
  });

  await prisma.salesReturnItem.create({
    data: {
      salesReturnId: salesReturn.id,
      saleItemId: saleItem.id,
      productId: productIds['Wireless Mouse'],
      quantity: 1.0,
      unitPrice: 19.99,
      total: 22.99,
    },
  });

  await prisma.refund.create({
    data: {
      salesReturnId: salesReturn.id,
      customerId: regularCustomer.id,
      amount: 22.99,
      refundMethod: RefundMethod.CASH,
      reference: 'CASH-REFUND',
      createdBy: adminUser.id,
    },
  });

  // ── Accounting Journal Entries & Expenses (B10.2 & B10.3) ───
  console.log('Seeding financial transactions...');
  const journalEntry = await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      entryNumber: 'JE-2026-0001',
      date: new Date(),
      description: 'Rent expense',
      createdBy: adminUser.id,
    },
  });

  await prisma.journalEntryItem.create({
    data: {
      journalEntryId: journalEntry.id,
      accountId: accountIds.Expense,
      debit: 1000.0,
      credit: 0.0,
    },
  });

  await prisma.journalEntryItem.create({
    data: {
      journalEntryId: journalEntry.id,
      accountId: accountIds.Cash,
      debit: 0.0,
      credit: 1000.0,
    },
  });

  await prisma.expense.create({
    data: {
      companyId: company.id,
      branchId: branch.id,
      categoryId: expenseCategoryIds.Rent,
      accountId: accountIds.Expense,
      expenseNumber: 'EXP-2026-0001',
      date: new Date(),
      amount: 1000.0,
      description: 'Warehouse rent',
      paymentMethod: PaymentMethod.CASH,
      status: ExpenseStatus.ACTIVE,
      createdBy: adminUser.id,
    },
  });

  // ── Default Notification Templates ─────────────────────────
  console.log('Seeding templates...');
  const defaultTemplates = [
    {
      name: 'Low Stock',
      subject: 'Low Stock Alert',
      body: 'Product {productName} is running low in {warehouseName}.',
      type: 'INVENTORY' as const,
    },
    {
      name: 'Out of Stock',
      subject: 'Out of Stock Alert',
      body: 'Product {productName} is out of stock.',
      type: 'INVENTORY' as const,
    },
    {
      name: 'New Sale',
      subject: 'Sale Completed',
      body: 'Invoice: {invoiceNumber}, Total: {totalAmount}.',
      type: 'SALE' as const,
    },
  ];

  for (const t of defaultTemplates) {
    await prisma.notificationTemplate.create({
      data: {
        companyId: company.id,
        name: t.name,
        subject: t.subject,
        body: t.body,
        type: t.type,
      },
    });
  }

  console.log('✅ Comprehensive database seeding finished successfully!');
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
