"use client";

import { useState, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

/**
 * Statut de publication d'un post (même logique que Event).
 * `now` est capturé une fois au montage (lazy initializer de useState)
 * pour ne pas appeler `Date.now()` pendant le render (règle de pureté).
 */
function publicationStatus(
  publicationDate: Date | string | null,
  now: number,
): { label: string; className: string } {
  if (!publicationDate) {
    return { label: "Brouillon", className: "bg-muted text-muted-foreground" };
  }
  const isPublished = new Date(publicationDate).getTime() <= now;
  return isPublished
    ? { label: "Publié", className: "bg-green-100 text-green-800" }
    : { label: "Programmé", className: "bg-blue-100 text-blue-800" };
}

export default function PostsListPage(): JSX.Element {
  // Lecture via React Query (brouillons inclus) — même cache que les mutations.
  const { data: posts, isLoading, isError } =
    trpc.post.getAllAdmin.useQuery();

  const [now] = useState(() => Date.now());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Posts</h2>
        <Link
          href="/dashboard/posts/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un article
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">
          Erreur lors du chargement des articles.
        </p>
      ) : (posts ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun article pour le moment.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Titre</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">Publication</th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? []).map((p) => {
                const status = publicationStatus(p.publicationDate, now);
                return (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/dashboard/posts/${p.id}`}
                        className="hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.publicationDate
                        ? new Date(p.publicationDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}