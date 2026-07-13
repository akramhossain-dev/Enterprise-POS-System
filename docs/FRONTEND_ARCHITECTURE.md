# Frontend Architecture — Enterprise POS System

> Phase F1 — Frontend Foundation

## Overview

The frontend is a Next.js 15 application (`apps/web`) within the Turborepo monorepo. It uses the App Router, React 19, TypeScript strict mode, Tailwind CSS v4, and a curated set of enterprise-grade libraries.

---

## Tech Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Framework         | Next.js 15 (App Router)     |
| UI Library        | React 19                    |
| Language          | TypeScript 5 (strict)       |
| Styling           | Tailwind CSS v4             |
| Component Library | shadcn/ui + Radix UI        |
| Icons             | Lucide React                |
| Animation         | Framer Motion               |
| State Management  | Zustand + TanStack Query v5 |
| Forms             | React Hook Form + Zod       |
| HTTP Client       | Axios (typed)               |
| Toast             | Sonner                      |
| Command Palette   | cmdk                        |
| File Upload       | react-dropzone              |

---

## Folder Structure

```
apps/web/src/
├── app/                      # Next.js App Router pages & layouts
│   ├── (auth)/               # Auth layout group
│   │   └── login/            # Login page
│   ├── (dashboard)/          # Dashboard layout group
│   │   └── dashboard/        # Dashboard page
│   ├── unauthorized/         # 401 page
│   ├── forbidden/            # 403 page
│   ├── not-found.tsx         # 404
│   ├── error.tsx             # React Error Boundary
│   ├── global-error.tsx      # Root Error Boundary
│   ├── loading.tsx           # Route loading
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root redirect
│
├── components/               # Reusable UI components
│   ├── auth/                 # Auth-related components
│   │   ├── login-form.tsx
│   │   ├── protected-route.tsx
│   │   ├── permission-guard.tsx
│   │   ├── role-guard.tsx
│   │   └── forbidden-fallback.tsx
│   ├── data-table/           # Data table system
│   │   └── data-table.tsx
│   ├── layout/               # Layout components
│   │   ├── sidebar.tsx
│   │   ├── top-navbar.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── user-menu.tsx
│   │   ├── theme-switcher.tsx
│   │   └── command-palette.tsx
│   ├── modals/               # Modal system
│   │   ├── confirm-dialog.tsx
│   │   └── delete-dialog.tsx
│   ├── ui/                   # Primitive UI components
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── input.tsx
│   │   ├── loading-overlay.tsx
│   │   ├── pagination.tsx
│   │   ├── search-box.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   └── upload/               # File upload
│       └── file-upload.tsx
│
├── config/                   # App configuration
│   ├── app.ts
│   ├── api.ts
│   ├── auth.ts
│   └── navigation.ts
│
├── constants/                # App-wide constants
│   └── index.ts
│
├── hooks/                    # Custom React hooks
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   └── use-permissions.ts
│
├── lib/                      # Core library setup
│   ├── axios.ts              # Axios + interceptors
│   └── query-client.ts       # TanStack Query client
│
├── middleware.ts             # Next.js Edge middleware (auth guard)
│
├── providers/                # React context providers
│   ├── auth-provider.tsx
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   ├── toast-provider.tsx
│   └── index.tsx
│
├── services/                 # API service layer
│   ├── api-client.ts         # Typed base class
│   └── auth.service.ts
│
├── stores/                   # Zustand state stores
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── styles/                   # Global styles
│   └── globals.css           # Design tokens + Tailwind v4
│
├── types/                    # TypeScript types
│   ├── api.ts
│   ├── auth.ts
│   ├── common.ts
│   └── index.ts
│
└── utils/                    # Utility functions
    ├── cn.ts
    ├── error.ts
    ├── format.ts
    ├── storage.ts
    └── validators.ts
```

---

## Theme System

### Dark Theme — Aurora UI

- Deep navy background (`hsl(222 47% 6%)`)
- Electric blue primary (`hsl(217 91% 60%)`)
- Aurora gradient overlays (blue → violet → cyan)
- Glass morphism effects
- Subtle glow shadows

### Light Theme — Minimal Enterprise

- Clean white background
- Crisp blue primary
- Flat borders and minimal shadows
- Optimized for data-dense dashboards

### Theme Modes

- `light` — Light enterprise theme
- `dark` — Aurora dark theme
- `system` — Follows OS preference
- Persisted in localStorage (`epos_ui`)
- No flash on refresh (via `suppressHydrationWarning` + next-themes)

---

## API Layer

```typescript
// Axios instance with:
// ✅ Bearer token injection
// ✅ Automatic 401 → token refresh → retry
// ✅ Error normalization
// ✅ withCredentials (httpOnly cookie support)

const response = await axiosInstance.get('/endpoint');
```

### Service Pattern

```typescript
import { authService } from '@/services/auth.service';

// Login
const { user, tokens } = await authService.login({ email, password });

// Get current user
const user = await authService.getMe();
```

---

## State Management

### Auth Store (Zustand)

```typescript
const { user, isAuthenticated, hasPermission, hasRole } = useAuthStore();
```

### UI Store (Zustand)

```typescript
const { sidebarCollapsed, theme, openModal } = useUIStore();
```

### Server State (TanStack Query)

```typescript
const { data, isLoading } = useQuery({
  queryKey: QUERY_KEYS.USERS.ALL,
  queryFn: () => userService.getAll(),
});
```

---

## Auth Foundation

| Component          | Purpose                              |
| ------------------ | ------------------------------------ |
| `middleware.ts`    | Edge route protection (cookie-based) |
| `AuthProvider`     | Session initialization + restore     |
| `ProtectedRoute`   | Client-side auth guard               |
| `PermissionGuard`  | Fine-grained UI permission           |
| `RoleGuard`        | Role-based UI sections               |
| `useAuth()`        | Auth hook with login/logout          |
| `usePermissions()` | Permission helpers                   |

---

## Design Tokens

All tokens defined as CSS custom properties in `globals.css`:

| Category   | Token                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Colors     | `--primary`, `--secondary`, `--destructive`, `--success`, `--warning` |
| Background | `--background`, `--card`, `--popover`, `--muted`                      |
| Text       | `--foreground`, `--muted-foreground`                                  |
| Border     | `--border`, `--input`, `--ring`                                       |
| Sidebar    | `--sidebar-*`                                                         |
| Radius     | `--radius-sm` → `--radius-2xl`                                        |
| Shadow     | `--shadow-xs` → `--shadow-2xl`, `--shadow-glow`                       |
| Animation  | `--duration-fast` → `--duration-slower`, easing vars                  |
| Z-Index    | `--z-dropdown` → `--z-command`                                        |
| Spacing    | `--spacing-sidebar`, `--spacing-navbar`                               |
