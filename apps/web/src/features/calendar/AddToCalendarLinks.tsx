import type { JSX } from "react";

import {
  googleCalendarUrl,
  outlookCalendarUrl,
  type CalendarEventDetail,
} from "@lib/calendar/calendar-links";

/**
 * Menu « Ajouter à l'agenda » pour **une** séance — deep-links Google
 * Calendar et Outlook.
 *
 * 100% server-rendered : les URLs sont calculées au rendu (fonctions
 * pures), le dépliant est un `<details>` natif (aucun JS), les liens
 * sont de simples `<a target="_blank">`. Pas de Client Component.
 *
 * L'import groupé de toutes les séances reste géré par le bouton
 * « Télécharger (.ics) » de l'en-tête de section, qui couvre Apple
 * Calendar et n'importe quel client compatible iCal.
 */
export function AddToCalendarLinks({
  event,
}: {
  event: CalendarEventDetail;
}): JSX.Element {
  return (
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
        Ajouter à l&apos;agenda
      </summary>
      <div className="absolute right-0 z-10 mt-1 flex min-w-44 flex-col overflow-hidden rounded-md border border-border bg-background shadow-md">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          Google Calendar
        </a>
        <a
          href={outlookCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          Outlook
        </a>
      </div>
    </details>
  );
}