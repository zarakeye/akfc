import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CategoryForm } from "@features/admin/categories/forms/CategoryForm";

/** Création d'une catégorie — `/(admin)/dashboard/categories/create`. */
export default function CreateCategoryPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une catégorie</h2>

      {/* Pas d'`initial` → mode création. */}
      <CategoryForm />
    </div>
  );
}