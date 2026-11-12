"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"

import type { DocTarget } from "@features/docs/glossary/glossaryLinks"
import { rememberTermOrigin } from "@features/docs/glossary/glossaryReturn"

export interface CarteTerme {
  id: string
  terme: string
  definition: ReactNode
  definedIn: DocTarget
  glossaryHref: string
}

interface Ouverte {
  id: string
  anchor: string
  top: number
  left: number
  below: boolean
}

const OPEN_DELAY = 250
const CLOSE_DELAY = 150
const WIDTH = 320

/** Le terme sous un élément (ou l'élément lui-même), s'il en est un. */
function termAt(target: EventTarget | null): HTMLAnchorElement | null {
  return target instanceof Element ? target.closest<HTMLAnchorElement>("a[data-glossaire]") : null
}

/** Place la carte au-dessus du terme, ou dessous s'il manque de place, sans sortir de l'écran. */
function place(el: HTMLElement): Pick<Ouverte, "top" | "left" | "below"> {
  const r = el.getBoundingClientRect()
  const below = r.top < 200
  const left = Math.min(Math.max(12, r.left), window.innerWidth - WIDTH - 12)
  return { top: below ? r.bottom + 6 : r.top - 6, left, below }
}

/**
 * La seule partie interactive du glossaire dans une page. Elle écoute le document, et reconnaît
 * les termes à leur attribut `data-glossaire` :
 * - à la souris, la carte s'ouvre au survol, après un court délai, et reste ouverte tant que le
 *   pointeur est sur le terme ou sur la carte ;
 * - au clavier, elle s'ouvre au focus ; Échap la ferme ;
 * - au doigt (pas de survol), un premier appui ouvre la carte, le second suit le lien.
 * Tout clic qui quitte la page par un terme ou par la carte note d'abord l'endroit exact du terme,
 * pour que le « Retour » du glossaire y ramène.
 */
export function GlossaireCartesClient({ cartes, glossaryPath }: { cartes: CarteTerme[]; glossaryPath: string }) {
  const router = useRouter()
  const [ouverte, setOuverte] = useState<Ouverte | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const pointer = useRef("mouse")
  const ouverteRef = useRef<Ouverte | null>(null)

  useEffect(() => {
    const byId = new Set(cartes.map((c) => c.id))
    const set = (value: Ouverte | null) => {
      ouverteRef.current = value
      setOuverte(value)
    }
    const schedule = (fn: () => void, delay: number) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(fn, delay)
    }
    const open = (el: HTMLAnchorElement) => {
      const id = el.dataset.glossaire
      if (id && byId.has(id)) set({ id, anchor: el.id, ...place(el) })
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const el = termAt(e.target)
      if (el) schedule(() => open(el), OPEN_DELAY)
      else if (e.target instanceof Element && e.target.closest("[data-glossaire-carte]")) window.clearTimeout(timer.current)
    }
    const onOut = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const leaving = termAt(e.target) ?? (e.target instanceof Element ? e.target.closest("[data-glossaire-carte]") : null)
      const entering = e.relatedTarget instanceof Element && (termAt(e.relatedTarget) || e.relatedTarget.closest("[data-glossaire-carte]"))
      if (leaving && !entering) schedule(() => set(null), CLOSE_DELAY)
    }
    const onDown = (e: PointerEvent) => {
      pointer.current = e.pointerType
    }
    const onClick = (e: MouseEvent) => {
      const el = termAt(e.target)
      if (!el || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      e.preventDefault()
      if (pointer.current === "touch" && ouverteRef.current?.anchor !== el.id) {
        window.clearTimeout(timer.current)
        open(el)
        return
      }
      rememberTermOrigin(el.id, glossaryPath)
      router.push(el.getAttribute("href") ?? glossaryPath)
    }
    const onFocus = (e: FocusEvent) => {
      const el = termAt(e.target)
      if (el) open(el)
    }
    const onBlur = (e: FocusEvent) => {
      const next = e.relatedTarget
      if (termAt(e.target) && !(next instanceof Element && next.closest("[data-glossaire-carte]"))) schedule(() => set(null), CLOSE_DELAY)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") set(null)
    }
    const onScroll = () => set(null)
    document.addEventListener("pointerover", onOver)
    document.addEventListener("pointerout", onOut)
    document.addEventListener("pointerdown", onDown, true)
    document.addEventListener("click", onClick)
    document.addEventListener("focusin", onFocus)
    document.addEventListener("focusout", onBlur)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onScroll, { capture: true, passive: true })
    return () => {
      window.clearTimeout(timer.current)
      document.removeEventListener("pointerover", onOver)
      document.removeEventListener("pointerout", onOut)
      document.removeEventListener("pointerdown", onDown, true)
      document.removeEventListener("click", onClick)
      document.removeEventListener("focusin", onFocus)
      document.removeEventListener("focusout", onBlur)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll, { capture: true })
    }
  }, [cartes, glossaryPath, router])

  const carte = ouverte ? cartes.find((c) => c.id === ouverte.id) : undefined
  if (!ouverte || !carte) return null
  const remember = () => rememberTermOrigin(ouverte.anchor, glossaryPath)

  return (
    <div
      data-glossaire-carte=""
      role="tooltip"
      style={{ position: "fixed", top: ouverte.top, left: ouverte.left, width: WIDTH, transform: ouverte.below ? undefined : "translateY(-100%)" }}
      className="z-50 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg"
    >
      <p className="mb-1 font-semibold">{carte.terme}</p>
      <p className="leading-relaxed text-muted-foreground">{carte.definition}</p>
      <div className="mt-3 flex flex-col gap-1 text-xs">
        <Link href={carte.definedIn.href} onClick={remember} className="underline underline-offset-2 hover:text-foreground">
          Défini en {carte.definedIn.label}
        </Link>
        <Link href={carte.glossaryHref} onClick={remember} className="underline underline-offset-2 hover:text-foreground">
          Voir dans le glossaire →
        </Link>
      </div>
    </div>
  )
}
