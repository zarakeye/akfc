import type { MDXComponents } from "mdx/types"
import { isValidElement } from "react"
import type { ReactNode, ReactElement } from "react"

import { Callout } from "#features/docs/ui/Callout.tsx"
import { Promesse } from "#features/docs/ui/Promesse.tsx"
import { Terme } from "#features/docs/glossary/Terme.tsx"
import { Glossaire } from "#features/docs/glossary/Glossaire.tsx"
import { GlossaireCartes } from "#features/docs/glossary/GlossaireCartes.tsx"
import { CodeBlock } from "#features/docs/ui/CodeBlock.tsx"
import CodeSnippet from "#features/docs/ui/CodeSnippet.tsx"
import CodeSnippetWalkthrough from "#features/docs/ui/CodeSnippetWalkthrough.tsx"
import { FileTree, FileTreeItem } from "#features/docs/ui/FileTree.tsx"
import { ArchitectureDiagram } from "#features/docs/ui/ArchitectureDiagram.tsx"
import { CodeExample } from "#features/docs/ui/CodeExample.tsx"
import { CodeWalkthrough } from "#features/docs/ui/CodeWalkthrough.tsx"
import { slugifyHeading } from "#features/docs/lib/slugifyHeading.ts"
import { ProjectArchitectureTree } from "#features/docs/ui/ProjectArchitectureTree.tsx"
import { MdxCodeFence } from "#features/docs/ui/MdxCodeFence.tsx"
import { ProjectArchitectureLayers } from "#features/docs/ui/ProjectArchitectureLayers.tsx"
import { AuthFlowDiagram } from "#features/docs/diagrams/AuthFlowDiagram.tsx"
import { TRPCFlowDiagram } from "#features/docs/diagrams/TRPCFlowDiagram.tsx"
import { Step } from "#features/docs/ui/Step.tsx"
import { SvgDiagram } from "#features/docs/components/SvgDiagram.tsx"
import PrismaCoreErdDiagram from "#features/docs/diagrams/PrismaCoreErdDiagram.tsx"
import PrismaCoreMemoryDiagram from "#features/docs/diagrams/PrismaCoreMemoryDiagram.tsx"
import PropsProbe from "#features/docs/ui/PropsProbe.tsx"
import DocsTable from "#features/docs/ui/DocsTable.tsx"
import { TourStartButton } from "#features/tours/TourStartButton.tsx"
import { TourList } from "#features/tours/TourList.tsx"
import { StoryTabs } from "#features/docs/entities/EntityExplorer.tsx"
import { Os, OsTabs } from "#features/docs/ui/OsTabs.tsx"

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
  // « Nous y reviendrons » : une explication courte et le chapitre qui approfondit (numéro calculé).
  Promesse,
  Terme,
  Glossaire,
  GlossaireCartes,
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
  TourStartButton,
  TourList,
  SvgDiagram,
  PrismaCoreErdDiagram,
  PrismaCoreMemoryDiagram,
  PropsProbe,
  DocsTable,
  // Onglets des parcours d'un chapitre (rien hors d'un chapitre qui déclare ses entités).
  Parcours: StoryTabs,
  // Commandes par système (macOS, Linux, Windows via WSL 2), choix du lecteur retenu.
  OsTabs,
  Os,

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

  // Sous-sections d'un ###, sans ancre ni entrée dans « Sur cette page ».
  h4: (props) => <h4 className="mt-6 mb-2 text-lg font-semibold tracking-tight" {...props} />,

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
  // Blocs « ``` » : coloration syntaxique et chemin du fichier en en-tête (MdxCodeFence).
  pre: (props) => <MdxCodeFence>{props.children}</MdxCodeFence>,
  a: (props) => <a className="underline underline-offset-4" {...props} />,
}
