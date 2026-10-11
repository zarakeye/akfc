"use client";

import type { JSX } from "react";
import { Printer } from "lucide-react";

/** Bouton « Imprimer » (impression navigateur, ou enregistrement en PDF). */
export function PrintButton(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="registre-noprint inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
    >
      <Printer className="h-4 w-4" aria-hidden /> Imprimer ou enregistrer en PDF
    </button>
  );
}
