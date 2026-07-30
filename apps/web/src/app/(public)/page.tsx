import type { JSX } from "react";
import Link from "next/link";
import { Award, Calendar, PartyPopper, Images, ArrowRight } from "lucide-react";

import HomeCarousel from "@features/app-shell/HomeCarousel";

import { prisma } from "@backend/prisma";
import {
  groupReactions,
  userSelect,
  type GroupedReaction,
} from "@backend/modules/reactions/router";
import { PostCard } from "@features/social/PostCard";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { DisciplineSummaryCards } from "@features/disciplines/DisciplineSummaryCards";
import { parsePageContentV1 } from "@contracts/page";

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
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, summary: true },
  });

  const disciplineCards = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      // Rendu SERVEUR, passé ensuite en ReactNode au composant client qui
      // arbitre le dépliage : « Lire la suite » ne va rien chercher, il lève
      // seulement le clamp.
      content: <PageRenderer content={content} />,
    }));

  const activities = [
    {
      href: "/disciplines",
      icon: Award,
      title: "Nos disciplines",
      desc: "Les arts martiaux et pratiques enseignés au club.",
    },
    {
      href: "/stages",
      icon: Calendar,
      title: "Nos stages",
      desc: "Sessions intensives et rencontres ponctuelles.",
    },
    {
      href: "/events",
      icon: PartyPopper,
      title: "Nos évènements",
      desc: "Démonstrations, ateliers et temps forts de la vie du club.",
    },
    {
      href: "/gallery",
      icon: Images,
      title: "La galerie",
      desc: "Images des entraînements, stages et moments partagés.",
    },
  ];

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

  return (
    <div className="flex flex-col">
      {/* Hero — carousel (rien ne s'affiche tant qu'il n'y a pas de galerie "accueil") */}
      <HomeCarousel />

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Bienvenue à l&apos;AKFC</h1>
        <p className="mb-8 text-lg text-gray-600">
          Un club dédié à la pratique et à la transmission des arts martiaux et
          de leur culture, pour tous les âges et tous les niveaux. Découvrez nos
          disciplines, nos stages et la vie du club.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/disciplines"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Découvrir nos disciplines
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-3 font-medium transition-colors hover:bg-gray-50"
          >
            Nous contacter
          </Link>
        </div>
      </section>

      {/* Présentations synthétiques des disciplines */}
      {disciplineCards.length > 0 && (
        <section className="akfc-page py-12">
          <h2 className="mb-8 text-2xl font-bold">Nos disciplines</h2>
          <DisciplineSummaryCards cards={disciplineCards} />
        </section>
      )}

      {/* Accès aux pages publiques */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <Icon className="h-8 w-8 text-emerald-600" />
                <p className="text-lg font-semibold">{title}</p>
                <p className="flex-1 text-sm text-gray-600">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                  Voir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
