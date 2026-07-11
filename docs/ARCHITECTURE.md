# Enterprise POS System — Architecture

> **Version:** 1.0.0  
> **Status:** Phase 0 — Documentation & Planning  
> **Last Updated:** 2026-07-11

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Architecture](#4-database-architecture)
5. [Authentication Flow](#5-authentication-flow)
6. [Request Flow](#6-request-flow)
7. [Data Flow](#7-data-flow)
8. [Monorepo Folder Structure](#8-monorepo-folder-structure)
9. [Scalability Plan](#9-scalability-plan)

---

## 1. High-Level Architecture

The Enterprise POS System is structured as a **monorepo** containing two main applications — a Next.js frontend and a Fastify backend API — alongside shared packages for types, UI components, and configuration.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│              Browser (Next.js Application)              │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                       NGINX                             │
│          Reverse Proxy / SSL Termination                │
│       Routes: / → Frontend   /api → Backend            │
└──────────┬───────────────────────────┬──────────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼────────────────┐
│   Next.js Frontend  │   │     Fastify API Server      │
│   (apps/web)        │   │     (apps/api)              │
│   Port: 3000        │   │     Port: 4000              │
└─────────────────────┘   └──────────┬──────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
┌─────────────▼──────┐  ┌────────────▼───────┐  ┌──────────▼──────────┐
│   PostgreSQL DB     │  │   Redis Cache      │  │  BullMQ Workers     │
│   (Primary Store)   │  │   (Sessions/Cache) │  │  (Background Jobs)  │
│   Port: 5432        │  │   Port: 6379       │  │                     │
└─────────────────────┘  └────────────────────┘  └─────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Nginx** | SSL termination, reverse proxy routing, static asset caching, rate limiting at network edge |
| **Next.js Frontend** | Server-side rendering, client-side UI, route protection, API communication |
| **Fastify API** | Business logic, authentication, data validation, database operations |
| **PostgreSQL** | Persistent relational data storage for all business entities |
| **Redis** | Refresh token store, session cache, rate limit counters, job queues |
| **BullMQ Workers** | Asynchronous background processing (emails, reports, backups) |

---

## 2. Frontend Architecture

### Framework & Rendering Strategy

The frontend is built with **Next.js 15** using the App Router. Page rendering strategy is chosen per route:

| Page Type | Strategy | Rationale |
|-----------|----------|-----------|
| Public pages (login, reset) | Static (SSG) | No authentication required, cacheable |
| Dashboard & analytics | Server-Side Rendering (SSR) | Fresh data on each load |
| POS interface | Client-Side Rendering (CSR) | Real-time interaction, no SSR latency |
| Reports | SSR + Client hydration | Initial data from server, filters client-side |

### State Management

| Layer | Tool | Scope |
|-------|------|-------|
| Server state (API data) | TanStack Query | Fetch, cache, sync, and invalidate remote data |
| Client/UI state | Zustand | Auth session, cart state, sidebar, theme, notifications |
| Form state | React Hook Form + Zod | Form validation and controlled submission |

### Frontend Module Structure

```
apps/web/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Public routes (login, reset password)
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── layout.tsx          # Dashboard shell (sidebar, topbar)
│   │   ├── page.tsx            # Overview dashboard
│   │   ├── pos/                # POS module
│   │   ├── inventory/          # Inventory module
│   │   ├── purchases/          # Purchase module
│   │   ├── customers/          # Customer module
│   │   ├── suppliers/          # Supplier module
│   │   ├── accounting/         # Accounting module
│   │   ├── reports/            # Reports module
│   │   ├── users/              # User management
│   │   └── settings/           # System settings
├── components/                 # Page-level composed components
│   ├── auth/
│   ├── pos/
│   ├── inventory/
│   └── shared/
├── hooks/                      # Custom React hooks
├── lib/                        # API client, utilities, constants
├── stores/                     # Zustand state stores
├── types/                      # Frontend-specific TypeScript types
└── middleware.ts               # Next.js route protection middleware
```

### UI Design System

The interface follows a **Modern Glass ERP** design language:

- **Theme**: Dual-mode (Dark / Light) with system preference detection
- **Style**: Glassmorphism panels with subtle blur and transparency
- **Typography**: Inter or Geist Sans via Google Fonts
- **Components**: shadcn/ui primitives extended with custom enterprise variants
- **Layout**: Fixed sidebar navigation with collapsible state, persistent top bar

---

## 3. Backend Architecture

### Framework Pattern

The Fastify API follows a **plugin-based modular architecture**. Each business domain is encapsulated as a Fastify plugin registered on a scoped route prefix.

```
apps/api/
├── src/
│   ├── server.ts               # Fastify server initialization
│   ├── app.ts                  # Plugin registration and configuration
│   ├── config/                 # Environment and app configuration
│   ├── plugins/                # Fastify core plugins
│   │   ├── auth.plugin.ts      # JWT and auth guards
│   │   ├── prisma.plugin.ts    # Database client plugin
│   │   ├── redis.plugin.ts     # Redis client plugin
│   │   └── rateLimit.plugin.ts # Rate limiting plugin
│   ├── modules/                # Business domain modules
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.handler.ts
│   │   ├── users/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── sales/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── accounting/
│   │   ├── reports/
│   │   └── settings/
│   ├── workers/                # BullMQ job workers
│   │   ├── email.worker.ts
│   │   ├── report.worker.ts
│   │   └── backup.worker.ts
│   ├── shared/                 # Shared utilities
│   │   ├── errors/             # Custom error classes
│   │   ├── middleware/         # Request middleware
│   │   └── utils/             # Helpers and formatters
│   └── types/                 # Backend TypeScript types
```

### Module Structure Pattern

Each module follows a consistent four-layer structure:

| Layer | File | Responsibility |
|-------|------|----------------|
| **Routes** | `*.routes.ts` | Register HTTP endpoints and attach handlers |
| **Schema** | `*.schema.ts` | Zod or Fastify JSON Schema for validation |
| **Handler** | `*.handler.ts` | Parse request, call service, format response |
| **Service** | `*.service.ts` | Business logic, database calls via Prisma |

### Background Job Processing

BullMQ manages all asynchronous workloads:

| Queue | Description |
|-------|-------------|
| `email-queue` | Send transactional emails (welcome, password reset, alerts) |
| `report-queue` | Generate large report exports in background |
| `backup-queue` | Scheduled database backup operations |
| `notification-queue` | Dispatch in-app and push notifications |

---

## 4. Database Architecture

### Database: PostgreSQL

PostgreSQL serves as the single source of truth for all persistent business data. Prisma ORM provides type-safe database access with schema-as-code migrations.

### Schema Organization

Database tables are logically grouped into domains:

| Domain | Tables |
|--------|--------|
| **Auth** | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens` |
| **Business** | `companies`, `branches`, `employees` |
| **Catalog** | `products`, `categories`, `brands`, `units`, `taxes`, `barcodes` |
| **Inventory** | `warehouses`, `stock`, `stock_movements`, `stock_transfers` |
| **Sales** | `sales`, `sale_items`, `invoices`, `payments` |
| **Purchase** | `purchases`, `purchase_items`, `purchase_returns` |
| **Customer** | `customers` |
| **Supplier** | `suppliers` |
| **Accounting** | `transactions`, `expenses`, `incomes` |
| **System** | `audit_logs`, `notifications`, `backups`, `settings` |

### Redis Usage

| Purpose | Key Pattern | TTL |
|---------|-------------|-----|
| Refresh token store | `refresh:{userId}:{tokenId}` | 7 days |
| Rate limit counters | `ratelimit:{ip}:{endpoint}` | 1 minute |
| Session cache | `session:{userId}` | 15 minutes |
| Report cache | `report:{hash}` | 30 minutes |
| Low stock cache | `stock:low:{branchId}` | 5 minutes |

---

## 5. Authentication Flow

```
┌──────────┐       ┌────────────┐       ┌───────────┐       ┌───────────┐
│  Client  │       │  Frontend  │       │    API    │       │  Redis /  │
│ Browser  │       │  Next.js   │       │  Fastify  │       │ PostgreSQL│
└────┬─────┘       └─────┬──────┘       └─────┬─────┘       └─────┬─────┘
     │                   │                    │                    │
     │  Enter credentials│                    │                    │
     │──────────────────►│                    │                    │
     │                   │  POST /auth/login  │                    │
     │                   │───────────────────►│                    │
     │                   │                    │  Verify credentials│
     │                   │                    │───────────────────►│
     │                   │                    │◄───────────────────│
     │                   │                    │  Store refresh token│
     │                   │                    │───────────────────►│
     │                   │  { accessToken }   │                    │
     │                   │  Set-Cookie: refreshToken (HttpOnly)    │
     │                   │◄───────────────────│                    │
     │  Dashboard loaded │                    │                    │
     │◄──────────────────│                    │                    │
     │                   │                    │                    │
     │  API Request      │                    │                    │
     │  (Bearer accessToken)                  │                    │
     │──────────────────►│                    │                    │
     │                   │  Forward to API    │                    │
     │                   │───────────────────►│                    │
     │                   │                    │  Validate JWT      │
     │                   │                    │  Check permissions │
     │                   │  Response          │                    │
     │                   │◄───────────────────│                    │
     │  Response data    │                    │                    │
     │◄──────────────────│                    │                    │
     │                   │                    │                    │
     │  Access token expired — silent refresh │                    │
     │──────────────────►│                    │                    │
     │                   │  POST /auth/refresh│                    │
     │                   │  (Cookie: refreshToken)                 │
     │                   │───────────────────►│                    │
     │                   │                    │  Validate + rotate │
     │                   │                    │  refresh token     │
     │                   │  { new accessToken}│                    │
     │                   │◄───────────────────│                    │
     │                   │                    │                    │
```

---

## 6. Request Flow

Every authenticated API request follows this processing pipeline:

```
HTTP Request
     │
     ▼
Nginx (proxy, TLS termination)
     │
     ▼
Fastify Server
     │
     ├── Rate Limit Check (Redis)
     │
     ├── CORS Validation
     │
     ├── Request Schema Validation (JSON Schema / Zod)
     │
     ├── JWT Verification (auth guard hook)
     │
     ├── Permission Check (RBAC guard hook)
     │
     ├── Route Handler
     │      │
     │      └── Service Layer (Business Logic)
     │             │
     │             ├── Prisma ORM (PostgreSQL)
     │             │
     │             └── Redis (cache read/write)
     │
     ├── Audit Log Write (async, non-blocking)
     │
     └── HTTP Response
```

---

## 7. Data Flow

### Sale Transaction Data Flow

```
POS UI
  │
  │  Cart data (products, quantities, discount, customer)
  ▼
POST /api/v1/sales
  │
  ├── Validate request schema
  ├── Check product availability (stock)
  ├── Calculate totals (tax, discount, grand total)
  ├── Create Sale record (PostgreSQL)
  ├── Create SaleItem records (PostgreSQL)
  ├── Create Invoice record (PostgreSQL)
  ├── Create Payment record (PostgreSQL)
  ├── Deduct stock per warehouse (StockMovement records)
  ├── Update Customer balance (if credit sale)
  ├── Create Income record (Accounting)
  ├── Enqueue notification job (BullMQ)
  ├── Invalidate stock cache (Redis)
  └── Write audit log entry
  │
  ▼
Response: { sale, invoice, receipt }
```

### Report Generation Data Flow

```
Report Request (date range, filters)
  │
  ▼
Check Redis cache (report hash)
  │
  ├── Cache HIT → Return cached result immediately
  │
  └── Cache MISS
        │
        ▼
        Enqueue report-queue job (BullMQ)
        │
        ▼
        Worker: Execute aggregation queries (PostgreSQL)
        │
        ▼
        Store result in Redis (30 min TTL)
        │
        ▼
        Return result to client
```

---

## 8. Monorepo Folder Structure

```
enterprise-pos-system/
│
├── apps/
│   ├── web/                    # Next.js 15 Frontend Application
│   │   ├── app/               # App Router pages and layouts
│   │   ├── components/        # Feature-specific components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client, utilities
│   │   ├── stores/            # Zustand state stores
│   │   ├── public/            # Static assets
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                    # Fastify Backend API
│       ├── src/
│       │   ├── modules/       # Business domain modules
│       │   ├── plugins/       # Fastify plugins
│       │   ├── workers/       # BullMQ job workers
│       │   ├── shared/        # Shared utilities and errors
│       │   ├── config/        # Configuration loader
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   └── migrations/    # Migration history
│       └── package.json
│
├── packages/
│   ├── ui/                     # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/   # Reusable shadcn/ui based components
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript type definitions
│   │   ├── src/
│   │   │   ├── api.types.ts  # API request/response types
│   │   │   ├── models.ts     # Business entity types
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared configuration and constants
│       ├── src/
│       │   ├── constants.ts
│       │   └── env.schema.ts
│       └── package.json
│
├── docs/                       # Project documentation (Phase 0)
├── docker/                     # Docker configuration files
│   ├── nginx/
│   │   └── nginx.conf
│   ├── postgres/
│   └── redis/
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Continuous integration
│       └── deploy.yml        # Production deployment
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── turbo.json                  # Turborepo pipeline configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package.json
```

---

## 9. Scalability Plan

### Vertical Scaling (Phase 1)

The initial deployment is designed for vertical scaling on a single server, which is sufficient for most small-to-medium deployments:

- Increase CPU/RAM on the application server
- Upgrade PostgreSQL instance size
- Tune Redis memory limits

### Horizontal Scaling (Phase 2)

As load increases, the architecture supports horizontal scaling without application changes:

| Component | Scaling Strategy |
|-----------|-----------------|
| **Next.js Frontend** | Multiple instances behind Nginx load balancer; stateless by design |
| **Fastify API** | Multiple instances behind Nginx upstream; JWT auth is stateless |
| **PostgreSQL** | Read replicas for heavy read workloads; connection pooling via PgBouncer |
| **Redis** | Redis Sentinel for HA; Redis Cluster for high-throughput workloads |
| **BullMQ Workers** | Additional worker processes can be spawned independently |

### Database Partitioning (Phase 3)

For extremely high-volume data:

- **Audit logs** — partition by month (range partitioning)
- **Stock movements** — partition by date for archiving historical data
- **Notifications** — archive and truncate older records automatically

### Multi-Tenancy Readiness

The data model includes `company_id` and `branch_id` foreign keys on all business entities. This design enables future conversion to a multi-tenant SaaS model using row-level data isolation without architectural changes.

---

*This document is part of the Enterprise POS System Phase 0 documentation suite.*
