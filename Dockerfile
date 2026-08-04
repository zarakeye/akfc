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
# `openssl` est requis par les moteurs Prisma ; absent de l'image slim.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
# Corepack installe la version de pnpm déclarée dans `packageManager`, donc
# exactement celle qui a produit le lockfile.
RUN corepack enable
WORKDIR /app

# ─── Dépendances ──────────────────────────────────────────────────────────
#
# Manifestes et schéma AVANT le code : Docker met cette couche en cache, donc
# une modification de code ne réinstalle rien.
#
# Le schéma est nécessaire dès l'installation parce que le `postinstall` du
# dépôt lance `pnpm prisma generate`.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY apps/web/package.json ./apps/web/
COPY packages/backend/package.json ./packages/backend/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/finder-core/package.json ./packages/finder-core/
# `packages/config` n'a pas de manifeste : ce n'est pas un paquet du
# workspace, seulement un dossier de sources. Il arrive avec `COPY . .`.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
 && pnpm install --frozen-lockfile

# ─── Construction ─────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
# `pnpm prisma generate` est relancé : `COPY . .` a pu écraser le client
# généré, et le construire sans lui échoue sur des types absents.
RUN pnpm prisma generate
# La télémétrie Next appelle un serveur distant pendant la construction.
ENV NEXT_TELEMETRY_DISABLED=1
# `--filter web` place le répertoire courant dans `apps/web`, ce dont
# `next.config.ts` a besoin : il y résout son greffon remark par
# `process.cwd()`.
RUN pnpm --filter web build

# ─── Migrateur ────────────────────────────────────────────────────────────
#
# Cible séparée, lancée UNE FOIS avant le service et attendue jusqu'à sa fin.
#
# Plutôt qu'un `migrate deploy` glissé dans le démarrage du serveur, ce qui
# expose à deux vrais dangers : plusieurs instances migrant simultanément, et
# un serveur qui démarre alors que la migration a échoué.
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
CMD ["pnpm", "prisma", "migrate", "deploy"]

# ─── Service ──────────────────────────────────────────────────────────────
#
# La sortie autonome contient son propre serveur et seulement les dépendances
# que le code atteint réellement. Sa disposition reflète celle du monorepo,
# d'où les chemins en `apps/web/`.
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Écouter sur toutes les interfaces : depuis l'extérieur du conteneur,
# `localhost` n'est pas joignable.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Utilisateur non privilégié : un processus compromis ne doit pas être root.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# `static` et `public` ne sont PAS inclus dans la sortie autonome — c'est
# l'oubli le plus courant, et il donne un site sans styles ni images.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
