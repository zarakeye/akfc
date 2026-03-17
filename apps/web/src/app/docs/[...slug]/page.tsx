import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@/components/docs/Breadcrumbs"
import { DocsLayout } from "@/components/docs/DocsLayout"
import { DocsPagination } from "@/components/docs/DocsPagination"
import { DocsRightAsideDrawer } from "@/components/docs/DocsRightAsideDrawer"
import ProjectArchitectureTree from "@/components/docs/ProjectArchitectureTree"
import { getPrevNext, getPrevNextInSection } from "@/lib/docs/docs.navigation"
import { docExists, getAllDocs, getDocSource } from "@/lib/docs/docs.source"
import { extractToc } from "@/lib/docs/docs.toc"
import type { DocFrontmatter } from "@/lib/docs/docs.types"
import { mdxComponents } from "@/mdx-components"
import { generateDocsIndex } from "@/lib/docs/docs.index"
import DocsSearch from "@/components/docs/DocsSearch"
import { getSearchDocuments } from "@/lib/docs/docs.search"

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