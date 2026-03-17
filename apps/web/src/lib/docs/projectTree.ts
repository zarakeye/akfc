import fs from "node:fs"
import path from "node:path"

export interface TreeNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: TreeNode[]
}

const DEFAULT_IGNORES = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  ".turbo",
  ".pnpm-store",
  ".DS_Store",
  "coverage",
])

function shouldIgnore(name: string, extraIgnores: string[]) {
  return DEFAULT_IGNORES.has(name) || extraIgnores.includes(name)
}

export function readProjectTree(
  absoluteRoot: string,
  options?: {
    maxDepth?: number
    includeFiles?: boolean
    ignore?: string[]
  }
): TreeNode[] {
  const maxDepth = options?.maxDepth ?? 3
  const includeFiles = options?.includeFiles ?? false
  const ignore = options?.ignore ?? []

  function walk(currentPath: string, depth: number): TreeNode[] {
    if (depth > maxDepth) return []

    const entries = fs
      .readdirSync(currentPath, { withFileTypes: true })
      .filter((entry) => !shouldIgnore(entry.name, ignore))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1
        if (!a.isDirectory() && b.isDirectory()) return 1
        return a.name.localeCompare(b.name)
      })

    const nodes: TreeNode[] = []

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)
      const relativePath = path.relative(absoluteRoot, fullPath).replace(/\\/g, "/")

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "directory",
          children: walk(fullPath, depth + 1),
        })
        continue
      }

      if (includeFiles) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "file",
        })
      }
    }

    return nodes
  }

  return walk(absoluteRoot, 1)
}