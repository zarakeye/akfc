import fs from "node:fs"
import path from "node:path"

/** Racine du dépôt : le premier dossier parent qui contient pnpm-workspace.yaml. */
function repoRoot(): string | null {
  let dir = process.cwd()
  for (let i = 0; i < 6; i += 1) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

/**
 * Les chemins cités dans la doc partent de la racine du dépôt (`apps/web/…`, `package.json`). On
 * les cherche donc d'abord là : sinon `package.json`, lu depuis apps/web où tourne Next, désignerait
 * celui de apps/web au lieu de celui de la racine.
 */
function resolveProjectPath(filepath: string): string | null {
  const cwd = process.cwd()
  const root = repoRoot()

  const candidates = [
    ...(root ? [path.join(root, filepath)] : []),
    path.join(cwd, filepath),
    path.join(cwd, "..", filepath),
    path.join(cwd, "..", "..", filepath),
  ]

  const found = candidates.find((candidate) => fs.existsSync(candidate))

  return found ?? null
}

/**
 * Lit un fichier du dépôt pour l'afficher dans la doc. Un fichier déplacé ou supprimé depuis la
 * rédaction d'un chapitre ne fait plus planter la page : l'extrait affiche un avertissement à la
 * place du code.
 */
/** Contenu d'un fichier du dépôt, ou null s'il n'existe pas (sans avertissement). */
export function tryReadCodeFile(filepath: string): string | null {
  const found = resolveProjectPath(filepath)
  return found ? fs.readFileSync(found, "utf8") : null
}

export function readCodeFile(filepath: string): string {
  const found = resolveProjectPath(filepath)
  if (!found) {
    return `// ⚠ Fichier introuvable : ${filepath}\n// Il a été déplacé ou supprimé depuis la rédaction de ce chapitre.`
  }
  return fs.readFileSync(found, "utf8")
}

export function extractLines(
  source: string,
  start?: number,
  end?: number
): string {
  const lines = source.split("\n")

  if (!start && !end) {
    return source
  }

  const from = start ? start - 1 : 0
  const to = end ?? lines.length

  return lines.slice(from, to).join("\n")
}
/**
 * Où commence et où finit un extrait. Deux façons de le dire :
 *
 * - `snippetStart` / `snippetEnd` (à préférer) : le TEXTE de la première ligne, puis celui de la
 *   dernière, cherchée à partir de la première. L'extrait suit le code quand des lignes s'ajoutent
 *   au-dessus ou dedans. Le texte de départ doit être unique dans le fichier (contrôlé par
 *   scripts/check-doc-snippets.mjs) ; une ligne de fin qui se répète (« } ») est prise à sa
 *   première occurrence après le début, en tenant compte de l'indentation écrite dans l'ancre.
 * - `snippetRange` (« 12-30 ») : des numéros de ligne, qui dérivent dès que le fichier change.
 *
 * `snippetLines` (sans `snippetEnd`) : nombre de lignes à partir de l'ancre, quand la dernière ligne
 * n'a rien d'unique (une accolade au milieu d'une fonction).
 * `snippetLead` : lignes reprises AU-DESSUS de l'ancre de début (un commentaire « /** » qui précède la
 * déclaration ancrée). `snippetEnd="(fin du bloc)"` : jusqu'à la ligne qui referme la première
 * accolade, parenthèse ou crochet ouvert à partir de l'ancre (une fonction, un modèle Prisma).
 *
 * Une ancre se compare au DÉBUT de la ligne : sans espace initial, indentation ignorée ; avec des
 * espaces initiaux, indentation comprise ; « ^ » en tête, la ligne ne doit pas être indentée (une
 * accolade fermante de premier niveau : « ^} »).
 *
 * Ancre introuvable : un message d'erreur à la place des bornes (l'extrait l'affiche, le contrôle
 * de pnpm check le refuse).
 */
export function resolveSnippetBounds(
  source: string,
  opts: {
    snippetRange?: string
    snippetStart?: string
    snippetEnd?: string
    snippetLead?: string | number
    snippetLines?: string | number
  },
): { start?: number; end?: number; error?: string } {
  if (opts.snippetStart) {
    const lines = source.split("\n")
    const anchorIdx = lines.findIndex((l) => snippetLineMatches(l, opts.snippetStart!))
    if (anchorIdx === -1) return { error: `ancre de début introuvable : « ${opts.snippetStart} »` }
    const startIdx = Math.max(0, anchorIdx - Number(opts.snippetLead ?? 0))
    if (!opts.snippetEnd) {
      const n = Number(opts.snippetLines ?? 0)
      return { start: startIdx + 1, end: n > 0 ? anchorIdx + n : anchorIdx + 1 }
    }
    if (opts.snippetEnd === BLOCK_END) {
      const endIdx = blockEndIndex(lines, anchorIdx)
      if (endIdx === -1) return { error: `fin du bloc introuvable après « ${opts.snippetStart} »` }
      return { start: startIdx + 1, end: endIdx + 1 }
    }
    const endRel = lines.slice(anchorIdx).findIndex((l) => snippetLineMatches(l, opts.snippetEnd!))
    if (endRel === -1) return { error: `ancre de fin introuvable : « ${opts.snippetEnd} »` }
    return { start: startIdx + 1, end: anchorIdx + endRel + 1 }
  }
  const m = opts.snippetRange?.trim().match(/^(\d+)\s*-\s*(\d+)$/)
  return m ? { start: Number(m[1]), end: Number(m[2]) } : {}
}

/** Une ligne correspond-elle à une ancre d'extrait ? (règle partagée avec scripts/check-doc-snippets.mjs) */
export function snippetLineMatches(line: string, anchor: string): boolean {
  if (anchor.startsWith("^")) return line.startsWith(anchor.slice(1))
  if (/^\s/.test(anchor)) return line.startsWith(anchor)
  return line.trim().startsWith(anchor.trim())
}

/** Valeur de `snippetEnd` : jusqu'à la fin du bloc ouvert à partir de l'ancre de début. */
export const BLOCK_END = "(fin du bloc)"

/**
 * Indice de la ligne qui referme le premier bloc ouvert à partir de `from` ({ ( [ comptés ensemble,
 * hors chaînes et commentaires de fin de ligne, approximation suffisante pour du code formaté).
 */
export function blockEndIndex(lines: readonly string[], from: number): number {
  let depth = 0
  let opened = false
  for (let i = from; i < lines.length; i += 1) {
    const code = lines[i].replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\/\/.*$/, "")
    for (const ch of code) {
      if (ch === "{" || ch === "(" || ch === "[") { depth += 1; opened = true }
      else if (ch === "}" || ch === ")" || ch === "]") depth -= 1
    }
    if (opened && depth <= 0) return i
  }
  return -1
}
