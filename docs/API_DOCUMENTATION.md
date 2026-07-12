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

---

### 12.4 Purchase Returns — `/purchase-returns`

| Method  | Endpoint                         | Permission                 | Description                                                           |
| ------- | -------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| `POST`  | `/purchase-returns`              | `purchase.return.create`   | Create a DRAFT Purchase Return against a completed GRN                |
| `GET`   | `/purchase-returns`              | `purchase.return.view`     | List Purchase Returns                                                 |
| `GET`   | `/purchase-returns/:id`          | `purchase.return.view`     | Get a specific Purchase Return by ID                                  |
| `PATCH` | `/purchase-returns/:id/approve`  | `purchase.return.approve`  | Approve a DRAFT Purchase Return                                       |
| `PATCH` | `/purchase-returns/:id/complete` | `purchase.return.complete` | Complete Return (decreases stock, reduces supplier due, posts ledger) |
| `PATCH` | `/purchase-returns/:id/cancel`   | `purchase.return.complete` | Cancel a DRAFT or APPROVED Purchase Return                            |

---

### 12.5 Supplier Payments — `/supplier-payments`

| Method | Endpoint                 | Permission                | Description                                                          |
| ------ | ------------------------ | ------------------------- | -------------------------------------------------------------------- |
| `POST` | `/supplier-payments`     | `supplier.payment.create` | Create a Supplier Payment (reduces supplier due, creates ledger log) |
| `GET`  | `/supplier-payments`     | `supplier.payment.view`   | List Supplier Payments                                               |
| `GET`  | `/supplier-payments/:id` | `supplier.payment.view`   | Get specific Supplier Payment details by ID                          |

---

### 12.6 Supplier Ledger — `/suppliers/:id/ledger`

| Method | Endpoint                 | Permission              | Description                                                                     |
| ------ | ------------------------ | ----------------------- | ------------------------------------------------------------------------------- |
| `GET`  | `/suppliers/:id/ledger`  | `supplier.payment.view` | Retrieve paginated ledger entries (purchases, returns, payments) for a supplier |
| `GET`  | `/suppliers/:id/balance` | `supplier.payment.view` | Fetch current due balance and credit limit details for a supplier               |

---

### 12.7 POS Core & Cart System — `/pos`

#### POS Session Endpoints

| Method | Endpoint               | Permission  | Description                        |
| ------ | ---------------------- | ----------- | ---------------------------------- |
| `POST` | `/pos/session/open`    | `pos.open`  | Open a new POS session for cashier |
| `GET`  | `/pos/session/current` | `pos.view`  | Retrieve cashier's active session  |
| `POST` | `/pos/session/close`   | `pos.close` | Close active POS session           |

#### Product Search Endpoint

| Method | Endpoint               | Permission | Description                         |
| ------ | ---------------------- | ---------- | ----------------------------------- |
| `GET`  | `/pos/products/search` | `pos.view` | Search products by Name/SKU/Barcode |

#### Cart Endpoints

| Method   | Endpoint                      | Permission        | Description                         |
| -------- | ----------------------------- | ----------------- | ----------------------------------- |
| `POST`   | `/pos/cart`                   | `pos.cart.create` | Create a new active cart            |
| `GET`    | `/pos/cart/:id`               | `pos.cart.update` | Get cart details with line items    |
| `POST`   | `/pos/cart/:id/items`         | `pos.cart.update` | Add an item (or increment quantity) |
| `PATCH`  | `/pos/cart/:id/items/:itemId` | `pos.cart.update` | Update quantity or pricing details  |
| `DELETE` | `/pos/cart/:id/items/:itemId` | `pos.cart.update` | Remove item from cart               |
| `DELETE` | `/pos/cart/:id/items`         | `pos.cart.update` | Clear all items from cart           |

## 13. Sales & Checkout — `/sales`, `/pos/checkout`, `/payments`, `/invoices`

**Purpose:** POS checkout transactions, subsequent payment processing, and invoice receipt generation.

**Authentication Required:** Yes

---

### POS Checkout (POST `/pos/checkout`)

