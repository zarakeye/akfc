import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { StageSession } from "@prisma/client";

/**
 * useStageSessionStore
 *
 * Cache local des `StageSession` du stage actuellement édité. Le cache
 * est mono-stage : chaque `fetchByStage` écrase les sessions du stage
 * précédent. Suffisant pour l'usage admin (on édite un stage à la fois).
 *
 * `beginTime` / `endTime` au format **HHMM** (cohérent avec le reste —
 * cf. patch routers sessions). Les dates sont des `Date` ; le router
 * les accepte via `z.coerce.date()`.
 */

export type CreateStageSessionInput = {
  stageId: number;
  date: Date;
  beginTime: number;
  endTime: number;
  location?: string | null;
  notes?: string | null;
};

export type UpdateStageSessionInput = {
  id: number;
  date?: Date;
  beginTime?: number;
  endTime?: number;
  location?: string | null;
  notes?: string | null;
};

export interface StageSessionStoreState {
  sessions: StageSession[];
  setSessions: (sessions: StageSession[]) => void;

  fetchByStage: (stageId: number) => Promise<void>;
  createSession: (input: CreateStageSessionInput) => Promise<StageSession>;
  updateSession: (input: UpdateStageSessionInput) => Promise<StageSession>;
  deleteSession: (id: number) => Promise<void>;
}

export const useStageSessionStore = create<StageSessionStoreState>((set): StageSessionStoreState => ({
  sessions: [],

  setSessions: (sessions: StageSession[]) => set({ sessions }),

  fetchByStage: async (stageId: number): Promise<void> => {
    const sessions = await trpcClient.stageSession.getAllByStage.query({
      stageId,
    });
    set({ sessions });
  },

  createSession: async (
    input: CreateStageSessionInput,
  ): Promise<StageSession> => {
    const created = await trpcClient.stageSession.create.mutate(input);
    set((state) => ({
      sessions: [...state.sessions, created].sort(sortByDateThenTime),
    }));
    return created;
  },

  updateSession: async (
    input: UpdateStageSessionInput,
  ): Promise<StageSession> => {
    const updated = await trpcClient.stageSession.update.mutate(input);
    set((state) => ({
      sessions: state.sessions
        .map((s) => (s.id === updated.id ? updated : s))
        .sort(sortByDateThenTime),
    }));
    return updated;
  },

  deleteSession: async (id: number): Promise<void> => {
    await trpcClient.stageSession.delete.mutate({ id });
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  },
}));

/**
 * Tri par date croissante puis heure de début — garde le cache aligné
 * sur l'ordre que renvoie le router (`orderBy: [date asc, beginTime asc]`).
 */
function sortByDateThenTime(
  a: StageSession,
  b: StageSession,
): number {
  const dateDiff =
    new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return a.beginTime - b.beginTime;
}