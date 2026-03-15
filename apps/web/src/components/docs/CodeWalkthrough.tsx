import { extractLines, readCodeFile } from "@/lib/docs/code.utils"
import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeWalkthroughClient } from "@/components/docs/CodeWalktroughClient"

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

function toAbsoluteLines(expr: string | undefined, baseLine: number): number[] {
  const relativeLines = parseLineExpression(expr)
  return relativeLines.map((line) => baseLine + line - 1)
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
  const code = extractLines(source, start, end)
  const baseLine = start ?? 1

  const htmlByStep = await Promise.all(
    steps.map(async (step) => {
      const absoluteScopeLines = toAbsoluteLines(step.scope, baseLine)
      const absoluteFocusLines = toAbsoluteLines(step.focus, baseLine)

      return renderCodeBlockHtml({
        code,
        language,
        scopeLines: absoluteScopeLines,
        highlightLines: absoluteFocusLines,
        showLineNumbers: true,
        startingLineNumber: baseLine,
      })
    })
  )

  return (
    <CodeWalkthroughClient
      language={language}
      filename={filename}
      filepath={filepath}
      code={code}
      title={title}
      htmlByStep={htmlByStep}
      steps={steps}
    />
  )
}

export default CodeWalkthrough