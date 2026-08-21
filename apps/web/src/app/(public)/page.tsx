import type { JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import HomeCarousel from "@features/app-shell/HomeCarousel";

import { prisma } from "@backend/prisma";
import {
  groupReactions,
  userSelect,
  type GroupedReaction,
} from "@backend/modules/reactions/router";
import { PostCard } from "@features/social/PostCard";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import {
  SummaryCards,
  type SummaryCardData,
} from "@features/common/SummaryCards";
import { parsePageContentV1 } from "@contracts/page";
import { resolveMediaByIds } from "@backend/modules/media/services/resolveMediaByIds.service";

/**
 * Page d'accueil PUBLIQUE du club (AKFC).
 *
 * Server Component : aucune dépendance à la session, aucun hook trpc
 * React-Query (le provider n'enveloppe que l'admin). Le carousel
 * (`HomeCarousel`) est un Client Component fetchant en vanilla `trpcClient`.
 *
 * Mur de posts « façon Facebook » : flux vertical, contenu composite
 * rendu intégralement côté serveur (PageRenderer) et clampé visuellement
 * (ExpandableContent) — pas de navigation : le mur est l'unique lieu de
 * vie public d'un post. Les réactions et comptes de commentaires sont hydratés ici
 * en DEUX requêtes batch (esprit anti-N+1 de `getByTargets`, version
 * serveur) : un visiteur anonyme n'émet aucune requête au premier paint.
 * `reactedByMe` est volontairement false côté serveur (pas de session en
 * RSC public) : les îlots le corrigent à l'hydratation pour les membres.
 */
export default async function HomePage(): Promise<JSX.Element> {
  // Disciplines présentées sur l'accueil : celles dont la présentation
  // synthétique n'est PAS vide. Rédiger vaut donc inscription, et il n'y a ni
  // sélection ni ordre à maintenir à part.
  //
  // Le filtre se fait après lecture plutôt qu'en SQL : « composite non vide »
  // se juge sur `blocks.length` une fois le Json parsé, ce qu'une clause
  // Prisma ne sait pas exprimer sans dépendre de la forme sérialisée.
  const disciplineRows = await prisma.discipline.findMany({
    where: { publicationDate: { not: null, lte: new Date() } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      summary: true,
      summaryMediaId: true,
    },
  });

  // Résolution des images de carte en UNE requête, comme le fait
  // `PageRenderer` pour les médias d'un composite. Audience publique : ces
  // images s'affichent pour un visiteur anonyme.
  const summaryImages = await resolveMediaByIds(
    prisma,
    disciplineRows
      .map((row) => row.summaryMediaId)
      .filter((id): id is string => id !== null),
    "public",
  );

  const disciplineCards: SummaryCardData[] = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      key: `discipline-${row.id}`,
      title: row.name,
      href: row.slug ? `/disciplines/${row.slug}` : null,
      linkLabel: "Voir la discipline",
      imageUrl: row.summaryMediaId
        ? (summaryImages[row.summaryMediaId]?.url ?? null)
        : null,
      // Rendu SERVEUR, passé ensuite en ReactNode au composant client qui
      // arbitre le dépliage : « Lire la suite » ne va rien chercher, il lève
      // seulement le clamp.
      content: <PageRenderer content={content} />,
    }));

  // Hauteur repliée des cartes : réglage partagé, lu ici plutôt que codé en
  // dur pour que le champ du formulaire ait un effet visible.
  const styleRow = await prisma.siteStyle.findUnique({
    where: { id: 1 },
    select: { cardCollapsedHeight: true },
  });

  const posts = await prisma.post.findMany({
    where: { publicationDate: { not: null, lte: new Date() } },
    orderBy: { publicationDate: "desc" },
    // Chaque carte rend désormais son contenu INTÉGRAL (galeries
    // comprises) : le flux doit être borné. « Charger plus » = chantier
    // ultérieur.
    take: 10,
    include: {
      author: { select: userSelect },
      // Trois octets pour savoir si la carte doit monter le PollWidget
      // (qui ne fetche alors que pour les posts À sondage — pas de N+1).
      poll: { select: { id: true } },
    },
  });

  const postIds = posts.map((p) => p.id);

  const [reactionRows, commentGroups] = await Promise.all([
    prisma.reaction.findMany({
      where: { targetType: "POST", targetId: { in: postIds } },
      orderBy: { createdAt: "asc" },
      include: { user: { select: userSelect } },
    }),
    prisma.comment.groupBy({
      by: ["postId"],
      where: { postId: { in: postIds } },
      _count: { _all: true },
    }),
  ]);

  const reactionsByPost = new Map<number, GroupedReaction[]>();
  for (const id of postIds) {
    reactionsByPost.set(
      id,
      groupReactions(
        reactionRows.filter((r) => r.targetId === id),
        undefined, // pas de session en RSC public → reactedByMe: false
      ),
    );
  }

  const commentCountByPost = new Map<number, number>(
    commentGroups.map((g) => [g.postId, g._count._all]),
  );

  const homeHero = await prisma.homeHero.findUnique({
    where: { id: "home" },
  });

  return (
    <div className="flex flex-col">
      {/* Hero — carousel (rien ne s'affiche tant qu'il n'y a pas de galerie "accueil") */}
      <HomeCarousel />

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        {/* Logo inscrit dans un disque noir — agrandi pour la lisibilité.
            Le disque (rounded-full + bg-black) fait cadre ; le padding donne
            l'impression que le logo s'inscrit dedans. */}
        <div className="mx-auto mb-6 h-48 w-48 rounded-full bg-black p-6 sm:h-56 sm:w-56 lg:h-48 lg:w-48">
          <Image
            src="/AKFC_logo.svg"
            alt="AKFC logo"
            width={224}
            height={224}
            priority
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="mb-4 text-4xl font-bold">
          {homeHero?.title ?? "Bienvenue à l'AKFC"}
        </h1>
        <p className="mb-8 whitespace-pre-line text-lg text-gray-600">
          {homeHero?.body ??
            "Un club dédié à la pratique et à la transmission des arts martiaux et de leur culture, pour tous les âges et tous les niveaux. Découvrez nos disciplines, nos stages et la vie du club."}
        </p>
        {/* Un seul appel à l'action. « Découvrir nos disciplines » a été
            retiré : elles s'affichent en cartes juste en dessous, chacune avec
            son lien vers la présentation complète — un bouton vers une liste
            déjà déroulée sous les yeux du visiteur ne lui apprend rien.

            « Nous contacter » reste malgré l'item « Contacts » de la navbar :
            une entrée de navigation et un appel à l'action ne jouent pas le
            même rôle, même en menant au même endroit. */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Nous contacter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Présentations synthétiques des disciplines */}
      {disciplineCards.length > 0 && (
        <section className="akfc-page py-12">
          <h2 className="mb-8 text-2xl font-bold">Nos disciplines</h2>
          <SummaryCards
            cards={disciplineCards}
            collapsedHeight={styleRow?.cardCollapsedHeight ?? 220}
          />
        </section>
      )}

      {/* ── Mur de posts (flux façon Facebook) ─────────────────────── */}
      {posts.length > 0 && (
        <section className="mx-auto w-full max-w-2xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-bold">Actualités du club</h2>
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                reactions={reactionsByPost.get(post.id) ?? []}
                commentCount={commentCountByPost.get(post.id) ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="mb-3 text-2xl font-bold">
          Envie de nous rejoindre&nbsp;?
        </h2>
        <p className="mb-6 text-gray-600">
          Premier cours d&apos;essai, horaires, inscriptions&nbsp;: on répond à
          toutes vos questions.
        </p>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Nous contacter
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
