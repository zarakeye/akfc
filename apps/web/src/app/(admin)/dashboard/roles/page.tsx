import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import RolesTable from "@features/admin/roles/components/RolesTable";

/** Liste des rôles — `/(admin)/dashboard/roles`. */
export default function RolesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rôles</h2>
        <Link
          href="/dashboard/roles/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un rôle
        </Link>
      </div>
      <RolesTable />
    </div>
  );
}