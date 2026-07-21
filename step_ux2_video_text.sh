#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# UX (suite) : vidéo → 1re image dans la TREE ; texte (txt/md) → aperçu du
# contenu en thumbnail GRID. La sidebar gère déjà texte/pdf/vidéo (PreviewPanel).
#
# Réutilise l'existant, ne duplique rien :
#   - getCloudinaryVideoThumbnail : extrait de GridItem vers fileType.ts.
#   - useNodeTextContent : hook déjà exporté (sidebar), réutilisé pour l'aperçu
#     texte de la grid, avec un maxBytes réduit.
#
# Prérequis : step_ux1_tree_icons.sh (fileType.ts + TreeFileVisual existent).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FILETYPE="apps/web/src/features/finder-core/utils/fileType.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
HOOK="apps/web/src/features/finder-core/hooks/useNodeTextContent.ts"

test -f "$FILETYPE" || { echo "✗ $FILETYPE absent — lance d'abord step_ux1_tree_icons.sh."; exit 1; }
grep -q "TreeFileVisual" "$TREE" || { echo "✗ TreeFileVisual absent — step_ux1 pas appliqué."; exit 1; }
test -f "$HOOK" || { echo "✗ $HOOK absent — hook d'aperçu texte introuvable."; exit 1; }

if grep -q "getCloudinaryVideoThumbnail" "$FILETYPE"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

# ── 1) fileType.ts : ajouter isTextFile + getCloudinaryVideoThumbnail ───────
cat >> "$FILETYPE" <<'TSEOF'

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'json', 'log', 'yml', 'yaml',
]);

export function isTextFile(extension: string | null): boolean {
  return extension !== null && TEXT_EXTENSIONS.has(extension);
}

/**
 * Transforme une URL Cloudinary de vidéo en URL de thumbnail JPG (première
 * image via `so_auto`). Extrait de GridItem pour partage grid/tree.
 */
export function getCloudinaryVideoThumbnail(url: string): string | null {
  if (!url.includes('/video/upload/')) return null;
  const withSoAuto = url.includes('/upload/so_auto/')
    ? url
    : url.replace('/upload/', '/upload/so_auto/');
  return withSoAuto.replace(
    /\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)$/i,
    '.jpg',
  );
}
TSEOF
echo "✓ fileType.ts : isTextFile + getCloudinaryVideoThumbnail ajoutés"

# ── 2) GridItem : pointer sur la version partagée (retirer la locale) ───────
python3 - <<'PYEOF'
import pathlib, re

grid = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = grid.read_text(encoding="utf-8")

# retirer la définition locale de getCloudinaryVideoThumbnail
src = re.sub(
    r"function getCloudinaryVideoThumbnail\(url: string\): string \| null \{.*?\n\}\n",
    "", src, flags=re.S, count=1)

# ajouter les imports manquants au module partagé
imp = src.split("\n")
line_idx = next(i for i, l in enumerate(imp) if "from '@features/finder-core/utils/fileType'" in l)
old = imp[line_idx]
# étendre l'import existant avec les nouveaux symboles
for sym in ["getCloudinaryVideoThumbnail", "isTextFile"]:
    if sym not in old:
        old = old.replace(" }", f", {sym} }}", 1)
imp[line_idx] = old
src = "\n".join(imp)
grid.write_text(src, encoding="utf-8")
print("  ✓ GridItem : getCloudinaryVideoThumbnail importé du partagé (locale retirée)")
PYEOF

# ── 3) GridItem : aperçu texte dans la card (CardIcon → GridTextPreview) ─────
python3 - <<'PYEOF'
import pathlib

grid = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = grid.read_text(encoding="utf-8")

# 3a. import du hook d'aperçu texte + icône FileText pour le fallback
if "useNodeTextContent" not in src:
    lines = src.split("\n")
    last_import = max(i for i, l in enumerate(lines[:45]) if l.startswith("import "))
    lines.insert(last_import + 1,
        "import { useNodeTextContent } from '@features/finder-core/hooks/useNodeTextContent';")
    src = "\n".join(lines)

