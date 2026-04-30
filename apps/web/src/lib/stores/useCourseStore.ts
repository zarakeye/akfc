import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Course, Audience, Day } from "@prisma/client";

/**
 * useCourseStore
 *
 * Cache local des `Course` (créneaux hebdomadaires d'une Discipline de
 * catégorie "Cours"), aligné sur le nouveau modèle 2-niveaux.
 *
 * Convention : les méthodes de mutation appellent tRPC puis mettent à jour
 * le cache en place. Les méthodes de lecture exploitent le cache si possible.
 */

/* ----- Type JSON compatible avec ce que Zod 4 attend pour `z.json()` ----- */

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/* ----- Types d'input pour les mutations ----- */

export type CreateCourseInput = {
  disciplineId: number;
  audience: Audience;
  day: Day;
  beginTime: number;
  endTime: number;
  instructorId?: string | null;
  requisites?: string[];
  content: JsonValue;
};

export type UpdateCourseInput = {
  id: number;
  audience?: Audience;
  day?: Day;
  beginTime?: number;
  endTime?: number;
  instructorId?: string | null;
  requisites?: string[];
  content?: JsonValue;
};

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