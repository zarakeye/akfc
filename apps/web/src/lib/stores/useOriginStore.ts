import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Origin } from "@prisma/client";

/**
 * useOriginStore
 *
 * Cache local des `Origin` (racines culturelles introduites en
 * migration v2 : Japon, Okinawa, Chine, Philippines, etc.).
 *
 * Convention : les méthodes de mutation appellent tRPC puis mettent à
 * jour le cache en place. Les méthodes de lecture exploitent le cache
 * si possible. Cloné sur le pattern de `useCourseStore`.
 */

/* ----- Types d'input pour les mutations ----- */

export type CreateOriginInput = {
  name: string;
  slug: string;
  description?: string | null;
  country?: string | null;
  region?: string | null;
  flag?: string | null;
  historicalPeriod?: string | null;
  sortOrder?: number;
};

export type UpdateOriginInput = {
  id: number;
  name?: string;
  slug?: string;
  description?: string | null;
  country?: string | null;
  region?: string | null;
  flag?: string | null;
  historicalPeriod?: string | null;
  sortOrder?: number;
};

/* ----- État du store ----- */

export interface OriginStoreState {
  origins: Origin[];
  setOrigins: (origins: Origin[]) => void;

  fetchOrigins: () => Promise<void>;
  fetchOriginById: (id: number) => Promise<Origin | null>;
  fetchOriginBySlug: (slug: string) => Promise<Origin | null>;

  createOrigin: (input: CreateOriginInput) => Promise<Origin>;
  updateOrigin: (input: UpdateOriginInput) => Promise<Origin>;
  deleteOrigin: (id: number) => Promise<void>;
}

export const useOriginStore = create<OriginStoreState>((set, get): OriginStoreState => ({
  origins: [],

  setOrigins: (origins: Origin[]) => set({ origins }),

  /**
   * Récupère toutes les origines et écrase le cache. Le router les
   * retourne déjà triées par `sortOrder` puis `name`.
   */
  fetchOrigins: async (): Promise<void> => {
    const origins = await trpcClient.origin.getAll.query();
    set({ origins });
  },

  /**
   * Récupère une origine par son id.
   * Si présente en cache, la retourne directement ; sinon va la chercher.
   */
  fetchOriginById: async (id: number): Promise<Origin | null> => {
    const { origins } = get();
    const cached = origins.find((o) => o.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.origin.getById.query({ id });
    } catch {
      return null;
    }
  },

  /**
   * Récupère une origine par son slug.
   * Utile pour les futures pages publiques `/origines/[slug]`.
   * Pas de mise en cache spécifique (le slug n'est pas un index du
   * cache, qui est par id).
   */
  fetchOriginBySlug: async (slug: string): Promise<Origin | null> => {
    try {
      return await trpcClient.origin.getBySlug.query({ slug });
    } catch {
      return null;
    }
  },

  /**
   * Crée une origine en base et l'ajoute au cache.
   */
  createOrigin: async (input: CreateOriginInput): Promise<Origin> => {
    const created = await trpcClient.origin.create.mutate(input);
    set((state) => ({ origins: [...state.origins, created] }));
    return created;
  },

  /**
   * Met à jour une origine en base et dans le cache.
   */
  updateOrigin: async (input: UpdateOriginInput): Promise<Origin> => {
    const updated = await trpcClient.origin.update.mutate(input);
    set((state) => ({
      origins: state.origins.map((o) => (o.id === updated.id ? updated : o)),
    }));
    return updated;
  },

  /**
   * Supprime une origine en base et la retire du cache.
   * Le router refuse si des disciplines/stages/events pointent encore
   * vers cette origine — l'erreur tRPC se propage au caller.
   */
  deleteOrigin: async (id: number): Promise<void> => {
    await trpcClient.origin.delete.mutate({ id });
    set((state) => ({
      origins: state.origins.filter((o) => o.id !== id),
    }));
  },
}));