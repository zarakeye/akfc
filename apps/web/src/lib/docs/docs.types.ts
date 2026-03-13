export interface DocFrontmatter {
  title: string
  description?: string
  section?: string
  order?: number
}

export interface DocPage extends DocFrontmatter {
  slug: string[]
}

export interface TocItem {
  depth: number
  value: string
  id: string
}
