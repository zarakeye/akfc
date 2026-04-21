import type { MDXComponents } from "mdx/types"
import { Children, isValidElement } from "react"
import type { ReactNode, ReactElement } from "react"

import { Callout } from "@/features/docs/ui/Callout"
import { CodeBlock } from "@/features/docs/ui/CodeBlock"
import CodeSnippet from "@/features/docs/ui/CodeSnippet"
import CodeSnippetWalkthrough from "@/features/docs/ui/CodeSnippetWalkthrough"
import { FileTree, FileTreeItem } from "@/features/docs/ui/FileTree"
import { ArchitectureDiagram } from "@/features/docs/ui/ArchitectureDiagram"
import { CodeExample } from "@/features/docs/ui/CodeExample"
import { CodeWalkthrough } from "@/features/docs/ui/CodeWalkthrough"
import { slugifyHeading } from "@/features/docs/lib/slugifyHeading"
import { ProjectArchitectureTree } from "@/features/docs/ui/ProjectArchitectureTree"
import { ProjectArchitectureLayers } from "@/features/docs/ui/ProjectArchitectureLayers"
import { AuthFlowDiagram } from "@/features/docs/diagrams/AuthFlowDiagram"
import { TRPCFlowDiagram } from "@/features/docs/diagrams/TRPCFlowDiagram"
import { Step } from "@/features/docs/ui/Step"
import { SvgDiagram } from "@/features/docs/components/SvgDiagram"
import PrismaCoreErdDiagram from "@/features/docs/diagrams/PrismaCoreErdDiagram"
import PrismaCoreMemoryDiagram from "@/features/docs/diagrams/PrismaCoreMemoryDiagram"
import PropsProbe from "@/features/docs/ui/PropsProbe"
import DocsTable from "@/features/docs/ui/DocsTable"

function extractHeadingText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return ""
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractHeadingText).join("")
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>
    return extractHeadingText(element.props.children)
  }

  return ""
}

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
  CodeSnippet,
  CodeSnippetWalkthrough,
  FileTree,
  FileTreeItem,
  ArchitectureDiagram,
  ProjectArchitectureTree,
  ProjectArchitectureLayers,
  AuthFlowDiagram,
  TRPCFlowDiagram,
  Step,
  SvgDiagram,
  PrismaCoreErdDiagram,
  PrismaCoreMemoryDiagram,
  PropsProbe,
  DocsTable,

  h1: ({ children, ...props }) => (
    <h1
      {...props}
      className="mt-8 mb-4 scroll-mt-24 text-3xl font-bold tracking-tight"
    >
      {children}
    </h1>
  ),

    h2: ({ children, ...props }) => {
    const text = extractHeadingText(children).trim()
    const id = slugifyHeading(text)

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
    const text = extractHeadingText(children).trim()
    const id = slugifyHeading(text)

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