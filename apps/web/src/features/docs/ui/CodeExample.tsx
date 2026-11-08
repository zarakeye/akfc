import { extractLines, readCodeFile, resolveSnippetBounds } from "@features/docs/lib/code.utils"
import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeExampleClient } from "./CodeExampleClient"

interface CodeExampleProps {
  filepath: string
  language?: string
  filename?: string
  snippetRange?: string
  /** Texte de la première ligne de l'extrait (voir resolveSnippetBounds). À préférer à snippetRange. */
  snippetStart?: string
  /** Texte de la dernière ligne, cherchée à partir de la première. */
  snippetEnd?: string
  /** Lignes reprises au-dessus de l'ancre de début (un commentaire qui la précède). */
  snippetLead?: string
  /** Nombre de lignes à partir de l'ancre de début, sans ancre de fin. */
  snippetLines?: string
  snippetHighlight?: string
  fullCodeHighlight?: string
  snippetTitle?: string
  fullFileTitle?: string
}


function parseHighlightLines(input?: string): number[] {
  if (!input?.trim()) return []

  const values = new Set<number>()

  for (const part of input.split(",")) {
    const token = part.trim()
    if (!token) continue

    const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/)

    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])

      for (let i = start; i <= end; i += 1) {
        values.add(i)
      }

      continue
    }

    const single = Number(token)
    if (!Number.isNaN(single)) {
      values.add(single)
    }
  }

  return [...values].sort((a, b) => a - b)
}

function rangeToLines(start?: number, end?: number): number[] {
  if (!start || !end || end < start) return []

  const lines: number[] = []

  for (let i = start; i <= end; i += 1) {
    lines.push(i)
  }

  return lines
}

function relativeToAbsoluteLines(
  relativeLines: number[],
  snippetStart?: number
): number[] {
  if (!snippetStart) return []

  return relativeLines.map((line) => snippetStart + line - 1)
}

export async function CodeExample({
  filepath,
  language = "ts",
  filename,
  snippetRange,
  snippetStart,
  snippetEnd,
  snippetLead,
  snippetLines,
  snippetHighlight,
  fullCodeHighlight,
  snippetTitle = "Focused extract",
  fullFileTitle = "Full file",
}: CodeExampleProps) {
  let source = readCodeFile(filepath)
  const bounds = resolveSnippetBounds(source, { snippetRange, snippetStart, snippetEnd, snippetLead, snippetLines })
  if (bounds.error) {
    source = `// ⚠ Extrait introuvable dans ${filepath} : ${bounds.error}\n// Le code a changé depuis la rédaction de ce chapitre.`
  }
  const { start, end } = bounds.error ? { start: 1, end: 2 } : bounds
  const snippet = extractLines(source, start, end)

  const snippetScopeLines = rangeToLines(start, end)

  // Lignes choisies dans le snippet, exprimées relativement au snippet
  const snippetHighlightRelative = parseHighlightLines(snippetHighlight)

  // Converties en lignes absolues du vrai fichier
  const snippetHighlightAbsolute = relativeToAbsoluteLines(
    snippetHighlightRelative,
    start
  )

  // Si on veut un comportement spécifique dans le fichier complet,
  // on peut encore l’écraser avec fullCodeHighlight
  const explicitFullCodeHighlight = parseHighlightLines(fullCodeHighlight)

  const fullCodeHighlightLines =
    explicitFullCodeHighlight.length > 0
      ? explicitFullCodeHighlight
      : snippetHighlightAbsolute

  const snippetHtml = await renderCodeBlockHtml({
    code: snippet,
    language,
    highlightLines: snippetHighlightAbsolute,
    scopeLines: [],
    showLineNumbers: true,
    startingLineNumber: start ?? 1,
  })

  const fullCodeHtml = await renderCodeBlockHtml({
    code: source,
    language,
    highlightLines: fullCodeHighlightLines,
    scopeLines: snippetScopeLines,
    showLineNumbers: true,
    startingLineNumber: 1,
  })

  return (
    <CodeExampleClient
      language={language}
      filename={filename}
      filepath={filepath}
      snippet={snippet}
      fullCode={source}
      snippetHtml={snippetHtml}
      fullCodeHtml={fullCodeHtml}
      snippetTitle={snippetTitle}
      fullFileTitle={fullFileTitle}
      focusStartLine={start}
      focusEndLine={end}
    />
  )
}

export default CodeExample