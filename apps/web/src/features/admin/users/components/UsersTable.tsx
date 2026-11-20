"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { TABLE_STYLES } from "#components/ui/tableStyles.ts";
import { trpc } from "#core/trpc/trpcClient.ts";
import { DemoAccountsToggle, DemoBadge } from "#features/admin/common/DemoAccounts.tsx";
import {
  IMAGE_CONSENT_LABEL,
  IMAGE_CONSENT_PROOF_LABEL,
  LEGAL_AGE_LABEL,
} from "@akfc/contracts/legal/imageConsent.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { deleteColumn } from "#features/admin/common/delete/index.ts";
import { LegalAgeSortPanel } from "#features/admin/users/legal/LegalAgeSortPanel.tsx";

type UserRow = { id: string; email: string; name: string; groups: string; majority: string; photos: string; proof: string; kind: string; supprimer: string };

/** Séparateur des noms de groupes dans la cellule (texte : la recherche et le tri l'utilisent). */
const GROUP_SEP = " · ";

/**
 * Liste des utilisateurs — `user.getAll`. Clic → `[id]`.
 * Les comptes de démonstration (@akfc.demo) sont masqués par défaut ; un lien les affiche,
 * signalés par une pastille « Démo ».
 */
export default function UsersTable(): JSX.Element {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const me = useSessionStore((s) => s.session?.user?.id);
  const utils = trpc.useUtils();
  const remove = trpc.user.delete.useMutation();
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
      groups: u.groups.map((g) => g.name).join(GROUP_SEP),
      // Majorité effective, calculée par le serveur (qui garde la date de naissance pour lui).
      majority: LEGAL_AGE_LABEL[u.effectiveLegalAge],
      photos: IMAGE_CONSENT_LABEL[u.imageConsent],
      proof: IMAGE_CONSENT_PROOF_LABEL[u.consentProof],
      kind: u.isDemo ? "Démo" : "Membre",
      supprimer: u.id,
    }));
  const adminGroupNames = new Set(all.flatMap((u) => u.groups.filter((g) => g.isAdminGroup).map((g) => g.name)));

  const columns: Column<UserRow>[] = [
    { property: "email", displayName: "Email", type: "string" },
    { property: "name", displayName: "Nom", type: "string" },
    {
      property: "groups",
      displayName: "Groupes",
      type: "string",
      render: (value) => {
        const names = String(value ?? "").split(GROUP_SEP).filter(Boolean);
        if (names.length === 0) return <span className="text-xs text-muted-foreground">aucun</span>;
        return (
          <span className="flex flex-wrap gap-1">
            {names.map((n) => (
              <span
                key={n}
                className={`rounded-full px-2 py-0.5 text-xs ${
                  adminGroupNames.has(n)
                    ? "bg-warning-muted font-semibold text-warning"
                    : "bg-muted text-foreground"
                }`}
              >
                {n}
              </span>
            ))}
          </span>
        );
      },
    },
    {
      // Tri des comptes existants : la recherche « Non renseignée » ou « Mineur » filtre la liste.
      property: "majority",
      displayName: "Majorité",
      type: "string",
      render: (value) => {
        const v = String(value ?? "");
        const tone =
          v === LEGAL_AGE_LABEL.UNKNOWN
            ? "bg-warning-muted text-warning"
            : v === LEGAL_AGE_LABEL.MINOR
              ? "bg-info-muted text-info"
              : "bg-muted text-foreground";
        return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{v}</span>;
      },
    },
    {
      property: "photos",
      displayName: "Photos",
      type: "string",
      render: (value) => {
        const v = String(value ?? "");
        const tone =
          v === IMAGE_CONSENT_LABEL.GRANTED
            ? "bg-success-muted text-success"
            : v === IMAGE_CONSENT_LABEL.REFUSED
              ? "bg-destructive-muted text-destructive"
              : "bg-muted text-muted-foreground";
        return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{v}</span>;
      },
    },
    {
      // Preuve de l'autorisation : un statut « Accordée » sans formulaire n'a pas de valeur de preuve.
      property: "proof",
      displayName: "Formulaire",
      type: "string",
      render: (value) => {
        const v = String(value ?? "");
        const tone =
          v === IMAGE_CONSENT_PROOF_LABEL.NONE
            ? "bg-muted text-muted-foreground"
            : v === IMAGE_CONSENT_PROOF_LABEL.PENDING_GUARDIAN
              ? "bg-warning-muted text-warning"
              : "bg-success-muted text-success";
        return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{v}</span>;
      },
    },
    {
      property: "kind",
      displayName: "Compte",
      type: "string",
      render: (value) => (value === "Démo" ? <DemoBadge /> : <span>{String(value)}</span>),
    },
    deleteColumn(rows, {
      entityLabel: "le compte de",
      nameOf: (r) => r.name || r.email,
      consequence: "Ses formulaires de droit à l'image signés restent conservés comme preuve.",
      disabledReason: (r) => (r.id === me ? "Vous ne pouvez pas supprimer votre propre compte." : null),
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await utils.user.getAll.invalidate();
      },
    }),
  ];

  return (
    <div>
      <LegalAgeSortPanel
        comptes={all
          .filter((u) => (showDemo || !u.isDemo) && u.legalAge === "UNKNOWN")
          .map((u) => ({
            id: u.id,
            email: u.email,
            name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
            isDemo: u.isDemo,
          }))}
      />
      <DemoAccountsToggle count={demoCount} shown={showDemo} onToggle={() => setShowDemo((v) => !v)} />
      <Table
        styleClassNames={TABLE_STYLES}
        columns={columns}
        rows={rows}
        onRowClick={(row: UserRow | null) => {
          if (row) router.push(`/dashboard/users/${row.id}`);
        }}
      />
    </div>
  );
}
