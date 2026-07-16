# Developer Onboarding Guide — Enterprise POS System

This document contains step-by-step setup, configuration, and coding standards guidelines to begin local development.

---

## Prerequisites

Ensure the following tools are installed on your machine:

| Tool           | Recommended Version | Purpose                   |
| -------------- | ------------------- | ------------------------- |
| **Node.js**    | `v20.x` LTS         | Runtime                   |
| **pnpm**       | `v9.x`              | Monorepo package manager  |
| **Docker**     | `24+`               | Container runtimes (DBs)  |
| **PostgreSQL** | `16.x`              | Database engine           |
| **Redis**      | `7.x`               | Cache and key-value store |

---

## Local Setup

### 1. Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/akramhossain-dev/Enterprise-POS-System.git
cd Enterprise-POS-System

# Install workspace dependencies
pnpm install
```

### 2. Configure Environment Files

Copy the default template files and configure your local settings:

- **API Configuration:** Copy `apps/api/.env.example` to `apps/api/.env`
- **Web Client Configuration:** Copy `apps/web/.env.example` to `apps/web/.env.local`

---

## Environment Configuration

### API Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=4000
APP_NAME=Enterprise POS API

# Database Connection (Prisma URL format)
DATABASE_URL=postgresql://pos_user:pos_password@localhost:5432/enterprise_pos

# Cache Connection
REDIS_URL=redis://localhost:6379

# Client CORS
FRONTEND_URL=http://localhost:3000

# Security Secrets (Must be at least 32 characters in production)
JWT_SECRET=change_me_to_a_secure_random_string_of_at_least_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=change_me_to_another_secure_random_string_of_at_least_32_chars
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Web Client (`apps/web/.env.local`)

```env
# URL pointing to the API Gateway
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_NAME="Enterprise POS Client"
```

---

## Database Setup

Initialize local databases via Docker Compose:

```bash
# 1. Start PostgreSQL and Redis containers
docker compose up -d postgres redis

# 2. Run Prisma schema migrations (sets up tables)
pnpm --filter @enterprise-pos/api prisma:migrate

# 3. Seed database with initial setup data (roles, admins)
pnpm --filter @enterprise-pos/api db:seed
```

---

## Core Development Commands

Execute these commands from the repository root:

| Command              | Action                                                |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Start development servers for both apps in parallel   |
| `pnpm build`         | Compile both backend and frontend applications        |
| `pnpm lint`          | Run ESLint static check across the codebase           |
| `pnpm format`        | Re-format source files using Prettier                 |
| `pnpm type-check`    | Run compiler checks (`tsc`) across workspace packages |
| `pnpm test`          | Run the Vitest unit/integration test suites           |
| `pnpm test:coverage` | Run tests and generate coverage report                |

---

## Testing & Coverage

We use **Vitest** for unit and component testing.

- To run tests: `pnpm test`
- To run coverage: `pnpm test:coverage`

We maintain a strict quality threshold: **Statements: 80%**, **Branches: 75%**, **Functions: 80%**, **Lines: 80%**. Ensure all new utility functions and logic files are accompanied by unit tests inside `src/tests/unit/`.

---

## Git Workflow Standards

### Branch Naming Conventions

- `main` — Production release ready branch (locked).
- `develop` — Workspace integration branch (default target for PRs).
- `feature/F-XXX-<short-desc>` — New features.
- `fix/F-XXX-<short-desc>` — Bug fixes.

### Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`.

Example:
`feat(pos): add barcode scanner event handler`
