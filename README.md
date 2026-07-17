# Enterprise POS System

A production-grade, secure, and highly performant point-of-sale (POS) and retail management platform built with modern web technologies.

---

## Tech Stack

The application is structured as a TypeScript monorepo utilizing high-efficiency frameworks for both client and API services:

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand v5, TanStack Query v5, Axios.
- **Backend:** Fastify 5, Prisma 6 ORM, PostgreSQL 16, Redis 7.
- **Quality & Testing:** Vitest, React Testing Library, MSW 2.x, Playwright.
- **Infrastructure:** Docker, Docker Compose, Nginx, GitHub Actions CI/CD.

---

## Documentation Index

Explore the detailed manuals inside the `docs/` directory to configure, deploy, and maintain the repository:

1.  [**Architecture Guide (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md) — System designs, client state structures, token lifecycles, and database relationship structures.
2.  [**Developer Onboarding Guide (`docs/DEVELOPMENT.md`)**](./docs/DEVELOPMENT.md) — Local environments setup, configuration variables, migration commands, and test runners.
3.  [**API Reference Specification (`docs/API.md`)**](./docs/API.md) — Service base URLs, headers, payloads, standard error codes, and endpoint routing specs.
4.  [**Production Deployment Guide (`docs/DEPLOYMENT.md`)**](./docs/DEPLOYMENT.md) — Multi-container docker orchestration, post-deployment health validations, auto-rollback processes, and database backup scripts.
5.  [**Security Architecture Guide (`docs/SECURITY.md`)**](./docs/SECURITY.md) — Authorization model, cookie security, request validations, rate limiting, and container vulnerability scans.
6.  [**Project Codebase Directory Map (`docs/PROJECT_STRUCTURE.md`)**](./docs/PROJECT_STRUCTURE.md) — Directory hierarchies of the backend modules and frontend client workspaces.
7.  [**Contribution Guidelines (`docs/CONTRIBUTING.md`)**](./docs/CONTRIBUTING.md) — Git branching rules, Conventional Commit formats, and PR validation checks.

---

## Quick Start (Local Run)

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Run local databases (PostgreSQL & Redis)
docker compose up -d postgres redis

# 3. Synchronize schema, apply migrations, and run seed data
pnpm --filter @enterprise-pos/api exec prisma migrate dev
pnpm --filter @enterprise-pos/api run db:seed

# 4. Start the development environment
pnpm dev
```

### Seeded Credentials

Use these default user accounts to log in and test different system permission tiers:

- **System Admin:** `admin@enterprise-pos.com` / `admin123`
- **System Manager:** `manager@enterprise-pos.com` / `manager123`
- **Jane Cashier:** `cashier@enterprise-pos.com` / `cashier123`

The frontend will start on `http://localhost:3000` and the API backend on `http://localhost:4000`.

---

## License

This project is licensed under the [MIT License](LICENSE) (see the LICENSE file for details).
