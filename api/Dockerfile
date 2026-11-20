# syntax=docker/dockerfile:1
# GRIPR.STUDIO — Fastify Backend Container Build

# ================= Stage 1: Build =================
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.33.3

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
RUN pnpm run build

# ================= Stage 2: Runtime =================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=10000 \
    HOST=0.0.0.0 \
    SERVE_STATIC=true \
    PERSISTENCE_MODE=demo_only \
    DEMO_MODE=true

RUN npm install -g pnpm@10.33.3

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data/firestore && chown -R node:node /app
USER node

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-10000}/api/health || exit 1

CMD ["node", "dist/server.js"]
