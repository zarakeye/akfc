"use client"

import { useSyncExternalStore } from "react"

/**
 * Le state du glossaire : d'où vient le lecteur.
 *
 * Un clic sur un terme note la page et l'ancre exacte du terme cliqué ; le bouton « Retour » du
 * glossaire y ramène, sous le paragraphe qu'on lisait. Gardé pour l'onglet (sessionStorage) : il
 * survit à un rechargement et aux allers-retours entre termes du glossaire, pas à la fermeture.
 */
export interface GlossaryOrigin {
  href: string
  label: string
}

const KEY = "akfc-docs-glossaire-origine"
const EVENT = "akfc-docs-glossaire-origine"

function read(): string | null {
  try {
    return window.sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function saveGlossaryOrigin(origin: GlossaryOrigin) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(origin))
  } catch {
    // Stockage refusé (navigation privée stricte) : le retour du navigateur reste disponible.
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function parse(raw: string | null): GlossaryOrigin | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<GlossaryOrigin>
    return typeof value.href === "string" && typeof value.label === "string" ? { href: value.href, label: value.label } : null
  } catch {
    return null
  }
}

/** L'origine enregistrée, ou null (et null pendant le rendu serveur). */
export function useGlossaryOrigin(): GlossaryOrigin | null {
  const raw = useSyncExternalStore(subscribe, read, () => null)
  return parse(raw)
}

/** Note la position du terme cliqué, sauf depuis le glossaire lui-même (on y circule). */
export function rememberTermOrigin(anchor: string, glossaryPath: string) {
  if (window.location.pathname === glossaryPath) return
  const label = document.querySelector("[data-doc-label]")?.getAttribute("data-doc-label") ?? document.title
  saveGlossaryOrigin({ href: `${window.location.pathname}#${anchor}`, label })
}
