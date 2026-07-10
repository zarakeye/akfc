"use client";

import { useState, type JSX } from "react";
import { MessageCircle } from "lucide-react";

import {
  ReactionsBar,
  type ReactionsBarProps,
} from "@features/social/ReactionsBar";
import { CommentsSection } from "@features/social/CommentsSection";

/**
 * Îlot client au pied d'une carte du mur (pattern Facebook) :
 * réactions à gauche (5 pastilles max + « +n »), compteur de
 * commentaires à droite, dont le clic déplie la discussion SUR PLACE
 * (aucune navigation), éditeur compact au pied de la liste.
 *
 * Les données initiales viennent du Server Component (zéro requête au
 * premier paint pour un visiteur anonyme) ; `revalidateOnMount` ne
 * corrige `reactedByMe` que pour les membres connectés.
 */

interface PostInteractionsProps {
  postId: number;
  initialReactions: NonNullable<ReactionsBarProps["initialReactions"]>;
  initialCommentCount: number;
}

export function PostInteractions({
  postId,
  initialReactions,
  initialCommentCount,
}: PostInteractionsProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCommentCount);

  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between gap-4">
        <ReactionsBar
          targetType="POST"
          targetId={postId}
          initialReactions={initialReactions}
          maxVisible={5}
          revalidateOnMount
        />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {count} commentaire{count > 1 ? "s" : ""}
        </button>
      </div>

      {open && (
        <CommentsSection
          postId={postId}
          hideTitle
          compactEditor
          onCountChange={setCount}
        />
      )}
    </div>
  );
}
