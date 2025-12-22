'use client';

import { t } from '@/server/trpc/core';
import { SessionUser, useUserStore } from '@lib/stores/useUserStore';

export function getClientSession(): SessionUser | null {
  return useUserStore.getState().user;
}

export function useClientSession(): SessionUser | null {
  const { user } = useUserStore();
  return user;
}

export function useClientSessionLoading(): boolean {
  const { loading } = useUserStore();
  return loading;
}

export function useClientSessionUser(): SessionUser | null {
  const { user } = useUserStore();
  return user;
}
export function useClientSessionFetchUser(): () => Promise<boolean> {
  const { fetchUser } = useUserStore();
  return fetchUser;
}


export function clientSessionLogout(): void {
  const logout = useUserStore.getState().logout;
  // return;
  logout();
}

export function updateSession(newJwt: string): void {
  const session = useUserStore.getState().session;
  const updatedSession = {
    ...session,
    token: newJwt
  }
}