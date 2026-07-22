#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# REPRISE ciblée — deux pièces manquantes.
#
# Le script consolidé s'était cru « déjà appliqué » : sa garde testait
# `videoPosterUrl`, symbole que UX3 avait DÉJÀ posé. Il n'a donc rien écrit.
# Résultat : il manque exactement deux choses à l'état actuel (UX1+UX2+UX3) :
#
#   1) `displayName` — extension systématique dans le nom affiché. Les
#      publicId Cloudinary n'ont pas d'extension (contrairement aux clés R2),
#      d'où des noms nus côté Cloudinary uniquement. On la reconstruit depuis
#      `meta.format`.
#
#   2) `GridPdfPreview` — aperçu de la 1re page du PDF dans la grille, via
#      iframe (même mécanisme que la sidebar). Désormais utile : le proxy sert
#      enfin les binaires R2, donc les PDF sont réellement délivrés.
#
# Toutes les substitutions sont assertées (count==1) : le script s'arrête
# AVANT d'écrire si une ancre bouge. La garde teste `displayName`, propre à
# ce script.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FT="apps/web/src/features/finder-core/utils/fileType.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

for f in "$FT" "$GRID" "$TREE"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "videoPosterUrl" "$FT" || { echo "✗ UX3 pas appliqué (videoPosterUrl absent)."; exit 1; }

if grep -q "displayName" "$FT"; then
  echo "→ déjà appliqué (displayName présent), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

FT   = "apps/web/src/features/finder-core/utils/fileType.ts"
GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"
TREE = "apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

# ── 1) fileType.ts : displayName ────────────────────────────────────────────
ft = pathlib.Path(FT)
src = ft.read_text(encoding="utf-8")
assert "displayName" not in src, "displayName deja present"
src = src.rstrip() + '''

/**
 * Nom d'affichage AVEC extension. Les publicId Cloudinary ne portent pas
 * l'extension dans leur nom (contrairement aux clés R2) : on la reconstruit
 * depuis `format` quand elle manque.
 */
export function displayName(
  name: string,
  format: string | null | undefined,
): string {
  if (!format) return name;
  const ext = format.toLowerCase();
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}
'''
ft.write_text(src, encoding="utf-8")
print("  ✓ fileType.ts : displayName ajouté")

# ── 2) GridItem ─────────────────────────────────────────────────────────────
edit(GRID,
     "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile } from '@features/finder-core/utils/fileType';",
     "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile, displayName } from '@features/finder-core/utils/fileType';",
     "GridItem : import displayName")

edit(GRID,
     """        isTextFile(extension) && url ? (
          <GridTextPreview url={url} />
        ) : (
          <CardIcon node={node} isAudio={isAudio} />
        )""",
     """        isTextFile(extension) && url ? (
          <GridTextPreview url={url} />
        ) : isPdfFile(extension) && url ? (
          <GridPdfPreview url={url} name={node.name} />
        ) : (
          <CardIcon node={node} isAudio={isAudio} />
        )""",
     "GridItem : branche aperçu PDF")

edit(GRID,
     "        {node.name}\n",
     "        {displayName(node.name, node.meta?.format)}\n",
     "GridItem : nom avec extension")

# composant d'aperçu PDF
g = pathlib.Path(GRID)
src = g.read_text(encoding="utf-8")
assert "GridPdfPreview({" not in src, "GridPdfPreview deja defini"
src = src.rstrip() + '''

/**
 * Aperçu de la première page d'un PDF dans une card, via iframe — le même
 * mécanisme que la sidebar (PreviewPanel). Non interactif : `pointer-events`
 * désactivé pour que le clic atteigne la card (sélection préservée).
 */
function GridPdfPreview({
  url,
  name,
}: {
  url: string;
  name: string;
}): JSX.Element {
  return (
    <div className="w-full h-full overflow-hidden bg-white pointer-events-none">
      <iframe
        src={`${url}#toolbar=0&navpanes=0&view=FitH`}
        title={name}
        className="w-full h-full border-0"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
'''
g.write_text(src, encoding="utf-8")
print("  ✓ GridItem : GridPdfPreview ajouté")

# ── 3) FinderTreeFile ───────────────────────────────────────────────────────
edit(TREE,
     "import { effectiveExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl } from '@features/finder-core/utils/fileType';",
     "import { effectiveExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl, displayName } from '@features/finder-core/utils/fileType';",
     "Tree : import displayName")

edit(TREE,
     '<span className="truncate">{node.name}</span>',
     '<span className="truncate">{displayName(node.name, node.meta?.format)}</span>',
     "Tree : nom avec extension")
PYEOF

echo
echo "→ contrôle final"
for pair in "displayName:$FT" "GridPdfPreview:$GRID" "displayName:$GRID" "displayName:$TREE"; do
  sym=${pair%%:*}; f=${pair##*:}
  n=$(grep -c "$sym" "$f" || true)
  echo "  $sym dans $(basename "$f") : $n $([ "$n" -ge 1 ] && echo ✓ || echo ✗)"
done

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): extension systematique dans les noms + apercu pdf en grid"
echo "✓ commité."