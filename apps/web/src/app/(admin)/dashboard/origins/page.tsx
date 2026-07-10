import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import OriginsTable from "@features/admin/origins/components/OriginsTable";

/** Liste des origines — `/(admin)/dashboard/origins`. */
export default function OriginsPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Origines</h2>
        <Link
          href="/dashboard/origins/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une origine
        </Link>
      </div>
      <OriginsTable />
    </div>
  );
}