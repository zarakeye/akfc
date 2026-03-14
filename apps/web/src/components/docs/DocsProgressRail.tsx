"use client"

import { useEffect, useMemo, useState } from "react"

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function DocsProgressRail() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight

      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }

      setProgress(clamp((scrollTop / scrollHeight) * 100, 0, 100))
    }

    updateProgress()

    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)

    return () => {
      window.removeEventListener("scroll", updateProgress)
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    })
  }

  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:flex">
      <div className="flex flex-col items-center gap-3 rounded-full border bg-background/85 px-2 py-3 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Aller au début"
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ↑
        </button>

        <div className="relative h-40 w-1 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute bottom-0 left-0 w-full rounded-full bg-primary transition-[height] duration-150"
            style={progressStyle}
          />
        </div>

        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Aller à la fin"
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ↓
        </button>
      </div>
    </div>
  )
}