"use client"

import { useCallback, useState } from "react"
import { usePathname } from "next/navigation"

import { loadFullCode } from "@features/docs/lib/fullCode.action"
import type { FullCode, FullCodeKind } from "@features/docs/lib/fullCode.server"

/** Une même page peut citer plusieurs fois un fichier : une seule requête par fichier et par rendu. */
const requests = new Map<string, Promise<FullCode | null>>()

type Options = {
  filepath: string
  kind: FullCodeKind
  language: string
  scope: number[]
  highlight: number[]
}

export type FullCodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; full: FullCode }
  | { status: "error" }

/**
 * Fichier complet d'un extrait, demandé au serveur au premier clic sur « Voir le fichier complet ».
 * `load` peut être appelé plusieurs fois : la réponse est gardée pour la durée de la visite.
 */
export function useFullCode(options: Options) {
  const pathname = usePathname()
  const [state, setState] = useState<FullCodeState>({ status: "idle" })
  const { filepath, kind, language, scope, highlight } = options

  const load = useCallback(() => {
    if (state.status === "loading" || state.status === "ready") return
    const request = { pathname, filepath, kind, language, scope, highlight }
    const key = JSON.stringify(request)
    let pending = requests.get(key)
    if (!pending) {
      pending = loadFullCode(request).catch(() => null)
      requests.set(key, pending)
    }
    setState({ status: "loading" })
    pending.then((full) => {
      if (!full) requests.delete(key)
      setState(full ? { status: "ready", full } : { status: "error" })
    })
  }, [state.status, pathname, filepath, kind, language, scope, highlight])

  return { state, load }
}
