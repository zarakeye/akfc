#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# UX — les 3 rapides : tree view typée (image = vignette réelle, audio = note
# de musique, PDF = logo), + badge extension PDF → logo.
#
# La GRID fait déjà tout ça (CardIcon). Le travail est dans la TREE
# (FinderTreeFile utilisait une icône <File> générique unique).
#
# Pour ne pas dupliquer la détection de type (la maladie du projet), on EXTRAIT
# les helpers de GridItem dans un module partagé `utils/fileType.ts`, importé
# par les deux.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

UTILDIR="apps/web/src/features/finder-core/utils"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
FILETYPE="$UTILDIR/fileType.ts"

test -f "$GRID" || { echo "✗ $GRID introuvable — lance depuis la racine."; exit 1; }
test -f "$TREE" || { echo "✗ $TREE introuvable."; exit 1; }
test -f apps/web/public/icons/pdf.svg || { echo "✗ apps/web/public/icons/pdf.svg absent — copie d'abord le SVG."; exit 1; }

if [ -f "$FILETYPE" ]; then
  echo "→ fileType.ts déjà présent, rien à faire."
  exit 0
fi

# ── 1) Module partagé de détection de type ──────────────────────────────────
cat > "$FILETYPE" <<'TSEOF'
/**
 * Détection de type de fichier — source unique, partagée entre la grid
 * (GridItem) et la tree (FinderTreeFile). Évite deux logiques divergentes.
 *
 * `meta.kind` (contrat) ne distingue pas audio de document (les deux sont
 * 'document'). On raffine ici par extension du nom de fichier — l'info
 * toujours disponible en UI.
 */

const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'ogg', 'oga', 'm4a', 'opus', 'flac',
]);

const PDF_EXTENSIONS = new Set(['pdf']);

export function getFileExtension(name: string): string | null {
  const idx = name.lastIndexOf('.');
  if (idx === -1 || idx === name.length - 1) return null;
  return name.slice(idx + 1).toLowerCase();
}

export function isAudioFile(extension: string | null): boolean {
  return extension !== null && AUDIO_EXTENSIONS.has(extension);
}

export function isPdfFile(extension: string | null): boolean {
  return extension !== null && PDF_EXTENSIONS.has(extension);
}

/**
 * Extension effective d'un nœud : le `format` Cloudinary (qui n'inclut pas
 * l'extension dans le nom) en priorité, sinon l'extension du nom (cas R2).
 */
export function effectiveExtension(
  format: string | null | undefined,
  name: string,
): string | null {
  return format?.toLowerCase() ?? getFileExtension(name);
}
TSEOF
echo "✓ $FILETYPE créé (helpers partagés)"

# ── 2) GridItem : pointer sur le module partagé (retirer les copies locales) ─
python3 - <<'PYEOF'
import pathlib, re

grid = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = grid.read_text(encoding="utf-8")

# retirer les définitions locales AUDIO_EXTENSIONS / getFileExtension / isAudioFile
block = """const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'ogg', 'oga', 'm4a', 'opus', 'flac',
]);"""
if block in src:
    src = src.replace(block + "\n", "")

# getFileExtension local
src = re.sub(
    r"function getFileExtension\(name: string\): string \| null \{.*?\n\}\n",
    "", src, flags=re.S, count=1)
# isAudioFile local
src = re.sub(
    r"function isAudioFile\(extension: string \| null\): boolean \{.*?\n\}\n",
    "", src, flags=re.S, count=1)

# ajouter l'import du module partagé (après la première ligne d'import)
if "from '@features/finder-core/utils/fileType'" not in src:
    lines = src.split("\n")
    # insérer après le dernier import du haut
    last_import = max(i for i, l in enumerate(lines[:40]) if l.startswith("import "))
    lines.insert(last_import + 1,
        "import { getFileExtension, isAudioFile, isPdfFile } from '@features/finder-core/utils/fileType';")
    src = "\n".join(lines)

grid.write_text(src, encoding="utf-8")
print("  ✓ GridItem pointe sur fileType.ts (copies locales retirées)")
PYEOF

# ── 3) GridItem : badge PDF → logo ──────────────────────────────────────────
python3 - <<'PYEOF'
import pathlib

grid = pathlib.Path("apps/web/src/features/finder-core/components/GridItem.tsx")
src = grid.read_text(encoding="utf-8")

OLD_BADGE = """      {!isFolder && extension && (
        <div
          className={clsx(
            'absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wide',
            hasVisualThumb
              ? 'bg-white/85 backdrop-blur-sm text-gray-700 shadow-sm'
              : 'bg-gray-100 text-gray-600 border border-gray-200',
          )}
        >
          {extension}
        </div>
      )}"""

NEW_BADGE = """      {!isFolder && extension && (
        isPdfFile(extension) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src=\"/icons/pdf.svg\"
            alt=\"PDF\"
            className=\"absolute top-1.5 right-1.5 h-5 w-5 drop-shadow-sm\"
          />
        ) : (
          <div
            className={clsx(
              'absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wide',
              hasVisualThumb
                ? 'bg-white/85 backdrop-blur-sm text-gray-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 border border-gray-200',
            )}
          >
            {extension}
          </div>
        )
      )}"""

assert src.count(OLD_BADGE) == 1, f"ancre badge grid trouvée {src.count(OLD_BADGE)}x"
src = src.replace(OLD_BADGE, NEW_BADGE)
grid.write_text(src, encoding="utf-8")
print("  ✓ GridItem : badge PDF → logo")
PYEOF

# ── 4) FinderTreeFile : icône typée (image/audio/pdf/doc) ───────────────────
python3 - <<'PYEOF'
import pathlib

tree = pathlib.Path("apps/web/src/features/finder-core/components/FinderTreeFile.tsx")
src = tree.read_text(encoding="utf-8")

# 4a. imports : Music + helpers + statusOf
OLD_IMP = "import { File, Check } from 'lucide-react';"
NEW_IMP = """import { File, Music, Check } from 'lucide-react';
import { effectiveExtension, isAudioFile, isPdfFile } from '@features/finder-core/utils/fileType';
import { statusOf } from '@features/finder-core/utils/statusFolders';"""
assert src.count(OLD_IMP) == 1, "import lucide tree introuvable"
src = src.replace(OLD_IMP, NEW_IMP)

# 4b. remplacer <File .../> par un composant typé
OLD_ICON = '<File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />'
NEW_ICON = '<TreeFileVisual node={node} />'
assert src.count(OLD_ICON) == 1, f"icône <File> tree trouvée {src.count(OLD_ICON)}x"
src = src.replace(OLD_ICON, NEW_ICON)

# 4c. définir TreeFileVisual en fin de fichier
VISUAL = '''

/**
 * Vignette typée d'un fichier dans la tree view :
 *   - image  → aperçu réel (meta.url), fallback icône si l'image casse ;
 *   - audio  → note de musique ;
 *   - pdf    → logo PDF ;
 *   - autre  → icône fichier générique.
 * Un point orange discret signale le statut « en attente ».
 */
function TreeFileVisual({ node }: { node: FinderNode }): JSX.Element {
  const [imgFailed, setImgFailed] = useState(false);
  const url = node.meta?.url;
  const kind = node.meta?.kind;
  const extension = effectiveExtension(node.meta?.format, node.name);
  const isPending = statusOf(node) === 'pending';

  const hasImageThumb = kind === 'image' && url && !imgFailed;

  let inner: JSX.Element;
  if (hasImageThumb) {
    inner = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={node.name}
        className="h-4 w-4 shrink-0 rounded-sm object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  } else if (isPdfFile(extension)) {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src="/icons/pdf.svg" alt="PDF" className="h-4 w-4 shrink-0" />;
  } else if (isAudioFile(extension)) {
    inner = <Music className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  } else {
    inner = <File className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.5} />;
  }

  if (!isPending) return inner;

  // Statut « en attente » : point orange en surimpression.
  return (
    <span className="relative inline-flex shrink-0">
      {inner}
      <span
        className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-orange-400 ring-1 ring-white"
        aria-label="En attente"
      />
    </span>
  );
}'''

src = src.rstrip() + "\n" + VISUAL + "\n"
tree.write_text(src, encoding="utf-8")
print("  ✓ FinderTreeFile : icône typée (image/audio/pdf) + point pending")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(finder): tree view typee — apercu image, note audio, logo PDF"
echo "✓ commité."