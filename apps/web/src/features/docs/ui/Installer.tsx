import { CodeBlock } from "./CodeBlock"

/*
 * La commande qui ajoute une dépendance, au chapitre où elle sert pour la première fois.
 *
 *   <Installer paquets="zod" dans="contracts" />
 *   <Installer paquets="prisma typescript" dans="racine" dev />
 *
 * `dans` : « racine » (le package.json du dépôt, option -w), ou le nom court d'un paquet du
 * workspace (web, backend, contracts, finder-core), visé par --filter. `dev` : une dépendance
 * de développement (-D), qui ne sert qu'à écrire, vérifier ou construire le code. `par` : déjà
 * installé par un générateur (create-next-app) ; le composant le dit, sans commande.
 */
export const PAQUETS_DU_DEPOT = ["racine", "web", "backend", "contracts", "finder-core"] as const

export function commandeInstaller(paquets: string, dans: string, dev = false): string {
  const options = dev ? " -D" : ""
  return dans === "racine"
    ? `pnpm add -w${options} ${paquets}`
    : `pnpm --filter @akfc/${dans} add${options} ${paquets}`
}

export async function Installer({
  paquets,
  dans,
  dev = false,
  par,
}: {
  paquets: string
  dans: string
  dev?: boolean
  /** Installé par un générateur (« create-next-app ») : on le dit, sans commande à taper. */
  par?: string
}) {
  const lieu = dans === "racine" ? "à la racine du dépôt" : `dans le paquet @akfc/${dans}`
  if (par) {
    return (
      <p className="my-4 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
        Installé par <code>{par}</code> {lieu}
        {dev ? " (dépendances de développement)" : ""} : {paquets.split(/\s+/).map((p, i) => (
          <span key={p}>
            {i > 0 ? ", " : ""}
            <code>{p}</code>
          </span>
        ))}
        .
      </p>
    )
  }
  return (
    <div className="my-6">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        À installer {lieu}
        {dev ? " (dépendance de développement)" : ""}
      </p>
      <CodeBlock code={commandeInstaller(paquets, dans, dev)} language="bash" showLineNumbers={false} />
    </div>
  )
}
