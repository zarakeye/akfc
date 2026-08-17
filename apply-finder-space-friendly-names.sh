#!/usr/bin/env bash
#
# AKFC — Finder : afficher un nom CONVIVIAL pour les dossiers d'ESPACE
# (groupe / perso), sans le suffixe cuid.
#
# Le chemin d'un espace est `${appRoot}/groups|persos/<slug>-<cuid>` (le cuid =
# id DB, garant d'unicité + stabilité au renommage). Illisible à l'écran. On
# ajoute un util qui, pour ces racines d'espace uniquement, retire le cuid et
# titre-case le slug (« administrateurs-cmsuuayos… » → « Administrateurs »), et
# on l'applique au label en vue arbre (FinderTreeFolder) et en grille (GridItem).
#
# Frontend seul, additif, non destructif (les sous-dossiers et dossiers
# ordinaires gardent `node.name`). NB : dérivé du slug (perd accents/casse
# d'origine) — pour le nom EXACT, un displayName résolu backend serait requis.
#
# FRONT non testé ici → valider à l'écran. Pas de migration.
# Usage : bash apply-finder-space-friendly-names.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-space-friendly-names.sh   (clone)
#
set -euo pipefail

UTIL="apps/web/src/features/finder-core/utils/spaceFolderLabel.ts"
TREE="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

for f in "package.json" "$TREE" "$GRID"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
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
 * Étiquette conviviale pour les dossiers d'ESPACE (groupe ou perso) du finder.
 *
 * Le chemin physique d'un espace est `${appRoot}/groups|persos/<slug>-<cuid>`
 * (le cuid = id DB, garantit unicité + stabilité au renommage). Ce suffixe est
 * illisible à l'écran : on le retire pour l'affichage et on titre-case le slug.
 *
 * Renvoie `null` si le dossier n'est PAS une racine d'espace (sous-dossiers,
 * dossiers ordinaires) → l'appelant garde alors `node.name`.
 *
 * NB : dérivé du slug (perd accents/casse d'origine). Pour le nom EXACT du
 * groupe/perso, il faudrait un `displayName` résolu côté backend.
 */
const CUID_SUFFIX = /-c[a-z0-9]{24}$/;
const SPACE_ROOT_PATH = /\/(groups|persos)\/[^/]+$/;

export function friendlySpaceFolderLabel(
  name: string,
  path: string,
): string | null {
  if (!SPACE_ROOT_PATH.test(path)) return null;
  if (!CUID_SUFFIX.test(name)) return null;
  const slug = name.replace(CUID_SUFFIX, "");
  return slug
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}
TS
  echo "util écrit : $UTIL"
else
  echo "util déjà présent"
fi

# ── FinderTreeFolder (vue arbre) ────────────────────────────────────────────
python3 - "$TREE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "friendlySpaceFolderLabel" in s:
    print("FinderTreeFolder déjà à jour"); sys.exit(0)

IMP_OLD = 'import { useFinderStore } from "@features/finder-core/state/useFinderStore";'
IMP_NEW = (IMP_OLD + "\n"
           'import { friendlySpaceFolderLabel } from "@features/finder-core/utils/spaceFolderLabel";')
assert s.count(IMP_OLD) == 1, "ancre import (tree) introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

LBL_OLD = "  let displayLabel = node.name;"
LBL_NEW = "  let displayLabel = friendlySpaceFolderLabel(node.name, node.path) ?? node.name;"
assert s.count(LBL_OLD) == 1, "ancre displayLabel (tree) introuvable"
s = s.replace(LBL_OLD, LBL_NEW)

p.write_text(s, encoding="utf-8")
print("FinderTreeFolder patché")
PY

# ── GridItem (vue grille) ───────────────────────────────────────────────────
python3 - "$GRID" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "friendlySpaceFolderLabel" in s:
    print("GridItem déjà à jour"); sys.exit(0)

IMP_OLD = "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile, displayName, baseNameOf } from '@features/finder-core/utils/fileType';"
IMP_NEW = (IMP_OLD + "\n"
           "import { friendlySpaceFolderLabel } from '@features/finder-core/utils/spaceFolderLabel';")
assert s.count(IMP_OLD) == 1, "ancre import (grid) introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

LBL_OLD = "            {displayName(node.name, node.meta?.format)}"
LBL_NEW = ("            {isFolder\n"
           "              ? friendlySpaceFolderLabel(node.name, node.path) ?? node.name\n"
           "              : displayName(node.name, node.meta?.format)}")
assert s.count(LBL_OLD) == 1, "ancre label (grid) introuvable"
s = s.replace(LBL_OLD, LBL_NEW)

p.write_text(s, encoding="utf-8")
print("GridItem patché")
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
if git commit -m "feat(finder): noms conviviaux des dossiers d'espace (retrait du cuid à l'affichage)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider à l'écran (arbre + grille : « Administrateurs », « Bureau »)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi