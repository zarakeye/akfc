import type { ReactNode } from "react"
import { DocsSidebar } from "@features/docs/components/DocsSidebar"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import { DocsMainScrollControls } from "@features/docs/components/DocsMainScrollControls"
import type { DocSpaceId } from "@features/docs/lib/docs.spaces"
import { PortraitHint } from "@features/docs/components/PortraitHint"
import { DOCS_ACTIONS_ID } from "@features/docs/lib/docsActionsSlot"

export function DocsLayout({
  space = null,
  showAdminSpace = false,
  title,
  description,
  currentPath,
  header,
  footer,
  rightAside,
  children,
}: {
  /** Espace affiché (sa navigation seule) ; null = accueil de la documentation. */
  space?: DocSpaceId | null
  /** Accueil seulement : faire figurer l'espace Administration dans la navigation (admins). */
  showAdminSpace?: boolean
  title: string
  description?: string
  currentPath?: string
  header?: ReactNode
  footer?: ReactNode
  rightAside?: ReactNode
  children: ReactNode
}) {
  const index = generateDocsIndex(space)
  const navigation =
    space || showAdminSpace
      ? index.navigation
      : index.navigation.map((s) => ({ ...s, items: s.items.filter((p) => p.slug[0] !== "admin") }))

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <PortraitHint />
      <div className="flex min-h-0 flex-1 overflow-hidden">
      <DocsSidebar currentPath={currentPath} navigation={navigation} />

      <main className="min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 overflow-hidden px-8 py-6 max-md:pl-3 max-lg:pr-12 short:py-2">
          {/* Écran étroit (`max-lg:`) : marge droite libre pour les pastilles « Entités » et « On
              this page », qui ne couvrent ainsi jamais le texte.
              Écran bas (`short:`, téléphone en paysage) et téléphone en portrait (`phone-portrait:`) :
              le titre et les liens « Précédent / Suivant » défilent avec le texte ; c'est la
              section entière qui défile (voir lib/docsScroller.ts). */}
          <section data-docs-scroller className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden short:overflow-y-auto phone-portrait:overflow-y-auto">
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

            <div className="relative min-h-0 flex-1 short:flex-none phone-portrait:flex-none">
              <div
                id="docs-content-scroll"
                className="docs-main-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden py-6 pr-10 max-lg:pr-1 short:h-auto short:overflow-visible short:overflow-x-visible phone-portrait:h-auto phone-portrait:overflow-visible phone-portrait:overflow-x-visible"
              >
                <div className="mx-auto max-w-4xl text-justify">{children}</div>
              </div>

              <DocsMainScrollControls />

              {/* Emplacement des boutons flottants (« Entités », « Sur cette page ») : des pastilles
                  rondes en bas de la colonne, dans la marge entre le texte et la flèche « fin » /
                  le pourcentage, donc jamais sur les liens « Précédent / Suivant ». Leur libellé se
                  déplie au survol. Écran étroit ou bas : fixes dans la marge droite. */}
              <div
                id={DOCS_ACTIONS_ID}
                className="pointer-events-none absolute right-16 bottom-6 z-40 flex flex-col items-end gap-2 *:pointer-events-auto max-lg:fixed max-lg:right-1.5 max-lg:bottom-3 short:fixed short:right-1.5 short:bottom-3"
              />
            </div>

            <div className="shrink-0 border-t bg-background py-3">{footer}</div>
          </section>
        </div>
      </main>

      {rightAside}
      </div>
    </div>
  )
}

export default DocsLayout