# Security Architecture Guide — Enterprise POS System

This document outlines the security boundaries, data encryption standards, access control models, and hardening strategies implemented across the application layers.

---

## 1. Authentication Security

The system employs a stateless, token-based authentication mechanism designed to resist interception and session hijacking:

- **Access Tokens:** Short-lived JWTs (15-minute lifespan) containing user identifiers and permissions. Access tokens are held exclusively in-memory on the client and are never written to local or session browser storage.
- **Refresh Tokens:** Long-lived tokens (7-day lifespan) stored inside secure, browser-managed cookies:
  - `httpOnly`: Prevents client-side scripts (such as XSS attacks) from reading token bytes.
  - `Secure`: Restricted to HTTPS transmissions only (except on localhost).
  - `SameSite=Strict`: Shields session cookies from Cross-Site Request Forgery (CSRF).
- **Multi-Tab Synchronization:** A client-side `BroadcastChannel` instance communicates session changes (e.g. logging out or session expiration) instantly to all open browser tabs, forcing immediate state sync and page redirection.

---

## 2. Authorization & Role-Based Access Control (RBAC)

The application enforces a fine-grained permission-based control model:

- **Hierarchy:** Users are assigned a primary role (`super_admin`, `admin`, `manager`, `cashier`, `viewer`) and a list of specific permission keys (e.g., `products:create`, `reports:read`).
- **Frontend Gates:** The React interface uses the `<PermissionGuard>` component to block or render sections depending on Zustand auth store records.
- **Backend Enforcements:** Server routers validate the user's role and permission scope within route hook checks before dispatching payload processing handlers.

---

## 3. Cryptography & Password Hardening

- **Password Hashing:** Passwords are encrypted before database persistence using the **bcrypt** algorithm.
- **Validation Rules:** User registration or password changes check candidate strings against a strict validation layout requiring a minimum of 8 characters, capital/lowercase letters, digits, and special characters.

---

## 4. API & Request Security

- **Input Validation:** Every endpoint validates incoming parameters, query variables, and request body elements against a designated **Zod schema**. Requests with unexpected variables or wrong types are rejected at the parsing middleware layer with a `400 Bad Request`.
- **CORS (Cross-Origin Resource Sharing):** API endpoints permit requests strictly from the domain configured in `FRONTEND_URL`.
- **Rate Limiting:** Protects routing pathways against denial-of-service (DoS) and brute force attacks using a sliding window cache managed inside Redis.

---

## 5. Storage & Database Security

- **SQL Injection Prevention:** Database access utilizes **Prisma ORM**, which relies on parameterized queries. This separates parameters from query logic, rendering typical SQL injection vectors completely ineffective.
- **Secrets Isolation:** Database passwords, JWT keys, and API credentials are kept out of code versions. They are read from restricted-permission environment files on the server or injected from GitHub Secrets during build pipelines.

---

## 6. Docker & CI/CD Pipeline Hardening

- **Least Privilege:** All Docker services (including the Next.js frontend container) run as designated non-root users (`nextjs` / `nodejs`), securing the host filesystem in the event of container breakouts.
- **Secrets Scanner:** The GitHub Actions CI pipeline runs **Gitleaks** on every push to detect accidentally committed tokens or configuration credentials.
- **Vulnerability Scanning:** The Docker build workflow scans images for known CVEs using **Trivy** before uploading compiled containers to the container registry.

---

## 7. Security Checklist

- [ ] Force all web client traffic to HTTPS with SSL certificates.
- [ ] Configure UFW firewall on servers to permit only SSH, HTTP, and HTTPS ports.
- [ ] Generate highly random 48-character hex strings for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
- [ ] Apply read-only permissions (`chmod 600`) to the `.env.prod` environment configuration file.
- [ ] Block remote login credentials for the default PostgreSQL root administrator account.
