# Deployment Guide — Enterprise POS System

## Overview

The Enterprise POS System is a monorepo containing:

- `apps/web` — Next.js 16 frontend
- `apps/api` — Fastify 5 backend API

This guide covers production deployment for the frontend application.

---

## Environment Variables

Create `apps/web/.env.production` with the following:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Application settings
NEXT_PUBLIC_APP_NAME="Enterprise POS"
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Environment flag
NODE_ENV=production
```

> [!CAUTION]
> Never commit `.env.production` to version control. Use your CI/CD secrets manager.

---

## Prerequisites

| Tool    | Version        |
| ------- | -------------- |
| Node.js | 20+            |
| pnpm    | 9+             |
| Docker  | 24+ (optional) |

---

## Production Build

### Standard (Node.js)

```bash
# Install dependencies (CI mode — no lockfile mutation)
pnpm install --frozen-lockfile

# Type check
pnpm --filter web type-check

# Run tests
pnpm --filter web test

# Build
pnpm --filter web build

# Start
pnpm --filter web start
```

The server listens on **port 3000** by default. Set `PORT` env to override.

### Docker

```bash
# Build the frontend image
docker build -t enterprise-pos-web -f docker/web.Dockerfile .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.your-domain.com \
  enterprise-pos-web
```

### Docker Compose (full stack)

```bash
# Production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f web
```

---

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Health Check

The application exposes the following health indicators:

| Endpoint      | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| `/`           | Static  | Root page — indicates server is responding |
| `/api/health` | Backend | Full backend health check                  |

For container orchestration (Kubernetes/ECS), configure:

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

---

## Content Security Policy

The application is built CSP-compatible:

- No `dangerouslySetInnerHTML` usage
- No inline scripts
- External fonts loaded from Google Fonts (add to CSP `font-src`)
- All API calls go to your configured `NEXT_PUBLIC_API_URL`

Recommended CSP header:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.your-domain.com;
```

---

## Performance Recommendations

| Setting     | Recommendation                                                       |
| ----------- | -------------------------------------------------------------------- |
| CDN         | Serve `/public/` assets through a CDN                                |
| Caching     | Set `Cache-Control: max-age=31536000, immutable` on `/_next/static/` |
| Compression | Enable gzip/brotli at the reverse proxy level                        |
| HTTPS       | Always use HTTPS in production                                       |

---

## CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Production Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter web type-check

      - run: pnpm --filter web test

      - run: pnpm --filter web build

      - name: Deploy to server
        run: |
          # Your deployment command here
          ssh user@your-server "cd /app && git pull && pnpm install && pnpm --filter web build && pm2 restart web"
```

---

## Monitoring

The frontend includes hooks ready for monitoring integration:

- **Error Boundary** (`components/common/error-boundary.tsx`) — catches and logs render errors
- **Next.js `app/error.tsx`** — captures route-level errors with `error.digest` ID
- **Session timeout** (`hooks/use-session-timeout.ts`) — logs idle timeouts

Connect to your APM tool (Sentry, Datadog, etc.) by extending `componentDidCatch` in the ErrorBoundary and the `useEffect` in `app/error.tsx`.
