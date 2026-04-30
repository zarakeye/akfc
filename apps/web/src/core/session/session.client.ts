"use client";

import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * session.client.ts
 *
 * Le store exporte useSessionStore (pas SessionUser/useUserStore).
 * On expose ici une API client simple, sans casser le typage.
 */

export type SessionUser = NonNullable<
  ReturnType<typeof useSessionStore.getState>["session"]
>["user"];

/**
 * Returns the current user session's user object if available, otherwise null.
 * @returns {SessionUser | null} - The user object if available, otherwise null.
 */
export function getSessionUser(): SessionUser | null {
  return useSessionStore.getState().session?.user ?? null;
}

/**
 * Checks if the user is currently authenticated.
 * @returns {boolean} - True if the user is authenticated, false otherwise.
 */
export function isLoggedIn(): boolean {
  return !!useSessionStore.getState().session?.user;
}