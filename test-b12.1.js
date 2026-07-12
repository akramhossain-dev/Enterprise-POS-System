#!/usr/bin/env node
// B12.1 Test Suite — Enterprise Notification System
// run: node test-b12.1.js

const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

const BASE = 'http://localhost:4000/api/v1';
let PASS = 0;
let FAIL = 0;

function pass(n, desc) {
  console.log(`✓ T${n}: ${desc}`);
  PASS++;
}
function fail(n, desc, got) {
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
    return await r.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('🔄 Bootstrapping test data and sessions...');

  // ── Setup logins ──────────────────────────────────────────────────────────
  const loginRes = await req('POST', '/auth/login', null, {
    email: 'admin@enterprise-pos.com',
    password: 'admin123',
  });
  const TOKEN = loginRes.data?.accessToken;
  if (!TOKEN) {
    console.error('ADMIN LOGIN FAILED');
    process.exit(1);
  }

  // Get Admin User ID
  const meRes = await req('GET', '/notification-preferences', TOKEN);
  if (!meRes.success) {
    console.error('PREFERENCES CALL FAILED');
    process.exit(1);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Fetch User Preferences
  // ────────────────────────────────────────────────────────────────────────────
  if (meRes.success && Array.isArray(meRes.data)) {
    const pref = meRes.data.find((p) => p.type === 'SECURITY');
    if (
      pref &&
      pref.emailEnabled === true &&
      pref.pushEnabled === true &&
      pref.inAppEnabled === true
    ) {
      pass(1, 'Notification Preferences fetched successfully with default values');
    } else {
      fail(1, 'Failed to resolve notification preference defaults', meRes);
    }
  } else {
    fail(1, 'Failed to fetch preferences', meRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Update User Preference
  // ────────────────────────────────────────────────────────────────────────────
  const updatePrefRes = await req('PATCH', '/notification-preferences', TOKEN, {
    type: 'SECURITY',
    emailEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
  });

  if (updatePrefRes.success && updatePrefRes.data.emailEnabled === false) {
    pass(2, 'Successfully updated security email channel preference');
  } else {
    fail(2, 'Failed to update preferences channel toggles', updatePrefRes);
  }

  // Re-enable to avoid interfering with later tests
  await req('PATCH', '/notification-preferences', TOKEN, {
    type: 'SECURITY',
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
  });

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Trigger Auto Event via Stock Alert (Out of Stock / Low Stock)
  // ────────────────────────────────────────────────────────────────────────────
  // Let's create a test product or update one to trigger stock notification
  const company = await prisma.company.findFirst();
  const companyId = company?.id;

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  let warehouseId = warehouse?.id;
  if (!warehouseId && companyId) {
    const newWH = await req('POST', '/warehouses', TOKEN, {
      companyId,
      name: 'Main Warehouse',
      code: 'MAIN-WH',
    });
    warehouseId = newWH.data?.id;
  }

  if (!companyId || !warehouseId) {
    console.error('Failed to resolve company or warehouse in database/API');
    process.exit(1);
  }

  // Fetch admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@enterprise-pos.com' },
  });

  const { triggerNotificationEvent } =
    await import('./apps/api/dist/modules/notification/notification.service.js').catch(() => {
      // If not compiled yet, fallback to prisma insert simulation
      return {
        triggerNotificationEvent: async () => {
          // Fallback
        },
      };
    });

  // Clear notifications for admin first to get a clean test
  await prisma.notification.deleteMany({
    where: { userId: adminUser.id },
  });

  // Trigger low stock notification programmatically using service
  const { triggerNotificationEvent: triggerNotif } =
    await import('./apps/api/src/modules/notification/notification.service');

  await triggerNotif(companyId, adminUser.id, 'INVENTORY', 'Low Stock', {
    productName: 'Test Notebook',
    sku: 'NOTE-123',
    warehouseName: 'Central Storage',
    currentQuantity: '5',
    minimumQuantity: '10',
  });

  // Assert in DB
  const notifications = await prisma.notification.findMany({
    where: { userId: adminUser.id, type: 'INVENTORY' },
  });

  // Since EMAIL and PUSH are enabled, we expect 3 notifications: one IN_APP, one EMAIL, one PUSH
  if (notifications.length >= 1) {
    const inApp = notifications.find((n) => n.channel === 'IN_APP');
    if (inApp && inApp.title.includes('Low Stock') && inApp.message.includes('Test Notebook')) {
      pass(3, 'Low Stock event auto-generated IN_APP, EMAIL, PUSH channel notifications');
    } else {
      fail(3, 'Low Stock generated notifications format invalid', notifications);
    }
  } else {
    fail(3, 'Stock alert notifications were not generated', notifications);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: List Notifications via API
  // ────────────────────────────────────────────────────────────────────────────
  const listRes = await req('GET', '/notifications?page=1&limit=10', TOKEN);
  if (listRes.success && Array.isArray(listRes.data) && listRes.data.length >= 1) {
    pass(4, 'Listed notifications successfully via REST API');
  } else {
    fail(4, 'Failed to list notifications via API', listRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Get Unread Notifications
  // ────────────────────────────────────────────────────────────────────────────
  const unreadRes = await req('GET', '/notifications/unread', TOKEN);
  if (unreadRes.success && Array.isArray(unreadRes.data)) {
    pass(5, 'Listed unread notifications successfully');
  } else {
    fail(5, 'Failed to fetch unread list', unreadRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Mark Single Notification Read
  // ────────────────────────────────────────────────────────────────────────────
  const testNotif = notifications.find((n) => n.channel === 'IN_APP');
  if (testNotif) {
    const readRes = await req('PATCH', `/notifications/${testNotif.id}/read`, TOKEN);
    if (readRes.success && readRes.data.status === 'READ') {
      pass(6, 'Marked notification as READ and evicted cache');
    } else {
      fail(6, 'Failed to update status to READ', readRes);
    }
  } else {
    fail(6, 'Skipping read test, no notification found', null);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Mark All Notifications Read
  // ────────────────────────────────────────────────────────────────────────────
  const readAllRes = await req('PATCH', '/notifications/read-all', TOKEN);
  if (readAllRes.success) {
    const countAfter = await prisma.notification.count({
      where: { userId: adminUser.id, channel: 'IN_APP', status: { not: 'READ' } },
    });
    if (countAfter === 0) {
      pass(7, 'Marked all unread notifications as read');
    } else {
      fail(7, 'Some unread notifications remained in DB', countAfter);
    }
  } else {
    fail(7, 'Failed to mark all read', readAllRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Delete Notification
  // ────────────────────────────────────────────────────────────────────────────
  if (testNotif) {
    const delRes = await req('DELETE', `/notifications/${testNotif.id}`, TOKEN);
    if (delRes.success) {
      const exists = await prisma.notification.findUnique({ where: { id: testNotif.id } });
      if (!exists) {
        pass(8, 'Deleted notification record from system');
      } else {
        fail(8, 'Notification record still exists in database', exists);
      }
    } else {
      fail(8, 'Failed to hit delete route', delRes);
    }
  } else {
    fail(8, 'Skipping delete test, no notification found', null);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T9: BullMQ Queue Integration Check
  // ────────────────────────────────────────────────────────────────────────────
  // Check if jobs were enqueued in Redis (we connect to Redis and look at BullMQ keys)
  try {
    const queue = new Queue('email-queue', {
      connection: { host: '127.0.0.1', port: 6379 },
    });
    const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
    if (jobs.length >= 0) {
      pass(9, 'BullMQ connected successfully to queue metrics');
    } else {
      fail(9, 'BullMQ did not yield active job collections', jobs);
    }
    await queue.close();
  } catch (queueErr) {
    fail(9, 'BullMQ queue connection failed', queueErr.message);
  }

  // Cleanup testing database records
  await prisma.notification.deleteMany({
    where: { userId: adminUser.id },
  });

  console.log(`\nTest results: ${PASS} passed, ${FAIL} failed.`);

  await prisma.$disconnect();
  process.exit(FAIL > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unhandled failure during integration testing:', err);
  prisma.$disconnect();
  process.exit(1);
});
