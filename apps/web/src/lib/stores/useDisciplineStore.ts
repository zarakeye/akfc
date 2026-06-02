import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Discipline, DisciplineType } from "@prisma/client";

import type { PageContentV1 } from "@contracts/page";

/**
 * useDisciplineStore
 *
 * Cache local des `Discipline`. Aligné sur le pattern de
 * `useCourseStore` : Zustand avec `trpcClient` direct (pas les hooks
 * React), types d'input exportés.
 *
 * ─── Évolution v2 ─────────────────────────────────────────────────────
 *
 * Le champ `description` est passé de `String?` à `Json` (PageContentV1)
 * en migration v2. Le store le type en **`PageContentV1` strict**
 * (importé depuis `@contracts/page`) plutôt qu'en `JsonValue` large,
 * pour matcher l'inférence stricte que tRPC fait depuis le router
 * (`description: pageContentSchemaV1`). Un `JsonValue` large
 * accepterait `null` et serait rejeté à l'assignation côté `mutate`.
 *
 * Conséquence pratique : aucun cast nécessaire côté form — le
 * `PageContentV1` produit par le PageBuilder est assignable directement
 * à l'input du store.
 */

/* ----- Types d'input pour les mutations ----- */

export type CreateDisciplineInput = {
  name: string;
  type: DisciplineType;
  family?: string | null;
  school?: string | null;
  classification?: string | null;
  originId?: number | null;
  description: PageContentV1;
  categoryId: number;
  instructorId: string;
};

export type UpdateDisciplineInput = {
  id: number;
  name?: string;
  type?: DisciplineType;
  family?: string | null;
  school?: string | null;
  classification?: string | null;
  originId?: number | null;
  description?: PageContentV1;
  instructorId?: string;
};

/* ----- État du store ----- */

export interface DisciplineStoreState {
  disciplines: Discipline[];
  setDisciplines: (disciplines: Discipline[]) => void;

  fetchDisciplines: () => Promise<void>;
  fetchDisciplinesByCategory: (categoryId: number) => Promise<Discipline[]>;
  fetchDisciplineById: (id: number) => Promise<Discipline | null>;

  createDiscipline: (input: CreateDisciplineInput) => Promise<Discipline>;
  updateDiscipline: (input: UpdateDisciplineInput) => Promise<Discipline>;
  deleteDiscipline: (id: number) => Promise<void>;
}

export const useDisciplineStore = create<DisciplineStoreState>((set, get): DisciplineStoreState => ({
  disciplines: [],

  setDisciplines: (disciplines: Discipline[]) => set({ disciplines }),

  /**
   * Récupère toutes les disciplines et écrase le cache.
   * Le router les retourne triées par categoryId puis name.
   */
  fetchDisciplines: async (): Promise<void> => {
    const disciplines = await trpcClient.discipline.getAll.query();
    set({ disciplines });
  },

  /**
   * Récupère les disciplines d'une catégorie donnée.
   * Ne touche pas au cache global (renvoyé pour usage UI ponctuel).
   */
  fetchDisciplinesByCategory: async (categoryId: number): Promise<Discipline[]> => {
    return await trpcClient.discipline.getAllByCategory.query({ categoryId });
  },

  /**
   * Récupère une discipline par son id.
   * Si présente en cache, la retourne directement ; sinon va la chercher.
   */
  fetchDisciplineById: async (id: number): Promise<Discipline | null> => {
    const { disciplines } = get();
    const cached = disciplines.find((d) => d.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.discipline.getById.query({ id });
    } catch {
      return null;
    }
  },

  /**
   * Crée une discipline en base et l'ajoute au cache.
   */
  createDiscipline: async (input: CreateDisciplineInput): Promise<Discipline> => {
    const created = await trpcClient.discipline.create.mutate(input);
    set((state) => ({ disciplines: [...state.disciplines, created] }));
    return created;
  },

  /**
   * Met à jour une discipline en base et dans le cache.
   */
  updateDiscipline: async (input: UpdateDisciplineInput): Promise<Discipline> => {
    const updated = await trpcClient.discipline.update.mutate(input);
    set((state) => ({
      disciplines: state.disciplines.map((d) => (d.id === updated.id ? updated : d)),
    }));
    return updated;
  },

  /**
   * Supprime une discipline en base et la retire du cache.
   * Le router refuse si des courses/stages/events/mediaAssets pointent
   * encore vers cette discipline — l'erreur tRPC se propage au caller.
   */
  deleteDiscipline: async (id: number): Promise<void> => {
    await trpcClient.discipline.delete.mutate({ id });
    set((state) => ({
      disciplines: state.disciplines.filter((d) => d.id !== id),
    }));
  },
}));