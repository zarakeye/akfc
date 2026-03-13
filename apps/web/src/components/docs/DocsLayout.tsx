import type { ReactNode } from "react"

import { DocsSidebar } from "@/components/docs/DocsSidebar"

export function DocsLayout({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-7xl">
      <DocsSidebar />

      <div className="min-h-screen flex-1 px-6 py-10">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Documentation
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>

          {description ? (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>

        <main className="prose prose-neutral max-w-none dark:prose-invert">
          {children}
        </main>
      </div>
    </div>
  )
}
