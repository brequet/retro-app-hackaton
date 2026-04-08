# ---- Base ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /workspace

# ---- Dependencies ----
FROM base AS deps
# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
# Copy all workspace package.json files
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
# Install all dependencies for the workspace
RUN pnpm install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend ./backend/
COPY frontend/package.json ./frontend/
# Copy node_modules from deps stage
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/backend/node_modules ./backend/node_modules
# Build backend
WORKDIR /workspace/backend
RUN pnpm run build

# ---- Production Dependencies ----
FROM base AS prod-deps
# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
# Install production dependencies only for backend
RUN pnpm install --prod --frozen-lockfile --filter backend

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Install sqlite3 for better-sqlite3 native module
RUN apk add --no-cache sqlite

# Copy the built application from the builder stage
COPY --from=builder /workspace/backend/dist ./dist

# Copy backend production node_modules from prod-deps stage
COPY --from=prod-deps /workspace/backend/node_modules ./node_modules

# Create data directory for SQLite database
RUN mkdir -p /app/data

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
