import { isValidElement, type ReactNode } from "react"

import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeBlockFrame } from "./CodeBlockFrame"
import { CodeHeader } from "./CodeHeader"
import { CodeFenceClient, type FenceSibling } from "./CodeFenceClient"
import { normalizeLanguage, splitSourceLine, type FenceIndex } from "@features/docs/lib/fenceIndex"

/**
 * Rendu des blocs « ``` » des pages MDX.
 *
 * Les extraits de la doc commencent par une ligne de commentaire qui cite leur fichier :
 *   // apps/web/src/proxy.ts (extrait)
 * Cette ligne devient l'en-tête du bloc. Quand l'extrait a pu être situé dans son fichier
 * (`buildFenceIndex`, calculé par la page avant la compilation MDX), le bloc affiche les numéros
 * de ligne RÉELS et propose de déplier le fichier complet, avec navigation entre les extraits du
 * même fichier cités dans la page. Sinon (fichier absent, extrait trop réécrit), il s'affiche
 * simplement coloré, avec son chemin.
 */

function textOf(node: ReactNode): string {
  if (typeof node === "string") return node
  if (typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

function languageOf(node: ReactNode): string {
  if (!isValidElement<{ className?: string }>(node)) return "text"
  const match = /language-([\w-]+)/.exec(node.props.className ?? "")
  return normalizeLanguage(match?.[1])
}

async function highlight(code: string, language: string, opts: { numbers: boolean; scope?: number[] }): Promise<string> {
  try {
    return await renderCodeBlockHtml({ code, language, showLineNumbers: opts.numbers, scopeLines: opts.scope ?? [] })
  } catch {
    // Langage inconnu de shiki : texte brut plutôt qu'une page en erreur.
    return renderCodeBlockHtml({ code, language: "text", showLineNumbers: opts.numbers, scopeLines: opts.scope ?? [] })
  }
}

/** Première ligne de code qui dit quelque chose (ni vide, ni accolade, ni commentaire). */
function firstMeaningfulLine(code: string): string {
  const line = code
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 3 && !/^(\/\/|\/\*|\*|#|--)/.test(l) && !/^[{}()[\];,]+$/.test(l))
  return line ?? ""
}

/** Remplace la numérotation séquentielle de l'extrait par les numéros de ligne du fichier. */
function applyLineMap(html: string, lineMap: (number | null)[]): string {
  return html.replace(/data-line="(\d+)"/g, (_m, n: string) => {
    const real = lineMap[Number(n) - 1]
    return `data-line="${real ?? ""}"`
  })
}

/** Fichier complet surligné une seule fois par page et par fichier. */
const fullHtmlCache = new WeakMap<FenceIndex, Map<string, Promise<string>>>()

function fullHtmlFor(index: FenceIndex, path: string, language: string): Promise<string> {
  let perIndex = fullHtmlCache.get(index)
  if (!perIndex) {
    perIndex = new Map()
    fullHtmlCache.set(index, perIndex)
  }
  let html = perIndex.get(path)
  if (!html) {
    const scope = [...new Set((index.byPath.get(path) ?? []).flatMap((e) => e.location.lines))]
    html = highlight(index.files.get(path) ?? "", language, { numbers: true, scope })
    perIndex.set(path, html)
  }
  return html
}

export async function MdxCodeFence({ children, index }: { children?: ReactNode; index?: FenceIndex }) {
  const child = Array.isArray(children) ? children[0] : children
  const language = languageOf(child)
  const { path, note, body } = splitSourceLine(textOf(child))
  const entry = path && index ? index.byBody.get(body) : undefined

  if (entry && index && path) {
    const siblingsEntries = index.byPath.get(path) ?? [entry]
    const siblings: FenceSibling[] = siblingsEntries.map((e) => ({
      label: e.heading,
      hint: firstMeaningfulLine(e.body),
      lines: e.location.lines,
      first: e.location.first ?? 1,
      last: e.location.last ?? 1,
    }))
    const [snippetRaw, fullHtml] = await Promise.all([
      highlight(body, language, { numbers: true }),
      fullHtmlFor(index, path, language),
    ])
    return (
      <CodeFenceClient
        path={path}
        note={note}
        language={language}
        snippet={body}
        fullCode={index.files.get(path) ?? ""}
        snippetHtml={applyLineMap(snippetRaw, entry.location.lineMap)}
        fullHtml={fullHtml}
        siblings={siblings}
        selfIndex={Math.max(0, siblingsEntries.indexOf(entry))}
      />
    )
  }

  const html = await highlight(body, language, { numbers: false })
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-sm [&_.line]:pl-4">
      {path ? (
        <CodeHeader
          filepath={note ? `${path} · ${note}` : path}
          language={language === "text" ? undefined : language}
          code={body}
        />
      ) : null}
      <CodeBlockFrame html={html} />
    </div>
  )
}

export default MdxCodeFence
