import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FamilyForm } from "@features/admin/discipline-families/forms/FamilyForm";

/** Création — `/(admin)/dashboard/discipline-families/create`. */
export default function CreateFamilyPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/discipline-families"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une famille</h2>
      <FamilyForm />
    </div>
  );
}