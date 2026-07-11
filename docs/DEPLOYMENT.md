# Enterprise POS System — Deployment Guide

> **Version:** 1.0.0  
> **Status:** Phase 0 — Documentation & Planning  
> **Last Updated:** 2026-07-11

---

## Table of Contents

1. [Deployment Architecture](#1-deployment-architecture)
2. [Server Requirements](#2-server-requirements)
3. [Environment Configuration](#3-environment-configuration)
4. [Local Development Setup](#4-local-development-setup)
5. [Docker Configuration](#5-docker-configuration)
6. [Database Migration](#6-database-migration)
7. [Production Deployment](#7-production-deployment)
8. [Nginx Configuration](#8-nginx-configuration)
9. [CI/CD Workflow](#9-cicd-workflow)
10. [Monitoring & Operations](#10-monitoring--operations)

---

## 1. Deployment Architecture

### Production Architecture

```
Internet
    │
    ▼
┌──────────────────────────────────────────────────────┐
│                      Nginx                           │
│   Port 80 (redirect) │ Port 443 (SSL/TLS)           │
│   Let's Encrypt certificate                         │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
    /          │          /api/*       │
               │                      │
┌──────────────▼───────┐  ┌───────────▼──────────────┐
│   Next.js Frontend   │  │   Fastify API Server     │
│   apps/web           │  │   apps/api               │
│   Port: 3000         │  │   Port: 4000             │
└──────────────────────┘  └───────────┬──────────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
        ┌──────────▼───────┐ ┌────────▼──────┐ ┌────────▼────────┐
        │   PostgreSQL     │ │    Redis      │ │ BullMQ Workers  │
        │   Port: 5432     │ │  Port: 6379  │ │  (email, jobs)  │
        └──────────────────┘ └───────────────┘ └─────────────────┘
```

### Network Topology

| Component   | Exposure             | Port    |
| ----------- | -------------------- | ------- |
| Nginx       | Public internet      | 80, 443 |
| Next.js     | Internal (via Nginx) | 3000    |
| Fastify API | Internal (via Nginx) | 4000    |
| PostgreSQL  | Internal only        | 5432    |
| Redis       | Internal only        | 6379    |

All backend services communicate over an isolated Docker network. No backend ports are exposed to the public internet.

---

## 2. Server Requirements

### Minimum Production Requirements

| Resource           | Minimum          | Recommended      |
| ------------------ | ---------------- | ---------------- |
| **CPU**            | 2 vCPU           | 4 vCPU           |
| **RAM**            | 4 GB             | 8 GB             |
| **Storage**        | 40 GB SSD        | 100 GB SSD       |
| **OS**             | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Docker**         | 26.x             | Latest stable    |
| **Docker Compose** | 2.x              | Latest stable    |

### Software Prerequisites (Server)

| Software       | Version | Purpose                       |
| -------------- | ------- | ----------------------------- |
| Docker         | 26.x+   | Container runtime             |
| Docker Compose | 2.x+    | Multi-container orchestration |
| Nginx          | 1.26.x  | Reverse proxy                 |
| Certbot        | Latest  | SSL certificate management    |
| Git            | 2.x     | Source code deployment        |

### Developer Machine Prerequisites

| Software       | Version  | Purpose                |
| -------------- | -------- | ---------------------- |
| Node.js        | 22.x LTS | Runtime for builds     |
| pnpm           | 9.x      | Package manager        |
| Docker Desktop | Latest   | Local containerization |
| Git            | 2.x      | Version control        |

---

## 3. Environment Configuration

### Environment Files

Each application has its own environment file. These files are **never committed to version control**.

```
enterprise-pos-system/
├── apps/api/.env              # API environment variables
├── apps/api/.env.example      # Template for all API variables
├── apps/web/.env.local        # Frontend environment variables
├── apps/web/.env.example      # Template for all frontend variables
└── .env                       # Root-level Docker Compose variables
```

---

### API Environment Variables — `apps/api/.env`

```env
# ── Application ──────────────────────────────────────
NODE_ENV=production
PORT=4000
APP_URL=https://api.yourdomain.com

# ── Database ─────────────────────────────────────────
DATABASE_URL=postgresql://pos_user:strong_password@postgres:5432/enterprise_pos

# ── Redis ────────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ── JWT ──────────────────────────────────────────────
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private_key
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public_key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# ── Cookie ───────────────────────────────────────────
COOKIE_SECRET=minimum_32_character_random_secret_here
COOKIE_SECURE=true

# ── CORS ─────────────────────────────────────────────
ALLOWED_ORIGINS=https://yourdomain.com

# ── Rate Limiting ─────────────────────────────────────
RATE_LIMIT_MAX=300
RATE_LIMIT_WINDOW_MS=60000

# ── Email ────────────────────────────────────────────
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password
SMTP_FROM_NAME=Enterprise POS System
SMTP_FROM_EMAIL=noreply@yourdomain.com

# ── File Storage ─────────────────────────────────────
STORAGE_PATH=/app/storage
MAX_FILE_SIZE_MB=10

# ── Backup ───────────────────────────────────────────
BACKUP_PATH=/app/backups
BACKUP_RETENTION_DAYS=30
```

---

### Frontend Environment Variables — `apps/web/.env.local`

```env
# ── API ──────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

# ── Application ──────────────────────────────────────
NEXT_PUBLIC_APP_NAME=Enterprise POS System
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

### Root Docker Compose Variables — `.env`

```env
# PostgreSQL
POSTGRES_DB=enterprise_pos
POSTGRES_USER=pos_user
POSTGRES_PASSWORD=strong_secure_password_here

# Redis
REDIS_PASSWORD=redis_password_here

# Domain
DOMAIN=yourdomain.com
```

---

## 4. Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/enterprise-pos-system.git
cd enterprise-pos-system
```

### Step 2: Install Dependencies

```bash
# Install pnpm globally if not installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### Step 3: Configure Environment Variables

```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp .env.example .env

# Edit the .env files with your local configuration
# Minimum required: DATABASE_URL, REDIS_URL, JWT secrets
```

### Step 4: Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and supporting services
docker compose up -d postgres redis
```

### Step 5: Run Database Migrations

```bash
# Apply all Prisma migrations and generate client
pnpm --filter api db:migrate
pnpm --filter api db:seed        # Load initial seed data
```

### Step 6: Start Development Servers

```bash
# Start all apps in development mode (with hot reload)
pnpm dev
```

**Development URLs:**

| Service       | URL                                                         |
| ------------- | ----------------------------------------------------------- |
| Frontend      | `http://localhost:3000`                                     |
| API           | `http://localhost:4000`                                     |
| API Health    | `http://localhost:4000/health`                              |
| Prisma Studio | `http://localhost:5555` (run `pnpm --filter api db:studio`) |

---

## 5. Docker Configuration

### `docker-compose.yml` — Development

```yaml
# Development Docker Compose
# Runs infrastructure only; apps run via pnpm dev

version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pos_postgres_dev
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    networks:
      - pos_dev_network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pos_redis_dev
    command: redis-server --appendonly yes
    volumes:
      - redis_dev_data:/data
    ports:
      - '6379:6379'
    networks:
      - pos_dev_network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  pos_dev_network:
    driver: bridge
```

---

### `docker-compose.prod.yml` — Production

```yaml
# Production Docker Compose
# All services containerized and orchestrated

version: '3.9'

services:
  nginx:
    image: nginx:1.26-alpine
    container_name: pos_nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/certs:/etc/nginx/certs:ro
      - ./docker/nginx/logs:/var/log/nginx
    depends_on:
      - web
      - api
    networks:
      - pos_network
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: pos_frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${API_URL}
    networks:
      - pos_network
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: pos_api
    env_file:
      - apps/api/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - api_storage:/app/storage
      - api_backups:/app/backups
    networks:
      - pos_network
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: pos_worker
    command: ['node', 'dist/worker.js']
    env_file:
      - apps/api/.env
    depends_on:
      - postgres
      - redis
    networks:
      - pos_network
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    container_name: pos_postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pos_network
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pos_redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - pos_network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  api_storage:
  api_backups:

networks:
  pos_network:
    driver: bridge
```

---

## 6. Database Migration

### Migration Workflow

| Command                             | Purpose                                          |
| ----------------------------------- | ------------------------------------------------ |
| `pnpm --filter api db:migrate`      | Apply all pending migrations (development)       |
| `pnpm --filter api db:migrate:prod` | Apply migrations in production (non-interactive) |
| `pnpm --filter api db:rollback`     | Revert the last migration                        |
| `pnpm --filter api db:seed`         | Run seed data scripts                            |
| `pnpm --filter api db:studio`       | Open Prisma Studio (visual DB browser)           |
| `pnpm --filter api db:generate`     | Regenerate Prisma client after schema changes    |

### Production Migration Command

Migrations must be applied before starting the API container in production. This is automated in the CI/CD pipeline:

```bash
# Automated in CI/CD — do not run manually unless required
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

### Rollback Strategy

Prisma does not provide automatic rollback. Rollback procedure:

1. Stop the API service
2. Restore the most recent database backup
3. Roll back the application to the previous Docker image tag
4. Restart services

---

## 7. Production Deployment

### Initial Server Setup

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose plugin
sudo apt install docker-compose-plugin

# 4. Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx

# 5. Clone repository
git clone https://github.com/your-org/enterprise-pos-system.git /opt/pos
cd /opt/pos
```

### SSL Certificate Setup

```bash
# Obtain Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### First Deployment

```bash
# 1. Configure environment files
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with production values

# 2. Build and start all containers
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d

# 3. Verify all services are healthy
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api --tail=50
```

### Subsequent Deployments (Zero-Downtime)

```bash
# 1. Pull latest changes
git pull origin main

# 2. Build new images
docker compose -f docker-compose.prod.yml build

# 3. Apply any new migrations
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# 4. Restart services with rolling update
docker compose -f docker-compose.prod.yml up -d --no-deps api web worker
```

---

## 8. Nginx Configuration

### `docker/nginx/nginx.conf`

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log warn;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate     /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass         http://api:4000;
            proxy_http_version 1.1;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        # Auth rate limit (stricter)
        location /api/v1/auth/login {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://api:4000;
        }

        # Frontend (all other routes)
        location / {
            proxy_pass         http://web:3000;
            proxy_http_version 1.1;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection 'upgrade';
            proxy_set_header   Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 9. CI/CD Workflow

### GitHub Actions Pipeline

**`.github/workflows/ci.yml`** — Continuous Integration (runs on every pull request):

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
```

---

**`.github/workflows/deploy.yml`** — Production Deployment (runs on push to `main`):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker images
        run: |
          docker build -t pos-api:${{ github.sha }} -f apps/api/Dockerfile .
          docker build -t pos-web:${{ github.sha }} -f apps/web/Dockerfile .

      - name: Push to container registry
        run: |
          echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}/pos-api:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}/pos-web:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/pos
            git pull origin main
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
            docker compose -f docker-compose.prod.yml up -d --no-deps api web worker
            docker image prune -f
```

### Required GitHub Secrets

| Secret              | Description                       |
| ------------------- | --------------------------------- |
| `SERVER_HOST`       | Production server IP or hostname  |
| `SERVER_USER`       | SSH username                      |
| `SERVER_SSH_KEY`    | Private SSH key for server access |
| `REGISTRY_PASSWORD` | Container registry access token   |

---

## 10. Monitoring & Operations

### Health Checks

| Endpoint             | Expected Response                                             |
| -------------------- | ------------------------------------------------------------- |
| `GET /health`        | `{ "status": "ok", "db": "connected", "redis": "connected" }` |
| `GET /api/v1/health` | Same as above, API version                                    |

### Log Management

| Component  | Log Location                | Format                 |
| ---------- | --------------------------- | ---------------------- |
| Nginx      | `/var/log/nginx/access.log` | Combined log format    |
| API        | stdout (captured by Docker) | JSON (Pino structured) |
| PostgreSQL | Docker container logs       | PostgreSQL default     |
| Redis      | Docker container logs       | Redis default          |

```bash
# View live API logs
docker compose -f docker-compose.prod.yml logs -f api

# View last 100 Nginx access log lines
docker compose -f docker-compose.prod.yml logs --tail=100 nginx
```

### Database Backup Commands

```bash
# Manual backup
docker exec pos_postgres pg_dump -U pos_user enterprise_pos | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from backup
gunzip -c backup_file.sql.gz | docker exec -i pos_postgres psql -U pos_user enterprise_pos
```

### Useful Operational Commands

```bash
# Check all container statuses
docker compose -f docker-compose.prod.yml ps

# Restart a single service without downtime
docker compose -f docker-compose.prod.yml restart api

# Scale API workers (if load increases)
docker compose -f docker-compose.prod.yml up -d --scale api=2

# Clear Redis cache
docker exec pos_redis redis-cli FLUSHDB

# Open PostgreSQL interactive shell
docker exec -it pos_postgres psql -U pos_user -d enterprise_pos
```

---

_This document is part of the Enterprise POS System Phase 0 documentation suite._
