'use client';

import { JSX } from 'react';
import { Folder, FileText, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import type {
  TrashFolderNode,
  TrashFileNode,
} from '@contracts/trash/trash-node.types';

import { useTrashStore, type DrilldownState } from '../state/useTrashStore';
import { useTrashDrilldown } from '../hooks/useTrashDrilldown';

type Props = {
  drilldown: NonNullable<DrilldownState>;
};

/**
 * Vue drill-down : affiche le contenu d'une trashEntry de type "folder",
 * avec un breadcrumb pour naviguer dans la hiérarchie virtuelle.
 *
 * - Au montage : on appelle `readTrashFolder({ trashId, relativePath: "" })`
 *   pour récupérer le contenu racine de l'entrée.
 * - Double-clic sur un sous-folder → on met à jour `relativePath` et la
 *   query se relance toute seule (`useTrashDrilldown` est dépendant de la
 *   valeur de relativePath via le store).
 * - Breadcrumb "Corbeille / <displayName> / sub1 / sub2..." cliquable pour
 *   revenir à un niveau supérieur.
 *
 * Note : pas de sélection ni d'actions individuelles dans le drill-down
 * pour cette version — on regarde uniquement. La restauration et la
 * suppression définitive se font au niveau de la trashEntry top-level.
 * Si on veut plus tard pouvoir agir sur des sous-éléments, ce serait une
 * extension propre du backend (qui n'expose pas encore cette opération).
 */
export default function TrashDrilldown({ drilldown }: Props): JSX.Element {
  const exitDrilldown = useTrashStore((s) => s.exitDrilldown);
  const navigateInsideDrilldown = useTrashStore((s) => s.navigateInsideDrilldown);

  const { children, isLoading, isError } = useTrashDrilldown(
    drilldown.trashId,
    drilldown.relativePath
  );

  const segments = drilldown.relativePath
    ? drilldown.relativePath.split('/').filter(Boolean)
    : [];

  function handleFolderDoubleClick(child: TrashFolderNode) {
    const nextPath = drilldown.relativePath
      ? `${drilldown.relativePath}/${child.name}`
      : child.name;
    navigateInsideDrilldown(nextPath);
  }

  function handleBreadcrumbClick(index: number) {
    // index = -1 → racine de l'entrée (relativePath = "")
    // index >= 0 → on tronque les segments à ce niveau
    if (index < 0) {
      navigateInsideDrilldown('');
      return;
    }
    const next = segments.slice(0, index + 1).join('/');
    navigateInsideDrilldown(next);
  }

  return (
    <div className="flex flex-col h-full">

      {/* ─── Header : retour + breadcrumb virtuel ─── */}
      <div className="px-3 py-2 border-b text-sm flex items-center gap-2 min-h-[40px]">
        <button
          type="button"
          onClick={exitDrilldown}
          className="
            flex items-center gap-1 px-2 py-1 rounded text-gray-600
            hover:bg-gray-100 hover:text-gray-900
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
            transition-colors
          "
          aria-label="Retour à la corbeille"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs">Corbeille</span>
        </button>

        <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />

        <button
          type="button"
          onClick={() => handleBreadcrumbClick(-1)}
          className={`
            truncate max-w-[200px] px-1 rounded
            hover:underline transition-colors
            ${segments.length === 0
              ? 'font-medium text-gray-900'
              : 'text-gray-600 hover:text-gray-900'}
          `}
          disabled={segments.length === 0}
          title={drilldown.displayName}
        >
          {drilldown.displayName}
        </button>

        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
              {isLast ? (
                <span className="font-medium text-gray-900 truncate max-w-[200px]" title={seg}>
                  {seg}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(i)}
                  className="text-gray-600 hover:text-gray-900 hover:underline truncate max-w-[200px] px-1 rounded transition-colors"
                  title={seg}
                >
                  {seg}
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* ─── Contenu ─── */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center text-gray-400 gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="text-sm text-red-600 py-4">
            Erreur de chargement du contenu de cette entrée.
          </div>
        )}

        {!isLoading && !isError && children.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">
            Ce dossier est vide.
          </div>
        )}

        {!isLoading && !isError && children.length > 0 && (
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
            {children.map((child) => (
              <DrilldownItem
                key={child.fullPath}
                child={child}
                onDoubleClick={() => {
                  if (child.type === 'folder') {
                    handleFolderDoubleClick(child);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DRILLDOWN ITEM                                */
/* -------------------------------------------------------------------------- */

function DrilldownItem({
  child,
  onDoubleClick,
}: {
  child: TrashFolderNode | TrashFileNode;
  onDoubleClick: () => void;
}): JSX.Element {
  const isFolder = child.type === 'folder';
  const Icon = isFolder ? Folder : FileText;

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`
        relative aspect-square rounded-lg border bg-white overflow-hidden p-2
        flex flex-col items-center justify-center gap-2
        ${isFolder ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : 'cursor-default'}
        transition-shadow
      `}
      title={child.fullPath}
    >
      <Icon
        className={`h-12 w-12 ${isFolder ? 'text-blue-400' : 'text-gray-400'}`}
        strokeWidth={1.5}
      />
      <div className="text-xs text-center truncate w-full px-1" title={child.name}>
        {child.name}
      </div>
    </div>
  );
}
