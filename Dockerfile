# Use Bun official image
FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json ./
RUN bun install

# Development stage
FROM base AS development
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["bun", "run", "--hot", "src/index.ts"]
