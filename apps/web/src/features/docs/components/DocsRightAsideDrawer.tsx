"use client"

import { useEffect, useRef, useState } from "react"
import { DocsRightAside } from "./DocsRightAside"
import type { TocItem } from "@/features/docs/lib/docs.types"

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
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 rounded-full border bg-background px-4 py-2 text-sm shadow-lg hover:bg-muted"
      >
        On this page
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