# FileText depuis lucide-react (fallback aperçu texte vide)
import re as _re
m = _re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
if m and "FileText" not in m.group(1):
    src = src.replace(m.group(0),
        f"import {{ {m.group(1).rstrip()}, FileText }} from 'lucide-react';", 1)

# 3b. dans le rendu, remplacer le fallback <CardIcon> par un choix :
#     texte → aperçu contenu ; sinon → CardIcon.
OLD_FALLBACK = "        <CardIcon node={node} isAudio={isAudio} />"
NEW_FALLBACK = """        isTextFile(extension) && url ? (
          <GridTextPreview url={url} />
        ) : (
          <CardIcon node={node} isAudio={isAudio} />
        )"""
assert src.count(OLD_FALLBACK) == 1, f"ancre CardIcon fallback trouvée {src.count(OLD_FALLBACK)}x"
src = src.replace(OLD_FALLBACK, NEW_FALLBACK)

# 3c. définir GridTextPreview en fin de fichier
PREVIEW = '''

/**
 * Aperçu du début d'un fichier texte dans une card de la grille. Réutilise
 * `useNodeTextContent` (le même hook que la sidebar), plafonné à quelques
 * centaines d'octets — on ne veut qu'un aperçu.
 */
function GridTextPreview({ url }: { url: string }): JSX.Element {
  const { content, loading } = useNodeTextContent(url, { maxBytes: 600 });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-[10px] text-gray-400">…</div>
      </div>
    );
  }
  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <FileText className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="w-full h-full overflow-hidden bg-gray-50 p-2">
      <pre className="text-[7px] leading-[1.3] text-gray-600 whitespace-pre-wrap break-words font-mono">
        {content}
      </pre>
    </div>
  );
}'''

src = src.rstrip() + "\n" + PREVIEW + "\n"
grid.write_text(src, encoding="utf-8")
print("  ✓ GridItem : aperçu texte (GridTextPreview) branché")
PYEOF

# ── 4) FinderTreeFile : vidéo → 1re image ───────────────────────────────────
python3 - <<'PYEOF'
import pathlib

tree = pathlib.Path("apps/web/src/features/finder-core/components/FinderTreeFile.tsx")
src = tree.read_text(encoding="utf-8")

# étendre l'import fileType avec getCloudinaryVideoThumbnail
line = "import { effectiveExtension, isAudioFile, isPdfFile } from '@features/finder-core/utils/fileType';"
newline = "import { effectiveExtension, isAudioFile, isPdfFile, getCloudinaryVideoThumbnail } from '@features/finder-core/utils/fileType';"
assert src.count(line) == 1, "import fileType tree introuvable"
src = src.replace(line, newline)

# insérer la branche vidéo dans TreeFileVisual, après hasImageThumb
OLD = """  const hasImageThumb = kind === 'image' && url && !imgFailed;

  let inner: JSX.Element;
  if (hasImageThumb) {"""
NEW = """  const hasImageThumb = kind === 'image' && url && !imgFailed;
  const videoThumb =
    kind === 'video' && url ? getCloudinaryVideoThumbnail(url) : null;

  let inner: JSX.Element;
  if (hasImageThumb) {"""
assert src.count(OLD) == 1, "ancre hasImageThumb tree introuvable"
src = src.replace(OLD, NEW)

# ajouter la branche de rendu vidéo après le bloc image
OLD_IMG = """      <img
        src={url}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (isPdfFile(extension)) {"""
NEW_IMG = """      <img
        src={url}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (videoThumb && !imgFailed) {
    inner = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={videoThumb}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (isPdfFile(extension)) {"""
assert src.count(OLD_IMG) == 1, "ancre bloc image tree introuvable"
src = src.replace(OLD_IMG, NEW_IMG)

tree.write_text(src, encoding="utf-8")
print("  ✓ FinderTreeFile : vidéo → 1re image")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(finder): video thumbnail dans la tree + apercu texte dans la grid"
echo "✓ commité."