#!/usr/bin/env bash
#
# step_dockerize.sh
#
# De quoi construire une image du projet. Le `docker-compose.yml` et le
# branchement au proxy attendent l'organisation de ton serveur — mais tout ce
# qui précède est indépendant d'elle, autant l'avancer.
#
# ─── 1. La sortie autonome ─────────────────────────────────────────────────
#
# `output: "standalone"` fait produire à Next un dossier qui contient son
# propre serveur et UNIQUEMENT les dépendances réellement atteintes par le
# code. Sans lui, l'image embarque tout `node_modules` du monorepo.
#
# `outputFileTracingRoot` est indispensable ici et souvent oublié : par
# défaut, Next trace les fichiers depuis `apps/web`, et manque donc
# `packages/backend` et `packages/contracts` — qui vivent au-dessus. Le
# serveur démarre alors et s'effondre au premier import.
#
# ─── 2. Debian et non Alpine ───────────────────────────────────────────────
#
# Alpine donne des images plus petites, mais son bibliothèque C (musl) oblige
# Prisma à embarquer un moteur différent, qu'il faut déclarer dans
# `binaryTargets` et qui casse à chaque montée de version. `node:22-slim`
# pèse quelques dizaines de mégaoctets de plus et supprime toute cette
# catégorie d'ennuis. Pour un site de club, l'arbitrage est vite fait.
#
# ─── 3. Les migrations sont une ÉTAPE À PART ───────────────────────────────
#
# L'image de service ne contient pas l'outil Prisma : la sortie autonome ne
# garde que ce que le code appelle, et une commande de migration n'en fait
# pas partie.
#
# Le Dockerfile produit donc DEUX cibles depuis la même construction :
# `migrator`, qui porte le schéma, les migrations et l'outil ; et `runner`,
# qui ne porte que le serveur. Ton compose lancera la première jusqu'à sa fin
# avant de démarrer la seconde.
#
# C'est plus verbeux qu'un `migrate deploy` glissé dans le démarrage du
# serveur, mais ça évite deux vrais dangers : plusieurs instances migrant en
# même temps, et un serveur qui démarre alors que la migration a échoué.
#
# ─── 4. L'installation en deux temps ───────────────────────────────────────
#
# Les manifestes et le schéma Prisma sont copiés AVANT le code source. Docker
# met en cache cette couche : tant que les dépendances ne bougent pas, une
# modification de code ne réinstalle rien. Sur un monorepo de cette taille,
# c'est la différence entre trois minutes et vingt secondes.
#
# Le schéma doit y être parce que ton `postinstall` lance
# `pnpm prisma generate` — sans schéma, l'installation échoue.
#
# ─── 5. Ce qu'il te faudra vérifier ────────────────────────────────────────
#
# La MÉMOIRE du serveur. Construire une application Next de cette taille
# demande volontiers 2 à 4 Go ; sur un petit VPS, le noyau tue le processus
# sans explication claire. Si c'est le cas, on construira l'image ailleurs et
# on ne poussera qu'elle — architecture différente, que je t'écrirai le
# moment venu.
#
# Usage :
#   bash step_dockerize.sh
#   AKFC_APPLY_ONLY=1 bash step_dockerize.sh
#
set -euo pipefail

next_config="apps/web/next.config.ts"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

if [ -f Dockerfile ]; then
  echo "✓ déjà appliqué (Dockerfile présent) — rien à faire"
  exit 0
fi

[ -f "$next_config" ] || { echo "✗ introuvable : $next_config"; exit 1; }

# ─────────────────────────────────────────────────────────────────────────
#  .dockerignore
# ─────────────────────────────────────────────────────────────────────────

cat > .dockerignore <<'IGNORE'
# Ce que Docker ne doit JAMAIS recevoir dans son contexte de construction.
#
# Un contexte allégé n'est pas qu'une question de vitesse : tout ce qui entre
# ici peut finir dans une couche de l'image, y compris ce qui ne devrait
# jamais quitter ta machine.

