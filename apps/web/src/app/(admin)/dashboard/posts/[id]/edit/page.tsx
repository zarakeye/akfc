"use client";

import { use, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  PostForm,
  type PostFormInput,
} from "@features/admin/posts/forms/PostForm";
import { PollEditor } from "@features/social/PollEditor";

/**
 * EditPostPage
 *
 * Page d'édition d'un article de la section « Actualités ».
 *
 * Récupère l'article via `trpc.post.getByIdAdmin.useQuery()`, affiche un formulaire
 * d'édition (`PostForm`) pré-rempli, et gère les actions de mise à jour et de
 * suppression avec les mutations TRPC correspondantes. Gère aussi les états
 * de chargement et d'erreur, et propose des liens pour revenir à la liste ou
 * voir la page publique.
 */
export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const postId = Number(id);

  const utils = trpc.useUtils();
  const updateMutation = trpc.post.update.useMutation();
  const deleteMutation = trpc.post.delete.useMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: post,
    isLoading,
    isError,
  } = trpc.post.getByIdAdmin.useQuery(
    { id: postId },
    { enabled: Number.isFinite(postId) && postId > 0 },
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }
  if (isError || !post) {
    return <p className="text-sm text-destructive">Article introuvable.</p>;
  }

  const handleSubmit = async (input: PostFormInput): Promise<void> => {
    await updateMutation.mutateAsync({
      id: postId,
      title: input.title,
      content: input.content,
      publicationDate: input.publicationDate,
    });
    await utils.post.getAllAdmin.invalidate();
    await utils.post.getAll.invalidate();
    await utils.post.getByIdAdmin.invalidate({ id: postId });
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Supprimer cet article ? Cette action est définitive.")
    ) {
      return;
    }
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync({ id: postId });
      await utils.post.getAllAdmin.invalidate();
      await utils.post.getAll.invalidate();
      router.push("/dashboard/posts");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/#post-${post.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Voir sur le mur
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Éditer l&apos;article</h2>

      {deleteError && (
        <pre className="mb-4 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {deleteError}
        </pre>
      )}

      <PostForm
        initial={post}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer les modifications"
      />

      <PollEditor postId={postId} />
    </div>
  );
}
