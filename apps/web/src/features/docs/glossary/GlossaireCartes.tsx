import { GLOSSARY_PAGE, glossaryEntry, glossaryHref } from "@features/docs/glossary/glossary"
import { docTarget } from "@features/docs/glossary/glossaryLinks"
import { InlineMd } from "@features/docs/glossary/InlineMd"
import { GlossaireCartesClient, type CarteTerme } from "@features/docs/glossary/GlossaireCartesClient"

/**
 * Les cartes du glossaire d'une page : une entrée par terme présent (pas par occurrence), préparée
 * sur le serveur, et un seul composant client qui les affiche. Inséré en fin de chapitre par
 * `remarkGlossary`, avec la liste des termes qu'il a repérés.
 */
export function GlossaireCartes({ ids }: { ids: string }) {
  const cartes: CarteTerme[] = []
  for (const id of ids.split(",").filter(Boolean)) {
    const entry = glossaryEntry(id)
    if (!entry) continue
    cartes.push({
      id,
      terme: entry.terme,
      definition: <InlineMd text={entry.definition} />,
      definedIn: docTarget(entry.definiEn.vers, entry.definiEn.section),
      glossaryHref: glossaryHref(id),
    })
  }
  return <GlossaireCartesClient cartes={cartes} glossaryPath={`/docs/${GLOSSARY_PAGE}`} />
}