# Dépendances et artefacts : reconstruits dans l'image.
node_modules
**/node_modules
.next
**/.next
dist
**/dist
.turbo

# Secrets. Les variables d'environnement se passent au CONTENEUR, jamais à
# l'image : une valeur copiée dans une couche y reste, même supprimée ensuite.
.env
.env.*
!.env.example

# Résidus macOS, que OneDrive propage abondamment dans ce dépôt.
.DS_Store
**/.DS_Store
._*
**/._*

# Historique et outillage local.
.git
.github
.vscode
*.log

# Scripts d'application et sauvegardes qui traînent à la racine.
step_*.sh
fix_*.sh
diag_*.sh
audit_*.sh
*.sql
*.png
IGNORE
echo "  + .dockerignore"

# ─────────────────────────────────────────────────────────────────────────
#  Dockerfile
# ─────────────────────────────────────────────────────────────────────────

cat > Dockerfile <<'DOCKER'
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
DOCKER
echo "  + Dockerfile"

python3 - <<'PY'
import io

def edit(path, marker, old, new, label):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    if marker in src:
        print("  = %s (déjà présent)" % label)
        return
    n = src.count(old)
    assert n == 1, "ancre %d fois pour « %s » :\n%s" % (n, label, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % label)

edit("apps/web/next.config.ts", "outputFileTracingRoot",
"""const nextConfig: NextConfig = {""",
"""const nextConfig: NextConfig = {
  /**
   * Sortie AUTONOME : Next produit un dossier contenant son propre serveur et
   * uniquement les dépendances que le code atteint réellement. Sans elle,
   * l'image Docker embarque tout `node_modules` du monorepo.
   */
  output: "standalone",

  /**
   * Racine de traçage des fichiers.
   *
   * Indispensable en monorepo, et souvent oublié : par défaut Next trace
   * depuis `apps/web` et manque donc `packages/backend` et
   * `packages/contracts`, qui vivent AU-DESSUS. Le serveur démarre alors
   * normalement puis s'effondre au premier import.
   */
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
""",
"sortie autonome et racine de traçage")
PY

echo "✓ image constructible"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "build: Dockerfile, dockerignore et sortie autonome

Prepare la mise en ligne. Le docker-compose et le branchement au proxy
attendent l'organisation du serveur ; tout ce qui precede en est
independant.

output: standalone fait produire a Next son propre serveur et seulement
les dependances reellement atteintes. outputFileTracingRoot est
indispensable en monorepo et souvent oublie : par defaut Next trace
depuis apps/web et manque packages/backend et packages/contracts, qui
vivent au-dessus — le serveur demarre puis s'effondre au premier import.

Debian slim et non Alpine : la bibliotheque C d'Alpine (musl) oblige
Prisma a un moteur different, a declarer dans binaryTargets et a
resurveiller a chaque montee de version.

Deux cibles depuis une seule construction : migrator (schema,
migrations, outil Prisma) et runner (serveur seul). Le compose lancera
la premiere jusqu'a sa fin avant de demarrer la seconde — plutot qu'un
migrate deploy glisse dans le demarrage, qui expose a deux dangers
reels : plusieurs instances migrant simultanement, et un serveur qui
demarre alors que la migration a echoue.

Manifestes et schema copies AVANT le code : Docker met cette couche en
cache, donc une modification de code ne reinstalle rien. Le schema doit
y etre parce que le postinstall lance prisma generate.

static et public sont copies explicitement — ils ne font pas partie de
la sortie autonome, et c'est l'oubli qui donne un site sans styles.

Le contexte exclut les residus macOS (._* et .DS_Store) que OneDrive
propage, et tous les .env : une variable copiee dans une couche y reste
meme supprimee ensuite."

echo "✓ commité"
git log -1 --oneline