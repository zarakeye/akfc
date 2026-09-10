#!/usr/bin/env bash
#
# AKFC — Build fix ÉTAPE 1 : inclure packages + prisma dans l'image autonome.
#
# Le boot crashe (« Code file not found » : schéma Prisma, migrations, services
# backend) parce que le traceur du build `standalone` rate les fichiers atteints
# par les `await import()` DYNAMIQUES d'instrumentation.ts et les assets NON-JS
# (prisma). On les force dans l'image via `outputFileTracingIncludes`.
#
# NB : on NE peut PAS staticiser les imports d'instrumentation (un runtime edge
# existe via middleware.ts → ça casserait le build edge). D'où cette approche.
#
# Périmètre : apps/web/next.config.ts. Typecheck (valide le type NextConfig),
# puis REBUILD Docker requis côté serveur (le vrai test).
# Usage : bash apply-build-fix-1-tracing-includes.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
F="apps/web/next.config.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'outputFileTracingIncludes' "$F" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = '  outputFileTracingRoot: path.join(process.cwd(), "../../"),'
assert s.count(old) == 1, "ancre outputFileTracingRoot introuvable/multiple"
new = old + '''

  /**
   * Le traceur du build `standalone` rate les fichiers atteints par des
   * `await import()` DYNAMIQUES (instrumentation.ts → services backend, résolus
   * via l'alias `@backend/*` vers la source) et les assets NON-JS (schéma
   * Prisma, migrations). Sans eux dans l'image, le boot crashe en « Code file
   * not found » et le self-heal ne tourne jamais. On force donc leur inclusion.
   * Globs relatifs au dossier du projet (apps/web) ; clé `**` = toutes entrées.
   */
  outputFileTracingIncludes: {
    "**": [
      "../../packages/backend/**/*",
      "../../packages/contracts/**/*",
      "../../prisma/**/*",
    ],
  },'''
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("outputFileTracingIncludes ajouté.")
PY

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
if git commit -m "build: outputFileTracingIncludes (packages/backend|contracts + prisma) pour le standalone" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi