"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"

import type { DocPage } from "@features/docs/lib/docs.types"
import { ThemeToggle } from "@features/theme"
import { ArrowLeft } from "lucide-react"
import { OsSelect } from "@features/docs/ui/OsSelect"

type NavigationSection = {
  section: string
  /** Rang de la partie dans l'espace ; null pour l'accueil. */
  number?: number | null
  items: DocPage[]
}

/*
 * Écran étroit (téléphone, petite tablette) : la navigation démarre repliée et s'ouvre PAR-DESSUS
 * le texte, au lieu de le pousser ; choisir un chapitre la referme. Sur grand écran, rien ne
 * change : elle démarre ouverte et pousse le contenu.
 */
const NARROW_QUERY = "(max-width: 1023px)"
function subscribeNarrow(onChange: () => void): () => void {
  const query = window.matchMedia(NARROW_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readNarrow = () => window.matchMedia(NARROW_QUERY).matches

export function DocsSidebar({
  currentPath,
  navigation,
}: {
  currentPath?: string
  navigation: NavigationSection[]
}) {
  // Rendu serveur : grand écran (la navigation ouverte) ; le navigateur corrige aussitôt.
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, () => false)
  // null : pas de choix du lecteur, l'état par défaut suit la largeur de l'écran.
  const [choice, setChoice] = useState<boolean | null>(null)
  const open = choice ?? !narrow
  const overlay = narrow && open
  const setOpen = (update: (value: boolean) => boolean) => setChoice(update(open))
  const closeIfOverlay = () => {
    if (overlay) setChoice(false)
  }

  return (
    <>
      {/* Place de la barre repliée, gardée sous la navigation ouverte par-dessus. */}
      {overlay ? <div className="w-[64px] shrink-0 border-r" aria-hidden="true" /> : null}
      {overlay ? (
        <button
          type="button"
          aria-label="Fermer la navigation"
          onClick={() => setChoice(false)}
          className="fixed inset-0 z-30 bg-black/30"
        />
      ) : null}
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col border-r bg-background transition-all duration-300 ${
        open ? "w-[260px]" : "w-[64px]"
      } ${overlay ? "fixed inset-y-0 left-0 z-40 shadow-xl" : ""}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Réduire la navigation" : "Ouvrir la navigation"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ☰
        </button>

        {open ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
            Documentation
            <ThemeToggle />
          </span>
        ) : null}
      </div>

      {/* Système des commandes montrées par la doc (macOS, Linux, Windows WSL 2), à côté du thème. */}
      {open ? (
        <div className="shrink-0 border-b px-5 py-2">
          <OsSelect />
        </div>
      ) : null}

      {/* Sortie de la documentation, toujours visible (barre repliée comprise). */}
      <Link
        href="/"
        onClick={closeIfOverlay}
        title="Retour au site"
        aria-label="Retour au site"
        className={`flex shrink-0 items-center gap-2 border-b px-5 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-muted dark:text-emerald-400 ${
          open ? "" : "justify-center px-0"
        }`}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        {open ? "Retour au site" : null}
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {open ? (
          navigation.map(({ section, number, items }) => (
            <div key={section} className="mb-8">
              {/* Titre de partie : en capitales, gras, couleur du texte (noir en clair, blanc en
                  sombre), pour se détacher des chapitres en gris dessous. */}
              <h3 className="mb-3 px-2 text-sm font-bold uppercase tracking-wider text-foreground">
                {number ? <span className="mr-1.5 tabular-nums">{number}.</span> : null}
                {section}
              </h3>

              {/* Les chapitres, décalés sous leur partie : le plan se lit d'un coup d'œil. */}
              <ul className={`space-y-1 ${number ? "ml-3 border-l pl-2" : ""}`}>
                {items.map((doc) => {
                  const slug = `/docs/${doc.slug.join("/")}`
                  const active = currentPath === slug

                  return (
                    <li key={slug}>
                      <Link
                        href={slug}
                        onClick={closeIfOverlay}
                        className={
                          active
                            ? "flex gap-1.5 rounded-md bg-muted px-2 py-1.5 text-sm font-medium text-foreground"
                            : "flex gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        }
                      >
                        {doc.number ? (
                          // Retrait suspendu : un titre sur deux lignes reste aligné à droite du numéro.
                          <span className="shrink-0 pt-px text-xs tabular-nums text-muted-foreground">{doc.number}</span>
                        ) : null}
                        <span>{doc.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3">
            {navigation.map(({ section, number }) => (
              <div
                key={section}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold uppercase text-muted-foreground"
                title={section}
              >
                {number ?? section.slice(0, 2)}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
    </>
  )
}

export default DocsSidebar