import type { ReactNode } from "react"

import { glossaryEntry, glossaryHref } from "@features/docs/glossary/glossary"

/**
 * Un terme du glossaire dans le texte d'un chapitre. Inséré par `remarkGlossary`, jamais écrit à la
 * main. C'est un simple lien, sans JavaScript à lui : la carte du survol, le geste au doigt et le
 * retour sont gérés une seule fois pour toute la page par `GlossaireCartes`, qui reconnaît les
 * termes à leur attribut `data-glossaire`. Une page peut citer plus de cent termes : une carte par
 * occurrence, c'était autant de composants à hydrater et de définitions recopiées.
 */
export function Terme({ id, anchor, children }: { id: string; anchor: string; children: ReactNode }) {
  if (!glossaryEntry(id)) return <>{children}</>
  return (
    <a
      id={anchor}
      href={glossaryHref(id)}
      data-glossaire={id}
      className="scroll-mt-24 rounded-sm text-inherit underline decoration-muted-foreground/60 decoration-dotted decoration-1 underline-offset-[3px] hover:decoration-foreground target:bg-amber-100 dark:target:bg-amber-900/40"
    >
      {children}
    </a>
  )
}
