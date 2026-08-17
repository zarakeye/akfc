#!/usr/bin/env bash
#
# AKFC — Finder : ICÔNE distincte pour les dossiers d'espace de GROUPE.
#
# Un dossier dont le chemin est `${appRoot}/groups/<slug>-<cuid>` (racine
# d'espace de groupe, physique OU nœud synthétique de l'option B) reçoit une
# icône « groupe » (lucide Users) au lieu de l'icône de dossier standard —
# dans l'ARBRE (FinderTreeFolder) et la GRILLE (GridItem). Détecté par le motif
# du chemin (aucune query requise) → couvre aussi les sous-groupes imbriqués.
#
# Front NON testé → valider à l'écran. Pas de migration. Indépendant (motif).
# Usage : bash apply-collab-group-space-icon.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-group-space-icon.sh   (clone)
#
set -euo pipefail

UTIL="apps/web/src/features/finder-core/utils/spaceFolderKind.ts"
TREE="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

for f in "package.json" "$TREE" "$GRID"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── util ────────────────────────────────────────────────────────────────────
if [ ! -f "$UTIL" ]; then
  cat > "$UTIL" <<'TS'
/**
 * Un dossier d'ESPACE DE GROUPE : chemin `${appRoot}/groups/<slug>-<cuid>`
 * (racine d'espace, physique ou nœud synthétique de l'imbrication). Sert à lui
 * donner une icône distincte dans le finder.
 */
const GROUP_SPACE_PATH = /\/groups\/[^/]+-c[a-z0-9]{24}$/;

export function isGroupSpaceFolder(path: string): boolean {
  return GROUP_SPACE_PATH.test(path);
}
TS
  echo "util écrit : $UTIL"
else
  echo "util déjà présent"
fi

# ── FinderTreeFolder (arbre) ────────────────────────────────────────────────
python3 - "$TREE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isGroupSpaceFolder" in s:
    print("FinderTreeFolder déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label} (tree)"
    return s.replace(old, new)

# import lucide Users
s = sub("  Folder,\n  FolderOpen,\n",
        "  Folder,\n  FolderOpen,\n  Users,\n",
        "import Users")
# import util
s = sub('import { isStatusFolder } from "@features/finder-core/utils/statusFolders";',
        'import { isStatusFolder } from "@features/finder-core/utils/statusFolders";\n'
        'import { isGroupSpaceFolder } from "@features/finder-core/utils/spaceFolderKind";',
        "import util")
# icône
s = sub(
    "        {isOpen ? (\n"
    '          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : (\n"
    '          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        )}",
    "        {isGroupSpaceFolder(node.path) ? (\n"
    '          <Users className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : isOpen ? (\n"
    '          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        ) : (\n"
    '          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />\n'
    "        )}",
    "icône arbre")

p.write_text(s, encoding="utf-8"); print("FinderTreeFolder patché (icône groupe)")
PY

# ── GridItem (grille) ───────────────────────────────────────────────────────
python3 - "$GRID" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isGroupSpaceFolder" in s:
    print("GridItem déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label} (grid)"
    return s.replace(old, new)

# import lucide Users
s = sub("import { Folder, Music, Check, FileText, Play } from 'lucide-react';",
        "import { Folder, Users, Music, Check, FileText, Play } from 'lucide-react';",
        "import Users")
# import util
s = sub("import { isStatusFolder } from '@features/finder-core/utils/statusFolders';",
        "import { isStatusFolder } from '@features/finder-core/utils/statusFolders';\n"
        "import { isGroupSpaceFolder } from '@features/finder-core/utils/spaceFolderKind';",
        "import util")
# icône
s = sub(
    '        <Folder className="w-16 h-16" strokeWidth={1.5} />',
    "        {isGroupSpaceFolder(node.path) ? (\n"
    '          <Users className="w-16 h-16" strokeWidth={1.5} />\n'
    "        ) : (\n"
    '          <Folder className="w-16 h-16" strokeWidth={1.5} />\n'
    "        )}",
    "icône grille")

p.write_text(s, encoding="utf-8"); print("GridItem patché (icône groupe)")
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
if git commit -m "feat(finder): icône distincte (Users) pour les espaces de groupe (arbre + grille)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : les espaces de groupe portent l'icône « groupe »."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi