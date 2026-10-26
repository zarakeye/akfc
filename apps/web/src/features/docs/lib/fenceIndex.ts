import { tryReadCodeFile } from "@features/docs/lib/code.utils"
import { locateSnippet, type SnippetLocation } from "@features/docs/lib/snippetLocate"

/**
 * Index des blocs « ``` » d'une page de doc, construit à partir du source MDX avant sa
 * compilation. Chaque bloc qui cite son fichier (« // chemin (précision) » en première ligne) est
 * localisé dans ce fichier ; les blocs d'un même fichier forment une liste, que le bloc déplié
 * propose comme barre latérale pour passer d'un extrait à l'autre.
 */

export type FenceEntry = {
  path: string
  note: string | null
  language: string
  /** Code de l'extrait, sans la ligne de chemin. */
  body: string
  /** Titre de la section où figure l'extrait. */
  heading: string | null
  location: SnippetLocation
}

export type FenceIndex = {
  byBody: Map<string, FenceEntry>
  byPath: Map<string, FenceEntry[]>
  files: Map<string, string>
}

// Un chemin a une extension (`proxy.ts`), ou c'est un Dockerfile (`Dockerfile`, `apps/x/Dockerfile`).
const PATH_LINE = /^\s*(?:\/\/|#|--)\s*(\S+\.[A-Za-z0-9]+|(?:\S+\/)?Dockerfile)(?:\s+\((.+)\))?\s*$/

const LANGUAGE_ALIASES: Record<string, string> = {
  "": "text",
  text: "text",
  txt: "text",
  plaintext: "text",
  sh: "bash",
  shell: "bash",
  js: "javascript",
}

export function normalizeLanguage(raw: string | undefined): string {
  const key = (raw ?? "").toLowerCase()
  return LANGUAGE_ALIASES[key] ?? key
}

/** Sépare la ligne « // chemin (précision) » du reste du code. */
export function splitSourceLine(code: string): { path: string | null; note: string | null; body: string } {
  const lines = code.replace(/\n$/, "").split("\n")
  const match = PATH_LINE.exec(lines[0] ?? "")
  // Un fichier de la racine (`package.json`, `Dockerfile`) n'a pas de « / » : il est accepté s'il est
  // suivi d'une précision, `// package.json (extrait)`, pour ne pas prendre `// v1.2` pour un chemin.
  if (!match || (!match[1].includes("/") && !match[2])) {
    return { path: null, note: null, body: lines.join("\n") }
  }
  return { path: match[1], note: match[2] ?? null, body: lines.slice(1).join("\n") }
}

/** Seuil sous lequel un extrait est trop éloigné du fichier pour y être situé. */
const MIN_RATIO = 0.5

export function buildFenceIndex(mdxSource: string): FenceIndex {
  const index: FenceIndex = { byBody: new Map(), byPath: new Map(), files: new Map() }
  const lines = mdxSource.split("\n")
  let heading: string | null = null

  for (let i = 0; i < lines.length; i += 1) {
    const h = /^#{2,3}\s+(.+?)\s*$/.exec(lines[i])
    if (h) {
      heading = h[1]
      continue
    }
    const open = /^```([\w-]*)/.exec(lines[i])
    if (!open) continue
    const start = i + 1
    let end = start
    while (end < lines.length && !/^```\s*$/.test(lines[end])) end += 1
    const raw = lines.slice(start, end).join("\n")
    i = end

    const { path, note, body } = splitSourceLine(raw)
    if (!path) continue
    if (!index.files.has(path)) {
      const source = tryReadCodeFile(path)
      if (source === null) continue
      index.files.set(path, source)
    }
    const location = locateSnippet(index.files.get(path)!, body)
    if (location.ratio < MIN_RATIO || location.first === null) continue

    const entry: FenceEntry = { path, note, language: normalizeLanguage(open[1]), body, heading, location }
    index.byBody.set(body, entry)
    const list = index.byPath.get(path) ?? []
    list.push(entry)
    index.byPath.set(path, list)
  }
  return index
}
