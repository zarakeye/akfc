"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/tiptap-utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ghost" | "white" | "gray" | "green" | "default"
  size?: "default" | "small"
  appearance?: "default" | "subdued" | "emphasized"
  trimText?: boolean
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant,
      size = "default",
      appearance = "default",
      trimText = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const badgeClasses = cn(
      "tiptap-badge inline-flex items-center justify-center border font-bold text-[0.625rem] leading-[1.15] h-5 min-w-[1.25rem] px-1 rounded-[var(--tt-radius-sm,0.375rem)] transition-colors duration-[var(--tt-transition-duration-default)] ease-[var(--tt-transition-easing-default)] border-[var(--tt-badge-border-color)] bg-[var(--tt-badge-bg-color)] text-[var(--tt-badge-text-color)]",
      size === "small" &&
        "h-4 min-w-[1rem] px-0.5 rounded-[var(--tt-radius-xs,0.25rem)]",
      trimText && "overflow-hidden whitespace-nowrap truncate",
      className
    )

    const badgeStyle = {
      ...style,
      fontFeatureSettings: '"salt" on, "cv01" on',
    } as React.CSSProperties

    return (
      <div
        ref={ref}
        className={badgeClasses}
        data-style={variant}
        data-size={size}
        data-appearance={appearance}
        data-text-trim={trimText ? "on" : "off"}
        style={badgeStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = "Badge"

export default Badge
