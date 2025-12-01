'use client';

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
export function useClientSessionFetchUser(): () => Promise<void> {
  const { fetchUser } = useUserStore();
  return fetchUser;
}

export function clientSessionLogout(): void {
  const logout = useUserStore.getState().logout;
  // return;
  logout();
}