#!/usr/bin/env bash
#
# AKFC — Sécurisation finder — INCRÉMENT 1b : UX FRONT (menus).
#
# Masque l'action « Supprimer » sur les dossiers-entités à préfixe fixe
# (espaces de groupe/perso, avatars, conteneurs) dans les menus contextuels
# GRILLE (GridItem) et ARBRE (FinderTreeFolder). Le gate BACKEND (1a) reste la
# vraie protection ; ceci évite juste à l'utilisateur de tomber sur l'erreur.
#
# 3 fichiers : spaceFolderKind.ts (prédicat + regex avatars), GridItem.tsx,
# FinderTreeFolder.tsx. Le bouton corbeille multi-sélection de Finder.tsx est
# traité séparément (il faut ses imports).
#
# Usage : bash apply-finder-protect-1b-front.sh
#
set -euo pipefail
SK="apps/web/src/features/finder-core/utils/spaceFolderKind.ts"
GI="apps/web/src/features/finder-core/components/GridItem.tsx"
TF="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
for f in "$SK" "$GI" "$TF"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$SK" "$GI" "$TF" <<'PY'
import sys, pathlib

# ── 1) spaceFolderKind.ts : regex avatars + prédicat isProtectedEntityFolder ──
sk = pathlib.Path(sys.argv[1]); s = sk.read_text(encoding="utf-8")
if "isProtectedEntityFolder" not in s:
    a1 = "const PERSOS_CONTAINER = /^[^/]+\\/persos$/;\n"
    assert s.count(a1) == 1, "SK: ancre PERSOS_CONTAINER"
    s = s.replace(a1, a1 +
        "const AVATARS_CONTAINER = /^[^/]+\\/avatars$/;\n"
        "const AVATAR_FOLDER = /\\/avatars\\/[^/]+$/;\n", 1)
    a2 = ("export function isPersosContainer(path: string): boolean {\n"
          "  return PERSOS_CONTAINER.test(path);\n"
          "}\n")
    assert s.count(a2) == 1, "SK: ancre isPersosContainer"
    s = s.replace(a2, a2 +
        "\n"
        "/**\n"
        " * Dossier adossé à une ENTITÉ à préfixe fixe (groupe/perso/avatars) →\n"
        " * non supprimable dans le finder : sa suppression passe par le\n"
        " * gestionnaire de l'entité. Miroir front du gate backend\n"
        " * `isProtectedEntityFolderPath`. NB : disciplines/catégories (slug\n"
        " * dynamique) ne sont PAS couvertes ici.\n"
        " */\n"
        "export function isProtectedEntityFolder(path: string): boolean {\n"
        "  return (\n"
        "    GROUPS_CONTAINER.test(path) ||\n"
        "    PERSOS_CONTAINER.test(path) ||\n"
        "    AVATARS_CONTAINER.test(path) ||\n"
        "    GROUP_SPACE_PATH.test(path) ||\n"
        "    PERSO_SPACE_PATH.test(path) ||\n"
        "    AVATAR_FOLDER.test(path)\n"
        "  );\n"
        "}\n", 1)
    sk.write_text(s, encoding="utf-8"); print("spaceFolderKind.ts patché")
else:
    print("spaceFolderKind.ts déjà à jour")

# Bloc « Supprimer » commun (identique dans GridItem et FinderTreeFolder)
DELETE_OLD = (
"      {\n"
"        label: deleteLabel(targetNodes.length, targetNodes),\n"
"        destructive: true,\n"
"        onClick: () => {\n"
"          void deleteNodes(targetNodes);\n"
"        },\n"
"      },\n"
"    ];\n"
)
DELETE_NEW = (
"      ...(targetNodes.some(\n"
"        (n) => n.type === \"folder\" && isProtectedEntityFolder(n.path),\n"
"      )\n"
"        ? []\n"
"        : [\n"
"            {\n"
"              label: deleteLabel(targetNodes.length, targetNodes),\n"
"              destructive: true,\n"
"              onClick: () => {\n"
"                void deleteNodes(targetNodes);\n"
"              },\n"
"            } as ContextMenuItem,\n"
"          ]),\n"
"    ];\n"
)

# ── 2) GridItem.tsx ──
gi = pathlib.Path(sys.argv[2]); g = gi.read_text(encoding="utf-8")
if "isProtectedEntityFolder" not in g:
    imp = ("import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, "
           "isPersosContainer } from '@features/finder-core/utils/spaceFolderKind';\n")
    assert g.count(imp) == 1, "GI: ancre import spaceFolderKind"
    g = g.replace(imp,
        "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, "
        "isPersosContainer, isProtectedEntityFolder } from "
        "'@features/finder-core/utils/spaceFolderKind';\n", 1)
    assert g.count(DELETE_OLD) == 1, "GI: ancre bloc Supprimer"
    g = g.replace(DELETE_OLD, DELETE_NEW, 1)
    gi.write_text(g, encoding="utf-8"); print("GridItem.tsx patché")
else:
    print("GridItem.tsx déjà à jour")

# ── 3) FinderTreeFolder.tsx ──
tf = pathlib.Path(sys.argv[3]); t = tf.read_text(encoding="utf-8")
if "isProtectedEntityFolder" not in t:
    imp = ('import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, '
           'isPersosContainer } from "@features/finder-core/utils/spaceFolderKind";\n')
    assert t.count(imp) == 1, "TF: ancre import spaceFolderKind"
    t = t.replace(imp,
        'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, '
        'isPersosContainer, isProtectedEntityFolder } from '
        '"@features/finder-core/utils/spaceFolderKind";\n', 1)
    assert t.count(DELETE_OLD) == 1, "TF: ancre bloc Supprimer"
    t = t.replace(DELETE_OLD, DELETE_NEW, 1)
    tf.write_text(t, encoding="utf-8"); print("FinderTreeFolder.tsx patché")
else:
    print("FinderTreeFolder.tsx déjà à jour")
PY

echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(finder): masque Supprimer sur les dossiers-entités (menus grille+arbre) (incrément 1b)" && echo "commit $(git rev-parse --short HEAD)"