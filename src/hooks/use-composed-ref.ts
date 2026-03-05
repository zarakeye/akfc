"use client"

import { useCallback, useRef } from "react"

// basically Exclude<React.ClassAttributes<T>["ref"], string>
type UserRef<T> =
  | ((instance: T | null) => void)
  | React.RefObject<T | null>
  | null
  | undefined

const updateRef = <T>(ref: NonNullable<UserRef<T>>, value: T | null) => {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref && typeof ref === "object" && "current" in ref) {
    ;(ref as { current: T | null }).current = value
  }
}

/**
 * A hook that composes a ref from an internal ref and a user ref.
 * This is useful for situations where you need to pass a ref to a component
 * that also needs to be accessed from outside of that component.
 * @example
 * const MyComponent = () => {
 *   const internalRef = useRef<HTMLDivElement>(null)
 *   const userRef = useComposedRef(internalRef)
 *
 *   return <div ref={userRef}>My Component</div>
 * }
 * @param internalRef The internal ref to be composed into the user ref.
 * @param userRef The user ref to be composed into.
 * @returns A new ref that contains the value of the internalRef and the userRef.
 */
export const useComposedRef = <T extends HTMLElement>(
  internalRef: React.MutableRefObject<T | null>,
  userRef: UserRef<T>
) => {
  const prevUserRef = useRef<UserRef<T>>(null)

  return useCallback(
    (instance: T | null) => {
      internalRef.current = instance

      if (prevUserRef.current) {
        updateRef(prevUserRef.current, null)
      }

      prevUserRef.current = userRef

      if (userRef) {
        updateRef(userRef, instance)
      }
    },
    [internalRef, userRef]
  )
}

export default useComposedRef