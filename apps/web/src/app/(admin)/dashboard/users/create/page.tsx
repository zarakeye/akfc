import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateUserForm } from "#features/admin/users/forms/create-user/CreateUserForm.tsx";

/** Création — `/(admin)/dashboard/users/create`. id User = string (cuid). */
export default function CreateUserPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un utilisateur</h2>
      <CreateUserForm />
    </div>
  );
}
