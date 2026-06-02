import { create } from "zustand";
import type { inferRouterInputs } from "@trpc/server";

import { trpcClient } from "@trpc/trpcClient";
import type { Course } from "@prisma/client";
import type { AppRouter } from "@backend/modules";

/* ----- Types d'input dérivés du router (source de vérité unique) ----- */

type RouterInputs = inferRouterInputs<AppRouter>;

export type CreateCourseInput = RouterInputs["course"]["create"];
export type UpdateCourseInput = RouterInputs["course"]["update"];

/* ----- État du store ----- */

export interface CourseStoreState {
  courses: Course[];
  setCourses: (courses: Course[]) => void;

  fetchCourses: () => Promise<void>;
  fetchCoursesByDiscipline: (disciplineId: number) => Promise<Course[]>;
  fetchCourseById: (id: number) => Promise<Course | null>;

  createCourse: (input: CreateCourseInput) => Promise<Course>;
  updateCourse: (input: UpdateCourseInput) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
}

export const useCourseStore = create<CourseStoreState>((set, get): CourseStoreState => ({
  courses: [],

  setCourses: (courses: Course[]) => set({ courses }),

  /**
   * Récupère tous les cours et écrase le cache.
   */
  fetchCourses: async (): Promise<void> => {
    const courses = await trpcClient.course.getAll.query();
    set({ courses });
  },

  /**
   * Récupère les cours d'une discipline donnée.
   * Ne touche pas au cache global (renvoyé pour usage UI ponctuel).
   */
  fetchCoursesByDiscipline: async (disciplineId: number): Promise<Course[]> => {
    return await trpcClient.course.getAllByDiscipline.query({ disciplineId });
  },

  /**
   * Récupère un cours par son id.
   * Si présent en cache, le retourne directement ; sinon va le chercher.
   */
  fetchCourseById: async (id: number): Promise<Course | null> => {
    const { courses } = get();
    const cached = courses.find((c) => c.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.course.getById.query({ id });
    } catch {
      return null;
    }
  },

  /**
   * Crée un cours en base et l'ajoute au cache.
   */
  createCourse: async (input: CreateCourseInput): Promise<Course> => {
    const created = await trpcClient.course.create.mutate(input);
    set((state) => ({ courses: [...state.courses, created] }));
    return created;
  },

  /**
   * Met à jour un cours en base et dans le cache.
   */
  updateCourse: async (input: UpdateCourseInput): Promise<Course> => {
    const updated = await trpcClient.course.update.mutate(input);
    set((state) => ({
      courses: state.courses.map((c) => (c.id === updated.id ? updated : c)),
    }));
    return updated;
  },

  /**
   * Supprime un cours en base et le retire du cache.
   */
  deleteCourse: async (id: number): Promise<void> => {
    await trpcClient.course.delete.mutate({ id });
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    }));
  },
}));