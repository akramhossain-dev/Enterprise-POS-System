# Security Policy — Enterprise POS System

This document outlines the security procedures, protocols, and policies enforced by the Enterprise POS System backend.

---

## 1. Vulnerability Disclosure Policy

If you discover a security vulnerability within this project, please **do not open a public GitHub issue**. Instead, follow these steps to report the vulnerability securely:

1. Send an email to **security@enterprise-pos.com**.
2. Include a detailed description of the vulnerability, steps to reproduce, and a proof of concept (PoC) if available.
3. We will acknowledge receipt of your report within 48 hours and work with you to remediate the issue within a responsible disclosure window of 90 days.

---

## 2. Implemented Security Controls

### HTTP Security Headers (Helmet)

- **Content Security Policy (CSP)**: Restrictions preventing unauthorized scripts, style loads, or connections from unknown origins.
- **HSTS**: Force HTTP connections over HTTPS only (`max-age=31536000`, `includeSubDomains`, `preload`).
- **Referrer Policy**: Strict policy `strict-origin-when-cross-origin`.
- **X-Frame-Options**: Explicitly configured as `SAMEORIGIN` to mitigate clickjacking.
- **X-Content-Type-Options**: Explicitly configured to `nosniff` preventing browser mime-sniffing.

### Authentication & Token Security

- **RS256/HS256 Access Tokens**: Bearer token authentication containing cryptographically signed payloads with a 15-minute expiration time.
- **JWT Secret Strength**: `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are validated to be **at minimum 32 characters** at startup, preventing weak signing keys from reaching production.
- **Configurable Refresh Token Expiry**: `REFRESH_TOKEN_EXPIRES_IN` env variable supports `d/h/m/s` formats (e.g., `7d`, `30d`). Previously hardcoded 7-day expiry is now fully configurable.
- **Active status verification**: The backend checks the user's active/inactive state against a Redis cache (`user:status:userId`) on every request. Status caches are invalidated immediately on profile changes.
- **Secure Refresh Token Rotation (RTR)**: Rotating refresh tokens are automatically invalidated on swap.
- **Token Reuse/Breach Mitigation**: If the system detects a previously rotated refresh token is reused, all active sessions and refresh tokens for that user are immediately deleted from PostgreSQL and a `SECURITY_BREACH` event is recorded.

### Authorization & Scope Security

- **RBAC Enforcement**: Scopes are checked against the token permissions array.
- **Tenant Scope Enforcement**: The user's `companyId` and `branchId` are extracted from the cached `Employee` profile and attached to the request context. Controllers check and enforce boundary checks on all resources.

### WebSocket Security

- **Restricted CORS Origin**: WebSocket (Socket.IO) connections are restricted to `FRONTEND_URL` only. The previous wildcard `origin: '*'` has been removed to prevent cross-origin WebSocket hijacking.
- **Cookie-based Auth**: WebSocket authentication uses the same JWT + cookie-based auth as REST endpoints.

### Input Sanitization & Protection

- **Zod Validation**: Request validation strips any parameters not explicitly declared in schemas.
- **XSS & Prototype Pollution Protection**: A global `preValidation` hook recursively sanitizes request body fields (escaping HTML tag markers and ignoring prototype modifications).

### Audit Logging

- All CRUD operations on **Customer**, **Supplier**, **Warehouse**, **User**, **Sale**, **Goods Receive**, and **Settings** entities are recorded to the `AuditLog` table with actor ID, old/new values, and description.
- Authentication events (login, logout, token reuse breach) are recorded separately in `LoginHistory`.

### Observability & Metrics

- **Prometheus `/metrics` endpoint**: Exposes HTTP request duration histograms, active connections gauge, and default Node.js runtime metrics.
- **Access Protection**: In production, the `/metrics` endpoint requires a `METRICS_SECRET_KEY` header to prevent public exposure of infrastructure telemetry.

### Storage & File Validation

- Centralized validation rejects files exceeding 10MB, restricts extensions/MIME-types to whitelisted formats, and sanitizes filenames to prevent path traversals.
- Hook points are prepared for ClamAV malware scanners.

### Rate Limiting limits

- Login: Max 5 requests / 15 minutes.
- Refresh: Max 10 requests / 15 minutes.
- Global: Max 1000 requests / 1 minute.

---

## 3. Production Deployment Security Checklist

- [ ] `JWT_SECRET` ≥ 32 characters (enforced at startup)
- [ ] `REFRESH_TOKEN_SECRET` ≥ 32 characters (enforced at startup)
- [ ] `FRONTEND_URL` set to actual production domain (not localhost)
- [ ] `NODE_ENV=production` set in production environment
- [ ] `METRICS_SECRET_KEY` configured to protect `/metrics` endpoint
- [ ] Database credentials not hardcoded — use `.env.prod` with `docker-compose.prod.yml`
- [ ] Redis password set via `REDIS_PASSWORD` in production
- [ ] SMTP credentials configured for email notification delivery
- [ ] Backups directory writable and `pg_dump` available in production container
