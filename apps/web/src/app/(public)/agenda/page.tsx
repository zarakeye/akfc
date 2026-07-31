import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";
import { resolveMediaByIds } from "@backend/modules/media/services/resolveMediaByIds.service";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import {
  SummaryCards,
  type SummaryCardData,
} from "@features/common/SummaryCards";

/**
 * « Agenda » — stages et événements à venir, mêlés et triés par date.
 *
 * Un visiteur se moque de la distinction entre un stage et un événement : il
 * veut savoir ce qui arrive. Les deux entités sont donc fondues en une seule
 * liste chronologique, chacune renvoyant vers sa fiche complète existante.
 *
 * ─── Le tri se fait en mémoire, à dessein ───────────────────────────────
 *
 * La clé de tri est la prochaine session à venir, une valeur calculée sur une
 * relation filtrée : SQL ne peut pas l'ordonner sans sous-requête. Le volume —
 * les rendez-vous à venir d'un club — ne justifie aucune optimisation.
 *
 * ─── Critère de présence ────────────────────────────────────────────────
 *
 * Une session à venir ET un résumé non vide. Un stage commencé mais non
 * terminé y figure donc, avec sa prochaine date : on peut rejoindre un stage
 * en cours.
 */

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AgendaPage(): Promise<JSX.Element> {
  const now = new Date();

  // Filtre de publication repris tel quel des pages /stages et /events :
  // inventer une seconde règle créerait deux vérités sur ce qui est public.
  const publicFilter = { publicationDate: { not: null, lte: now } };
  const nextSession = {
    where: { date: { gte: now } },
    orderBy: { date: "asc" as const },
    take: 1,
    select: { date: true },
  };

  const [stages, events] = await Promise.all([
    prisma.stage.findMany({
      where: { ...publicFilter, sessions: { some: { date: { gte: now } } } },
      select: {
        id: true,
        label: true,
        slug: true,
        summary: true,
        summaryMediaId: true,
        sessions: nextSession,
      },
    }),
    prisma.event.findMany({
      where: { ...publicFilter, sessions: { some: { date: { gte: now } } } },
      select: {
        id: true,
        label: true,
        slug: true,
        summary: true,
        summaryMediaId: true,
        sessions: nextSession,
      },
    }),
  ]);

  const entries = [
    ...stages.map((row) => ({ kind: "stage" as const, row })),
    ...events.map((row) => ({ kind: "event" as const, row })),
  ]
    .map(({ kind, row }) => ({
      kind,
      row,
      content: parsePageContentV1(row.summary),
      date: row.sessions[0]?.date ?? null,
    }))
    .filter((e) => e.date !== null && e.content.blocks.length > 0)
    .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

  // Résolution des images de carte en UNE requête, audience publique.
  const images = await resolveMediaByIds(
    prisma,
    entries
      .map((e) => e.row.summaryMediaId)
      .filter((id): id is string => id !== null),
    "public",
  );

  const cards: SummaryCardData[] = entries.map((entry) => ({
    // Clé préfixée par le type : les identifiants de stages et d'événements
    // se recouvrent.
    key: `${entry.kind}-${entry.row.id}`,
    title: entry.row.label,
    subtitle: entry.date ? `Prochaine date : ${formatDate(entry.date)}` : undefined,
    href: entry.row.slug
      ? `/${entry.kind === "stage" ? "stages" : "events"}/${entry.row.slug}`
      : null,
    linkLabel: entry.kind === "stage" ? "Voir le stage" : "Voir l'événement",
    imageUrl: entry.row.summaryMediaId
      ? (images[entry.row.summaryMediaId]?.url ?? null)
      : null,
    content: <PageRenderer content={entry.content} />,
  }));

  const style = await prisma.siteStyle.findUnique({
    where: { id: 1 },
    select: { cardCollapsedHeight: true },
  });

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">Agenda</h1>

      {cards.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun rendez-vous à venir pour le moment.
        </p>
      ) : (
        <SummaryCards
          cards={cards}
          collapsedHeight={style?.cardCollapsedHeight ?? 220}
        />
      )}
    </div>
  );
}
