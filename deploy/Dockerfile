# syntax = docker/dockerfile:1.4

# Stage 1: Build the application
FROM node:22-alpine AS builder

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

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy CORS runtime scripts
COPY deploy/runtime/40-render-cors.sh /docker-entrypoint.d/40-render-cors.sh
COPY deploy/runtime/cors-origin.conf.template /opt/csp-runtime/cors-origin.conf.template

# Make scripts executable
RUN chmod +x /docker-entrypoint.d/40-render-cors.sh

# Copy built assets from builder stage
COPY --from=builder /app/dist/ticket/browser /usr/share/nginx/html

# Expose port 4205 (ticketing port per ADR-025)
EXPOSE 4205

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4205/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]