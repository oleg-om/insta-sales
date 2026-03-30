FROM node:20-slim AS base

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server --omit=dev

# Build application
FROM base AS builder
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server
COPY server/ ./server/
RUN npm run build --workspace=server

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy root package.json for workspace structure
COPY --from=builder /app/package*.json ./

# Copy node_modules (installed at root by workspace)
COPY --from=builder /app/node_modules ./node_modules

# Copy server files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/package.json ./server/package.json

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

WORKDIR /app/server

EXPOSE 3001

CMD ["node", "dist/index.js"]
