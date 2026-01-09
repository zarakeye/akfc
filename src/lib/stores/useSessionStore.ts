import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import type { UserEnhanced, SessionEnhanced } from "@/types";

// 1️⃣ useUserStore (finalisé)
// fetchUser récupère la session via getSessionAction.
// Si la session est absente ou expirée → clearSession.
// Si la session est valide → setSession.
// logout appelle le router auth.logout et supprime la session dans le store.
// On conserve hasPermission pour le RBAC.

// This class definition, `UserStore`, is an interface that defines the shape of an object that manages user-related data and actions. 

// Here's a summary of what each method does:

// - `clearSession`: Clears the user session and sets the `user` and `session` properties to `null`.
// - `user`: Represents the current user, with properties such as `id`, `email`, `role`, etc.
// - `session`: Represents the current user session, with properties such as `token`, `userId`, `createdAt`, etc.
// - `isAuthenticated`: Indicates whether the user is currently authenticated.
// - `loading`: Indicates whether a user-related operation is currently in progress.
// - `setSession`: Sets the user session with the provided `SessionEnhanced` object.
// - `fetchUser`: Fetches the user session from the server and updates the `user` and `session` properties accordingly.
// - `hasPermission`: Checks if the user has a specific permission.
// - `logout`: Logs out the user by clearing the session and returning a promise indicating success or failure.

interface SessionStore {
  session: {
    user: UserEnhanced | null;
  } | null;
  loading: boolean;
  justLoggedIn: boolean;
  justLoggedOut: boolean;

  setSession: (s: {user: UserEnhanced; expiresAt: Date | undefined;}, wasLoggedIn: boolean) => void;
  fetchSession: () => Promise<void>;
  clearSession: () => void;
  hasPermission: (permission: string) => boolean;

  get user(): UserEnhanced | null;
  logout: () => Promise<boolean>;
  get isAuthenticated(): boolean;

  setJustLoggedOut: (value: boolean) => void;
  setJustLoggedIn: (value: boolean) => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  // user: null,
  session: null,
  loading: false,
  justLoggedIn: false,
  justLoggedOut: false,

  get user(): UserEnhanced | null {
    return get().session?.user ?? null;
  },

  /**
   * Checks if the user is currently authenticated.
   * @returns {boolean} - True if the user is authenticated, false otherwise.
   */
  get isAuthenticated(): boolean {
    return !!get().user;
  },


  setSession: (session: {user: UserEnhanced; expiresAt: Date | undefined;} , isNewLogin = false): void => {
    set({
      session,
      loading: false,
      justLoggedIn: isNewLogin,
      justLoggedOut: false
    });
  },

  /**
   * Clears the user session and its associated user in the store.
   * If the browser window is available, it also clears the session in the browser's session storage.
   */
  clearSession: (): void => {
    set({
      session: null,
      loading: false,
      justLoggedIn: false,
      justLoggedOut: false,
    });
  },

  /**
   * Fetches the user session from the server and updates the `user` and `session` properties accordingly.
   * If the session is absent or expired, it clears the session and its associated user in the store.
   * @returns {Promise<void>} - The promise resolves when the session has been fetched and the store has been updated.
   */
  fetchSession: async (): Promise<void> => {
    // ✅ Indique qu'on est en train de charger
    set({ loading: true });

    try {
      const session = await trpcClient.auth.getSession.query();
      const wasLoggedIn = !!get().user;

      if (!session) {
        // ❌ Indique qu'on n'a pas de session, et on clear le store
        get().clearSession();
      } else {
        // ✅ Indique qu'on a une session, et on set le store
        get().setSession(session, !wasLoggedIn);
      }
    } catch (err) {
      console.error("fetchSession error:", err);
      set({ session: null });
    } finally {
      // ✅ Indique qu'on a fini
      set({ loading: false });
    }
  },

  /**
   * Checks if the user has a specific permission.
   * If the user does not have a role or the role does not have permissions, it returns false.
   * @param {string} permission - The name of the permission to check.
   * @returns {boolean} - True if the user has the permission, false otherwise.
   */
  hasPermission: (permission: string): boolean => {
    const role = get().user?.role;
    return !!role?.permissions.some(p => p.name === permission);
  },

  /**
   * Logs out the user by clearing the session and its associated user in the store.
   * @returns {Promise<boolean>} - True if the logout was successful, false otherwise.
   */
  logout: async (): Promise<boolean> => {
    try {
      await trpcClient.auth.logout.mutate();
      set({
        session: null,
        loading: false,
        justLoggedIn: false,
        justLoggedOut: true
      })
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sets the `justLoggedOut` property in the store to the provided value.
   * This property is used to track whether the user has just logged out or not.
   * @param {boolean} value - The value to set the `justLoggedOut` property to.
   */
  setJustLoggedOut: (value: boolean) => {
    set({ justLoggedOut: value });
  },

  /**
   * Sets the `justLoggedIn` property in the store to the provided value.
   * This property is used to track whether the user has just logged in or not.
   * @param {boolean} value - The value to set the `justLoggedIn` property to.
   */
  setJustLoggedIn: (value: boolean) => {
    set({ justLoggedIn: value });
  },
}));
