"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

export type RectState = Omit<DOMRect, "toJSON">

export interface ElementRectOptions {
  /**
   * The element to track. Can be an Element, ref, or selector string.
   * Defaults to document.body if not provided.
   */
  element?: Element | React.RefObject<Element> | string | null
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
/**
 * Checks if the ResizeObserver API is available in the current environment.
 * Returns true if available, false otherwise.
 */
const hasResizeObserver = () =>
  isClient() && typeof ResizeObserver !== "undefined"

/**
 * Converts a DOMRect to a RectState object.
 * @param {DOMRect} r The DOMRect to convert.
 * @returns {RectState} The converted RectState object.
 */
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

/**
 * Hook that tracks the bounding client rect of an element.
 * Returns an object containing the element's bounding client rect properties.
 * Optionally uses ResizeObserver for more accurate tracking and throttles updates to avoid excessive re-renders.
 * @param {ElementRectOptions} options The options for the hook.
 * @param {Element | React.RefObject<Element> | string | null} options.element The element to track. Can be an Element, ref, or selector string. Defaults to document.body if not provided.
 * @param {boolean} options.enabled Whether to enable rect tracking. Defaults to true.
 * @param {number} options.throttleMs Throttle delay in milliseconds for rect updates. Defaults to 100.
 * @param {boolean} options.useResizeObserver Whether to use ResizeObserver for more accurate tracking. Defaults to true.
 * @returns {RectState} An object containing the element's bounding client rect properties.
 */
export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver = true,
}: ElementRectOptions = {}): RectState {
  const [rect, setRect] = useState<RectState>(initialRect)

  // Keep latest "resolver" in a ref to avoid stale closures in throttled handlers
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

  // Safe "update now" that always reads latest enabled + latest element resolver
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

  // Optional reset when disabled (scheduled to satisfy lint rule)
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

    // First measurement scheduled to avoid setState sync in effect body
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

/**
 * Hook that tracks the bounding client rect of the <body> element.
 * Will return the initial rect state if the hook is used server-side or if
 * the <body> element is not available.
 *
 * @param options The options to pass to `useElementRect`.
 * @returns The bounding client rect of the <body> element.
 */
export function useBodyRect(
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({
    ...options,
    element: isClient() ? document.body : null,
  })
}

/**
 * A variant of `useElementRect` that takes a `React.RefObject`
 * instead of an `Element` as the first argument.
 *
 * @template T
 * @param ref The `React.RefObject` to track.
 * @param options The options to pass to `useElementRect`.
 * @returns The bounding rect of the element.
 */
export function useRefRect<T extends Element>(
  ref: React.RefObject<T>,
  options: Omit<ElementRectOptions, "element"> = {}
): RectState {
  return useElementRect({ ...options, element: ref })
}