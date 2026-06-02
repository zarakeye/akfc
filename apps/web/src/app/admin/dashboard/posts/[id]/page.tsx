"use client";

import { use, useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { Post } from "@prisma/client";

import { PostForm, type PostFormInput } from "@features/admin/posts/forms/PostForm";
import { usePostStore } from "@lib/stores/usePostStore";
import { PollEditor } from "@features/social/PollEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const postId = Number(id);

  const fetchPostById = usePostStore((s) => s.fetchPostById);
  const updatePost = usePostStore((s) => s.updatePost);
  const deletePost = usePostStore((s) => s.deletePost);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPostById(postId).then((p) => {
      if (!cancelled) {
        setPost(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [postId, fetchPostById]);

  const handleSubmit = async (input: PostFormInput): Promise<void> => {
    await updatePost({
      id: postId,
      title: input.title,
      content: input.content,
      publicationDate: input.publicationDate,
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet article ? Cette action est définitive."))
      return;
    setDeleteError(null);
    try {
      await deletePost(postId);
      router.push("/admin/dashboard/posts");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }
  if (!post) {
    return <p className="text-sm text-destructive">Article introuvable.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/dashboard/posts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/actualites/${post.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Voir la page publique
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
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