Converts an active cart into a completed sale, logs payment details, creates an invoice record, and reduces warehouse stock.

- **Permission:** `sale.create`
- **Request Body:**
  ```json
  {
    "cartId": "uuid-of-cart",
    "customerId": "uuid-of-customer", // Optional, required if credit sale (due amount > 0)
    "paymentDetails": {
      "paymentMethod": "CASH", // CASH, CARD, BANK, MOBILE_BANKING, OTHER
      "amount": 57.25,
      "reference": "Ref123", // Optional
      "transactionId": "Tx999" // Optional
    }
  }
  ```
- **Response Data:**
  ```json
  {
    "success": true,
    "message": "Cart checked out successfully",
    "data": {
      "sale": {
        "id": "uuid",
        "companyId": "uuid",
        "branchId": null,
        "warehouseId": "uuid",
        "customerId": "uuid",
        "customerName": "John Doe",
        "customerCode": "CUS-000002",
        "sessionId": "uuid",
        "invoiceNumber": "INV-000001",
        "saleDate": "2026-07-12T14:08:55.855Z",
        "subtotal": "55.0000",
        "discount": "5.0000",
        "tax": "2.2500",
        "grandTotal": "57.2500",
        "paidAmount": "57.2500",
        "dueAmount": "0.0000",
        "paymentStatus": "PAID",
        "status": "COMPLETED",
        "createdBy": "uuid",
        "createdAt": "2026-07-12T14:08:55.855Z",
        "updatedAt": "2026-07-12T14:08:55.855Z",
        "items": [
          {
            "id": "uuid",
            "saleId": "uuid",
            "productId": "uuid",
            "productName": "Wireless Mouse",
            "productSku": "MS-01",
            "productBarcode": "12345678",
            "quantity": "3.0000",
            "unitPrice": "20.0000",
            "discount": "5.0000",
            "tax": "2.2500",
            "total": "57.2500"
          }
        ]
      },
      "invoice": {
        "id": "uuid",
        "saleId": "uuid",
        "invoiceNumber": "INV-000001",
        "invoiceDate": "2026-07-12T14:08:55.855Z",
        "printCount": 0,
        "createdAt": "2026-07-12T14:08:55.855Z"
      },
      "payment": {
        "id": "uuid",
        "saleId": "uuid",
        "paymentMethod": "CASH",
        "amount": "57.2500",
        "reference": "Ref123",
        "transactionId": null,
        "paidAt": "2026-07-12T14:08:55.855Z",
        "createdBy": "uuid"
      }
    }
  }
  ```

---

### Record Sale Payment (POST `/payments`)

Records a subsequent payment against a credit or partially paid sale.

- **Permission:** `payment.create`
- **Request Body:**
  ```json
  {
    "saleId": "uuid-of-sale",
    "paymentMethod": "MOBILE_BANKING",
    "amount": 40.0,
    "reference": "Ref999", // Optional
    "transactionId": "Tx888" // Optional
  }
  ```
- **Response Data:**
  ```json
  {
    "success": true,
    "message": "Payment recorded successfully",
    "data": {
      "payment": {
        "id": "uuid",
        "saleId": "uuid",
        "paymentMethod": "MOBILE_BANKING",
        "amount": "40.0000",
        "reference": "Ref999",
        "transactionId": "Tx888",
        "paidAt": "2026-07-12T14:09:55.000Z",
        "createdBy": "uuid"
      },
      "sale": {
        "id": "uuid",
        "paidAmount": "100.0000",
        "dueAmount": "0.0000",
        "paymentStatus": "PAID"
        // (fully loaded Sale object)
      }
    }
  }
  ```

---

### Get Receipt Data (GET `/sales/:id/invoice`)

Fetches formatted printing variables for receipts, including company details and complete payment logs.

