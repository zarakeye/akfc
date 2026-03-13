import type { ReactNode } from "react"

import { DocsSidebar } from "@/components/docs/DocsSidebar"

export function DocsLayout({
  title,
  description,
  currentPath,
  children,
}: {
  title: string
  description?: string
  currentPath?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar currentPath={currentPath} />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <header className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

            {description ? (
              <p className="mt-3 text-lg text-muted-foreground">
                {description}
              </p>
            ) : null}
          </header>

          {children}
        </div>
      </main>
    </div>
  )
}