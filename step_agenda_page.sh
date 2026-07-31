#!/usr/bin/env bash
#
# step_agenda_page.sh
#
# Incrément 3 — la page « Agenda », les cartes rendues génériques, l'entrée de
# navbar.
#
# ─── Une carte, trois usages ───────────────────────────────────────────────
#
# `DisciplineSummaryCards` faisait déjà tout ce dont l'agenda a besoin :
# image hors repli, texte clampé, accordéon, lien de sortie. Seul son type de
# données était spécifique aux disciplines.
#
# Plutôt qu'un second composant jumeau, il devient `SummaryCards`, avec un
# type neutre : une clé, un titre, un sous-titre facultatif, un lien et son
# libellé. L'accueil et l'agenda le partagent, et l'accueil est migré dans le
# même geste — pas de période où deux versions coexistent.
#
# La clé est une CHAÎNE et non un identifiant numérique : l'agenda mêle stages
# et événements, dont les identifiants se recouvrent. `stage-12` et `event-12`
# doivent rester distincts.
#
# ─── La requête ────────────────────────────────────────────────────────────
#
# Deux requêtes, une par entité, fusionnées puis triées en mémoire sur la
# prochaine session. Le tri ne peut pas se faire en SQL : la clé de tri est
# une valeur calculée sur une relation filtrée, et le volume — les rendez-vous
# à venir d'un club — ne justifie aucune optimisation.
#
# Le filtre de publication reprend celui de tes pages `/stages` et `/events`
# telles quelles : `publicationDate` non nulle et passée. Inventer une
# seconde règle aurait créé deux vérités sur ce qui est public.
#
# Un stage ou un événement figure à l'agenda s'il a une session À VENIR et un
# résumé non vide. Conformément à la règle retenue, un stage commencé mais non
# terminé y reste, avec sa prochaine date : on peut rejoindre un stage en
# cours.
#
# ─── Ce que la page ne fait pas ────────────────────────────────────────────
#
# Elle ne remplace pas `/stages` et `/events`, qui continuent d'exister. La
# question de leur devenir se pose maintenant que l'agenda les recouvre, mais
# les retirer est une décision de navigation, pas un effet de bord de ce
# script.
#
# Usage :
#   bash step_agenda_page.sh
#   AKFC_APPLY_ONLY=1 bash step_agenda_page.sh
#
set -euo pipefail

cards_old="apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
cards_new="apps/web/src/features/common/SummaryCards.tsx"
agenda_page="apps/web/src/app/(public)/agenda/page.tsx"
home_page="apps/web/src/app/(public)/page.tsx"
header_file="apps/web/src/features/app-shell/Header.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q '"/agenda"' "$header_file" 2>/dev/null; then
  echo "✓ déjà appliqué (item Agenda posé) — rien à faire"
  exit 0
fi

for f in "$cards_old" "$home_page" "$header_file"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "summaryMediaId" prisma/schema.prisma || {
  echo "✗ le socle de l'agenda doit être appliqué d'abord"; exit 1; }

mkdir -p "$(dirname "$cards_new")" "$(dirname "$agenda_page")"

# ─────────────────────────────────────────────────────────────────────────
#  1 — La carte, rendue générique
# ─────────────────────────────────────────────────────────────────────────

cat > "$cards_new" <<'TSX'
"use client";

import { useState, type JSX, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ExpandableContent } from "@features/social/ExpandableContent";

/**
 * Liste de cartes bâties sur une présentation synthétique.
 *
 * Employée par la page d'accueil (disciplines) et par l'agenda (stages et
 * événements). Un seul composant plutôt que deux jumeaux : ils auraient
 * divergé à la première correction, qui n'en aurait touché qu'un.
 *
 * Le contenu de chaque carte est un RSC (`PageRenderer`) rendu par le serveur
 * et passé ici en `ReactNode` : ce composant ne rend aucun contenu lui-même,
 * il ne fait qu'arbitrer le dépliage. C'est ce qui permet à un composant
 * client de piloter du contenu serveur.
 *
 * ACCORDÉON : une seule clé dépliée est retenue, donc dérouler une carte
 * replie mécaniquement la précédente. Aucun cas particulier à traiter — c'est
 * la forme de l'état qui l'impose.
 */

export interface SummaryCardData {
  /**
   * Clé unique dans la liste — une CHAÎNE et non un identifiant numérique :
   * l'agenda mêle stages et événements, dont les identifiants se recouvrent.
   * `stage-12` et `event-12` doivent rester distincts.
   */
  key: string;
  title: string;
  /** Ligne secondaire facultative : une date, une discipline… */
  subtitle?: string;
  /** Lien de sortie vers la page complète. `null` = pas de lien. */
  href: string | null;
  linkLabel: string;
  /** Image de carte, déjà résolue côté serveur. */
  imageUrl: string | null;
  /** Rendu serveur de la présentation synthétique. */
  content: ReactNode;
}

const DEFAULT_COLLAPSED_HEIGHT = 220;

