# ---- Base ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json ./
RUN pnpm install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production

# Install sqlite3 for better-sqlite3 native module
RUN apk add --no-cache sqlite

# Copy package files to install only production dependencies
COPY package.json ./
RUN pnpm install --prod --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy database migration/seed files if needed
COPY --from=builder /app/src/seed.ts ./src/seed.ts

# Create data directory for SQLite database
RUN mkdir -p /app/data

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
