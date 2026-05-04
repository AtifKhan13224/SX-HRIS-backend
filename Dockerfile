# SX-HRIS Backend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production --legacy-peer-deps

# Stage 2: Production Stage
FROM node:18-alpine AS production

# Install dumb-init to handle PID 1 properly
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy necessary files
COPY --chown=nodejs:nodejs migrations ./migrations
COPY --chown=nodejs:nodejs .env.production ./.env

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
