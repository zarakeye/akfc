import type { MDXComponents } from "mdx/types"

import { Callout } from "@/components/docs/Callout"
import { CodeBlock } from "@/components/docs/CodeBlock"

export const mdxComponents: MDXComponents = {
  Callout,
  CodeBlock,
  h1: (props) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold tracking-tight" {...props} />
  ),
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