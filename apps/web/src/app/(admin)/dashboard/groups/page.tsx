import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import GroupsTable from "@features/admin/groups/components/GroupsTable";

/** Liste des groupes de membres — `/(admin)/dashboard/groups`. */
export default function GroupsPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Groupes de membres</h2>
        <Link
          href="/dashboard/groups/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un groupe
        </Link>
      </div>
      <GroupsTable />
    </div>
  );
}
