"use client"

import Link from "next/link"
import { useRef, useState, type ReactNode } from "react"
import { HoverCard } from "radix-ui"

import type { DocTarget } from "@features/docs/glossary/glossaryLinks"
import { rememberTermOrigin } from "@features/docs/glossary/glossaryReturn"

interface TermeCarteProps {
  anchor: string
  glossaryHref: string
  glossaryPath: string
  terme: string
  definition: ReactNode
  definedIn: DocTarget
  children: ReactNode
}

/**
 * Le terme souligné en pointillés, et sa carte.
 *
 * - À la souris : la carte s'ouvre au survol, après un court délai ; un clic mène au glossaire.
 * - Au clavier : la carte s'ouvre au focus.
 * - Au doigt (pas de survol) : un premier appui ouvre la carte, le second suit le lien.
 *
 * Tout clic qui quitte la page (vers le glossaire ou la définition) note d'abord l'endroit exact du
 * terme, pour que le « Retour » du glossaire y ramène.
 */
export function TermeCarte({ anchor, glossaryHref, glossaryPath, terme, definition, definedIn, children }: TermeCarteProps) {
  const [open, setOpen] = useState(false)
  const pointer = useRef<string>("mouse")
  const remember = () => rememberTermOrigin(anchor, glossaryPath)

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={250} closeDelay={150}>
      <HoverCard.Trigger asChild>
        <Link
          id={anchor}
          href={glossaryHref}
          onPointerDown={(e) => {
            pointer.current = e.pointerType
          }}
          onClick={(e) => {
            if (pointer.current === "touch" && !open) {
              e.preventDefault()
              setOpen(true)
              return
            }
            remember()
          }}
          className="scroll-mt-24 rounded-sm text-inherit underline decoration-muted-foreground/60 decoration-dotted decoration-1 underline-offset-[3px] hover:decoration-foreground target:bg-amber-100 dark:target:bg-amber-900/40"
        >
          {children}
        </Link>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-80 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg"
        >
          <p className="mb-1 font-semibold">{terme}</p>
          <p className="leading-relaxed text-muted-foreground">{definition}</p>
          <div className="mt-3 flex flex-col gap-1 text-xs">
            <Link href={definedIn.href} onClick={remember} className="underline underline-offset-2 hover:text-foreground">
              Défini en {definedIn.label}
            </Link>
            <Link href={glossaryHref} onClick={remember} className="underline underline-offset-2 hover:text-foreground">
              Voir dans le glossaire →
            </Link>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
