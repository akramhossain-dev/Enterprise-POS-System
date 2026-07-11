/* eslint-disable no-console */
import { PrismaClient, Status, EmployeeStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding (Phase B4)...');

  // 1. Clear existing records in correct dependency order
  console.log('Clearing existing data...');
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

  // 2. Seed System Configurations
  console.log('Seeding system configurations...');
  const configs = [
    { key: 'system.name', value: 'Enterprise POS System', status: Status.ACTIVE },
    { key: 'system.version', value: '1.0.0', status: Status.ACTIVE },
    { key: 'system.maintenance', value: 'false', status: Status.ACTIVE },
  ];
  await prisma.systemConfig.createMany({ data: configs });

  // 3. Seed Permissions (all modules)
  console.log('Seeding permissions...');
  const permissionsData = [
    // ── User management ──
    { name: 'user.create', module: 'users', action: 'create' },
    { name: 'user.read', module: 'users', action: 'read' },
    { name: 'user.update', module: 'users', action: 'update' },
    { name: 'user.delete', module: 'users', action: 'delete' },

    // ── Role & Permission lookup ──
    { name: 'role.read', module: 'roles', action: 'read' },
    { name: 'permission.read', module: 'permissions', action: 'read' },

    // ── Company management ──
    { name: 'company.create', module: 'companies', action: 'create' },
    { name: 'company.read', module: 'companies', action: 'read' },
    { name: 'company.update', module: 'companies', action: 'update' },
    { name: 'company.delete', module: 'companies', action: 'delete' },

    // ── Branch management ──
    { name: 'branch.create', module: 'branches', action: 'create' },
    { name: 'branch.read', module: 'branches', action: 'read' },
    { name: 'branch.update', module: 'branches', action: 'update' },
    { name: 'branch.delete', module: 'branches', action: 'delete' },

    // ── Employee management ──
    { name: 'employee.create', module: 'employees', action: 'create' },
    { name: 'employee.read', module: 'employees', action: 'read' },
    { name: 'employee.update', module: 'employees', action: 'update' },
    { name: 'employee.delete', module: 'employees', action: 'delete' },

    // ── Business settings ──
    { name: 'settings.read', module: 'settings', action: 'read' },
    { name: 'settings.update', module: 'settings', action: 'update' },
    { name: 'settings.delete', module: 'settings', action: 'delete' },

    // ── Product Catalog (future) ──
    { name: 'product.create', module: 'products', action: 'create' },
    { name: 'product.read', module: 'products', action: 'read' },
    { name: 'product.update', module: 'products', action: 'update' },
    { name: 'product.delete', module: 'products', action: 'delete' },

    // ── Sales (future) ──
    { name: 'sale.create', module: 'sales', action: 'create' },
    { name: 'sale.read', module: 'sales', action: 'read' },
  ];

  const permissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({ data: perm });
    permissions[perm.name] = created.id;
  }
  console.log(`  Created ${String(permissionsData.length)} permissions`);

  // 4. Seed Roles
  console.log('Seeding roles...');
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const created = await prisma.role.create({
      data: {
        name,
        description: `${name.replace('_', ' ')} system access role`,
      },
    });
    roles[name] = created.id;
  }

  // 5. Map Permissions to Roles
  console.log('Mapping permissions to roles...');

  // SUPER_ADMIN & ADMIN get all permissions
  for (const roleKey of ['SUPER_ADMIN', 'ADMIN']) {
    const data = Object.values(permissions).map((permId) => ({
      roleId: roles[roleKey],
      permissionId: permId,
    }));
    await prisma.rolePermission.createMany({ data });
  }

  // MANAGER: broad access except delete on sensitive modules
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
    'product.create',
    'product.read',
    'product.update',
    'sale.create',
    'sale.read',
  ];
  await prisma.rolePermission.createMany({
    data: managerPerms.map((name) => ({
      roleId: roles.MANAGER,
      permissionId: permissions[name],
    })),
  });

  // CASHIER: minimal operational permissions
  const cashierPerms = ['product.read', 'sale.create', 'sale.read', 'branch.read', 'company.read'];
  await prisma.rolePermission.createMany({
    data: cashierPerms.map((name) => ({
      roleId: roles.CASHIER,
      permissionId: permissions[name],
    })),
  });

  // 6. Seed Default Company
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

  // 7. Seed Default Branch
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
  console.log(`  Created branch: ${branch.name} (${branch.id})`);

  // 8. Seed Default Business Settings
  console.log('Seeding business settings...');
  const defaultSettings = [
    { key: 'invoice.prefix', value: 'INV' },
    { key: 'invoice.next_number', value: '1001' },
    { key: 'pos.tax_inclusive', value: 'false' },
    { key: 'pos.allow_credit_sale', value: 'true' },
    { key: 'receipt.footer', value: 'Thank you for your business!' },
  ];
  await prisma.businessSetting.createMany({
    data: defaultSettings.map((s) => ({ ...s, companyId: company.id })),
  });
  console.log(`  Created ${String(defaultSettings.length)} default settings`);

  // 9. Seed Default Users
  console.log('Seeding default users...');

  // Admin user
  const adminPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@enterprise-pos.com',
      password: adminPassword,
      phone: '1234567890',
      roleId: roles.ADMIN,
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created user: ${adminUser.email} (Password: admin123)`);

  // Cashier user
  const cashierPassword = await hashPassword('cashier123');
  const cashierUser = await prisma.user.create({
    data: {
      name: 'Jane Cashier',
      email: 'cashier@enterprise-pos.com',
      password: cashierPassword,
      phone: '0987654321',
      roleId: roles.CASHIER,
      status: Status.ACTIVE,
    },
  });
  console.log(`  Created user: ${cashierUser.email} (Password: cashier123)`);

  // 10. Seed Default Employee linked to admin user
  console.log('Seeding default employee...');
  const adminEmployee = await prisma.employee.create({
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
  console.log(
    `  Created employee: ${adminEmployee.firstName} ${adminEmployee.lastName} (linked to admin user)`,
  );

  console.log('✅ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
