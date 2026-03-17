"use client"

import { useEffect, useState } from "react"

export function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!ids.length) return

    const observers: IntersectionObserver[] = []

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px", // déclenche quand le titre arrive vers le haut
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    elements.forEach((el) => observer.observe(el))
    observers.push(observer)

    return () => observers.forEach((o) => o.disconnect())
  }, [ids])

  return activeId
}