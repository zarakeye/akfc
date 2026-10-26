"use client"

import { useEffect, useRef, useState } from "react"
import { List } from "lucide-react"
import { DocsRightAside } from "./DocsRightAside"
import { DocsAction, PILL, PILL_LABEL } from "@features/docs/lib/docsActions"
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
      {/* Rangé dans l'emplacement des boutons flottants (lib/docsActions.tsx) ; écran étroit :
          une pastille ronde. */}
      <DocsAction>
        <button
          onClick={() => setOpen(true)}
          className={`order-2 ${PILL}`}
        >
          <List className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={PILL_LABEL}>Sur cette page</span>
        </button>
      </DocsAction>

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-[320px] border-l bg-background shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="text-sm font-semibold">Sur cette page</div>

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