/*
  Warnings:

  - You are about to drop the column `customers` on the `branches` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "customers";

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "supplier_code" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(200),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "alternative_phone" VARCHAR(50),
    "website" VARCHAR(255),
    "tax_number" VARCHAR(100),
    "credit_limit" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "opening_balance" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "current_balance" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_addresses" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "area" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "address_line1" VARCHAR(255) NOT NULL,
    "address_line2" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplier_code_key" ON "suppliers"("supplier_code");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_email_key" ON "suppliers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_phone_key" ON "suppliers"("phone");

-- CreateIndex
CREATE INDEX "suppliers_supplier_code_idx" ON "suppliers"("supplier_code");

-- CreateIndex
CREATE INDEX "suppliers_company_name_idx" ON "suppliers"("company_name");

-- CreateIndex
CREATE INDEX "suppliers_phone_idx" ON "suppliers"("phone");

-- CreateIndex
CREATE INDEX "suppliers_email_idx" ON "suppliers"("email");

-- CreateIndex
CREATE INDEX "suppliers_company_id_idx" ON "suppliers"("company_id");

-- CreateIndex
CREATE INDEX "supplier_addresses_supplier_id_idx" ON "supplier_addresses"("supplier_id");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_customers_branch" RENAME TO "customers_branch_id_idx";

-- RenameIndex
ALTER INDEX "idx_customers_code" RENAME TO "customers_customer_code_idx";

-- RenameIndex
ALTER INDEX "idx_customers_company" RENAME TO "customers_company_id_idx";

-- RenameIndex
ALTER INDEX "idx_customers_email" RENAME TO "customers_email_idx";

-- RenameIndex
ALTER INDEX "idx_customers_full_name" RENAME TO "customers_full_name_idx";

-- RenameIndex
ALTER INDEX "idx_customers_phone" RENAME TO "customers_phone_idx";
