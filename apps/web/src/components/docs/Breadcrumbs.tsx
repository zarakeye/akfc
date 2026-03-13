import Link from "next/link"

export function Breadcrumbs({ slug }: { slug: string[] }) {
  const segments = slug.map((_, index) => ({
    name: slug[index].replace(/-/g, " "),
    href: "/docs/" + slug.slice(0, index + 1).join("/"),
  }))

  return (
    <nav className="mb-6 text-sm text-muted-foreground">
      <Link href="/docs" className="hover:text-foreground">
        Docs
      </Link>

      {segments.map((segment, i) => (
        <span key={segment.href}>
          {" / "}
          {i === segments.length - 1 ? (
            <span className="text-foreground font-medium">
              {segment.name}
            </span>
          ) : (
            <Link href={segment.href} className="hover:text-foreground">
              {segment.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}