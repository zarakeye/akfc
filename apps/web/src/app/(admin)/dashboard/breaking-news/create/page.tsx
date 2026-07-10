import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateBreakingNews } from "@features/admin/breaking-news/components/CreateBreakingNews";

/** Création — `/(admin)/dashboard/breaking-news/create`. */
export default function CreateBreakingNewsPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/breaking-news"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une actualité</h2>
      <CreateBreakingNews />
    </div>
  );
}
