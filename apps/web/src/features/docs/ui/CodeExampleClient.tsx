"use client"

import { useEffect, useRef, useState } from "react"
import { Clipboard, Check } from "lucide-react"

import FileIcon from "./FileIcon"
import CodePath from "./CodePath"
import { CodeBlockFrame } from "./CodeBlockFrame"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"

interface CodeExampleClientProps {
  language?: string
  filename?: string
  filepath: string
  snippet: string
  fullCode: string
  snippetHtml: string
  fullCodeHtml: string
  snippetTitle?: string
  fullFileTitle?: string
  focusStartLine?: number
  focusEndLine?: number
}

function formatLanguage(language?: string): string {
  if (!language) return "TEXT"
  return language.toUpperCase()
}

function formatFocusLines(start?: number, end?: number): string | null {
  if (!start || !end) return null
  if (start === end) return `focus line ${start}`
  return `focus lines ${start}-${end}`
}

export function CodeExampleClient({
  language = "ts",
  filename,
  filepath,
  snippet,
  fullCode,
  snippetHtml,
  fullCodeHtml,
  snippetTitle = "Focused extract",
  fullFileTitle = "Full file",
  focusStartLine,
  focusEndLine,
}: CodeExampleClientProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const codeScrollRef = useRef<HTMLDivElement>(null)

  const displayedCode = expanded ? fullCode : snippet
  const focusLabel = formatFocusLines(focusStartLine, focusEndLine)

  useEffect(() => {
    if (!expanded) return

    const target =
      codeScrollRef.current?.querySelector(".highlight-line") ??
      codeScrollRef.current?.querySelector(".snippet-scope-line")

    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        block: "center",
        behavior: "smooth",
      })
    }
  }, [expanded])

  async function handleCopy() {
    await navigator.clipboard.writeText(displayedCode)

    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="my-8 overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-sm">
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#12141a]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#12141a]/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">
                {snippetTitle}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium tracking-wide text-white/70">
                {formatLanguage(language)}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Clipboard size={14} />
                    )}
                  </button>
                </TooltipTrigger>

                <TooltipContent side="bottom">
                  {copied ? "Copied!" : "Copy"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <FileIcon language={language} filepath={filepath} />
              <CodePath filepath={filepath} />
            </div>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 transition hover:bg-white/[0.07] hover:text-white"
            >
              {expanded ? "Revenir à l’extrait" : "Voir le fichier complet"}
            </button>
          </div>

          {expanded && focusLabel ? (
            <div className="mt-2 text-xs text-white/45">{focusLabel}</div>
          ) : null}
        </div>

        <div ref={codeScrollRef} className="max-h-[70vh] overflow-auto">
          {expanded ? (
            <CodeBlockFrame html={fullCodeHtml} />
          ) : (
            <CodeBlockFrame html={snippetHtml} />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default CodeExampleClient