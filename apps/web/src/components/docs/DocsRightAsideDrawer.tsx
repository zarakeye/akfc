"use client"

import { useState } from "react"
import { DocsRightAside } from "./DocsRightAside"
import type { TocItem } from "@/lib/docs/docs.types"

export function DocsRightAsideDrawer({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)

  if (!items.length) return null

  return (
    <>
      {/* bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 rounded-full border bg-background px-4 py-2 text-sm shadow-lg hover:bg-muted"
      >
        On this page
      </button>

      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[320px] border-l bg-background shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-semibold">On this page</div>

          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="h-full overflow-y-auto p-4">
          <DocsRightAside items={items} />
        </div>
      </div>
    </>
  )
}