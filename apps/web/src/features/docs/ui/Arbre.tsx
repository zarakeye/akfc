import { FileText, Folder } from "lucide-react"

/*
 * Arborescence façon explorateur d'IDE (VS Code) : des branches (├── └── │), le NOM seul de
 * chaque élément (jamais le chemin de son parent), et un commentaire facultatif aligné à droite.
 *
 *   <Arbre texte="
 *   apps/                  # les applications
 *     web/                 # l'application Next.js
 *       package.json
 *   pnpm-workspace.yaml    # la liste des paquets
 *   " />
 *
 * Un attribut texte ENTRE GUILLEMETS, sur plusieurs lignes : les pages MDX sont compilées sans
 * expressions JavaScript (next-mdx-remote les retire), donc pas de texte={`…`}. Pas de « " »
 * dans l'arborescence.
 *
 * Deux espaces d'indentation par niveau. Un nom qui finit par « / » est un dossier ; « # » ouvre
 * le commentaire. `racine` affiche le dossier de départ en tête (« akfc/ »).
 */

interface Noeud {
  nom: string
  commentaire: string | null
  enfants: Noeud[]
}

function analyser(texte: string | undefined): Noeud[] {
  if (!texte) return []
  const racines: Noeud[] = []
  const pile: { niveau: number; noeud: Noeud }[] = []
  for (const brute of texte.split("\n")) {
    if (!brute.trim()) continue
    const niveau = Math.floor((brute.length - brute.trimStart().length) / 2)
    const [avant, ...apres] = brute.trim().split(/\s+#\s?/)
    const noeud: Noeud = { nom: avant.trim(), commentaire: apres.length ? apres.join(" # ").trim() : null, enfants: [] }
    while (pile.length && pile[pile.length - 1].niveau >= niveau) pile.pop()
    if (pile.length) pile[pile.length - 1].noeud.enfants.push(noeud)
    else racines.push(noeud)
    pile.push({ niveau, noeud })
  }
  return racines
}

function Ligne({ prefixe, noeud }: { prefixe: string; noeud: Noeud }) {
  const dossier = noeud.nom.endsWith("/") || noeud.enfants.length > 0
  const Icone = dossier ? Folder : FileText
  return (
    <div className="flex items-center gap-1.5 whitespace-pre leading-6">
      <span aria-hidden="true" className="text-muted-foreground/60">{prefixe}</span>
      <Icone
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 ${dossier ? "text-amber-600 dark:text-amber-400" : "text-sky-600 dark:text-sky-400"}`}
      />
      <span className="font-medium text-foreground">{noeud.nom.replace(/\/$/, "")}</span>
      {noeud.commentaire && (
        <span className="ml-3 whitespace-normal font-sans text-xs text-muted-foreground">{noeud.commentaire}</span>
      )}
    </div>
  )
}

function Branches({ noeuds, retrait }: { noeuds: Noeud[]; retrait: string }) {
  return (
    <>
      {noeuds.map((n, i) => {
        const dernier = i === noeuds.length - 1
        return (
          <div key={`${retrait}${n.nom}${i}`}>
            <Ligne prefixe={`${retrait}${dernier ? "└── " : "├── "}`} noeud={n} />
            {n.enfants.length > 0 && <Branches noeuds={n.enfants} retrait={`${retrait}${dernier ? "    " : "│   "}`} />}
          </div>
        )
      })}
    </>
  )
}

export function Arbre({ texte, racine }: { texte?: string; racine?: string }) {
  const noeuds = analyser(texte)
  return (
    <div
      role="tree"
      aria-label={racine ? `Arborescence de ${racine}` : "Arborescence"}
      className="my-6 overflow-x-auto rounded-xl border bg-muted/30 p-4 font-mono text-[13px]"
    >
      {racine && (
        <div className="flex items-center gap-1.5 leading-6">
          <Folder aria-hidden="true" className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-foreground">{racine.replace(/\/$/, "")}</span>
        </div>
      )}
      <Branches noeuds={noeuds} retrait="" />
    </div>
  )
}
