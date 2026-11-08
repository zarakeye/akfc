"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { missingForMinor, type LegalAgeValue } from "@contracts/legal/imageConsent";
import { LegalInfoFields, toLegalInput, type LegalInfoValue } from "@features/admin/users/legal/LegalInfoFields";

/**
 * Fiche d'un utilisateur (admin) : majorité, date de naissance, parent référent. Un mineur peut
 * être enregistré avant que tout soit connu (tri des comptes existants) : la fiche dit ce qui
 * manque, et le formulaire pré-rempli reste indisponible jusque-là.
 */
export function LegalInfoControl({
  userId,
  member,
  initial,
}: {
  userId: string;
  member: { firstName: string | null; lastName: string | null };
  initial: { legalAge: LegalAgeValue; birthDate: string; guardianName: string; guardianEmail: string; guardianRelation: string };
}): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [value, setValue] = useState<LegalInfoValue>({
    legalAge: initial.legalAge,
    birthDate: initial.birthDate,
    guardianName: initial.guardianName,
    guardianEmail: initial.guardianEmail,
    guardianRelation: initial.guardianRelation,
  });
  const save = trpc.user.setLegalInfo.useMutation({
    onSuccess: async () => {
      await utils.user.getAll.invalidate();
      router.refresh();
    },
  });

  const legalAge = value.legalAge ?? "UNKNOWN";
  const missing =
    legalAge === "MINOR"
      ? missingForMinor({
          firstName: member.firstName,
          lastName: member.lastName,
          birthDate: value.birthDate ? new Date(`${value.birthDate}T00:00:00Z`) : null,
          // Une date saisie ici par un admin est vérifiée dès l'enregistrement.
          birthDateVerified: value.birthDate !== "",
          guardianName: value.guardianName || null,
          guardianEmail: value.guardianEmail || null,
          guardianRelation: value.guardianRelation || null,
        })
      : [];
  const canDownload = legalAge !== "MINOR" || missing.length === 0;

  return (
    <fieldset className="mt-6 rounded-lg border border-border p-4 text-sm" data-tour="users.legal">
      <legend className="px-1 font-medium">Majorité et parent référent</legend>
      <LegalInfoFields value={value} onChange={setValue} allowUnknown disabled={save.isPending} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate({ userId, legal: toLegalInput({ ...value, legalAge }) })}
          className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {canDownload ? (
          <a
            href={`/api/media/image-consent/prefilled?userId=${encodeURIComponent(userId)}`}
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
          >
            <FileDown className="h-4 w-4" />
            Formulaire de droit à l&apos;image pré-rempli
          </a>
        ) : (
          <span className="text-muted-foreground">Formulaire pré-rempli indisponible : il manque des informations.</span>
        )}
      </div>
      {legalAge === "MINOR" && missing.length > 0 && (
        <p className="mt-2 text-amber-800">À renseigner : {missing.join(", ")}.</p>
      )}
      {save.isSuccess && <p className="mt-2 text-emerald-700">Enregistré.</p>}
      {save.error && <p className="mt-2 text-red-600">{save.error.message}</p>}
    </fieldset>
  );
}
