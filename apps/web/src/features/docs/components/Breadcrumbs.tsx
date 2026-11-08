import Link from "next/link"

export type BreadcrumbItem = { name: string; href?: string }

/** Fil d'Ariane : Docs / espace / partie / chapitre. Un élément sans lien (la partie) est du texte. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="mb-6 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">
        Docs
      </Link>

      {items.map((item, i) => (
        <span key={`${i}-${item.name}`}>
          {" / "}
          {i === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.name}</span>
          ) : item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.name}
            </Link>
          ) : (
            <span>{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