- **Permission:** `invoice.view`
- **Response Data:**
  ```json
  {
    "success": true,
    "message": "Receipt print data retrieved",
    "data": {
      "businessInfo": {
        "name": "Demo Company",
        "address": "Dhaka, Bangladesh",
        "phone": "+880123456789",
        "email": "info@enterprise-pos.com",
        "taxNumber": "BIN-1234567"
      },
      "customerInfo": {
        "name": "John Doe",
        "code": "CUS-000002",
        "phone": null
      },
      "sale": {
        "id": "uuid",
        "invoiceNumber": "INV-000001",
        "saleDate": "2026-07-12T14:08:55.855Z",
        "status": "COMPLETED",
        "paymentStatus": "PAID",
        "subtotal": "55.0000",
        "discount": "5.0000",
        "tax": "2.2500",
        "grandTotal": "57.2500",
        "paidAmount": "57.2500",
        "dueAmount": "0.0000"
      },
      "items": [
        {
          "productName": "Wireless Mouse",
          "sku": "MS-01",
          "quantity": "3.0000",
          "unitPrice": "20.0000",
          "discount": "5.0000",
          "tax": "2.2500",
          "total": "57.2500"
        }
      ],
      "payments": [
        {
          "paymentMethod": "CASH",
          "amount": "57.2500",
          "reference": "Ref123",
          "transactionId": null,
          "paidAt": "2026-07-12T14:08:55.855Z"
        }
      ]
    }
  }
  ```

---

### Record Invoice Print (POST `/invoices/:saleId/print`)

Increments the printing counter on the invoice.

