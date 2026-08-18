#!/usr/bin/env bash
#
# AKFC — Finder : icônes thématiques pour conteneurs + espaces perso.
#
#   - conteneur `groups` + espaces de GROUPE  → icône lucide `Users`
#   - conteneur `persos` + chaque espace PERSO → icône lucide `User`
#   - dossiers ordinaires                       → icône dossier standard
#
# Étend `spaceFolderKind.ts` (isPersoSpaceFolder, isGroupsContainer,
# isPersosContainer) et le swap d'icône dans FinderTreeFolder (arbre) + GridItem
# (grille). (L'icône groupe des espaces était déjà posée.)
#
# Prérequis : apply-collab-group-space-icon.sh (util + swaps existants).
# Front NON testé → valider. Pas de migration.
# Usage : bash apply-collab-perso-container-icons.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-perso-container-icons.sh   (clone)
#
set -euo pipefail

UTIL="apps/web/src/features/finder-core/utils/spaceFolderKind.ts"
TREE="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

for f in "package.json" "$UTIL" "$TREE" "$GRID"; do
  [ -f "$f" ] || { echo "ERREUR: fichier manquant: $f (group-space-icon appliqué ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── util (réécrit : + perso + conteneurs) ───────────────────────────────────
cat > "$UTIL" <<'TS'
/**
 * Nature d'un dossier d'espace/conteneur du finder, pour lui donner une icône
 * thématique. Détection par le motif du chemin (aucune query requise).
 *
 *   - espace de GROUPE : `${appRoot}/groups/<slug>-<cuid>`
 *   - espace PERSO     : `${appRoot}/persos/<slug>-<cuid>`
 *   - conteneurs       : `${appRoot}/groups` et `${appRoot}/persos`
 */
const GROUP_SPACE_PATH = /\/groups\/[^/]+-c[a-z0-9]{24}$/;
const PERSO_SPACE_PATH = /\/persos\/[^/]+-c[a-z0-9]{24}$/;
const GROUPS_CONTAINER = /^[^/]+\/groups$/;
const PERSOS_CONTAINER = /^[^/]+\/persos$/;

export function isGroupSpaceFolder(path: string): boolean {
  return GROUP_SPACE_PATH.test(path);
}

export function isPersoSpaceFolder(path: string): boolean {
  return PERSO_SPACE_PATH.test(path);
}

export function isGroupsContainer(path: string): boolean {
  return GROUPS_CONTAINER.test(path);
}

export function isPersosContainer(path: string): boolean {
  return PERSOS_CONTAINER.test(path);
}
TS
echo "util réécrit : $UTIL"

# ── FinderTreeFolder (arbre) ────────────────────────────────────────────────
python3 - "$TREE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isPersoSpaceFolder" in s:
    print("FinderTreeFolder déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label} (tree)"
    return s.replace(old, new)

s = sub("  Users,\n", "  Users,\n  User,\n", "import User")
s = sub(
    'import { isGroupSpaceFolder } from "@features/finder-core/utils/spaceFolderKind";',
    'import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer } from "@features/finder-core/utils/spaceFolderKind";',
    "import util")
s = sub(
    "        {isGroupSpaceFolder(node.path) ? (\n"
    '          <Users className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : isOpen ? (\n"
    '          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : (\n"
    '          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        )}",
    "        {isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n"
    '          <Users className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : isPersoSpaceFolder(node.path) || isPersosContainer(node.path) ? (\n"
    '          <User className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : isOpen ? (\n"
    '          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : (\n"
    '          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        )}",
    "icône arbre")

p.write_text(s, encoding="utf-8"); print("FinderTreeFolder patché (persos + conteneurs)")
PY

# ── GridItem (grille) ───────────────────────────────────────────────────────
python3 - "$GRID" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isPersoSpaceFolder" in s:
    print("GridItem déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label} (grid)"
    return s.replace(old, new)

s = sub("import { Folder, Users, Music, Check, FileText, Play } from 'lucide-react';",
        "import { Folder, Users, User, Music, Check, FileText, Play } from 'lucide-react';",
        "import User")
s = sub(
    "import { isGroupSpaceFolder } from '@features/finder-core/utils/spaceFolderKind';",
    "import { isGroupSpaceFolder, isPersoSpaceFolder, isGroupsContainer, isPersosContainer } from '@features/finder-core/utils/spaceFolderKind';",
    "import util")
s = sub(
    "        {isGroupSpaceFolder(node.path) ? (\n"
    '          <Users className="w-16 h-16" strokeWidth={1.5} />\n'
    "        ) : (\n"
    '          <Folder className="w-16 h-16" strokeWidth={1.5} />\n'
    "        )}",
    "        {isGroupSpaceFolder(node.path) || isGroupsContainer(node.path) ? (\n"
    '          <Users className="w-16 h-16" strokeWidth={1.5} />\n'
    "        ) : isPersoSpaceFolder(node.path) || isPersosContainer(node.path) ? (\n"
    '          <User className="w-16 h-16" strokeWidth={1.5} />\n'
    "        ) : (\n"
    '          <Folder className="w-16 h-16" strokeWidth={1.5} />\n'
    "        )}",
    "icône grille")

p.write_text(s, encoding="utf-8"); print("GridItem patché (persos + conteneurs)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(finder): icônes User pour persos (conteneur + espaces) et Users pour le conteneur groups" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider les icônes : groups/espaces groupe = Users ; persos/espaces perso = User."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi