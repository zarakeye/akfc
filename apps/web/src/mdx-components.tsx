import type { MDXComponents } from "mdx/types"
import { Children } from "react"

import { Callout } from "@/components/docs/Callout"
import { CodeBlock } from "@/components/docs/CodeBlock"
import { FileTree, FileTreeItem } from "@/components/docs/FileTree"
import { ArchitectureDiagram } from "@/components/docs/ArchitectureDiagram"
import { CodeExample } from "@/components/docs/CodeExample"
import { CodeWalkthrough } from "@/components/docs/CodeWalkthrough"
import { slugify } from "@/lib/docs/slugify"
import { ProjectArchitectureTree } from "@/components/docs/ProjectArchitectureTree"
import { ProjectArchitectureLayers } from "./components/docs/ProjectArchitectureLayers"

function getHeadingText(children: React.ReactNode): string {
  return Children.toArray(children).join("").trim()
}

function HeadingAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label="Lien direct vers cette section"
      className="ml-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
    >
      #
    </a>
  )
}

export const mdxComponents: MDXComponents = {
  Callout,
  CodeBlock,
  CodeExample,
  CodeWalkthrough,
  FileTree,
  FileTreeItem,
  ArchitectureDiagram,
  ProjectArchitectureTree,
  ProjectArchitectureLayers,

  h1: ({ children, ...props }) => (
    <h1
      {...props}
      className="mt-8 mb-4 scroll-mt-24 text-3xl font-bold tracking-tight"
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => {
    const id = slugify(getHeadingText(children))

    return (
      <h2
        {...props}
        id={id}
        className="group mt-10 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight"
      >
        <span>{children}</span>
        <HeadingAnchor id={id} />
      </h2>
    )
  },

  h3: ({ children, ...props }) => {
    const id = slugify(getHeadingText(children))

    return (
      <h3
        {...props}
        id={id}
        className="group mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight"
      >
        <span>{children}</span>
        <HeadingAnchor id={id} />
      </h3>
    )
  },

  p: (props) => <p className="mb-4 leading-7" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-2 pl-6" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-4 border-l-4 pl-4 italic" {...props} />
  ),
  code: (props) => (
    <code
      className="rounded bg-black/5 px-1.5 py-0.5 text-sm dark:bg-white/10"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-xl bg-black p-4 text-sm text-white"
      {...props}
    />
  ),
  a: (props) => <a className="underline underline-offset-4" {...props} />,
}

export function useMDXComponents(
  components: MDXComponents
): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  }
}