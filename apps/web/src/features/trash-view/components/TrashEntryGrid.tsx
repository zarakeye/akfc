'use client';

import { JSX, useState } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

// La MÊME fonction que `mapFileToFinderNode` utilise pour la grille du
// finder. La réécrire ici créerait une troisième façon de fabriquer une URL
// de média dans ce projet, et la prochaine évolution de signature en
// corrigerait deux sur trois. La corbeille étant Cloudinary de bout en bout
// (aucun de ses services ne mentionne R2), le couplage est assumé.
import { getMediaUrl } from '@features/finder-adapters/cloudinary/utils';

type Props = {
  entry: TrashEntryDTO;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  /**
   * Right-click sur la card. Pass-through au parent (TrashEntriesList)
   * qui gère le menu contextuel centralisé. Optionnel pour compat
   * descendante — si absent, le clic droit conserve le menu natif du
   * navigateur.
   */
  onContextMenu?: (e: React.MouseEvent, entry: TrashEntryDTO) => void;
};

/**
 * Card en mode grille pour une TrashEntry.
 *
 * - Carrée (aspect-square) — cohérent avec le finder
 * - Vignette réelle pour les images, icône Folder/FileText sinon
 * - displayName en bas
 * - previousPathShort en tooltip et en petit sous-texte
 * - Sélectionnée → bordure bleue + fond bleu-50
 *
 * Le double-clic sur un folder déclenche le drill-down (géré par le parent).
 * Le right-click déclenche un menu contextuel (géré par le parent via
 * `onContextMenu`).
 */
export default function TrashEntryGrid({
  entry,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: Props): JSX.Element {
  const isFolder = entry.kind === 'folder';
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

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault();
              onContextMenu(e, entry);
            }
          : undefined
      }
      className={`
        relative aspect-square rounded-lg border bg-white overflow-hidden
        cursor-pointer select-none p-2
        flex flex-col items-center justify-center gap-2
        transition-shadow
        ${selected
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
          : 'hover:shadow-md hover:border-gray-300'}
      `}
      title={entry.previousPath}
      role="button"
      aria-pressed={selected}
    >
      {thumbUrl ? (
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
      )}
      <div className="text-xs text-center truncate w-full px-1" title={entry.displayName}>
        {entry.displayName}
      </div>
      <div className="text-[10px] text-gray-400 truncate w-full text-center px-1">
        {entry.previousPathShort}
      </div>
    </div>
  );
}
