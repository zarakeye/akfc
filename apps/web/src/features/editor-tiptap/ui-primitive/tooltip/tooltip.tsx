"use client"

import { forwardRef } from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

/*
 * Infobulles de l'interface d'édition — sur Radix Tooltip.
 *
 * L'implémentation d'origine (gabarit Tiptap, sur @floating-ui/react) ne s'ouvrait jamais dans ce
 * projet : ni au survol, ni au focus ; et, posée sur le déclencheur d'un popover (surlignage), elle
 * empêchait aussi Radix de positionner ce popover (resté hors écran). Même API publique qu'avant
 * (Tooltip / TooltipTrigger / TooltipContent), donc aucun appelant à modifier.
 */

interface TooltipProps {
  children: React.ReactNode
  /** Délai d'ouverture au survol (ms). */
  delay?: number
  /** Conservés pour compatibilité avec l'ancienne API (sans effet). */
  closeDelay?: number
  timeout?: number
  useDelayGroup?: boolean
  placement?: "top" | "bottom" | "left" | "right"
  initialOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Tooltip({ children, delay = 600, initialOpen, open, onOpenChange }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay} skipDelayDuration={300}>
      <TooltipPrimitive.Root defaultOpen={initialOpen} open={open} onOpenChange={onOpenChange}>
        {children}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

type TriggerProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>

export const TooltipTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function TooltipTrigger(props, ref) {
  return <TooltipPrimitive.Trigger ref={ref} {...props} />
})

interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  /** Conservé pour compatibilité (le contenu est toujours rendu dans un portail). */
  portal?: boolean
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { children, portal: _portal, side = "top", sideOffset = 4, ...props },
  ref,
) {
  void _portal
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content ref={ref} side={side} sideOffset={sideOffset} className="tiptap-tooltip" {...props}>
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

Tooltip.displayName = "Tooltip"
TooltipTrigger.displayName = "TooltipTrigger"
TooltipContent.displayName = "TooltipContent"
