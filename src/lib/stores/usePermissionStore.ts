import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import type { Permission } from "@prisma/client";

interface PermissionState {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  fetchPermissions: () => void;
  createPermission: (name: string) => void;
  deletePermission: (id: number) => void;
}

export const usePermissionStore = create<PermissionState>()((set): PermissionState => ({
  permissions: [],
  setPermissions: (permissions: Permission[]) => set({ permissions }),

  /**
   * Fetches all permissions from the database and updates the store.
   * @returns {Promise<void>} - A promise that resolves when the permissions have been fetched and the store has been updated.
   */
  fetchPermissions: async (): Promise<void> => {
    const permissions = await trpcClient.permission.getAll.query();
    set({ permissions });
  },

  /**
   * Creates a new permission in the database with the given name.
   * Updates the store with the new permission.
   * @param {string} name - The name of the permission to create.
   * @returns {Promise<void>} - A promise that resolves when the permission has been created and the store has been updated.
   */
  createPermission: async (name: string): Promise<void> => {
    const newPermission = await trpcClient.permission.create.mutate({ name });
    set((state) => ({
      permissions: [...state.permissions, newPermission],
    }));
  },

  /**
   * Deletes a permission from the database by its id.
   * Updates the store by removing the deleted permission.
   * @param {number} id - The id of the permission to delete.
   * @returns {Promise<void>} - A promise that resolves when the permission has been deleted and the store has been updated.
   */
  deletePermission: async (id: number): Promise<void> => {
    await trpcClient.permission.delete.mutate({ id });
    set((state) => ({
      permissions: state.permissions.filter((permission) => permission.id !== id),
    }));
  },
}));