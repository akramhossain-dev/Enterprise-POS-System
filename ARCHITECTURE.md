# Architecture Guide — Enterprise POS System

## Monorepo Structure

```
Enterprise-POS-System/
├── apps/
│   ├── web/          # Next.js 16 frontend application
│   └── api/          # Fastify 5 backend API
├── docs/             # Extended documentation
├── docker/           # Docker configurations
└── turbo.json        # Turborepo pipeline config
```

---

## Frontend Architecture (`apps/web`)

### Technology Stack

| Layer         | Technology                | Purpose                             |
| ------------- | ------------------------- | ----------------------------------- |
| Framework     | Next.js 16 (App Router)   | SSR, routing, API routes            |
| Language      | TypeScript 5 (strict)     | Type safety                         |
| Styling       | Tailwind CSS v4           | Utility-first CSS                   |
| UI Library    | shadcn/ui + Radix UI      | Accessible component primitives     |
| State         | Zustand v5                | Client-side global state            |
| Data Fetching | TanStack Query v5         | Server state, caching, mutations    |
| HTTP Client   | Axios                     | API communication with interceptors |
| Forms         | React Hook Form + Zod     | Form state and validation           |
| Animation     | Framer Motion             | UI transitions                      |
| Charts        | Recharts                  | Data visualization                  |
| Testing       | Vitest + RTL + Playwright | Unit, component, E2E                |

### Directory Layout

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Public auth pages (login, forgot-password, etc.)
│   ├── (dashboard)/      # Protected dashboard pages
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable UI components
│   ├── accounting/       # Accounting-specific components
│   ├── analytics/        # Analytics and chart components
│   ├── bi/               # Business intelligence widgets
│   ├── common/           # Shared security components (ErrorBoundary, PermissionGuard)
│   ├── dashboard/        # Dashboard cards and charts
│   ├── layout/           # Sidebar, TopNavbar, PageContainer, etc.
│   ├── pos/              # POS terminal components
│   ├── reports/          # Report table and filter components
│   └── ui/               # shadcn/ui primitives
├── config/               # App, API, auth, navigation config
├── constants/            # Application-wide constants
├── hooks/                # TanStack Query hooks (one per domain)
├── lib/                  # Axios instance, QueryClient factory
├── providers/            # React context providers (Auth, Query, Theme, Toast)
├── services/             # API service classes (one per domain)
├── stores/               # Zustand stores (auth, ui, pos)
├── tests/                # Test infrastructure
│   ├── msw/              # MSW API mock handlers and server
│   └── unit/             # Unit and component tests
├── types/                # TypeScript type definitions (one per domain)
└── utils/                # Pure utility functions (format, error, validators, cn)
```

---

## Data Flow

```
User Action
    │
    ▼
React Component
    │
    ▼
TanStack Query Hook  (e.g., useCreateProduct)
    │
    ▼
Service Class         (e.g., ProductService.create)
    │
    ▼
Axios Instance        (with auth interceptor, retry, refresh)
    │
    ▼
Backend API           (Fastify REST)
    │
    ▼
TanStack Query Cache  (invalidated on mutation success)
    │
    ▼
UI Re-renders
```

---

## Authentication Flow

1. User submits login form → `AuthService.login()` → access token stored in **memory** (`tokenManager`)
2. `httpOnly` refresh cookie stored by the browser automatically
3. Every request: Axios request interceptor appends `Authorization: Bearer <token>`
4. On 401 response: Axios response interceptor calls `refreshAccessToken()` once (singleton promise)
5. On refresh failure: `tokenManager.clearTokens()` + redirect to `/login`
6. Session idle timeout (15 min): `useSessionTimeout` hook detects inactivity, BroadcastChannel syncs logout to all tabs

---

## Permission System

- Roles and permissions stored on the `User` object in `auth.store`
- `useAuthStore().hasPermission(key)` — checks a specific permission string
- `useAuthStore().hasRole(role)` — checks a single role
- `useAuthStore().hasAnyRole(roles[])` — checks against multiple roles
- `<PermissionGuard permission="X">` — conditionally renders UI elements
- Middleware (`middleware.ts`) enforces route-level auth server-side

---

## State Management

| Store        | Purpose                                        |
| ------------ | ---------------------------------------------- |
| `auth.store` | User, authentication state, permission helpers |
| `ui.store`   | Sidebar collapsed state, modal states, theme   |
| `pos.store`  | Active POS session, cart, held orders          |

All stores use Zustand with `devtools` and `persist` middleware where appropriate.

---

## Security Model

| Layer            | Implementation                                             |
| ---------------- | ---------------------------------------------------------- |
| Token storage    | Access token in-memory only (never localStorage)           |
| Refresh token    | httpOnly cookie (XSS-proof)                                |
| Route protection | Next.js middleware + client-side auth guards               |
| Permission gates | `<PermissionGuard>` + `hasPermission()`                    |
| Session timeout  | 15-min idle detection with BroadcastChannel multi-tab sync |
| Error boundaries | React ErrorBoundary (class) + Next.js `error.tsx`          |
| Offline handling | `<OfflineBanner>` with connection event listeners          |

---

## API Layer

- All API calls go through typed service classes extending `ApiClient`
- `ApiClient` provides typed `get`, `post`, `put`, `patch`, `delete` methods
- Axios instance has request interceptor (auth header) and response interceptor (token refresh + error normalization)
- Errors are normalized via `normalizeError()` into a consistent `ApiError` shape
- Some services include simulator fallbacks for demo/staging environments when the backend is unavailable

---

## Testing Architecture

| Layer       | Tool                | Location          |
| ----------- | ------------------- | ----------------- |
| Unit tests  | Vitest + RTL        | `src/tests/unit/` |
| API mocking | MSW 2.x             | `src/tests/msw/`  |
| E2E tests   | Playwright          | `e2e/`            |
| Coverage    | @vitest/coverage-v8 | `coverage/`       |

Run `pnpm --filter web test` — 100 tests, 0 failures.
