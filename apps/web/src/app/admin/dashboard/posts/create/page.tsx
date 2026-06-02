"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PostForm, type PostFormInput } from "@features/admin/posts/forms/PostForm";
import { usePostStore } from "@lib/stores/usePostStore";

export default function CreatePostPage(): JSX.Element {
  const router = useRouter();
  const createPost = usePostStore((s) => s.createPost);

  const handleSubmit = async (input: PostFormInput): Promise<void> => {
    const created = await createPost({
      title: input.title,
      content: input.content,
      publicationDate: input.publicationDate,
    });
    router.push(`/admin/dashboard/posts/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/posts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un article</h2>
      <PostForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}