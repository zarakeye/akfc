# syntax=docker/dockerfile:1

# ══════════════════════════════════════════════════════════════════════════
#  AKFC — image de production
#
#  Deux cibles depuis une seule construction :
#    - `migrator` : schéma + migrations + outil Prisma, lancé une fois avant
#                   le démarrage du service ;
#    - `runner`   : le serveur Next autonome, sans outillage.
#
#  Debian (`slim`) et non Alpine : la bibliothèque C d'Alpine (musl) oblige
#  Prisma à un moteur différent, à déclarer dans `binaryTargets` et à
#  resurveiller à chaque montée de version. Quelques dizaines de mégaoctets
#  de plus valent mieux que cette catégorie d'ennuis.
# ══════════════════════════════════════════════════════════════════════════

ARG NODE_VERSION=22

# ─── Base commune : Node + pnpm à la version épinglée du dépôt ─────────────
FROM node:${NODE_VERSION}-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ─── Dépendances ──────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY apps/web/package.json ./apps/web/
COPY packages/backend/package.json ./packages/backend/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/finder-core/package.json ./packages/finder-core/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile

# ─── Construction ─────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN rm -rf node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client \
  node_modules/.prisma/client 2>/dev/null || true
RUN pnpm prisma generate --schema=prisma/schema.prisma
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_APP_SHORT_NAME
ARG NEXT_PUBLIC_APP_FULL_NAME
ENV NEXT_PUBLIC_APP_SHORT_NAME=${NEXT_PUBLIC_APP_SHORT_NAME}
ENV NEXT_PUBLIC_APP_FULL_NAME=${NEXT_PUBLIC_APP_FULL_NAME}
RUN pnpm --filter web build

# ─── Migrateur ────────────────────────────────────────────────────────────
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
CMD ["pnpm", "prisma", "migrate", "deploy"]

# ─── Service ──────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Création utilisateur + home + cache Corepack
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home nextjs \
  && mkdir -p /home/nextjs/.cache/node/corepack/v1 \
  && chown -R nextjs:nodejs /home/nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
