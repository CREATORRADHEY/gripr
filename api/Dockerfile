# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for GRIPR.STUDIO Backend on Google Cloud Run

# ================= Stage 1: Build =================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy application source code
COPY src ./src

# Compile TypeScript
RUN npm run build

# ================= Stage 2: Runtime =================
FROM node:22-alpine AS runner

WORKDIR /app

# Cloud Run injects PORT (defaults to 8080 or 3000)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Create storage directory for persistent file-backed Firestore cache
RUN mkdir -p /app/data/firestore && chown -R node:node /app

# Run as non-privileged node user for security
USER node

# Expose server port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-3000}/api/health || exit 1

# Start the Fastify backend server
CMD ["node", "dist/server.js"]
