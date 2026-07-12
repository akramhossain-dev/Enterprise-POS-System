-- CreateEnum
CREATE TYPE "ReceiptType" AS ENUM ('CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT', 'ADVANCE_RECEIVE', 'ADVANCE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('RECEIPT', 'PAYMENT', 'CONTRA', 'JOURNAL');

-- CreateTable
CREATE TABLE "payment_receipts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "customer_id" UUID,
    "supplier_id" UUID,
    "account_id" UUID NOT NULL,
    "receipt_number" VARCHAR(100) NOT NULL,
    "type" "ReceiptType" NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" VARCHAR(100),
    "description" TEXT,
    "date" TIMESTAMPTZ NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_vouchers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "voucher_number" VARCHAR(100) NOT NULL,
    "type" "VoucherType" NOT NULL,
    "account_id" UUID NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "description" TEXT,
    "date" TIMESTAMPTZ NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_receipts_company_id_idx" ON "payment_receipts"("company_id");

-- CreateIndex
CREATE INDEX "payment_receipts_customer_id_idx" ON "payment_receipts"("customer_id");

-- CreateIndex
CREATE INDEX "payment_receipts_supplier_id_idx" ON "payment_receipts"("supplier_id");

-- CreateIndex
CREATE INDEX "payment_receipts_account_id_idx" ON "payment_receipts"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_receipts_company_id_receipt_number_key" ON "payment_receipts"("company_id", "receipt_number");

-- CreateIndex
CREATE INDEX "payment_vouchers_company_id_idx" ON "payment_vouchers"("company_id");

-- CreateIndex
CREATE INDEX "payment_vouchers_account_id_idx" ON "payment_vouchers"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_vouchers_company_id_voucher_number_key" ON "payment_vouchers"("company_id", "voucher_number");

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_receipts" ADD CONSTRAINT "payment_receipts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_vouchers" ADD CONSTRAINT "payment_vouchers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
