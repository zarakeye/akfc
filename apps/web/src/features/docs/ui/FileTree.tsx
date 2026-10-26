import type { ReactNode } from "react"
import { FileText, Folder } from "lucide-react"

/*
 * Arborescence commentée d'une partie du dépôt. Chaque entrée s'écrit « chemin — explication » :
 * le chemin est mis en avant (gras, police à chasse fixe, couleur), l'explication passe dessous,
 * en texte courant. Une icône distingue un dossier (il a des enfants, ou son nom n'a pas
 * d'extension) d'un fichier.
 *
 *   <FileTree>
 *     <FileTreeItem name="apps/web — l'application Next.js">
 *       <FileTreeItem name="src/proxy.ts — le filtre d'authentification" />
 *     </FileTreeItem>
 *   </FileTree>
 */

interface FileTreeProps {
  children: ReactNode
}

export function FileTree({ children }: FileTreeProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border bg-muted/30 p-5 text-left">
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

interface FileTreeItemProps {
  name: string
  children?: ReactNode
}

/** « chemin — explication » → [chemin, explication]. */
function splitName(name: string): [string, string | null] {
  const i = name.indexOf(" — ")
  return i === -1 ? [name, null] : [name.slice(0, i).trim(), name.slice(i + 3).trim()]
}

/** Un fichier a une extension dans son dernier segment (`proxy.ts`), ou s'appelle `Dockerfile`. */
function looksLikeFile(path: string): boolean {
  const last = path.split("/").pop() ?? path
  return /\.[a-z0-9]+$/i.test(last) || /^[A-Z][a-z]+file$/.test(last)
}

export function FileTreeItem({ name, children }: FileTreeItemProps) {
  const [path, description] = splitName(name)
  const isFile = !children && looksLikeFile(path)
  const Icon = isFile ? FileText : Folder

  return (
    <li>
      <div className="flex items-start gap-2">
        <Icon
          aria-hidden="true"
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            isFile ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400"
          }`}
        />
        <div className="min-w-0">
          {/* <code> sans classe de police : la chasse fixe du navigateur, toujours disponible. */}
          <code className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{path}</code>
          {description ? (
            <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {children ? <ul className="ml-2 mt-3 space-y-3 border-l border-border pl-5">{children}</ul> : null}
    </li>
  )
}
