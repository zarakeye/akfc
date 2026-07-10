#!/bin/bash
# Chantier sondages sur le mur : PollWidget monte sur les cartes des posts
# qui ONT un sondage (fetch proportionnel aux votes, pas de N+1).
# À lancer depuis la RACINE du monorepo : bash apply_polls_mur.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> apps/web/src/app/(public)/page.tsx"
echo "   include poll (existence)"
cat > 'apps/web/src/app/(public)/page.tsx' << 'FILE_EOF'
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

/**
 * Page d'accueil PUBLIQUE du club (AKFC).
 *
 * Server Component : aucune dépendance à la session, aucun hook trpc
 * React-Query (le provider n'enveloppe que l'admin). Le carousel
 * (`HomeCarousel`) est un Client Component fetchant en vanilla `trpcClient`.
 *
 * Mur de posts « façon Facebook » : flux vertical, contenu composite
 * rendu intégralement côté serveur (PageRenderer) et clampé visuellement
 * (ExpandableContent) — pas de navigation, `/actualites/[id]` restant le
 * permalien. Les réactions et comptes de commentaires sont hydratés ici
 * en DEUX requêtes batch (esprit anti-N+1 de `getByTargets`, version
 * serveur) : un visiteur anonyme n'émet aucune requête au premier paint.
 * `reactedByMe` est volontairement false côté serveur (pas de session en
 * RSC public) : les îlots le corrigent à l'hydratation pour les membres.
 */
export default async function HomePage(): Promise<JSX.Element> {
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
FILE_EOF

echo "-> apps/web/src/features/social/PostCard.tsx"
echo "   PollWidget conditionnel, hors clamp"
cat > 'apps/web/src/features/social/PostCard.tsx' << 'FILE_EOF'
import type { JSX } from "react";

import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import type { GroupedReaction } from "@backend/modules/reactions/router";

import {
  UserPortrait,
  formatUserName,
  type DisplayUser,
} from "@features/social/userDisplay";
import { ExpandableContent } from "@features/social/ExpandableContent";
import { PollWidget } from "@features/social/PollWidget";
import { PostInteractions } from "@features/social/PostInteractions";

/**
 * Carte d'un post sur le mur de la home — Server Component.
 *
 * Le contenu composite (PageBuilder) est rendu INTÉGRALEMENT côté
 * serveur par `PageRenderer` (RSC async), puis clampé visuellement par
 * l'îlot client `ExpandableContent` (pattern RSC-dans-children-de-client) :
 * « Voir → » ne déclenche ni fetch ni re-render serveur.
 *
 * `/actualites/[id]` reste le permalien du post ; le mur, lui, ne
 * navigue plus.
 */

interface PostCardProps {
  post: {
    id: number;
    title: string;
    publicationDate: Date | null;
    content: unknown;
    author: DisplayUser | null;
    poll: { id: number } | null;
  };
  reactions: GroupedReaction[];
  commentCount: number;
}

function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

export function PostCard({
  post,
  reactions,
  commentCount,
}: PostCardProps): JSX.Element {
  const content = parsePageContentV1(post.content);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        {post.author && <UserPortrait user={post.author} size="md" />}
        <div className="min-w-0">
          {post.author && (
            <p className="text-sm font-medium">{formatUserName(post.author)}</p>
          )}
          {post.publicationDate && (
            <time className="text-xs text-gray-500">
              {formatPostDate(post.publicationDate)}
            </time>
          )}
        </div>
      </header>

      <h3 className="mb-3 text-lg font-semibold">{post.title}</h3>

      <ExpandableContent>
        <PageRenderer content={content} />
      </ExpandableContent>

      {/* Hors du clamp : un appel à voter ne se cache pas derrière « Voir → ». */}
      {post.poll && (
        <div className="mt-4">
          <PollWidget postId={post.id} />
        </div>
      )}

      <PostInteractions
        postId={post.id}
        initialReactions={reactions}
        initialCommentCount={commentCount}
      />
    </article>
  );
}
FILE_EOF

echo
echo "2 fichiers ecrits. Validation :"
pnpm --filter web typecheck
