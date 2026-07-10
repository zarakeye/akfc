import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RoleForm } from "@features/admin/roles/forms/RoleForm";

/** Création — `/(admin)/dashboard/roles/create`. */
export default function CreateRolePage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/roles"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un rôle</h2>
      <RoleForm />
    </div>
  );
}