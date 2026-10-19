/**
 * Retrouve dans le fichier source les lignes d'un extrait cité dans la doc.
 *
 * Les extraits de la doc ne sont pas toujours des copies exactes d'une plage de lignes : ils
 * peuvent sauter des passages (« // … »), condenser un bloc, abréger une ligne (« { /* … *\/ } »).
 * On aligne donc l'extrait sur le fichier ligne à ligne, dans l'ordre :
 *   - une ligne d'élision (« // … », « -- … ») n'a pas de correspondant ;
 *   - une ligne abrégée par « … » correspond à la ligne du fichier qui commence comme elle ;
 *   - une ligne courte et banale (« } », « }); ») n'est cherchée que tout près de la précédente,
 *     pour ne pas s'accrocher à n'importe quelle accolade du fichier.
 * Le résultat donne, pour chaque ligne de l'extrait, son numéro dans le fichier (ou null).
 */

export type SnippetLocation = {
  /** Numéro de ligne dans le fichier pour chaque ligne de l'extrait (null : sans correspondant). */
  lineMap: (number | null)[]
  /** Lignes du fichier couvertes par l'extrait (trous de 2 lignes au plus comblés). */
  lines: number[]
  /** Première et dernière ligne couvertes. */
  first: number | null
  last: number | null
  /** Part des lignes significatives de l'extrait retrouvées dans le fichier (0 à 1). */
  ratio: number
}

const norm = (line: string): string => line.trim().replace(/\s+/g, " ")

const ELISION = /^(?:\/\/|#|--|\/\*|\{\/\*)\s*…/

function isElision(line: string): boolean {
  const t = norm(line)
  return t === "…" || ELISION.test(t)
}

/** Ligne trop banale pour servir d'ancre lointaine. */
function isWeak(line: string): boolean {
  const t = norm(line)
  return t.length < 6 || /^[\s{}()[\];,.<>/=]*$/.test(t)
}

function lineMatches(snippetLine: string, fileLine: string): boolean {
  const s = norm(snippetLine)
  const f = norm(fileLine)
  if (s === f) return true
  const cut = s.indexOf("…")
  if (cut > 0) {
    // Partie avant l'abréviation, sans l'ouverture de commentaire qui l'annonce.
    const head = s.slice(0, cut).replace(/(?:\/\*|\/\/|\{\/\*)\s*$/, "").trimEnd()
    return head.length >= 6 && f.startsWith(head)
  }
  return false
}

const MAX_GAP = 60
const WEAK_GAP = 3

function alignFrom(fileLines: string[], snippetLines: string[], anchorFileIdx: number, anchorSnippetIdx: number): (number | null)[] {
  const map: (number | null)[] = snippetLines.map(() => null)
  map[anchorSnippetIdx] = anchorFileIdx + 1
  let cursor = anchorFileIdx
  for (let i = anchorSnippetIdx + 1; i < snippetLines.length; i += 1) {
    const line = snippetLines[i]
    if (!norm(line) || isElision(line)) continue
    const limit = Math.min(fileLines.length - 1, cursor + (isWeak(line) ? WEAK_GAP : MAX_GAP))
    for (let j = cursor + 1; j <= limit; j += 1) {
      if (lineMatches(line, fileLines[j])) {
        map[i] = j + 1
        cursor = j
        break
      }
    }
  }
  return map
}

export function locateSnippet(fileSource: string, snippet: string): SnippetLocation {
  const fileLines = fileSource.split("\n")
  const snippetLines = snippet.split("\n")
  const significant = snippetLines
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => norm(line) && !isElision(line))

  const empty: SnippetLocation = { lineMap: snippetLines.map(() => null), lines: [], first: null, last: null, ratio: 0 }
  if (significant.length === 0) return empty

  // Ancre : la première ligne significative et non banale de l'extrait. On essaie chacune de ses
  // occurrences dans le fichier et on garde l'alignement le plus complet.
  const anchor = significant.find(({ line }) => !isWeak(line)) ?? significant[0]
  let best: (number | null)[] | null = null
  let bestCount = -1
  let tried = 0
  for (let j = 0; j < fileLines.length && tried < 50; j += 1) {
    if (!lineMatches(anchor.line, fileLines[j])) continue
    tried += 1
    const map = alignFrom(fileLines, snippetLines, j, anchor.i)
    // Lignes de l'extrait AVANT l'ancre : recherche à rebours.
    let cursor = j
    for (let i = anchor.i - 1; i >= 0; i -= 1) {
      const line = snippetLines[i]
      if (!norm(line) || isElision(line)) continue
      const limit = Math.max(0, cursor - (isWeak(line) ? WEAK_GAP : MAX_GAP))
      for (let k = cursor - 1; k >= limit; k -= 1) {
        if (lineMatches(line, fileLines[k])) {
          map[i] = k + 1
          cursor = k
          break
        }
      }
    }
    const count = map.filter((n) => n !== null).length
    if (count > bestCount) {
      best = map
      bestCount = count
    }
  }
  if (!best) return empty

  const matched = best.filter((n): n is number => n !== null).sort((a, b) => a - b)
  const lines: number[] = []
  for (let k = 0; k < matched.length; k += 1) {
    const n = matched[k]
    const prev = lines[lines.length - 1]
    if (prev !== undefined && n - prev > 1 && n - prev <= 3) {
      for (let fill = prev + 1; fill < n; fill += 1) lines.push(fill)
    }
    if (prev !== n) lines.push(n)
  }

  return {
    lineMap: best,
    lines,
    first: lines[0] ?? null,
    last: lines[lines.length - 1] ?? null,
    ratio: bestCount / significant.length,
  }
}
