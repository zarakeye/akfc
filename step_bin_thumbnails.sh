#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — La corbeille dessine enfin ce qu'on lui donne
# ═══════════════════════════════════════════════════════════════════════════
#
#  Symptôme : dans la corbeille, une photo s'affiche en icône « fichier »
#  générique. Restaurée, son aperçu revient.
#
#  ─── Le backend n'a rien à apprendre ────────────────────────────────────
#
#  `listBin` renvoie DÉJÀ tout le nécessaire, et le contrat le documente
#  explicitement :
#
#      /** publicId pour les fichiers Cloudinary, utile pour la preview … */
#      publicId?: string;
#      mediaKind?: "image" | "video" | "document";
#
#  `TrashEntryGrid` ne les regarde simplement jamais : il fait
#  `const Icon = isFolder ? Folder : FileText` et s'arrête là. La corbeille
#  n'a donc jamais eu d'aperçus — ce n'est pas une régression, c'est un
#  raccord qui n'a jamais été fait.
#
#  ─── Pourquoi importer `getMediaUrl` plutôt que refaire l'URL ───────────
#
#  C'est la fonction exacte qu'utilise `mapFileToFinderNode` pour la grille du
#  finder. La réécrire ici créerait une TROISIÈME façon de fabriquer une URL de
#  média dans ce projet — et la prochaine fois que la signature d'URL change,
#  quelqu'un en corrigerait deux sur trois. Le couplage `trash-view` →
#  `finder-adapters` est assumé : la corbeille est Cloudinary de bout en bout
#  (aucun de ses six services ne mentionne R2).
#
#  ─── Ce que ce script NE fait pas ───────────────────────────────────────
#
#  `TrashEntryTableRow` et `TrashEntryCompactRow` ont le MÊME trou — même
#  `const Icon = isFolder ? Folder : FileText`, même indifférence à
#  `publicId`. Je ne les touche pas : leur icône fait 16px, y coller une
#  vignette est une décision de design, pas une correction. La grille, elle,
#  existe pour montrer.
#
#  Les vidéos gardent leur icône : Cloudinary sait en tirer une poster frame,
#  mais ça se décide (quelle frame, quel coût de transformation) — pas ici.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_bin_thumbnails.sh
#     AKFC_APPLY_ONLY=1 bash step_bin_thumbnails.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — aperçus dans la corbeille"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

G="apps/web/src/features/trash-view/components/TrashEntryGrid.tsx"
[ -f "$G" ] || { echo "✗ Introuvable : $G"; exit 1; }

if grep -q "getMediaUrl" "$G"; then
  echo "✓ Déjà appliqué."
  exit 0
fi

python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

G = "apps/web/src/features/trash-view/components/TrashEntryGrid.tsx"

sub_once(G,
"""import { JSX } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';""",
"""import { JSX, useState } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

// La MÊME fonction que `mapFileToFinderNode` utilise pour la grille du
// finder. La réécrire ici créerait une troisième façon de fabriquer une URL
// de média dans ce projet, et la prochaine évolution de signature en
// corrigerait deux sur trois. La corbeille étant Cloudinary de bout en bout
// (aucun de ses services ne mentionne R2), le couplage est assumé.
import { getMediaUrl } from '@features/finder-adapters/cloudinary/utils';""",
    "TrashEntryGrid — imports")

sub_once(G,
""" * - Carrée (aspect-square) — cohérent avec le finder
 * - Icône Folder ou FileText selon le `kind`""",
""" * - Carrée (aspect-square) — cohérent avec le finder
 * - Vignette réelle pour les images, icône Folder/FileText sinon""",
    "TrashEntryGrid — doc")

sub_once(G,
"""  const isFolder = entry.kind === 'folder';
  const Icon = isFolder ? Folder : FileText;

  return (""",
"""  const isFolder = entry.kind === 'folder';
  const Icon = isFolder ? Folder : FileText;

  // ─── Pourquoi une vignette ici ─────────────────────────────────────────
  //
  // `listBin` renvoie déjà `publicId` (le `storageRoot` de l'entry) et
  // `mediaKind` — le contrat les documente explicitement comme servant à la
  // preview. Cette card ne les avait simplement jamais regardés : la
  // corbeille n'a jamais eu d'aperçus, et on y reconnaissait ses photos à
  // leur seul nom de fichier.
  //
  // Les vidéos gardent leur icône : Cloudinary sait en tirer une poster
  // frame, mais ça se décide (quelle frame, quel coût de transformation).
  const [thumbFailed, setThumbFailed] = useState(false);

  const thumbUrl =
    !isFolder && entry.mediaKind === 'image' && entry.publicId && !thumbFailed
      ? getMediaUrl({ publicId: entry.publicId })
      : null;

  return (""",
    "TrashEntryGrid — l'URL de vignette")

sub_once(G,
"""      <Icon
        className={`h-12 w-12 ${isFolder ? 'text-blue-400' : 'text-gray-400'}`}
        strokeWidth={1.5}
      />""",
"""      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL signée
        // Cloudinary servie par le proxy applicatif : `next/image` exigerait
        // une config de domaine distante que le reste du finder n'a pas non
        // plus. On reste aligné sur `GridItem`.
        <img
          src={thumbUrl}
          alt=""
          // Un asset peut avoir disparu sous nos pieds (purge concurrente,
          // vestige Cloudinary sans TrashEntry). On retombe alors sur
          // l'icône plutôt que sur une image cassée — la card doit rester
          // sélectionnable et restaurable dans tous les cas.
          onError={() => setThumbFailed(true)}
          className="h-12 w-12 rounded object-cover"
        />
      ) : (
        <Icon
          className={`h-12 w-12 ${isFolder ? 'text-blue-400' : 'text-gray-400'}`}
          strokeWidth={1.5}
        />
      )}""",
    "TrashEntryGrid — la vignette remplace l'icône")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(trash): la grille de corbeille affiche les vraies vignettes

Une photo en corbeille s'affichait en icône « fichier » générique. Restaurée,
son aperçu revenait.

Le backend n'avait rien à apprendre : listBin renvoie déjà publicId (le
storageRoot de l'entry) et mediaKind, et le contrat les documente
explicitement comme servant à la preview. TrashEntryGrid ne les regardait
jamais — const Icon = isFolder ? Folder : FileText, et rien d'autre. La
corbeille n'a donc jamais eu d'aperçus : ce n'est pas une régression, c'est un
raccord qui n'avait jamais été fait.

- getMediaUrl est importé, pas réécrit : c'est la fonction qu'utilise déjà
  mapFileToFinderNode. En refaire une ici créerait une troisième façon de
  fabriquer une URL de média, et la prochaine évolution de signature en
  corrigerait deux sur trois. La corbeille étant Cloudinary de bout en bout,
  le couplage trash-view -> finder-adapters est assumé.
- onError retombe sur l'icône : un asset peut avoir disparu (purge
  concurrente, vestige sans TrashEntry) et la card doit rester sélectionnable
  et restaurable.
- les vidéos gardent leur icône : Cloudinary sait en tirer une poster frame,
  mais quelle frame et à quel coût de transformation se décident.

Non traité : TrashEntryTableRow et TrashEntryCompactRow ont le même trou.
Leur icône fait 16px — y mettre une vignette est une décision de design, pas
une correction."

echo "✅ Vignettes de corbeille appliquées, typechecké et commité."