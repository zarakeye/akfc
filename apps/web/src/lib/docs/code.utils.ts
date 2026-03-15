import fs from "node:fs"
import path from "node:path"

function resolveProjectPath(filepath: string): string {
  const cwd = process.cwd()

  const candidates = [
    path.join(cwd, filepath),
    path.join(cwd, "..", filepath),
    path.join(cwd, "..", "..", filepath),
  ]

  const found = candidates.find((candidate) => fs.existsSync(candidate))

  if (!found) {
    throw new Error(
      `Code file not found. Checked:\n${candidates.join("\n")}`
    )
  }

  return found
}

export function readCodeFile(filepath: string): string {
  return fs.readFileSync(resolveProjectPath(filepath), "utf8")
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