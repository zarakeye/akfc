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
    <div className="mt-10 flex justify-between border-t pt-6 text-sm">
      {prev ? (
        <Link href={`/docs/${prev.slug.join("/")}`} className="hover:underline">
          ← {prev.title}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link href={`/docs/${next.slug.join("/")}`} className="hover:underline">
          {next.title} →
        </Link>
      ) : null}
    </div>
  )
}
