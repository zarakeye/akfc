'use client';

import { JSX } from 'react';

type Props = {
  show: boolean;
  label?: string;
};

/**
 * Overlay global de chargement
 * - Bloque les clics pendant les opérations (DnD, Valider, Vider la corbeille)
 */
export default function LoadingOverlay({
  show,
  label = 'Opération en cours…',
}: Props): JSX.Element | null {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 pointer-events-auto">
      <div className="rounded-lg bg-white px-5 py-4 shadow-lg flex items-center gap-3">
        {/* Spinner simple Tailwind */}
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
        <div className="text-sm text-gray-800">{label}</div>
      </div>
    </div>
  );
}