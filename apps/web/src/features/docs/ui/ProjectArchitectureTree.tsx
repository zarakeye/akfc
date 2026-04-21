import { getArchitectureTree } from "@/features/docs/lib/getArchitectureTree"
import type { TreeNode } from "@/features/docs/lib/projectTree"

/**
 * A recursive component to display a tree view of the monorepo's file structure.
 *
 * @param {TreeNode} node - The current node in the tree.
 * @param {number} [level=0] - The level of nesting in the tree.
 *
 * @returns {JSX.Element} - A JSX element representing the given node and its children.
 */
function TreeBranch({
  node,
  level = 0,
}: {
  node: TreeNode
  level?: number
}) {
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="text-xs text-muted-foreground">
          {node.type === "directory" ? "📁" : "📄"}
        </span>

        <span className="font-mono text-sm text-foreground">
          {node.name}
        </span>
      </div>

      {node.children?.length ? (
        <ul className="space-y-1">
          {node.children.map((child) => (
            <TreeBranch key={child.path} node={child} level={level + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function ProjectArchitectureTree() {
  const nodes = getArchitectureTree()

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Project structure
        </h3>

        <p className="text-sm text-muted-foreground">
          Vue synthétique de l’arborescence du monorepo.
        </p>
      </div>

      <ul className="space-y-1">
        {nodes.map((node) => (
          <TreeBranch key={node.path} node={node} />
        ))}
      </ul>
    </div>
  )
}

export default ProjectArchitectureTree