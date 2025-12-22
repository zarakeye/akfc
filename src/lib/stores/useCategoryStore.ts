import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import type { Category } from "@prisma/client";

export interface CategoryState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<Category | null>;
  fetchCategoryByType: (type: string) => Promise<Category | null>;
  createCategory: (type: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, type: string) => Promise<Category>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  setCategories: (categories: Category[]) => set({ categories }),
  fetchCategories: async () => {
    console.log("Fetching categories...");
    const categories = await trpcClient.category.getAll.query();
    console.log(`categories: ${categories}`);
    set({ categories });
  },

  fetchCategoryById: async (id: number) => {
    const { categories } = get();
    
    const categoryCached = categories.find((category) => category.id === id);
    if (categoryCached) {
      return categoryCached;
    } else {
      const category = await trpcClient.category.getById.query({ id });
      return category;
    }
  },
  fetchCategoryByType: async (type: string) => {
    const { categories } = get();
    
    const categoryCached = categories.find((category) => category.type === type);
    if (categoryCached) {
      return categoryCached;
    } else {
      const category = await trpcClient.category.getByType.query({ type });
      return category;
    }
  },
  createCategory: async (type: string) => {
    const newCategory = await trpcClient.category.create.mutate({ type });
    set((state) => ({
      categories: [...state.categories, newCategory],
    }))
  },
  deleteCategory: async (id: number) => {
    await trpcClient.category.delete.mutate({ id });
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }))
  },
  updateCategory: async (id: number, type: string) => {
    const updated = await trpcClient.category.update.mutate({ id, type });

    set((state) => ({
      categories: state.categories.map((category) => category.id === id ? updated : category),
    }))

    return updated;
  },
}));