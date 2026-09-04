# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Builder
# ---------------------------------------------------------------------------
# bookworm-slim (Debian) is used instead of Alpine because:
# - Prisma binaryTargets already include debian-openssl-3.0.x (not musl/Alpine)
# - bcrypt ships native bindings more reliably on glibc
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate \
  && npx nest build

# ---------------------------------------------------------------------------
# Production
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Production deps include prisma + @prisma/client (required for migrate deploy / runtime)
RUN npm ci --omit=dev \
  && npx prisma generate \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads \
  && chown -R node:node /app

USER node

EXPOSE 3000

# Nest build emits dist/src/main.js (prisma/*.ts inclusion widens TypeScript rootDir)
CMD ["node", "dist/src/main.js"]
