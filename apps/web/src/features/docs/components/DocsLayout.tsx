import type { ReactNode } from "react"
import { DocsSidebar } from "@features/docs/components/DocsSidebar"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import { DocsMainScrollControls } from "@features/docs/components/DocsMainScrollControls"

export function DocsLayout({
  title,
  description,
  currentPath,
  header,
  footer,
  rightAside,
  children,
}: {
  title: string
  description?: string
  currentPath?: string
  header?: ReactNode
  footer?: ReactNode
  rightAside?: ReactNode
  children: ReactNode
}) {
  const { navigation } = generateDocsIndex()

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <DocsSidebar currentPath={currentPath} navigation={navigation} />

      <main className="min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 overflow-hidden px-8 py-6">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b bg-background pb-4">
              {header ? (
                header
              ) : (
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

                  {description ? (
                    <p className="mt-3 text-lg text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="relative min-h-0 flex-1">
              <div
                id="docs-content-scroll"
                className="docs-main-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden py-6 pr-10"
              >
                <div className="mx-auto max-w-4xl text-justify">{children}</div>
              </div>

              <DocsMainScrollControls />
            </div>

            <div className="shrink-0 border-t bg-background py-3">{footer}</div>
          </section>
        </div>
      </main>

      {rightAside}
    </div>
  )
}

export default DocsLayout