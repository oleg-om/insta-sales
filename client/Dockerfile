FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --workspace=client

# Build application
FROM base AS builder
COPY package*.json ./
COPY client/ ./client/
RUN npm ci --workspace=client
WORKDIR /app/client
RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
