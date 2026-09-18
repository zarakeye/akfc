#!/usr/bin/env bash
# AKFC — Régénère le client Prisma (logoKey) puis typecheck + commit.
# Usage : bash apply-logo-r2-generate.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }

echo "== logoKey présent dans le schéma ? =="
grep -n 'logoKey' prisma/schema.prisma || { echo "ERREUR: logoKey absent du schéma — relance apply-logo-r2-1-backend.sh." >&2; exit 1; }

echo "== génération du client Prisma =="
GEN_OK=0
for cmd in \
  "pnpm --filter @workspace/backend exec prisma generate" \
  "pnpm exec prisma generate" \
  "pnpm -w exec prisma generate" \
  "npx --yes prisma generate"; do
  echo "→ $cmd"
  if eval "$cmd" > /tmp/akfc_gen.log 2>&1; then GEN_OK=1; echo "  ok"; break; fi
  echo "  (échec, essai suivant)"
done
if [ "$GEN_OK" != "1" ]; then
  echo "❌ prisma generate a échoué. Dernières lignes :"; tail -15 /tmp/akfc_gen.log; exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(site-settings): logo R2 hors finder — logoKey + uploadLogo + route /api/media/site-logo" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }