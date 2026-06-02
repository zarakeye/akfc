import { prisma } from "@backend/prisma";
import { buildICalendar, type ICalEventInput } from "@lib/calendar/ical";

/**
 * GET /api/calendar/events/[id]
 *
 * Renvoie un fichier `.ics` regroupant toutes les sessions de
 * l'événement, importable dans n'importe quel agenda.
 *
 * ⚠️ **Garde de publication** : seul un event publié (publicationDate
 * non null et passée) est exporté. Un brouillon ou un event programmé
 * renvoie 404 — cohérent avec la page publique `/events/[id]`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) {
    return new Response("Invalid id", { status: 400 });
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      publicationDate: { not: null, lte: new Date() },
    },
    include: {
      sessions: { orderBy: [{ date: "asc" }, { beginTime: "asc" }] },
    },
  });

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const events: ICalEventInput[] = event.sessions.map((s) => ({
    uid: `akfc-event-${event.id}-session-${s.id}@akfc`,
    date: s.date,
    beginTime: s.beginTime,
    endTime: s.endTime,
    summary: event.label,
    location: s.location,
    description: s.notes,
  }));

  const ical = buildICalendar(events, { calendarName: event.label });

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
    },
  });
}