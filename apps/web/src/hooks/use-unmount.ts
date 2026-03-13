"use client"

import { useEffect, useEffectEvent } from "react"

/**
 * Hook that executes a callback when the component unmounts.
 *
 * React 19+ version using useEffectEvent to avoid stale closures
 * without having to manage a ref manually.
 */
export const useUnmount = (callback: () => void) => {
  const onUnmount = useEffectEvent(callback)

  useEffect(() => {
    return () => {
      onUnmount()
    }
  }, [])
}

export default useUnmount