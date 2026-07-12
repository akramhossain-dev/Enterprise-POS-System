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

  /**
   * GET /health
   * Health check endpoint — used by Docker, Nginx, and monitoring tools.
   */
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Returns the current health status of the API server.',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV ?? 'unknown',
      });
    },
  );

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
  const { settingsRoutes } = await import('../modules/settings/settings.routes');
  const { branchRoutes } = await import('../modules/branch/branch.routes');
  const { employeeRoutes } = await import('../modules/employee/employee.routes');

  await fastify.register(companyRoutes, { prefix: '/companies' });
  await fastify.register(settingsRoutes, { prefix: '/companies' }); // nested: /companies/:companyId/settings
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
}
