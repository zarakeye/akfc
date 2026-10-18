import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@features/docs/components/Breadcrumbs"
import { DocsLayout } from "@features/docs/components/DocsLayout"
import { DocsPagination } from "@features/docs/components/DocsPagination"
import { DocsRightAsideDrawer } from "@features/docs/components/DocsRightAsideDrawer"
import ProjectArchitectureTree from "@features/docs/ui/ProjectArchitectureTree"
import { getPrevNext, getPrevNextInSection } from "@features/docs/lib/docs.navigation"
import { docExists, getDocSource } from "@features/docs/lib/docs.source"
import { extractToc } from "@features/docs/lib/docs.toc"
import type { DocFrontmatter } from "@features/docs/lib/docs.types"
import { mdxComponents } from "@web/mdx-components"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import DocsSearch from "@features/docs/components/DocsSearch"
import { getSearchDocuments } from "@features/docs/lib/docs.search"
import { spaceOf } from "@features/docs/lib/docs.spaces"
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest"

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug: requested = [] } = await params

  // Segments décodés par Next : un « .. » (ou un séparateur encodé) ferait sortir du dossier de
  // l'espace — et contourner la garde admin par /docs/guide/%2E%2E/admin/… → refusé.
  if (requested.some((s) => s.startsWith(".") || s.includes("/") || s.includes("\\"))) notFound()

  // Espace : premier segment de l'URL. Hors des trois espaces → 404.
  const space = spaceOf(requested)
  if (!space) notFound()

  // Espace réservé : contrôle CÔTÉ SERVEUR (session en base), pas seulement un lien masqué.
  // Un visiteur non admin reçoit une 404, comme si la page n'existait pas.
  if (space.adminOnly) {
    const session = await getSessionFromRequest().catch(() => null)
    if (!session?.user?.isAdmin) notFound()
  }

  // `/docs/guide` → `content/docs/guide/index.mdx` (page d'accueil de l'espace).
  const slug = docExists(requested) ? requested : [...requested, "index"]
  if (!docExists(slug)) {
    notFound()
  }

  const { source, frontmatter } = getDocSource(slug)
  const toc = extractToc(source)

  const { pages } = generateDocsIndex(space.id)
  const { prev, next } =
    frontmatter.section === "Tutorials"
      ? getPrevNextInSection(pages, slug, "Tutorials")
      : getPrevNext(pages, slug)

  const compiled = await compileMDX<DocFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
    },
  })

  const searchDocs = getSearchDocuments(space.id)

  const header = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Breadcrumbs slug={slug} />
        <DocsSearch docs={searchDocs} />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {frontmatter.title}
        </h1>

        {frontmatter.description ? (
          <p className="mt-3 text-lg text-muted-foreground">
            {frontmatter.description}
          </p>
        ) : null}
      </div>
    </div>
  )

  const footer = <DocsPagination prev={prev} next={next} />

  return (
    <DocsLayout
      space={space.id}
      title={frontmatter.title}
      description={frontmatter.description}
      currentPath={`/docs/${slug.join("/")}`}
      header={header}
      footer={footer}
      rightAside={<DocsRightAsideDrawer items={toc} />}
    >
      {slug.join("/") === "dev/architecture/project-architecture" ? (
        <>
          <ProjectArchitectureTree />
          {compiled.content}
        </>
      ) : (
        compiled.content
      )}
    </DocsLayout>
  )
}