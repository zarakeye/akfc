import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import type { Heading, PhrasingContent, Root } from "mdast"

import type { TocItem } from "@/lib/docs/docs.types"

function extractText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if ("value" in node && typeof node.value === "string") {
        return node.value
      }

      if ("children" in node && Array.isArray(node.children)) {
        return extractText(node.children as PhrasingContent[])
      }

      return ""
    })
    .join("")
}

export function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root
  const toc: TocItem[] = []

  visit(tree, "heading", (node: Heading) => {
    const text = extractText(node.children)

    if (!text.trim()) return

    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-")

    toc.push({
      depth: node.depth,
      value: text,
      id,
    })
  })

  return toc
}
