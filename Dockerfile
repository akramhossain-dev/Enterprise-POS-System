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

# Copy only the workspace manifests first (maximises layer cache reuse)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install ALL dependencies (dev + prod) for building
RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules            ./node_modules
COPY --from=deps /app/apps/api/node_modules   ./apps/api/node_modules

# Copy full repo source (filtered by .dockerignore at build context)
COPY . .

# Generate Prisma client
RUN pnpm --filter @enterprise-pos/api exec prisma generate

# Compile TypeScript
RUN pnpm --filter @enterprise-pos/api run build

# ── Stage 3: Production Runtime ───────────────
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 apiuser

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests needed for `pnpm install --prod`
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install production-only dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled application from builder
COPY --from=builder /app/apps/api/dist             ./apps/api/dist

# Copy generated Prisma client (binary) from builder
COPY --from=builder /app/apps/api/node_modules/.prisma \
                                                   ./apps/api/node_modules/.prisma

# Copy Prisma schema (needed for migrations at runtime)
COPY --from=builder /app/apps/api/prisma           ./apps/api/prisma

# Set correct ownership
RUN chown -R apiuser:nodejs /app

USER apiuser

WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 4000

CMD ["node", "dist/server.js"]
