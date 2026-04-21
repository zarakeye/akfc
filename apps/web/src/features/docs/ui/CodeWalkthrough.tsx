import { readCodeFile } from "@/features/docs/lib/code.utils"
import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeWalkthroughClient } from "@/features/docs/ui/CodeWalktroughClient"

interface WalkthroughStep {
  title: string
  body: string
  scope: string
  focus?: string
}

interface CodeWalkthroughProps {
  filepath: string
  language?: string
  filename?: string
  snippetRange?: string
  title?: string
  stepsJson?: string
}

function parseRange(range?: string): { start?: number; end?: number } {
  if (!range?.trim()) return {}

  const match = range.trim().match(/^(\d+)\s*-\s*(\d+)$/)
  if (!match) return {}

  return {
    start: Number(match[1]),
    end: Number(match[2]),
  }
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

function parseStepsJson(stepsJson?: string): WalkthroughStep[] {
  if (!stepsJson?.trim()) return []

  try {
    const parsed = JSON.parse(stepsJson) as unknown

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (step): step is WalkthroughStep =>
        !!step &&
        typeof step === "object" &&
        typeof (step as WalkthroughStep).title === "string" &&
        typeof (step as WalkthroughStep).body === "string" &&
        typeof (step as WalkthroughStep).scope === "string" &&
        (typeof (step as WalkthroughStep).focus === "string" ||
          typeof (step as WalkthroughStep).focus === "undefined")
    )
  } catch {
    return []
  }
}

function toAbsoluteLines(
  expr: string | undefined,
  snippetStart?: number
): number[] {
  const lines = parseLineExpression(expr)

  if (!snippetStart) {
    return lines
  }

  return lines.map((line) => snippetStart + line - 1)
}

function rangeToLines(start?: number, end?: number): number[] {
  if (!start || !end || end < start) return []

  const lines: number[] = []

  for (let i = start; i <= end; i += 1) {
    lines.push(i)
  }

  return lines
}

export async function CodeWalkthrough({
  filepath,
  language = "ts",
  filename,
  snippetRange,
  title = "Code walkthrough",
  stepsJson,
}: CodeWalkthroughProps) {
  const steps = parseStepsJson(stepsJson)

  if (!steps.length) {
    return null
  }

  const source = readCodeFile(filepath)
  const { start, end } = parseRange(snippetRange)

  const htmlByStep = await Promise.all(
    steps.map(async (step) => {
      const absoluteScopeLines = toAbsoluteLines(step.scope, start)
      const absoluteFocusLines = toAbsoluteLines(step.focus, start)

      return renderCodeBlockHtml({
        code: source,
        language,
        scopeLines: absoluteScopeLines,
        highlightLines: absoluteFocusLines,
        showLineNumbers: true,
        startingLineNumber: 1,
      })
    })
  )

  const defaultScopeLines = rangeToLines(start, end)

  const defaultHtml = await renderCodeBlockHtml({
    code: source,
    language,
    scopeLines: defaultScopeLines,
    highlightLines: [],
    showLineNumbers: true,
    startingLineNumber: 1,
  })

  return (
    <CodeWalkthroughClient
      language={language}
      filename={filename}
      filepath={filepath}
      code={source}
      title={title}
      htmlByStep={htmlByStep}
      defaultHtml={defaultHtml}
      steps={steps}
      focusStartLine={start}
      focusEndLine={end}
    />
  )
}

export default CodeWalkthrough