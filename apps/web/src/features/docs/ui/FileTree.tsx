import type { ReactNode } from "react"

interface FileTreeProps {
  children: ReactNode
}

export function FileTree({ children }: FileTreeProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border bg-muted/20 p-4 text-sm font-mono">
      <ul className="space-y-1">{children}</ul>
    </div>
  )
}

interface FileTreeItemProps {
  name: string
  children?: ReactNode
}

export function FileTreeItem({ name, children }: FileTreeItemProps) {
  return (
    <li>
      <div className="flex items-center gap-2">
        <span>{name}</span>
      </div>

      {children ? (
        <ul className="ml-4 border-l pl-4 mt-1 space-y-1">
          {children}
        </ul>
      ) : null}
    </li>
  )
}