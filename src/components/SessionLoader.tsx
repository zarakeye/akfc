'use client';

import { useEffect } from "react";
import { useUserStore } from "@lib/stores/useUserStore";
import { useCategoryStore } from "@/lib/stores/useCategoryStore";
// import { useActivityStore } from "@/lib/stores/useActivityStore";
import { useCourseStore } from "@/lib/stores/useCourseStore";
// import { useStageStore } from "@/lib/stores/useStageStore";
// import { useEventStore } from "@/lib/stores/useEventStore";

/**
 * A component that loads the user session on mount.
 * It fetches the user from the API and stores it in the useUserStore.
 * It then renders the children component.
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The children component to render.
 */
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);
  const user = useUserStore((state) => state.user);
  console.log('SessionLoader user : ', user);
  const setSession = useUserStore((state) => state.setSession);
  const session = useUserStore((state) => state.session);
  console.log('SessionLoader session : ', session);
  const { fetchCategories } = useCategoryStore();
  const { fetchCourses } = useCourseStore();
  // const { fetchActivities } = useActivityStore();
  // const { fetchStages } = useStageStore();
  // const { fetchEvents } = useEventStore();

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

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchCourses();
      // fetchActivities();
      // fetchStages();
      // fetchEvents();
    }
  }, [user, fetchCategories, fetchCourses]);

  return <>{children}</>;
}