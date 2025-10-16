# Simple Dockerfile for Next.js API in monorepo
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN npm install -g pnpm@9.15.9

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build packages and API
RUN pnpm run build --filter=@tbe/constants --filter=@tbe/types --filter=@tbe/utils --filter=@tbe/interface --filter=@tbe/services
RUN pnpm run build --filter=@tbe/api

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start the application using the standalone server
CMD ["node", ".next/standalone/apps/api/server.js"]