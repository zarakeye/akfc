'use client';

import { JSX, useEffect } from 'react';
import { X } from 'lucide-react';

import type { FinderNode } from '@contracts/finder';

import { PreviewRenderer, type PreviewKind } from './PreviewPanel';

/**
 * Modale fullscreen pour la preview "ouverte en grand".
 *
 * ─── Rôle ────────────────────────────────────────────────────────────────
 *
 * Le `PreviewPanel` à droite du finder affiche les fichiers en mode
 * compact (tailles bornées pour rester dans la sidebar). Quand l'utilisateur
 * veut profiter pleinement d'un PDF, d'une vidéo ou d'un document, ce
 * composant ouvre une **fenêtre modale plein écran** qui réutilise le
 * même `PreviewRenderer` mais en variant `fullscreen`.
 *
 * Aucune duplication de la logique de dispatch : on délègue intégralement
 * à `PreviewRenderer`. Cette modale est essentiellement un *chrome* (cadre)
 * autour du même viewer.
 *
 * ─── Fermeture ───────────────────────────────────────────────────────────
 *
 * Trois moyens de fermer, par ordre d'évidence :
 *   1. Touche `Escape` (handler global pendant que la modale est ouverte)
 *   2. Bouton croix en haut à droite
 *   3. Clic sur le backdrop (zone sombre autour de la fenêtre)
 *
 * On bloque la propagation des clics depuis la fenêtre vers le backdrop
 * pour éviter que cliquer DANS le viewer ne ferme la modale.
 *
 * ─── Scroll lock ─────────────────────────────────────────────────────────
 *
 * Quand la modale est ouverte, on bloque le scroll du body sous-jacent
 * via `overflow: hidden`. Cleanup garanti même si la modale est démontée
 * pour autre raison (changement de page, etc.).
 *
 * ─── Démontage vs masquage ───────────────────────────────────────────────
 *
 * Le composant retourne `null` quand `isOpen=false`. Pas de `display:none`
 * caché : le viewer (qui peut être une `<video>` en lecture, ou un fetch
 * mammoth en cours) doit être *réellement* démonté pour libérer ses
 * ressources et arrêter la lecture audio/vidéo.
 */

type Props = {
  file: FinderNode;
  kind: PreviewKind;
  isOpen: boolean;
  onClose: () => void;
};

export default function PreviewModal({
  file,
  kind,
  isOpen,
  onClose,
}: Props): JSX.Element | null {
  // cf. `data-finder-overlay` plus bas : le finder n'attrape pas Échap tant
  // que cette modale est montée.
  // ─── Listener Escape ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ─── Scroll lock du body ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      // Backdrop : fixed plein écran, semi-opaque, blur léger
      data-finder-overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu de ${file.name}`}
    >
      {/* Fenêtre : 95vw/95vh max, cadre blanc, ombre. Stop propagation
          des clics pour ne pas fermer la modale en interagissant avec
          le viewer. */}
      <div
        className="relative w-full h-full max-w-350 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec nom de fichier + bouton close */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 shrink-0">
          <div
            className="text-sm font-medium truncate text-gray-900 flex-1"
            title={file.name}
          >
            {file.name}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Fermer (Échap)"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Zone viewer : occupe tout le reste, le PreviewRenderer en mode
            fullscreen gère lui-même son scroll/overflow interne selon le
            type de contenu. */}
        <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
          <PreviewRenderer file={file} kind={kind} variant="fullscreen" />
        </div>
      </div>
    </div>
  );
}
