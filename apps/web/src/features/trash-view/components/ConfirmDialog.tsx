'use client';

import { JSX, useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** Description courte affichée sous le titre */
  description: string;
  /** Texte du bouton de confirmation */
  confirmLabel?: string;
  /** Texte du bouton d'annulation */
  cancelLabel?: string;
  /** Variante visuelle du bouton de confirmation */
  destructive?: boolean;
  /**
   * Si fourni, l'utilisateur doit taper exactement cette phrase dans un input
   * avant de pouvoir confirmer. Utile pour les actions très destructrices
   * (ex: vider la corbeille).
   */
  requireTypedConfirmation?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Modale de confirmation (overlay + panneau central).
 *
 * - **Mode simple** : juste un bouton Confirmer / Annuler.
 * - **Mode strong** (avec `requireTypedConfirmation`) : un input apparaît et
 *   l'utilisateur doit taper exactement la phrase pour activer le bouton.
 *   Évite les "click panic" pour les actions irréversibles.
 *
 * Pas de portal React — on rend juste un overlay fixed plein-écran. Suffit
 * pour notre usage et évite une dépendance à @radix-ui/react-portal qui n'est
 * peut-être pas installée.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  requireTypedConfirmation,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element | null {
  const [typedValue, setTypedValue] = useState('');

  // Reset l'input à chaque ouverture
  useEffect(() => {
    if (open) setTypedValue('');
  }, [open]);

  // Échap pour annuler
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm = requireTypedConfirmation
    ? typedValue.trim() === requireTypedConfirmation
    : true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {destructive && (
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
            )}
            <h2 id="confirm-title" className="text-lg font-semibold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p id="confirm-desc" className="text-sm text-gray-600">
          {description}
        </p>

        {requireTypedConfirmation && (
          <div className="space-y-2">
            <label className="text-sm text-gray-700">
              Tape <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-700 font-mono">{requireTypedConfirmation}</code> pour confirmer :
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
