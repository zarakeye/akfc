"use client";

import { useSessionStore } from "@/lib/stores/useSessionStore";

/**
 * session.client.ts
 *
 * Le store exporte useSessionStore (pas SessionUser/useUserStore).
 * On expose ici une API client simple, sans casser le typage.
 */

export type SessionUser = NonNullable<
  ReturnType<typeof useSessionStore.getState>["session"]
>["user"];

export function getSessionUser(): SessionUser | null {
  return useSessionStore.getState().session?.user ?? null;
}

export function isLoggedIn(): boolean {
  return !!useSessionStore.getState().session?.user;
}