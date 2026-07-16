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

## Monorepo Project Structure

```
Enterprise-POS-System/
├── apps/
│   ├── api/                  # Fastify 5 Backend API
│   │   ├── prisma/           # Prisma DB schema and migrations
│   │   └── src/              # API controllers, modules, and services
│   └── web/                  # Next.js 16 Frontend Client
│       ├── src/
│       │   ├── app/          # App Router dashboard and public pages
│       │   ├── components/   # Reusable UI/POS components
│       │   ├── hooks/        # Stateful hooks and data query hooks
│       │   ├── services/     # API Service classes (axios clients)
│       │   └── stores/       # Zustand global stores (auth, pos, ui)
├── docker/                   # Production Nginx and Dockerfile scripts
├── docker-compose.yml        # Development Docker Compose file
├── docker-compose.prod.yml   # Production Docker Compose file
└── turbo.json                # Turborepo task pipeline config
```

---

## Documentation Index

Explore the comprehensive manuals to set up, operate, and contribute to this repository:

1.  [**Architecture Guide (`ARCHITECTURE.md`)**](./ARCHITECTURE.md) — Monorepo design, data flow, authentication, session sync, security layers, and data structure relationships.
2.  [**Developer Onboarding Guide (`DEVELOPMENT.md`)**](./DEVELOPMENT.md) — Prerequisites, local environment setup, configuration variables, database migrations, and testing workflows.
3.  [**API Reference Specification (`API.md`)**](./API.md) — API contract conventions, payload schemas, errors, and endpoints.
4.  [**Production Deployment Guide (`DEPLOYMENT.md`)**](./DEPLOYMENT.md) — Multi-container docker compose stack, Nginx proxy setup, health checks, automatic rollbacks, and backup routines.
5.  [**Contribution Guidelines (`CONTRIBUTING.md`)**](./CONTRIBUTING.md) — Branch naming standards, commit message format, code style, and Pull Request review checks.

---

## Getting Started (Quick Run)

For detailed instructions, refer to the [Developer Onboarding Guide](./DEVELOPMENT.md).

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Run local databases (PostgreSQL & Redis)
docker compose up -d postgres redis

# 3. Apply database schema and seed data
pnpm --filter @enterprise-pos/api db:migrate

# 4. Start the development environment
pnpm dev
```

The frontend will start on `http://localhost:3000` and the API backend on `http://localhost:4000`.

---

## License

This project is licensed under the [MIT License](LICENSE) (see the LICENSE file for details).