- **Permission:** `invoice.print`
- **Response Data:**
  ```json
  {
    "success": true,
    "message": "Invoice print count incremented",
    "data": {
      "id": "uuid",
      "saleId": "uuid",
      "printCount": 1
    }
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

| Method  | Endpoint              | Required Permission | Description                                         |
| ------- | --------------------- | ------------------- | --------------------------------------------------- |
| `GET`   | `/settings`           | `settings.view`     | Get all system configuration categories for company |
| `GET`   | `/settings/:category` | `settings.view`     | Get system configuration details for a category     |
| `PUT`   | `/settings/:category` | `settings.update`   | Create or overwrite configuration under a category  |
| `PATCH` | `/settings/:category` | `settings.update`   | Partials merge update of configuration category     |

Where `:category` can be: `COMPANY`, `BRANCH`, `POS`, `INVOICE`, `TAX`, `CURRENCY`, `LOCALE`, `EMAIL`, `BACKUP`, `SECURITY`, `FEATURE`, `SYSTEM`, `BARCODE`, `RECEIPT`.

_SMTP/Email passwords and other sensitive fields are encrypted in the database and masked (`********`) in API outputs._

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

## Phase B10.1 — Accounting Foundation

### Account Category Endpoints

#### Create Category — `POST /account-categories`

- **Body**: `{ "name": "Asset Accounts", "type": "ASSET" }`
- **Response**: Mapped category DTO.

#### List Categories — `GET /account-categories`

- **Response**: List of account categories.

### Account Endpoints

#### Create Account — `POST /accounts`

- **Body**:
  ```json
  {
    "categoryId": "category-uuid",
    "parentId": "optional-parent-uuid",
    "accountCode": "1001",
    "name": "Petty Cash",
    "type": "ASSET",
    "openingBalance": 100
  }
  ```
- **Response**: Mapped Account DTO.

#### List Accounts — `GET /accounts`

- **Query Params**: `page`, `limit`, `type`, `status`, `search`
- **Response**: List of accounts with pagination meta.

#### Get Account Details — `GET /accounts/:id`

- **Response**: Mapped Account DTO.

#### Update Account — `PATCH /accounts/:id`

- **Body**: `{ "name": "Updated Petty Cash", "status": "ACTIVE" }`
- **Response**: Mapped Account DTO.

#### Delete Account — `DELETE /accounts/:id`

- **Response**: Success envelope. Blocked if account has transaction history or child accounts.

### Journal Entry Endpoints

#### Post Journal Entry — `POST /journals`

- **Body**:
  ```json
  {
    "date": "2026-07-12T00:00:00Z",
    "description": "Bank to Cash Transfer",
    "items": [
      { "accountId": "cash-acc-uuid", "debit": 500, "credit": 0 },
      { "accountId": "bank-acc-uuid", "debit": 0, "credit": 500 }
    ]
  }
  ```
- **Response**: Created Journal Entry details. Blocks and rolls back if debits do not equal credits.

### General Ledger Endpoints

#### Get Account General Ledger — `GET /accounts/:id/ledger`

- **Query Params**: `dateFrom`, `dateTo`
- **Response**: Detailed history of debits, credits, and running balances calculated based on account type normal balance conventions.

## Phase B10.2 — Income & Expense Management

### Expense Category Endpoints

#### Create Expense Category — `POST /expense-categories`

- **Body**: `{ "name": "Broadband Services", "description": "Internet bills" }`
- **Response**: Mapped ExpenseCategory DTO.

#### List Expense Categories — `GET /expense-categories`

- **Query Params**: `status` (ACTIVE, INACTIVE)
- **Response**: List of ExpenseCategory DTOs.

#### Update Expense Category — `PATCH /expense-categories/:id`

- **Body**: `{ "name": "Office Internet", "status": "ACTIVE" }`
- **Response**: Mapped ExpenseCategory DTO.

### Expense Entry Endpoints

#### Create Expense Entry — `POST /expenses`

- **Body**:
  ```json
  {
    "categoryId": "category-uuid",
    "accountId": "expense-ledger-account-uuid",
    "date": "2026-07-12T00:00:00Z",
    "amount": 150,
    "paymentMethod": "CASH",
    "description": "Internet bill July"
  }
  ```
- **Response**: Mapped Expense DTO. Automatically creates balanced double-entry Journal Entry (debits Expense Account, credits standard Cash account `1000`) and adjusts ledger balances.

#### List Expenses — `GET /expenses`

- **Query Params**: `page`, `limit`, `dateFrom`, `dateTo`, `categoryId`, `paymentMethod`, `amountMin`, `amountMax`, `search`
- **Response**: Paginated list of expenses.

#### Get Expense Details — `GET /expenses/:id`

- **Response**: Mapped Expense DTO.

#### Update/Cancel Expense — `PATCH /expenses/:id`

- **Body**: `{ "status": "CANCELLED" }`
- **Response**: Mapped Expense DTO. If cancelled, posts reversing Journal Entry (credits Expense Account, debits Asset Account) and reverts balances.

#### Delete Expense — `DELETE /expenses/:id`

- **Response**: Success envelope. Deletes expense, rolls back balances, and purges posted journal entries.

### Income Entry Endpoints

#### Create Income Entry — `POST /incomes`

- **Body**:
  ```json
  {
    "accountId": "income-ledger-account-uuid",
    "date": "2026-07-12T00:00:00Z",
    "amount": 500,
    "paymentMethod": "BANK",
    "source": "Consulting fees",
    "description": "Custom billing income"
  }
  ```
- **Response**: Mapped Income DTO. Automatically posts balanced double-entry Journal Entry (debits standard Bank account `1100`, credits Income Account) and adjusts ledger balances.

#### List Incomes — `GET /incomes`

- **Query Params**: `page`, `limit`, `dateFrom`, `dateTo`, `paymentMethod`, `amountMin`, `amountMax`, `search`
- **Response**: Paginated list of income entries.

#### Get Income Details — `GET /incomes/:id`

- **Response**: Mapped Income DTO.

#### Update/Cancel Income — `PATCH /incomes/:id`

- **Body**: `{ "status": "CANCELLED" }`
- **Response**: Mapped Income DTO. If cancelled, posts reversing Journal Entry (credits Asset Account, debits Income Account) and reverts balances.

#### Delete Income — `DELETE /incomes/:id`

- **Response**: Success envelope. Deletes income, rolls back balances, and purges posted journal entries.

## Phase B10.3 — Financial Transactions & Reports Foundation

### Payment Receipt Endpoints

#### Create Payment Receipt — `POST /receipts`

- **Body**:
  ```json
  {
    "customerId": "customer-uuid",
    "accountId": "accounts-receivable-ledger-uuid",
    "type": "CUSTOMER_PAYMENT",
    "amount": 200,
    "paymentMethod": "CASH",
    "description": "Cash payment from customer",
    "date": "2026-07-12T00:00:00Z"
  }
  ```
- **Response**: Mapped PaymentReceipt DTO. Automatically creates balanced double-entry Journal Entry (debits standard Cash account `1000` or Bank `1100`, credits accounts receivable account) and adjusts ledger balances.

#### List Payment Receipts — `GET /receipts`

- **Query Params**: `page`, `limit`, `dateFrom`, `dateTo`, `type`, `paymentMethod`, `search`
- **Response**: Paginated list of payment receipts.

#### Get Payment Receipt Details — `GET /receipts/:id`

- **Response**: Mapped PaymentReceipt DTO.

### Payment Voucher Endpoints

#### Create Payment Voucher — `POST /vouchers`

- **Body**:
  ```json
  {
    "accountId": "accounts-payable-ledger-uuid",
    "type": "PAYMENT",
    "amount": 350,
    "paymentMethod": "BANK",
    "description": "Bank payment to supplier",
    "date": "2026-07-12T00:00:00Z"
  }
  ```
- **Response**: Mapped PaymentVoucher DTO. Automatically creates balanced double-entry Journal Entry (debits accounts payable account, credits Bank account `1100`) and adjusts ledger balances.

#### List Payment Vouchers — `GET /vouchers`

- **Query Params**: `page`, `limit`, `dateFrom`, `dateTo`, `type`, `paymentMethod`, `search`
- **Response**: Paginated list of payment vouchers.

#### Get Payment Voucher Details — `GET /vouchers/:id`

- **Response**: Mapped PaymentVoucher DTO.

### Financial Report Endpoints

#### Get General Ledger — `GET /reports/general-ledger`

- **Query Params**: `accountId` (required), `startDate`, `endDate`
- **Response**: Array of ledger rows: `{ "date": "...", "reference": "JE-000001", "debit": "...", "credit": "...", "balance": "..." }`.

#### Get Account Statement — `GET /reports/account-statement/:accountId`

- **Query Params**: `startDate`, `endDate`
- **Response**: Account details with `{ "openingBalance": "...", "transactions": [...], "closingBalance": "..." }`.

#### Get Trial Balance — `GET /reports/trial-balance`

- **Response**: Array of rows containing account details, types, and total debit/credit aggregates.

#### Get Financial Summary — `GET /reports/financial-summary`

- **Query Params**: `startDate`, `endDate`
- **Response**: `{ "totalIncome": "...", "totalExpense": "...", "netProfit": "..." }`.

## Phase B11.1 — Dashboard Analytics System

### Base Path — `/api/v1/dashboard`

All dashboard endpoints support query filters `startDate` and `endDate` (ISO date-time format). If omitted, calculations default to the current month.

#### Main Overview — `GET /dashboard/overview`

- **Response**: `{ "success": true, "data": { "totalSales": "1200.00", "totalPurchase": "450.00", "totalRevenue": "1200.00", "totalExpense": "300.00", "netProfit": "900.00", "totalCustomers": 12, "totalSuppliers": 5, "totalProducts": 48, "lowStockItemsCount": 3 } }`
- **Guarded by**: `dashboard.view`

#### Sales Summary — `GET /dashboard/sales-summary`

- **Response**: `{ "success": true, "data": { "todaySales": "350.00", "yesterdaySales": "500.00", "thisWeekSales": "1200.00", "thisMonthSales": "2400.00", "thisYearSales": "24000.00" } }`
- **Guarded by**: `dashboard.view`

#### Sales Trend — `GET /dashboard/sales-trend`

- **Query Params**: `trend` (Daily, Weekly, Monthly)
- **Response**: Array of trend intervals: `[{ "date": "2026-07-12", "salesAmount": "350.00", "numberOfOrders": 3 }]`
- **Guarded by**: `analytics.view`

#### Purchase Summary — `GET /dashboard/purchase-summary`

- **Response**: `{ "success": true, "data": { "totalPurchase": 10, "pendingPurchase": 2, "completedPurchase": 8, "purchaseAmount": "4500.00" } }`
- **Guarded by**: `dashboard.view`

#### Inventory Summary — `GET /dashboard/inventory-summary`

- **Response**: `{ "success": true, "data": { "totalProducts": 48, "totalStockValue": "15000.00", "lowStockCount": 3, "outOfStockCount": 1, "warehouseWiseStock": [{ "warehouseId": "uuid", "warehouseName": "Main Warehouse", "totalStock": "550" }] } }`
- **Guarded by**: `dashboard.view`

#### Customer Summary — `GET /dashboard/customer-summary`

- **Response**: `{ "success": true, "data": { "totalCustomers": 12, "newCustomers": 2, "topCustomers": [{ "customerId": "uuid", "customerName": "John Doe", "totalPurchase": "850.00" }], "customerDueAmount": "250.00" } }`
- **Guarded by**: `dashboard.view`

#### Supplier Summary — `GET /dashboard/supplier-summary`

- **Response**: `{ "success": true, "data": { "totalSuppliers": 5, "supplierDue": "120.00", "topSuppliers": [{ "supplierId": "uuid", "companyName": "Acme Corp", "totalPurchase": "900.00" }] } }`
- **Guarded by**: `dashboard.view`

#### Financial Summary — `GET /dashboard/financial-summary`

- **Response**: `{ "success": true, "data": { "totalIncome": "1200.00", "totalExpense": "300.00", "profit": "900.00", "cashBalance": "4500.00", "bankBalance": "12000.00" } }`
- **Guarded by**: `analytics.view`

#### Top Products — `GET /dashboard/top-products`

- **Query Params**: `limit`
- **Response**: `[{ "productId": "uuid", "productName": "Item A", "quantitySold": "45.00", "revenue": "900.00" }]`
- **Guarded by**: `analytics.view`

#### Top Customers — `GET /dashboard/top-customers`

- **Query Params**: `limit`
- **Response**: `[{ "customerId": "uuid", "customerName": "John Doe", "totalPurchase": "850.00", "totalPayment": "600.00" }]`
- **Guarded by**: `analytics.view`

## Phase B11.2 & B11.3 — Reporting System

### Base Path — `/api/v1/reports`

All reports support parameters: `page`, `limit`, `startDate`, `endDate`, `search`, `warehouseId`, `productId`, `sortBy`, and `sortOrder`.

#### 1. Detailed Sales — `GET /reports/sales`

- **Response**: Paginated list of sales orders matching filters.
- **Guarded by**: `report.sales.view`

#### 2. Sales Summary — `GET /reports/sales-summary`

- **Response**: Summary metrics: gross sales, net sales, taxes, discounts.
- **Guarded by**: `report.sales.view`

#### 3. Product Sales — `GET /reports/product-sales`

- **Response**: Product sale quantities, average prices, product costs, and profit margins.
- **Guarded by**: `report.sales.view`

#### 4. Customer Sales — `GET /reports/customer-sales`

- **Response**: Customers buying counts, dues, total orders.
- **Guarded by**: `report.customer.view`

#### 5. Detailed Purchases — `GET /reports/purchases`

- **Response**: Paginated list of purchase orders.
- **Guarded by**: `report.purchase.view`

#### 6. Purchase Summary — `GET /reports/purchase-summary`

- **Response**: Totals, counts, average purchase value.
- **Guarded by**: `report.purchase.view`

#### 7. Supplier Purchases — `GET /reports/supplier-purchases`

- **Response**: Supplier purchase orders count, payables, dues.
- **Guarded by**: `report.supplier.view`

#### 8. Profit Analysis — `GET /reports/profit-analysis`

- **Response**: Sales revenue, product cost, discounts, gross profit.
- **Guarded by**: `report.profit.view`

#### 9. Inventory Report — `GET /reports/inventory`

- **Response**: Paginated product inventory list: SKU, Warehouse, Available, Reserved, Average Cost, Value.
- **Guarded by**: `report.inventory.view`

#### 10. Low Stock Report — `GET /reports/low-stock`

- **Response**: Products where current stock is less than or equal to minimum required.
- **Guarded by**: `report.inventory.view`

#### 11. Out Of Stock Report — `GET /reports/out-of-stock`

- **Response**: Products where available inventory is 0 or negative.
- **Guarded by**: `report.inventory.view`

#### 12. Stock Movements — `GET /reports/stock-movements`

- **Response**: Stock ledger entries filtered by product/warehouse/movement type.
- **Guarded by**: `report.stock.view`

#### 13. Batch Report — `GET /reports/batches`

- **Response**: Product batch numbers, quantities, mfg dates, expiry dates.
- **Guarded by**: `report.inventory.view`

#### 14. Expiry Report — `GET /reports/expiry`

- **Response**: Alerts for expired/expiring batches within 30 days.
- **Guarded by**: `report.inventory.view`

#### 15. Warehouse Report — `GET /reports/warehouses`

- **Response**: Summary totals per warehouse.
- **Guarded by**: `report.inventory.view`

#### 16. Inventory Valuation — `GET /reports/inventory-valuation`

- **Response**: Weighted average value aggregates per warehouse and company.
- **Guarded by**: `report.inventory.view`

#### 17. General Ledger — `GET /reports/general-ledger`

- **Response**: Ledger entries with running balances per account.
- **Guarded by**: `report.ledger.view`

#### 18. Trial Balance — `GET /reports/trial-balance`

- **Response**: Ledger-wide trial balance.
- **Guarded by**: `report.financial.view`

#### 19. Profit & Loss Sheet — `GET /reports/profit-loss`

- **Response**: Dynamic statement representing revenue, COGS, gross and net profit.
- **Guarded by**: `report.financial.view`

## Phase B12.1 — Centralized Notification System

### Notification Endpoints

#### 1. List Notifications — `GET /notifications`

- **Response**: List of paginated notifications for the authenticated user.
- **Guarded by**: `notification.view`
- **Query Params**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)

#### 2. List Unread Notifications — `GET /notifications/unread`

- **Response**: List of unread notifications for the authenticated user.
- **Guarded by**: `notification.view`

#### 3. View Notification Details — `GET /notifications/:id`

- **Response**: Details of a specific notification.
- **Guarded by**: `notification.view`

#### 4. Mark Notification Read — `PATCH /notifications/:id/read`

- **Response**: Notification details updated to READ.
- **Guarded by**: `notification.view`

#### 5. Mark All Notifications Read — `PATCH /notifications/read-all`

- **Response**: Marks all user unread notifications as read.
- **Guarded by**: `notification.view`

#### 6. Delete Notification — `DELETE /notifications/:id`

- **Response**: Deletes a specific notification record.
- **Guarded by**: `notification.manage`

### Preference Endpoints

#### 7. Get Notification Preferences — `GET /notification-preferences`

- **Response**: Channel permissions toggle state per category type.
- **Guarded by**: `notification.preference`

#### 8. Update Notification Preferences — `PATCH /notification-preferences`

- **Response**: Updated toggle config for category.
- **Guarded by**: `notification.preference`
- **Body Schema**:
  - `type` (ENUM: `SYSTEM`, `SALE`, `PURCHASE`, `PAYMENT`, `INVENTORY`, `CUSTOMER`, `SUPPLIER`, `SECURITY`, `ACCOUNTING`, `GENERAL`)
  - `emailEnabled` (boolean, optional)
  - `pushEnabled` (boolean, optional)
  - `inAppEnabled` (boolean, optional)

---

## Phase B12.2 — Audit Log & Activity Tracking

### Audit Log Endpoints

#### 1. List Audit Logs — `GET /audit-logs`

- **Response**: Paginated list of system-wide audit logs.
- **Guarded by**: `audit.view`
- **Query Params**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `startDate` (ISO string/date, optional)
  - `endDate` (ISO string/date, optional)
  - `action` (string, optional)
  - `entityType` (string, optional)
  - `ipAddress` (string, optional)
  - `search` (string, optional)

#### 2. Get Audit Log Details — `GET /audit-logs/:id`

- **Response**: Detailed audit log entry containing client headers, raw inputs, and newValue/oldValue change states.
- **Guarded by**: `audit.view`

#### 3. List Caller Activity — `GET /activity`

- **Response**: Paginated list of audit logs matching the caller's userId context.
- **Guarded by**: `activity.view`
- **Query Params**: Same as `GET /audit-logs`.

#### 4. List Login History — `GET /login-history`

- **Response**: Paginated list of login success and failure records.
- **Guarded by**: `login.history.view`
- **Query Params**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `startDate` (ISO string/date, optional)
  - `endDate` (ISO string/date, optional)
  - `userId` (UUID, optional)
  - `status` (SUCCESS/FAILED, optional)
  - `ipAddress` (string, optional)

#### 5. List Active Sessions — `GET /user-sessions`

- **Response**: Paginated list of active/revoked user session tracking records.
- **Guarded by**: `session.view`
- **Query Params**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `userId` (UUID, optional)

---

## Phase B13.1 — Performance Optimization & Background Jobs

### Health & Diagnostics Endpoints

#### 1. Liveness Check — `GET /live`

- **Authentication**: None
- **Response `200`**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-07-12T22:22:42.000Z"
  }
  ```
