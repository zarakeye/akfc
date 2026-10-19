"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Édition d'un utilisateur — `/(admin)/dashboard/users/[id]/edit`.
 *
 * Les accès sont désormais gérés par l'appartenance aux GROUPES (le groupe
 * Administrateurs confère l'admin) — voir la gestion des groupes de membres.
 * Cette page garde l'adresse du club du membre et la SUPPRESSION, bloquée sur soi-même.
 */
export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const utils = trpc.useUtils();
  const sessionUserId = useSessionStore((s) => s.session?.user?.id);

  const deleteMutation = trpc.user.delete.useMutation();
  const clubEmailMutation = trpc.user.setClubEmail.useMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  // Brouillon de l'adresse du club ; null = pas encore modifié (on affiche la valeur enregistrée).
  const [clubEmailDraft, setClubEmailDraft] = useState<string | null>(null);
  const [clubEmailNotice, setClubEmailNotice] = useState<string | null>(null);

  const { data: user, isLoading, isError } = trpc.user.getById.useQuery({ id });

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !user) {
    return <div className="text-red-600">Utilisateur introuvable.</div>;
  }

  const isSelf = sessionUserId === user.id;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.pseudo ||
    user.email;

  const clubEmailValue = clubEmailDraft ?? user.clubEmail ?? "";

  const handleSaveClubEmail = async () => {
    setClubEmailNotice(null);
    try {
      const res = await clubEmailMutation.mutateAsync({ id: user.id, clubEmail: clubEmailValue });
      await utils.user.getById.invalidate({ id: user.id });
      setClubEmailDraft(null);
      setClubEmailNotice(res.clubEmail ? "Adresse du club enregistrée." : "Adresse du club retirée.");
    } catch (err) {
      setClubEmailNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm("Supprimer cet utilisateur ? Cette action est définitive.")
    ) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: user.id });
      await utils.user.getAll.invalidate();
      router.push("/dashboard/users");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/dashboard/users/${user.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSelf || deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Éditer {displayName}</h2>

      <section className="mb-8 max-w-md space-y-2">
        <h3 className="text-base font-semibold">Adresse du club</h3>
        <p className="text-sm text-muted-foreground">
          Adresse @akfc.fr attribuée à ce membre (alias de contact@). Pour un instructeur, c&apos;est
          celle que voient les membres connectés ; son adresse personnelle reste réservée aux
          administrateurs.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={clubEmailValue}
            onChange={(e) => setClubEmailDraft(e.target.value)}
            placeholder="prenom@akfc.fr"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleSaveClubEmail}
            disabled={clubEmailMutation.isPending || clubEmailDraft === null}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
        {clubEmailNotice && <p className="text-sm text-muted-foreground">{clubEmailNotice}</p>}
      </section>

      <section className="max-w-md space-y-2 text-sm text-muted-foreground">
        <p>
          Les accès sont gérés via les{" "}
          <Link
            href="/dashboard/groups"
            className="underline hover:text-foreground"
          >
            groupes de membres
          </Link>{" "}
          (le groupe Administrateurs confère l'accès admin).
        </p>
        {isSelf && <p className="text-xs">Tu ne peux pas te supprimer.</p>}
        {actionError && (
          <pre className="mt-3 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {actionError}
          </pre>
        )}
      </section>
    </div>
  );
}
