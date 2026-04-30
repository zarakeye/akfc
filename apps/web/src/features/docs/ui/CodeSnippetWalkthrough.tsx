import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeWalkthroughClient } from "@features/docs/ui/CodeWalktroughClient"
import { parseMdxJsonString } from "@features/docs/lib/parseMdxJsonString"

type CodeSnippetWalkthroughKind = "educational" | "pattern" | "anti-pattern"

interface WalkthroughStep {
  title: string
  body: string
  scope: string
  focus?: string
}

interface CodeSnippetWalkthroughProps {
  codeJson?: string
  language?: string
  filename?: string
  title?: string
  stepsJson?: string
  kind?: CodeSnippetWalkthroughKind
  startingLineNumber?: number
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

function getKindLabel(kind: CodeSnippetWalkthroughKind): string {
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

function getLastLineNumber(code: string, startingLineNumber: number): number {
  const lineCount = code.split("\n").length
  return startingLineNumber + lineCount - 1
}

export async function CodeSnippetWalkthrough({
  codeJson,
  language = "ts",
  filename = "demo.ts",
  title = "Snippet walkthrough",
  stepsJson,
  kind = "educational",
  startingLineNumber = 1,
}: CodeSnippetWalkthroughProps) {
  const code = parseMdxJsonString(codeJson)
  const steps = parseStepsJson(stepsJson)

  if (!code.trim()) {
    return <div className="text-red-500">CodeSnippetWalkthrough: empty code</div>
  }

  if (!steps.length) {
    return <div className="text-red-500">CodeSnippetWalkthrough: empty steps</div>
  }

  const htmlByStep = await Promise.all(
    steps.map(async (step) => {
      const absoluteScopeLines = toAbsoluteLines(step.scope, startingLineNumber)
      const absoluteFocusLines =
        step.focus?.trim()
          ? toAbsoluteLines(step.focus, startingLineNumber)
          : absoluteScopeLines

      return renderCodeBlockHtml({
        code,
        language,
        scopeLines: absoluteScopeLines,
        highlightLines: absoluteFocusLines,
        showLineNumbers: true,
        startingLineNumber,
      })
    })
  )

  const defaultHtml = await renderCodeBlockHtml({
    code,
    language,
    scopeLines: [],
    highlightLines: [],
    showLineNumbers: true,
    startingLineNumber,
  })

  return (
    <CodeWalkthroughClient
      language={language}
      filename={filename}
      filepath={getKindLabel(kind)}
      code={code}
      title={title}
      htmlByStep={htmlByStep}
      defaultHtml={defaultHtml}
      steps={steps}
      focusStartLine={startingLineNumber}
      focusEndLine={getLastLineNumber(code, startingLineNumber)}
    />
  )
}

export default CodeSnippetWalkthrough
