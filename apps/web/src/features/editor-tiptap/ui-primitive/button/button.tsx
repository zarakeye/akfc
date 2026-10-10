"use client"

import { forwardRef, Fragment, useMemo } from "react"

// --- Tiptap UI Primitive ---
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/features/editor-tiptap/ui-primitive/tooltip"

// --- Lib ---
import { cn, parseShortcutKeys } from "@/lib/tiptap-utils"


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn("tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    const content = (
      <TooltipContent>
        {tooltip}
        <ShortcutDisplay shortcuts={shortcuts} />
      </TooltipContent>
    )

    // Un bouton désactivé ne reçoit aucun événement de souris : son infobulle ne s'ouvrirait
    // jamais. Or la barre d'outils désactive la plupart des boutons tant que le curseur n'est pas
    // dans le texte — précisément quand on veut savoir à quoi ils servent. On pose donc le
    // déclencheur sur une enveloppe, le bouton restant réellement désactivé.
    if (props.disabled) {
      return (
        <Tooltip delay={200}>
          <TooltipTrigger asChild>
            <span className="inline-flex" tabIndex={0}>
              <button
                className={cn("tiptap-button", className)}
                ref={ref}
                aria-label={ariaLabel}
                {...props}
              >
                {children}
              </button>
            </span>
          </TooltipTrigger>
          {content}
        </Tooltip>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn("tiptap-button", className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        {content}
      </Tooltip>
    )
  }
)

Button.displayName = "Button"

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("tiptap-button-group", className)}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

export default Button
