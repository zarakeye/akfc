import { create } from "zustand";
import { trpcClient } from "../trpcClient";
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

export const useCourseStore = create<CourseStoreState>((set, get) => ({
  courses: [],
  setCourses: (courses: Course[]) => set({ courses }),
  fetchCourses: async () => {
    const courses = await trpcClient.course.getAll.query();
    set({ courses });
  },
  fetchCourseById: async (id: number) => {
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