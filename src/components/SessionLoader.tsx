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
  const { fetchUser, user, loading } = useUserStore();
 
  const { fetchCategories } = useCategoryStore();
  const { fetchCourses } = useCourseStore();

  // 🔑 1. Charger la session UNE FOIS
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 📦 2. Charger les données métier APRES auth
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchCourses();
    }
  }, [user, fetchCategories, fetchCourses]);

  if (loading) {
    return <div>Loading...</div>; // ou spinner
  }

  return <>{children}</>;
}