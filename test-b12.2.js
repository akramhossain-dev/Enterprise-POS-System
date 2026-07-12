#!/usr/bin/env node
// B12.2 Test Suite — Audit Log & Activity Tracking
// run: node test-b12.2.js

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

  // Setup cashier login to verify permission checks
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

  // ────────────────────────────────────────────────────────────────────────────
  // T1: Verify login history is logged upon success
  // ────────────────────────────────────────────────────────────────────────────
  const loginHistRes = await req('GET', `/login-history?userId=${adminId}`, TOKEN);
  if (loginHistRes.success && Array.isArray(loginHistRes.data) && loginHistRes.data.length > 0) {
    const latest = loginHistRes.data[0];
    if (latest.userId === adminId && latest.status === 'SUCCESS') {
      pass(1, 'Login history recorded successfully with SUCCESS status');
    } else {
      fail(1, 'Login history entries mismatched', latest);
    }
  } else {
    fail(1, 'Failed to fetch login history', loginHistRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T2: Verify active user sessions are tracked
  // ────────────────────────────────────────────────────────────────────────────
  const sessionRes = await req('GET', `/user-sessions?userId=${adminId}`, TOKEN);
  if (sessionRes.success && Array.isArray(sessionRes.data) && sessionRes.data.length > 0) {
    const active = sessionRes.data.find((s) => s.userId === adminId && !s.revokedAt);
    if (active) {
      pass(2, 'Active user session tracked correctly');
    } else {
      fail(2, 'Could not find an unrevoked session for admin', sessionRes.data);
    }
  } else {
    fail(2, 'Failed to fetch active user sessions', sessionRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T3: Verify core /audit-logs endpoint returns LOGIN activity
  // ────────────────────────────────────────────────────────────────────────────
  const auditLogsRes = await req('GET', '/audit-logs', TOKEN);
  if (auditLogsRes.success && Array.isArray(auditLogsRes.data) && auditLogsRes.data.length > 0) {
    const loginAudit = auditLogsRes.data.find((l) => l.action === 'LOGIN' && l.userId === adminId);
    if (loginAudit && loginAudit.browser && loginAudit.device && loginAudit.operatingSystem) {
      pass(3, 'Audit logs recorded LOGIN event with parsed browser/device/OS metadata');
    } else {
      fail(3, 'Audit log LOGIN entry or metadata missing', loginAudit);
    }
  } else {
    fail(3, 'Failed to fetch audit logs', auditLogsRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T4: Verify callers activity can be queried on /activity
  // ────────────────────────────────────────────────────────────────────────────
  const activityRes = await req('GET', '/activity', TOKEN);
  if (activityRes.success && Array.isArray(activityRes.data)) {
    const allForAdmin = activityRes.data.every((act) => act.userId === adminId);
    if (allForAdmin) {
      pass(4, '/activity filtered correctly to calling user ID');
    } else {
      fail(4, '/activity returned entries for other users', activityRes.data);
    }
  } else {
    fail(4, 'Failed to fetch activity logs', activityRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T5: Verify UPDATE user logs oldValue and newValue entity changes
  // ────────────────────────────────────────────────────────────────────────────
  const updateProfileRes = await req('PATCH', `/users/${adminId}`, TOKEN, {
    name: 'Super Admin Updated',
  });

  if (updateProfileRes.success) {
    // Wait a brief moment for async log to write
    await new Promise((resolve) => setTimeout(resolve, 300));
    const logsAfterUpdate = await req('GET', '/audit-logs', TOKEN);
    const updateLog = logsAfterUpdate.data?.find(
      (l) => l.action === 'UPDATE' && l.entityType === 'User' && l.entityId === adminId,
    );

    if (updateLog && updateLog.oldValue && updateLog.newValue) {
      if (updateLog.newValue.name === 'Super Admin Updated') {
        pass(5, 'User profile update audit logged with oldValue and newValue history state');
      } else {
        fail(5, 'Update values in newValue did not match update payload', updateLog);
      }
    } else {
      fail(5, 'Could not locate UPDATE audit log record', logsAfterUpdate);
    }
  } else {
    fail(5, 'Failed to update admin profile details', updateProfileRes);
  }

  // Restore name
  await req('PATCH', `/users/${adminId}`, TOKEN, { name: 'Admin User' });

  // ────────────────────────────────────────────────────────────────────────────
  // T6: Verify settings change changes are audit logged
  // ────────────────────────────────────────────────────────────────────────────
  const updateSettingRes = await req('PUT', `/companies/${companyId}/settings/timezone`, TOKEN, {
    value: 'UTC',
  });

  if (updateSettingRes.success) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const logsAfterSetting = await req('GET', '/audit-logs', TOKEN);
    const settingsLog = logsAfterSetting.data?.find(
      (l) => l.action === 'SETTINGS_CHANGE' && l.entityType === 'BusinessSetting',
    );

    if (settingsLog && settingsLog.newValue && settingsLog.newValue.value === 'UTC') {
      pass(6, 'Settings modification logged under SETTINGS_CHANGE successfully');
    } else {
      fail(6, 'Could not resolve SETTINGS_CHANGE audit log details', settingsLog);
    }
  } else {
    fail(6, 'Failed to update company settings', updateSettingRes);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T7: Immutable Audit Records: No mutation or deletion paths allowed
  // ────────────────────────────────────────────────────────────────────────────
  const deleteRes = await req('DELETE', `/audit-logs`, TOKEN);
  const patchRes = await req('PATCH', `/audit-logs/some-id`, TOKEN, { action: 'MUTATED' });

  if (deleteRes.status === 404 && patchRes.status === 404) {
    pass(7, 'Audit logs endpoints are immutable (no mutation or deletion routes exist)');
  } else {
    fail(7, 'Mutation or deletion routes responded unexpectedly', { deleteRes, patchRes });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // T8: Verify strict permission roles access guard controls
  // ────────────────────────────────────────────────────────────────────────────
  const cashierAuditRes = await req('GET', '/audit-logs', CASHIER_TOKEN);
  const cashierLoginHistRes = await req('GET', '/login-history', CASHIER_TOKEN);

  if (cashierAuditRes.status === 403 && cashierLoginHistRes.status === 403) {
    pass(
      8,
      'Access control guards successfully protected audit endpoints from unauthorized cashiers',
    );
  } else {
    fail(8, 'Cashier access was not correctly forbidden', { cashierAuditRes, cashierLoginHistRes });
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
