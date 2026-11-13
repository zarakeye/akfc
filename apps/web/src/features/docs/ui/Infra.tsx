import { Box, HardDrive, Monitor, Network, Plug, Server } from "lucide-react"

/*
 * Schéma d'une infrastructure : une machine, des groupes (un réseau Docker, « hors Docker »…), et
 * dans chaque groupe des services, avec leur rôle, comment on les joint et où vont leurs données.
 *
 *   <Infra titre="Le Mac du développeur" machine="poste" texte="
 *   [Sur la machine, hors Docker]
 *   pnpm dev | Next.js, le site en développement | http://localhost:3000
 *   [Docker, projet akfc-dev]
 *   db | PostgreSQL 17 | 127.0.0.1:5435 → 5432 | volume akfc-dev-pgdata
 *   " />
 *
 * Une ligne « [nom] » ouvre un groupe ; une ligne de service a deux à quatre champs séparés par
 * « | » : nom, rôle, accès, données. Comme pour <Arbre>, tout passe par un attribut ENTRE
 * GUILLEMETS (les pages MDX sont compilées sans expressions JavaScript) ; pas de « " » dedans.
 * Couleurs du thème uniquement : le schéma suit le mode sombre sans règle de plus.
 */

interface Service {
  nom: string
  role: string
  acces: string | null
  donnees: string | null
}

interface Groupe {
  nom: string | null
  services: Service[]
}

export function lireInfra(texte: string | undefined): Groupe[] {
  const groupes: Groupe[] = []
  for (const brute of (texte ?? "").split("\n")) {
    const ligne = brute.trim()
    if (!ligne) continue
    const titre = ligne.match(/^\[(.+)\]$/)
    if (titre) {
      groupes.push({ nom: titre[1].trim(), services: [] })
      continue
    }
    const [nom, role = "", acces, donnees] = ligne.split("|").map((c) => c.trim())
    if (groupes.length === 0) groupes.push({ nom: null, services: [] })
    groupes[groupes.length - 1].services.push({ nom, role, acces: acces || null, donnees: donnees || null })
  }
  return groupes
}

function Carte({ service }: { service: Service }) {
  return (
    <li className="rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex items-center gap-1.5">
        <Box aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
        <span className="font-mono font-semibold text-foreground">{service.nom}</span>
      </div>
      <p className="mt-1 leading-6 text-foreground">{service.role}</p>
      {(service.acces || service.donnees) && (
        <dl className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground">
          {service.acces && (
            <div className="flex gap-1.5">
              <dt className="shrink-0">
                <Plug aria-hidden="true" className="mt-0.5 h-3.5 w-3.5" />
                <span className="sr-only">Accès</span>
              </dt>
              <dd className="font-mono">{service.acces}</dd>
            </div>
          )}
          {service.donnees && (
            <div className="flex gap-1.5">
              <dt className="shrink-0">
                <HardDrive aria-hidden="true" className="mt-0.5 h-3.5 w-3.5" />
                <span className="sr-only">Données</span>
              </dt>
              <dd className="font-mono">{service.donnees}</dd>
            </div>
          )}
        </dl>
      )}
    </li>
  )
}

export function Infra({ titre, texte, machine }: { titre?: string; texte?: string; machine?: string }) {
  const groupes = lireInfra(texte)
  const Icone = machine === "serveur" ? Server : Monitor
  return (
    <figure
      aria-label={titre ? `Schéma : ${titre}` : "Schéma d'infrastructure"}
      className="my-6 rounded-xl border-2 border-border bg-muted/30 p-4 text-left"
    >
      {titre && (
        <figcaption className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Icone aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          {titre}
        </figcaption>
      )}
      <div className="space-y-3">
        {groupes.map((g, i) => (
          <section key={`${g.nom ?? ""}-${i}`} className="rounded-lg border border-dashed border-border p-3">
            {g.nom && (
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Network aria-hidden="true" className="h-3.5 w-3.5" />
                {g.nom}
              </h4>
            )}
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.services.map((s) => (
                <Carte key={s.nom} service={s} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </figure>
  )
}
