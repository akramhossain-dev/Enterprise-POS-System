# API Reference Specification — Enterprise POS System

This document outlines the API standards, base paths, headers, response conventions, and core endpoint configurations of the backend REST services.

---

## Service Configuration

- **Base URL:** `http://localhost:4000/api/v1`
- **Protocols:** HTTP (Development), HTTPS (Production)
- **Default Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## Authentication & Headers

Access to protected endpoints requires a Bearer JWT Token passed in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

Tokens are refreshed securely via `httpOnly` cookie verification at the `/auth/refresh` endpoint.

---

## Response Formats

All API responses return a structured JSON container.

### Successful Response

```json
{
  "success": true,
  "data": {
    "key": "value"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable reason details.",
    "details": {}
  }
}
```

Standard Error Codes:

- `UNAUTHORIZED`: Session is invalid, expired, or missing headers.
- `FORBIDDEN`: User lacks the permissions required to access the resource.
- `NOT_FOUND`: Target resource does not exist.
- `VALIDATION_ERROR`: Input parameters failed structural type-checks.
- `INTERNAL_ERROR`: Unexpected database or execution crash.

---

## Endpoint Specification

### 1. Authentication (`/auth`)

#### `POST /auth/login`

Submit user credentials and start an active session.

- **Request Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "strong_password_here"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u_984",
        "email": "admin@example.com",
        "fullName": "System Admin",
        "role": "admin",
        "permissions": ["pos:access", "reports:read"],
        "status": "active"
      },
      "tokens": {
        "accessToken": "ey...",
        "refreshToken": "ey...",
        "expiresIn": 900
      }
    }
  }
  ```

#### `POST /auth/logout`

Revoke the current refresh token and clear user session.

- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": null
  }
  ```

#### `POST /auth/refresh`

Request a new access token using the httpOnly refresh cookie.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "ey..."
    }
  }
  ```

#### `GET /auth/me`

Retrieve user profile data of the currently logged-in account.

- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "u_984",
      "email": "admin@example.com",
      "fullName": "System Admin",
      "role": "admin"
    }
  }
  ```

---

### 2. Products Catalog (`/products`)

#### `GET /products`

Retrieve a paginated array of products filtered by search keys.

- **Query Parameters:**
  - `page`: `1` (default)
  - `limit`: `20` (default)
  - `search`: `<string>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "prod_1",
          "name": "Barcode Scanner Device",
          "sku": "HW-BAR-01",
          "purchasePrice": 45.0,
          "salePrice": 75.0,
          "status": "active"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

#### `POST /products`

Insert a new product entry into the catalog.

- **Headers:** `Authorization: Bearer <token>` (Requires `products:create` permission)
- **Request Body:**
  ```json
  {
    "name": "Receipt Printer USB",
    "sku": "HW-PRN-02",
    "purchasePrice": 60.0,
    "salePrice": 99.0
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "prod_2",
      "name": "Receipt Printer USB",
      "sku": "HW-PRN-02"
    }
  }
  ```

---

### 3. Customers Directory (`/customers`)

#### `GET /customers`

Fetch registered retail/corporate customers.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "cust_1",
          "fullName": "Regular Guest",
          "phone": "555-0199"
        }
      ]
    }
  }
  ```
