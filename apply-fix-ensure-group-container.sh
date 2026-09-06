#!/usr/bin/env bash
#
# AKFC — Corrige le conteneur `groups` recréé à CHAQUE BOOT.
#
# Coupable : ensureGroupSpaceFolder.service.ts (module memberGroups, manqué par
# l'inc 1) upsertait une ligne de registre `Folder` pour `${appRoot}/groups`
# (ancien conteneur, codé en dur), en plus de l'espace du groupe. Appelé au boot
# via ensureAdminGroup / ensureAllGroupSpaces → `groups` réapparaissait sans
# cesse dans le finder (qui liste le registre par préfixe).
#
# Fix : le conteneur ensuré devient `${appRoot}/collaborative-group-spaces`.
#
# Périmètre : BACKEND (1 fichier). Un aller-retour = un typecheck.
# Usage : bash apply-fix-ensure-group-container.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
F="packages/backend/src/modules/memberGroups/ensureGroupSpaceFolder.service.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'collaborative-group-spaces`, base]' "$F" 2>/dev/null; then
  echo "— déjà appliqué"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

sub(
    "  for (const fullPath of [`${appRoot}/groups`, base]) {",
    "  for (const fullPath of [`${appRoot}/collaborative-group-spaces`, base]) {",
    "boucle conteneur",
)
sub(
    " * créant ses lignes de registre `Folder` — le conteneur `groups/` et l'espace",
    " * créant ses lignes de registre `Folder` — le conteneur `collaborative-group-spaces/` et l'espace",
    "commentaire",
)

p.write_text(s, encoding="utf-8")
print("Fix appliqué.")
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
if git commit -m "fix(finder): ensureGroupSpaceFolder ensure le conteneur collaborative-group-spaces (fin du groups recréé au boot)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "→ NETTOYAGE de la ligne restante (créée par les boots précédents) :"
  echo "   psql -U akfc -d akfc_db -c \"DELETE FROM \\\"CloudinaryFolder\\\" WHERE \\\"fullPath\\\" = 'AKFC/groups';\""
  echo "→ Puis pnpm clean + relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi