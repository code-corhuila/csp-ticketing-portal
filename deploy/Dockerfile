# syntax = docker/dockerfile:1.4

# Stage 1: Build the application
FROM node:22.14.0-alpine3.20 AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runtime

# Copy custom nginx config
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy CORS runtime scripts
COPY deploy/runtime/40-render-cors.sh /docker-entrypoint.d/40-render-cors.sh
COPY deploy/runtime/cors-origin.conf.template /opt/csp-runtime/cors-origin.conf.template

# Make scripts executable
RUN chmod +x /docker-entrypoint.d/40-render-cors.sh

# Copy built assets from builder stage
COPY --from=builder /app/dist/ticket/browser /usr/share/nginx/html

# Serve on port 80 like the shell and the other portals (ADR-026); 4205 of ADR-025 is the host port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]