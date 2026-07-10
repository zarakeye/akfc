import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { EditBreakingNews } from "@features/admin/breaking-news/components/EditBreakingNews";

/** Édition — `/(admin)/dashboard/breaking-news/[id]/edit`. */
export default async function EditBreakingNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isFinite(newsId) || newsId <= 0) notFound();

  return (
    <div>
      <Link
        href="/dashboard/breaking-news"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer l&apos;actualité</h2>
      <EditBreakingNews id={newsId} />
    </div>
  );
}
