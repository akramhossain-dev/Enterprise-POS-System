/* eslint-disable no-console */
import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ── Seed System Configurations (System Foundation Placeholder) ──
  const configs = [
    {
      key: 'system.name',
      value: 'Enterprise POS System',
      status: Status.ACTIVE,
    },
    {
      key: 'system.version',
      value: '1.0.0',
      status: Status.ACTIVE,
    },
    {
      key: 'system.maintenance',
      value: 'false',
      status: Status.ACTIVE,
    },
  ];

  console.log('Clearing existing system configurations...');
  await prisma.systemConfig.deleteMany();

  console.log('Inserting seed records...');
  for (const config of configs) {
    const created = await prisma.systemConfig.create({
      data: config,
    });
    console.log(`  [SystemConfig] ${created.key} = ${created.value}`);
  }

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
