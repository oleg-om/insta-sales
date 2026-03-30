FROM node:20-alpine AS base

WORKDIR /app

# Build application
FROM base AS builder

# Copy workspace files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm i --workspace=client

# Copy client source
COPY client/ ./client/

# Build with environment variable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

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
