import type { ReactNode } from "react"

import { GLOSSARY_PAGE, glossaryEntry, glossaryHref } from "@features/docs/glossary/glossary"
import { docTarget } from "@features/docs/glossary/glossaryLinks"
import { InlineMd } from "@features/docs/glossary/InlineMd"
import { TermeCarte } from "@features/docs/glossary/TermeCarte"

/**
 * Un terme du glossaire dans le texte d'un chapitre. Inséré par `remarkGlossary`, jamais écrit à la
 * main : il prépare, côté serveur, la carte qu'affiche le survol.
 */
export function Terme({ id, anchor, children }: { id: string; anchor: string; children: ReactNode }) {
  const entry = glossaryEntry(id)
  if (!entry) return <>{children}</>
  const defined = docTarget(entry.definiEn.vers, entry.definiEn.section)
  return (
    <TermeCarte
      anchor={anchor}
      glossaryHref={glossaryHref(id)}
      glossaryPath={`/docs/${GLOSSARY_PAGE}`}
      terme={entry.terme}
      definition={<InlineMd text={entry.definition} />}
      definedIn={defined}
    >
      {children}
    </TermeCarte>
  )
}
