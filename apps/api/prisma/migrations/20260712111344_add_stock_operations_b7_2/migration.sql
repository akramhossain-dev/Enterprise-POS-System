-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('OPENING_STOCK', 'PURCHASE', 'PURCHASE_RETURN', 'SALE', 'SALE_RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRED', 'LOST', 'MANUAL');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('INCREASE', 'DECREASE', 'DAMAGE', 'EXPIRED', 'LOST');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "warehouse_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "movement_type" "MovementType" NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "previous_quantity" DECIMAL(15,4) NOT NULL,
    "new_quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,4),
    "remarks" TEXT,
    "performed_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "remarks" TEXT,
    "approved_by" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "from_warehouse_id" UUID NOT NULL,
    "to_warehouse_id" UUID NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_items" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "stock_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_movements_company_id_idx" ON "stock_movements"("company_id");

-- CreateIndex
CREATE INDEX "stock_movements_warehouse_id_idx" ON "stock_movements"("warehouse_id");

-- CreateIndex
CREATE INDEX "stock_movements_product_id_idx" ON "stock_movements"("product_id");

-- CreateIndex
CREATE INDEX "stock_movements_movement_type_idx" ON "stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "stock_movements_reference_type_reference_id_idx" ON "stock_movements"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "stock_movements_performed_by_idx" ON "stock_movements"("performed_by");

-- CreateIndex
CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements"("created_at");

-- CreateIndex
CREATE INDEX "stock_adjustments_company_id_idx" ON "stock_adjustments"("company_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_warehouse_id_idx" ON "stock_adjustments"("warehouse_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_product_id_idx" ON "stock_adjustments"("product_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_type_idx" ON "stock_adjustments"("type");

-- CreateIndex
CREATE INDEX "stock_adjustments_created_by_idx" ON "stock_adjustments"("created_by");

-- CreateIndex
CREATE INDEX "stock_adjustments_created_at_idx" ON "stock_adjustments"("created_at");

-- CreateIndex
CREATE INDEX "stock_transfers_company_id_idx" ON "stock_transfers"("company_id");

-- CreateIndex
CREATE INDEX "stock_transfers_from_warehouse_id_idx" ON "stock_transfers"("from_warehouse_id");

-- CreateIndex
CREATE INDEX "stock_transfers_to_warehouse_id_idx" ON "stock_transfers"("to_warehouse_id");

-- CreateIndex
CREATE INDEX "stock_transfers_status_idx" ON "stock_transfers"("status");

-- CreateIndex
CREATE INDEX "stock_transfers_created_by_idx" ON "stock_transfers"("created_by");

-- CreateIndex
CREATE INDEX "stock_transfer_items_transfer_id_idx" ON "stock_transfer_items"("transfer_id");

-- CreateIndex
CREATE INDEX "stock_transfer_items_product_id_idx" ON "stock_transfer_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfer_items_transfer_id_product_id_key" ON "stock_transfer_items"("transfer_id", "product_id");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
