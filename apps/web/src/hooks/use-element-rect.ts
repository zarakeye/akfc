"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

export type RectState = Omit<DOMRect, "toJSON">

export interface ElementRectOptions {
  /**
   * The element to track. Can be an Element, ref, or selector string.
   * Defaults to document.body if not provided.
   */
  element?: Element | React.RefObject<Element | null> | string | null
  /**
   * Whether to enable rect tracking
   */
  enabled?: boolean
  /**
   * Throttle delay in milliseconds for rect updates
   */
  throttleMs?: number
  /**
   * Whether to use ResizeObserver for more accurate tracking
   */
  useResizeObserver?: boolean
}

const initialRect: RectState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const isClient = () => typeof window !== "undefined"
const hasResizeObserver = () =>
  isClient() && typeof ResizeObserver !== "undefined"

const toRectState = (r: DOMRect): RectState => ({
  x: r.x,
  y: r.y,
  width: r.width,
  height: r.height,
  top: r.top,
  right: r.right,
  bottom: r.bottom,
  left: r.left,
})

export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver = true,
}: ElementRectOptions = {}): RectState {
  const [rect, setRect] = useState<RectState>(initialRect)

  const getTargetElement = useCallback((): Element | null => {
    if (!enabled || !isClient()) return null

    if (!element) return document.body

    if (typeof element === "string") {
      return document.querySelector(element)
    }

    if (typeof element === "object" && element && "current" in element) {
      return element.current
    }

    return element
  }, [element, enabled])

  const getTargetElementRef = useRef(getTargetElement)
  useEffect(() => {
    getTargetElementRef.current = getTargetElement
  }, [getTargetElement])

  const enabledRef = useRef(enabled)
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const updateNow = useCallback(() => {
    if (!enabledRef.current || !isClient()) return

    const target = getTargetElementRef.current()
    if (!target) return

    setRect(toRectState(target.getBoundingClientRect()))
  }, [])

  const updateRect = useThrottledCallback(
    () => {
      updateNow()
    },
    throttleMs,
    [throttleMs],
    { leading: true, trailing: true }
  )

  useEffect(() => {
    if (!isClient()) return
    if (enabled) return

    const id = window.requestAnimationFrame(() => setRect(initialRect))
    return () => window.cancelAnimationFrame(id)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !isClient()) return

    const target = getTargetElement()
    if (!target) return

    const firstId = window.requestAnimationFrame(() => updateRect())

    const handleUpdate = () => updateRect()

    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate, true)

    let resizeObserver: ResizeObserver | null = null
    if (useResizeObserver && hasResizeObserver()) {
      resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(() => updateRect())
      })
      resizeObserver.observe(target)
    }

    return () => {
      window.cancelAnimationFrame(firstId)
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate, true)
      resizeObserver?.disconnect()
    }
  }, [enabled, getTargetElement, updateRect, useResizeObserver])

  return rect
}

export function useBodyRect(
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({
    ...options,
    element: isClient() ? document.body : null,
  })
}

export function useRefRect<T extends Element>(
  ref: React.RefObject<T | null>,
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({
    ...options,
    element: ref,
  })
}