import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import { getSessionAction } from "@/server/actions/auth.action";
import { UserEnhanced, SessionEnhanced } from "@/types";

interface UserStore {
  user: UserEnhanced; //UserWithRole;
  session: SessionEnhanced; //SessionWithUser;

  isAuthenticated: boolean;
  loading: boolean;

  setUser: (u: UserEnhanced) => void;
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

  setUser: (u: UserEnhanced) => set({ user: u }),
  setSession: (s: SessionEnhanced ) => {
    set({ session: s });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("session", JSON.stringify(s));
    } else {
      (window as Window).sessionStorage.removeItem("session");
    }
  },

  // login: async (email: string, password: string): Promise<boolean> => {
  //   try {
  //     const { user, session, token } = await trpcClient.auth.login.mutate({ email, password });
  //     set({ user, session });
      
  //     if (typeof window !== "undefined") {
  //       window.sessionStorage.setItem("session", JSON.stringify(session));
  //       window.localStorage.setItem("token", token!);
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error(error);
  //     return false;
  //   }
  // },
  
  /**
   * Fetches the user session from the server and updates the store.
   * If the session is not present or has expired, it sets the user and session to null.
   * If the session is present, it sets the user and session and updates the loading state.
   * It also stores the session in the local storage.
   */
  fetchUser: async (): Promise<void> => {
    try {
      const session = await getSessionAction();

      if (!session) {
        set({ user: null, session: null, loading: false });

        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('session');
        }

        return;
      }

      const { user } = session;

      set({
        user,
        session,
        loading: false,
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('session', JSON.stringify(session));
      }

      console.log("STORE AFTER fetchUser:", get().user, get().session);
    } catch (err) {
      console.error("fetchUser error: ", err);
      set({ user: null, session: null, loading: false });
    }
  },

  hasPermission: (permission): boolean => {
    const user = get().user;

    if (!user?.role?.permissions) return false;

    return user.role.permissions.some((p) => p.name === permission);
  },

  /**
   * Logs the user out of the application by calling the logout mutation.
   * This sets the user state to null.
   */
  logout: async (): Promise<boolean> =>{
    try {
      await trpcClient.auth.logout.mutate();

      set({ user: null, session: null });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("session");
      }

      return true;
    } catch {
      return false;
    }
  },
}));