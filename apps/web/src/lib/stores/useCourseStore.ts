import { create } from "zustand";
import { trpcClient } from "../../core/trpc/trpcClient";
import type { Course } from "@prisma/client";

export interface CourseStoreState {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: number) => Promise<Course | null>;
  // createCourse: (title: string, description: string) => Promise<void>;
  // updateCourse: (id: number, title: string, description: string) => Promise<void>;
  // deleteCourse: (id: number) => Promise<void>;
}

export const useCourseStore = create<CourseStoreState>((set, get): CourseStoreState => ({
  courses: [],
  setCourses: (courses: Course[]) => set({ courses }),

  /**
   * Fetches all courses from the server and updates the store.
   * Resolves with void when complete.
   */
  fetchCourses: async (): Promise<void> => {
    const courses = await trpcClient.course.getAll.query();
    set({ courses });
  },

  /**
   * Fetches a course from the server by its id.
   * Resolves with the course object if found, or null if not found.
   * @param id The id of the course to fetch.
   * @returns A promise that resolves with the course object or null.
   */
  fetchCourseById: async (id: number): Promise<Course | null> => {
    const course = await trpcClient.course.getById.query({ id });
    return course;
  },
  // createCourse: async (title: string, description: string) => {
  //   await trpcClient.course.create.mutate({ title, description });
  //   await get().fetchCourses();
  // },
  // updateCourse: async (id: number, title: string, description: string) => {
  //   await trpcClient.course.update.mutate({ id, title, description });
  //   await get().fetchCourses();
  // },
  // deleteCourse: async (id: number) => {
  //   await trpcClient.course.delete.mutate({ id });
  //   await get().fetchCourses();
  // },
}));