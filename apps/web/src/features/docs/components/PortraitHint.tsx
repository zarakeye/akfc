"use client"

import { useState } from "react"
import { RotateCw, X } from "lucide-react"

/**
 * Téléphone en portrait : la documentation (carte des entités, parcours, chemin dans le code)
 * demande de la largeur ; elle se lit en paysage. Le bandeau le dit, sans bloquer la page : on
 * peut le fermer et lire quand même. Masqué par CSS hors du portrait (`phone-portrait:`), il
 * n'apparaît pas sur ordinateur ni en paysage.
 */
export function PortraitHint() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      role="note"
      className="hidden shrink-0 items-center gap-2 border-b bg-emerald-50 px-3 py-2 text-sm text-emerald-900 phone-portrait:flex dark:bg-emerald-950 dark:text-emerald-100"
    >
      <RotateCw className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">Cette documentation se lit en mode paysage : tournez votre téléphone.</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Fermer le bandeau"
        className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default PortraitHint
