"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type PostRow = {
  id: number;
  title: string;
  statut: string;
  publication: string;
};

/** null → Brouillon, future → Programmé, passée → Publié. */
function statutLabel(publicationDate: Date | string | null, now: number): string {
  if (!publicationDate) return "Brouillon";
  return new Date(publicationDate).getTime() <= now ? "Publié" : "Programmé";
}

/** Liste admin des articles — `getAllAdmin` (brouillons inclus). Clic → `[id]`. */
export default function PostsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.post.getAllAdmin.useQuery();
  const [now] = useState(() => Date.now());

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des articles.</div>;

  const rows: PostRow[] = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    statut: statutLabel(p.publicationDate, now),
    publication: p.publicationDate
      ? new Date(p.publicationDate).toLocaleDateString("fr-FR")
      : "—",
  }));

  const columns: Column<PostRow>[] = [
    { property: "title", displayName: "Titre", type: "string" },
    { property: "statut", displayName: "Statut", type: "string" },
    { property: "publication", displayName: "Publication", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: PostRow | null) => {
        if (row) router.push(`/dashboard/posts/${row.id}`);
      }}
    />
  );
}