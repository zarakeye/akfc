#!/usr/bin/env bash
#
# AKFC — Documents membres : action de mise à disposition dans les 3 vues
# restantes (arbre, ligne compacte, ligne tableau), même motif que la grille.
#
# Chaque vue reçoit : imports, état `publishTarget`, garde `isAdmin`, item de
# menu (fichier + admin), rendu du dialogue à côté du MoveDialog.
# FinderTreeFile ne gère que des fichiers → garde `isAdmin` seule ;
# FinderCompactRow / FinderTableRow → `isAdmin && !isFolder && !isStatus`.
#
# Nécessite le câblage grille (dialogue) déjà appliqué.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-menu-allviews.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-menu-allviews.sh
#
set -euo pipefail

if [ ! -f "package.json" ] || [ ! -d "apps/web/src/features/finder-core/components" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC." >&2
  exit 1
fi

IMPORTS=$'import { PublishToMembersDialog } from \'@features/member-documents/PublishToMembersDialog\';\nimport { storagePathOf } from \'@features/finder-core/utils/storagePath\';\nimport { useSessionStore } from \'@lib/stores/useSessionStore\';'

python3 - <<PY
import pathlib

BASE = "apps/web/src/features/finder-core/components"
IMPORTS = (
    "import { PublishToMembersDialog } from '@features/member-documents/PublishToMembersDialog';\n"
    "import { storagePathOf } from '@features/finder-core/utils/storagePath';\n"
    "import { useSessionStore } from '@lib/stores/useSessionStore';"
)

MOVE_IMPORT = "import { MoveDialog } from '@features/finder-core/components/MoveDialog';"
STATE_OLD = "  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);"
STATE_NEW = (
    "  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);\n"
    "  const [publishTarget, setPublishTarget] = useState<FinderNode | null>(null);\n"
    "  const isAdmin = useSessionStore((st) => st.session?.user?.role?.name === 'ADMIN');"
)
MENU_OLD = (
    "        label: 'Déplacer…',\n"
    "        onClick: () => setMovingNodes(targetNodes),\n"
    "      },"
)

def menu_new(gate):
    return (
        "        label: 'Déplacer…',\n"
        "        onClick: () => setMovingNodes(targetNodes),\n"
        "      },\n"
        f"      ...({gate}\n"
        "        ? [\n"
        "            {\n"
        "              label: 'Rendre disponible aux membres',\n"
        "              onClick: () => setPublishTarget(node),\n"
        "            } as ContextMenuItem,\n"
        "          ]\n"
        "        : []),"
    )

def dialog_block(indent):
    i = " " * indent
    return (
        f"{i}{{publishTarget && (\n"
        f"{i}  <PublishToMembersDialog\n"
        f"{i}    path={{storagePathOf(publishTarget)}}\n"
        f"{i}    defaultTitle={{publishTarget.name}}\n"
        f"{i}    onClose={{() => setPublishTarget(null)}}\n"
        f"{i}  />\n"
        f"{i})}}\n\n"
    )

# (fichier, garde du menu, ancre de rendu MoveDialog→menuPos, indent du dialogue)
targets = [
    ("FinderTreeFile.tsx", "isAdmin",
     "            setMovingNodes(null);\n          }}\n        />\n      )}\n\n      {menuPos && (",
     6),
    ("FinderCompactRow.tsx", "isAdmin && !isFolder && !isStatus",
     "          setMovingNodes(null);\n        }}\n      />\n    )}\n\n    {menuPos && (",
     4),
    ("FinderTableRow.tsx", "isAdmin && !isFolder && !isStatus",
     "                setMovingNodes(null);\n              }}\n            />\n          )}\n\n          {menuPos && (",
     10),
]

for fname, gate, render_anchor, indent in targets:
    p = pathlib.Path(BASE) / fname
    s = p.read_text(encoding="utf-8")
    if "PublishToMembersDialog" in s:
        print(f"{fname} : déjà câblé")
        continue

    assert s.count(MOVE_IMPORT) == 1, f"{fname} : ancre import introuvable"
    s = s.replace(MOVE_IMPORT, MOVE_IMPORT + "\n" + IMPORTS)

    assert s.count(STATE_OLD) == 1, f"{fname} : ancre state introuvable"
    s = s.replace(STATE_OLD, STATE_NEW)

    assert s.count(MENU_OLD) == 1, f"{fname} : ancre item Déplacer introuvable"
    s = s.replace(MENU_OLD, menu_new(gate))

    dlg = dialog_block(indent)
    # insère le dialogue juste avant le bloc menuPos
    menupos_marker = render_anchor.rsplit("\n", 1)[-1]  # la ligne {menuPos && (
    assert s.count(render_anchor) == 1, f"{fname} : ancre rendu MoveDialog introuvable"
    s = s.replace(render_anchor,
                  render_anchor.replace(menupos_marker, dlg + menupos_marker, 1))

    p.write_text(s, encoding="utf-8")
    print(f"{fname} : câblé")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): action « Rendre disponible aux membres » dans arbre / ligne tableau / ligne compacte" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi