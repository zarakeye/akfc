#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# UX (correctif vidéo + texte tree) :
#
#   VIDÉO — la vignette « première image » ne s'affichait pas : l'ancienne
#   getCloudinaryVideoThumbnail cherchait '/video/upload/' dans l'URL, or le
#   front reçoit une URL PROXY (/api/media/by-public-id/…?variant=…). Le proxy
#   sait déjà servir la 1re frame via `&as=poster` (fetchVideoPoster). On
#   remplace donc la fonction par `videoPosterUrl(url)` qui ajoute `&as=poster`.
#     - grid : poster + badge play (▶) en surimpression.
#     - tree : poster nu (16px, pas de badge — illisible à cette taille).
#
#   TEXTE — dans la tree, on veut une simple icône FileText (pas d'aperçu de
#   contenu : 16px est trop petit). La grid GARDE son GridTextPreview (parfait).
#
# Prérequis : UX1 + UX2 appliqués.
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FILETYPE="apps/web/src/features/finder-core/utils/fileType.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

for f in "$FILETYPE" "$GRID" "$TREE"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "getCloudinaryVideoThumbnail" "$FILETYPE" \
  || { echo "✗ UX2 pas appliqué (getCloudinaryVideoThumbnail absent de fileType.ts)."; exit 1; }

if grep -q "videoPosterUrl" "$FILETYPE"; then
  echo "→ déjà appliqué (videoPosterUrl présent), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

# ── 1) fileType.ts : remplacer getCloudinaryVideoThumbnail par videoPosterUrl ─
ft = pathlib.Path("apps/web/src/features/finder-core/utils/fileType.ts")
src = ft.read_text(encoding="utf-8")

OLD_FN = '''/**
 * Transforme une URL Cloudinary de vidéo en URL de thumbnail JPG (première
 * image via `so_auto`). Extrait de GridItem pour partage grid/tree.
 */
export function getCloudinaryVideoThumbnail(url: string): string | null {
  if (!url.includes('/video/upload/')) return null;
  const withSoAuto = url.includes('/upload/so_auto/')
    ? url
    : url.replace('/upload/', '/upload/so_auto/');
  return withSoAuto.replace(
    /\\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)$/i,
    '.jpg',
  );
}'''

NEW_FN = '''/**
 * URL de la « première image » (poster) d'une vidéo. Le front reçoit une URL
 * proxy `/api/media/by-public-id/…?variant=…` ; le proxy sait servir la 1re
 * frame quand on ajoute `as=poster` (cf. route media + fetchVideoPoster).
 * Renvoie null si l'URL n'est pas une URL média proxy exploitable.
 */
export function videoPosterUrl(url: string): string | null {
  if (!url) return null;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}as=poster`;
}'''

assert src.count(OLD_FN) == 1, "ancre getCloudinaryVideoThumbnail dans fileType introuvable"
src = src.replace(OLD_FN, NEW_FN)
ft.write_text(src, encoding="utf-8")
print("  ✓ fileType.ts : videoPosterUrl remplace getCloudinaryVideoThumbnail")

# ── 2) GridItem : usage + import + badge play ───────────────────────────────
g = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = g.read_text(encoding="utf-8")

# 2a. import : renommer le symbole
src = src.replace("getCloudinaryVideoThumbnail", "videoPosterUrl")

# 2b. ajouter Play à l'import lucide
import re
m = re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
if m and "Play" not in m.group(1):
    src = src.replace(m.group(0),
        f"import {{ {m.group(1).rstrip()}, Play }} from 'lucide-react';", 1)

# 2c. badge play : envelopper l'img vidéo. On ajoute le badge juste après le
# <img src={videoThumbnailUrl…> dans le bloc vidéo.
OLD_VID_IMG = '''          <img
            src={videoThumbnailUrl ?? undefined}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />'''
NEW_VID_IMG = '''          <img
            src={videoThumbnailUrl ?? undefined}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
          {/* Badge play : indique que c'est une vidéo (poster = 1re image). */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-black/45 backdrop-blur-sm">
              <Play className="h-4 w-4 text-white fill-white translate-x-[1px]" />
            </div>
          </div>'''
assert src.count(OLD_VID_IMG) == 1, "ancre img vidéo grid introuvable"
src = src.replace(OLD_VID_IMG, NEW_VID_IMG)
g.write_text(src, encoding="utf-8")
print("  ✓ GridItem : poster vidéo + badge play")

# ── 3) FinderTreeFile : vidéo poster nu + import + branche texte FileText ────
t = pathlib.Path("apps/web/src/features/finder-core/components/FinderTreeFile.tsx")
src = t.read_text(encoding="utf-8")

# 3a. imports : renommer symbole + ajouter isTextFile + FileText
src = src.replace("getCloudinaryVideoThumbnail", "videoPosterUrl")
# ajouter isTextFile à l'import fileType
src = src.replace(
    "import { effectiveExtension, isAudioFile, isPdfFile, videoPosterUrl } from '@features/finder-core/utils/fileType';",
    "import { effectiveExtension, isAudioFile, isPdfFile, isTextFile, videoPosterUrl } from '@features/finder-core/utils/fileType';")
# ajouter FileText à l'import lucide
m = re.search(r"import \{ ([^}]*) \} from 'lucide-react';", src)
if m and "FileText" not in m.group(1):
    src = src.replace(m.group(0),
        f"import {{ {m.group(1).rstrip()}, FileText }} from 'lucide-react';", 1)

# 3b. renommer la variable locale videoThumb (issue de getCloudinary…) — déjà
# renommée en videoPosterUrl(url) par le replace global ; la var s'appelle
# toujours videoThumb, on la garde.

# 3c. brancher le texte : avant le `else { <File/> }` final, insérer un cas texte.
OLD_ELSE = '''  } else if (isAudioFile(extension)) {
    inner = <Music className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }'''
NEW_ELSE = '''  } else if (isAudioFile(extension)) {
    inner = <Music className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else if (isTextFile(extension)) {
    // Texte : simple icône (16px trop petit pour un aperçu de contenu).
    inner = <FileText className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }'''
assert src.count(OLD_ELSE) == 1, "ancre else audio/File tree introuvable"
src = src.replace(OLD_ELSE, NEW_ELSE)

t.write_text(src, encoding="utf-8")
print("  ✓ FinderTreeFile : vidéo poster (nu) + texte FileText")
PYEOF

echo
echo "→ contrôle : plus aucune trace de getCloudinaryVideoThumbnail"
if grep -rq "getCloudinaryVideoThumbnail" apps/web/src; then
  echo "  ✗ il en reste :"; grep -rn "getCloudinaryVideoThumbnail" apps/web/src | cut -c1-70
  exit 1
fi
echo "  ✓ propre"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "fix(finder): vignette video via poster proxy + badge play, icone texte en tree"
echo "✓ commité."