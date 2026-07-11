# Enterprise POS System — Authentication & Security

> **Version:** 1.0.0  
> **Status:** Phase B3 — Implementation Completed  
> **Last Updated:** 2026-07-11

---

## Table of Contents

1. [Authentication Architecture](#1-authentication-architecture)
2. [JWT Token System](#2-jwt-token-system)
3. [Complete Authentication Flow](#3-complete-authentication-flow)
4. [Authorization — RBAC & PBAC](#4-authorization--rbac--pbac)
5. [Password Security](#5-password-security)
6. [Input Validation](#6-input-validation)
7. [Rate Limiting](#7-rate-limiting)
8. [CORS Configuration](#8-cors-configuration)
9. [CSRF Protection](#9-csrf-protection)
10. [API Security](#10-api-security)
11. [Security Headers](#11-security-headers)

---

## 1. Authentication Architecture

The Enterprise POS System uses a **stateless JWT-based authentication** model with a **stateful refresh token** layer for session management. This hybrid approach provides the performance benefits of stateless authentication while enabling session revocation.

### Authentication Layers

```
┌────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION SYSTEM                  │
│                                                            │
│  Layer 1: Identification                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Email + Password → Verify identity                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                               │
│  Layer 2: Session Tokens                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Access Token (JWT, 15 min)  — API authentication   │  │
│  │  Refresh Token (opaque, 7d)  — Session persistence  │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                               │
│  Layer 3: Authorization                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Role-Based  →  Permission-Based  →  Resource Check │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 2. JWT Token System

### Access Token

| Property      | Value                                  |
| ------------- | -------------------------------------- |
| **Type**      | JSON Web Token (JWT)                   |
| **Algorithm** | `RS256` (RSA asymmetric signing)       |
| **Expiry**    | 15 minutes                             |
| **Storage**   | JavaScript memory (not localStorage)   |
| **Transport** | `Authorization: Bearer <token>` header |

**Access Token Payload:**

```json
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "roles": ["manager"],
  "permissions": ["products.read", "sales.create", "inventory.read"],
  "branchId": "branch-uuid",
  "companyId": "company-uuid",
  "iat": 1720704000,
  "exp": 1720704900,
  "jti": "unique-token-id"
}
```

**Design Decisions:**

- `RS256` is used over `HS256` so the public key can be shared with services for verification without exposing the signing secret.
- Permissions are embedded in the token payload to eliminate per-request database lookups.
- `jti` (JWT ID) enables token revocation if needed before expiry.

---

### Refresh Token

| Property     | Value                                          |
| ------------ | ---------------------------------------------- |
| **Type**     | Opaque random token (cryptographically secure) |
| **Storage**  | `HttpOnly; Secure; SameSite=Strict` cookie     |
| **Duration** | 7 days                                         |
| **Database** | Token hash stored in `refresh_tokens` table    |
| **Rotation** | Replaced on every successful refresh           |

**Refresh Token Security Model:**

- The raw token is never logged or stored — only its SHA-256 hash is persisted.
- Each refresh operation rotates the token, invalidating the previous one.
- Reuse of an already-rotated refresh token triggers automatic revocation of the entire session (Refresh Token Rotation with Reuse Detection).
- Tokens are linked to `ip_address` and `user_agent` for anomaly detection.

---

### Token Lifecycle

```
Login
  │
  ├── Issue: Access Token (15 min) → returned in response body
  └── Issue: Refresh Token (7 days) → set as HttpOnly cookie

API Request
  │
  └── Include: Authorization: Bearer <accessToken>

Access Token Expires
  │
  └── POST /auth/refresh (refreshToken cookie sent automatically)
        │
        ├── Validate refresh token hash against DB
        ├── Issue new Access Token
        ├── Rotate Refresh Token (new cookie set)
        └── Return: { accessToken }

Logout
  │
  ├── Delete refresh token record from DB
  ├── Clear HttpOnly cookie
  └── Frontend discards access token from memory
```

---

## 3. Complete Authentication Flow

### 3.1 Login Flow

```
1. User submits email and password
2. API looks up user by email
3. Verify user.is_active = true
4. Verify user.is_verified = true
5. Compare submitted password against password_hash (bcrypt)
6. On failure: increment failed attempt counter (Redis); return 401
7. On success:
   a. Generate RS256-signed JWT access token with claims
   b. Generate cryptographically random refresh token (32 bytes)
   c. Hash refresh token with SHA-256
   d. Store hash in refresh_tokens table with expiry, IP, and user agent
   e. Return access token in response body
   f. Set refresh token as Set-Cookie: refreshToken; HttpOnly; Secure; SameSite=Strict
   g. Update users.last_login_at
   h. Write audit_log entry (action: login, user_id, ip_address)
```

### 3.2 Silent Refresh Flow

```
1. Frontend detects access token expiry (JWT exp claim or 401 response)
2. Frontend sends POST /auth/refresh
   - No body required
   - refreshToken cookie sent automatically by browser
3. API reads refreshToken cookie
4. Hash received token; look up hash in refresh_tokens table
5. Verify: token exists, not revoked, not expired
6. Verify IP / user_agent consistency (optional strict mode)
7. Issue new access token (15 min)
8. Generate new refresh token; hash and store (rotation)
9. Invalidate old refresh token record
10. Return new access token; set new refreshToken cookie
```

### 3.3 Logout Flow

```
1. Frontend sends POST /auth/logout with refreshToken cookie
2. API reads and validates the refresh token
3. Mark refresh token as revoked (or delete record)
4. Clear refreshToken cookie (Set-Cookie with empty value and past expiry)
5. Write audit_log entry (action: logout)
6. Frontend discards access token from memory and redirects to login
```

### 3.4 Password Reset Flow

```
1. User submits email to POST /auth/forgot-password
2. API looks up user by email (always returns 200 to prevent enumeration)
3. If user exists:
   a. Generate secure random reset token (32 bytes)
   b. Hash token; store hash in DB with 1-hour expiry
   c. Enqueue email job: send reset link containing raw token
4. User clicks link → Frontend sends token + new password to POST /auth/reset-password
5. API hashes submitted token; look up in DB
6. Verify: not expired, not already used
7. Hash new password with bcrypt (cost factor 12)
8. Update user.password_hash
9. Mark reset token as used
10. Revoke all existing refresh tokens for this user
11. Write audit_log entry
```

---

## 4. Authorization — RBAC & PBAC

### Role-Based Access Control (RBAC)

Users are assigned one or more **Roles**. Roles define a job function within the system.

| System Role         | Description                              |
| ------------------- | ---------------------------------------- |
| `super_admin`       | Full system access, cannot be restricted |
| `admin`             | Full business operations access          |
| `manager`           | Branch-level management access           |
| `cashier`           | POS and sales access only                |
| `accountant`        | Accounting and financial reports         |
| `inventory_manager` | Inventory and purchase management        |

### Permission-Based Access Control (PBAC)

Each **Role** is assigned a granular set of **Permissions**. Permissions follow the pattern: `module.action`.

| Permission Pattern | Example Permissions                   |
| ------------------ | ------------------------------------- |
| `{module}.create`  | `products.create`, `customers.create` |
| `{module}.read`    | `inventory.read`, `reports.read`      |
| `{module}.update`  | `sales.update`, `users.update`        |
| `{module}.delete`  | `products.delete`, `roles.delete`     |

### Permission Check Flow

```
Incoming Request
       │
       ▼
Extract user permissions from JWT payload
       │
       ▼
Route requires permission: "inventory.update"
       │
       ├── User has "inventory.update" → ALLOW → proceed to handler
       │
       └── User does NOT have permission → return 403 Forbidden
```

### Guard Implementation

Two Fastify hooks enforce authorization at the route level:

```
preHandler hooks (applied per route):
  1. authGuard     — verifies JWT, attaches user to request context
  2. permissionGuard(["inventory.update"]) — checks required permissions
```

---

## 5. Password Security

| Measure                   | Implementation                                                 |
| ------------------------- | -------------------------------------------------------------- |
| **Hashing Algorithm**     | bcrypt with cost factor 12                                     |
| **Minimum Complexity**    | 8+ characters, uppercase, lowercase, number, special character |
| **Plain Text Storage**    | Never — passwords are never stored or logged in plain text     |
| **Comparison**            | Constant-time comparison via bcrypt.compare()                  |
| **Reset Token Hashing**   | SHA-256 hash of reset tokens before storage                    |
| **Refresh Token Hashing** | SHA-256 hash of refresh tokens before storage                  |

---

## 6. Input Validation

All API requests are validated before reaching business logic.

| Layer                   | Tool                                         | Scope                                            |
| ----------------------- | -------------------------------------------- | ------------------------------------------------ |
| **Route Schema**        | Fastify JSON Schema                          | Request body, query params, path params          |
| **Business Validation** | Zod                                          | Complex cross-field and business rule validation |
| **SQL Injection**       | Prisma ORM parameterized queries             | Automatic — all queries are parameterized        |
| **XSS Prevention**      | Input sanitization + Content-Security-Policy | Output encoding and CSP headers                  |

**Validation Rules:**

- All string inputs are trimmed
- Email fields are normalized to lowercase
- Numeric fields have min/max boundaries enforced
- Enum fields are validated against allowed values
- UUID fields are validated for format compliance
- File upload fields are restricted by MIME type and size

---

## 7. Rate Limiting

Rate limiting is applied at both the Nginx and application levels.

### Nginx-Level Rate Limiting

```nginx
# General API limit
limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;

# Authentication endpoints (stricter)
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;
```

### Application-Level Rate Limiting (Fastify + Redis)

| Endpoint Group          | Limit        | Window              |
| ----------------------- | ------------ | ------------------- |
| `/auth/login`           | 10 requests  | 15 minutes per IP   |
| `/auth/forgot-password` | 5 requests   | 60 minutes per IP   |
| `/auth/refresh`         | 30 requests  | 15 minutes per user |
| General API             | 300 requests | 1 minute per user   |
| Report endpoints        | 20 requests  | 5 minutes per user  |

**Rate Limit Response `429`:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

---

## 8. CORS Configuration

CORS is configured at the Fastify level to control which origins can access the API.

| Setting             | Value                                                 |
| ------------------- | ----------------------------------------------------- |
| **Allowed Origins** | Configured via `ALLOWED_ORIGINS` environment variable |
| **Allowed Methods** | `GET, POST, PUT, PATCH, DELETE, OPTIONS`              |
| **Allowed Headers** | `Authorization, Content-Type, X-Request-ID`           |
| **Credentials**     | `true` — required for HttpOnly cookie exchange        |
| **Preflight Cache** | 86400 seconds (24 hours)                              |
| **Exposed Headers** | `X-Total-Count, X-Request-ID`                         |

**Development:** `http://localhost:3000` is the only allowed origin.  
**Production:** Only the registered frontend domain is allowed.

---

## 9. CSRF Protection

Because the refresh token is stored in an HttpOnly cookie, CSRF protection must be applied to endpoints that read from cookies.

### Defense Strategy

| Mechanism                 | Description                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SameSite=Strict**       | Cookie is only sent for same-site requests, blocking cross-origin form submissions                                                                                 |
| **Custom Request Header** | All state-changing requests from the frontend include `X-Requested-With: XMLHttpRequest` — a custom header browsers do not include in simple cross-origin requests |
| **Origin Validation**     | API verifies the `Origin` header matches the allowed domain on cookie-reading endpoints                                                                            |
| **Double Submit Cookie**  | CSRF token pattern available as an additional layer for high-sensitivity operations                                                                                |

---

## 10. API Security

### Authentication Token Security

- Access tokens are stored **in memory only** (JavaScript variable), never in `localStorage` or `sessionStorage`
- Tokens are never logged by any component in the system
- API responses never echo or expose sensitive fields (password hashes, token values)

### Request Security

| Control               | Implementation                                              |
| --------------------- | ----------------------------------------------------------- |
| **HTTPS Enforcement** | Nginx redirects all HTTP to HTTPS; HSTS header set          |
| **Request ID**        | Every request assigned `X-Request-ID` UUID for traceability |
| **Body Size Limit**   | Maximum request body limited to 10MB by Fastify             |
| **SQL Injection**     | Prevented by Prisma ORM parameterized queries               |
| **Mass Assignment**   | Request schemas explicitly whitelist accepted fields        |

### Audit Trail

Every write operation (create, update, delete) produces an audit log record containing:

- User ID performing the action
- Action type and module
- Entity type and ID
- Before and after values (JSONB)
- IP address and user agent
- Precise timestamp

---

## 11. Security Headers

All API and frontend responses include the following security headers, configured at Nginx:

| Header                      | Value                                 | Purpose                         |
| --------------------------- | ------------------------------------- | ------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforce HTTPS for 1 year        |
| `X-Content-Type-Options`    | `nosniff`                             | Prevent MIME type sniffing      |
| `X-Frame-Options`           | `DENY`                                | Prevent clickjacking            |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`     | Control referrer information    |
| `Permissions-Policy`        | Restrictive policy                    | Disable unused browser features |
| `Content-Security-Policy`   | Configured per environment            | Control allowed content sources |
| `X-XSS-Protection`          | `1; mode=block`                       | Legacy XSS filter               |

---

_This document is part of the Enterprise POS System Phase 0 documentation suite._
