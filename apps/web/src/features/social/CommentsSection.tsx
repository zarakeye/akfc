"use client";

import { useCallback, useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { ReactionsBar } from "@features/social/ReactionsBar";
import { UserPortrait, formatUserName } from "@features/social/userDisplay";

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

/* ─────────────────────────────────────────────────────────────────────── */
/*  Section principale                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

export function CommentsSection({ postId }: { postId: number }): JSX.Element {
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
  }, [fetchComments]);

  // Chargement initial : setState dans le `.then`, pas dans le corps
  // de l'effet (évite le lint set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    void fetchComments().then((data) => {
      if (!cancelled) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchComments]);

  const handleCreate = async (content: string, parentId: number | null) => {
    await trpcClient.comment.create.mutate({ postId, parentId, content });
    await refresh();
  };
  const handleUpdate = async (id: number, content: string) => {
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
      <h2 className="mb-4 text-xl font-bold">
        Commentaires{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {currentUser ? (
        <CommentForm
          onSubmit={(content) => handleCreate(content, null)}
          placeholder="Écrire un commentaire…"
          submitLabel="Commenter"
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
  onCreate: (content: string, parentId: number | null) => Promise<void>;
  onUpdate: (id: number, content: string) => Promise<void>;
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
            <CommentForm
              initialValue={node.content}
              onSubmit={async (content) => {
                await onUpdate(node.id, content);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              submitLabel="Enregistrer"
            />
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm">{node.content}</p>
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
              <CommentForm
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

/* ─────────────────────────────────────────────────────────────────────── */
/*  Formulaire (création racine, réponse, édition)                         */
/* ─────────────────────────────────────────────────────────────────────── */

interface CommentFormProps {
  initialValue?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
}

function CommentForm({
  initialValue = "",
  onSubmit,
  onCancel,
  placeholder,
  submitLabel = "Envoyer",
}: CommentFormProps) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (trimmed === "") {
      setError("Le commentaire ne peut pas être vide.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Envoi…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}