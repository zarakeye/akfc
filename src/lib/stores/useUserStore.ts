import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import type { User as PrismaUser, Role as PrismaRole } from "@/generated/prisma/client";

interface User extends PrismaUser {
  role: PrismaRole;
}

interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  loading: false,
  
  setUser: (u: User | null) => set({ user: u }),
  
  /**
   * Fetches the user from the API and updates the user state.
   * It sets the loading state to true before making the request,
   * and sets it to false once the request has completed.
   * If the request is successful, it sets the user state to the
   * retrieved user. If the request fails, it sets the user state
   * to null.
   */
  fetchUser: async () => {
    set({ loading: true });

    try {
      const userData = await trpcClient.auth.me.query();

      if (!userData) {
        set({ user: null, loading: false });
        return;
      }
      
      let fullRole: PrismaRole | null = null;
      if (userData.roleId) {
        fullRole = await trpcClient.role.getById.query({ id: userData.roleId });
      }

      const user: User = {
        ...userData,
        role: fullRole!
      };

      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  /**
   * Logs the user out of the application by calling the logout mutation.
   * This sets the user state to null.
   */
  logout: async () => {
    await trpcClient.auth.logout.mutate();
    set({ user: null });
  }
}));