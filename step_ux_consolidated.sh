#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# UX CONSOLIDÉ (par-dessus UX1 déjà appliqué). Ajoute tout le reste :
#
#   fileType.ts : isTextFile, videoPosterUrl (poster via proxy &as=poster),
#                 displayName (nom + extension systématique).
#
#   GRID (GridItem) :
#     - vidéo : poster (1re image) + badge play centré ;
#     - texte : aperçu du contenu (GridTextPreview, hook useNodeTextContent) ;
#     - pdf   : aperçu 1re page via <iframe> (comme la sidebar) + badge ;
#     - nom affiché AVEC extension.
#
#   TREE (FinderTreeFile) :
#     - vidéo : poster + mini badge play en coin (pour distinguer d'une image) ;
#     - texte : icône FileText ;
#     - nom affiché AVEC extension.
#
# Prérequis : UX1 appliqué (fileType.ts + TreeFileVisual présents).
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FT="apps/web/src/features/finder-core/utils/fileType.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
HOOK="apps/web/src/features/finder-core/hooks/useNodeTextContent.ts"

for f in "$FT" "$GRID" "$TREE" "$HOOK"; do
  test -f "$f" || { echo "✗ $f introuvable (UX1 appliqué ? lance depuis la racine)."; exit 1; }
done
grep -q "function TreeFileVisual" "$TREE" || { echo "✗ UX1 pas appliqué (TreeFileVisual absent)."; exit 1; }

if grep -q "videoPosterUrl" "$FT"; then
  echo "→ déjà appliqué (videoPosterUrl présent), rien à faire."
  exit 0
fi

# ═══ 1) fileType.ts : nouveaux helpers ══════════════════════════════════════
cat >> "$FT" <<'TSEOF'

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'json', 'log', 'yml', 'yaml',
]);

export function isTextFile(extension: string | null): boolean {
  return extension !== null && TEXT_EXTENSIONS.has(extension);
}

/**
 * URL de la « première image » (poster) d'une vidéo. Le front reçoit une URL
 * proxy `/api/media/by-public-id/…?variant=…` ; le proxy sert la 1re frame
 * quand on ajoute `as=poster`.
 */
