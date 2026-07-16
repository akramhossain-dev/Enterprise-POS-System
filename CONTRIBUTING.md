# Contributing Guide — Enterprise POS System

Thank you for contributing to the Enterprise POS System. This guide covers branching strategy, commit conventions, code standards, and the PR process.

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** 16
- **Redis** 7

### Setup

```bash
# Clone the repository
git clone https://github.com/akramhossain-dev/Enterprise-POS-System.git
cd Enterprise-POS-System

# Install all dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Start the development servers
pnpm dev
```

---

## Branching Strategy

| Branch                            | Purpose                             |
| --------------------------------- | ----------------------------------- |
| `main`                            | Production-ready code only          |
| `develop`                         | Integration branch for feature PRs  |
| `feature/F-XXX-short-description` | New feature development             |
| `fix/F-XXX-short-description`     | Bug fixes                           |
| `chore/description`               | Non-functional changes (docs, deps) |

### Examples

```
feature/F12-production-audit
fix/slugify-trailing-hyphens
chore/update-dependencies
```

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type       | When to use                              |
| ---------- | ---------------------------------------- |
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `chore`    | Non-code changes (deps, config)          |
| `docs`     | Documentation only                       |
| `test`     | Adding or updating tests                 |
| `refactor` | Code improvement without feature/fix     |
| `perf`     | Performance improvement                  |
| `style`    | Formatting, whitespace (no logic change) |

### Examples

```
feat(pos): add barcode scanner integration
fix(slugify): strip leading and trailing hyphens
chore(deps): upgrade framer-motion to v13
docs(arch): update data flow diagram
test(utils): add validators unit tests
```

---

## Code Standards

### TypeScript

- **Strict mode** is enabled — no `any` types without justification
- All public function parameters and return types must be typed
- Use `interface` for object shapes, `type` for unions/intersections
- Never use `// @ts-ignore` — fix the underlying type issue instead

### React & Next.js

- Use the **App Router** — no Pages Router
- Mark client components explicitly with `'use client'`
- Prefer **server components** for static/fetch-heavy views
- Use `next/dynamic` for heavy third-party components (charts, grids)
- Never use `dangerouslySetInnerHTML`

### Components

- One component per file
- File name matches the exported component name (kebab-case)
- Props interfaces defined at the top of the file
- Avoid inline styles — use Tailwind classes
- Extract repeated UI blocks into shared components under `components/common/`

### State Management

- **Server state** (API data): TanStack Query hooks in `hooks/`
- **Client state** (UI, session): Zustand stores in `stores/`
- Never store sensitive data in localStorage — access tokens live in memory only

### API Services

- All API calls go through a service class in `services/`
- Services extend `ApiClient` and use typed response generics
- Never call `axiosInstance` directly from a component

### Testing

- Write tests for all new utility functions
- Write component tests for new shared/common components
- Run `pnpm --filter web test` before opening a PR — all 100 tests must pass

---

## Pull Request Process

1. **Branch** from `develop` (not `main`)
2. **Implement** your changes following the code standards
3. **Test** — run `pnpm --filter web test` and `pnpm --filter web type-check`
4. **Commit** using conventional commit format
5. **Open a PR** against `develop` with a clear description
6. **PR checklist**:
   - [ ] Tests pass (`pnpm --filter web test`)
   - [ ] TypeScript clean (`pnpm --filter web type-check`)
   - [ ] No new ESLint errors
   - [ ] No `console.log` / `console.debug` left in code
   - [ ] No `TODO` comments without linked issue
   - [ ] Documentation updated if needed

---

## Project Structure Rules

| Rule                                              | Rationale                                     |
| ------------------------------------------------- | --------------------------------------------- |
| One hook file per domain                          | Keeps data-fetching concerns grouped          |
| One service file per domain                       | Maps cleanly to backend API modules           |
| `components/ui/` = primitives only                | shadcn/ui wrappers, never business logic      |
| `components/common/` = shared security components | ErrorBoundary, PermissionGuard, OfflineBanner |
| `utils/` = pure functions only                    | No side effects, easily testable              |
| `config/` = static configuration                  | No runtime logic                              |
