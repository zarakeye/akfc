import Link from "next/link"
import type { ReactNode } from "react"

import { generateDocsIndex } from "#features/docs/lib/docs.index.ts"
import { getNumberedDoc } from "#features/docs/lib/docs.navigation.ts"
import { getSpace } from "#features/docs/lib/docs.spaces.ts"
import { slugifyHeading } from "#features/docs/lib/slugifyHeading.ts"

interface PromesseProps {
  /** Le chapitre qui approfondit, chemin complet sans extension : "dev/auth/les-droits-par-les-groupes". */
  vers: string
  /** Facultatif : le titre exact d'une section de ce chapitre (texte de son « ## »). */
  section?: string
  /** L'explication courte, juste ce qu'il faut pour suivre ici. */
  children: ReactNode
}

/**
 * Une promesse : on effleure un sujet sans s'y arrêter, et l'on dit où il est traité à fond.
 *
 * Le lien porte le numéro du chapitre visé, calculé par la navigation (il suit les déplacements),
 * et `scripts/check-doc-components.mjs` vérifie que le chapitre et la section existent : une
 * promesse ne peut pas pointer dans le vide.
 */
export function Promesse({ vers, section, children }: PromesseProps) {
  const slug = vers.split("/").filter(Boolean)
  const space = getSpace(slug[0])
  const target = space ? getNumberedDoc(generateDocsIndex(space.id).pages, slug) : null

  return (
    // Mode sombre : bg-slate-50 est réorienté vers le thème (styles/dark-legacy.css, hors couche,
    // il l'emporte sur dark:bg-…). Le texte suit donc le thème lui aussi, sans couleur forcée.
    <aside className="my-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-foreground">
      <div className="flex gap-2">
        <span aria-hidden="true" className="select-none text-slate-500">↪</span>
        <div className="min-w-0">{children}</div>
      </div>
      <p className="mt-2 pl-6 text-xs text-slate-600">
        {target ? (
          <>
            Approfondi en{" "}
            <Link
              href={`/docs/${slug.join("/")}${section ? `#${slugifyHeading(section)}` : ""}`}
              className="font-medium underline underline-offset-2 hover:text-foreground"
            >
              {target.page.number ? `${target.page.number} ` : ""}
              {target.page.title}
              {section ? ` · ${section}` : ""}
            </Link>
          </>
        ) : (
          <span className="font-semibold text-rose-700">⚠ Promesse vers un chapitre introuvable : {vers}</span>
        )}
      </p>
    </aside>
  )
}
