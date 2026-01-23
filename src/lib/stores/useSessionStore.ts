import { create } from "zustand";
import { trpcClient } from "@lib/trpcClient";
import { SessionClient } from "@/types/session.types";

export type SessionStatus =
  | "idle" // app faîchement ouverte, aucune action
  | 'guest' // jamais connecté
  | "authenticated" // connecté stable
  | "justLoggedIn" // feedback UX
  | "justLoggedOut" // feedback UX

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
  session: SessionClient | null;
  status: SessionStatus;
  loading: boolean;

  setLoading: (loading: boolean) => void;
  fetchSession: () => Promise<void>;
  loginSuccess: (s: SessionClient) => void;
  logout: () => Promise<void>;
  resetStatus: () => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  session: null,
  loading: false,
  status: "idle",

  /**
   * Sets the loading state to the provided boolean value.
   * @param {boolean} loading - Whether the user-related operation is currently in progress.
   */
  setLoading: (loading: boolean): void => {
    set({ loading });
  },
  
  /**
   * Called when the user session is successfully set.
   * Updates the `session`, `status` and `loading` properties in the store.
   * @param {SessionClient} session - The user session to be set.
   */
  loginSuccess: (session): void => {
    set({
      session,
      status: "justLoggedIn",
      loading: false
    });

    setTimeout(() => {
      set({ status: "authenticated" });
    }, 3000);
  },

  // 🔁 Appelé UNE fois (SessionLoader)
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

      if (!session) {
        set({ session: null, status: 'guest', loading: false });
        return;
      }

      set({ session, status: "authenticated", loading: false });
    } catch {
      set({
        session: null,
        status: "guest",
        loading: false
      });
    }
  },

  // 🚪 Logout centralisé
  /**
   * Logs out the user and clears the session in the store.
   * It also sets the UX status to "justLoggedOut".
   * @returns {Promise<void>} - The promise resolves when the logout mutation has been completed and the store has been updated.
   */
  logout: async (): Promise<void> => {
    await trpcClient.auth.logout.mutate();

    set({
      session: null,
      status: "justLoggedOut",
      loading: false
    });

    setTimeout(() => {
      set({ status: "guest" });
    }, 3000);
  },

  // 🧹 Reset UX → état stable
  /**
   * Resets the transient status of the session to its steady state.
   * If the session is present, it sets the status to "authenticated", otherwise it sets it to "idle".
   */
  resetStatus: () => {
    const { session } = get();

    set({
      status: session ? "authenticated" : "guest",
    });
  },
}));
