'use client';

import { useEffect } from "react";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useCategoryStore } from "@/lib/stores/useCategoryStore";
// import { useActivityStore } from "@/lib/stores/useActivityStore";
import { useCourseStore } from "@/lib/stores/useCourseStore";
import { set } from "zod";
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
  const { fetchSession, user } = useSessionStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchCourses } = useCourseStore();

  // 🔑 1. Charger la session UNE FOIS
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 📦 2. Charger les données métier APRES auth
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchCourses();
    }
  }, [user, fetchCategories, fetchCourses]);

  return <>{children}</>;
}