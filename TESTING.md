# Testing Guide — Enterprise POS System

Complete reference for running, extending, and understanding the automated test suite.

---

## Tech Stack

| Tool                          | Purpose                           |
| ----------------------------- | --------------------------------- |
| **Vitest**                    | Unit & component test runner      |
| **React Testing Library**     | Component rendering & interaction |
| **MSW (Mock Service Worker)** | API mocking at the network layer  |
| **Playwright**                | End-to-end browser automation     |
| **@vitest/coverage-v8**       | Code coverage reports             |

---

## Quick Start

```bash
# From the monorepo root
cd /path/to/Enterprise-POS-System

# Run all unit tests once
pnpm --filter web test

# Run tests in watch mode (development)
pnpm --filter web test:watch

# Run tests with coverage report
pnpm --filter web test:coverage

# Open the Vitest UI (interactive browser)
pnpm --filter web test:ui

# Run Playwright E2E tests (requires dev server or CI)
pnpm --filter web test:e2e

# Open Playwright UI
pnpm --filter web test:e2e:ui
```

---

## File Structure

```
apps/web/
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
├── e2e/
│   └── auth.spec.ts            # E2E: Authentication smoke tests
└── src/
    └── tests/
        ├── setup.ts            # Global test setup (jest-dom, MSW lifecycle)
        ├── utils.tsx            # Custom render wrapper with QueryClient
        ├── msw/
        │   ├── handlers.ts     # MSW API mock request handlers
        │   └── server.ts       # MSW node server (used by Vitest)
        └── unit/
            ├── utils/
            │   ├── format.test.ts       # 38 tests for formatting utilities
            │   ├── error.test.ts        # 19 tests for error normalization
            │   └── validators.test.ts   # 27 tests for Zod schemas
            └── components/
                ├── permission-guard.test.tsx   # 7 tests for RBAC guard
                ├── error-boundary.test.tsx     # 4 tests for error boundary
                └── offline-banner.test.tsx     # 5 tests for offline banner
```

---

## Test Results Summary

| File                                   | Tests   | Status         |
| -------------------------------------- | ------- | -------------- |
| `utils/format.test.ts`                 | 38      | ✅ All passing |
| `utils/error.test.ts`                  | 19      | ✅ All passing |
| `utils/validators.test.ts`             | 27      | ✅ All passing |
| `components/permission-guard.test.tsx` | 7       | ✅ All passing |
| `components/error-boundary.test.tsx`   | 4       | ✅ All passing |
| `components/offline-banner.test.tsx`   | 5       | ✅ All passing |
| **Total**                              | **100** | **✅ 100/100** |

---

## MSW API Mocking

All API calls are intercepted by MSW during tests — no live backend required.

**Default handlers** (in `src/tests/msw/handlers.ts`):

- `POST /auth/login` → success with mock token
- `POST /auth/logout` → success
- `POST /auth/refresh` → refreshed token
- `GET /auth/me` → mock admin user
- `GET /products` → empty paginated list
- `GET /customers` → empty paginated list
- `GET /unauthorized` → 401 error
- `GET /server-error` → 500 error

**Override handlers per test:**

```ts
import { server } from '@/tests/msw/server';
import { http, HttpResponse } from 'msw';

server.use(
  http.get('/api/products', () =>
    HttpResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 }),
  ),
);
```

---

## Writing New Tests

### Unit Test (utility function)

```ts
import { describe, it, expect } from 'vitest';
import { myUtil } from '@/utils/my-util';

describe('myUtil', () => {
  it('returns the expected value', () => {
    expect(myUtil('input')).toBe('expected');
  });
});
```

### Component Test

```ts
import { render, screen } from '@/tests/utils'; // custom render with providers
import { MyComponent } from '@/components/my-component';

it('renders the title', () => {
  render(<MyComponent title="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### E2E Test (Playwright)

```ts
import { test, expect } from '@playwright/test';

test('navigates to dashboard after login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'Password1');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Coverage

Coverage is collected over `src/utils/**`, `src/components/common/**`, and `src/hooks/**`.

```bash
pnpm --filter web test:coverage
# Reports saved to: apps/web/coverage/
```

Thresholds (in `vitest.config.ts`):

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 80%       |
| Branches   | 75%       |
| Functions  | 80%       |
| Lines      | 80%       |

---

## Bugs Fixed During QA

| Bug                                                              | File                                   | Fix                                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `slugify('  hello  ')` returned `'-hello-'` instead of `'hello'` | `utils/format.ts`                      | Added `.replace(/^-+\|-+$/g, '')` to strip leading/trailing hyphens after space-to-hyphen conversion |
| `ErrorBoundary` TypeScript members missing `override` modifier   | `components/common/error-boundary.tsx` | Added `override` keyword to `state`, `componentDidCatch`, and `render`                               |

---

## CI Integration

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
- name: Run unit tests
  run: pnpm --filter web test

- name: Run coverage
  run: pnpm --filter web test:coverage

- name: Run E2E tests
  run: pnpm --filter web test:e2e
  env:
    CI: true
```