/**
 * Les cartes sont en GRILLE. Ce n'est pas qu'une question d'allure : une
 * carte occupant un tiers du puits reste sous les seuils de bascule des blocs
 * qu'elle contient, ce qui rend leur mise en page prévisible.
 */
const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function SummaryCards({
  cards,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: {
  cards: SummaryCardData[];
  collapsedHeight?: number;
}): JSX.Element {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className={GRID_CLASS}>
      {cards.map((card) => (
        <article
          key={card.key}
          className="flex h-full flex-col rounded-lg border border-border bg-white p-6"
        >
          {card.imageUrl && (
            // Hors du repli, et en `aspect-video` : c'est ce qui rend les
            // cartes vraiment égales. Une image DANS la zone repliée
            // mangerait toute la hauteur disponible et n'en laisserait aucune
            // au texte, avec un résultat différent selon la forme de chaque
            // photo.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt=""
              className="mb-4 block aspect-video w-full rounded-md object-cover"
            />
          )}

          <h3 className="text-xl font-semibold">{card.title}</h3>
          {card.subtitle && (
            <p className="mb-3 text-sm text-muted-foreground">
              {card.subtitle}
            </p>
          )}
          {!card.subtitle && <div className="mb-3" />}

          <ExpandableContent
            collapsedHeight={collapsedHeight}
            expanded={expandedKey === card.key}
            onToggle={() =>
              setExpandedKey((current) =>
                current === card.key ? null : card.key,
              )
            }
            expandLabel="Lire la suite"
          >
            {card.content}
          </ExpandableContent>

          {card.href && (
            <div className="mt-auto border-t border-border pt-3">
              <Link
                href={card.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                {card.linkLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
TSX
echo "  + SummaryCards.tsx"

rm -f "$cards_old"
rmdir "apps/web/src/features/disciplines" 2>/dev/null || true
echo "  - DisciplineSummaryCards.tsx (remplacé)"

# ─────────────────────────────────────────────────────────────────────────
#  2 — La page Agenda
# ─────────────────────────────────────────────────────────────────────────

cat > "$agenda_page" <<'TSX'
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
TSX
echo "  + (public)/agenda/page.tsx"

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

home_page   = "apps/web/src/app/(public)/page.tsx"
header_file = "apps/web/src/features/app-shell/Header.tsx"

# ── 3 — l'accueil migre sur le composant générique ───────────────────────
edit(home_page,
"""import { DisciplineSummaryCards } from "@features/disciplines/DisciplineSummaryCards";""",
"""import {
  SummaryCards,
  type SummaryCardData,
} from "@features/common/SummaryCards";""")

edit(home_page, """  const disciplineCards = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.summaryMediaId
        ? (summaryImages[row.summaryMediaId]?.url ?? null)
        : null,""",
"""  const disciplineCards: SummaryCardData[] = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      key: `discipline-${row.id}`,
      title: row.name,
      href: row.slug ? `/disciplines/${row.slug}` : null,
      linkLabel: "Voir la discipline",
      imageUrl: row.summaryMediaId
        ? (summaryImages[row.summaryMediaId]?.url ?? null)
        : null,""")

edit(home_page, """          <DisciplineSummaryCards
            cards={disciplineCards}""",
"""          <SummaryCards
            cards={disciplineCards}""")

# ── 4 — l'entrée de navbar, après « Galeries » ───────────────────────────
edit(header_file, """        <Link
          href="/gallery"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/gallery" ? "text-[20px]" : ""}`}
        >
          Galeries
        </Link>""",
"""        <Link
          href="/gallery"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/gallery" ? "text-[20px]" : ""}`}
        >
          Galeries
        </Link>

        <Link
          href="/agenda"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/agenda" ? "text-[20px]" : ""}`}
        >
          Agenda
        </Link>""")
PY

echo "✓ agenda, cartes génériques et navbar posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(agenda): page Agenda, cartes generiques, item de navbar

Increment 3. Stages et evenements a venir, meles et tries par date.
Un visiteur se moque de la distinction : il veut savoir ce qui arrive.
Chaque carte renvoie vers sa fiche complete existante.

DisciplineSummaryCards faisait deja tout ce dont l'agenda a besoin —
image hors repli, texte clampe, accordeon, lien de sortie. Seul son
type de donnees etait specifique. Il devient SummaryCards avec un type
neutre, et l'accueil est migre dans le meme geste : pas de periode ou
deux versions coexistent.

La cle est une CHAINE et non un identifiant numerique : l'agenda mele
stages et evenements, dont les identifiants se recouvrent.

Le tri se fait en memoire a dessein : la cle de tri est la prochaine
session a venir, une valeur calculee sur une relation filtree que SQL
ne peut pas ordonner sans sous-requete. Le volume ne justifie aucune
optimisation.

Le filtre de publication reprend celui de /stages et /events tel quel —
inventer une seconde regle creerait deux verites sur ce qui est public.

Critere de presence : une session A VENIR et un resume non vide. Un
stage commence mais non termine y figure donc, avec sa prochaine date."

echo "✓ commité"
git log -1 --oneline