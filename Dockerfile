# ─────────────────────────────────────────────
# Enterprise POS API — Dockerfile
# Multi-stage build for production
# Build context: REPOSITORY ROOT (not apps/api)
# ─────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────
FROM node:20-alpine AS deps

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests FIRST to maximise layer cache.
# Both apps must be present so pnpm can resolve the full workspace graph.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install ALL workspace dependencies (dev + prod) needed for building.
# HUSKY=0 — skips git-hook installation (no .git dir inside Docker).
# --frozen-lockfile ensures reproducible installs.
RUN HUSKY=0 pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules            ./node_modules
COPY --from=deps /app/apps/api/node_modules   ./apps/api/node_modules

# Copy source (filtered by .dockerignore — no node_modules, no .next, no .env)
COPY . .

# Generate Prisma client (must run inside the builder so the binary is available)
RUN pnpm --filter @enterprise-pos/api exec prisma generate

# Compile TypeScript → dist/
RUN pnpm --filter @enterprise-pos/api run build

# ── Stage 3: Production Runtime ───────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 apiuser

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only what pnpm needs to install production deps.
# Both workspace manifests are required so pnpm can resolve the graph
# even though we only install the api package in this stage.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install production-only dependencies for the API.
# HUSKY=0 — husky is a devDependency; without this flag the root
# "prepare" lifecycle script tries to run `husky` which doesn't exist
# in --prod mode, causing: sh: husky: not found → exit code 1.
RUN HUSKY=0 pnpm install --prod --frozen-lockfile --filter @enterprise-pos/api...

# Copy compiled application from builder
COPY --from=builder /app/apps/api/dist             ./apps/api/dist

# Copy generated Prisma binary client from builder
COPY --from=builder /app/apps/api/node_modules/.prisma \
                                                   ./apps/api/node_modules/.prisma

# Copy Prisma schema (needed for prisma migrate deploy at runtime)
COPY --from=builder /app/apps/api/prisma           ./apps/api/prisma

# Set correct ownership before dropping privileges
RUN chown -R apiuser:nodejs /app

USER apiuser

WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 4000

CMD ["node", "dist/server.js"]
