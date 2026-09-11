import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { SeminarSession } from "@prisma/client";

/**
 * useSeminarSessionStore
 *
 * Cache local des `SeminarSession` du stage actuellement édité. Le cache
 * est mono-stage : chaque `fetchBySeminar` écrase les sessions du stage
 * précédent. Suffisant pour l'usage admin (on édite un stage à la fois).
 *
 * `beginTime` / `endTime` au format **HHMM** (cohérent avec le reste —
 * cf. patch routers sessions). Les dates sont des `Date` ; le router
 * les accepte via `z.coerce.date()`.
 */

export type CreateSeminarSessionInput = {
  seminarId: number;
  date: Date;
  beginTime: number;
  endTime: number;
  location?: string | null;
  notes?: string | null;
};

export type UpdateSeminarSessionInput = {
  id: number;
  date?: Date;
  beginTime?: number;
  endTime?: number;
  location?: string | null;
  notes?: string | null;
};

export interface SeminarSessionStoreState {
  sessions: SeminarSession[];
  setSessions: (sessions: SeminarSession[]) => void;

  fetchBySeminar: (seminarId: number) => Promise<void>;
  createSession: (input: CreateSeminarSessionInput) => Promise<SeminarSession>;
  updateSession: (input: UpdateSeminarSessionInput) => Promise<SeminarSession>;
  deleteSession: (id: number) => Promise<void>;
}

export const useSeminarSessionStore = create<SeminarSessionStoreState>((set): SeminarSessionStoreState => ({
  sessions: [],

  setSessions: (sessions: SeminarSession[]) => set({ sessions }),

  fetchBySeminar: async (seminarId: number): Promise<void> => {
    const sessions = await trpcClient.seminarSession.getAllBySeminar.query({
      seminarId,
    });
    set({ sessions });
  },

  createSession: async (
    input: CreateSeminarSessionInput,
  ): Promise<SeminarSession> => {
    const created = await trpcClient.seminarSession.create.mutate(input);
    set((state) => ({
      sessions: [...state.sessions, created].sort(sortByDateThenTime),
    }));
    return created;
  },

  updateSession: async (
    input: UpdateSeminarSessionInput,
  ): Promise<SeminarSession> => {
    const updated = await trpcClient.seminarSession.update.mutate(input);
    set((state) => ({
      sessions: state.sessions
        .map((s) => (s.id === updated.id ? updated : s))
        .sort(sortByDateThenTime),
    }));
    return updated;
  },

  deleteSession: async (id: number): Promise<void> => {
    await trpcClient.seminarSession.delete.mutate({ id });
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
  a: SeminarSession,
  b: SeminarSession,
): number {
  const dateDiff =
    new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return a.beginTime - b.beginTime;
}