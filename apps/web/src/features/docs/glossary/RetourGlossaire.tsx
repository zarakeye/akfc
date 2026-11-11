"use client"

import Link from "next/link"

import { useGlossaryOrigin } from "@features/docs/glossary/glossaryReturn"

/** Le bouton qui ramène à l'endroit exact du terme cliqué. Absent quand on arrive directement. */
export function RetourGlossaire() {
  const origin = useGlossaryOrigin()
  if (!origin) return null
  return (
    <div className="sticky top-2 z-10 mb-6 flex justify-start">
      <Link
        href={origin.href}
        className="inline-flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2 text-sm shadow-sm backdrop-blur hover:bg-muted"
      >
        <span aria-hidden>←</span>
        <span>
          Retour à <strong>{origin.label}</strong>
        </span>
      </Link>
    </div>
  )
}
