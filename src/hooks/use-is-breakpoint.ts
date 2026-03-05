"use client"

import { useMemo, useSyncExternalStore } from "react"

type BreakpointMode = "min" | "max"

const isClient = () => typeof window !== "undefined"

/**
 * Subscribe to media query changes.
 *
 * @param {string} query - The media query string.
 * @param {() => void} onStoreChange - The callback function to be called when the media query matches.
 * @returns {() => void} - A function to unsubscribe from the media query changes.
 */
function subscribeMediaQuery(query: string, onStoreChange: () => void) {
  if (!isClient()) return () => {}

  const mql = window.matchMedia(query)
  const handler = () => onStoreChange()

  mql.addEventListener("change", handler)
  return () => mql.removeEventListener("change", handler)
}

/**
 * Returns a snapshot of the media query's match status.
 *
 * @param {string} query - The media query string.
 * @returns {boolean} - True if the media query matches, false otherwise.
 * @note This function only works on the client-side.
 */
function getMediaQuerySnapshot(query: string) {
  if (!isClient()) return false
  return window.matchMedia(query).matches
}

/**
 * A hook that subscribes to media query changes and returns a snapshot of the match status.
 *
 * @param {BreakpointMode} mode - The type of breakpoint to use. Either "min" or "max".
 * @param {number} breakpoint - The breakpoint size in pixels.
 * @returns {boolean} - True if the media query matches, false otherwise.
 * @example
 * const isLargeScreen = useIsBreakpoint("min", 1024)
 */
export function useIsBreakpoint(
  mode: BreakpointMode = "max",
  breakpoint = 768
) {
  const query = useMemo(() => {
    return mode === "min"
      ? `(min-width: ${breakpoint}px)`
      : `(max-width: ${breakpoint - 1}px)`
  }, [mode, breakpoint])

  return useSyncExternalStore(
    (onStoreChange) => subscribeMediaQuery(query, onStoreChange),
    () => getMediaQuerySnapshot(query),
    () => false
  )
}