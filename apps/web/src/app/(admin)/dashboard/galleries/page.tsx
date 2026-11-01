import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import GalleriesTable from "@features/admin/galleries/components/GalleriesTable";

/** Liste des galeries — `/(admin)/dashboard/galleries`. */
export default function GalleriesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Galeries</h2>
        <Link
          href="/dashboard/galleries/create"
          data-tour="galleries.list.create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une galerie
        </Link>
      </div>
      <GalleriesTable />
    </div>
  );
}
