import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OriginForm } from "@features/admin/origins/forms/OriginForm";

/** Création — `/(admin)/dashboard/origins/create`. */
export default function CreateOriginPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/origins"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une origine</h2>
      <OriginForm />
    </div>
  );
}