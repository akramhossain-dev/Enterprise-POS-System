/* eslint-disable no-console */
import { PrismaClient, Status } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding (Phase B3)...');

  // 1. Clear existing records in correct dependency order
  console.log('Clearing existing data...');
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

  // 3. Seed Permissions
  console.log('Seeding permissions...');
  const permissionsData = [
    // Users management
    { name: 'user.create', module: 'users', action: 'create' },
    { name: 'user.read', module: 'users', action: 'read' },
    { name: 'user.update', module: 'users', action: 'update' },
    { name: 'user.delete', module: 'users', action: 'delete' },

    // Role & Permission lookup
    { name: 'role.read', module: 'roles', action: 'read' },
    { name: 'permission.read', module: 'permissions', action: 'read' },

    // Product Catalog (future use)
    { name: 'product.create', module: 'products', action: 'create' },
    { name: 'product.read', module: 'products', action: 'read' },
    { name: 'product.update', module: 'products', action: 'update' },
    { name: 'product.delete', module: 'products', action: 'delete' },

    // Sales (future use)
    { name: 'sale.create', module: 'sales', action: 'create' },
    { name: 'sale.read', module: 'sales', action: 'read' },
  ];

  const permissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({ data: perm });
    permissions[perm.name] = created.id;
  }

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

  // SUPER_ADMIN gets all permissions
  const superAdminRolePermissionData = Object.values(permissions).map((permId) => ({
    roleId: roles.SUPER_ADMIN,
    permissionId: permId,
  }));
  await prisma.rolePermission.createMany({ data: superAdminRolePermissionData });

  // ADMIN gets all permissions
  const adminRolePermissionData = Object.values(permissions).map((permId) => ({
    roleId: roles.ADMIN,
    permissionId: permId,
  }));
  await prisma.rolePermission.createMany({ data: adminRolePermissionData });

  // MANAGER gets standard permissions (no user delete, no product delete)
  const managerPerms = [
    'user.create',
    'user.read',
    'user.update',
    'role.read',
    'permission.read',
    'product.create',
    'product.read',
    'product.update',
    'sale.create',
    'sale.read',
  ];
  const managerRolePermissionData = managerPerms.map((name) => ({
    roleId: roles.MANAGER,
    permissionId: permissions[name],
  }));
  await prisma.rolePermission.createMany({ data: managerRolePermissionData });

  // CASHIER gets minimal permissions
  const cashierPerms = ['product.read', 'sale.create', 'sale.read'];
  const cashierRolePermissionData = cashierPerms.map((name) => ({
    roleId: roles.CASHIER,
    permissionId: permissions[name],
  }));
  await prisma.rolePermission.createMany({ data: cashierRolePermissionData });

  // 6. Seed Default Users
  console.log('Seeding default users...');

  // Seed an Admin
  const adminPassword = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@enterprise-pos.com',
      password: adminPassword,
      phone: '1234567890',
      roleId: roles.ADMIN,
      status: Status.ACTIVE,
    },
  });
  console.log('  Created user: admin@enterprise-pos.com (Password: admin123)');

  // Seed a Cashier
  const cashierPassword = await hashPassword('cashier123');
  await prisma.user.create({
    data: {
      name: 'Jane Cashier',
      email: 'cashier@enterprise-pos.com',
      password: cashierPassword,
      phone: '0987654321',
      roleId: roles.CASHIER,
      status: Status.ACTIVE,
    },
  });
  console.log('  Created user: cashier@enterprise-pos.com (Password: cashier123)');

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
