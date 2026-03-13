import Link from "next/link"

export function Breadcrumbs({ slug }: { slug: string[] }) {
  const parts = slug.map((part, index) => ({
    label: part.replace(/-/g, " "),
    href: `/docs/${slug.slice(0, index + 1).join("/")}`,
  }))

  return (
    <nav className="mb-6 text-xs text-muted-foreground">
      <Link href="/docs">Docs</Link>

      {parts.map((part) => (
        <span key={part.href}>
          {" / "}
          <Link href={part.href}>{part.label}</Link>
        </span>
      ))}
    </nav>
  )
}
