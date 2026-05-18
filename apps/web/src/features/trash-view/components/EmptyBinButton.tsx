'use client';

import { JSX, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTrashActions } from '../hooks/useTrashActions';
import ConfirmDialog from './ConfirmDialog';

type Props = {
  /** Nombre d'items actuellement dans la corbeille (pour message + désactivation si 0) */
  totalCount: number;
};

/**
 * Bouton "Vider la corbeille" avec confirmation forte par texte tapé.
 *
 * Action très destructrice (suppression définitive de TOUT le contenu de
 * la corbeille). Pour éviter les clics catastrophiques, on demande à
 * l'utilisateur de taper exactement le mot "supprimer" pour activer le
 * bouton de confirmation.
 *
 * Désactivé si la corbeille est vide.
 */
export default function EmptyBinButton({ totalCount }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const { emptyBin, isEmptying } = useTrashActions();

  async function handleConfirmed() {
    setOpen(false);
    await emptyBin();
  }

  const disabled = totalCount === 0 || isEmptying;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="
          flex items-center gap-1.5 px-3 py-1.5 rounded text-sm
          bg-white border border-red-300 text-red-700
          hover:bg-red-50
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
        "
        title={
          totalCount === 0
            ? 'La corbeille est déjà vide'
            : 'Supprimer définitivement tout le contenu de la corbeille'
        }
      >
        <Trash2 className="h-4 w-4" />
        Vider la corbeille
      </button>

      <ConfirmDialog
        open={open}
        title="Vider la corbeille"
        description={`Cette action va supprimer définitivement les ${totalCount} éléments de la corbeille. Cette opération est irréversible.`}
        confirmLabel="Vider définitivement"
        destructive
        requireTypedConfirmation="supprimer"
        onConfirm={handleConfirmed}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
