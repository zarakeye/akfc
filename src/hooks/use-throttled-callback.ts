"use client"

import throttle from "lodash.throttle"
import { useEffect, useMemo, useRef } from "react"
import { useUnmount } from "@/hooks/use-unmount"

interface ThrottleSettings {
  leading?: boolean
  trailing?: boolean
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
}

/**
 * A hook that returns a throttled callback function.
 *
 * Notes:
 * - We DO NOT use useEffectEvent here because the returned throttled function
 *   will be called outside of effects (e.g. DOM events), which violates the rules.
 * - We keep the latest `fn` in a ref (updated in an effect), and the throttled
 *   wrapper calls `fnRef.current`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = [],
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>
  cancel: () => void
  flush: () => void
} {
  const fnRef = useRef(fn)

  // Keep latest function WITHOUT mutating ref during render
  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const handler = useMemo(() => {
    const throttled = throttle(
      function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        return fnRef.current.apply(this, args)
      } as T,
      wait,
      options
    )

    return throttled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wait, options, ...dependencies])

  // Cancel pending calls when handler is replaced or component unmounts
  useEffect(() => {
    return () => {
      handler.cancel()
    }
  }, [handler])

  useUnmount(() => {
    handler.cancel()
  })

  return handler
}

export default useThrottledCallback