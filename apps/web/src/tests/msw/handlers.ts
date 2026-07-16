import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:4000/api';

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        user: { id: '1', email: 'admin@test.com', role: 'admin', roles: [], permissions: [] },
      },
    }),
  ),

  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ success: true, data: null })),

  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ success: true, data: { accessToken: 'mock-refreshed-token' } }),
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: { id: '1', email: 'admin@test.com', role: 'admin', roles: [], permissions: [] },
    }),
  ),

  // ── Products ──────────────────────────────────────────────────────────────
  http.get(`${BASE}/products`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    }),
  ),

  // ── Customers ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/customers`, () =>
    HttpResponse.json({
      success: true,
      data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    }),
  ),

  // ── Error Scenarios ───────────────────────────────────────────────────────
  http.get(`${BASE}/unauthorized`, () =>
    HttpResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    ),
  ),

  http.get(`${BASE}/server-error`, () =>
    HttpResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 },
    ),
  ),
];
