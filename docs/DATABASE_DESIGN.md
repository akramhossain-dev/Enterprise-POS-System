# Enterprise POS System — Database Design

> **Version:** 1.0.0  
> **Status:** Phase 0 — Documentation & Planning  
> **Last Updated:** 2026-07-11

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Authentication Domain](#2-authentication-domain)
3. [Business Domain](#3-business-domain)
4. [Catalog Domain](#4-catalog-domain)
5. [Inventory Domain](#5-inventory-domain)
6. [Sales Domain](#6-sales-domain)
7. [Purchase Domain](#7-purchase-domain)
8. [Customer Domain](#8-customer-domain)
9. [Supplier Domain](#9-supplier-domain)
10. [Accounting Domain](#10-accounting-domain)
11. [System Domain](#11-system-domain)
12. [Entity Relationship Overview](#12-entity-relationship-overview)
13. [Data Flow Summary](#13-data-flow-summary)

---

## 1. Design Principles

| Principle                 | Implementation                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **Normalization**         | Tables are normalized to 3NF to eliminate data redundancy                                |
| **Referential Integrity** | All foreign keys are enforced at the database level                                      |
| **Soft Delete**           | Business entities use `deleted_at` timestamp instead of hard deletion                    |
| **Audit Timestamps**      | Every table includes `created_at` and `updated_at` fields                                |
| **Multi-Tenancy Ready**   | Business entities include `company_id` for future tenant isolation                       |
| **Immutability**          | Financial records (invoices, payments) are never updated; corrections create new records |
| **UUID Primary Keys**     | All tables use UUID v4 as primary key for distributed-safe identifiers                   |
| **Enum Types**            | Status and type fields use PostgreSQL native enums for type safety                       |

---

## 2. Authentication Domain

### Table: `users`

| Column          | Type         | Constraints      | Description                  |
| --------------- | ------------ | ---------------- | ---------------------------- |
| `id`            | UUID         | PK, NOT NULL     | Unique user identifier       |
| `email`         | VARCHAR(255) | UNIQUE, NOT NULL | Login email address          |
| `password_hash` | VARCHAR(255) | NOT NULL         | Bcrypt hashed password       |
| `first_name`    | VARCHAR(100) | NOT NULL         | User's first name            |
| `last_name`     | VARCHAR(100) | NOT NULL         | User's last name             |
| `avatar_url`    | TEXT         | NULL             | Profile image URL            |
| `is_active`     | BOOLEAN      | DEFAULT true     | Account active status        |
| `is_verified`   | BOOLEAN      | DEFAULT false    | Email verification status    |
| `last_login_at` | TIMESTAMPTZ  | NULL             | Most recent successful login |
| `created_at`    | TIMESTAMPTZ  | NOT NULL         | Record creation timestamp    |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL         | Last modification timestamp  |
| `deleted_at`    | TIMESTAMPTZ  | NULL             | Soft delete timestamp        |

---

### Table: `roles`

| Column        | Type         | Constraints      | Description                        |
| ------------- | ------------ | ---------------- | ---------------------------------- |
| `id`          | UUID         | PK, NOT NULL     | Unique role identifier             |
| `name`        | VARCHAR(100) | UNIQUE, NOT NULL | Role name (e.g., Manager, Cashier) |
| `description` | TEXT         | NULL             | Role description                   |
| `is_system`   | BOOLEAN      | DEFAULT false    | System roles cannot be deleted     |
| `created_at`  | TIMESTAMPTZ  | NOT NULL         | Creation timestamp                 |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL         | Last modified timestamp            |

---

### Table: `permissions`

| Column        | Type         | Constraints      | Description                                  |
| ------------- | ------------ | ---------------- | -------------------------------------------- |
| `id`          | UUID         | PK, NOT NULL     | Unique permission identifier                 |
| `module`      | VARCHAR(100) | NOT NULL         | Module name (e.g., inventory, sales)         |
| `action`      | VARCHAR(50)  | NOT NULL         | Action (create, read, update, delete)        |
| `name`        | VARCHAR(150) | UNIQUE, NOT NULL | Full permission key (e.g., inventory.create) |
| `description` | TEXT         | NULL             | Human-readable permission description        |

---

### Table: `role_permissions`

| Column          | Type | Constraints         | Description             |
| --------------- | ---- | ------------------- | ----------------------- |
| `role_id`       | UUID | FK → roles.id       | Reference to role       |
| `permission_id` | UUID | FK → permissions.id | Reference to permission |

**Composite PK**: (`role_id`, `permission_id`)

---

### Table: `user_roles`

| Column    | Type | Constraints   | Description       |
| --------- | ---- | ------------- | ----------------- |
| `user_id` | UUID | FK → users.id | Reference to user |
| `role_id` | UUID | FK → roles.id | Reference to role |

**Composite PK**: (`user_id`, `role_id`)

---

### Table: `refresh_tokens`

| Column       | Type         | Constraints   | Description                   |
| ------------ | ------------ | ------------- | ----------------------------- |
| `id`         | UUID         | PK, NOT NULL  | Token identifier              |
| `user_id`    | UUID         | FK → users.id | Owning user                   |
| `token_hash` | VARCHAR(255) | NOT NULL      | Hashed refresh token          |
| `expires_at` | TIMESTAMPTZ  | NOT NULL      | Token expiry time             |
| `is_revoked` | BOOLEAN      | DEFAULT false | Revocation status             |
| `ip_address` | INET         | NULL          | IP address of issuing request |
| `user_agent` | TEXT         | NULL          | Client user agent             |
| `created_at` | TIMESTAMPTZ  | NOT NULL      | Issuance timestamp            |

---

## 3. Business Domain

### Table: `companies`

| Column              | Type         | Constraints   | Description             |
| ------------------- | ------------ | ------------- | ----------------------- |
| `id`                | UUID         | PK, NOT NULL  | Company identifier      |
| `name`              | VARCHAR(255) | NOT NULL      | Company legal name      |
| `logo_url`          | TEXT         | NULL          | Company logo URL        |
| `address`           | TEXT         | NULL          | Registered address      |
| `phone`             | VARCHAR(50)  | NULL          | Contact phone           |
| `email`             | VARCHAR(255) | NULL          | Contact email           |
| `tax_number`        | VARCHAR(100) | NULL          | Tax registration number |
| `currency`          | VARCHAR(10)  | DEFAULT 'USD' | Default currency code   |
| `fiscal_year_start` | DATE         | NULL          | Fiscal year start date  |
| `created_at`        | TIMESTAMPTZ  | NOT NULL      | Creation timestamp      |
| `updated_at`        | TIMESTAMPTZ  | NOT NULL      | Last modified timestamp |

---

### Table: `branches`

| Column       | Type         | Constraints       | Description             |
| ------------ | ------------ | ----------------- | ----------------------- |
| `id`         | UUID         | PK, NOT NULL      | Branch identifier       |
| `company_id` | UUID         | FK → companies.id | Owning company          |
| `name`       | VARCHAR(255) | NOT NULL          | Branch name             |
| `address`    | TEXT         | NULL              | Branch address          |
| `phone`      | VARCHAR(50)  | NULL              | Branch phone            |
| `email`      | VARCHAR(255) | NULL              | Branch email            |
| `is_active`  | BOOLEAN      | DEFAULT true      | Active status           |
| `created_at` | TIMESTAMPTZ  | NOT NULL          | Creation timestamp      |
| `updated_at` | TIMESTAMPTZ  | NOT NULL          | Last modified timestamp |

---

### Table: `employees`

| Column       | Type         | Constraints         | Description                    |
| ------------ | ------------ | ------------------- | ------------------------------ |
| `id`         | UUID         | PK, NOT NULL        | Employee identifier            |
| `user_id`    | UUID         | FK → users.id, NULL | Linked user account            |
| `branch_id`  | UUID         | FK → branches.id    | Assigned branch                |
| `company_id` | UUID         | FK → companies.id   | Owning company                 |
| `first_name` | VARCHAR(100) | NOT NULL            | First name                     |
| `last_name`  | VARCHAR(100) | NOT NULL            | Last name                      |
| `phone`      | VARCHAR(50)  | NULL                | Contact phone                  |
| `email`      | VARCHAR(255) | NULL                | Employee email                 |
| `hire_date`  | DATE         | NULL                | Employment start date          |
| `status`     | ENUM         | NOT NULL            | active / inactive / terminated |
| `created_at` | TIMESTAMPTZ  | NOT NULL            | Creation timestamp             |
| `updated_at` | TIMESTAMPTZ  | NOT NULL            | Last modified timestamp        |
| `deleted_at` | TIMESTAMPTZ  | NULL                | Soft delete timestamp          |

---

## 4. Catalog Domain

### Table: `categories`

| Column       | Type         | Constraints              | Description                        |
| ------------ | ------------ | ------------------------ | ---------------------------------- |
| `id`         | UUID         | PK                       | Category identifier                |
| `company_id` | UUID         | FK → companies.id        | Owning company                     |
| `parent_id`  | UUID         | FK → categories.id, NULL | Parent category (self-referential) |
| `name`       | VARCHAR(255) | NOT NULL                 | Category name                      |
| `slug`       | VARCHAR(255) | UNIQUE                   | URL-safe identifier                |
| `image_url`  | TEXT         | NULL                     | Category image                     |
| `sort_order` | INTEGER      | DEFAULT 0                | Display sort order                 |
| `created_at` | TIMESTAMPTZ  | NOT NULL                 | Creation timestamp                 |
| `updated_at` | TIMESTAMPTZ  | NOT NULL                 | Last modified timestamp            |

---

### Table: `brands`

| Column       | Type         | Constraints       | Description             |
| ------------ | ------------ | ----------------- | ----------------------- |
| `id`         | UUID         | PK                | Brand identifier        |
| `company_id` | UUID         | FK → companies.id | Owning company          |
| `name`       | VARCHAR(255) | NOT NULL          | Brand name              |
| `logo_url`   | TEXT         | NULL              | Brand logo              |
| `created_at` | TIMESTAMPTZ  | NOT NULL          | Creation timestamp      |
| `updated_at` | TIMESTAMPTZ  | NOT NULL          | Last modified timestamp |

---

### Table: `units`

| Column         | Type         | Constraints       | Description                |
| -------------- | ------------ | ----------------- | -------------------------- |
| `id`           | UUID         | PK                | Unit identifier            |
| `company_id`   | UUID         | FK → companies.id | Owning company             |
| `name`         | VARCHAR(100) | NOT NULL          | Unit name (e.g., Kilogram) |
| `abbreviation` | VARCHAR(20)  | NOT NULL          | Short form (e.g., kg)      |

---

### Table: `taxes`

| Column         | Type         | Constraints       | Description                      |
| -------------- | ------------ | ----------------- | -------------------------------- |
| `id`           | UUID         | PK                | Tax identifier                   |
| `company_id`   | UUID         | FK → companies.id | Owning company                   |
| `name`         | VARCHAR(100) | NOT NULL          | Tax name (e.g., VAT 15%)         |
| `rate`         | DECIMAL(6,4) | NOT NULL          | Tax rate as decimal (0.15 = 15%) |
| `is_inclusive` | BOOLEAN      | DEFAULT false     | Price-inclusive tax flag         |
| `is_active`    | BOOLEAN      | DEFAULT true      | Active status                    |

---

### Table: `products`

| Column            | Type          | Constraints              | Description                      |
| ----------------- | ------------- | ------------------------ | -------------------------------- |
| `id`              | UUID          | PK                       | Product identifier               |
| `company_id`      | UUID          | FK → companies.id        | Owning company                   |
| `category_id`     | UUID          | FK → categories.id, NULL | Product category                 |
| `brand_id`        | UUID          | FK → brands.id, NULL     | Product brand                    |
| `unit_id`         | UUID          | FK → units.id            | Unit of measure                  |
| `tax_id`          | UUID          | FK → taxes.id, NULL      | Applicable tax                   |
| `name`            | VARCHAR(255)  | NOT NULL                 | Product name                     |
| `sku`             | VARCHAR(100)  | UNIQUE                   | Stock keeping unit               |
| `description`     | TEXT          | NULL                     | Product description              |
| `cost_price`      | DECIMAL(12,4) | NOT NULL                 | Purchase cost                    |
| `selling_price`   | DECIMAL(12,4) | NOT NULL                 | Retail selling price             |
| `wholesale_price` | DECIMAL(12,4) | NULL                     | Wholesale price                  |
| `reorder_level`   | DECIMAL(12,4) | DEFAULT 0                | Low stock threshold              |
| `image_url`       | TEXT          | NULL                     | Primary product image            |
| `status`          | ENUM          | NOT NULL                 | active / inactive / discontinued |
| `created_at`      | TIMESTAMPTZ   | NOT NULL                 | Creation timestamp               |
| `updated_at`      | TIMESTAMPTZ   | NOT NULL                 | Last modified timestamp          |
| `deleted_at`      | TIMESTAMPTZ   | NULL                     | Soft delete timestamp            |

---

### Table: `barcodes`

| Column       | Type         | Constraints      | Description                   |
| ------------ | ------------ | ---------------- | ----------------------------- |
| `id`         | UUID         | PK               | Barcode record identifier     |
| `product_id` | UUID         | FK → products.id | Associated product            |
| `barcode`    | VARCHAR(100) | UNIQUE           | Barcode value                 |
| `type`       | ENUM         | NOT NULL         | EAN13 / CODE128 / QR / CUSTOM |
| `is_primary` | BOOLEAN      | DEFAULT false    | Primary barcode flag          |

---

## 5. Inventory Domain

### Table: `warehouses`

| Column       | Type         | Constraints       | Description          |
| ------------ | ------------ | ----------------- | -------------------- |
| `id`         | UUID         | PK                | Warehouse identifier |
| `branch_id`  | UUID         | FK → branches.id  | Assigned branch      |
| `company_id` | UUID         | FK → companies.id | Owning company       |
| `name`       | VARCHAR(255) | NOT NULL          | Warehouse name       |
| `address`    | TEXT         | NULL              | Physical location    |
| `is_active`  | BOOLEAN      | DEFAULT true      | Active status        |

---

### Table: `stock`

| Column         | Type          | Constraints         | Description              |
| -------------- | ------------- | ------------------- | ------------------------ |
| `id`           | UUID          | PK                  | Stock record identifier  |
| `product_id`   | UUID          | FK → products.id    | Product reference        |
| `warehouse_id` | UUID          | FK → warehouses.id  | Warehouse location       |
| `quantity`     | DECIMAL(12,4) | NOT NULL, DEFAULT 0 | Current quantity on hand |
| `updated_at`   | TIMESTAMPTZ   | NOT NULL            | Last stock update time   |

**Unique Constraint**: (`product_id`, `warehouse_id`)

---

### Table: `stock_movements`

| Column           | Type          | Constraints        | Description                                                        |
| ---------------- | ------------- | ------------------ | ------------------------------------------------------------------ |
| `id`             | UUID          | PK                 | Movement identifier                                                |
| `product_id`     | UUID          | FK → products.id   | Product reference                                                  |
| `warehouse_id`   | UUID          | FK → warehouses.id | Warehouse reference                                                |
| `type`           | ENUM          | NOT NULL           | sale / purchase / adjustment / transfer_in / transfer_out / return |
| `quantity`       | DECIMAL(12,4) | NOT NULL           | Quantity changed (positive or negative)                            |
| `reference_type` | VARCHAR(50)   | NULL               | Type of source document (sale, purchase, etc.)                     |
| `reference_id`   | UUID          | NULL               | ID of source document                                              |
| `note`           | TEXT          | NULL               | Movement note                                                      |
| `performed_by`   | UUID          | FK → users.id      | User who triggered movement                                        |
| `created_at`     | TIMESTAMPTZ   | NOT NULL           | Movement timestamp                                                 |

---

### Table: `stock_transfers`

| Column              | Type        | Constraints         | Description                                 |
| ------------------- | ----------- | ------------------- | ------------------------------------------- |
| `id`                | UUID        | PK                  | Transfer identifier                         |
| `from_warehouse_id` | UUID        | FK → warehouses.id  | Source warehouse                            |
| `to_warehouse_id`   | UUID        | FK → warehouses.id  | Destination warehouse                       |
| `status`            | ENUM        | NOT NULL            | pending / dispatched / received / cancelled |
| `requested_by`      | UUID        | FK → users.id       | Requesting user                             |
| `approved_by`       | UUID        | FK → users.id, NULL | Approving user                              |
| `note`              | TEXT        | NULL                | Transfer notes                              |
| `created_at`        | TIMESTAMPTZ | NOT NULL            | Creation timestamp                          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL            | Last modified timestamp                     |

---

### Table: `stock_transfer_items`

| Column              | Type          | Constraints             | Description                |
| ------------------- | ------------- | ----------------------- | -------------------------- |
| `id`                | UUID          | PK                      | Line item identifier       |
| `transfer_id`       | UUID          | FK → stock_transfers.id | Parent transfer            |
| `product_id`        | UUID          | FK → products.id        | Product reference          |
| `quantity`          | DECIMAL(12,4) | NOT NULL                | Quantity to transfer       |
| `received_quantity` | DECIMAL(12,4) | DEFAULT 0               | Quantity actually received |

---

## 6. Sales Domain

### Table: `sales`

| Column            | Type          | Constraints             | Description                   |
| ----------------- | ------------- | ----------------------- | ----------------------------- |
| `id`              | UUID          | PK                      | Sale identifier               |
| `branch_id`       | UUID          | FK → branches.id        | Selling branch                |
| `customer_id`     | UUID          | FK → customers.id, NULL | Associated customer           |
| `user_id`         | UUID          | FK → users.id           | Cashier/user                  |
| `sale_number`     | VARCHAR(50)   | UNIQUE, NOT NULL        | Human-readable sale reference |
| `subtotal`        | DECIMAL(14,4) | NOT NULL                | Pre-tax, pre-discount total   |
| `discount_amount` | DECIMAL(14,4) | DEFAULT 0               | Total discount applied        |
| `tax_amount`      | DECIMAL(14,4) | DEFAULT 0               | Total tax charged             |
| `grand_total`     | DECIMAL(14,4) | NOT NULL                | Final charged amount          |
| `paid_amount`     | DECIMAL(14,4) | DEFAULT 0               | Amount collected              |
| `change_amount`   | DECIMAL(14,4) | DEFAULT 0               | Change returned               |
| `status`          | ENUM          | NOT NULL                | completed / voided / refunded |
| `note`            | TEXT          | NULL                    | Sale notes                    |
| `created_at`      | TIMESTAMPTZ   | NOT NULL                | Sale timestamp                |

---

### Table: `sale_items`

| Column            | Type          | Constraints      | Description           |
| ----------------- | ------------- | ---------------- | --------------------- |
| `id`              | UUID          | PK               | Line item identifier  |
| `sale_id`         | UUID          | FK → sales.id    | Parent sale           |
| `product_id`      | UUID          | FK → products.id | Product sold          |
| `quantity`        | DECIMAL(12,4) | NOT NULL         | Quantity sold         |
| `unit_price`      | DECIMAL(12,4) | NOT NULL         | Price at time of sale |
| `discount_amount` | DECIMAL(12,4) | DEFAULT 0        | Line-level discount   |
| `tax_amount`      | DECIMAL(12,4) | DEFAULT 0        | Line-level tax        |
| `total`           | DECIMAL(14,4) | NOT NULL         | Line total            |

---

### Table: `invoices`

| Column           | Type        | Constraints           | Description                      |
| ---------------- | ----------- | --------------------- | -------------------------------- |
| `id`             | UUID        | PK                    | Invoice identifier               |
| `sale_id`        | UUID        | FK → sales.id, UNIQUE | Associated sale                  |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL      | Invoice reference number         |
| `status`         | ENUM        | NOT NULL              | paid / partial / unpaid / voided |
| `due_date`       | DATE        | NULL                  | Payment due date                 |
| `issued_at`      | TIMESTAMPTZ | NOT NULL              | Invoice issuance timestamp       |

---

### Table: `payments`

| Column       | Type          | Constraints   | Description                  |
| ------------ | ------------- | ------------- | ---------------------------- |
| `id`         | UUID          | PK            | Payment identifier           |
| `sale_id`    | UUID          | FK → sales.id | Associated sale              |
| `method`     | ENUM          | NOT NULL      | cash / card / credit / split |
| `amount`     | DECIMAL(14,4) | NOT NULL      | Amount paid                  |
| `reference`  | VARCHAR(255)  | NULL          | External payment reference   |
| `created_at` | TIMESTAMPTZ   | NOT NULL      | Payment timestamp            |

---

## 7. Purchase Domain

### Table: `purchase_orders`

| Column                  | Type          | Constraints                                                                 | Description                       |
| ----------------------- | ------------- | --------------------------------------------------------------------------- | --------------------------------- |
| `id`                    | UUID          | PK                                                                          | Unique purchase order ID          |
| `company_id`            | UUID          | FK → companies.id                                                           | Company                           |
| `branch_id`             | UUID          | FK → branches.id, NULL                                                      | Branch                            |
| `warehouse_id`          | UUID          | FK → warehouses.id                                                          | Target warehouse                  |
| `supplier_id`           | UUID          | FK → suppliers.id                                                           | Supplier                          |
| `purchase_order_number` | VARCHAR(100)  | UNIQUE per company                                                          | Purchase order reference number   |
| `order_date`            | TIMESTAMPTZ   | NOT NULL                                                                    | Date PO was placed                |
| `expected_date`         | TIMESTAMPTZ   | NULL                                                                        | Expected delivery date            |
| `status`                | ENUM          | DRAFT, PENDING, APPROVED, REJECTED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED | Status                            |
| `subtotal`              | DECIMAL(15,4) | NOT NULL                                                                    | Total cost before tax/discounts   |
| `discount`              | DECIMAL(15,4) | DEFAULT 0                                                                   | Order-level discount              |
| `tax`                   | DECIMAL(15,4) | DEFAULT 0                                                                   | Order-level tax                   |
| `shipping_cost`         | DECIMAL(15,4) | DEFAULT 0                                                                   | Shipping cost                     |
| `grand_total`           | DECIMAL(15,4) | NOT NULL                                                                    | Grand total amount                |
| `remarks`               | TEXT          | NULL                                                                        | Internal remarks                  |
| `created_by`            | UUID          | NOT NULL                                                                    | User who created the PO           |
| `approved_by`           | UUID          | NULL                                                                        | User who approved/rejected the PO |

---

### Table: `purchase_order_items`

| Column              | Type          | Constraints             | Description             |
| ------------------- | ------------- | ----------------------- | ----------------------- |
| `id`                | UUID          | PK                      | Unique item ID          |
| `purchase_order_id` | UUID          | FK → purchase_orders.id | Parent PO               |
| `product_id`        | UUID          | FK → products.id        | Product ordered         |
| `quantity`          | DECIMAL(15,4) | NOT NULL                | Quantity ordered        |
| `unit_price`        | DECIMAL(15,4) | NOT NULL                | Purchase price per unit |
| `discount`          | DECIMAL(15,4) | DEFAULT 0               | Item-level discount     |
| `tax`               | DECIMAL(15,4) | DEFAULT 0               | Item-level tax          |
| `total`             | DECIMAL(15,4) | NOT NULL                | Line total amount       |

---

### Table: `goods_receives`

| Column              | Type          | Constraints                   | Description                        |
| ------------------- | ------------- | ----------------------------- | ---------------------------------- |
| `id`                | UUID          | PK                            | Unique GRN ID                      |
| `company_id`        | UUID          | FK → companies.id             | Company                            |
| `branch_id`         | UUID          | FK → branches.id, NULL        | Branch                             |
| `warehouse_id`      | UUID          | FK → warehouses.id            | Target warehouse                   |
| `supplier_id`       | UUID          | FK → suppliers.id             | Supplier                           |
| `purchase_order_id` | UUID          | FK → purchase_orders.id, NULL | Linked PO reference                |
| `grn_number`        | VARCHAR(100)  | UNIQUE per company            | Goods Receive Note sequence number |
| `receive_date`      | TIMESTAMPTZ   | NOT NULL                      | Date items were received           |
| `status`            | ENUM          | DRAFT, COMPLETED, CANCELLED   | Status                             |
| `subtotal`          | DECIMAL(15,4) | NOT NULL                      | Pre-tax total                      |
| `discount`          | DECIMAL(15,4) | DEFAULT 0                     | Discount on receipt                |
| `tax`               | DECIMAL(15,4) | DEFAULT 0                     | Tax on receipt                     |
| `grand_total`       | DECIMAL(15,4) | NOT NULL                      | Grand total received value         |
| `remarks`           | TEXT          | NULL                          | Internal remarks                   |
| `received_by`       | UUID          | NOT NULL                      | User receiving the stock           |

---

### Table: `goods_receive_items`

| Column              | Type          | Constraints            | Description                    |
| ------------------- | ------------- | ---------------------- | ------------------------------ |
| `id`                | UUID          | PK                     | Unique line item ID            |
| `goods_receive_id`  | UUID          | FK → goods_receives.id | Parent GRN                     |
| `product_id`        | UUID          | FK → products.id       | Received product               |
| `quantity`          | DECIMAL(15,4) | NOT NULL               | Ordered quantity from PO       |
| `received_quantity` | DECIMAL(15,4) | NOT NULL               | Actually received quantity     |
| `unit_cost`         | DECIMAL(15,4) | NOT NULL               | Unit cost of item              |
| `batch_number`      | VARCHAR(100)  | NULL                   | Linked batch tracking code     |
| `expiry_date`       | DATE          | NULL                   | Linked expiration date         |
| `serial_required`   | BOOLEAN       | DEFAULT false          | Serial number requirement flag |
| `total`             | DECIMAL(15,4) | NOT NULL               | Line total value               |

---

### Table: `supplier_invoices`

| Column             | Type          | Constraints                    | Description                        |
| ------------------ | ------------- | ------------------------------ | ---------------------------------- |
| `id`               | UUID          | PK                             | Unique supplier invoice ID         |
| `goods_receive_id` | UUID          | UNIQUE, FK → goods_receives.id | Linked GRN                         |
| `supplier_id`      | UUID          | FK → suppliers.id              | Supplier                           |
| `invoice_number`   | VARCHAR(100)  | UNIQUE per supplier            | Supplier's original invoice number |
| `invoice_date`     | DATE          | NOT NULL                       | Date supplier invoice was issued   |
| `subtotal`         | DECIMAL(15,4) | NOT NULL                       | Subtotal value                     |
| `tax`              | DECIMAL(15,4) | DEFAULT 0                      | Tax amount                         |
| `discount`         | DECIMAL(15,4) | DEFAULT 0                      | Discount amount                    |
| `grand_total`      | DECIMAL(15,4) | NOT NULL                       | Invoice grand total                |
| `status`           | ENUM          | PENDING, PAID, CANCELLED       | Invoice status                     |

---

## 8. Customer Domain

### Table: `customers`

| Column            | Type          | Constraints       | Description              |
| ----------------- | ------------- | ----------------- | ------------------------ |
| `id`              | UUID          | PK                | Customer identifier      |
| `company_id`      | UUID          | FK → companies.id | Owning company           |
| `name`            | VARCHAR(255)  | NOT NULL          | Customer name            |
| `email`           | VARCHAR(255)  | NULL              | Email address            |
| `phone`           | VARCHAR(50)   | NULL              | Phone number             |
| `address`         | TEXT          | NULL              | Delivery/billing address |
| `customer_type`   | ENUM          | NOT NULL          | retail / wholesale       |
| `credit_limit`    | DECIMAL(14,4) | DEFAULT 0         | Maximum credit balance   |
| `current_balance` | DECIMAL(14,4) | DEFAULT 0         | Outstanding balance owed |
| `is_active`       | BOOLEAN       | DEFAULT true      | Active status            |
| `created_at`      | TIMESTAMPTZ   | NOT NULL          | Creation timestamp       |
| `updated_at`      | TIMESTAMPTZ   | NOT NULL          | Last modified timestamp  |
| `deleted_at`      | TIMESTAMPTZ   | NULL              | Soft delete timestamp    |

---

## 9. Supplier Domain

> **Status:** ✅ Implemented — Phase B6.2  
> **Migration:** `20260712104102_add_supplier_management`

### Table: `suppliers`

| Column              | Type           | Constraints                 | Description                    |
| ------------------- | -------------- | --------------------------- | ------------------------------ |
| `id`                | UUID           | PK, default uuid()          | Supplier identifier            |
| `company_id`        | UUID           | FK → companies.id (CASCADE) | Owning company                 |
| `supplier_code`     | VARCHAR(20)    | UNIQUE, NOT NULL            | Auto-generated (SUP-000001...) |
| `company_name`      | VARCHAR(255)   | NOT NULL                    | Supplier company/business name |
| `contact_person`    | VARCHAR(200)   | NULL                        | Primary contact name           |
| `email`             | VARCHAR(255)   | UNIQUE, NULL                | Email address                  |
| `phone`             | VARCHAR(50)    | UNIQUE, NULL                | Primary phone number           |
| `alternative_phone` | VARCHAR(50)    | NULL                        | Secondary phone number         |
| `website`           | VARCHAR(255)   | NULL                        | Company website URL            |
| `tax_number`        | VARCHAR(100)   | NULL                        | VAT / Tax registration number  |
| `credit_limit`      | DECIMAL(15,4)  | DEFAULT 0                   | Maximum allowed credit         |
| `opening_balance`   | DECIMAL(15,4)  | DEFAULT 0                   | Balance at onboarding          |
| `current_balance`   | DECIMAL(15,4)  | DEFAULT 0                   | Running payable balance        |
| `status`            | SupplierStatus | DEFAULT ACTIVE              | ACTIVE / INACTIVE / BLOCKED    |
| `notes`             | TEXT           | NULL                        | Internal notes                 |
| `created_at`        | TIMESTAMPTZ    | NOT NULL                    | Creation timestamp             |
| `updated_at`        | TIMESTAMPTZ    | NOT NULL                    | Last modified timestamp        |
| `deleted_at`        | TIMESTAMPTZ    | NULL                        | Soft delete timestamp          |

**Indexes:** `supplier_code`, `company_name`, `phone`, `email`, `company_id`

### Table: `supplier_addresses`

| Column          | Type         | Constraints                 | Description                      |
| --------------- | ------------ | --------------------------- | -------------------------------- |
| `id`            | UUID         | PK, default uuid()          | Address identifier               |
| `supplier_id`   | UUID         | FK → suppliers.id (CASCADE) | Owning supplier                  |
| `label`         | VARCHAR(100) | NOT NULL                    | Address label (Head Office, etc) |
| `country`       | VARCHAR(100) | NULL                        | Country name                     |
| `state`         | VARCHAR(100) | NULL                        | State / Province                 |
| `city`          | VARCHAR(100) | NULL                        | City                             |
| `area`          | VARCHAR(100) | NULL                        | Area / District                  |
| `postal_code`   | VARCHAR(20)  | NULL                        | ZIP / Postal code                |
| `address_line1` | VARCHAR(255) | NOT NULL                    | Primary address line             |
| `address_line2` | VARCHAR(255) | NULL                        | Secondary address line           |
| `is_default`    | BOOLEAN      | DEFAULT false               | Primary address flag             |
| `created_at`    | TIMESTAMPTZ  | NOT NULL                    | Creation timestamp               |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL                    | Last modified timestamp          |

**Indexes:** `supplier_id`

### Enum: `SupplierStatus`

| Value      | Description                                |
| ---------- | ------------------------------------------ |
| `ACTIVE`   | Supplier is active and accepting orders    |
| `INACTIVE` | Supplier is temporarily inactive           |
| `BLOCKED`  | Supplier is blocked (payment issues, etc.) |

### Relationships

```
Company  1 ────── * Supplier
Supplier 1 ────── * SupplierAddress
```

### Future Tables (Reserved)

| Table                       | Phase         | Purpose                      |
| --------------------------- | ------------- | ---------------------------- |
| `supplier_purchase_history` | Purchase Mgmt | Linked purchase orders       |
| `supplier_ledger`           | Accounting    | Double-entry ledger entries  |
| `supplier_due`              | Accounting    | Outstanding payables         |
| `supplier_payments`         | Accounting    | Payment transactions         |
| `supplier_statements`       | Reports       | Periodic statement snapshots |
| `supplier_performance`      | Analytics     | Delivery/quality KPIs        |

---

## 10. Accounting Domain

### Table: `transactions`

| Column             | Type          | Constraints            | Description            |
| ------------------ | ------------- | ---------------------- | ---------------------- |
| `id`               | UUID          | PK                     | Transaction identifier |
| `company_id`       | UUID          | FK → companies.id      | Owning company         |
| `branch_id`        | UUID          | FK → branches.id, NULL | Branch reference       |
| `type`             | ENUM          | NOT NULL               | income / expense       |
| `category`         | VARCHAR(100)  | NOT NULL               | Transaction category   |
| `amount`           | DECIMAL(14,4) | NOT NULL               | Transaction amount     |
| `description`      | TEXT          | NULL                   | Description            |
| `reference_type`   | VARCHAR(50)   | NULL                   | Source document type   |
| `reference_id`     | UUID          | NULL                   | Source document ID     |
| `transaction_date` | DATE          | NOT NULL               | Transaction date       |
| `created_by`       | UUID          | FK → users.id          | Recording user         |
| `created_at`       | TIMESTAMPTZ   | NOT NULL               | Creation timestamp     |

---

### Table: `expenses`

| Column         | Type          | Constraints            | Description                   |
| -------------- | ------------- | ---------------------- | ----------------------------- |
| `id`           | UUID          | PK                     | Expense identifier            |
| `company_id`   | UUID          | FK → companies.id      | Owning company                |
| `branch_id`    | UUID          | FK → branches.id, NULL | Branch reference              |
| `category`     | VARCHAR(100)  | NOT NULL               | Expense category              |
| `amount`       | DECIMAL(14,4) | NOT NULL               | Expense amount                |
| `description`  | TEXT          | NULL                   | Expense description           |
| `receipt_url`  | TEXT          | NULL                   | Attached receipt URL          |
| `expense_date` | DATE          | NOT NULL               | Date of expense               |
| `approved_by`  | UUID          | FK → users.id, NULL    | Approving user                |
| `status`       | ENUM          | NOT NULL               | pending / approved / rejected |
| `created_by`   | UUID          | FK → users.id          | Recording user                |
| `created_at`   | TIMESTAMPTZ   | NOT NULL               | Creation timestamp            |

---

## 11. System Domain

### Table: `audit_logs`

| Column        | Type         | Constraints         | Description                               |
| ------------- | ------------ | ------------------- | ----------------------------------------- |
| `id`          | UUID         | PK                  | Log entry identifier                      |
| `user_id`     | UUID         | FK → users.id, NULL | Performing user                           |
| `action`      | VARCHAR(100) | NOT NULL            | Action performed (create, update, delete) |
| `module`      | VARCHAR(100) | NOT NULL            | Affected module                           |
| `entity_type` | VARCHAR(100) | NOT NULL            | Affected entity (e.g., Product, Sale)     |
| `entity_id`   | UUID         | NULL                | Affected record ID                        |
| `old_values`  | JSONB        | NULL                | State before change                       |
| `new_values`  | JSONB        | NULL                | State after change                        |
| `ip_address`  | INET         | NULL                | Request IP address                        |
| `user_agent`  | TEXT         | NULL                | Client user agent                         |
| `created_at`  | TIMESTAMPTZ  | NOT NULL            | Log entry timestamp                       |

**Note:** Audit log records are append-only. No UPDATE or DELETE operations are permitted on this table.

---

### Table: `notifications`

| Column       | Type         | Constraints   | Description             |
| ------------ | ------------ | ------------- | ----------------------- |
| `id`         | UUID         | PK            | Notification identifier |
| `user_id`    | UUID         | FK → users.id | Target user             |
| `type`       | VARCHAR(100) | NOT NULL      | Notification type       |
| `title`      | VARCHAR(255) | NOT NULL      | Notification title      |
| `message`    | TEXT         | NOT NULL      | Notification body       |
| `is_read`    | BOOLEAN      | DEFAULT false | Read status             |
| `metadata`   | JSONB        | NULL          | Additional context data |
| `created_at` | TIMESTAMPTZ  | NOT NULL      | Creation timestamp      |

---

### Table: `backups`

| Column         | Type         | Constraints         | Description                  |
| -------------- | ------------ | ------------------- | ---------------------------- |
| `id`           | UUID         | PK                  | Backup record identifier     |
| `filename`     | VARCHAR(255) | NOT NULL            | Backup file name             |
| `size_bytes`   | BIGINT       | NULL                | Backup file size             |
| `storage_path` | TEXT         | NOT NULL            | File storage path            |
| `status`       | ENUM         | NOT NULL            | pending / completed / failed |
| `type`         | ENUM         | NOT NULL            | manual / scheduled           |
| `created_by`   | UUID         | FK → users.id, NULL | Triggering user              |
| `created_at`   | TIMESTAMPTZ  | NOT NULL            | Backup creation timestamp    |

---

## 12. Entity Relationship Overview

```
companies ──< branches ──< employees
    │               │
    │               └──< warehouses ──< stock >── products
    │
    └──< products >── categories (hierarchical)
                  >── brands
                  >── units
                  >── taxes
                  >── barcodes

customers ──< sales ──< sale_items >── products
                 └──── invoices
                 └──── payments
                 └──── stock_movements

suppliers ──< purchases ──< purchase_items >── products
                    └──── purchase_returns

users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< refresh_tokens
users ──< audit_logs
users ──< notifications
```

---

## 13. Data Flow Summary

### Sale Transaction Flow

```
POS UI → POST /api/v1/sales
  → Create: sales record
  → Create: sale_items records (per product)
  → Create: invoices record
  → Create: payments record(s)
  → Update: stock (decrement per product/warehouse)
  → Create: stock_movements records (type: sale)
  → Update: customers.current_balance (if credit sale)
  → Create: transactions record (type: income)
  → Create: audit_logs entry
```

### Purchase Receive Flow

```
Receive GRN → POST /api/v1/purchases/:id/receive
  → Update: purchase_items.quantity_received
  → Update: purchases.status
  → Create: stock_movements records (type: purchase)
  → Update: stock (increment per product/warehouse)
  → Update: suppliers.current_balance (if unpaid)
  → Create: audit_logs entry
```

### Stock Adjustment Flow

```
Admin Adjustment → POST /api/v1/inventory/adjustments
  → Create: stock_movements record (type: adjustment)
  → Update: stock.quantity
  → Create: audit_logs entry
```

---

## 14. Prisma & Database Workflow (Phase B2 Updates)

### Database Conventions & Rules

- **Primary Keys**: Every database model must use a UUID identifier (`id String @id @default(uuid()) @db.Uuid`).
- **Audit Fields**: Every model must have the base system properties:
  - `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz`
  - `updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz`
- **Naming Conventions**:
  - Prisma Models: PascalCase (e.g. `SystemConfig`)
  - Prisma Fields: camelCase (e.g. `updatedAt`)
  - PostgreSQL Tables: snake_case (mapped via `@@map("system_configs")`)
  - PostgreSQL Columns: snake_case (mapped via `@map("created_at")`)
- **Statuses**: Status values should default to the `Status` enum (`ACTIVE`, `INACTIVE`, `PENDING`, `DELETED`).

### Migration Workflow

To apply schema modifications during development:

1. Modify `apps/api/prisma/schema.prisma`.
2. Generate local migration files and apply them to local database:
   ```bash
   pnpm --filter @enterprise-pos/api db:migrate
   ```
3. Generate the updated Prisma client files:
   ```bash
   pnpm --filter @enterprise-pos/api db:generate
   ```

### Seed Workflow

To repopulate initial table records (e.g. configuration states, system defaults):

```bash
pnpm --filter @enterprise-pos/api db:seed
```

### Transaction Usage

Always leverage the centralized transactional utility helper:

```typescript
import { runInTransaction } from '../lib/transaction';

const result = await runInTransaction(async (tx) => {
  const record = await tx.systemConfig.create({ ... });
  return record;
});
```

---

_This document is part of the Enterprise POS System Phase 0 documentation suite._
