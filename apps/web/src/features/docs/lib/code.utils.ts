import fs from "node:fs"
import path from "node:path"

function resolveProjectPath(filepath: string): string | null {
  const cwd = process.cwd()

  const candidates = [
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