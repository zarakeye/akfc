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
  id: string
  depth: number
  value: string
  displayValue: string
}
