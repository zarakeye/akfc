import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@features/docs/components/Breadcrumbs"
import { DocsLayout } from "@features/docs/components/DocsLayout"
import { DocsPagination } from "@features/docs/components/DocsPagination"
import { DocsRightAsideDrawer } from "@features/docs/components/DocsRightAsideDrawer"
import ProjectArchitectureTree from "@features/docs/ui/ProjectArchitectureTree"
import { getPrevNext, getPrevNextInSection } from "@features/docs/lib/docs.navigation"
import { docExists, getAllDocs, getDocSource } from "@features/docs/lib/docs.source"
import { extractToc } from "@features/docs/lib/docs.toc"
import type { DocFrontmatter } from "@features/docs/lib/docs.types"
import { mdxComponents } from "@web/mdx-components"
import { generateDocsIndex } from "@features/docs/lib/docs.index"
import DocsSearch from "@features/docs/components/DocsSearch"
import { getSearchDocuments } from "@features/docs/lib/docs.search"

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params

  if (!slug.length || !docExists(slug)) {
    notFound()
  }

  const { source, frontmatter } = getDocSource(slug)
  const toc = extractToc(source)

  const { pages } = generateDocsIndex()
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

  const searchDocs = getSearchDocuments()

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
      title={frontmatter.title}
      description={frontmatter.description}
      currentPath={`/docs/${slug.join("/")}`}
      header={header}
      footer={footer}
      rightAside={<DocsRightAsideDrawer items={toc} />}
    >
      {slug.join("/") === "architecture/project-architecture" ? (
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