#!/bin/bash
# Fix COMPLET du noeud serveur/client autour de PostCard :
#  1) userDisplay.tsx melangeait des fonctions PURES (formatUserName,
#     portraitUrl, initials) et un COMPOSANT CLIENT (UserPortrait, qui lit le
#     store d avatar via un hook). Le hook rendait tout le module client ->
#     formatUserName devenait "client", inappelable depuis un Server
#     Component (PostCard). => SPLIT : userDisplay.ts (pur, serveur+client) +
#     UserPortrait.tsx ("use client"). Imports des consommateurs adaptes.
#  2) PostCard n est PLUS "use client" (il doit etre Server Component pour
#     rendre PageRenderer async) ; PageRenderer importe en direct (pas le
#     baril mixte) ; Suspense autour du PageRenderer.
#  3) Les 9 pages de presentation importent aussi PageRenderer en direct.
# ATTENTION : ce script ECRASE ces fichiers avec la version de reference.
# Si tu as d autres modifs non commitees dans l un d eux, sauvegarde avant.
# À lancer depuis la RACINE du monorepo : bash fix_userdisplay_split.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

# Retire l ancien module mixte (remplace par .ts + UserPortrait.tsx)
rm -f apps/web/src/features/social/userDisplay.tsx

echo "-> apps/web/src/features/social/userDisplay.ts"
cat > 'apps/web/src/features/social/userDisplay.ts' << 'FILE_EOF'
/**
 * Helpers PURS d'affichage d'un utilisateur (aucun hook → importable côté
 * SERVEUR comme client). Séparés de `UserPortrait` (composant client qui lit
 * le store de version d'avatar) : mélanger un hook client et ces fonctions
 * dans un même module rendait `formatUserName` « client », donc inappelable
 * depuis un Server Component (ex. PostCard rendant PageRenderer).
 *
 * `DisplayUser` est la projection minimale renvoyée par les routers social
 * (même `select` partout) — les types inférés de tRPC y sont structurellement
 * assignables.
 */

export interface DisplayUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
  avatar: string | null;
  image: string | null;
}

/** Nom complet → pseudo → email (cascade habituelle du projet). */
export function formatUserName(u: DisplayUser): string {
  const full = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return full || u.pseudo || u.email;
}

/**
 * URL du proxy pour un publicId Cloudinary (délivrance publique,
 * authenticated signé côté serveur — marche pour les anonymes).
 */
export function publicIdToUrl(publicId: string, version?: number): string {
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  const v = version ? `&v=${version}` : "";
  return `/api/media/by-public-id/${enc}?variant=large${v}`;
}

/**
 * URL de portrait. `avatar` est un publicId Cloudinary (uploadé via la
 * fiche profil) → passe par le proxy. `image` est déjà une URL absolue
 * (fournisseur OAuth) → utilisée telle quelle. Sinon null (→ initiales).
 */
export function portraitUrl(u: DisplayUser, version?: number): string | null {
  if (u.avatar) return publicIdToUrl(u.avatar, version);
  if (u.image) return u.image;
  return null;
}

/** Deux premières lettres du nom, pour le fallback sans portrait. */
export function initials(u: DisplayUser): string {
  return formatUserName(u).slice(0, 2).toUpperCase();
}
FILE_EOF

echo "-> apps/web/src/features/social/UserPortrait.tsx"
cat > 'apps/web/src/features/social/UserPortrait.tsx' << 'FILE_EOF'
"use client";

import type { JSX } from "react";

import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import {
  type DisplayUser,
  portraitUrl,
  initials,
} from "@features/social/userDisplay";

/**
 * Pastille ronde : portrait si disponible, sinon initiales sur fond neutre.
 * Deux tailles : `sm` (20px, listes denses) et `md` (32px, en-tête de
 * commentaire).
 *
 * Composant CLIENT (lit le store de version d'avatar pour se rafraîchir
 * quand l'avatar change). Les helpers purs (formatUserName, portraitUrl…)
 * vivent dans `userDisplay.ts`, importable côté serveur.
 */
export function UserPortrait({
  user,
  size = "sm",
}: {
  user: DisplayUser;
  size?: "sm" | "md";
}): JSX.Element {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-5 w-5 text-[10px]";
  // Version d'avatar de CE user (partagée) : tout changement la bumpe et
  // recharge l'image ici comme partout ailleurs.
  const version = useAvatarVersionStore((s) => s.versions[user.id] ?? 0);
  const url = portraitUrl(user, version);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={url}
        src={url}
        alt=""
        className={`shrink-0 rounded-full object-cover ${dim}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-muted font-medium ${dim}`}
    >
      {initials(user)}
    </span>
  );
}
FILE_EOF

