'use client';

import { JSX, ReactNode, useEffect, useId, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** Description affichée sous le titre : une phrase, ou un bloc (paragraphes, liste). */
  description: ReactNode;
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
  // Identifiants uniques : deux modales sur une même page ne se confondent pas.
  const titleId = useId();
  const descId = useId();

  // Reset l'input à chaque ouverture. Pattern « adjust state during render »
  // (comparaison à l'état précédent) plutôt qu'un useEffect + setState.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTypedValue('');
  }

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
        className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {destructive && (
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden />
            )}
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id={descId} className="space-y-2 text-sm text-muted-foreground">
          {description}
        </div>

        {requireTypedConfirmation && (
          <div className="space-y-2">
            <label className="text-sm text-foreground">
              Tape <code className="bg-muted px-1.5 py-0.5 rounded text-destructive font-mono">{requireTypedConfirmation}</code> pour confirmer :
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            // Un tuto guidé le retrouve à son libellé (`targetText`) dans un bloc qui porte son `data-tour`.
            data-tour-row=""
            className={`px-4 py-2 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              destructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-brand text-brand-foreground hover:bg-brand/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}