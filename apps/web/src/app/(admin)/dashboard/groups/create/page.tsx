import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GroupForm } from "@features/admin/groups/forms/GroupForm";

/** Création — `/(admin)/dashboard/groups/create`. */
export default function CreateGroupPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/groups"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un groupe</h2>
      <GroupForm />
    </div>
  );
}
