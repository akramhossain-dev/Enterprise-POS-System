# Enterprise POS System

> Production-grade retail management platform built with Fastify, Next.js, PostgreSQL, and Redis.

**Current Status:** Phase B1 — Backend Foundation ✅ | Phase F1 — Frontend Foundation ✅

---

## Overview

Enterprise POS System is a comprehensive retail management solution supporting:

| Module                    | Status              |
| ------------------------- | ------------------- |
| Point of Sale (POS)       | Planned (Phase B8)  |
| Inventory Management      | Planned (Phase B6)  |
| Purchase Management       | Planned (Phase B7)  |
| Customer Management       | Planned (Phase B5)  |
| Supplier Management       | Planned (Phase B5)  |
| Accounting                | Planned (Phase B9)  |
| Reports & Analytics       | Planned (Phase B10) |
| Multi-Branch Support      | Planned (Phase B3)  |
| Role-Based Access Control | Planned (Phase B2)  |

---

## Tech Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| Runtime           | Node.js 20                 |
| Backend Framework | Fastify 5                  |
| Language          | TypeScript 5 (strict mode) |
| Package Manager   | pnpm 9                     |
| ORM               | Prisma 6                   |
| Database          | PostgreSQL 16              |
| Cache             | Redis 7 (ioredis)          |
| Validation        | Zod                        |
| Logging           | Pino                       |
| API Docs          | Swagger / OpenAPI 3.0      |
| Infrastructure    | Docker + Docker Compose    |
| CI                | GitHub Actions             |
| **Frontend**      | Next.js 15 + React 19      |
| **Styling**       | Tailwind CSS v4            |
| **State**         | Zustand + TanStack Query   |
| **Forms**         | React Hook Form + Zod      |

---

## Project Structure

```
enterprise-pos-system/
├── apps/
│   ├── api/                    # Fastify Backend (Phase B1+)
│   │   ├── src/
│   │   │   ├── server.ts       # Entry point
│   │   │   ├── app.ts          # App factory
│   │   │   ├── config/         # Env validation
│   │   │   ├── plugins/        # Fastify plugins
│   │   │   ├── routes/         # Route definitions
│   │   │   ├── common/         # Errors, responses, utils
│   │   │   ├── lib/            # Logger, database
│   │   │   ├── types/          # TypeScript types
│   │   │   └── modules/        # Business modules (future)
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   └── web/                    # Next.js Frontend (Phase F1+)
├── packages/
│   ├── ui/                     # Shared UI components (Phase F1)
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configuration
├── docker/
│   ├── nginx/nginx.conf        # Nginx reverse proxy config
│   └── postgres/init.sql       # Database initialization
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI
├── .vscode/                    # VS Code configuration
├── docker-compose.yml          # Development environment
├── Dockerfile                  # Production API image
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspaces
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/your-org/enterprise-pos-system.git
cd enterprise-pos-system
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your configuration:

```env
NODE_ENV=development
PORT=4000
APP_NAME=Enterprise POS API
DATABASE_URL=postgresql://pos_user:pos_password@localhost:5432/enterprise_pos
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

### 4. Start infrastructure (Docker)

```bash
# Start PostgreSQL + Redis
docker compose up postgres redis -d

# Or start everything including the API
docker compose up -d
```

### 5. Generate Prisma client

```bash
pnpm --filter @enterprise-pos/api prisma:generate
```

### 6. Start development server

```bash
pnpm --filter @enterprise-pos/api dev
```

The API will be available at:

- **API Root:** http://localhost:4000/api/v1
- **Health Check:** http://localhost:4000/api/v1/health
- **Swagger Docs:** http://localhost:4000/docs

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# Start only database services (for local dev)
docker compose up postgres redis -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild the API image
docker compose build api --no-cache
```

---

## Development Commands

```bash
# Install all workspace dependencies
pnpm install

# Start API in development mode (with hot reload)
pnpm --filter @enterprise-pos/api dev

# Build API for production
pnpm --filter @enterprise-pos/api build

# Type check
pnpm --filter @enterprise-pos/api type-check

# Lint
pnpm --filter @enterprise-pos/api lint

# Fix lint issues
pnpm --filter @enterprise-pos/api lint:fix

# Format code
pnpm --filter @enterprise-pos/api format

# Prisma commands
pnpm --filter @enterprise-pos/api prisma:generate
pnpm --filter @enterprise-pos/api prisma:migrate
pnpm --filter @enterprise-pos/api prisma:studio

# Run all workspace commands via Turborepo
pnpm build          # Build all packages
pnpm lint           # Lint all packages
pnpm type-check     # Type-check all packages
```

---

## Frontend Commands (Phase F1)

```bash
# Start frontend dev server (http://localhost:3000)
pnpm --filter @enterprise-pos/web dev

# Build frontend for production
pnpm --filter @enterprise-pos/web build

# Type check frontend
pnpm --filter @enterprise-pos/web type-check

# Lint frontend
pnpm --filter @enterprise-pos/web lint
```

---

## API Endpoints (Phase B1)

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| `GET`  | `/api/v1/`       | API root — confirms server is running |
| `GET`  | `/api/v1/health` | Health check                          |
| `GET`  | `/docs`          | Swagger UI                            |

---

## Environment Variables

| Variable       | Required | Default                 | Description                  |
| -------------- | -------- | ----------------------- | ---------------------------- |
| `NODE_ENV`     | No       | `development`           | Application environment      |
| `PORT`         | No       | `4000`                  | Server port                  |
| `APP_NAME`     | No       | `Enterprise POS API`    | Application display name     |
| `DATABASE_URL` | **Yes**  | —                       | PostgreSQL connection string |
| `REDIS_URL`    | **Yes**  | —                       | Redis connection string      |
| `FRONTEND_URL` | No       | `http://localhost:3000` | Allowed CORS origin          |

---

## Development Phases

| Phase  | Track    | Description           | Status      |
| ------ | -------- | --------------------- | ----------- |
| B1     | Backend  | Foundation            | ✅ Complete |
| B2     | Backend  | Authentication & RBAC | 🔜 Next     |
| B3     | Backend  | Core Business System  | Planned     |
| B4     | Backend  | Product Management    | Planned     |
| B5     | Backend  | Customer & Supplier   | Planned     |
| B6     | Backend  | Inventory             | Planned     |
| B7     | Backend  | Purchase              | Planned     |
| B8     | Backend  | Sales & POS           | Planned     |
| B9     | Backend  | Accounting            | Planned     |
| B10    | Backend  | Reports               | Planned     |
| B11    | Backend  | Enterprise Features   | Planned     |
| B12    | Backend  | Production Ready      | Planned     |
| F1     | Frontend | Foundation            | ✅ Complete |
| F2–F12 | Frontend | UI Modules            | Planned     |

See [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md) for the complete roadmap.

---

## Documentation

| Document                                                     | Description                        |
| ------------------------------------------------------------ | ---------------------------------- |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md)       | Project introduction and scope     |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)               | System architecture and data flows |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md)                   | Technology choices and rationale   |
| [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md)         | Database entity design             |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)     | API endpoint reference             |
| [`docs/AUTH_SYSTEM.md`](docs/AUTH_SYSTEM.md)                 | Authentication architecture        |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)                   | Deployment guide                   |
| [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md) | Phase-by-phase roadmap             |

---

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes (follow the existing code patterns)
3. Run checks: `pnpm lint && pnpm type-check`
4. Commit: `git commit -m "feat: your feature"` (Husky runs pre-commit checks)
5. Push and open a PR against `develop`

---

_Enterprise POS System — Phase B1 Backend Foundation_
