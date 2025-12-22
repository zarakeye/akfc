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

export const usePermissionStore = create<PermissionState>()((set) => ({
  permissions: [],
  setPermissions: (permissions: Permission[]) => set({ permissions }),
  fetchPermissions: async () => {
    const permissions = await trpcClient.permission.getAll.query();
    set({ permissions });
  },
  createPermission: async (name: string) => {
    const newPermission = await trpcClient.permission.create.mutate({ name });
    set((state) => ({
      permissions: [...state.permissions, newPermission],
    }));
  },
  deletePermission: async (id: number) => {
    await trpcClient.permission.delete.mutate({ id });
    set((state) => ({
      permissions: state.permissions.filter((permission) => permission.id !== id),
    }));
  },
}));