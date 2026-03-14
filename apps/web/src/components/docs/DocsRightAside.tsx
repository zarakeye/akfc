"use client"

import { useEffect, useMemo, useState } from "react"

import type { TocItem } from "@/lib/docs/docs.types"

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getCenterScrollContainer(): HTMLElement | null {
  return document.getElementById("docs-content-scroll")
}

export function DocsRightAside({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = getCenterScrollContainer()
    if (!container) return

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    if (!headings.length) return

    const updateActiveHeading = () => {
      const containerTop = container.getBoundingClientRect().top

      let current: string | null = null

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect()
        if (rect.top - containerTop <= 120) {
          current = heading.id
        }
      }

      setActiveId(current ?? headings[0]?.id ?? null)
    }

    updateActiveHeading()

    container.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)

    return () => {
      container.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
    }
  }, [items])

  useEffect(() => {
    const container = getCenterScrollContainer()
    if (!container) return

    const updateProgress = () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight - container.clientHeight

      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }

      setProgress(clamp((scrollTop / scrollHeight) * 100, 0, 100))
    }

    updateProgress()

    container.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      container.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  const progressStyle = useMemo(
    () => ({
      height: `${progress}%`,
    }),
    [progress]
  )

  const scrollToTop = () => {
    const container = getCenterScrollContainer()
    if (!container) return

    container.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToBottom = () => {
    const container = getCenterScrollContainer()
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }

  if (!items.length) return null

  return (
    <div className="grid h-full min-h-0 grid-cols-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
      <div className="flex h-full w-8 shrink-0 flex-col items-center rounded-full border bg-background/90 px-2 py-3 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Aller au début"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ↑
        </button>

        <div className="my-3 flex min-h-0 flex-1 items-stretch">
          <div className="relative h-full w-[2px] overflow-hidden rounded-full bg-muted/60">
            <div
              className="absolute bottom-0 left-0 w-full rounded-full bg-primary transition-[height] duration-150"
              style={progressStyle}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Aller à la fin"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ↓
        </button>
      </div>

      <div className="min-h-0 rounded-xl border bg-background/70 p-4 backdrop-blur">
        <div className="scrollbar-hidden h-full overflow-y-hidden hover:overflow-y-auto focus-within:overflow-y-auto">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            On this page
          </p>

          <ul className="space-y-2 text-sm">
            {items.map((item) => {
              const active = activeId === item.id

              return (
                <li
                  key={item.id}
                  style={{
                    marginLeft: `${Math.max(item.depth - 2, 0) * 12}px`,
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    className={`transition-colors ${
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.value}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}