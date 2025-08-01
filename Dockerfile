FROM oven/bun:1

# Install only essential tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src

# Environment variables
ENV NODE_ENV=production

# Start the worker
CMD ["bun", "run", "src/rabbitmq-worker.ts"]