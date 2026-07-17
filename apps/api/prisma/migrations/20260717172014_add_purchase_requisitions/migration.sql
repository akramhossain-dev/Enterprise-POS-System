/*
  Warnings:

  - The `refresh_token_id` column on the `user_sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `login_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LoginStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PurchaseRequisitionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "PurchaseRequisitionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "icon" VARCHAR(100),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "parent_id" UUID,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_title" VARCHAR(255),
ADD COLUMN     "slug" VARCHAR(255);

-- AlterTable
ALTER TABLE "login_histories" DROP COLUMN "status",
ADD COLUMN     "status" "LoginStatus" NOT NULL;

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "base_unit_id" UUID,
ADD COLUMN     "conversion_ratio" DECIMAL(12,4) DEFAULT 1.0,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "refresh_token_id",
ADD COLUMN     "refresh_token_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_token" VARCHAR(255),
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_reset_expires" TIMESTAMPTZ,
ADD COLUMN     "password_reset_token" VARCHAR(255),
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" VARCHAR(255),
ADD COLUMN     "two_factor_temp_token" VARCHAR(255);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "department_id" UUID NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_locations" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone" VARCHAR(100) NOT NULL,
    "rack" VARCHAR(100) NOT NULL,
    "shelf" VARCHAR(100) NOT NULL,
    "bin" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "storage_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisitions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "requestedBy" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "required_date" DATE NOT NULL,
    "priority" "PurchaseRequisitionPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "PurchaseRequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "supplier_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "subtotal" DECIMAL(15,4) NOT NULL,
    "notes" TEXT,
    "converted_po_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisition_items" (
    "id" UUID NOT NULL,
    "purchase_requisition_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,4) NOT NULL,
    "subtotal" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "purchase_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_credit_notes" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "credit_note_number" VARCHAR(100) NOT NULL,
    "supplier_id" UUID NOT NULL,
    "reference_return_id" UUID,
    "reference_return_number" VARCHAR(100),
    "credit_amount" DECIMAL(15,4) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    "issue_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_debit_notes" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "debit_note_number" VARCHAR(100) NOT NULL,
    "supplier_id" UUID NOT NULL,
    "reference_return_id" UUID,
    "reference_return_number" VARCHAR(100),
    "amount" DECIMAL(15,4) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    "issue_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_debit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_company_id_idx" ON "departments"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_company_id_name_key" ON "departments"("company_id", "name");

-- CreateIndex
CREATE INDEX "designations_company_id_idx" ON "designations"("company_id");

-- CreateIndex
CREATE INDEX "designations_department_id_idx" ON "designations"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "designations_company_id_name_key" ON "designations"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_locations_barcode_key" ON "storage_locations"("barcode");

-- CreateIndex
CREATE INDEX "storage_locations_company_id_idx" ON "storage_locations"("company_id");

-- CreateIndex
CREATE INDEX "storage_locations_warehouse_id_idx" ON "storage_locations"("warehouse_id");

-- CreateIndex
CREATE INDEX "purchase_requisitions_company_id_idx" ON "purchase_requisitions"("company_id");

-- CreateIndex
CREATE INDEX "purchase_requisitions_supplier_id_idx" ON "purchase_requisitions"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_requisitions_warehouse_id_idx" ON "purchase_requisitions"("warehouse_id");

-- CreateIndex
CREATE INDEX "purchase_requisition_items_purchase_requisition_id_idx" ON "purchase_requisition_items"("purchase_requisition_id");

-- CreateIndex
CREATE INDEX "purchase_requisition_items_product_id_idx" ON "purchase_requisition_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_credit_notes_credit_note_number_key" ON "supplier_credit_notes"("credit_note_number");

-- CreateIndex
CREATE INDEX "supplier_credit_notes_company_id_idx" ON "supplier_credit_notes"("company_id");

-- CreateIndex
CREATE INDEX "supplier_credit_notes_supplier_id_idx" ON "supplier_credit_notes"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_debit_notes_debit_note_number_key" ON "supplier_debit_notes"("debit_note_number");

-- CreateIndex
CREATE INDEX "supplier_debit_notes_company_id_idx" ON "supplier_debit_notes"("company_id");

-- CreateIndex
CREATE INDEX "supplier_debit_notes_supplier_id_idx" ON "supplier_debit_notes"("supplier_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_base_unit_id_fkey" FOREIGN KEY ("base_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_refresh_token_id_fkey" FOREIGN KEY ("refresh_token_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_purchase_requisition_id_fkey" FOREIGN KEY ("purchase_requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_credit_notes" ADD CONSTRAINT "supplier_credit_notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_credit_notes" ADD CONSTRAINT "supplier_credit_notes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_debit_notes" ADD CONSTRAINT "supplier_debit_notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_debit_notes" ADD CONSTRAINT "supplier_debit_notes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
