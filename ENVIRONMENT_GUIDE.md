# Environment Variables Guide — Enterprise POS System

Reference for all environment variables across every service and environment.

---

## API Environment Variables (`apps/api/.env`)

### Application

| Variable   | Required | Default              | Description                           |
| ---------- | -------- | -------------------- | ------------------------------------- |
| `NODE_ENV` | ✅       | `development`        | `development` / `production` / `test` |
| `PORT`     |          | `4000`               | HTTP server port                      |
| `APP_NAME` |          | `Enterprise POS API` | Application name (used in logs)       |

### Database (PostgreSQL)

| Variable            | Required     | Example                               | Description                                       |
| ------------------- | ------------ | ------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`      | ✅           | `postgresql://user:pass@host:5432/db` | Full PostgreSQL connection string (Prisma format) |
| `POSTGRES_USER`     | ✅ (compose) | `pos_user`                            | Database username (for docker-compose)            |
| `POSTGRES_PASSWORD` | ✅ (compose) | —                                     | Database password (for docker-compose)            |
| `POSTGRES_DB`       | ✅ (compose) | `enterprise_pos`                      | Database name (for docker-compose)                |

### Cache (Redis)

| Variable         | Required     | Example                       | Description                              |
| ---------------- | ------------ | ----------------------------- | ---------------------------------------- |
| `REDIS_URL`      | ✅           | `redis://:password@host:6379` | Redis connection string                  |
| `REDIS_PASSWORD` | ✅ (compose) | —                             | Redis password (for docker-compose auth) |

### Security & JWT

| Variable                   | Required | Example     | Description                                |
| -------------------------- | -------- | ----------- | ------------------------------------------ |
| `JWT_SECRET`               | ✅       | 48-char hex | Access token signing secret. Min 32 chars  |
| `JWT_EXPIRES_IN`           |          | `15m`       | Access token lifetime                      |
| `REFRESH_TOKEN_SECRET`     | ✅       | 48-char hex | Refresh token signing secret. Min 32 chars |
| `REFRESH_TOKEN_EXPIRES_IN` |          | `7d`        | Refresh token lifetime                     |

> **Generate secrets:**
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### CORS

| Variable       | Required | Example                   | Description         |
| -------------- | -------- | ------------------------- | ------------------- |
| `FRONTEND_URL` | ✅       | `https://your-domain.com` | Allowed CORS origin |

---

## Web Environment Variables (`apps/web/.env.local`)

| Variable               | Required | Example                       | Description                                   |
| ---------------------- | -------- | ----------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | ✅       | `https://api.your-domain.com` | Backend API base URL (embedded at build time) |
| `NEXT_PUBLIC_APP_NAME` |          | `Enterprise POS`              | App name shown in UI                          |

> **Important:** `NEXT_PUBLIC_*` variables are **embedded at build time**. Changing them requires a rebuild.

---

## Production Compose Variables (`.env.prod`)

The production Docker Compose reads from `.env.prod` at the repo root.

```env
# ── Image versions (set by CI/CD) ────────────────────────────────────────────
API_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/api:latest
WEB_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/web:latest

# ── Application ───────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=4000
APP_NAME=Enterprise POS API
FRONTEND_URL=https://your-domain.com

# ── Web ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://pos_user:STRONG_PASSWORD@postgres:5432/enterprise_pos
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=enterprise_pos

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# ── JWT Secrets ───────────────────────────────────────────────────────────────
JWT_SECRET=GENERATE_48_CHAR_HEX_SECRET
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=GENERATE_ANOTHER_48_CHAR_HEX_SECRET
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## CI Environment Variables

These are set automatically by GitHub Actions — no manual setup needed:

| Variable               | Value                                        | Source         |
| ---------------------- | -------------------------------------------- | -------------- |
| `CI`                   | `true`                                       | GitHub Actions |
| `NODE_ENV`             | `test`                                       | Workflow file  |
| `JWT_SECRET`           | test placeholder                             | Workflow file  |
| `REFRESH_TOKEN_SECRET` | test placeholder                             | Workflow file  |
| `DATABASE_URL`         | `postgresql://test:test@localhost:5432/test` | Workflow file  |
| `REDIS_URL`            | `redis://localhost:6379`                     | Workflow file  |

---

## Environment File Precedence

Next.js loads env files in this order (later = higher priority):

1. `.env`
2. `.env.local`
3. `.env.development` / `.env.production`
4. `.env.development.local` / `.env.production.local`

Fastify uses `dotenv` and reads `.env` from the app directory.

---

## Security Rules

> [!CAUTION]
> **Never commit these files:**
>
> - `.env`
> - `.env.local`
> - `.env.production`
> - `.env.prod`
> - Any file containing real secrets

All secret files are listed in `.gitignore`. Verify with:

```bash
git check-ignore -v apps/api/.env apps/web/.env.local .env.prod
```
