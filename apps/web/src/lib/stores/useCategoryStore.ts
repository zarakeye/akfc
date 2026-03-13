import { create } from "zustand";
import { trpcClient } from "@/lib/trpcClient";
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

export const useCategoryStore = create<CategoryState>((set, get): CategoryState => ({
  categories: [],
  setCategories: (categories: Category[]) => set({ categories }),
  
  /**
   * Fetches all categories from the database and updates the state.
   * The categories are fetched using the trpcClient.category.getAll hook.
   * The state is updated using the setCategories method.
   * @returns {Promise<void>} A promise that resolves when the categories are fetched and the state is updated.
   */
  fetchCategories: async (): Promise<void> => {
    console.log("Fetching categories...");
    const categories = await trpcClient.category.getAll.query();
    console.log(`categories: ${categories}`);
    set({ categories });
  },

  /**
   * Fetches a category by its id from the database and returns it.
   * If the category is already cached in the state, it is returned directly.
   * Otherwise, the category is fetched using the trpcClient.category.getById hook.
   * @param {number} id The id of the category to fetch.
   * @returns {Promise<Category | null>} A promise that resolves with the category if found, or null otherwise.
   */
  fetchCategoryById: async (id: number): Promise<Category | null> => {
    const { categories } = get();
    
    const categoryCached = categories.find((category) => category.id === id);
    if (categoryCached) {
      return categoryCached;
    } else {
      const category = await trpcClient.category.getById.query({ id });
      return category;
    }
  },

  /**
   * Fetches a category by its type from the database and returns it.
   * If the category is already cached in the state, it is returned directly.
   * Otherwise, the category is fetched using the trpcClient.category.getByType hook.
   * @param {string} type The type of the category to fetch.
   * @returns {Promise<Category | null>} A promise that resolves with the category if found, or null otherwise.
   */
  fetchCategoryByType: async (type: string): Promise<Category | null> => {
    const { categories } = get();
    
    const categoryCached = categories.find((category) => category.type === type);
    if (categoryCached) {
      return categoryCached;
    } else {
      const category = await trpcClient.category.getByType.query({ type });
      return category;
    }
  },

  /**
   * Creates a new category in the database with the given type.
   * The new category is then added to the state.
   * @param {string} type The type of the category to create.
   * @returns {Promise<void>} A promise that resolves when the category is created.
   */
  createCategory: async (type: string): Promise<void> => {
    const newCategory = await trpcClient.category.create.mutate({ type });
    set((state) => ({
      categories: [...state.categories, newCategory],
    }))
  },

  /**
   * Deletes a category from the database and removes it from the state.
   * @param {number} id The id of the category to delete.
   * @returns {Promise<void>} A promise that resolves when the category is deleted.
   */
  deleteCategory: async (id: number): Promise<void> => {
    await trpcClient.category.delete.mutate({ id });
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }))
  },

  /**
   * Updates a category in the database and updates the state.
   * @param {number} id The id of the category to update.
   * @param {string} type The new type of the category.
   * @returns {Promise<Category>} A promise that resolves with the updated category.
   */
  updateCategory: async (id: number, type: string): Promise<Category> => {
    const updated = await trpcClient.category.update.mutate({ id, type });

    set((state) => ({
      categories: state.categories.map((category) => category.id === id ? updated : category),
    }))

    return updated;
  },
}));