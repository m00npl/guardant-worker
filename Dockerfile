# GuardAnt Worker Docker Image
FROM oven/bun:1-alpine

# Install required tools
RUN apk add --no-cache \
    curl \
    wget \
    bash \
    tini \
    nodejs

# Create app directory
WORKDIR /app

# Copy only necessary files
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.js ./

# Install dependencies
RUN bun install

# Copy all source files
COPY src/ ./src/

# Build the auto-geographic-worker
RUN bun build ./src/auto-geographic-worker.ts --target bun --outfile ./dist/auto-geographic-worker.js

# Clean up dev dependencies (bun doesn't need prune)
RUN rm -rf node_modules/.cache

# Create non-root user
RUN addgroup -g 1001 -S worker && \
    adduser -u 1001 -S worker -G worker && \
    chown -R worker:worker /app

# Switch to non-root user  
USER worker

# Environment variables (not sensitive defaults)
ENV NODE_ENV=production \
    API_ENDPOINT="https://guardant.me" \
    WORKER_REGION="auto" \
    MAX_CONCURRENT="10" \
    LOG_LEVEL="info"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start the worker
CMD ["bun", "dist/auto-geographic-worker.js"]