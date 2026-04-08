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
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend ./frontend/
COPY backend/package.json ./backend/
# Copy node_modules from deps stage
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/frontend/node_modules ./frontend/node_modules
# Build frontend
WORKDIR /workspace/frontend
RUN pnpm run export:web

# ---- Production ----
FROM nginx:alpine AS production

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
