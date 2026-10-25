"use client"

import { useEffect, useRef, useState } from "react"
import { List } from "lucide-react"
import { DocsRightAside } from "./DocsRightAside"
import type { TocItem } from "@features/docs/lib/docs.types"

export function DocsRightAsideDrawer({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

/**
 * Handles a click event outside the drawer element to close the drawer.
 *
 * @param {MouseEvent} event - The click event.
 */
      if (drawerRef.current && !drawerRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // ✅ le return conditionnel vient APRÈS les hooks
  if (!items.length) return null

  return (
    <>
      {/* Écran étroit : une pastille ronde, dans la marge droite gardée libre par DocsLayout. */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 inline-flex items-center justify-center rounded-full border bg-background px-4 py-2 text-sm shadow-lg hover:bg-muted max-lg:right-1.5 max-lg:bottom-3 max-lg:h-10 max-lg:w-10 max-lg:p-0"
      >
        <List className="hidden h-4 w-4 max-lg:block" aria-hidden="true" />
        <span className="max-lg:sr-only">On this page</span>
      </button>

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-[320px] border-l bg-background shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="text-sm font-semibold">On this page</div>

            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 p-4 pb-1">
            <DocsRightAside items={items} />
          </div>
        </div>
      </div>
    </>
  )
}

export default DocsRightAsideDrawer