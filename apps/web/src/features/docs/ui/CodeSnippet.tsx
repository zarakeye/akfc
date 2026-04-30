import { use } from "react"

import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeBlockFrame } from "./CodeBlockFrame"
import { parseMdxJsonString } from "@features/docs/lib/parseMdxJsonString"

type CodeSnippetKind = "educational" | "pattern" | "anti-pattern"

interface CodeSnippetProps {
  codeJson?: string
  language?: string
  title?: string
  filename?: string
  highlightLines?: string
  scopeLines?: string
  showLineNumbers?: boolean
  startingLineNumber?: number
  kind?: CodeSnippetKind
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

function getKindLabel(kind: CodeSnippetKind): string {
  switch (kind) {
    case "pattern":
      return "Pattern recommandé"
    case "anti-pattern":
      return "Anti-pattern"
    case "educational":
    default:
      return "Exemple pédagogique"
  }
}

function getKindClasses(kind: CodeSnippetKind): string {
  switch (kind) {
    case "pattern":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    case "anti-pattern":
      return "border-rose-400/30 bg-rose-400/10 text-rose-200"
    case "educational":
    default:
      return "border-amber-400/30 bg-amber-400/10 text-amber-200"
  }
}

export default function CodeSnippet({
  codeJson,
  language = "ts",
  title = "Educational snippet",
  filename,
  highlightLines,
  scopeLines,
  showLineNumbers = true,
  startingLineNumber = 1,
  kind = "educational",
}: CodeSnippetProps) {
  const code = parseMdxJsonString(codeJson)

  if (!code.trim()) {
    return (
      <div className="my-6 text-sm text-red-400">
        CodeSnippet: empty code block
      </div>
    )
  }

  const html = use(
    renderCodeBlockHtml({
      code,
      language,
      highlightLines: parseLineExpression(highlightLines),
      scopeLines: parseLineExpression(scopeLines),
      showLineNumbers,
      startingLineNumber,
    })
  )

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
            {filename ? <span>{filename}</span> : null}
            <span>{language}</span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getKindClasses(
            kind
          )}`}
        >
          {getKindLabel(kind)}
        </span>
      </div>

      <CodeBlockFrame html={html} />
    </div>
  )
}