# syntax=docker/dockerfile:1
# GRIPR.STUDIO — Unified Frontend & Fastify Backend for Google Cloud Run (Buildathon Deployment)

# ================= Stage 1: Build Backend =================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY api/package*.json api/tsconfig.json ./api/

WORKDIR /app/api
RUN npm ci

# Copy backend source code
COPY api/src ./src

# Build TypeScript to dist
RUN npm run build

# ================= Stage 2: Production Runtime =================
FROM node:22-alpine AS runner

WORKDIR /app

# Cloud Run injects PORT (defaults to 8080) and expects binding to 0.0.0.0
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    SERVE_STATIC=true \
    PERSISTENCE_MODE=cloud_firestore

# Install production dependencies only
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm ci --omit=dev && npm cache clean --force

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
COPY "gripr business model.png" ./public/

# Run as non-root node user for container security
RUN chown -R node:node /app
USER node

WORKDIR /app/api
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-8080}/api/health || exit 1

CMD ["node", "dist/server.js"]
