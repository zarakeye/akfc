#!/usr/bin/env bash
#
# AKFC — R1b (cosmétique) : masquer « Déplacer… » sur les dossiers-entité.
#
# Le serveur refuse déjà move/rename/delete des dossiers-entité (R1). Côté menu
# contextuel, « Supprimer » est déjà masqué sur ces dossiers ; « Déplacer… » ne
# l'était pas → on l'aligne (même prédicat que le delete). « Renommer » RESTE
# (il édite désormais le libellé via R4).
#
# 3 fichiers (GridItem, FinderCompactRow, FinderTableRow), item « Déplacer… »
# identique partout. Import `isProtectedEntityFolder` ajouté aux deux rows (déjà
# présent dans GridItem). Front seul, typecheck web.
#
# NB : le DnD reste possible visuellement mais le serveur le refuse (R1). Empêcher
# le drag lui-même est un ajout séparé si tu le veux.
#
# Usage : bash apply-r1b-hide-move-entity.sh
#         AKFC_APPLY_ONLY=1 bash apply-r1b-hide-move-entity.sh   (clone)
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib, sys

FILES = [
    "apps/web/src/features/finder-core/components/GridItem.tsx",
    "apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
    "apps/web/src/features/finder-core/components/FinderTableRow.tsx",
]

IMPORT_LINE = (
    "import { isProtectedEntityFolder } from '@features/finder-core/utils/spaceFolderKind';\n"
)
MOVE_ANCHOR = "import { MoveDialog } from '@features/finder-core/components/MoveDialog';\n"

MOVE_OLD = (
    "      {\n"
    "        label: 'Déplacer…',\n"
    "        onClick: () => setMovingNodes(targetNodes),\n"
    "      },\n"
)
MOVE_NEW = (
    "      ...(targetNodes.some(\n"
    "        (n) => n.type === \"folder\" && isProtectedEntityFolder(n.path),\n"
    "      )\n"
    "        ? []\n"
    "        : [\n"
    "            {\n"
    "              label: 'Déplacer…',\n"
    "              onClick: () => setMovingNodes(targetNodes),\n"
    "            } as ContextMenuItem,\n"
    "          ]),\n"
)

for rel in FILES:
    p = pathlib.Path(rel)
    if not p.exists():
        print(f"ERREUR: {rel} introuvable", file=sys.stderr); sys.exit(1)
    s = p.read_text(encoding="utf-8")

    # déjà gardé ? (le prédicat sur le move implique isProtectedEntityFolder + spread)
    if "label: 'Déplacer…',\n            } as ContextMenuItem," in s:
        print(f"déjà gardé : {rel}"); continue

    # import (seulement si absent — GridItem l'a déjà)
    if "isProtectedEntityFolder" not in s:
        assert s.count(MOVE_ANCHOR) == 1, f"ancre import MoveDialog introuvable/multiple dans {rel}"
        s = s.replace(MOVE_ANCHOR, MOVE_ANCHOR + IMPORT_LINE)

    # garde du move item
    assert s.count(MOVE_OLD) == 1, f"ancre item Déplacer introuvable/multiple dans {rel}"
    s = s.replace(MOVE_OLD, MOVE_NEW)

    p.write_text(s, encoding="utf-8")
    print(f"patché : {rel}")
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
git commit -m "fix(finder): masque « Déplacer… » sur les dossiers-entité (aligné sur Supprimer)" \
  && echo "commit $(git rev-parse --short HEAD)"