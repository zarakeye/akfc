import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@/components/docs/Breadcrumbs"
import { DocsLayout } from "@/components/docs/DocsLayout"
import { DocsPagination } from "@/components/docs/DocsPagination"
import { DocsRightAside } from "@/components/docs/DocsRightAside"
import { getPrevNext } from "@/lib/docs/docs.navigation"
import { docExists, getAllDocs, getDocSource } from "@/lib/docs/docs.source"
import { extractToc } from "@/lib/docs/docs.toc"
import type { DocFrontmatter } from "@/lib/docs/docs.types"
import { mdxComponents } from "@/mdx-components"

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
  const pages = getAllDocs()
  const { prev, next } = getPrevNext(pages, slug)

  const compiled = await compileMDX<DocFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
    },
  })

  const header = (
    <div>
      <Breadcrumbs slug={slug} />

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
      rightAside={<DocsRightAside items={toc} />}
    >
      {compiled.content}
    </DocsLayout>
  )
}