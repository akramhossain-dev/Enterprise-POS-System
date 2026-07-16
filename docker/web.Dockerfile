# ─────────────────────────────────────────────────────────────────────────────
# Enterprise POS — Web (Next.js) Dockerfile
# Multi-stage build — produces a minimal standalone production image.
#
# Build context: apps/web (NOT the repo root)
# Usage:
#   docker build -f docker/web.Dockerfile -t pos-web:latest apps/web
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only manifests first to maximise layer cache
COPY package.json pnpm-lock.yaml* ./

# Install production + dev dependencies needed for the build
RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build-time public env vars (injected at build time, not runtime)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Telemetry off for CI reproducibility
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app in standalone mode
RUN pnpm run build

# ── Stage 3: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

WORKDIR /app

# Disable telemetry at runtime too
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only the standalone output (Next.js standalone bundles server.js + static assets)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

# Health check — checks the home route responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "\
    require('http').get(\
      {host:'localhost',port:3000,path:'/',timeout:5000},\
      (r)=>process.exit(r.statusCode<500?0:1)\
    ).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
