# Enterprise POS System — API Documentation

> **Version:** 1.0.0  
> **Status:** Phase 0 — Documentation & Planning  
> **Last Updated:** 2026-07-11  
> **Base URL:** `/api/v1`

---

## Table of Contents

1. [API Conventions](#1-api-conventions)
2. [Authentication — `/auth`](#2-authentication--auth)
3. [Users — `/users`](#3-users--users)
4. [Roles — `/roles`](#4-roles--roles)
5. [Permissions — `/permissions`](#5-permissions--permissions)
6. [Products — `/products`](#6-products--products)
7. [Categories — `/categories`](#7-categories--categories)
8. [Brands — `/brands`](#8-brands--brands)
9. [Inventory — `/inventory`](#9-inventory--inventory)
10. [Customers — `/customers`](#10-customers--customers)
11. [Suppliers — `/suppliers`](#11-suppliers--suppliers)
12. [Purchases — `/purchases`](#12-purchases--purchases)
13. [Sales — `/sales`](#13-sales--sales)
14. [Reports — `/reports`](#14-reports--reports)
15. [Settings — `/settings`](#15-settings--settings)

---

## 1. API Conventions

### Standard Response Envelope

All API responses follow a consistent envelope format.

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

### HTTP Status Codes

| Code  | Meaning                                                  |
| ----- | -------------------------------------------------------- |
| `200` | Success — data returned                                  |
| `201` | Created — resource created successfully                  |
| `204` | No Content — successful operation, no response body      |
| `400` | Bad Request — validation error or malformed request      |
| `401` | Unauthorized — missing or invalid authentication token   |
| `403` | Forbidden — authenticated but insufficient permissions   |
| `404` | Not Found — requested resource does not exist            |
| `409` | Conflict — resource already exists (e.g., duplicate SKU) |
| `422` | Unprocessable Entity — business logic violation          |
| `429` | Too Many Requests — rate limit exceeded                  |
| `500` | Internal Server Error — unexpected server error          |

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

The access token is a JWT with a 15-minute expiry. Token refresh is handled via the `/auth/refresh` endpoint using an HttpOnly cookie.

### Pagination

List endpoints support standard pagination query parameters:

| Parameter   | Default | Description                 |
| ----------- | ------- | --------------------------- |
| `page`      | `1`     | Page number                 |
| `limit`     | `20`    | Records per page (max: 100) |
| `sortBy`    | varies  | Sort field                  |
| `sortOrder` | `desc`  | `asc` or `desc`             |

---

## 2. Authentication — `/auth`

**Purpose:** User authentication, session management, and password operations.

**Authentication Required:** No (except `/auth/logout` and `/auth/me`)

---

### `POST /auth/login`

Authenticate user and issue tokens.

**Request Body:**

```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123!"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "admin@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["admin"]
    }
  }
}
```

**Set-Cookie:** `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth`

---

### `POST /auth/refresh`

Exchange refresh token for a new access token. Refresh token is read from HttpOnly cookie.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

---

### `POST /auth/logout`

Revoke the current refresh token and clear the cookie.

**Auth Required:** Yes

**Response `204`:** No content

---

### `POST /auth/forgot-password`

Initiate password reset by sending a reset link to the user's email.

**Request Body:**

```json
{
  "email": "user@company.com"
}
```

**Response `200`:** Always returns success to prevent email enumeration.

---

### `POST /auth/reset-password`

Complete password reset using the token from the reset email.

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response `200`:** Success confirmation

---

### `GET /auth/me`

Return the authenticated user's profile and permissions.

**Auth Required:** Yes

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["admin"],
    "permissions": ["products.create", "sales.read", "inventory.update"]
  }
}
```

---

## 3. Users — `/users`

**Purpose:** User account lifecycle management.

**Authentication Required:** Yes

**Required Permission:** `users.*`

---

| Method   | Endpoint                   | Permission     | Description                    |
| -------- | -------------------------- | -------------- | ------------------------------ |
| `GET`    | `/users`                   | `users.read`   | List all users with pagination |
| `GET`    | `/users/:id`               | `users.read`   | Get user by ID                 |
| `POST`   | `/users`                   | `users.create` | Create a new user              |
| `PUT`    | `/users/:id`               | `users.update` | Update user profile            |
| `DELETE` | `/users/:id`               | `users.delete` | Soft delete user               |
| `PATCH`  | `/users/:id/status`        | `users.update` | Activate or deactivate user    |
| `POST`   | `/users/:id/roles`         | `users.update` | Assign roles to user           |
| `DELETE` | `/users/:id/roles/:roleId` | `users.update` | Remove role from user          |

**Create User Request Body:**

```json
{
  "email": "cashier@store.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "roleIds": ["role-uuid-1"],
  "branchId": "branch-uuid"
}
```

**List Users Query Parameters:**

| Parameter  | Description             |
| ---------- | ----------------------- |
| `search`   | Search by name or email |
| `roleId`   | Filter by role          |
| `branchId` | Filter by branch        |
| `isActive` | Filter by active status |

---

## 4. Roles — `/roles`

**Purpose:** Role definition and permission assignment.

**Authentication Required:** Yes

**Required Permission:** `roles.*`

---

| Method   | Endpoint                 | Permission     | Description                      |
| -------- | ------------------------ | -------------- | -------------------------------- |
| `GET`    | `/roles`                 | `roles.read`   | List all roles                   |
| `GET`    | `/roles/:id`             | `roles.read`   | Get role with permissions        |
| `POST`   | `/roles`                 | `roles.create` | Create a new role                |
| `PUT`    | `/roles/:id`             | `roles.update` | Update role name and description |
| `DELETE` | `/roles/:id`             | `roles.delete` | Delete non-system role           |
| `PUT`    | `/roles/:id/permissions` | `roles.update` | Replace role permission set      |

---

## 5. Permissions — `/permissions`

**Purpose:** Read available permission definitions.

**Authentication Required:** Yes

**Required Permission:** `roles.read`

---

| Method | Endpoint       | Description                                      |
| ------ | -------------- | ------------------------------------------------ |
| `GET`  | `/permissions` | List all available permissions grouped by module |

---

## 6. Products — `/products`

**Purpose:** Product catalog management including products, categories, brands, units, taxes, and barcodes.

**Authentication Required:** Yes

---

### Products

| Method   | Endpoint           | Permission        | Description                               |
| -------- | ------------------ | ----------------- | ----------------------------------------- |
| `GET`    | `/products`        | `products.read`   | List products with pagination and filters |
| `GET`    | `/products/:id`    | `products.read`   | Get product detail                        |
| `POST`   | `/products`        | `products.create` | Create product                            |
| `PUT`    | `/products/:id`    | `products.update` | Update product                            |
| `DELETE` | `/products/:id`    | `products.delete` | Soft delete product                       |
| `POST`   | `/products/import` | `products.create` | Bulk import via CSV                       |
| `GET`    | `/products/search` | `products.read`   | Quick search by name, SKU, or barcode     |

**Create Product Request Body:**

```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "categoryId": "uuid",
  "brandId": "uuid",
  "unitId": "uuid",
  "taxId": "uuid",
  "costPrice": 10.0,
  "sellingPrice": 15.0,
  "wholesalePrice": 12.0,
  "reorderLevel": 10,
  "status": "active"
}
```

**List Products Query Parameters:**

| Parameter    | Description                           |
| ------------ | ------------------------------------- |
| `search`     | Full-text search                      |
| `categoryId` | Filter by category                    |
| `brandId`    | Filter by brand                       |
| `status`     | active / inactive / discontinued      |
| `lowStock`   | Boolean — return only low-stock items |

---

## 7. Categories — `/categories`

**Authentication Required:** Yes

| Method   | Endpoint          | Permission        | Description                    |
| -------- | ----------------- | ----------------- | ------------------------------ |
| `GET`    | `/categories`     | `products.read`   | List categories (flat or tree) |
| `GET`    | `/categories/:id` | `products.read`   | Get category detail            |
| `POST`   | `/categories`     | `products.create` | Create category                |
| `PUT`    | `/categories/:id` | `products.update` | Update category                |
| `DELETE` | `/categories/:id` | `products.delete` | Delete category                |

**Query Parameters:** `?tree=true` returns hierarchical category structure.

---

## 8. Brands — `/brands`

**Authentication Required:** Yes

| Method   | Endpoint      | Permission        | Description     |
| -------- | ------------- | ----------------- | --------------- |
| `GET`    | `/brands`     | `products.read`   | List all brands |
| `POST`   | `/brands`     | `products.create` | Create brand    |
| `PUT`    | `/brands/:id` | `products.update` | Update brand    |
| `DELETE` | `/brands/:id` | `products.delete` | Delete brand    |

---

## 9. Inventory — `/inventory`

**Purpose:** Stock management, adjustments, and inter-warehouse transfers.

**Authentication Required:** Yes

---

### Warehouses

| Method   | Endpoint                    | Permission         | Description      |
| -------- | --------------------------- | ------------------ | ---------------- |
| `GET`    | `/inventory/warehouses`     | `inventory.read`   | List warehouses  |
| `POST`   | `/inventory/warehouses`     | `inventory.create` | Create warehouse |
| `PUT`    | `/inventory/warehouses/:id` | `inventory.update` | Update warehouse |
| `DELETE` | `/inventory/warehouses/:id` | `inventory.delete` | Delete warehouse |

### Stock

| Method | Endpoint                      | Permission       | Description                            |
| ------ | ----------------------------- | ---------------- | -------------------------------------- |
| `GET`  | `/inventory/stock`            | `inventory.read` | List stock levels                      |
| `GET`  | `/inventory/stock/:productId` | `inventory.read` | Get stock by product across warehouses |

**List Stock Query Parameters:**

| Parameter     | Description                   |
| ------------- | ----------------------------- |
| `warehouseId` | Filter by warehouse           |
| `branchId`    | Filter by branch              |
| `lowStock`    | Return only low-stock items   |
| `search`      | Search by product name or SKU |

### Adjustments

| Method | Endpoint                 | Permission         | Description             |
| ------ | ------------------------ | ------------------ | ----------------------- |
| `GET`  | `/inventory/adjustments` | `inventory.read`   | List adjustment history |
| `POST` | `/inventory/adjustments` | `inventory.update` | Create stock adjustment |

**Create Adjustment Request Body:**

```json
{
  "warehouseId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": -5,
      "reason": "Damaged goods"
    }
  ],
  "note": "Quarterly stocktake correction"
}
```

### Transfers

| Method  | Endpoint                            | Permission         | Description                 |
| ------- | ----------------------------------- | ------------------ | --------------------------- |
| `GET`   | `/inventory/transfers`              | `inventory.read`   | List transfers              |
| `POST`  | `/inventory/transfers`              | `inventory.update` | Create transfer request     |
| `PATCH` | `/inventory/transfers/:id/dispatch` | `inventory.update` | Mark transfer as dispatched |
| `PATCH` | `/inventory/transfers/:id/receive`  | `inventory.update` | Confirm receipt of transfer |
| `PATCH` | `/inventory/transfers/:id/cancel`   | `inventory.update` | Cancel pending transfer     |

---

## 10. Customers — `/customers`

**Purpose:** Customer profile management and purchase history.

**Authentication Required:** Yes

---

| Method   | Endpoint                 | Permission         | Description                    |
| -------- | ------------------------ | ------------------ | ------------------------------ |
| `GET`    | `/customers`             | `customers.read`   | List customers with pagination |
| `GET`    | `/customers/:id`         | `customers.read`   | Get customer detail            |
| `POST`   | `/customers`             | `customers.create` | Create customer                |
| `PUT`    | `/customers/:id`         | `customers.update` | Update customer                |
| `DELETE` | `/customers/:id`         | `customers.delete` | Soft delete customer           |
| `GET`    | `/customers/:id/sales`   | `customers.read`   | Customer purchase history      |
| `GET`    | `/customers/:id/balance` | `customers.read`   | Customer balance summary       |

---

## 11. Suppliers — `/suppliers`

**Purpose:** Supplier profile management and purchase history.

**Authentication Required:** Yes

---

| Method   | Endpoint                   | Permission         | Description                    |
| -------- | -------------------------- | ------------------ | ------------------------------ |
| `GET`    | `/suppliers`               | `suppliers.read`   | List suppliers with pagination |
| `GET`    | `/suppliers/:id`           | `suppliers.read`   | Get supplier detail            |
| `POST`   | `/suppliers`               | `suppliers.create` | Create supplier                |
| `PUT`    | `/suppliers/:id`           | `suppliers.update` | Update supplier                |
| `DELETE` | `/suppliers/:id`           | `suppliers.delete` | Soft delete supplier           |
| `GET`    | `/suppliers/:id/purchases` | `suppliers.read`   | Supplier purchase history      |
| `GET`    | `/suppliers/:id/balance`   | `suppliers.read`   | Supplier balance summary       |

---

## 12. Purchases & Goods Receive

**Authentication Required:** Yes

---

### 12.1 Purchase Orders — `/purchase-orders`

| Method   | Endpoint                       | Permission         | Description                                                         |
| -------- | ------------------------------ | ------------------ | ------------------------------------------------------------------- |
| `POST`   | `/purchase-orders`             | `purchase.create`  | Create a new Purchase Order (defaults to DRAFT)                     |
| `GET`    | `/purchase-orders`             | `purchase.view`    | List Purchase Orders (filters by date, supplier, warehouse, status) |
| `GET`    | `/purchase-orders/:id`         | `purchase.view`    | Get a specific Purchase Order by ID                                 |
| `PATCH`  | `/purchase-orders/:id`         | `purchase.update`  | Update PO header/items (DRAFT/PENDING status only)                  |
| `DELETE` | `/purchase-orders/:id`         | `purchase.delete`  | Delete a PO (DRAFT/PENDING status only)                             |
| `PATCH`  | `/purchase-orders/:id/submit`  | `purchase.update`  | Submit PO for approval (DRAFT -> PENDING)                           |
| `PATCH`  | `/purchase-orders/:id/approve` | `purchase.approve` | Approve PENDING PO                                                  |
| `PATCH`  | `/purchase-orders/:id/reject`  | `purchase.approve` | Reject PENDING PO                                                   |
| `PATCH`  | `/purchase-orders/:id/cancel`  | `purchase.update`  | Cancel PO                                                           |

---

### 12.2 Goods Receive Note (GRN) — `/goods-receive`

| Method  | Endpoint                      | Permission                  | Description                                                           |
| ------- | ----------------------------- | --------------------------- | --------------------------------------------------------------------- |
| `POST`  | `/goods-receive`              | `purchase.receive`          | Create a DRAFT Goods Receive Note                                     |
| `GET`   | `/goods-receive`              | `purchase.receive.view`     | List GRNs (filters by supplier, warehouse, status)                    |
| `GET`   | `/goods-receive/:id`          | `purchase.receive.view`     | Get a specific GRN by ID                                              |
| `PATCH` | `/goods-receive/:id/complete` | `purchase.receive.complete` | Complete GRN (updates stock, recalculates avgCost, updates PO status) |
| `PATCH` | `/goods-receive/:id/cancel`   | `purchase.receive`          | Cancel DRAFT GRN                                                      |

---

### 12.3 Supplier Invoices — `/supplier-invoices`

| Method | Endpoint                 | Permission                | Description                                |
| ------ | ------------------------ | ------------------------- | ------------------------------------------ |
| `POST` | `/supplier-invoices`     | `supplier.invoice.create` | Create Supplier Invoice from Completed GRN |
| `GET`  | `/supplier-invoices`     | `supplier.invoice.view`   | List Supplier Invoices                     |
| `GET`  | `/supplier-invoices/:id` | `supplier.invoice.view`   | Get specific Supplier Invoice by ID        |

## 13. Sales — `/sales`

**Purpose:** POS sales transactions, invoicing, and payment management.

**Authentication Required:** Yes

---

| Method  | Endpoint             | Permission     | Description                |
| ------- | -------------------- | -------------- | -------------------------- |
| `GET`   | `/sales`             | `sales.read`   | List sales with pagination |
| `GET`   | `/sales/:id`         | `sales.read`   | Get sale detail            |
| `POST`  | `/sales`             | `sales.create` | Create sale (checkout)     |
| `GET`   | `/sales/:id/invoice` | `sales.read`   | Get invoice for sale       |
| `GET`   | `/sales/:id/receipt` | `sales.read`   | Get receipt data           |
| `GET`   | `/sales/:id/pdf`     | `sales.read`   | Download invoice PDF       |
| `PATCH` | `/sales/:id/void`    | `sales.update` | Void a sale                |

**Create Sale Request Body:**

```json
{
  "customerId": "uuid",
  "warehouseId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 15.0,
      "discountAmount": 1.0
    }
  ],
  "discountAmount": 0,
  "payments": [
    {
      "method": "cash",
      "amount": 29.0
    }
  ],
  "note": "Walk-in customer"
}
```

---

## 14. Reports — `/reports`

**Purpose:** Business intelligence and analytics endpoints.

**Authentication Required:** Yes

**Required Permission:** `reports.read`

---

| Method | Endpoint                            | Description                    |
| ------ | ----------------------------------- | ------------------------------ |
| `GET`  | `/reports/sales/summary`            | Sales totals by period         |
| `GET`  | `/reports/sales/by-product`         | Sales breakdown by product     |
| `GET`  | `/reports/sales/by-category`        | Sales breakdown by category    |
| `GET`  | `/reports/sales/by-branch`          | Comparative sales by branch    |
| `GET`  | `/reports/sales/by-user`            | Sales performance by user      |
| `GET`  | `/reports/purchases/summary`        | Purchase totals by period      |
| `GET`  | `/reports/purchases/by-supplier`    | Purchase breakdown by supplier |
| `GET`  | `/reports/inventory/stock-status`   | Current stock levels           |
| `GET`  | `/reports/inventory/low-stock`      | Products below reorder level   |
| `GET`  | `/reports/inventory/movements`      | Stock movement history         |
| `GET`  | `/reports/inventory/valuation`      | Stock value at cost            |
| `GET`  | `/reports/financial/income-expense` | Income vs. expense comparison  |
| `GET`  | `/reports/financial/profit-loss`    | P&L summary                    |
| `GET`  | `/reports/financial/tax-collection` | Tax collected by period        |

**Common Query Parameters:**

| Parameter   | Description                          |
| ----------- | ------------------------------------ |
| `startDate` | Period start date (ISO 8601)         |
| `endDate`   | Period end date (ISO 8601)           |
| `branchId`  | Filter by branch                     |
| `format`    | `json` (default) or `csv` for export |

---

## 15. Settings — `/settings`

**Purpose:** System-wide configuration management.

**Authentication Required:** Yes

**Required Permission:** `settings.update` (for write operations)

---

| Method   | Endpoint                 | Description             |
| -------- | ------------------------ | ----------------------- |
| `GET`    | `/settings`              | Get all system settings |
| `PUT`    | `/settings`              | Update system settings  |
| `GET`    | `/settings/company`      | Get company profile     |
| `PUT`    | `/settings/company`      | Update company profile  |
| `GET`    | `/settings/branches`     | List branches           |
| `POST`   | `/settings/branches`     | Create branch           |
| `PUT`    | `/settings/branches/:id` | Update branch           |
| `GET`    | `/settings/taxes`        | List tax rates          |
| `POST`   | `/settings/taxes`        | Create tax rate         |
| `PUT`    | `/settings/taxes/:id`    | Update tax rate         |
| `DELETE` | `/settings/taxes/:id`    | Delete tax rate         |
| `GET`    | `/settings/units`        | List units of measure   |
| `POST`   | `/settings/units`        | Create unit             |
| `PUT`    | `/settings/units/:id`    | Update unit             |
| `DELETE` | `/settings/units/:id`    | Delete unit             |

---

## Phase B6.2 — Supplier Management

**Base:** `/api/v1/suppliers`  
**Auth:** Bearer JWT required on all endpoints  
**Phase:** B6.2 — Supplier Management

### Supplier Endpoints

| Method   | Endpoint                   | Permission      | Description                                     |
| -------- | -------------------------- | --------------- | ----------------------------------------------- |
| `GET`    | `/suppliers`               | supplier.view   | List suppliers (search, filter, sort, paginate) |
| `GET`    | `/suppliers/:id`           | supplier.view   | Get supplier by ID                              |
| `POST`   | `/suppliers`               | supplier.create | Create a new supplier                           |
| `PATCH`  | `/suppliers/:id`           | supplier.update | Update supplier fields                          |
| `DELETE` | `/suppliers/:id`           | supplier.delete | Soft delete supplier                            |
| `GET`    | `/suppliers/:id/addresses` | supplier.view   | List supplier addresses                         |
| `POST`   | `/suppliers/:id/addresses` | supplier.update | Add address to supplier                         |

### Query Parameters — GET /suppliers

| Parameter   | Type     | Description                                                              |
| ----------- | -------- | ------------------------------------------------------------------------ |
| `q`         | string   | Full-text search: companyName, contactPerson, phone, email, supplierCode |
| `status`    | enum     | `ACTIVE` \| `INACTIVE` \| `BLOCKED`                                      |
| `companyId` | UUID     | Filter by company                                                        |
| `dateFrom`  | ISO date | Filter createdAt >= dateFrom                                             |
| `dateTo`    | ISO date | Filter createdAt <= dateTo                                               |
| `sortBy`    | enum     | `companyName` \| `createdAt` \| `currentBalance`                         |
| `sortOrder` | enum     | `asc` \| `desc` (default: `desc`)                                        |
| `page`      | integer  | Page number (default: 1)                                                 |
| `limit`     | integer  | Items per page (default: 20, max: 100)                                   |

### Create Supplier — POST /suppliers

```json
{
  "companyId": "uuid",
  "companyName": "Acme Supplies Ltd",
  "contactPerson": "John Doe",
  "email": "contact@acme.com",
  "phone": "+8801700000001",
  "alternativePhone": "+8801700000099",
  "website": "https://acme.com",
  "taxNumber": "TAX-001",
  "creditLimit": 50000,
  "openingBalance": 0,
  "status": "ACTIVE",
  "notes": "Primary electronics supplier",
  "addresses": [
    {
      "label": "Head Office",
      "country": "Bangladesh",
      "state": "Dhaka Division",
      "city": "Dhaka",
      "area": "Gulshan",
      "postalCode": "1212",
      "addressLine1": "123 Business Road",
      "addressLine2": "Floor 5",
      "isDefault": true
    }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": "uuid",
    "companyId": "uuid",
    "supplierCode": "SUP-000001",
    "companyName": "Acme Supplies Ltd",
    "contactPerson": "John Doe",
    "email": "contact@acme.com",
    "phone": "+8801700000001",
    "alternativePhone": null,
    "website": "https://acme.com",
    "taxNumber": "TAX-001",
    "creditLimit": "50000.0000",
    "openingBalance": "0.0000",
    "currentBalance": "0.0000",
    "status": "ACTIVE",
    "notes": "Primary electronics supplier",
    "addresses": [
      {
        "id": "uuid",
        "supplierId": "uuid",
        "label": "Head Office",
        "country": "Bangladesh",
        "city": "Dhaka",
        "addressLine1": "123 Business Road",
        "isDefault": true,
        "createdAt": "2026-07-12T10:41:00.000Z",
        "updatedAt": "2026-07-12T10:41:00.000Z"
      }
    ],
    "createdAt": "2026-07-12T10:41:00.000Z",
    "updatedAt": "2026-07-12T10:41:00.000Z",
    "deletedAt": null
  }
}
```

### Business Rules

- `supplierCode` is auto-generated in format `SUP-000001`, `SUP-000002`, etc.
- `email` and `phone` must be unique across non-deleted suppliers.
- `website` must be a valid URL if provided.
- `currentBalance` is initialized from `openingBalance` on creation.
- Deletion is soft-delete only (`deletedAt` timestamp + status → `INACTIVE`).
- Deleted suppliers are excluded from all list/search queries.

### Error Responses

| Code | Scenario                     |
| ---- | ---------------------------- |
| 400  | Validation failure (Zod)     |
| 401  | Missing or invalid JWT token |
| 403  | Insufficient permissions     |
| 404  | Supplier not found           |
| 409  | Duplicate email or phone     |

### Future Endpoints (Not Yet Implemented)

| Endpoint                              | Phase         |
| ------------------------------------- | ------------- |
| `GET /suppliers/:id/purchase-history` | Purchase Mgmt |
| `GET /suppliers/:id/ledger`           | Accounting    |
| `GET /suppliers/:id/due`              | Accounting    |
| `GET /suppliers/:id/payment-history`  | Accounting    |
| `GET /suppliers/:id/statement`        | Reports       |
| `GET /suppliers/:id/performance`      | Analytics     |

---

_This document is part of the Enterprise POS System Phase 0 documentation suite._
