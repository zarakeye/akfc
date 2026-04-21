import { codeToHtml } from "shiki"
import { CodeBlockFrame } from "./CodeBlockFrame"

interface CodeBlockProps {
  code: string
  language?: string
  highlightLines?: number[]
  scopeLines?: number[]
  showLineNumbers?: boolean
  startingLineNumber?: number
}

function decorateShikiHtml(
  html: string,
  highlightLines: number[],
  scopeLines: number[],
  showLineNumbers: boolean,
  startingLineNumber: number
): string {
  let lineIndex = 0

  return html.replace(/<span class="line"(.*?)>/g, (_match, attrs) => {
    const lineNumber = startingLineNumber + lineIndex
    lineIndex += 1

    const isScoped = scopeLines.includes(lineNumber)
    const isHighlighted = highlightLines.includes(lineNumber)

    const classes = ["line"]

    if (showLineNumbers) {
      classes.push("code-line-numbered")
    }

    if (isScoped) {
      classes.push("snippet-scope-line")
    }

    if (isHighlighted) {
      classes.push("highlight-line")
    }

    if (isScoped && isHighlighted) {
      classes.push("snippet-focus-line")
    }

    return `<span class="${classes.join(" ")}"${attrs} data-line="${lineNumber}">`
  })
}

function patchPreTag(html: string): string {
  return html.replace(
    /<pre class="shiki/g,
    '<pre class="shiki codeblock-pre scrollbar-hidden'
  )
}

function stripShikiLineBreakArtifacts(html: string): string {
  return html
    .replace(/\n(?=<span class="line")/g, "")
    .replace(/<\/span>\n(?=<\/code>)/g, "</span>")
}

export async function renderCodeBlockHtml({
  code,
  language = "ts",
  highlightLines = [],
  scopeLines = [],
  showLineNumbers = true,
  startingLineNumber = 1,
}: {
  code: string
  language?: string
  highlightLines?: number[]
  scopeLines?: number[]
  showLineNumbers?: boolean
  startingLineNumber?: number
}) {
  if (!code || !code.trim()) {
    return `<div class="px-4 py-4 text-sm text-white/45">empty code block</div>`
  }

  let html = await codeToHtml(code, {
    lang: language,
    theme: "vitesse-dark",
  })

  html = patchPreTag(html)
  html = stripShikiLineBreakArtifacts(html)
  html = decorateShikiHtml(
    html,
    highlightLines,
    scopeLines,
    showLineNumbers,
    startingLineNumber
  )

  return html
}

export async function CodeBlock({
  code,
  language = "ts",
  highlightLines = [],
  scopeLines = [],
  showLineNumbers = true,
  startingLineNumber = 1,
}: CodeBlockProps) {
  const html = await renderCodeBlockHtml({
    code,
    language,
    highlightLines,
    scopeLines,
    showLineNumbers,
    startingLineNumber,
  })

  return <CodeBlockFrame html={html} />
}

export default CodeBlock