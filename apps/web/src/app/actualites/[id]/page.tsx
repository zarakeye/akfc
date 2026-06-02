import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { ReactionsBar } from "@features/social/ReactionsBar";
import { CommentsSection } from "@features/social/CommentsSection";
import { PollWidget } from "@features/social/PollWidget";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

function formatAuthorName(
  user: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!user) return null;
  const fullName = [user.firstName, user.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return fullName || user.pseudo || user.email;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un article (`Post`) — rend le composite `content`
 * édité au PageBuilder, avec en-tête (titre, auteur, date).
 *
 * ⚠️ **Garde de publication** : refuse (404) les posts non publiés
 * (`publicationDate` null ou future). `findFirst` car la condition sur
 * `publicationDate` n'est pas unique, et pas d'appel impur pendant le
 * render du Server Component.
 *
 * URL : `/actualites/[id]`. C'est ici que viendront se greffer, dans les
 * prochaines briques, les réactions sur l'article, le bloc commentaires,
 * et le sondage éventuel.
 */
export default async function PublicPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      publicationDate: { not: null, lte: new Date() },
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
    },
  });

  if (!post) notFound();

  const authorName = formatAuthorName(post.author);
  const content = parsePageContentV1(post.content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {authorName && <>Par {authorName} • </>}
          {post.publicationDate && formatDate(post.publicationDate)}
        </p>
      </header>

      <PageRenderer content={content} />

      <div className="mt-8 border-t border-border pt-6">
        <ReactionsBar targetType="POST" targetId={post.id} />
      </div>

      <CommentsSection postId={post.id} />

      <div className="mt-8 border-t border-border pt-6">
        <ReactionsBar targetType="POST" targetId={post.id} />
      </div>

      <PollWidget postId={post.id} />

      <CommentsSection postId={post.id} />
    </article>
  );
}