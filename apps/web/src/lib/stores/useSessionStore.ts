import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import { SessionClient } from "@contracts/auth/session.types";

/**
 * Session côté navigateur.
 *
 * Le serveur reste la seule autorité : ce store n'est qu'une copie, pour que l'interface sache qui
 * est connecté sans redemander à chaque rendu. Il est rempli au démarrage par SessionLoader (avec
 * la session lue par le layout racine), puis suit connexions, déconnexions et changements de profil.
 */
export type SessionStatus =
  | "idle" // pas encore initialisé (rendu serveur, premier rendu client)
  | "guest" // personne n'est connecté
  | "authenticated"; // un membre est connecté

interface SessionStore {
  session: SessionClient | null;
  status: SessionStatus;

  /** Initialise le store avec la session lue par le serveur (sans requête). */
  hydrate: (session: SessionClient | null) => void;
  /** Relit la session sur le serveur (après une modification du profil, par exemple). */
  fetchSession: () => Promise<void>;
  /** Après une connexion réussie : la session que le serveur vient d'ouvrir. */
  loginSuccess: (session: SessionClient) => void;
  /** Déconnexion : la session est supprimée côté serveur, puis oubliée ici. */
  logout: () => Promise<void>;
  /** Met à jour l'avatar du membre connecté, sans relire toute la session. */
  setAvatar: (avatar: string | null) => void;
}

export const useSessionStore = create<SessionStore>()(
  (set, get): SessionStore => ({
    session: null,
    status: "idle",

    hydrate: (session): void => {
      set({ session, status: session?.user ? "authenticated" : "guest" });
    },

    fetchSession: async (): Promise<void> => {
      try {
        const session = await trpcClient.auth.getSession.query();
        get().hydrate(session ?? null);
      } catch {
        get().hydrate(null);
      }
    },

    loginSuccess: (session): void => {
      set({ session, status: "authenticated" });
    },

    logout: async (): Promise<void> => {
      await trpcClient.auth.logout.mutate();
      set({ session: null, status: "guest" });
    },

    setAvatar: (avatar: string | null): void => {
      const current = get().session;
      if (!current || !current.user) return;
      set({
        session: {
          ...current,
          user: { ...current.user, avatar },
        },
      });
    },
  }),
);
