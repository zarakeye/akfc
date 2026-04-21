const layers = [
  {
    name: "apps/web",
    role: "Frontend Next.js, rendu des pages, docs, UI.",
  },
  {
    name: "apps/web/content/docs",
    role: "Contenu MDX pédagogique et documentation produit.",
  },
  {
    name: "packages/backend",
    role: "Routers tRPC, logique serveur, accès Prisma, auth.",
  },
  {
    name: "packages/contracts",
    role: "Schémas Zod et types partagés entre client et serveur.",
  },
  {
    name: "prisma",
    role: "Modèle de données, migrations et structure BDD.",
  },
]

/**
 * Affiche une grille avec les différentes couches du projet.
 *
 * La grille montre les couches suivantes :
 * - apps/web : Frontend Next.js, rendu des pages, docs, UI.
 * - apps/web/content/docs : Contenu MDX pédagogique et documentation produit.
 * - packages/backend : Routers tRPC, logique serveur, accès Prisma, auth.
 * - packages/contracts : Schémas Zod et types partagés entre client et serveur.
 * - prisma : Modèle de données, migrations et structure BDD.
 */
export function ProjectArchitectureLayers() {
  return (
    <div className="my-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {layers.map((layer) => (
        <div key={layer.name} className="rounded-xl border bg-card p-4">
          <div className="font-mono text-sm font-semibold text-foreground">
            {layer.name}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{layer.role}</p>
        </div>
      ))}
    </div>
  )
}

export default ProjectArchitectureLayers