- **Description**: Lightweight liveness probe to verify that the HTTP server is listening.

#### 2. Readiness Check — `GET /ready`

- **Authentication**: None
- **Response `200` (Ready)**:
  ```json
  {
    "status": "READY",
    "database": "UP",
    "redis": "UP",
    "timestamp": "2026-07-12T22:22:42.000Z"
  }
  ```
- **Response `503` (Not Ready)**:
  ```json
  {
    "status": "NOT_READY",
    "database": "DOWN",
    "redis": "UP",
    "timestamp": "2026-07-12T22:22:42.000Z"
  }
  ```
- **Description**: Confirms the server's backend dependencies (Database, Redis) are healthy and connected.

#### 3. Health Diagnostics — `GET /health`

- **Authentication**: Yes (Requires user role `ADMIN`)
- **Response `200` (Healthy)**:
  ```json
  {
    "status": "HEALTHY",
    "timestamp": "2026-07-12T22:22:42.000Z",
    "application": {
      "uptimeSeconds": 142,
      "nodeVersion": "v22.2.0",
      "memoryUsageMb": {
        "rss": 85.23,
        "heapTotal": 45.12,
        "heapUsed": 32.41
      },
      "cpuUsage": {
        "user": 120000,
        "system": 45000
      }
    },
    "database": {
      "status": "UP",
      "latencyMs": 2.45
    },
    "redis": {
      "status": "UP",
      "latencyMs": 1.15
    },
    "queues": {
      "status": "UP"
    },
    "storage": {
      "status": "UP"
    }
  }
  ```
