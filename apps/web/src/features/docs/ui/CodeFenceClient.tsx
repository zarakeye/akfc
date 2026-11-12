"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Clipboard } from "lucide-react"

import FileIcon from "./FileIcon"
import CodePath from "./CodePath"
import { CodeBlockFrame } from "./CodeBlockFrame"
import { useFullCode } from "./useFullCode"

export type FenceSibling = {
  /** Titre de la section où figure l'extrait. */
  label: string | null
  /** Première ligne significative du code, pour distinguer deux extraits d'une même section. */
  hint: string
  /** Lignes du fichier couvertes par l'extrait. */
  lines: number[]
  first: number
  last: number
}

interface CodeFenceClientProps {
  path: string
  note: string | null
  language: string
  snippet: string
  snippetHtml: string
  /** Lignes du fichier citées par la page, encadrées dans le fichier complet. */
  fullScope: number[]
  siblings: FenceSibling[]
  /** Position de CET extrait dans `siblings`. */
  selfIndex: number
}

/** Aucune ligne surlignée par le serveur : l'extrait actif l'est dans le navigateur. */
const NO_LINES: number[] = []

function linesLabel(s: FenceSibling): string {
  return s.first === s.last ? `ligne ${s.first}` : `lignes ${s.first}–${s.last}`
}

/**
 * Extrait de code d'une page de doc, situé dans son fichier : numéros de ligne réels, bouton pour
 * déplier le fichier complet (les extraits de la page restent surlignés), et, quand la page cite
 * plusieurs extraits du même fichier, une barre latérale pour passer de l'un à l'autre.
 */
export function CodeFenceClient({
  path,
  note,
  language,
  snippet,
  snippetHtml,
  fullScope,
  siblings,
  selfIndex,
}: CodeFenceClientProps) {
  const [expanded, setExpanded] = useState(false)
  const [active, setActive] = useState(selfIndex)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { state: full, load } = useFullCode({ filepath: path, kind: "fence", language, scope: fullScope, highlight: NO_LINES })
  const fullReady = full.status === "ready" ? full.full : null

  // Fichier déplié : surligne l'extrait actif et l'amène au centre de la zone de code.
  useEffect(() => {
    const box = scrollRef.current
    if (!expanded || !box || !fullReady) return
    const wanted = new Set((siblings[active]?.lines ?? []).map(String))
    let first: HTMLElement | null = null
    box.querySelectorAll<HTMLElement>(".line[data-line]").forEach((el) => {
      const on = wanted.has(el.dataset.line ?? "")
      el.classList.toggle("highlight-line", on)
      if (on && !first) first = el
    })
    const target = first as HTMLElement | null
    if (target) {
      box.scrollTo({ top: Math.max(0, target.offsetTop - box.clientHeight / 3), behavior: "smooth" })
    }
  }, [expanded, active, siblings, fullReady])

  async function handleCopy() {
    await navigator.clipboard.writeText(expanded && fullReady ? fullReady.code : snippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const showAside = expanded && siblings.length > 1

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-sm">
      <div className="border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <FileIcon language={language} filepath={path} />
            <CodePath filepath={path} />
            {note ? <span className="shrink-0 text-xs text-white/40">· {note}</span> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!expanded) load()
                setExpanded((v) => !v)
                setActive(selfIndex)
              }}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 transition hover:bg-white/[0.07] hover:text-white"
            >
              {expanded ? "Revenir à l’extrait" : "Voir le fichier complet"}
            </button>
            {language !== "text" ? (
              <span className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70 sm:inline">
                {language}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={expanded ? "Copier le fichier" : "Copier l’extrait"}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.07] hover:text-white"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Clipboard size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className={showAside ? "grid md:grid-cols-[220px_minmax(0,1fr)]" : ""}>
        {showAside ? (
          <nav
            aria-label="Extraits de ce fichier dans la page"
            className="max-h-[30vh] overflow-auto border-b border-white/10 p-2 md:max-h-[70vh] md:border-r md:border-b-0"
          >
            <p className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-wide text-white/40">
              Extraits de ce fichier
            </p>
            {siblings.map((s, i) => (
              <button
                key={`${s.first}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-xs transition ${
                  i === active
                    ? "bg-sky-400/15 text-white"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="block font-medium">
                  {i + 1}. {s.label ?? "Extrait"}
                  {i === selfIndex ? <span className="ml-1 text-white/40">(ici)</span> : null}
                </span>
                <code className="block truncate text-[11px] text-white/50 [font-family:var(--font-geist-mono),monospace]">{s.hint}</code>
                <span className="block text-white/40">{linesLabel(s)}</span>
              </button>
            ))}
          </nav>
        ) : null}

        <div ref={scrollRef} className={`relative overflow-auto ${expanded ? "max-h-[70vh]" : ""}`}>
          {!expanded ? (
            <CodeBlockFrame html={snippetHtml} />
          ) : fullReady ? (
            <CodeBlockFrame html={fullReady.html} />
          ) : (
            <div className="px-4 py-4 text-sm text-white/45" role="status">
              {full.status === "error" ? "Le fichier complet n’a pas pu être chargé." : "Chargement du fichier…"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeFenceClient
