"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useEventStore } from "@lib/stores/useEventStore";

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

/**
 * Calcule le statut de publication d'un event :
 *   - null            → Brouillon
 *   - date <= now     → Publié
 *   - date > now      → Programmé
 *
 * `now` est passé en paramètre (capturé une fois au montage via le
 * lazy initializer de useState) plutôt que lu via `Date.now()` ici —
 * appeler une fonction impure pendant le render viole les règles de
 * pureté de React.
 */
function publicationStatus(
  publicationDate: Date | null,
  now: number,
): {
  label: string;
  className: string;
} {
  if (!publicationDate) {
    return {
      label: "Brouillon",
      className: "bg-muted text-muted-foreground",
    };
  }
  const isPublished = new Date(publicationDate).getTime() <= now;
  return isPublished
    ? { label: "Publié", className: "bg-green-100 text-green-800" }
    : { label: "Programmé", className: "bg-blue-100 text-blue-800" };
}

export default function EventsListPage(): JSX.Element {
  const events = useEventStore((s) => s.events);
  const fetchEventsAdmin = useEventStore((s) => s.fetchEventsAdmin);

  // Temps courant capturé une seule fois au montage, via le lazy
  // initializer de useState. `Date.now()` vit dans la closure
  // d'initialisation — ni dans le corps du render (règle de pureté),
  // ni dans un setState d'effet (règle set-state-in-effect). Le badge
  // reflète l'instant du chargement de la page, ce qui est suffisant
  // pour un back-office.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    void fetchEventsAdmin();
  }, [fetchEventsAdmin]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Événements</h2>
        <Link
          href="/admin/dashboard/events/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un événement
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun événement pour le moment.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Label</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Audience</th>
                <th className="px-4 py-2 font-medium">Publication</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const status = publicationStatus(e.publicationDate, now);
                return (
                  <tr
                    key={e.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/admin/dashboard/events/${e.id}`}
                        className="hover:underline"
                      >
                        {e.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {AUDIENCE_LABELS[e.audience] ?? e.audience}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {e.publicationDate
                        ? new Date(e.publicationDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}