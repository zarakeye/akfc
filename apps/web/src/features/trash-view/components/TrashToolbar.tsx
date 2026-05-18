'use client';

import { JSX, useState } from 'react';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { useTrashStore } from '../state/useTrashStore';
import { useTrashActions } from '../hooks/useTrashActions';
import ConfirmDialog from './ConfirmDialog';

/**
 * Toolbar contextuelle visible uniquement quand `selectedIds` n'est pas vide.
 *
 * Affiche le compteur de sélection et 3 actions :
 *   - Restaurer (pas de confirmation, c'est réversible)
 *   - Supprimer définitivement (confirmation simple oui/non)
 *   - Effacer la sélection (le X)
 *
 * Style : barre fine en haut du panneau central, fond bleu doux pour
 * indiquer le mode "sélection active". Ne décale pas le layout puisque
 * elle est en `position: absolute` au-dessus du contenu.
 *
 * Wait — non, on la rend dans le flow normal, mais le parent (TrashView)
 * gère son apparition/disparition. Ça simplifie le z-index. Le seul
 * impact "shift" est mineur (~40px) et acceptable ici car visible
 * uniquement quand l'utilisateur AGIT (sélectionne).
 */
export default function TrashToolbar(): JSX.Element | null {
  const selectedIds = useTrashStore((s) => s.selectedIds);
  const clearSelection = useTrashStore((s) => s.clearSelection);
  const { restore, deleteForever, isRestoring, isDeleting } = useTrashActions();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (selectedIds.size === 0) return null;

  const ids = Array.from(selectedIds);
  const count = ids.length;

  async function handleRestore() {
    await restore(ids);
    clearSelection();
  }

  async function handleDeleteConfirmed() {
    setConfirmDeleteOpen(false);
    await deleteForever(ids);
    clearSelection();
  }

  return (
    <>
      <div className="
        flex items-center gap-3 px-3 py-2
        bg-blue-50 border-b border-blue-200
        text-sm
      ">
        <button
          type="button"
          onClick={clearSelection}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Effacer la sélection"
          title="Effacer la sélection"
        >
          <X className="h-4 w-4" />
        </button>

        <span className="font-medium text-blue-900">
          {count} {count > 1 ? 'éléments sélectionnés' : 'élément sélectionné'}
        </span>

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleRestore}
          disabled={isRestoring}
          className="
            flex items-center gap-1.5 px-3 py-1 rounded text-sm
            bg-white border hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isRestoring ? 'Restauration...' : 'Restaurer'}
        </button>

        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          disabled={isDeleting}
          className="
            flex items-center gap-1.5 px-3 py-1 rounded text-sm
            bg-red-600 text-white hover:bg-red-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Suppression définitive"
        description={`Voulez-vous vraiment supprimer définitivement ${count} élément${count > 1 ? 's' : ''} ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
