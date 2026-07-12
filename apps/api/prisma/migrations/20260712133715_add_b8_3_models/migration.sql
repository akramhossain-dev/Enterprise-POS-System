-- CreateEnum
CREATE TYPE "PurchaseReturnStatus" AS ENUM ('DRAFT', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK', 'CARD', 'MOBILE_BANKING', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplierLedgerEntryType" AS ENUM ('PURCHASE', 'PURCHASE_RETURN', 'PAYMENT');

-- CreateTable
CREATE TABLE "purchase_returns" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "warehouse_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "goods_receive_id" UUID NOT NULL,
    "return_number" VARCHAR(100) NOT NULL,
    "return_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PurchaseReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(15,4) NOT NULL,
    "tax" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(15,4) NOT NULL,
    "reason" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_return_items" (
    "id" UUID NOT NULL,
    "purchase_return_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,4) NOT NULL,
    "total" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "payment_number" VARCHAR(100) NOT NULL,
    "payment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(15,4) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(255),
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_ledger_entries" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "entry_type" "SupplierLedgerEntryType" NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "running_balance" DECIMAL(15,4) NOT NULL,
    "reference_id" UUID NOT NULL,
    "reference_no" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_returns_company_id_idx" ON "purchase_returns"("company_id");

-- CreateIndex
CREATE INDEX "purchase_returns_branch_id_idx" ON "purchase_returns"("branch_id");

-- CreateIndex
CREATE INDEX "purchase_returns_warehouse_id_idx" ON "purchase_returns"("warehouse_id");

-- CreateIndex
CREATE INDEX "purchase_returns_supplier_id_idx" ON "purchase_returns"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_returns_goods_receive_id_idx" ON "purchase_returns"("goods_receive_id");

-- CreateIndex
CREATE INDEX "purchase_returns_status_idx" ON "purchase_returns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_returns_company_id_return_number_key" ON "purchase_returns"("company_id", "return_number");

-- CreateIndex
CREATE INDEX "purchase_return_items_purchase_return_id_idx" ON "purchase_return_items"("purchase_return_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_product_id_idx" ON "purchase_return_items"("product_id");

-- CreateIndex
CREATE INDEX "supplier_payments_company_id_idx" ON "supplier_payments"("company_id");

-- CreateIndex
CREATE INDEX "supplier_payments_supplier_id_idx" ON "supplier_payments"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_payments_company_id_payment_number_key" ON "supplier_payments"("company_id", "payment_number");

-- CreateIndex
CREATE INDEX "supplier_ledger_entries_company_id_idx" ON "supplier_ledger_entries"("company_id");

-- CreateIndex
CREATE INDEX "supplier_ledger_entries_supplier_id_idx" ON "supplier_ledger_entries"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_ledger_entries_created_at_idx" ON "supplier_ledger_entries"("created_at");

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_goods_receive_id_fkey" FOREIGN KEY ("goods_receive_id") REFERENCES "goods_receives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_return_id_fkey" FOREIGN KEY ("purchase_return_id") REFERENCES "purchase_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ledger_entries" ADD CONSTRAINT "supplier_ledger_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_ledger_entries" ADD CONSTRAINT "supplier_ledger_entries_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
