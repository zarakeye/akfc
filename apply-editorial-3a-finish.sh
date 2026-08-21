#!/usr/bin/env bash
#
# AKFC — finalise R3a SANS prisma generate.
#
# À lancer APRÈS `pnpm prisma migrate deploy` (qui applique la migration HomeHero
# ET régénère le client Prisma). Ce script ne fait que typecheck + commit, pour
# contourner le hoquet corepack sur `pnpm prisma generate`.
#
# Usage : bash apply-editorial-3a-finish.sh
#
set -euo pipefail

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
  exit 1
fi
if ! grep -q "model HomeHero" prisma/schema.prisma 2>/dev/null; then
  echo "ERREUR: modèle HomeHero absent du schéma — relance d'abord apply-editorial-3a-home-hero-backend.sh." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
  exit 1
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  echo
  echo "Si l'erreur porte sur 'homeHero' inconnu du client Prisma : le client n'a pas été régénéré."
  echo "Lance 'pnpm prisma generate' (ou 'pnpm prisma migrate deploy') puis relance ce script."
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification à committer"; exit 0; fi
git add -A
if git commit -m "feat(home): hero éditable (HomeHero) consommé par l'accueil, structure inchangée" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi