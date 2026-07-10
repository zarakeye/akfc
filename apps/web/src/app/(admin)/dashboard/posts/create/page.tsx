"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  PostForm,
  type PostFormInput,
} from "@features/admin/posts/forms/PostForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Création d'un article — `/(admin)/dashboard/posts/create`.
 * `authorId` est posé côté router (utilisateur courant), pas un input.
 */
export default function CreatePostPage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.post.create.useMutation();
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (input: PostFormInput): Promise<void> => {
    const created = await createMutation.mutateAsync({
      title: input.title,
      content: input.content,
      publicationDate: input.publicationDate,
    });
    await utils.post.getAllAdmin.invalidate();
    await utils.post.getAll.invalidate();
    setCreatedId(created.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/posts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un article</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/posts/${createdId}`}
          message="Article créé."
        />
      ) : (
        <PostForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}