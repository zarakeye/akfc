import { prisma } from "@backend/prisma";
import { buildICalendar, type ICalEventInput } from "@lib/calendar/ical";

/**
 * GET /api/calendar/stages/[id]
 *
 * Renvoie un fichier `.ics` regroupant toutes les sessions du stage,
 * importable dans n'importe quel agenda (Google, Apple, Outlook).
 *
 * Chaque `StageSession` devient un `VEVENT` daté en heure locale du
 * club (TZID=Europe/Paris). Pas de garde de publication : un stage est
 * toujours public (contrairement à Event). Si tu veux restreindre,
 * ajoute une condition ici.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const stageId = Number(id);
  if (!Number.isFinite(stageId)) {
    return new Response("Invalid id", { status: 400 });
  }

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      sessions: { orderBy: [{ date: "asc" }, { beginTime: "asc" }] },
    },
  });

  if (!stage) {
    return new Response("Not found", { status: 404 });
  }

  const events: ICalEventInput[] = stage.sessions.map((s) => ({
    uid: `akfc-stage-${stage.id}-session-${s.id}@akfc`,
    date: s.date,
    beginTime: s.beginTime,
    endTime: s.endTime,
    summary: stage.label,
    location: s.location,
    description: s.notes,
  }));

  const ical = buildICalendar(events, { calendarName: stage.label });

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="stage-${stage.id}.ics"`,
    },
  });
}