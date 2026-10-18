import Link from "next/link"
import { BookOpen, Code2, ShieldCheck } from "lucide-react"

import { DocsLayout } from "@features/docs/components/DocsLayout"
import { DOC_SPACES, type DocSpaceId } from "@features/docs/lib/docs.spaces"
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest"

const ICONS: Record<DocSpaceId, typeof BookOpen> = { guide: BookOpen, admin: ShieldCheck, dev: Code2 }

/**
 * Accueil de la documentation : une carte par espace. L'espace d'administration n'apparaît
 * qu'aux administrateurs (et reste de toute façon gardé côté serveur sur ses pages).
 */
export default async function DocsHomePage() {
  const session = await getSessionFromRequest().catch(() => null)
  const isAdmin = !!session?.user?.isAdmin
  const spaces = DOC_SPACES.filter((s) => !s.adminOnly || isAdmin)

  return (
    <DocsLayout
      space={null}
      showAdminSpace={isAdmin}
      title="Documentation AKFC"
      description="Trois espaces, selon ce que vous venez faire sur le site."
      currentPath="/docs"
    >
      <div className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((s) => {
          const Icon = ICONS[s.id]
          return (
            <Link
              key={s.id}
              href={`/docs/${s.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-colors hover:border-emerald-400 hover:bg-emerald-50/40"
            >
              <Icon className="h-7 w-7 text-emerald-600" />
              <span className="text-lg font-semibold group-hover:underline">{s.title}</span>
              <span className="text-sm text-muted-foreground">{s.description}</span>
            </Link>
          )
        })}
      </div>
    </DocsLayout>
  )
}
