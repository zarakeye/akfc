#!/usr/bin/env bash
#
# AKFC — CORRECTIF : ensureContentRootsInTree ne s'applique qu'à la RACINE.
#
# Bug introduit au Lot C : la grille fait adapter.list(path) → storage.getTree(
# path, depth:1). getTree appelait ensureContentRootsInTree SANS garde → les
# racines (courses/seminars/personal-space/…) étaient injectées comme enfants de
# TOUT dossier ouvert en grille. On garde sur input.path === appRoot (l'arbre et
# la grille racine passent tous deux par getTree(appRoot)).
#
# Périmètre : BACKEND. Un aller-retour = un typecheck.
# Usage : bash apply-fix-content-roots-guard.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
R="packages/backend/src/modules/storage/router.ts"
[ -f "$R" ] || { echo "ERREUR: $R introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$R" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = (
    "      result.root = await ensureContentRootsInTree(\n"
    "        result.root,\n"
    "        ctx.prisma,\n"
    "        ctx.appRoot,\n"
    "      );"
)
new = (
    "      // Uniquement à la RACINE : la grille fait adapter.list = getTree\n"
    "      // depth1 sur CHAQUE dossier ; sans cette garde on injecterait les\n"
    "      // racines de contenu dans tous les dossiers.\n"
    "      if (input.path === ctx.appRoot) {\n"
    "        result.root = await ensureContentRootsInTree(\n"
    "          result.root,\n"
    "          ctx.prisma,\n"
    "          ctx.appRoot,\n"
    "        );\n"
    "      }"
)

if "if (input.path === ctx.appRoot) {\n        result.root = await ensureContentRootsInTree" in s:
    print("— déjà appliqué (garde présente)"); sys.exit(0)

n = s.count(old)
assert n == 1, f"ancre introuvable/multiple ({n})"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("Garde appliquée.")
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
if git commit -m "fix(finder): racines de contenu injectées uniquement à la racine (grille n'était plus polluée)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "→ Pense à: pnpm clean puis relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi