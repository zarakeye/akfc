'use client';

import { useEffect } from "react";

import type { SessionClient } from "@contracts/auth/session.types";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { trpcClient } from "@trpc/trpcClient";
import { InitialSessionProvider } from "@features/auth/InitialSession";

/**
 * Initialise le store de session.
 *
 * Le layout racine lit la session CÔTÉ SERVEUR et la passe ici (`initialSession`, null pour
 * un visiteur) : le store est alors rempli sans requête, et `InitialSessionProvider` rend
 * cette valeur disponible dès le premier rendu (voir useCurrentUser). Sans valeur serveur
 * (`undefined`), on retombe sur l'ancien comportement : demander la session à l'API.
 */
export function SessionLoader({
  initialSession,
  children,
}: {
  initialSession?: SessionClient | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const store = useSessionStore.getState();
    if (initialSession !== undefined) {
      store.hydrate(initialSession);
      return;
    }
    let cancelled = false;
    trpcClient.auth.getSession
      .query()
      .then((session) => {
        if (!cancelled) store.hydrate(session ?? null);
      })
      .catch(() => {
        if (!cancelled) store.hydrate(null);
      });
    return () => {
      cancelled = true;
    };
  }, [initialSession]);

  return <InitialSessionProvider session={initialSession ?? null}>{children}</InitialSessionProvider>;
}