- **Description**: Detailed status metrics of the system, including backing services performance latencies.

---

## Phase B13.2 — Security Hardening & Observability

### Security Policies and Protections

#### 1. Input Sanitization & Anti-XSS Filters

All POST, PUT, and PATCH request body payloads are recursively filtered to neutralize cross-site scripting (XSS) tag injections. All string properties have special characters (`<`, `>`, `&`, `"`, `'`, `/`) escaped into safe HTML entities automatically.

#### 2. Prototype Pollution Mitigation

In order to prevent JavaScript prototype pollution attacks, any properties named `__proto__` or `constructor` found in incoming request bodies are stripped and ignored globally during parsing.

#### 3. Refresh Token Rotation (RTR) Reuse Prevention

Refresh tokens are rotated on use. An opaque token rotated within the last 60 seconds is temporarily blacklisted. If a client attempts to reuse a blacklisted/rotated refresh token, the API marks it as a security breach, deletes all active refresh tokens for the associated user, and voids all active sessions.

#### 4. Error Output Masking

To prevent reconnaissance attacks, any unhandled database or internal system error resulting in an HTTP 500 status code is masked. The API returns a generic `'An unexpected internal error occurred'` error envelope to client requests, suppressing paths, stack traces, and database schemas.

---

_This document is part of the Enterprise POS System API documentation suite._
