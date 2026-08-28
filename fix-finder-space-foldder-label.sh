#!/usr/bin/env bash
#
# AKFC — Finder : masquer le cuid dans le nom affiché des dossiers d'espace.
#
# CONSTAT : le nom des dossiers d'espace (groupe/perso) est `<slug>-<cuid>`. La
# GRILLE (GridItem) et l'ARBRE (FinderTreeFolder) le rendent déjà lisible via
# `friendlySpaceFolderLabel` (retire le cuid, title-case le slug → « Administrateurs »).
# Mais les vues COMPACTE (FinderCompactRow) et TABLE (FinderTableRow) rendent
# `displayName(node.name, …)` brut → le cuid reste visible (constaté dans le
# picker, qui rend l'une de ces vues).
#
# FIX : même recette que la grille dans les deux composants — un `rowLabel` qui,
# pour un dossier, passe par `friendlySpaceFolderLabel` (repli sur le nom brut),
# et pour un fichier garde `displayName`. Le CHEMIN (avec cuid) reste intact :
# c'est purement l'affichage.
#
# NB : le nom exact du groupe (casse/accents d'origine) viendrait d'une query
# `storage.spaceDisplayNames` évoquée dans le helper mais INEXISTANTE à ce jour —
# tout le monde s'appuie sur le repli title-case. Si tu veux le nom exact, c'est
# un petit ajout backend (dis-le).
#
# 2 fichiers front, typecheck web.
#
# Usage : bash fix-finder-space-folder-label.sh
#         AKFC_APPLY_ONLY=1 bash fix-finder-space-folder-label.sh   (clone)
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
    "apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
    "apps/web/src/features/finder-core/components/FinderTableRow.tsx",
]

IMPORT_ANCHOR = (
    "import { displayName, baseNameOf } from '@features/finder-core/utils/fileType';\n"
)
IMPORT_ADD = (
    "import { friendlySpaceFolderLabel } from '@features/finder-core/utils/spaceFolderLabel';\n"
)
ISSTATUS_ANCHOR = "  const isStatus = isStatusFolder(node.path);\n"
ROWLABEL = (
    "  const isStatus = isStatusFolder(node.path);\n"
    "\n"
    "  // Libellé affiché : pour un dossier d'ESPACE (groupe/perso) on masque le\n"
    "  // cuid via friendlySpaceFolderLabel (comme la grille et l'arbre) ; sinon le\n"
    "  // nom de fichier avec son extension. Le CHEMIN reste inchangé.\n"
    "  const rowLabel = isFolder\n"
    "    ? (friendlySpaceFolderLabel(node.name, node.path) ?? node.name)\n"
    "    : displayName(node.name, node.meta?.format);\n"
)
NAME_EXPR = "displayName(node.name, node.meta?.format)"

for rel in FILES:
    p = pathlib.Path(rel)
    if not p.exists():
        print(f"ERREUR: {rel} introuvable", file=sys.stderr); sys.exit(1)
    s = p.read_text(encoding="utf-8")
    if "friendlySpaceFolderLabel" in s:
        print(f"déjà patché : {rel}"); continue

    assert s.count(IMPORT_ANCHOR) == 1, f"ancre import fileType introuvable/multiple dans {rel}"
    s = s.replace(IMPORT_ANCHOR, IMPORT_ANCHOR + IMPORT_ADD)

    assert s.count(ISSTATUS_ANCHOR) == 1, f"ancre isStatus introuvable/multiple dans {rel}"
    s = s.replace(ISSTATUS_ANCHOR, ROWLABEL)

    # title + texte visible = 2 occurrences exactes (rename=baseNameOf,
    # move=displayName(movingNodes...) → non concernés)
    n = s.count(NAME_EXPR)
    assert n == 2, f"attendu 2× '{NAME_EXPR}' dans {rel}, trouvé {n}"
    s = s.replace(NAME_EXPR, "rowLabel")

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
git commit -m "fix(finder): masque le cuid des dossiers d'espace en vue compacte et table (comme grille/arbre)" \
  && echo "commit $(git rev-parse --short HEAD)"