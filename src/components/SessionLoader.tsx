'use client';

import { useEffect } from "react";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useCategoryStore } from "@/lib/stores/useCategoryStore";
// import { useActivityStore } from "@/lib/stores/useActivityStore";
import { useCourseStore } from "@/lib/stores/useCourseStore";
// import { useStageStore } from "@/lib/stores/useStageStore";
// import { useEventStore } from "@/lib/stores/useEventStore";
import { trpcClient } from "@/lib/trpcClient";

/**
 * A component that loads the user session on mount.
 * It fetches the user from the API and stores it in the useUserStore.
 * It then renders the children component.
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The children component to render.
 */
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const loginSuccess = useSessionStore((state) => state.loginSuccess);
  const resetStatus = useSessionStore((state) => state.resetStatus);
  const setLoading = useSessionStore((state) => state.setLoading);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);

  // 📦 1. Charger les données métier AVANT auth
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
    fetchCategories();
    fetchCourses();
  }, [loginSuccess, resetStatus, setLoading, fetchCategories, fetchCourses]);
  return <>{children}</>;
}