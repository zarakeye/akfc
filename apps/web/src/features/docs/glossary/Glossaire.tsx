import Link from "next/link"

import { GLOSSARY } from "@features/docs/glossary/glossary"
import { getGlossaryCitations } from "@features/docs/glossary/glossaryCitations"
import { docTarget } from "@features/docs/glossary/glossaryLinks"
import { InlineMd } from "@features/docs/glossary/InlineMd"
import { RetourGlossaire } from "@features/docs/glossary/RetourGlossaire"

const initial = (terme: string) =>
  terme.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase()

/**
 * La page du glossaire : les termes par ordre alphabétique, chacun avec sa définition courte, le
 * chapitre qui le définit (et celui qui l'approfondit), et l'index des pages qui le citent.
 */
export function Glossaire() {
  const entries = [...GLOSSARY].sort((a, b) => a.terme.localeCompare(b.terme, "fr", { sensitivity: "base" }))
  const citations = getGlossaryCitations()
  const letters = [...new Set(entries.map((e) => initial(e.terme)))]

  return (
    <div>
      <RetourGlossaire />
      <nav aria-label="Lettres du glossaire" className="mb-8 flex flex-wrap gap-1">
        {letters.map((letter) => (
          <a key={letter} href={`#lettre-${letter}`} className="rounded border px-2 py-1 text-sm font-medium hover:bg-muted">
            {letter}
          </a>
        ))}
      </nav>
      {letters.map((letter) => (
        <section key={letter} aria-labelledby={`lettre-${letter}`} className="mb-10">
          <h2 id={`lettre-${letter}`} className="mb-4 scroll-mt-24 border-b pb-1 text-2xl font-bold">
            {letter}
          </h2>
          <dl className="space-y-6">
            {entries
              .filter((e) => initial(e.terme) === letter)
              .map((entry) => {
                const defined = docTarget(entry.definiEn.vers, entry.definiEn.section)
                const deeper = entry.approfondiEn ? docTarget(entry.approfondiEn.vers, entry.approfondiEn.section) : null
                const cited = citations.get(entry.id) ?? []
                return (
                  <div key={entry.id} id={`g-${entry.id}`} className="scroll-mt-24 rounded-md p-3 target:bg-amber-50 dark:target:bg-amber-950/30">
                    <dt className="text-lg font-semibold">{entry.terme}</dt>
                    <dd className="mt-1 space-y-2">
                      <p className="leading-relaxed"><InlineMd text={entry.definition} /></p>
                      <p className="text-left text-sm text-muted-foreground">
                        Défini en{" "}
                        <Link href={defined.href} className="underline underline-offset-2">{defined.label}</Link>
                        {deeper ? (
                          <>
                            {" "}· approfondi en{" "}
                            <Link href={deeper.href} className="underline underline-offset-2">{deeper.label}</Link>
                          </>
                        ) : null}
                      </p>
                      {cited.length > 0 ? (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            Cité dans {cited.length} page{cited.length > 1 ? "s" : ""}
                          </summary>
                          <ul className="mt-2 space-y-1 pl-4">
                            {cited.map((c) => (
                              <li key={c.slug.join("/")}>
                                <Link href={`/docs/${c.slug.join("/")}#${c.firstAnchor}`} className="underline underline-offset-2">
                                  {c.number ? `${c.number} ` : ""}{c.title}
                                </Link>
                                <span className="text-muted-foreground"> · {c.section}{c.count > 1 ? ` · ${c.count} fois` : ""}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </dd>
                  </div>
                )
              })}
          </dl>
        </section>
      ))}
    </div>
  )
}
