"use client"

import { useEffect, useMemo, useState } from "react"

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getCenterScrollContainer(): HTMLElement | null {
  return document.getElementById("docs-content-scroll")
}

export function DocsMainScrollControls() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = getCenterScrollContainer()
    if (!container) return

    const updateProgress = () => {
      const scrollTop = container.scrollTop
      const maxScroll = container.scrollHeight - container.clientHeight

      if (maxScroll <= 0) {
        setProgress(0)
        return
      }

      setProgress(clamp((scrollTop / maxScroll) * 100, 0, 100))
    }

    updateProgress()

    container.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      container.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  const bubbleStyle = useMemo(
    () => ({
      top: `calc(${progress}% - 14px)`,
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

  return (
    <div className="pointer-events-none absolute inset-y-6 right-0 hidden w-16 xl:block">
      <div className="relative h-full">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Aller au début"
          className="pointer-events-auto absolute right-0 top-0 z-50 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
        >
          ↑
        </button>

        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Aller à la fin"
          className="pointer-events-auto absolute right-0 bottom-0 z-50 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
        >
          ↓
        </button>

        <div
          className="pointer-events-none absolute right- rounded-full border bg-background/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur transition-[top] duration-150"
          style={bubbleStyle}
        >
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  )
}