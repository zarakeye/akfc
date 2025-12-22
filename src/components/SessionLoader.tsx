'use client';

import { useEffect } from "react";
import { useUserStore } from "@lib/stores/useUserStore";

/**
 * A component that loads the user session on mount.
 * It fetches the user from the API and stores it in the useUserStore.
 * It then renders the children component.
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The children component to render.
 */
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);
  const setSession = useUserStore((state) => state.setSession);

  useEffect(() => {
    fetchUser();

    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem("session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSession(parsed);
        } catch {
          window.sessionStorage.removeItem("session");
        }
      }

      
    }
  }, [fetchUser, setSession]);

  return <>{children}</>;
}