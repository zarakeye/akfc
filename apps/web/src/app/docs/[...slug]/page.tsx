import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"

import { Breadcrumbs } from "@/components/docs/Breadcrumbs"
import { DocsLayout } from "@/components/docs/DocsLayout"
import { DocsPagination } from "@/components/docs/DocsPagination"
import { DocsToc } from "@/components/docs/DocsToc"
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

  return (
    <DocsLayout
      title={frontmatter.title}
      description={frontmatter.description}
      currentPath={`/docs/${slug.join("/")}`}
    >
      <Breadcrumbs slug={slug} />

      <div className="flex">
        <article className="flex-1">
          {compiled.content}
          <DocsPagination prev={prev} next={next} />
        </article>

        <DocsToc items={toc} />
      </div>
    </DocsLayout>
  )
}