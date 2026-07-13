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
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install ALL workspace dependencies (dev + prod) needed for building
RUN HUSKY=0 pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules            ./node_modules
COPY --from=deps /app/apps/api/node_modules   ./apps/api/node_modules

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm --filter @enterprise-pos/api exec prisma generate

# Compile TypeScript → dist/
RUN pnpm --filter @enterprise-pos/api run build

# Prune devDependencies to keep the node_modules small for production
# HUSKY=0 prevents prepare script from running husky which isn't in prod.
RUN HUSKY=0 pnpm prune --prod

# ── Stage 3: Production Runtime ───────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 apiuser

WORKDIR /app

# Copy pruned workspace manifests and node_modules from builder
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

# Copy api directory (including its own dist, node_modules, and prisma schema)
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Set correct ownership
RUN chown -R apiuser:nodejs /app

USER apiuser

WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 4000

CMD ["node", "dist/server.js"]
