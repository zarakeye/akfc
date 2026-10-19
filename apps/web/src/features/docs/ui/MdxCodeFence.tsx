import { isValidElement, type ReactNode } from "react"

import { renderCodeBlockHtml } from "./CodeBlock"
import { CodeBlockFrame } from "./CodeBlockFrame"
import { CodeHeader } from "./CodeHeader"

/**
 * Rendu des blocs de code « ``` » des pages MDX : coloration syntaxique (shiki, même rendu que
 * CodeExample) et chemin du fichier d'origine AU-DESSUS du bloc.
 *
 * Les extraits de la doc commencent par une ligne de commentaire qui cite leur fichier :
 *   // apps/web/src/proxy.ts (extrait)
 *   -- prisma/migrations/…/migration.sql (extrait)
 * Cette ligne est retirée du code et affichée dans l'en-tête (chemin + précision entre
 * parenthèses). Un bloc sans ce commentaire s'affiche sans en-tête.
 */

/** Langages annoncés dans la doc → identifiant shiki. */
const LANGUAGE_ALIASES: Record<string, string> = {
  text: "text",
  txt: "text",
  plaintext: "text",
  sh: "bash",
  shell: "bash",
  js: "javascript",
}

const PATH_LINE = /^\s*(?:\/\/|#|--)\s*(\S+\.[A-Za-z0-9]+)(?:\s+\((.+)\))?\s*$/

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
  const raw = match?.[1]?.toLowerCase() ?? "text"
  return LANGUAGE_ALIASES[raw] ?? raw
}

/** Sépare la ligne « // chemin (précision) » du reste du code. */
export function splitSourceLine(code: string): { path: string | null; note: string | null; body: string } {
  const lines = code.replace(/\n$/, "").split("\n")
  const match = PATH_LINE.exec(lines[0] ?? "")
  if (!match || !match[1].includes("/") && !match[1].includes(".")) {
    return { path: null, note: null, body: lines.join("\n") }
  }
  return { path: match[1], note: match[2] ?? null, body: lines.slice(1).join("\n") }
}

export async function MdxCodeFence({ children }: { children?: ReactNode }) {
  const child = Array.isArray(children) ? children[0] : children
  const language = languageOf(child)
  const { path, note, body } = splitSourceLine(textOf(child))

  let html: string
  try {
    html = await renderCodeBlockHtml({ code: body, language, showLineNumbers: false })
  } catch {
    // Langage inconnu de shiki : texte brut plutôt qu'une page en erreur.
    html = await renderCodeBlockHtml({ code: body, language: "text", showLineNumbers: false })
  }

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
