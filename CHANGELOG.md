# Changelog — Enterprise POS System

All notable changes to this project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### In Progress

- Backend API integration for production environment

---

## [0.12.0] — Phase F12: Final Production Release

### Removed

- Deleted 5 unused default Next.js scaffold SVG assets (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)
- Removed silent `console.error` calls from 4 product creation pages

### Fixed

- `slugify()` now correctly strips leading/trailing hyphens from whitespace-padded inputs
- All 4 product creation pages now surface workspace-missing errors as visible `toast.error()` alerts

### Added

- `ARCHITECTURE.md` — system architecture and data flow documentation
- `CHANGELOG.md` — this file
- `CONTRIBUTING.md` — contributor guidelines
- `DEPLOYMENT.md` — production deployment guide
- `PRODUCTION_CHECKLIST.md` — pre-launch verification checklist

### Changed

- ESLint auto-fix pass removing unused import warnings across accounting and auth pages

---

## [0.11.4] — Phase F11.4: Testing, QA & Production Validation

### Added

- Vitest + React Testing Library testing infrastructure
- MSW 2.x API mock server with handlers for auth, products, customers, error scenarios
- Playwright E2E configuration (Chrome, Firefox, Mobile Chrome)
- 100 unit and component tests (100% passing)
- `TESTING.md` documentation

### Fixed

- `ErrorBoundary` missing `override` keyword on TypeScript class members

---

## [0.11.3] — Phase F11.3: Security Hardening & Error Handling

### Added

- `useSessionTimeout` hook: 15-min idle detection with BroadcastChannel multi-tab sync
- `<PermissionGuard>` component: RBAC-based conditional rendering
- `<ErrorBoundary>` class component: catches render exceptions gracefully
- `<OfflineBanner>` component: online/offline connection status indicator

### Changed

- Dashboard layout now mounts session timeout, offline banner, and error boundary

---

## [0.11.2] — Phase F11.2: Accessibility, SEO & Metadata

### Added

- `sitemap.ts` — dynamic Next.js sitemap generation
- `robots.ts` — crawler policy (blocks POS and closing routes)
- `manifest.ts` — PWA standalone manifest
- `<SkipLink>` — keyboard skip-to-main-content link

### Changed

- `<PageContainer>` now renders semantic `<main id="main-content">` element

---

## [0.11.1] — Phase F11.1: Performance Optimization

### Changed

- Recharts wrappers converted to `next/dynamic` with `ssr: false`
- `ForecastChart`, `DrilldownCard`, `HeatmapCard` lazy-loaded
- `ReportTable` sorting/filtering memoized with `React.useMemo`

---

## [0.10.3] — Phase F10.3: Advanced Analytics & BI

### Added

- `/bi` — Business Intelligence hub
- `/bi/analytics` — drill-down analytics with breadcrumb navigation
- `/bi/forecast` — dual-line forecasting chart
- `/bi/trends` — trend analysis views
- `/bi/insights/customer` and `/bi/insights/supplier`
- `/bi/widgets` — customizable KPI widget builder
- `KpiBuilderDialog`, `ForecastChart`, `HeatmapCard`, `DrilldownCard` components

---

## [0.10.2] — Phase F10.2: Operational Reports & Export Center

### Added

- `/reports` — Report hub with category cards
- `/reports/sales`, `/reports/purchase`, `/reports/inventory`, `/reports/customer`, `/reports/supplier`, `/reports/employee`, `/reports/tax`, `/reports/payments`, `/reports/audit`
- `/reports/export` — Export center with format selection
- `/reports/print` — Print preview center
- `/reports/scheduled` — Report scheduling with cron jobs
- `ReportTable` with filtering, sorting, and pagination

---

## [0.10.1] — Phase F10.1: Executive Dashboard

### Added

- `/analytics/dashboard` — Executive KPI dashboard
- `/analytics/overview`, `/analytics/sales`, `/analytics/purchase`, `/analytics/inventory`
- `/analytics/customer`, `/analytics/supplier`, `/analytics/employee`, `/analytics/branch`, `/analytics/warehouse`
- Real-time KPI cards, trend sparklines, comparative charts

---

## [0.9.3] — Phase F9.3: Financial Statements & Accounting Closing

### Added

- `/accounting/statements/profit-loss`
- `/accounting/statements/balance-sheet`
- `/accounting/statements/cash-flow`
- `/accounting/statements/trial-balance`
- `/accounting/tax` — Tax management
- `/accounting/periods` — Fiscal period management
- `/accounting/closing` — Period closing workflow

---

## [0.9.2] — Phase F9.2: Journal Entries, Ledger & Cash/Bank Management

### Added

