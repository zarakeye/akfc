'use client';

import { useEffect } from "react";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { trpc, trpcClient } from "@trpc/trpcClient";

/**
 * Charge la session utilisateur au montage : récupère la session via l'API
 * et la pousse dans `useSessionStore`, puis rend les enfants.
 */
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const loginSuccess = useSessionStore((state) => state.loginSuccess);
  const resetStatus = useSessionStore((state) => state.resetStatus);
  const setLoading = useSessionStore((state) => state.setLoading);
  // const { data: categories, isLoading, isError } = trpc.category.getAll.useQuery();

  useEffect(() => {
    async function hydrateSessionStore() {
      setLoading(true);

      try {
        const session = await trpcClient.auth.getSession.query();

        if (session) {
          loginSuccess(session);
        } else {
          resetStatus();
        }
      } finally {
        setLoading(false);
      }
    }

    hydrateSessionStore();
  }, [loginSuccess, resetStatus, setLoading]);

  return <>{children}</>;
}