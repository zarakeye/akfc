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
