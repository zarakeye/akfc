import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { EventSession } from "@prisma/client";

/**
 * useEventSessionStore
 *
 * Clone structurel de `useStageSessionStore` pour les `EventSession`.
 * Cache mono-event, `beginTime`/`endTime` en HHMM, dates en `Date`.
 */

export type CreateEventSessionInput = {
  eventId: number;
  date: Date;
  beginTime: number;
  endTime: number;
  location?: string | null;
  notes?: string | null;
};

export type UpdateEventSessionInput = {
  id: number;
  date?: Date;
  beginTime?: number;
  endTime?: number;
  location?: string | null;
  notes?: string | null;
};

export interface EventSessionStoreState {
  sessions: EventSession[];
  setSessions: (sessions: EventSession[]) => void;

  fetchByEvent: (eventId: number) => Promise<void>;
  createSession: (input: CreateEventSessionInput) => Promise<EventSession>;
  updateSession: (input: UpdateEventSessionInput) => Promise<EventSession>;
  deleteSession: (id: number) => Promise<void>;
}

export const useEventSessionStore = create<EventSessionStoreState>((set): EventSessionStoreState => ({
  sessions: [],

  setSessions: (sessions: EventSession[]) => set({ sessions }),

  fetchByEvent: async (eventId: number): Promise<void> => {
    const sessions = await trpcClient.eventSession.getAllByEvent.query({
      eventId,
    });
    set({ sessions });
  },

  createSession: async (
    input: CreateEventSessionInput,
  ): Promise<EventSession> => {
    const created = await trpcClient.eventSession.create.mutate(input);
    set((state) => ({
      sessions: [...state.sessions, created].sort(sortByDateThenTime),
    }));
    return created;
  },

  updateSession: async (
    input: UpdateEventSessionInput,
  ): Promise<EventSession> => {
    const updated = await trpcClient.eventSession.update.mutate(input);
    set((state) => ({
      sessions: state.sessions
        .map((s) => (s.id === updated.id ? updated : s))
        .sort(sortByDateThenTime),
    }));
    return updated;
  },

  deleteSession: async (id: number): Promise<void> => {
    await trpcClient.eventSession.delete.mutate({ id });
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
  },
}));

function sortByDateThenTime(
  a: EventSession,
  b: EventSession,
): number {
  const dateDiff =
    new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return a.beginTime - b.beginTime;
}