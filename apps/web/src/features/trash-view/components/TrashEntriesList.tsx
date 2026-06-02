'use client';

import { JSX, useState } from 'react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';
import { useTrashStore } from '../state/useTrashStore';
import { useTrashActions } from '../hooks/useTrashActions';

import TrashEntryGrid from './TrashEntryGrid';
import TrashEntryTableRow from './TrashEntryTableRow';
import TrashEntryCompactRow from './TrashEntryCompactRow';
import ConfirmDialog from './ConfirmDialog';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';

type Props = {
  entries: TrashEntryDTO[];
};

/**
 * Wrapper qui rend la liste des trashEntries dans le mode d'affichage choisi.
 *
 * - **grid** : grille auto-fill 110px (cohérent avec le finder)
 * - **table** : tableau classique avec headers
 * - **compact** : liste dense d'une ligne par entry
 *
 * La sélection est gérée via le store (`selectedIds`, `toggleSelected`).
 * Le drill-down sur un double-clic d'une entry de kind="folder" appelle
 * `enterDrilldown` qui fait basculer la vue.
 *
 * ─── Menu contextuel (right-click) ────────────────────────────────────────
 *
 * Géré centralement ici (pas dans chaque sous-composant Grid/Compact/Table)
 * pour ne maintenir qu'un seul état de menu actif à la fois, peu importe
 * le mode de vue actif.
 *
 * Sémantique :
 *   - Right-click sur une entry **dans** la sélection → l'action s'applique
 *     à TOUTE la sélection.
 *   - Right-click sur une entry **hors** sélection → l'action s'applique
 *     uniquement à cette entry (la sélection courante est ignorée).
 *
 * Cette règle reflète la convention macOS/Windows : un right-click sur un
 * item non sélectionné ne touche pas la sélection existante.
 *
 * Actions exposées :
 *   - **Restaurer** (réversible, pas de confirmation)
 *   - **Supprimer définitivement** (irréversible, ConfirmDialog)
 */
export default function TrashEntriesList({ entries }: Props): JSX.Element {
  const viewMode = useTrashStore((s) => s.viewMode);
  const selectedIds = useTrashStore((s) => s.selectedIds);
  const toggleSelected = useTrashStore((s) => s.toggleSelected);
  const clearSelection = useTrashStore((s) => s.clearSelection);
  const enterDrilldown = useTrashStore((s) => s.enterDrilldown);

  const { restore, deleteForever } = useTrashActions();

  // ─── State menu contextuel ──────────────────────────────────────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  // Ids visés par l'action en cours (calculés au moment du right-click).
  // Snapshot figé : si la sélection change pendant que le menu est ouvert,
  // les ids cibles ne bougent pas.
  const [actionIds, setActionIds] = useState<string[]>([]);
  // Pour la confirmation deleteForever : on ferme le menu, puis on ouvre
  // le dialog avec les ids capturés.
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function handleEntryClick(entry: TrashEntryDTO) {
    toggleSelected(entry.id);
  }

  function handleEntryDoubleClick(entry: TrashEntryDTO) {
    if (entry.kind === 'folder') {
      enterDrilldown(entry.id, entry.displayName);
    }
  }

  /**
   * Right-click sur une entry — détermine les ids cibles puis ouvre le menu.
   * La règle : si l'entry est dans la sélection, on agit sur toute la
   * sélection ; sinon on agit sur cette entry seule.
   */
  function handleEntryContextMenu(e: React.MouseEvent, entry: TrashEntryDTO) {
    const ids =
      selectedIds.has(entry.id) && selectedIds.size > 1
        ? Array.from(selectedIds)
        : [entry.id];
    setActionIds(ids);
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  /**
   * Items du menu contextuel — labels adaptatifs selon le nombre d'ids ciblés.
   * Le suffixe "(N)" en multi-sélection rend explicite le périmètre de
   * l'action ; sans lui l'utilisateur pourrait croire que l'action ne
   * concerne que l'item right-clicked.
   */
  function buildMenuItems(): ContextMenuItem[] {
    const n = actionIds.length;
    return [
      {
        label: n <= 1 ? 'Restaurer' : `Restaurer la sélection (${n})`,
        onClick: async () => {
          await restore(actionIds);
          clearSelection();
        },
      },
      {
        label:
          n <= 1
            ? 'Supprimer définitivement'
            : `Supprimer la sélection (${n})`,
        destructive: true,
        onClick: () => {
          // On ne supprime pas tout de suite — on ouvre le ConfirmDialog.
          // Le menu se ferme via son `onClose` standard ; les ids restent
          // dans actionIds tant que le dialog n'est pas résolu.
          setConfirmDeleteOpen(true);
        },
      },
    ];
  }

  async function handleDeleteConfirmed() {
    setConfirmDeleteOpen(false);
    await deleteForever(actionIds);
    clearSelection();
  }

  // ─── Construction des handlers communs ─────────────────────────────────
  //
  // Chaque sous-composant reçoit les mêmes handlers (click, dblclick, ctxmenu).
  // On factorise pour ne pas répéter 3 fois (1 par mode de vue).
  const entryHandlers = {
    onClick: (entry: TrashEntryDTO) => () => handleEntryClick(entry),
    onDoubleClick: (entry: TrashEntryDTO) => () => handleEntryDoubleClick(entry),
    onContextMenu: handleEntryContextMenu,
  };

  // Helper pour ne pas répéter le ContextMenu + Dialog dans chaque return.
  function renderMenuAndDialog() {
    return (
      <>
        {menuPos && (
          <ContextMenu
            x={menuPos.x}
            y={menuPos.y}
            items={buildMenuItems()}
            onClose={() => setMenuPos(null)}
          />
        )}
        <ConfirmDialog
          open={confirmDeleteOpen}
          title="Suppression définitive"
          description={`Voulez-vous vraiment supprimer définitivement ${actionIds.length} élément${actionIds.length > 1 ? 's' : ''} ? Cette action est irréversible.`}
          confirmLabel="Supprimer définitivement"
          destructive
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      </>
    );
  }

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] p-4">
          {entries.map((entry) => (
            <TrashEntryGrid
              key={entry.id}
              entry={entry}
              selected={selectedIds.has(entry.id)}
              onClick={entryHandlers.onClick(entry)}
              onDoubleClick={entryHandlers.onDoubleClick(entry)}
              onContextMenu={entryHandlers.onContextMenu}
            />
          ))}
        </div>
        {renderMenuAndDialog()}
      </>
    );
  }

  if (viewMode === 'table') {
    return (
      <>
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left w-8"></th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Chemin d&apos;origine</th>
                <th className="px-3 py-2 text-left">Supprimé le</th>
                <th className="px-3 py-2 text-right">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <TrashEntryTableRow
                  key={entry.id}
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onClick={entryHandlers.onClick(entry)}
                  onDoubleClick={entryHandlers.onDoubleClick(entry)}
                  onContextMenu={entryHandlers.onContextMenu}
                />
              ))}
            </tbody>
          </table>
        </div>
        {renderMenuAndDialog()}
      </>
    );
  }

  // compact
  return (
    <>
      <div className="bg-white">
        {entries.map((entry) => (
          <TrashEntryCompactRow
            key={entry.id}
            entry={entry}
            selected={selectedIds.has(entry.id)}
            onClick={entryHandlers.onClick(entry)}
            onDoubleClick={entryHandlers.onDoubleClick(entry)}
            onContextMenu={entryHandlers.onContextMenu}
          />
        ))}
      </div>
      {renderMenuAndDialog()}
    </>
  );
}
