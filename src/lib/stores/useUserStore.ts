import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import { getSessionAction } from "@/server/actions/auth.action";
import { UserEnhanced, SessionEnhanced } from "@/types";

interface UserStore {
  clearSession: () => void;
  user: UserEnhanced; //UserWithRole;
  session: SessionEnhanced; //SessionWithUser;

  isAuthenticated: boolean;
  loading: boolean;

  // setUser: (u: UserEnhanced) => void;
  setSession: (s: SessionEnhanced) => void;

  fetchUser: () => Promise<void>;

  hasPermission: (permission: string) => boolean;

  logout: () => Promise<boolean>;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  session: null,
  loading: false,

  get isAuthenticated() {
    return !!get().user;
  },

  // setUser: (u: UserEnhanced) => set({ user: u }),

  /**
   * Sets the session and user in the store.
   * If the session is null, it clears the session and user in the store.
   * If the session is not null, it sets the session and user in the store.
   */
  setSession: (session: SessionEnhanced ) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  },

  /**
   * Clears the session and user in the store.
   * Sets the loading state to false.
   */
  clearSession: () => {
    set({
      session: null,
      user: null,
      loading: false,
    });
  },
  
  
  /**
   * Fetches the user session and sets it in the store.
   * If the session is null, it clears the session and user in the store.
   * If the session is not null, it sets the session and user in the store.
   * It also catches any errors and logs them to the console.
   * It then clears the session and user in the store.
   */
  fetchUser: async (): Promise<void> => {
    try {
      const session = await getSessionAction();

      if (!session) {
        get().clearSession();

        return;
      }

      get().setSession(session);
    } catch (err) {
      console.error("fetchUser error: ", err);
      get().clearSession();
    }
  },

  /**
   * Checks if the user has the given permission.
   * It returns true if the user has the permission, and false otherwise.
   * @param {string} permission - The permission to check.
   * @returns {boolean} - True if the user has the permission, false otherwise.
   */
  hasPermission: (permission): boolean => {
    const role = get().user?.role;

    if (!role?.permissions) return false;

    return role.permissions.some((p) => p.name === permission);
  },

  
  /**
   * Logs out the user by clearing the session in the store and calling the logout mutation in the auth router.
   * @returns {Promise<boolean>} - A promise that resolves to true if the logout was successful.
   */
  logout: async (): Promise<boolean> =>{
    await trpcClient.auth.logout.mutate();

    get().clearSession();

    return true;
  },
}));