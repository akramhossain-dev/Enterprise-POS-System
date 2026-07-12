-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "company_id" UUID,
    "category" VARCHAR(50) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_company_id_key_key" ON "system_settings"("company_id", "key");

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
