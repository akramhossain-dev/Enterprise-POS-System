# Production Deployment Guide — Enterprise POS System

This guide outlines server requirements, environment setups, Docker configurations, reverse proxy maps, and rollback procedures for production servers.

---

## Production Architecture

The production environment runs on a secure multi-container stack orchestrated via Docker Compose:

```
                  Internet (HTTPS :443)
                            │
                            ▼
              ┌───────────────────────────┐
              │ Nginx Reverse Proxy (SSL) │
              └─────────────┬─────────────┘
                            │ (Proxy pass :3000 / :4000)
                            ▼
           ┌────────────────────────────────┐
           │ Docker Bridge (pos-internal)   │
           │                                │
           │  ┌───────┐          ┌───────┐  │
           │  │ Web   │          │ API   │  │
           │  │ Port  │          │ Port  │  │
           │  │ 3000  │          │ 4000  │  │
           │  └───┬───┘          └───┬───┘  │
           │      │                  │      │
           │      └──────┬───────────┘      │
           │             ▼                  │
           │     ┌──────────────┐           │
           │     │ Redis Cache  │           │
           │     └──────┬───────┘           │
           │            ▼                   │
           │     ┌──────────────┐           │
           │     │ PostgreSQL   │           │
           │     │ Database     │           │
           │     └──────────────┘           │
           └────────────────────────────────┘
```

---

## Server Requirements

- **Operating System:** Ubuntu 22.04 / 24.04 LTS
- **Virtual Machine Specs:**
  - _Minimum:_ 2 vCPU, 4 GB RAM, 40 GB SSD.
  - _Recommended (Scale):_ 4 vCPU, 8 GB RAM, 100 GB SSD.
- **Engine Versions:** Docker 24+, Docker Compose v2.20+.

---

## Environment Setup

Create the production config file `/opt/enterprise-pos/.env.prod` on the host server:

```env
# Docker Image Tags (updated by GitHub Actions CI/CD)
API_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/api:latest
WEB_IMAGE=ghcr.io/akramhossain-dev/enterprise-pos-system/web:latest

NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1

# Postgres Configuration
DATABASE_URL=postgresql://pos_user:SECURE_PG_PASS@postgres:5432/enterprise_pos
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=SECURE_PG_PASS
POSTGRES_DB=enterprise_pos

# Redis Cache Configuration
REDIS_URL=redis://:SECURE_REDIS_PASS@redis:6379
REDIS_PASSWORD=SECURE_REDIS_PASS

# JWT Crypto Secrets (Generate secure strings using crypto.randomBytes)
JWT_SECRET=GENERATE_48_CHAR_HEX_STRING_FOR_JWT
REFRESH_TOKEN_SECRET=GENERATE_ANOTHER_48_CHAR_HEX_STRING
```

Restrict permissions immediately:

```bash
chmod 600 /opt/enterprise-pos/.env.prod
```

---

## Deployment Steps

### 1. Initialize Containers

Copy `docker-compose.prod.yml` and the Nginx folder configuration to `/opt/enterprise-pos/`:

```bash
cd /opt/enterprise-pos

# Run Postgres and Redis cache servers
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres redis
```

### 2. Apply Database Migrations

Run schema migrations inside the container before launching the application services:

```bash
docker run --rm \
  --env-file .env.prod \
  --network enterprise-pos_pos-internal \
  ghcr.io/akramhossain-dev/enterprise-pos-system/api:latest \
  sh -c "cd /app/apps/api && npx prisma migrate deploy"
```

### 3. Launch Application Services

Start the remaining application containers:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d api web nginx
```

Check statuses and log outputs:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api web
```

---

## Health Verification & Rollback

### Automated Deployment Verification

The CD pipeline verifies deployment health after starting the containers by issuing HTTP requests to the check routes:

- **Web Portal status:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` (must yield `200` or redirects).
- **API status:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health` (must yield `200`).

### Rollback Process

If the checks fail, the pipeline immediately triggers an automatic rollback on the host by restoring the previously tagged images:

```bash
# Manual Rollback commands
cd /opt/enterprise-pos

# 1. Update image tags to last known stable tag in .env.prod
# 2. Re-create containers
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d api web
```

---

## Reverse Proxy configuration

The proxy routing is handled by the Nginx image (`nginx.prod.conf`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass         http://api_upstream;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass         http://web_upstream;
        proxy_set_header   Host $host;
    }
}
```

---

## Backup Strategy

Run a cron task daily to dump database states:

```bash
# Database Dump
docker exec enterprise-pos-postgres-prod \
  pg_dump -U pos_user enterprise_pos | gzip > /opt/enterprise-pos/backups/db_$(date +%Y%m%d).sql.gz
```
