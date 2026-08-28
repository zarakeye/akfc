#!/usr/bin/env bash
#
# AKFC — Finder : l'arbre ne doit pas afficher les dossiers en Capitale forcée.
#
# CAUSE (de la fausse « majuscule impossible à enlever ») : le libellé de dossier
# dans l'ARBRE porte `className="truncate capitalize"`. `text-transform:
# capitalize` est purement visuel — il ne change PAS la valeur stockée. Résultat :
# un dossier `groups` (minuscule en base) s'affiche « Groups » dans l'arbre, ce
# qui donne l'illusion qu'on ne peut pas le renommer en minuscule. La grille, qui
# n'a pas cette classe, affiche bien `groups`.
#
# FIX : retirer `capitalize` du libellé de l'arbre → il s'aligne sur la grille et
# montre le nom RÉEL tel que stocké. (Les vrais libellés lisibles des conteneurs,
# ex. « Espace de groupes », viendront proprement via le mécanisme `FolderLabel`
# du découplage — R2-R4.)
#
# 1 fichier, 1 ancre, typecheck web. Effectif en dev tout de suite.
#
# Usage : bash fix-tree-folder-capitalize.sh
#         AKFC_APPLY_ONLY=1 bash fix-tree-folder-capitalize.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = 'className="truncate capitalize"'
if old not in s:
    print("déjà corrigé (pas de 'capitalize' sur le libellé)"); sys.exit(0)
assert s.count(old) == 1, "ancre 'truncate capitalize' introuvable/multiple"
s = s.replace(old, 'className="truncate"')
p.write_text(s, encoding="utf-8")
print("arbre : 'capitalize' retiré (nom réel affiché)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(finder): retire le capitalize du libellé d'arbre (affichait les dossiers avec une fausse majuscule)" \
  && echo "commit $(git rev-parse --short HEAD)"