- `/accounting/journals` — Journal entries with CRUD
- `/accounting/general-ledger` — General ledger
- `/accounting/account-ledger` — Per-account ledger
- `/accounting/income` and `/accounting/expense`
- `/accounting/cash-book` and `/accounting/bank-book`
- `/accounting/payment-vouchers` and `/accounting/receipt-vouchers`

---

## [0.9.1] — Phase F9.1: Accounting Dashboard & Chart of Accounts

### Added

- `/accounting` — Accounting dashboard
- `/accounting/accounts` — Chart of accounts with full CRUD
- `/accounting/groups` — Account groups
- `/accounting/categories` — Account categories
- `/accounting/audit` — Audit trail

---

## [0.8.3] — Phase F8.3: Sales Returns & Order History

### Added

- `/pos/returns` — Sales return management
- `/pos/refunds` — Refund processing
- `/pos/orders` — Order history

---

## [0.8.2] — Phase F8.2: Checkout, Payment & Receipt Management

### Added

- `/pos/payments` — Payment processing
- `/pos/receipts` — Receipt management
- `/pos/held-orders` — Hold/recall orders
- `/pos/cash-drawer` — Cash drawer management

---

## [0.8.1] — Phase F8.1: Enterprise POS Terminal

### Added

- `/pos` — Full POS terminal with barcode scanning, cart, discounts
- `pos.store` — Cart and session state management
- Quick product search, category filters, payment modals

---

## [0.7.3] — Phase F7.3: Purchase Returns, Credit Notes & Debit Notes

### Added

- `/purchase/returns` — Purchase return management
- `/purchase/credit-notes` — Supplier credit notes
- `/purchase/debit-notes` — Supplier debit notes

---

## [0.7.2] — Phase F7.2: Goods Receive & Supplier Invoices

### Added

- `/purchase/receive` — Goods receive (GRN) workflow
- `/purchase/invoices` — Supplier invoice management
- `/purchase/matching` — Invoice matching

---

## [0.7.1] — Phase F7.1: Purchase Requisitions & Purchase Orders

### Added

- `/purchase/requisitions` — Purchase requisition workflow
- `/purchase/orders` — Purchase order management with approval workflow

---

## [0.6.3] — Phase F6.3: Stock Adjustments & Stock Transfers

### Added

- `/inventory/adjustments` — Stock adjustment management
- `/inventory/transfers` — Inter-branch stock transfer management

---

## [0.6.2] — Phase F6.2: Inventory & Stock Management

### Added

- `/inventory` — Full inventory management
- `/inventory/low-stock`, `/inventory/out-of-stock`, `/inventory/expiring`
- `/inventory/batches`, `/inventory/serials`
- `/inventory/cycle-count` — Stocktake/cycle count

---

## [0.6.1] — Phase F6.1: Warehouse & Branch Management

### Added

- `/warehouses` — Warehouse management
- `/branches` — Branch management
- `/storage-locations` — Storage location management

---

## [0.5.3] — Phase F5.3: Administration & RBAC

### Added

- `/roles` — Role management with permission matrix
- `/users` — User account management
- `/employees` — Employee profiles
- `/departments` and `/designations`

---

## [0.5.2] — Phase F5.2: Supplier Management

### Added

- `/suppliers` — Full supplier management with CRUD

---

## [0.5.1] — Phase F5.1: Customer Management

### Added

- `/customers` — Full customer management with CRUD

---

## [0.4.2] — Phase F4.2: Category, Brand & Unit Management

### Added

- `/products/categories` — Product category management
- `/products/brands` — Brand management
- `/products/units` — Unit of measure management

---

## [0.4.1] — Phase F4.1: Product Management

### Added

- `/products` — Full product catalog management with CRUD

---

## [0.3.0] — Phase F3: Dashboard Layout & Admin Workspace

### Added

- Collapsible sidebar with full navigation
- Top navbar with notifications, theme switcher, user menu
- Command palette (Cmd+K)
- Dashboard home with KPI widgets
- Breadcrumb navigation

---

## [0.2.0] — Phase F2: Authentication & User Management

### Added

- `/login` — Login with 2FA support
- `/forgot-password` — Password recovery flow
- `/reset-password` — Password reset
- `/verify-email` — Email verification
- `/two-factor` — 2FA code entry
- Auth guards and route middleware
- Session management with token refresh

---

## [0.1.0] — Phase F1: Frontend Foundation

### Added

- Next.js 16 App Router project setup
- Tailwind CSS v4 design system
- shadcn/ui component library integration
- TanStack Query provider
- Zustand stores foundation
- Axios instance with interceptors
- TypeScript strict configuration

---

## [B1.0] — Phase B1: Backend Foundation

### Added

- Fastify 5 API server
- PostgreSQL 16 database with Prisma 6 ORM
- Redis 7 caching with ioredis
- JWT authentication with httpOnly refresh cookies
- RBAC permission system
- Complete REST API for all modules
