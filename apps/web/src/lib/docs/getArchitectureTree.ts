import path from "node:path"
import { readProjectTree, type TreeNode } from "@/lib/docs/projectTree"

export function getArchitectureTree(): TreeNode[] {
  const repoRoot = path.resolve(process.cwd(), "..", "..")

  return readProjectTree(repoRoot, {
    maxDepth: 2,
    includeFiles: false,
    ignore: [
      ".github",
      ".vscode",
      "public",
      "tests",
      "tmp",
    ],
  })
}