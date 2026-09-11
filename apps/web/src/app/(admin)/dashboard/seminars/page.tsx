import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import SeminarsTable from "@features/admin/seminars/components/SeminarsTable";

/** Liste des stages — `/(admin)/dashboard/seminars`. La table fetch via trpc. */
export default function StagesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stages</h2>
        <Link
          href="/dashboard/seminars/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un stage
        </Link>
      </div>
      <SeminarsTable />
    </div>
  );
}