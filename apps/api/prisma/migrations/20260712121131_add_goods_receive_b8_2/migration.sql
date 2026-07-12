-- CreateEnum
CREATE TYPE "GoodsReceiveStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierInvoiceStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "goods_receives" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "warehouse_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "purchase_order_id" UUID,
    "grn_number" VARCHAR(100) NOT NULL,
    "receive_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GoodsReceiveStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(15,4) NOT NULL,
    "discount" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "tax" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15,4) NOT NULL,
    "remarks" TEXT,
    "received_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "goods_receives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receive_items" (
    "id" UUID NOT NULL,
    "goods_receive_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "received_quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,4) NOT NULL,
    "batch_number" VARCHAR(100),
    "expiry_date" DATE,
    "serial_required" BOOLEAN NOT NULL DEFAULT false,
    "total" DECIMAL(15,4) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receive_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" UUID NOT NULL,
    "goods_receive_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "subtotal" DECIMAL(15,4) NOT NULL,
    "tax" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15,4) NOT NULL,
    "status" "SupplierInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goods_receives_company_id_idx" ON "goods_receives"("company_id");

-- CreateIndex
CREATE INDEX "goods_receives_branch_id_idx" ON "goods_receives"("branch_id");

-- CreateIndex
CREATE INDEX "goods_receives_warehouse_id_idx" ON "goods_receives"("warehouse_id");

-- CreateIndex
CREATE INDEX "goods_receives_supplier_id_idx" ON "goods_receives"("supplier_id");

-- CreateIndex
CREATE INDEX "goods_receives_purchase_order_id_idx" ON "goods_receives"("purchase_order_id");

-- CreateIndex
CREATE INDEX "goods_receives_status_idx" ON "goods_receives"("status");

-- CreateIndex
CREATE INDEX "goods_receives_receive_date_idx" ON "goods_receives"("receive_date");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receives_company_id_grn_number_key" ON "goods_receives"("company_id", "grn_number");

-- CreateIndex
CREATE INDEX "goods_receive_items_goods_receive_id_idx" ON "goods_receive_items"("goods_receive_id");

-- CreateIndex
CREATE INDEX "goods_receive_items_product_id_idx" ON "goods_receive_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_goods_receive_id_key" ON "supplier_invoices"("goods_receive_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_goods_receive_id_idx" ON "supplier_invoices"("goods_receive_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_supplier_id_idx" ON "supplier_invoices"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_status_idx" ON "supplier_invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_supplier_id_invoice_number_key" ON "supplier_invoices"("supplier_id", "invoice_number");

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_goods_receive_id_fkey" FOREIGN KEY ("goods_receive_id") REFERENCES "goods_receives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_goods_receive_id_fkey" FOREIGN KEY ("goods_receive_id") REFERENCES "goods_receives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
