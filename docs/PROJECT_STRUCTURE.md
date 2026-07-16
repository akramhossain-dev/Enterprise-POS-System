# Project Codebase Directory Map — Enterprise POS System

This guide outlines the filesystem layout of the monorepo, detailing the locations of components, services, database configurations, and environment scripts.

---

## 1. Monorepo Root Directory Layout

```
Enterprise-POS-System/
├── apps/                     # Application packages
│   ├── api/                  # Node.js API Service (Fastify 5 Backend)
│   └── web/                  # Next.js 16 Client Portal (Frontend)
├── docker/                   # Deployment scripts, Nginx configurations
│   ├── nginx/
│   │   └── nginx.prod.conf   # Production Nginx reverse proxy routes
│   └── web.Dockerfile        # Production multi-stage Docker build config
├── docs/                     # Detailed project documentation manuals
├── .github/                  # CI/CD Workflows
│   └── workflows/
│       ├── ci.yml            # Code Quality lint/check/test pipeline
│       ├── docker.yml        # Multi-stage image build and Trivy scan
│       └── deploy.yml        # Server deploy & rollback script
├── docker-compose.yml        # Local development databases compose layout
├── docker-compose.prod.yml   # Production container orchestration compose
├── pnpm-workspace.yaml       # pnpm package workspace definition
├── package.json              # Monorepo dependency configuration
└── turbo.json                # Turborepo build pipeline caching layout
```

---

## 2. API Backend Structure (`apps/api`)

The backend is written in TypeScript and powered by **Fastify 5**:

```
apps/api/
├── prisma/                   # Schema design files and SQL migration history
│   ├── migrations/           # Database migration versions
│   └── schema.prisma         # Prisma data relationships configuration
├── src/
│   ├── config/               # JWT settings, database logs configurations
│   ├── modules/              # Core domain layers (auth, inventory, products)
│   │   └── <domain>/
│   │       ├── controller.ts # Controller route mapping and request parsing
│   │       ├── schema.ts     # Input validation schema layouts (Zod)
│   │       └── service.ts    # Business logic execution operations
│   ├── utils/                # Password encryption helpers, error mappings
│   └── app.ts                # Fastify server initialization & route registration
├── package.json              # Package script definitions
└── tsconfig.json             # API typescript compilation config
```

---

## 3. Frontend Web Structure (`apps/web`)

The frontend is a **Next.js 16** application:

```
apps/web/
├── src/
│   ├── app/                  # App Router page directory
│   │   ├── (auth)/           # Authentication layout and login routes
│   │   ├── (dashboard)/      # Protected ERP inventory, products pages
│   │   └── (pos)/            # Cashier transaction checkout interface
│   ├── components/           # Reusable user interface components
│   │   ├── ui/               # Base styled components (shadcn/ui layout)
│   │   ├── dashboard/        # Charts, metrics display components
│   │   └── pos/              # Receipt modulators, transaction carts
│   ├── config/               # API endpoints, authorization mappings
│   ├── hooks/                # Stateful hooks, React Query API bindings
│   ├── services/             # Class definitions query axios instances
│   │   ├── api-client.ts     # Base wrapper client with typing
│   │   └── auth.service.ts   # Core authentication service logic
│   ├── stores/               # Zustand global data containers
│   │   ├── auth.store.ts     # Stores user sessions, roles, permissions
│   │   └── pos.store.ts      # Active transaction cart, cashier session state
│   ├── tests/                # Test configuration & unit/component tests
│   │   ├── msw/              # Mock Service Worker handlers & servers
│   │   └── unit/             # Vitest test suites (utils, hooks, components)
│   └── utils/                # Number converters, validation regexes
├── package.json              # Web package dependencies
├── tailwind.config.ts        # Styling specifications
└── tsconfig.json             # Frontend typescript compilation settings
```
