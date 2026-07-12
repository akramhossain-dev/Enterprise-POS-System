import { FastifyInstance } from 'fastify';
import { sendSuccess } from '../common/responses/success';

// ─────────────────────────────────────────────
// Root Routes — /api/v1
// ─────────────────────────────────────────────

export async function routes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();
  /**
   * GET /
   * Root endpoint — confirms the API is running.
   */
  fastify.get(
    '/',
    {
      schema: {
        tags: ['System'],
        summary: 'API root',
        description: 'Confirms the Enterprise POS API is running and reachable.',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.status(200).send(sendSuccess({ message: 'Enterprise POS API Running' }));
    },
  );

  // ── Health, readiness & liveness checks ────────
  const { healthRoutes } = await import('./health.routes');
  await fastify.register(healthRoutes);

  // ── Auth & User Management ───────────────────────────
  const { authRoutes } = await import('../modules/auth/auth.routes');
  const { userRoutes } = await import('../modules/users/user.routes');
  const { roleRoutes } = await import('../modules/roles/role.routes');
  const { permissionRoutes } = await import('../modules/permissions/permission.routes');

  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(userRoutes, { prefix: '/users' });
  await fastify.register(roleRoutes, { prefix: '/roles' });
  await fastify.register(permissionRoutes, { prefix: '/permissions' });

  // ── Core Business Management ──────────────────────────
  const { companyRoutes } = await import('../modules/company/company.routes');
  const { settingsRoutes, systemSettingsRoutes } =
    await import('../modules/settings/settings.routes');
  const { branchRoutes } = await import('../modules/branch/branch.routes');
  const { employeeRoutes } = await import('../modules/employee/employee.routes');

  await fastify.register(companyRoutes, { prefix: '/companies' });
  await fastify.register(settingsRoutes, { prefix: '/companies' }); // nested: /companies/:companyId/settings
  await fastify.register(systemSettingsRoutes, { prefix: '/settings' });
  await fastify.register(branchRoutes, { prefix: '/branches' });
  await fastify.register(employeeRoutes, { prefix: '/employees' });

  // ── Product Catalog Management ────────────────────────
  const { categoryRoutes } = await import('../modules/category/category.routes');
  const { brandRoutes } = await import('../modules/brand/brand.routes');
  const { unitRoutes } = await import('../modules/unit/unit.routes');
  const { taxRoutes } = await import('../modules/tax/tax.routes');
  const { productRoutes } = await import('../modules/product/product.routes');

  await fastify.register(categoryRoutes, { prefix: '/categories' });
  await fastify.register(brandRoutes, { prefix: '/brands' });
  await fastify.register(unitRoutes, { prefix: '/units' });
  await fastify.register(taxRoutes, { prefix: '/taxes' });
  await fastify.register(productRoutes, { prefix: '/products' });

  // ── Customer Management ───────────────────────────────────────────────────
  const { customerRoutes } = await import('../modules/customer/customer.routes');
  await fastify.register(customerRoutes, { prefix: '/customers' });

  // ── Supplier Management ───────────────────────────────────────────────────
  const { supplierRoutes } = await import('../modules/supplier/supplier.routes');
  await fastify.register(supplierRoutes, { prefix: '/suppliers' });

  // ── Warehouse & Inventory Foundation ──────────────────────────────────────
  const { warehouseRoutes } = await import('../modules/warehouse/warehouse.routes');
  await fastify.register(warehouseRoutes, { prefix: '/warehouses' });

  const { inventoryRoutes } = await import('../modules/inventory/inventory.routes');
  await fastify.register(inventoryRoutes, { prefix: '/inventory' });

  // ── Stock Operations (B7.2) ───────────────────────────────────────────────
  const { stockMovementRoutes } = await import('../modules/stock-movement/stock-movement.routes');
  await fastify.register(stockMovementRoutes, { prefix: '/stock-movements' });

  const { stockAdjustmentRoutes } =
    await import('../modules/stock-adjustment/stock-adjustment.routes');
  await fastify.register(stockAdjustmentRoutes, { prefix: '/stock-adjustments' });

  const { stockTransferRoutes } = await import('../modules/stock-transfer/stock-transfer.routes');
  await fastify.register(stockTransferRoutes, { prefix: '/stock-transfers' });

  // ── Advanced Inventory (B7.3) ─────────────────────────────────────────────
  const { inventoryLedgerRoutes } =
    await import('../modules/inventory-ledger/inventory-ledger.routes');
  await fastify.register(inventoryLedgerRoutes, { prefix: '/inventory-ledger' });

  const { batchRoutes } = await import('../modules/batch/batch.routes');
  await fastify.register(batchRoutes, { prefix: '/batches' });

  const { serialRoutes } = await import('../modules/serial/serial.routes');
  await fastify.register(serialRoutes, { prefix: '/serials' });

  const { stockAlertRoutes } = await import('../modules/stock-alert/stock-alert.routes');
  await fastify.register(stockAlertRoutes, { prefix: '/stock-alerts' });

  const { stockTakeRoutes } = await import('../modules/stock-take/stock-take.routes');
  await fastify.register(stockTakeRoutes, { prefix: '/stock-takes' });

  const { reconciliationRoutes } = await import('../modules/reconciliation/reconciliation.routes');
  await fastify.register(reconciliationRoutes, { prefix: '/reconciliation' });

  // ── Purchase Order (B8.1) ──────────────────────────────────────────────────
  const { purchaseOrderRoutes } = await import('../modules/purchase-order/purchase-order.routes');
  await fastify.register(purchaseOrderRoutes, { prefix: '/purchase-orders' });

  // ── Goods Receive & Supplier Invoice (B8.2) ─────────────────────────────────
  const { goodsReceiveRoutes } = await import('../modules/goods-receive/goods-receive.routes');
  await fastify.register(goodsReceiveRoutes, { prefix: '/goods-receive' });

  const { supplierInvoiceRoutes } =
    await import('../modules/supplier-invoice/supplier-invoice.routes');
  await fastify.register(supplierInvoiceRoutes, { prefix: '/supplier-invoices' });

  // ── Purchase Return & Supplier Payment (B8.3) ───────────────────────────────
  const { purchaseReturnRoutes } =
    await import('../modules/purchase-return/purchase-return.routes');
  await fastify.register(purchaseReturnRoutes, { prefix: '/purchase-returns' });

  const { supplierPaymentRoutes } =
    await import('../modules/supplier-payment/supplier-payment.routes');
  await fastify.register(supplierPaymentRoutes, { prefix: '/supplier-payments' });

  // ── POS Core & Cart System (B9.1) ───────────────────────────────────────────
  const { posRoutes } = await import('../modules/pos/pos.routes');
  await fastify.register(posRoutes, { prefix: '/pos' });

  const { cartRoutes } = await import('../modules/cart/cart.routes');
  await fastify.register(cartRoutes, { prefix: '/pos/cart' });

  // ── POS Checkout, Payment & Invoice (B9.2) ──────────────────────────────────
  const { salesRoutes } = await import('../modules/sales/sales.routes');
  await fastify.register(salesRoutes);

  const { paymentRoutes } = await import('../modules/payment/payment.routes');
  await fastify.register(paymentRoutes, { prefix: '/payments' });

  const { invoiceRoutes } = await import('../modules/invoice/invoice.routes');
  await fastify.register(invoiceRoutes, { prefix: '/invoices' });

  // ── POS Sales Return, Refund & Customer Due (B9.3) ──────────────────────────
  const { salesReturnRoutes } = await import('../modules/sales-return/sales-return.routes');
  await fastify.register(salesReturnRoutes, { prefix: '/sales-returns' });

  const { refundRoutes } = await import('../modules/refund/refund.routes');
  await fastify.register(refundRoutes, { prefix: '/refunds' });

  // ── Accounting Foundation (B10.1) ──────────────────────────────────────────
  const { accountRoutes } = await import('../modules/account/account.routes');
  await fastify.register(accountRoutes);

  const { journalRoutes } = await import('../modules/journal/journal.routes');
  await fastify.register(journalRoutes, { prefix: '/journals' });

  // ── Income & Expense Management (B10.2) ────────────────────────────────────
  const { expenseRoutes } = await import('../modules/expense/expense.routes');
  await fastify.register(expenseRoutes);

  const { incomeRoutes } = await import('../modules/income/income.routes');
  await fastify.register(incomeRoutes);

  // ── Financial Transactions & Reports (B10.3) ────────────────────────────────
  const { transactionRoutes } = await import('../modules/financial-transaction/transaction.routes');
  await fastify.register(transactionRoutes);

  // ── Dashboard Analytics System (B11.1) ──────────────────────────────────────
  const { dashboardRoutes } = await import('../modules/dashboard/dashboard.routes');
  await fastify.register(dashboardRoutes, { prefix: '/dashboard' });

  // ── Sales & Purchase Reporting System (B11.2) ───────────────────────────────
  const { reportsRoutes } = await import('../modules/reports/reports.routes');
  await fastify.register(reportsRoutes, { prefix: '/reports' });

  // ── Enterprise Notification System (B12.1) ──────────────────────────────────
  const { notificationRoutes } = await import('../modules/notification/notification.routes');
  await fastify.register(notificationRoutes, { prefix: '/notifications' });

  const { notificationPreferenceRoutes } =
    await import('../modules/notification-preference/notification-preference.routes');
  await fastify.register(notificationPreferenceRoutes, { prefix: '/notification-preferences' });

  // ── Audit Log & Activity Tracking (B12.2) ────────────────────────────────────
  const { auditRoutes } = await import('../modules/audit/audit.routes');
  await fastify.register(auditRoutes, { prefix: '/' });

  const { loginHistoryRoutes } = await import('../modules/login-history/login-history.routes');
  await fastify.register(loginHistoryRoutes, { prefix: '/' });

  const { sessionHistoryRoutes } =
    await import('../modules/session-history/session-history.routes');
  await fastify.register(sessionHistoryRoutes, { prefix: '/' });
}
