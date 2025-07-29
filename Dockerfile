FROM oven/bun:1

# Install git and docker for auto-update capability
RUN apt-get update && apt-get install -y \
    git \
    docker.io \
    docker-compose \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Initialize git repo (for updates)
RUN git init && git config --global --add safe.directory /app

# Environment variables
ENV NODE_ENV=production

# Start the worker
CMD ["bun", "run", "src/rabbitmq-worker.ts"]