FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server --omit=dev

# Build application
FROM base AS builder
COPY package*.json ./
COPY server/ ./server/
RUN npm ci --workspace=server
RUN npm run build --workspace=server

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Production image
FROM base AS runner
WORKDIR /app/server

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/node_modules ../node_modules
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./package.json

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
