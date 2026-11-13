import { GLOSSARIES, type GlossarySpace } from "@features/docs/glossary/glossary"
import { docTarget } from "@features/docs/glossary/glossaryLinks"
import { InlineMd } from "@features/docs/glossary/InlineMd"
import { GlossaireCartesClient, type CarteTerme } from "@features/docs/glossary/GlossaireCartesClient"

/**
 * Les cartes du glossaire d'une page : une entrée par terme présent (pas par occurrence), préparée
 * sur le serveur, et un seul composant client qui les affiche. Inséré en fin de chapitre par
 * `remarkGlossary`, avec la liste des termes qu'il a repérés.
 */
export function GlossaireCartes({ ids, space = "dev" }: { ids: string; space?: GlossarySpace }) {
  const glossary = GLOSSARIES[space]
  const cartes: CarteTerme[] = []
  for (const id of ids.split(",").filter(Boolean)) {
    const entry = glossary.entry(id)
    if (!entry) continue
    cartes.push({
      id,
      terme: entry.terme,
      definition: <InlineMd text={entry.definition} />,
      definedIn: docTarget(entry.definiEn.vers, entry.definiEn.section),
      glossaryHref: glossary.href(id),
    })
  }
  return <GlossaireCartesClient cartes={cartes} glossaryPath={`/docs/${glossary.page}`} />
}
