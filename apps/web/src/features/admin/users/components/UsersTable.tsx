"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";
import { DemoAccountsToggle, DemoBadge } from "@features/admin/common/DemoAccounts";

type UserRow = { id: string; email: string; name: string; kind: string };

/**
 * Liste des utilisateurs — `user.getAll`. Clic → `[id]`.
 * Les comptes de démonstration (@akfc.demo) sont masqués par défaut ; un lien les affiche,
 * signalés par une pastille « Démo ».
 */
export default function UsersTable(): JSX.Element {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const { data, isLoading, isError } = trpc.user.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des utilisateurs.</div>;

  const all = data ?? [];
  const demoCount = all.filter((u) => u.isDemo).length;
  const rows: UserRow[] = all
    .filter((u) => showDemo || !u.isDemo)
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
      kind: u.isDemo ? "Démo" : "Membre",
    }));

  const columns: Column<UserRow>[] = [
    { property: "email", displayName: "Email", type: "string" },
    { property: "name", displayName: "Nom", type: "string" },
    {
      property: "kind",
      displayName: "Compte",
      type: "string",
      render: (value) => (value === "Démo" ? <DemoBadge /> : <span>{String(value)}</span>),
    },
  ];

  return (
    <div>
      <DemoAccountsToggle count={demoCount} shown={showDemo} onToggle={() => setShowDemo((v) => !v)} />
      <Table
        columns={columns}
        rows={rows}
        onRowClick={(row: UserRow | null) => {
          if (row) router.push(`/dashboard/users/${row.id}`);
        }}
      />
    </div>
  );
}
