import { Suspense, type JSX } from "react";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import type { GroupedReaction } from "@backend/modules/reactions/router";

import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";
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
 * Le mur est l'unique lieu de vie public du post (l'ancienne page
 * `/actualites/[id]` a été supprimée) ; l'ancre `post-<id>` sert de
 * cible au lien de prévisualisation de l'admin.
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
    <article
      id={`post-${post.id}`}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
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
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded bg-gray-100" />}
        >
          <PageRenderer content={content} />
        </Suspense>
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