export function videoPosterUrl(url: string): string | null {
  if (!url) return null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}as=poster`;
}

/**
 * Nom d'affichage AVEC extension. Les publicId Cloudinary n'ont pas
 * d'extension dans le nom ; on la rajoute depuis `format` si absente.
 */
export function displayName(
  name: string,
  format: string | null | undefined,
): string {
  if (!format) return name;
  const ext = format.toLowerCase();
  return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
}
TSEOF
echo "✓ fileType.ts : isTextFile + videoPosterUrl + displayName"

# ═══ 2) GridItem ════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
import pathlib, re

g = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = g.read_text(encoding="utf-8")

# 2a. retirer la définition locale de getCloudinaryVideoThumbnail
src = re.sub(
    r"function getCloudinaryVideoThumbnail\(url: string\): string \| null \{.*?\n\}\n",
    "", src, flags=re.S, count=1)

# 2b. renommer les usages restants → videoPosterUrl
src = src.replace("getCloudinaryVideoThumbnail", "videoPosterUrl")

# 2c. import : étendre fileType + ajouter Play + hook texte
src = src.replace(
    "import { getFileExtension, isAudioFile, isPdfFile } from '@features/finder-core/utils/fileType';",
    "import { getFileExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl, displayName } from '@features/finder-core/utils/fileType';")
m = re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
if m and "Play" not in m.group(1):
    src = src.replace(m.group(0), f"import {{ {m.group(1).rstrip()}, Play, FileText }} from 'lucide-react';", 1)
if "useNodeTextContent" not in src:
    lines = src.split("\n")
    li = max(i for i, l in enumerate(lines[:45]) if l.startswith("import "))
    lines.insert(li + 1, "import { useNodeTextContent } from '@features/finder-core/hooks/useNodeTextContent';")
    src = "\n".join(lines)

# 2d. badge play sur le poster vidéo
OLD_VID = '''          <img
            src={videoThumbnailUrl ?? undefined}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />'''
NEW_VID = '''          <img
            src={videoThumbnailUrl ?? undefined}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-black/45 backdrop-blur-sm">
              <Play className="h-4 w-4 text-white fill-white translate-x-[1px]" />
            </div>
          </div>'''
assert src.count(OLD_VID) == 1, "ancre img vidéo grid introuvable"
src = src.replace(OLD_VID, NEW_VID)

# 2e. fallback : texte → GridTextPreview, pdf → iframe, sinon CardIcon
OLD_FB = "        <CardIcon node={node} isAudio={isAudio} />"
NEW_FB = '''        isTextFile(extension) && url ? (
          <GridTextPreview url={url} />
        ) : isPdfFile(extension) && url ? (
          <GridPdfPreview url={url} name={node.name} />
        ) : (
          <CardIcon node={node} isAudio={isAudio} />
        )'''
assert src.count(OLD_FB) == 1, f"ancre CardIcon fallback trouvée {src.count(OLD_FB)}x"
src = src.replace(OLD_FB, NEW_FB)

# 2f. nom affiché avec extension
src = src.replace("        {node.name}\n", "        {displayName(node.name, node.meta?.format)}\n", 1)

# 2g. composants d'aperçu en fin de fichier
PREVIEWS = '''

/** Aperçu du début d'un fichier texte dans une card (hook partagé sidebar). */
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
}

/** Aperçu 1re page d'un PDF via iframe (même URL que la sidebar), non interactif. */
function GridPdfPreview({ url, name }: { url: string; name: string }): JSX.Element {
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
}'''
src = src.rstrip() + "\n" + PREVIEWS + "\n"
g.write_text(src, encoding="utf-8")
print("  ✓ GridItem : poster+play, aperçu texte, aperçu PDF, nom+extension")
PYEOF
echo "✓ GridItem traité"

# ═══ 3) FinderTreeFile ══════════════════════════════════════════════════════
python3 - <<'PYEOF'
import pathlib, re

t = pathlib.Path("apps/web/src/features/finder-core/components/FinderTreeFile.tsx")
src = t.read_text(encoding="utf-8")

# 3a. imports : étendre fileType (videoPosterUrl, isTextFile, displayName) + FileText + Play
src = src.replace(
    "import { effectiveExtension, isAudioFile, isPdfFile } from '@features/finder-core/utils/fileType';",
    "import { effectiveExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl, displayName } from '@features/finder-core/utils/fileType';")
m = re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
if m:
    syms = m.group(1)
    for extra in ("Music", "FileText", "Play"):
        if extra not in syms:
            syms = syms.rstrip() + f", {extra}"
    src = src.replace(m.group(0), f"import {{ {syms} }} from 'lucide-react';", 1)

# 3b. dans TreeFileVisual : ajouter le calcul videoThumb (poster)
OLD_CALC = "  const hasImageThumb = kind === 'image' && url && !imgFailed;"
NEW_CALC = """  const hasImageThumb = kind === 'image' && url && !imgFailed;
  const videoThumb = kind === 'video' && url ? videoPosterUrl(url) : null;"""
assert src.count(OLD_CALC) == 1, "ancre hasImageThumb tree introuvable"
src = src.replace(OLD_CALC, NEW_CALC)

# 3c. brancher vidéo (poster + mini badge play) et texte (FileText)
OLD_BR = """  } else if (isPdfFile(extension)) {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src="/icons/pdf.svg" alt="PDF" className="h-4 w-4 shrink-0" />;
  } else if (isAudioFile(extension)) {
    inner = <Music className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }"""
NEW_BR = """  } else if (videoThumb && !imgFailed) {
    inner = (
      <span className="relative inline-flex shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={videoThumb}
          alt={node.name}
          className="h-4 w-4 rounded-sm object-cover"
          onError={() => setImgFailed(true)}
        />
        {/* mini triangle play pour distinguer d'une image */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center h-2.5 w-2.5 rounded-full bg-black/50">
            <Play className="h-1.5 w-1.5 text-white fill-white" />
          </span>
        </span>
      </span>
    );
  } else if (isPdfFile(extension)) {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src="/icons/pdf.svg" alt="PDF" className="h-4 w-4 shrink-0" />;
  } else if (isAudioFile(extension)) {
    inner = <Music className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else if (isTextFile(extension)) {
    inner = <FileText className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }"""
assert src.count(OLD_BR) == 1, "ancre branches tree introuvable"
src = src.replace(OLD_BR, NEW_BR)

# 3d. nom avec extension
OLD_NAME = '<span className="truncate">{node.name}</span>'
NEW_NAME = '<span className="truncate">{displayName(node.name, node.meta?.format)}</span>'
assert src.count(OLD_NAME) == 1, "ancre nom tree introuvable"
src = src.replace(OLD_NAME, NEW_NAME)

t.write_text(src, encoding="utf-8")
print("  ✓ FinderTreeFile : vidéo poster+play, texte FileText, nom+extension")
PYEOF
echo "✓ FinderTreeFile traité"

echo
echo "→ contrôle : plus de getCloudinaryVideoThumbnail nulle part"
if grep -rq "getCloudinaryVideoThumbnail" apps/web/src; then
  echo "  ✗ reste :"; grep -rn "getCloudinaryVideoThumbnail" apps/web/src | cut -c1-70; exit 1
fi
echo "  ✓ propre"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): apercus texte/pdf/video en grid, badge play tree, extension dans les noms"
echo "✓ commité."