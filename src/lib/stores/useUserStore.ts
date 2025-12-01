import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import type { User as PrismaUser, Role as PrismaRole } from "@prisma/client";
import { boolean } from "zod";

export interface SessionUser extends PrismaUser {
  role: PrismaRole;
}

interface UserState {
  user: SessionUser | null;
  loading: boolean;
  setUser: (u: SessionUser | null) => void;
  fetchUser: () => Promise<boolean>;
  logout: () => Promise<boolean>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  loading: false,
  
  setUser: (u: SessionUser | null) => set({ user: u }),
  
  /**
   * Fetches the user from the API and updates the user state.
   * It sets the loading state to true before making the request,
   * and sets it to false once the request has completed.
   * If the request is successful, it sets the user state to the
   * retrieved user. If the request fails, it sets the user state
   * to null.
   */
  fetchUser: async (): Promise<boolean> => {
    set({ loading: true });

    try {
      const userData = await trpcClient.auth.me.query();

      if (!userData) {
        set({ user: null, loading: false });
        return false;
      }
      
      let fullRole: PrismaRole | null = null;
      if (userData.roleId) {
        fullRole = await trpcClient.role.getById.query({ id: userData.roleId });
      }

      const user: SessionUser = {
        ...userData,
        role: fullRole!
      };

      set({ user, loading: false });
      return true;
    } catch {
      set({ user: null, loading: false });
      return false;
    }
  },

  /**
   * Logs the user out of the application by calling the logout mutation.
   * This sets the user state to null.
   */
  logout: async (): Promise<boolean> =>{
    try {
      await trpcClient.auth.logout.mutate();
      set({ user: null });
      return true;
    } catch {
      return false;
    }
  },
}));