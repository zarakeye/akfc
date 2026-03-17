"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import MiniSearch from "minisearch"

export interface SearchDoc {
  id: string
  title: string
  section?: string
  slug: string
  content: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getSnippet(content: string, query: string, radius = 80): string {
  const cleanContent = content.trim()
  const cleanQuery = query.trim()

  if (!cleanContent) return ""
  if (!cleanQuery) {
    return cleanContent.length > radius * 2
      ? `${cleanContent.slice(0, radius * 2).trim()}…`
      : cleanContent
  }

  const terms = cleanQuery
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)

  if (!terms.length) {
    return cleanContent.length > radius * 2
      ? `${cleanContent.slice(0, radius * 2).trim()}…`
      : cleanContent
  }

  const lowerContent = cleanContent.toLowerCase()

  let matchIndex = -1
  let matchLength = 0

  for (const term of terms) {
    const index = lowerContent.indexOf(term.toLowerCase())
    if (index !== -1) {
      matchIndex = index
      matchLength = term.length
      break
    }
  }

  if (matchIndex === -1) {
    return cleanContent.length > radius * 2
      ? `${cleanContent.slice(0, radius * 2).trim()}…`
      : cleanContent
  }

  const start = Math.max(0, matchIndex - radius)
  const end = Math.min(
    cleanContent.length,
    matchIndex + matchLength + radius
  )

  const prefix = start > 0 ? "…" : ""
  const suffix = end < cleanContent.length ? "…" : ""

  return `${prefix}${cleanContent.slice(start, end).trim()}${suffix}`
}

function highlightSnippet(snippet: string, query: string): string {
  const terms = query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  if (!terms.length) return snippet

  const pattern = terms.map(escapeRegExp).join("|")
  const regex = new RegExp(`(${pattern})`, "gi")

  return snippet.replace(regex, "<mark>$1</mark>")
}

function highlightTitle(title: string, query: string): string {
  const terms = query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)

  if (!terms.length) return title

  const escaped = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  const regex = new RegExp(`(${escaped})`, "gi")

  return title.replace(regex, "<mark>$1</mark>")
}

function parseQuery(query: string) {
  const tokens = query.toLowerCase().split(/\s+/)

  let section: string | null = null
  let titleOnly = false

  const terms: string[] = []

  for (const token of tokens) {
    if (token.startsWith("section:")) {
      section = token.replace("section:", "")
      continue
    }

    if (token === "tutorial" || token === "tutorials") {
      section = "tutorials"
      continue
    }

    if (token.startsWith("title:")) {
      titleOnly = true
      terms.push(token.replace("title:", ""))
      continue
    }

    terms.push(token)
  }

  return {
    section,
    titleOnly,
    terms: terms.join(" "),
  }
}

export default function DocsSearch({
  docs = [],
}: {
  docs?: SearchDoc[]
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const searchIndex = useMemo(() => {
    const miniSearch = new MiniSearch<SearchDoc>({
      fields: ["title", "content"],
      storeFields: ["id", "title", "slug", "section", "content"],
      searchOptions: {
        boost: { title: 6 },
        fuzzy: 0.2,
        prefix: true,
      },
      tokenize: (string) => string.split(/[\s\-_/]+/),
    })

    if (Array.isArray(docs) && docs.length > 0) {
      miniSearch.addAll(docs)
    }

    return miniSearch
  }, [docs])

  const results = useMemo(() => {
    if (!query.trim()) return []

    const parsed = parseQuery(query)

    const raw = searchIndex.search(parsed.terms || query)

    let filtered = raw

    if (parsed.section) {
      filtered = filtered.filter((r) =>
        r.section?.toLowerCase().includes(parsed.section!)
      )
    }

    if (parsed.titleOnly) {
      filtered = filtered.sort((a, b) => {
        const aScore = a.title.toLowerCase().includes(parsed.terms) ? 1 : 0
        const bScore = b.title.toLowerCase().includes(parsed.terms) ? 1 : 0
        return bScore - aScore
      })
    }

    return filtered.slice(0, 8)
  }, [query, searchIndex])

  const activeIndex =
    selectedIndex === null ? 0 : Math.min(selectedIndex, results.length - 1)

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }

      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (!results.length) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev === null ? 0 : Math.min(prev + 1, results.length - 1)
        )
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev === null ? 0 : Math.max(prev - 1, 0)
        )
      }

      if (e.key === "Enter") {
        e.preventDefault()
        const selected = results[activeIndex]
        if (!selected) return

        router.push(selected.slug)
        setOpen(false)
        setQuery("")
        setSelectedIndex(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, results, activeIndex, router])

  useEffect(() => {
    if (!resultsRef.current) return
    if (selectedIndex === null) return

    const el = resultsRef.current.querySelectorAll<HTMLButtonElement>(
      "[data-search-item]"
    )[selectedIndex]

    if (!el) return

    el.scrollIntoView({
      block: "nearest",
    })
  }, [selectedIndex])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setSelectedIndex(null);
        }}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
      >
        🔍 Search
        <span className="text-xs opacity-60">⌘K</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[680px] overflow-hidden rounded-xl border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(null)
              }}
              placeholder="Search docs..."
              className="w-full border-b px-4 py-3 outline-none"
            />

            <div
              ref={resultsRef}
              className="max-h-[420px] overflow-y-auto"
            >              
              {results.length ? (
                results.map((result, index) => {
                  const active = index === activeIndex
                  const snippet = getSnippet(result.content ?? "", query)
                  const highlightedSnippet = highlightSnippet(snippet, query)

                  return (
                    <button
                      key={result.id}
                      data-search-item
                      type="button"
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        router.push(result.slug)
                        setOpen(false)
                        setQuery("")
                        setSelectedIndex(null)
                      }}
                      className={`block w-full px-4 py-3 text-left transition-colors ${
                        active
                          ? "bg-muted ring-1 ring-primary/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div
                        className="text-sm font-medium [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-0.5 dark:[&_mark]:bg-yellow-500/30"
                        dangerouslySetInnerHTML={{
                          __html: highlightTitle(result.title, query),
                        }}
                      />

                      <div className="text-xs text-muted-foreground">
                        {result.section}
                      </div>

                      {snippet ? (
                        <p
                          className="mt-1 text-sm text-muted-foreground [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:text-foreground dark:[&_mark]:bg-yellow-500/30"
                          dangerouslySetInnerHTML={{
                            __html: highlightedSnippet,
                          }}
                        />
                      ) : null}
                    </button>
                  )
                })
              ) : query ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  Aucun résultat.
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  Commence à taper pour rechercher dans la documentation.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <span>↑ ↓ naviguer · Entrée ouvrir · Échap fermer · section:auth · title:router</span>

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setSelectedIndex(null)
                }}
                className="rounded-md px-2 py-1 hover:bg-muted hover:text-foreground"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}