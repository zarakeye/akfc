import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Stage, Audience } from "@prisma/client";

import type { PageContentV1 } from "@contracts/page";

/**
 * useStageStore
 *
 * Cache local des `Stage` (événements ponctuels). Aligné sur le
 * pattern de `useDisciplineStore` : Zustand avec `trpcClient` direct,
 * types d'input exportés, **`PageContentV1` strict** côté description
 * et program (cf. note dans `useDisciplineStore` sur l'alignement avec
 * l'inférence tRPC).
 *
 * ─── Spécificités Stage ─────────────────────────────────────────────
 *
 * - Stage porte **deux composites** : `description` et `program`. Le
 *   store les traite indépendamment (un peut être fourni sans l'autre
 *   au update)
 * - Le rattachement est **triple** : `disciplineId` / `externalDisciplineLabel`
 *   / `originId`, dont **au moins un requis** (validation au router)
 * - Les animateurs ont deux niveaux : `primaryAnimatorId` (obligatoire)
 *   + `coAnimatorIds[]` (optionnel). Le primaryAnimator fait partie de
 *   la liste finale `animators` côté backend (composition automatique)
 * - Les `StageSession[]` (séances datées) sont gérées par un router
 *   séparé `stageSession` — pas dans ce store
 */

/* ----- Types d'input pour les mutations ----- */

export type CreateStageInput = {
  label: string;
  audience: Audience;
  disciplineId?: number | null;
  externalDisciplineLabel?: string | null;
  originId?: number | null;
  description: PageContentV1;
  program: PageContentV1;
  preRegistered?: string[];
  primaryAnimatorId: string;
  coAnimatorIds?: string[];
};

export type UpdateStageInput = {
  id: number;
  label?: string;
  audience?: Audience;
  disciplineId?: number | null;
  externalDisciplineLabel?: string | null;
  originId?: number | null;
  description?: PageContentV1;
  program?: PageContentV1;
  preRegistered?: string[];
  primaryAnimatorId?: string;
  coAnimatorIds?: string[];
};

/* ----- État du store ----- */

export interface StageStoreState {
  stages: Stage[];
  setStages: (stages: Stage[]) => void;

  fetchStages: () => Promise<void>;
  fetchStagesByDiscipline: (disciplineId: number) => Promise<Stage[]>;
  fetchStageById: (id: number) => Promise<Stage | null>;

  createStage: (input: CreateStageInput) => Promise<Stage>;
  updateStage: (input: UpdateStageInput) => Promise<Stage>;
  deleteStage: (id: number) => Promise<void>;
}

export const useStageStore = create<StageStoreState>((set, get): StageStoreState => ({
  stages: [],

  setStages: (stages: Stage[]) => set({ stages }),

  /**
   * Récupère tous les stages et écrase le cache.
   */
  fetchStages: async (): Promise<void> => {
    const stages = await trpcClient.stage.getAll.query();
    set({ stages });
  },

  /**
   * Récupère les stages d'une discipline donnée (utile pour les pages
   * publiques de discipline qui listent leurs stages associés).
   */
  fetchStagesByDiscipline: async (disciplineId: number): Promise<Stage[]> => {
    return await trpcClient.stage.getAllByDiscipline.query({ disciplineId });
  },

  /**
   * Récupère un stage par son id avec ses animators et sessions
   * (relations chargées par le router via `relationLoadStrategy: "join"`).
   * Cache-first si présent.
   */
  fetchStageById: async (id: number): Promise<Stage | null> => {
    const { stages } = get();
    const cached = stages.find((s) => s.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.stage.getById.query({ id });
    } catch {
      return null;
    }
  },

  /**
   * Crée un stage en base et l'ajoute au cache.
   * Le router renvoie le stage avec `animators` inclus.
   */
  createStage: async (input: CreateStageInput): Promise<Stage> => {
    const created = await trpcClient.stage.create.mutate(input);
    set((state) => ({ stages: [...state.stages, created] }));
    return created;
  },

  /**
   * Met à jour un stage en base et dans le cache.
   * La sync transactionnelle des composites s'applique côté router
   * (deux sync : STAGE_DESCRIPTION et STAGE_PROGRAM).
   */
  updateStage: async (input: UpdateStageInput): Promise<Stage> => {
    const updated = await trpcClient.stage.update.mutate(input);
    set((state) => ({
      stages: state.stages.map((s) => (s.id === updated.id ? updated : s)),
    }));
    return updated;
  },

  /**
   * Supprime un stage en base et le retire du cache.
   * Les `StageSession` cascadent côté schéma. Les `PageMediaReference`
   * sont nettoyées par la sync transactionnelle du router (mode delete).
   */
  deleteStage: async (id: number): Promise<void> => {
    await trpcClient.stage.delete.mutate({ id });
    set((state) => ({
      stages: state.stages.filter((s) => s.id !== id),
    }));
  },
}));