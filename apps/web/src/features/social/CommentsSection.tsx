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
