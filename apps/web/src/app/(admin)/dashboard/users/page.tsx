import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import UsersTable from "@features/admin/users/components/UsersTable";

/** Liste des utilisateurs — `/(admin)/dashboard/users`. */
export default function UsersPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <Link
          href="/dashboard/users/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un utilisateur
        </Link>
      </div>
      <UsersTable />
    </div>
  );
}