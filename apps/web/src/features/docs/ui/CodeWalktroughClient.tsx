"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Clipboard, Check, Expand, Shrink } from "lucide-react"

import FileIcon from "./FileIcon"
import CodePath from "./CodePath"
import { CodeBlockFrame } from "./CodeBlockFrame"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"

interface WalkthroughStep {
  title: string
  body: string
  scope: string
  focus?: string
}

interface CodeWalkthroughClientProps {
  language?: string
  filename?: string
  filepath: string
  code: string
  title?: string
  htmlByStep: string[]
  defaultHtml: string
  steps: WalkthroughStep[]
  focusStartLine?: number
  focusEndLine?: number
}

function formatLanguage(language?: string): string {
  if (!language) return "TEXT"
  return language.toUpperCase()
}

function parseLineExpression(expr?: string): number[] {
  if (!expr?.trim()) return []

  const values = new Set<number>()

  for (const rawPart of expr.split(",")) {
    const part = rawPart.trim()
    if (!part) continue

    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)

    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])

      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        for (let i = start; i <= end; i += 1) {
          values.add(i)
        }
      }

      continue
    }

    const single = Number(part)
    if (Number.isFinite(single)) {
      values.add(single)
    }
  }

  return [...values].sort((a, b) => a - b)
}

function formatFocusLabel(expr?: string): string | null {
  const lines = parseLineExpression(expr)

  if (!lines.length) return null
  if (lines.length === 1) return `focus line ${lines[0]}`

  const isContiguous = lines.every((line, index) =>
    index === 0 ? true : line === lines[index - 1] + 1
  )

  if (isContiguous) {
    return `focus lines ${lines[0]}-${lines[lines.length - 1]}`
  }

  return `focus lines ${lines.join(", ")}`
}

export function CodeWalkthroughClient({
  language = "ts",
  filename,
  filepath,
  code,
  title = "Code walkthrough",
  htmlByStep,
  defaultHtml,
  steps,
  focusStartLine,
  focusEndLine,
}: CodeWalkthroughClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const codeScrollRef = useRef<HTMLDivElement>(null)

  const activeStep = steps[activeIndex]

  useEffect(() => {
    const target =
      codeScrollRef.current?.querySelector(".highlight-line") ??
      codeScrollRef.current?.querySelector(".snippet-scope-line")

    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        block: "center",
        behavior: "smooth",
      })
    }
  }, [activeIndex])

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  const focusLabel = useMemo(() => {
    return formatFocusLabel(activeStep?.focus ?? activeStep?.scope)
  }, [activeStep])

  const guidedExtractLabel = useMemo(() => {
    if (!focusStartLine || !focusEndLine) return null
    return `guided extract: lines ${focusStartLine}-${focusEndLine}`
  }, [focusStartLine, focusEndLine])

  const currentHtml = htmlByStep[activeIndex] ?? defaultHtml

  return (
    <TooltipProvider delayDuration={200}>
      <section className="my-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Clique une étape pour mettre en évidence la zone correspondante dans
            le fichier complet.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-xl border bg-card">
            <div className="max-h-[70vh] overflow-auto p-3">
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={`${step.title}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      index === activeIndex
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {index + 1}. {step.title}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.body}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-sm">
            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#12141a]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#12141a]/80">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">
                    {activeStep?.title ?? title}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    {isExpanded ? <Shrink size={12} /> : <Expand size={12} />}
                    {isExpanded ? "Vue normale" : "Vue étendue"}
                  </button>

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
                      {copied ? "Copied!" : "Copy full file"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <FileIcon language={language} filepath={filepath} />
                  <CodePath filepath={filepath} />
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-white/45">
                  {guidedExtractLabel ? <span>{guidedExtractLabel}</span> : null}
                  {focusLabel ? <span>{focusLabel}</span> : null}
                </div>
              </div>
            </div>

            <div
              ref={codeScrollRef}
              className={`overflow-auto bg-[#12141a] ${
                isExpanded ? "max-h-[85vh]" : "max-h-[70vh]"
              }`}
            >
              <CodeBlockFrame html={currentHtml} />
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}

export default CodeWalkthroughClient