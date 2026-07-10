import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import FamiliesTable from "@features/admin/discipline-families/components/DisciplineFamiliesTable";

/** Liste des familles de disciplines — `/(admin)/dashboard/discipline-families`. */
export default function FamiliesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Familles de disciplines</h2>
        <Link
          href="/dashboard/discipline-families/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une famille
        </Link>
      </div>
      <FamiliesTable />
    </div>
  );
}