import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@features/docs/components/Breadcrumbs"
import { DocsLayout } from "@features/docs/components/DocsLayout"
import { DocsPagination } from "@features/docs/components/DocsPagination"
import { DocsRightAsideDrawer } from "@features/docs/components/DocsRightAsideDrawer"
import { getNumberedDoc, getPrevNext } from "@features/docs/lib/docs.navigation"
import { docExists, getDocSource } from "@features/docs/lib/docs.source"
import { extractToc } from "@features/docs/lib/docs.toc"
import type { DocFrontmatter } from "@features/docs/lib/docs.types"
import { mdxComponents } from "@web/mdx-components"
import { buildFenceIndex } from "@features/docs/lib/fenceIndex"
import { MdxCodeFence } from "@features/docs/ui/MdxCodeFence"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import DocsSearch from "@features/docs/components/DocsSearch"
import { getSearchDocuments } from "@features/docs/lib/docs.search"
import { spaceOf } from "@features/docs/lib/docs.spaces"
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest"
import { getEntityMap } from "@features/docs/entities/prismaSchema"
import { buildChapterGraph } from "@features/docs/entities/chapterGraph"
import { EntityCode, EntityExplorer } from "@features/docs/entities/EntityExplorer"
import { readChapterStories } from "@features/docs/entities/stories"

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
  const { prev, next } = getPrevNext(pages, slug)
  // Numéro du chapitre (« 7.2 ») et sa partie, pour le titre et le fil d'Ariane.
  const numbered = getNumberedDoc(pages, slug)
  const chapterNumber = numbered?.page.number ?? null
  const isSpaceHome = slug[slug.length - 1] === "index"
  const crumbs = [
    { name: space.title, href: `/docs/${space.id}` },
    ...(numbered && !isSpaceHome
      ? [
          { name: numbered.sectionNumber ? `${numbered.sectionNumber}. ${numbered.section}` : numbered.section },
          { name: chapterNumber ? `${chapterNumber} ${frontmatter.title}` : frontmatter.title },
        ]
      : []),
  ]

  // Blocs de code : situés dans leurs fichiers avant la compilation (numéros de ligne réels,
  // fichier dépliable, navigation entre les extraits d'un même fichier).
  const fenceIndex = buildFenceIndex(source)

  // Carte des entités : seulement pour un chapitre qui déclare ses entités dans son en-tête.
  // Le code en ligne du texte (`Ticket`, `dueAt`) devient alors un lien vers la carte.
  // Les parcours (stories) se rejouent sur la même carte ; les entités qu'ils touchent s'y ajoutent.
  const stories = frontmatter.entities ? readChapterStories(frontmatter.stories) : []
  const storyModels = [...new Set(stories.flatMap((s) => s.steps.flatMap((st) => st.effects.map((e) => e.model))))]
  const entityGraph = frontmatter.entities
    ? buildChapterGraph(getEntityMap(), frontmatter.entities, storyModels)
    : null

  const compiled = await compileMDX<DocFrontmatter>({
    source,
    components: {
      ...mdxComponents,
      ...(entityGraph ? { code: EntityCode } : {}),
      pre: (props) => <MdxCodeFence index={fenceIndex}>{props.children}</MdxCodeFence>,
    },
    options: {
      parseFrontmatter: false,
    },
  })

  const searchDocs = getSearchDocuments(space.id)

  const header = (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Breadcrumbs items={crumbs} />
        <DocsSearch docs={searchDocs} />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          {chapterNumber ? (
            <span className="mr-3 tabular-nums text-muted-foreground">{chapterNumber}</span>
          ) : null}
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
      {entityGraph ? (
        <EntityExplorer graph={entityGraph} stories={stories}>
          {compiled.content}
        </EntityExplorer>
      ) : (
        compiled.content
      )}
    </DocsLayout>
  )
}