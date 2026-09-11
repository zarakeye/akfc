#!/usr/bin/env bash
#
# AKFC — Build fix ÉTAPE 2 : instrumentation.ts DANS src/.
#
# L'app utilise le dossier `src/` (apps/web/src/app). Next cherche donc
# `instrumentation.ts` dans `apps/web/src/`, PAS à la racine `apps/web/`. Le
# fichier étant à la racine, Next ne le compile jamais → aucun `instrumentation.js`
# dans l'image → `register()` ne tourne pas → self-heal muet (labels + espaces
# de groupe non recréés). On le déplace (contenu inchangé).
#
# Périmètre : déplacement de fichier. Typecheck, puis REBUILD serveur = le test.
# Usage : bash apply-build-fix-2-instrumentation-src.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SRC="apps/web/instrumentation.ts"
DST="apps/web/src/instrumentation.ts"

if [ -f "$DST" ]; then echo "— déjà en place ($DST existe)"; exit 0; fi
[ -f "$SRC" ] || { echo "ERREUR: $SRC introuvable (déjà déplacé ?)." >&2; exit 1; }
[ -d "apps/web/src" ] || { echo "ERREUR: apps/web/src absent — l'app n'utilise pas src/ ?" >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# git mv si suivi, sinon mv simple
if git ls-files --error-unmatch "$SRC" >/dev/null 2>&1; then
  git mv "$SRC" "$DST"
  echo "  git mv $SRC → $DST"
else
  mv "$SRC" "$DST"
  echo "  mv $SRC → $DST"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "build: instrumentation.ts dans src/ (chargé par Next → self-heal au boot)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi