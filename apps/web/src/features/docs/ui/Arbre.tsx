import { FileText, Folder } from "lucide-react"

/*
 * Arborescence façon explorateur de VS Code : des branches (├── └── │), le NOM seul de chaque
 * élément, un commentaire facultatif.
 *
 * Chaque ligne donne le CHEMIN COMPLET d'un élément, depuis la racine : le composant en déduit la
 * profondeur, crée les dossiers intermédiaires et range le tout comme VS Code (dossiers d'abord,
 * puis fichiers, par ordre alphabétique).
 *
 *   <Arbre racine="akfc/" texte="
 *   apps/web/                  # l'application Next.js
 *   packages/backend/src/      # l'API
 *   pnpm-workspace.yaml        # la liste des paquets
 *   " />
 *
 * Un nom qui finit par « / » est un dossier ; « # » ouvre le commentaire. L'attribut est ENTRE
 * GUILLEMETS, sur plusieurs lignes : les pages MDX sont compilées sans expressions JavaScript
 * (next-mdx-remote les retire), et l'indentation d'un attribut n'y est pas conservée — d'où des
 * chemins complets plutôt qu'un retrait. Pas de « " » dans l'arborescence.
 */

interface Noeud {
  nom: string
  dossier: boolean
  commentaire: string | null
  enfants: Map<string, Noeud>
}

const nouveau = (nom: string, dossier: boolean): Noeud => ({ nom, dossier, commentaire: null, enfants: new Map() })

/** Lignes « chemin # commentaire » → arbre ; les dossiers intermédiaires sont créés au passage. */
export function construireArbre(texte: string | undefined): Noeud {
  const racine = nouveau("", true)
  for (const brute of (texte ?? "").split("\n")) {
    const ligne = brute.trim()
    if (!ligne) continue
    const [chemin, ...reste] = ligne.split(/\s+#\s?/)
    const dossier = chemin.endsWith("/")
    const segments = chemin.split("/").filter(Boolean)
    let courant = racine
    segments.forEach((seg, i) => {
      const dernier = i === segments.length - 1
      let n = courant.enfants.get(seg)
      if (!n) {
        n = nouveau(seg, !dernier || dossier)
        courant.enfants.set(seg, n)
      }
      if (!dernier) n.dossier = true
      courant = n
    })
    if (reste.length) courant.commentaire = reste.join(" # ").trim()
  }
  return racine
}

/** L'ordre de VS Code : dossiers d'abord, puis fichiers ; alphabétique, sans tenir compte de la casse. */
export function trier(noeuds: Iterable<Noeud>): Noeud[] {
  return [...noeuds].sort(
    (a, b) => Number(b.dossier) - Number(a.dossier) || a.nom.localeCompare(b.nom, "fr", { sensitivity: "base", numeric: true }),
  )
}

function Ligne({ prefixe, noeud }: { prefixe: string; noeud: Noeud }) {
  const Icone = noeud.dossier ? Folder : FileText
  return (
    <div className="flex items-center gap-1.5 whitespace-pre leading-6">
      <span aria-hidden="true" className="text-muted-foreground/60">{prefixe}</span>
      <Icone
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 ${noeud.dossier ? "text-amber-600 dark:text-amber-400" : "text-sky-600 dark:text-sky-400"}`}
      />
      <span className="font-medium text-foreground">{noeud.nom}</span>
      {noeud.commentaire && (
        <span className="ml-3 whitespace-normal font-sans text-xs text-muted-foreground">{noeud.commentaire}</span>
      )}
    </div>
  )
}

function Branches({ noeud, retrait }: { noeud: Noeud; retrait: string }) {
  const enfants = trier(noeud.enfants.values())
  return (
    <>
      {enfants.map((n, i) => {
        const dernier = i === enfants.length - 1
        return (
          <div key={n.nom}>
            <Ligne prefixe={`${retrait}${dernier ? "└── " : "├── "}`} noeud={n} />
            {n.enfants.size > 0 && <Branches noeud={n} retrait={`${retrait}${dernier ? "    " : "│   "}`} />}
          </div>
        )
      })}
    </>
  )
}

export function Arbre({ texte, racine }: { texte?: string; racine?: string }) {
  const arbre = construireArbre(texte)
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
      <Branches noeud={arbre} retrait="" />
    </div>
  )
}