echo "-> apps/web/src/features/social/PostCard.tsx"
cat > 'apps/web/src/features/social/PostCard.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/features/social/CommentsSection.tsx"
cat > 'apps/web/src/features/social/CommentsSection.tsx' << 'FILE_EOF'
"use client";

import { useCallback, useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { ReactionsBar } from "@features/social/ReactionsBar";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName } from "@features/social/userDisplay";
import { CommentEditor } from "@features/social/CommentEditor";
import { CommentContent } from "@features/social/CommentContent";
import type { ProseMirrorContent } from "@contracts/shared/prosemirror";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types & helpers                                                        */
/* ─────────────────────────────────────────────────────────────────────── */

type FlatComment = Awaited<
  ReturnType<typeof trpcClient.comment.getByPost.query>
>[number];

type CommentNodeData = FlatComment & { replies: CommentNodeData[] };

/**
 * Reconstruit l'arbre à partir de la liste plate triée par date. On
 * indexe chaque commentaire par id, puis on raccroche chacun à son
 * parent (ou aux racines si `parentId` est null). Un parent manquant
 * (cas limite) retombe en racine pour ne jamais perdre un commentaire.
 * L'ordre chronologique est préservé (on parcourt la liste déjà triée).
 */
function buildTree(comments: FlatComment[]): CommentNodeData[] {
  const byId = new Map<number, CommentNodeData>();
  const roots: CommentNodeData[] = [];

  for (const c of comments) byId.set(c.id, { ...c, replies: [] });

  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.parentId == null) {
      roots.push(node);
    } else {
      const parent = byId.get(c.parentId);
      if (parent) parent.replies.push(node);
      else roots.push(node);
    }
  }
  return roots;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(new Date(date));
}

/**
 * `content` sort du backend en JsonValue (schéma opaque). Pour rééditer,
 * on ne repasse à l'éditeur que ce qui ressemble à un document (objet
 * non-tableau) ; le reste (legacy, corrompu) ouvre un éditeur vide.
 */
function asEditableContent(value: unknown): ProseMirrorContent | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as ProseMirrorContent)
    : undefined;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Section principale                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

interface CommentsSectionProps {
  postId: number;
  /** Masque le h2 « Commentaires (n) » (le mur affiche son propre compteur). */
  hideTitle?: boolean;
  /** Éditeur racine en mode compact (une ligne, s'étend au focus). */
  compactEditor?: boolean;
  /** Notifie le parent du nombre de commentaires (compteur du mur). */
  onCountChange?: (count: number) => void;
}

