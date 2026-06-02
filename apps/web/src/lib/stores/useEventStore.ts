import { create } from "zustand";
import { trpcClient } from "@trpc/trpcClient";
import type { Event, Audience } from "@prisma/client";

import type { PageContentV1 } from "@contracts/page";

/**
 * useEventStore
 *
 * Cache local des `Event` (événements non récurrents : repas,
 * conférences, ateliers culturels). Aligné sur le pattern de
 * `useStageStore`, mais plus simple :
 *
 * - **Un seul composite** `content` (vs description + program de Stage)
 * - **Un seul `organizerId`** (vs primary + co-animators de Stage)
 * - **`publicationDate`** pour le cycle brouillon/publié (comme Post) :
 *   `null` = brouillon, date passée = publié, date future = programmé
 *
 * Deux lectures de liste :
 * - `fetchEvents` → `getAll` : events publiés uniquement (pages
 *   publiques)
 * - `fetchEventsAdmin` → `getAllAdmin` : tout, brouillons inclus
 *   (back-office)
 *
 * Le `content` est typé **`PageContentV1` strict** (cf. note dans
 * `useDisciplineStore` sur l'alignement avec l'inférence tRPC).
 */

/* ----- Types d'input pour les mutations ----- */

export type CreateEventInput = {
  label: string;
  content: PageContentV1;
  audience: Audience;
  disciplineId?: number | null;
  externalDisciplineLabel?: string | null;
  originId?: number | null;
  organizerId: string;
  publicationDate?: Date | null;
};

export type UpdateEventInput = {
  id: number;
  label?: string;
  content?: PageContentV1;
  audience?: Audience;
  disciplineId?: number | null;
  externalDisciplineLabel?: string | null;
  originId?: number | null;
  organizerId?: string;
  publicationDate?: Date | null;
};

/* ----- État du store ----- */

export interface EventStoreState {
  events: Event[];
  setEvents: (events: Event[]) => void;

  fetchEvents: () => Promise<void>;
  fetchEventsAdmin: () => Promise<void>;
  fetchEventById: (id: number) => Promise<Event | null>;

  createEvent: (input: CreateEventInput) => Promise<Event>;
  updateEvent: (input: UpdateEventInput) => Promise<Event>;
  deleteEvent: (id: number) => Promise<void>;
}

export const useEventStore = create<EventStoreState>((set, get): EventStoreState => ({
  events: [],

  setEvents: (events: Event[]) => set({ events }),

  /**
   * Liste publique : events publiés uniquement (publicationDate non
   * null et passée). À utiliser sur les pages publiques.
   */
  fetchEvents: async (): Promise<void> => {
    const events = await trpcClient.event.getAll.query();
    set({ events });
  },

  /**
   * Liste admin : tous les events, brouillons inclus (nulls first).
   * À utiliser dans le back-office.
   */
  fetchEventsAdmin: async (): Promise<void> => {
    const events = await trpcClient.event.getAllAdmin.query();
    set({ events });
  },

  /**
   * Récupère un event par son id avec ses relations (organizer,
   * sessions) chargées par le router. Cache-first si présent.
   */
  fetchEventById: async (id: number): Promise<Event | null> => {
    const { events } = get();
    const cached = events.find((e) => e.id === id);
    if (cached) return cached;

    try {
      return await trpcClient.event.getById.query({ id });
    } catch {
      return null;
    }
  },

  /**
   * Crée un event en base et l'ajoute au cache.
   */
  createEvent: async (input: CreateEventInput): Promise<Event> => {
    const created = await trpcClient.event.create.mutate(input);
    set((state) => ({ events: [...state.events, created] }));
    return created;
  },

  /**
   * Met à jour un event en base et dans le cache.
   * La sync transactionnelle du composite `content` s'applique côté
   * router (pageType: "EVENT").
   */
  updateEvent: async (input: UpdateEventInput): Promise<Event> => {
    const updated = await trpcClient.event.update.mutate(input);
    set((state) => ({
      events: state.events.map((e) => (e.id === updated.id ? updated : e)),
    }));
    return updated;
  },

  /**
   * Supprime un event en base et le retire du cache.
   * Les `EventSession` cascadent côté schéma ; les `PageMediaReference`
   * sont nettoyées par la sync transactionnelle du router.
   */
  deleteEvent: async (id: number): Promise<void> => {
    await trpcClient.event.delete.mutate({ id });
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },
}));