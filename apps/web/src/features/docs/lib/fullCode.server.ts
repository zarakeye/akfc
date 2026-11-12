import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest"
import { readCodeFile } from "@features/docs/lib/code.utils"
import { docExists, getDocSource } from "@features/docs/lib/docs.source"
import { spaceOf } from "@features/docs/lib/docs.spaces"
import { buildFenceIndex } from "@features/docs/lib/fenceIndex"
import { renderCodeBlockHtml } from "@features/docs/ui/CodeBlock"

/**
 * Fichier complet d'un extrait de code, rendu à la demande.
 *
 * Les pages de la doc n'embarquent que l'extrait : le fichier complet, surligné, peut peser plusieurs
 * centaines de kilo-octets, et une page qui cite vingt extraits d'un gros fichier le recopiait vingt
 * fois. Il n'est rendu que lorsque le lecteur clique sur « Voir le fichier complet ».
 *
 * Ce module n'est PAS un module "use server" : l'action (`fullCode.action.ts`) l'appelle après avoir
 * validé sa requête. Les contrôles reprennent ceux de la page : on ne rend un fichier que s'il est
 * cité par une page que l'appelant a le droit de lire.
 */

export type FullCodeKind = "example" | "fence"

export type FullCodeRequest = {
  /** Chemin de la page qui cite le fichier, tel que le navigateur l'affiche (`/docs/dev/…`). */
  pathname: string
  filepath: string
  kind: FullCodeKind
  language: string
  /** Lignes de l'extrait, encadrées dans le fichier complet. */
  scope: number[]
  /** Lignes surlignées. */
  highlight: number[]
}

export type FullCode = { html: string; code: string }

/** Le rendu ne dépend que du fichier et des lignes : en production, il est gardé en mémoire. */
const cache = new Map<string, Promise<string>>()
const CACHE_MAX = 300

function slugOf(pathname: string): string[] | null {
  if (!pathname.startsWith("/docs/")) return null
  let segments: string[]
  try {
    segments = pathname.slice("/docs/".length).split("/").filter(Boolean).map(decodeURIComponent)
  } catch {
    return null
  }
  // Mêmes refus que la page : un « .. » ou un séparateur encodé ferait sortir de l'espace.
  if (!segments.length || segments.some((s) => s.startsWith(".") || s.includes("/") || s.includes("\\"))) return null
  return segments
}

/** La page existe, l'appelant peut la lire, et elle cite ce fichier : sinon, rien. */
async function citedSource(req: FullCodeRequest): Promise<string | null> {
  const requested = slugOf(req.pathname)
  if (!requested) return null
  const space = spaceOf(requested)
  if (!space) return null
  if (space.adminOnly) {
    const session = await getSessionFromRequest().catch(() => null)
    if (!session?.user?.isAdmin) return null
  }
  const slug = docExists(requested) ? requested : [...requested, "index"]
  if (!docExists(slug)) return null
  const { source } = getDocSource(slug)

  if (req.kind === "fence") {
    return buildFenceIndex(source).files.get(req.filepath) ?? null
  }
  const quoted = new RegExp(`filepath=(["'])${req.filepath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`)
  return quoted.test(source) ? readCodeFile(req.filepath) : null
}

async function render(code: string, req: FullCodeRequest): Promise<string> {
  const options = { code, showLineNumbers: true, scopeLines: req.scope, highlightLines: req.highlight }
  try {
    return await renderCodeBlockHtml({ ...options, language: req.language })
  } catch {
    // Langage inconnu de shiki : texte brut plutôt qu'une erreur.
    return renderCodeBlockHtml({ ...options, language: "text" })
  }
}

export async function loadFullCodeFor(req: FullCodeRequest): Promise<FullCode | null> {
  const code = await citedSource(req)
  if (code === null) return null

  if (process.env.NODE_ENV !== "production") return { html: await render(code, req), code }

  const key = JSON.stringify([req.kind, req.filepath, req.language, req.scope, req.highlight, code.length])
  let html = cache.get(key)
  if (!html) {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string)
    html = render(code, req)
    cache.set(key, html)
    html.catch(() => cache.delete(key))
  }
  return { html: await html, code }
}
