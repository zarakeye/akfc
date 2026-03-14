import Link from "next/link"

import type { DocPage } from "@/lib/docs/docs.types"

export function DocsPagination({
  prev,
  next,
}: {
  prev: DocPage | null
  next: DocPage | null
}) {
  if (!prev && !next) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {prev ? (
        <Link
          href={`/docs/${prev.slug.join("/")}`}
          className="group rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Previous
          </div>
          <div className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            ← {prev.title}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug.join("/")}`}
          className="group rounded-xl border bg-background px-4 py-3 text-right transition-colors hover:bg-muted/40"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Next
          </div>
          <div className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            {next.title} →
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}