export function CommentsSection({
  postId,
  hideTitle = false,
  compactEditor = false,
  onCountChange,
}: CommentsSectionProps): JSX.Element {
  const currentUser = useSessionStore((s) => s.session?.user);
  const [comments, setComments] = useState<FlatComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(
    () => trpcClient.comment.getByPost.query({ postId }),
    [postId],
  );

  // `refresh` (avec setState) sert après chaque mutation, hors effet.
  const refresh = useCallback(async () => {
    const data = await fetchComments();
    setComments(data);
    setLoading(false);
    onCountChange?.(data.length);
  }, [fetchComments, onCountChange]);

  // Chargement initial : setState dans le `.then`, pas dans le corps
  // de l'effet (évite le lint set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    void fetchComments().then((data) => {
      if (!cancelled) {
        setComments(data);
        setLoading(false);
        onCountChange?.(data.length);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchComments, onCountChange]);

  const handleCreate = async (
    content: ProseMirrorContent,
    parentId: number | null,
  ) => {
    await trpcClient.comment.create.mutate({ postId, parentId, content });
    await refresh();
  };
  const handleUpdate = async (id: number, content: ProseMirrorContent) => {
    await trpcClient.comment.update.mutate({ id, content });
    await refresh();
  };
  const handleDelete = async (id: number) => {
    await trpcClient.comment.delete.mutate({ id });
    await refresh();
  };

  const tree = buildTree(comments);

  return (
    <section className="mt-10">
      {!hideTitle && (
        <h2 className="mb-4 text-xl font-bold">
          Commentaires{comments.length > 0 ? ` (${comments.length})` : ""}
        </h2>
      )}

      {currentUser ? (
        <CommentEditor
          onSubmit={(content) => handleCreate(content, null)}
          placeholder="Écrire un commentaire…"
          submitLabel="Commenter"
          compact={compactEditor}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Connecte-toi pour participer à la discussion.
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
      ) : tree.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aucun commentaire pour l&apos;instant.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-6">
          {tree.map((node) => (
            <CommentNode
              key={node.id}
              node={node}
              currentUserId={currentUser?.id ?? null}
              canComment={Boolean(currentUser)}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Nœud récursif                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

interface CommentNodeProps {
  node: CommentNodeData;
  currentUserId: string | null;
  canComment: boolean;
  onCreate: (
    content: ProseMirrorContent,
    parentId: number | null,
  ) => Promise<void>;
  onUpdate: (id: number, content: ProseMirrorContent) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function CommentNode({
  node,
  currentUserId,
  canComment,
  onCreate,
  onUpdate,
  onDelete,
}: CommentNodeProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const isAuthor = currentUserId != null && node.authorId === currentUserId;

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <UserPortrait user={node.author} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {formatUserName(node.author)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(node.createdAt)}
            </span>
          </div>

          {editing ? (
            <CommentEditor
              initialContent={asEditableContent(node.content)}
              onSubmit={async (content) => {
                await onUpdate(node.id, content);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              submitLabel="Enregistrer"
            />
          ) : (
            <CommentContent doc={node.content} />
          )}

          {!editing && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ReactionsBar targetType="COMMENT" targetId={node.id} />

              {canComment && (
                <button
                  type="button"
                  onClick={() => setReplying((r) => !r)}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Répondre
                </button>
              )}
              {isAuthor && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Supprimer ce commentaire et ses réponses ?",
                        )
                      ) {
                        void onDelete(node.id);
                      }
                    }}
                    className="text-xs text-destructive transition-colors hover:underline"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-3">
              <CommentEditor
                onSubmit={async (content) => {
                  await onCreate(content, node.id);
                  setReplying(false);
                }}
                onCancel={() => setReplying(false)}
                placeholder={`Répondre à ${formatUserName(node.author)}…`}
                submitLabel="Répondre"
              />
            </div>
          )}
        </div>
      </div>

      {node.replies.length > 0 && (
        <ul className="ml-6 flex flex-col gap-4 border-l border-border pl-4">
          {node.replies.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              currentUserId={currentUserId}
              canComment={canComment}
              onCreate={onCreate}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
FILE_EOF

echo "-> apps/web/src/features/social/ReactionsBar.tsx"
cat > 'apps/web/src/features/social/ReactionsBar.tsx' << 'FILE_EOF'
"use client";

import { useCallback, useEffect, useState } from "react";
import { SmilePlus } from "lucide-react";
import type { ReactionTarget } from "@prisma/client";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName } from "@features/social/userDisplay";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

/** Set fixe d'emojis proposés. Modifiable sans rien casser ailleurs. */
const EMOJI_SET = ["👍", "❤️", "😂", "😮", "😢", "👏"] as const;

/** Au-delà, le survol tronque la liste des auteurs avec « +N ». */
const MAX_TOOLTIP_USERS = 8;

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types (dérivés de l'inférence tRPC)                                    */
/* ─────────────────────────────────────────────────────────────────────── */

type ReactionGroup = Awaited<
  ReturnType<typeof trpcClient.reaction.getByTarget.query>
>[number];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant principal                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

export interface ReactionsBarProps {
  targetType: ReactionTarget;
  targetId: number;
  /** Réactions initiales (SSR) ; sinon le composant les charge au montage. */
  initialReactions?: ReactionGroup[];
  /** N pastilles max affichées, le reste replié en « +n » (mur). */
  maxVisible?: number;
  /**
   * Avec `initialReactions` : re-fetch au montage UNIQUEMENT si un user
   * est connecté, pour corriger `reactedByMe` (le serveur public ne
   * connaît pas la session). Anonyme = zéro requête.
   */
  revalidateOnMount?: boolean;
}

/**
 * Barre de réactions emoji, réutilisable sur un Post comme sur un
 * Comment (polymorphe via `targetType`/`targetId`).
 *
 * Affichage des emojis posés (compteur, surlignage de ceux de
 * l'utilisateur), tooltip auteurs au survol (tronqué « +N »), bouton
 * d'ajout avec set fixe. Lecture seule si non connecté.
 */
export function ReactionsBar({
  targetType,
  targetId,
  initialReactions,
  maxVisible,
  revalidateOnMount = false,
}: ReactionsBarProps) {
  const currentUser = useSessionStore((s) => s.session?.user);
  const canReact = Boolean(currentUser);

  const [reactions, setReactions] = useState<ReactionGroup[]>(
    initialReactions ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const fetchReactions = useCallback(
    () => trpcClient.reaction.getByTarget.query({ targetType, targetId }),
    [targetType, targetId],
  );

  // `refresh` (avec setState) sert aux mutations, hors effet.
  const refresh = useCallback(async () => {
    setReactions(await fetchReactions());
  }, [fetchReactions]);

  // Chargement initial : le setState vit dans le `.then` (asynchrone),
  // donc pas de setState synchrone dans le corps de l'effet.
  useEffect(() => {
    if (initialReactions != null && !(revalidateOnMount && canReact)) return;
    let cancelled = false;
    void fetchReactions().then((data) => {
      if (!cancelled) setReactions(data);
    });
    return () => {
      cancelled = true;
    };
  }, [initialReactions, fetchReactions, revalidateOnMount, canReact]);

  const handleToggle = async (emoji: string) => {
    if (!canReact || pending) return;
    setPending(emoji);
    try {
      await trpcClient.reaction.toggle.mutate({ targetType, targetId, emoji });
      await refresh();
    } finally {
      setPending(null);
      setPickerOpen(false);
    }
  };

  const visible =
    maxVisible != null ? reactions.slice(0, maxVisible) : reactions;
  const overflow = reactions.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((group) => (
        <ReactionPill
          key={group.emoji}
          group={group}
          pending={pending === group.emoji}
          canReact={canReact}
          onToggle={() => handleToggle(group.emoji)}
        />
      ))}

      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          +{overflow}
        </span>
      )}

      {canReact && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Ajouter une réaction"
          >
            <SmilePlus className="h-4 w-4" />
          </button>

          {pickerOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPickerOpen(false)}
              />
              <div className="absolute bottom-full left-0 z-20 mb-1 flex gap-1 rounded-full border border-border bg-popover p-1 shadow-md">
                {EMOJI_SET.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleToggle(emoji)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Pastille d'un emoji + tooltip auteurs                                  */
/* ─────────────────────────────────────────────────────────────────────── */

interface ReactionPillProps {
  group: ReactionGroup;
  pending: boolean;
  canReact: boolean;
  onToggle: () => void;
}

function ReactionPill({
  group,
  pending,
  canReact,
  onToggle,
}: ReactionPillProps) {
  const hidden = group.users.length - MAX_TOOLTIP_USERS;

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={!canReact || pending}
        className={[
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors",
          group.reactedByMe
            ? "border-primary bg-primary/10"
            : "border-border hover:bg-muted",
          pending ? "opacity-50" : "",
          !canReact ? "cursor-default" : "",
        ].join(" ")}
      >
        <span>{group.emoji}</span>
        <span className="text-xs tabular-nums">{group.count}</span>
      </button>

      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 group-hover:block">
        <div className="min-w-40 rounded-md border border-border bg-popover p-2 shadow-md">
          <ul className="flex flex-col gap-1">
            {group.users.slice(0, MAX_TOOLTIP_USERS).map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-2 whitespace-nowrap text-xs"
              >
                <UserPortrait user={u} size="sm" />
                <span>{formatUserName(u)}</span>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              +{hidden} autre{hidden > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/profil/page.tsx"
cat > 'apps/web/src/app/(public)/profil/page.tsx' << 'FILE_EOF'
"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";

/**
 * Page « Mon profil » — accessible à tout membre connecté (le proxy garde
 * `/profil`). Affiche les infos et un bouton « Éditer » vers /profil/edit
 * (le même formulaire que la première connexion). Le rôle est en lecture
 * seule ici : seul un admin le modifie, ailleurs.
 */
export default function ProfilePage(): JSX.Element {
  const { data, isLoading, error } = trpc.user.getCurrentUserProfile.useQuery();

  const displayUser: DisplayUser | null = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      pseudo: data.pseudo,
      email: data.email,
      avatar: data.avatar,
      image: null,
    };
  }, [data]);

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-12">Chargement…</div>;
  }
  if (error || !data || !displayUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-red-600">
        Impossible de charger votre profil.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="scale-150">
          <UserPortrait user={displayUser} size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{formatUserName(displayUser)}</h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <Link
          href="/profil/edit?from=profil"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </Link>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Prénom" value={data.firstName} />
        <Field label="Nom" value={data.lastName} />
        <Field label="Pseudo" value={data.pseudo} />
        <Field label="Téléphone" value={data.phone} />
        <Field label="Date de naissance" value={data.birthDate} />
        <div className="sm:col-span-2">
          <Field label="À propos" value={data.aboutMe} />
        </div>
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">
        {value?.trim() ? value : <span className="text-gray-400">—</span>}
      </dd>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/app-shell/UserMenu.tsx"
cat > 'apps/web/src/features/app-shell/UserMenu.tsx' << 'FILE_EOF'
"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { UserPortrait } from "@features/social/UserPortrait";

/**
 * UserMenu is a React component that displays a user menu when the user is connected.
 * It shows the user's first name, email and a logout button.
 * When the user clicks on the logout button, it clears the session and redirects the user to the homepage.
 * The menu is only visible when the user is connected.
 * @returns {React.ReactElement | null} - The user menu React element or null if the user is not connected.
 */
export default function UserMenu(): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useSessionStore((s) => s.logout);
  const user = useSessionStore((s) => s.session?.user);

  /**
   * Logs out the user by clearing the session and redirecting to the homepage.
   * @returns {Promise<void>} - The promise resolves when the logout mutation has been completed and the user has been redirected.
   */
  const handleLogout = async (): Promise<void> => {
    await logout(); // met à jour le store
    router.push("/"); // redirige vers la page d'accueil
  };

  // Si pas connecté, ne pas afficher le menu
  if (!user) return null;

  return (
    <div
      className="relative inline-block p-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <UserPortrait
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            pseudo: user.pseudo,
            email: user.email,
            avatar: user.avatar,
            image: null,
          }}
          size="md"
        />
        <span className="text-white">{user.firstName ?? "Utilisateur"}</span>
      </div>

      {open && (
        <div className="absolute right-0 top-10 w-60 bg-white border rounded shadow-md z-50">
          <p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>
          <Link
            href="/profil"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/disciplines/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/disciplines/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const TYPE_LABELS: Record<string, string> = {
  MARTIAL_ART: "Art martial",
  CALLIGRAPHY: "Calligraphie",
};

function formatInstructorName(
  instructor: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/**
 * Présentation admin d'une discipline — `/(admin)/dashboard/disciplines/[id]`.
 *
 * Server Component : charge la discipline, affiche ses métadonnées + le rendu
 * de sa `description` (PageRenderer), le tout dans `PresentationShell` qui
 * fournit le retour à la liste et le bouton « Éditer » → `[id]/edit`.
 */
export default async function DisciplinePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const disciplineId = Number(id);
  if (!Number.isFinite(disciplineId)) notFound();

  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    include: {
      category: { select: { type: true } },
      instructor: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      origin: { select: { name: true, flag: true, region: true } },
      family: { select: { name: true } },
    },
  });
  if (!discipline) notFound();

  const description = parsePageContentV1(discipline.description);
  const instructorName = formatInstructorName(discipline.instructor);

  return (
    <PresentationShell
      title={discipline.name}
      listHref="/dashboard/disciplines"
      editHref={`/dashboard/disciplines/${discipline.id}/edit`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {TYPE_LABELS[discipline.type] ?? discipline.type} •{" "}
        {discipline.category.type}
      </p>

      <dl className="mb-8 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        {discipline.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{discipline.slug}</dd>
          </div>
        )}
        {discipline.family && (
          <div>
            <dt className="font-medium text-muted-foreground">Famille</dt>
            <dd>{discipline.family.name}</dd>
          </div>
        )}
        {discipline.school && (
          <div>
            <dt className="font-medium text-muted-foreground">École</dt>
            <dd>{discipline.school}</dd>
          </div>
        )}
        {discipline.classification && (
          <div>
            <dt className="font-medium text-muted-foreground">Classification</dt>
            <dd>{discipline.classification}</dd>
          </div>
        )}
        {discipline.origin && (
          <div>
            <dt className="font-medium text-muted-foreground">Origine</dt>
            <dd>
              {discipline.origin.flag ? `${discipline.origin.flag} ` : ""}
              {discipline.origin.name}
            </dd>
          </div>
        )}
        {instructorName && (
          <div>
            <dt className="font-medium text-muted-foreground">Instructeur</dt>
            <dd>{instructorName}</dd>
          </div>
        )}
      </dl>

      <PageRenderer content={description} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/stages/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/stages/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

function animatorName(a: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || "—";
}

/**
 * Présentation admin d'un stage — `/(admin)/dashboard/stages/[id]`.
 * Deux composites (description + programme) → deux PageRenderer.
 */
export default async function StagePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const stageId = Number(id);
  if (!Number.isFinite(stageId)) notFound();

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
      animators: { select: { id: true, firstName: true, lastName: true } },
      sessions: { orderBy: { date: "asc" } },
    },
  });
  if (!stage) notFound();

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);
  const rattachement =
    stage.discipline?.name ??
    stage.externalDisciplineLabel ??
    stage.origin?.name ??
    "—";

  return (
    <PresentationShell
      title={stage.label}
      listHref="/dashboard/stages"
      editHref={`/dashboard/stages/${stage.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Rattachement</dt>
          <dd>{rattachement}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Public</dt>
          <dd>{AUDIENCE_LABELS[stage.audience] ?? stage.audience}</dd>
        </div>
        {stage.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{stage.slug}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-muted-foreground">Animateurs</dt>
          <dd>
            {stage.animators
              .map(
                (a) =>
                  animatorName(a) +
                  (a.id === stage.primaryAnimatorId ? " (principal)" : ""),
              )
              .join(", ") || "—"}
          </dd>
        </div>
        {stage.sessions.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Séances</dt>
            <dd>
              {stage.sessions
                .map((s) => new Date(s.date).toLocaleDateString("fr-FR"))
                .join(" • ")}
            </dd>
          </div>
        )}
      </dl>

      <section className="mb-8">
        <h3 className="mb-2 text-lg font-semibold">Présentation</h3>
        <PageRenderer content={description} />
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold">Programme</h3>
        <PageRenderer content={program} />
      </section>
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** null → Brouillon, future → Programmé, passée → Publié. */
function statut(publicationDate: Date | null): string {
  if (!publicationDate) return "Brouillon";
  return publicationDate > new Date()
    ? `Programmé le ${publicationDate.toLocaleDateString("fr-FR")}`
    : `Publié le ${publicationDate.toLocaleDateString("fr-FR")}`;
}

/**
 * Présentation admin d'un article — `/(admin)/dashboard/posts/[id]` (lecture seule).
 *
 * Server Component en Prisma direct (pattern des fiches stages/disciplines/
 * users) : `PageRenderer` est un RSC async, inrendable depuis un Client
 * Component — l'ancienne version client (React Query) crashait pour cette
 * raison. Contrepartie assumée : la fiche est fraîche au chargement de la
 * page, plus par le cache React Query (une navigation retour depuis /edit
 * refetch côté serveur, ce qui revient au même).
 *
 * La garde d'accès est portée par le proxy (matcher /dashboard) — comme
 * pour les autres fiches RSC de l'admin.
 */
export default async function PostPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) notFound();

  const content = parsePageContentV1(post.content);

  return (
    <PresentationShell
      title={post.title}
      listHref="/dashboard/posts"
      editHref={`/dashboard/posts/${post.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Statut</dt>
          <dd>{statut(post.publicationDate)}</dd>
        </div>
      </dl>

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/events/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/events/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

function organizerName(
  u: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string {
  if (!u) return "—";
  const parts = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || u.pseudo || u.email;
}

function statut(publicationDate: Date | null): string {
  if (!publicationDate) return "Brouillon";
  const d = new Date(publicationDate);
  return d > new Date()
    ? `Programmé le ${d.toLocaleDateString("fr-FR")}`
    : `Publié le ${d.toLocaleDateString("fr-FR")}`;
}

/**
 * Présentation admin d'un évènement — `/(admin)/dashboard/events/[id]`.
 */
export default async function EventPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
      organizer: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });
  if (!event) notFound();

  const content = parsePageContentV1(event.content);
  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??
    event.origin?.name ??
    "—";

  return (
    <PresentationShell
      title={event.label}
      listHref="/dashboard/events"
      editHref={`/dashboard/events/${event.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Statut</dt>
          <dd>{statut(event.publicationDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Public</dt>
          <dd>{AUDIENCE_LABELS[event.audience] ?? event.audience}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Rattachement</dt>
          <dd>{rattachement}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Organisateur</dt>
          <dd>{organizerName(event.organizer)}</dd>
        </div>
        {event.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{event.slug}</dd>
          </div>
        )}
        {event.sessions.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Séances</dt>
            <dd>
              {event.sessions
                .map((s) => new Date(s.date).toLocaleDateString("fr-FR"))
                .join(" • ")}
            </dd>
          </div>
        )}
      </dl>

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/courses/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/courses/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

/** HHMM (1830) → "18h30". Fonction pure inline — évite le `formatHHMM` du
 *  module `'use client'` TimeInput, inappelable depuis un Server Component. */
const fmtHHMM = (t: number): string =>
  `${Math.floor(t / 100)}h${String(t % 100).padStart(2, "0")}`;

function formatInstructorName(
  instructor: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/**
 * Présentation admin d'un cours — `/(admin)/dashboard/courses/[id]`.
 */
export default async function CoursePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      discipline: { select: { name: true } },
      instructor: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
    },
  });
  if (!course) notFound();

  const content = parsePageContentV1(course.content);
  const instructorName = formatInstructorName(course.instructor);

  return (
    <PresentationShell
      title={course.discipline.name}
      listHref="/dashboard/courses"
      editHref={`/dashboard/courses/${course.id}/edit`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {DAY_LABELS[course.day] ?? course.day} • {fmtHHMM(course.beginTime)}–
        {fmtHHMM(course.endTime)} •{" "}
        {AUDIENCE_LABELS[course.audience] ?? course.audience}
        {instructorName && <> • Animé par {instructorName}</>}
      </p>

      {course.requisites.length > 0 && (
        <div className="mb-8 border-b border-border pb-6">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Prérequis
          </h3>
          <ul className="list-disc pl-5 text-sm">
            {course.requisites.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/disciplines/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/disciplines/[slug]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import {
  formatUserName,
  formatTime,
  formatSessionDate,
  AUDIENCE_LABELS,
} from "@lib/format";

/**
 * Page publique d'un Stage par slug — `/stages/[slug]`.
 *
 * Le Stage porte **deux composites** (`description` et `program`), rendus
 * via deux `PageRenderer`. Header de métadonnées (rattachement, audience,
 * animateurs) + liste des sessions datées.
 */
export default async function PublicStagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const stage = await prisma.stage.findUnique({
    where: { slug },
    include: {
      discipline: { select: { name: true, slug: true } },
      origin: { select: { name: true, slug: true, flag: true } },
      primaryAnimator: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      animators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });

  if (!stage) notFound();

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);

  const primaryName = formatUserName(stage.primaryAnimator);
  const rattachement =
    stage.discipline?.name ??
    stage.externalDisciplineLabel ??
    stage.origin?.name ??
    null;

  // Co-animateurs = animators sans le principal.
  const coAnimators = stage.animators
    .filter((a) => a.id !== stage.primaryAnimatorId)
    .map((a) => formatUserName(a))
    .filter((n): n is string => Boolean(n));

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Stage • {AUDIENCE_LABELS[stage.audience] ?? stage.audience}
        </p>
        <h1 className="text-3xl font-bold">{stage.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {rattachement && (
            <div>
              <dt className="font-medium text-muted-foreground">Discipline</dt>
              <dd>
                {stage.origin?.flag ? `${stage.origin.flag} ` : ""}
                {rattachement}
              </dd>
            </div>
          )}
          {primaryName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Animateur principal
              </dt>
              <dd>{primaryName}</dd>
            </div>
          )}
          {coAnimators.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">
                Co-animateurs
              </dt>
              <dd>{coAnimators.join(", ")}</dd>
            </div>
          )}
        </dl>

        {stage.sessions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Dates
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {stage.sessions.map((s) => (
                <li key={s.id}>
                  <span className="font-medium capitalize">
                    {formatSessionDate(s.date)}
                  </span>{" "}
                  — {formatTime(s.beginTime)}–{formatTime(s.endTime)}
                  {s.location && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {s.location}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Présentation</h2>
        <PageRenderer content={description} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Programme</h2>
        <PageRenderer content={program} />
      </section>
    </article>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/stages/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/stages/[slug]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { formatHHMM } from "@lib/time/formatHHMM";
import { AddToCalendarLinks } from "@features/calendar/AddToCalendarLinks";
import {
  formatUserName,
  formatSessionDate,
  AUDIENCE_LABELS,
} from "@lib/format";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un Stage par slug — `/stages/[slug]`.
 *
 * Rend les deux composites (description et program) édités au PageBuilder,
 * plus l'en-tête riche (rattachement, animateurs, prérequis) et la liste
 * des sessions associées.
 *
 * **Garde de publication** : un Stage dont `publicationDate` est `null`
 * (brouillon) ou dans le futur (programmé) n'est pas visible publiquement
 * → `notFound()`. Cohérent avec le filtrage public du router.
 */
export default async function PublicStagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const stage = await prisma.stage.findUnique({
    where: { slug },
    include: {
      discipline: {
        select: { id: true, name: true },
      },
      origin: {
        select: { id: true, name: true, slug: true, flag: true, region: true },
      },
      primaryAnimator: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      animators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      sessions: {
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      },
    },
  });

  if (!stage) notFound();

  // Garde de publication : pas visible si brouillon (null) ou programmé (futur).
  if (!stage.publicationDate || stage.publicationDate > new Date()) {
    notFound();
  }

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);
  const primaryAnimatorName = formatUserName(stage.primaryAnimator);

  // Co-animateurs = animators[] moins le primaryAnimator
  const coAnimators = stage.animators
    .filter((a) => a.id !== stage.primaryAnimatorId)
    .map((a) => formatUserName(a))
    .filter((n): n is string => Boolean(n));

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Stage • {AUDIENCE_LABELS[stage.audience] ?? stage.audience}
        </p>
        <h1 className="text-3xl font-bold">{stage.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {stage.discipline && (
            <div>
              <dt className="font-medium text-muted-foreground">Discipline</dt>
              <dd>{stage.discipline.name}</dd>
            </div>
          )}
          {stage.externalDisciplineLabel && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Discipline (externe)
              </dt>
              <dd>{stage.externalDisciplineLabel}</dd>
            </div>
          )}
          {stage.origin && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Origine culturelle
              </dt>
              <dd>
                {stage.origin.flag ? `${stage.origin.flag} ` : ""}
                {stage.origin.name}
              </dd>
            </div>
          )}
          {primaryAnimatorName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Animateur principal
              </dt>
              <dd>{primaryAnimatorName}</dd>
            </div>
          )}
          {coAnimators.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">
                Co-animateurs
              </dt>
              <dd>{coAnimators.join(", ")}</dd>
            </div>
          )}
          {stage.preRegistered.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">Prérequis</dt>
              <dd>
                <ul className="list-inside list-disc">
                  {stage.preRegistered.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* ── Description ──────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Présentation</h2>
        <PageRenderer content={description} />
      </section>

      {/* ── Programme ────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Programme</h2>
        <PageRenderer content={program} />
      </section>

      {/* ── Sessions ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sessions</h2>
          {stage.sessions.length > 0 && (
            <a
              href={`/api/calendar/stages/${stage.id}`}
              download
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Ajouter à mon agenda
            </a>
          )}
        </div>
        {stage.sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Pas encore de sessions programmées.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stage.sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium capitalize">
                    {formatSessionDate(session.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatHHMM(session.beginTime)}–
                    {formatHHMM(session.endTime)}
                    {session.location && ` • ${session.location}`}
                  </p>
                  {session.notes && (
                    <p className="mt-2 text-sm">{session.notes}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <AddToCalendarLinks
                    event={{
                      title: stage.label,
                      date: session.date,
                      beginTime: session.beginTime,
                      endTime: session.endTime,
                      location: session.location,
                      description: session.notes,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/events/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/events/[slug]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import {
  formatUserName,
  formatTime,
  formatSessionDate,
  AUDIENCE_LABELS,
} from "@lib/format";

/**
 * Page publique d'un Event par slug — `/evenements/[slug]`.
 *
 * Un seul composite (`content`), rendu via `PageRenderer`. Header de
 * métadonnées (rattachement, audience, organisateur) + sessions datées.
 *
 * **Garde de publication** : un Event dont `publicationDate` est `null`
 * (brouillon) ou dans le futur (programmé) n'est pas visible
 * publiquement → `notFound()`. Cohérent avec le filtre du `event.getAll`
 * du router. Le `getBySlug`, lui, ne filtre pas (il peut servir une
 * preview admin), donc le contrôle se fait ici, côté page publique.
 */
export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      discipline: { select: { name: true, slug: true } },
      origin: { select: { name: true, slug: true, flag: true } },
      organizer: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });

  if (!event) notFound();

  // Garde de publication : pas visible si brouillon ou programmé.
  if (!event.publicationDate || event.publicationDate > new Date()) {
    notFound();
  }

  const content = parsePageContentV1(event.content);
  const organizerName = formatUserName(event.organizer);
  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??
    event.origin?.name ??
    null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Événement • {AUDIENCE_LABELS[event.audience] ?? event.audience}
        </p>
        <h1 className="text-3xl font-bold">{event.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {rattachement && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Rattachement
              </dt>
              <dd>
                {event.origin?.flag ? `${event.origin.flag} ` : ""}
                {rattachement}
              </dd>
            </div>
          )}
          {organizerName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Organisateur
              </dt>
              <dd>{organizerName}</dd>
            </div>
          )}
        </dl>

        {event.sessions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Dates
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {event.sessions.map((s) => (
                <li key={s.id}>
                  <span className="font-medium capitalize">
                    {formatSessionDate(s.date)}
                  </span>{" "}
                  — {formatTime(s.beginTime)}–{formatTime(s.endTime)}
                  {s.location && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {s.location}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <PageRenderer content={content} />
    </article>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/course/[id]/page.tsx"
cat > 'apps/web/src/app/(public)/course/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

function formatTime(hhmm: number): string {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function formatInstructorName(
  instructor: { firstName: string | null; lastName: string | null; pseudo: string | null; email: string } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un Course — rend le composite édité dans l'admin.
 *
 * Server Component asynchrone : charge le Course depuis Prisma avec
 * jointure sur Discipline et Instructor, valide le `content` via
 * `parsePageContentV1` (fallback sur empty si invalide), et passe au
 * `PageRenderer` qui orchestre la résolution batch des mediaIds.
 *
 * Pour le smoke test : c'est ici que tu vois si le rendu final est
 * correct. Les images Cloudinary doivent s'afficher, les audio R2
 * doivent jouer (route publique sous-chantier 6c), les documents R2
 * doivent télécharger, et le texte enrichi avec ses inline images doit
 * être présent.
 */
export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      discipline: { select: { name: true } },
      instructor: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
    },
  });

  if (!course) notFound();

  const content = parsePageContentV1(course.content);
  const instructorName = formatInstructorName(course.instructor);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{course.discipline.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DAY_LABELS[course.day] ?? course.day} •{" "}
          {formatTime(course.beginTime)}–{formatTime(course.endTime)}
          {instructorName && <> • Animé par {instructorName}</>}
        </p>
      </header>

      <PageRenderer content={content} />
    </article>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck