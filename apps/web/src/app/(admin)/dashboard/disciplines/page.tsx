import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import DisciplinesTable from "@features/admin/disciplines/components/DisciplinesTable";

/** Liste des disciplines — `/(admin)/dashboard/disciplines`. La table fetch via tRPC. */
export default function DisciplinesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disciplines</h2>
        <Link
          href="/dashboard/disciplines/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une discipline
        </Link>
      </div>
      <DisciplinesTable />
    </div>
  );
}