# syntax=docker/dockerfile:1
# GRIPR.STUDIO — Unified Frontend & Fastify Backend (Render Free Tier & Container Deployment)

# ================= Stage 1: Build Backend =================
FROM node:22-alpine AS builder

WORKDIR /app

# Install reproducible pnpm matching repository lockfile
RUN npm install -g pnpm@10.33.3

# Copy package manifests and lockfile
COPY api/package.json api/pnpm-lock.yaml api/tsconfig.json ./api/

WORKDIR /app/api
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY api/src ./src

# Build TypeScript to dist
RUN pnpm run build

# ================= Stage 2: Production Runtime =================
FROM node:22-alpine AS runner

WORKDIR /app

# Render injects PORT (defaults to 10000 or custom) and expects 0.0.0.0
# Default to DEMO_ONLY mode for safe free deployment without persistent cloud DB
ENV NODE_ENV=production \
    PORT=10000 \
    HOST=0.0.0.0 \
    SERVE_STATIC=true \
    PERSISTENCE_MODE=demo_only \
    DEMO_MODE=true

# Install pnpm for reproducible production dependencies
RUN npm install -g pnpm@10.33.3

COPY api/package.json api/pnpm-lock.yaml ./api/
WORKDIR /app/api
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy compiled backend assets
COPY --from=builder /app/api/dist ./dist

# Create storage directory for fallback
RUN mkdir -p /app/api/data/firestore

# Copy public frontend assets to /app/public
WORKDIR /app
RUN mkdir -p /app/public
COPY index.html missions.html demo.html brief.html terms.html privacy.html thankyou.html research-operations-demo.html /app/public/
COPY css ./public/css
COPY js ./public/js
COPY assets ./public/assets
COPY ["gripr business model.png", "./public/"]

# Run as non-root node user for container security
RUN chown -R node:node /app
USER node

WORKDIR /app/api
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-10000}/api/health || exit 1

CMD ["node", "dist/server.js"]
