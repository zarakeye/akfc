"use client";

import { useState } from "react";
import { trpc } from "@trpc/trpcClient";
import {
  EMPTY_LEGAL_INFO,
  LegalInfoFields,
  legalInfoError,
  type LegalInfoValue,
} from "@features/admin/users/legal/LegalInfoFields";

export interface CreateUserFormInput {
  email: string;
  groupIds: string[];
  /** Majorité (obligatoire) ; mineur : date de naissance et parent référent. */
  legal: LegalInfoValue;
}

export interface CreateUserFormProps {
  onSubmit: (input: CreateUserFormInput) => Promise<void>;
  submitLabel?: string;
}

/**
 * Form de création d'utilisateur. On assigne UN OU PLUSIEURS GROUPES : l'appartenance au groupe
 * Administrateurs confère l'admin (source de vérité unique). Le mot de passe est
 * généré côté serveur et envoyé par email — l'admin ne le saisit jamais.
 */
export function CreateUserForm({
  onSubmit,
  submitLabel = "Créer",
}: CreateUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [legal, setLegal] = useState<LegalInfoValue>(EMPTY_LEGAL_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Liste des groupes pour le sélecteur (procédure admin).
  const { data: groups } = trpc.memberGroup.list.useQuery();

  const handleSubmit = async () => {
    setSubmitError(null);
    if (email.trim() === "") {
      setSubmitError("L'email est obligatoire.");
      return;
    }
    if (groupIds.length === 0) {
      setSubmitError("Choisis au moins un groupe.");
      return;
    }
    const legalError = legalInfoError(legal);
    if (legalError) {
      setSubmitError(legalError);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), groupIds, legal });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1 font-medium">Groupes</legend>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2">
          {[...(groups ?? [])]
            .sort((a, b) => Number(b.isAdminGroup) - Number(a.isAdminGroup))
            .map((g) => (
              <label key={g.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted">
                <input
                  type="checkbox"
                  checked={groupIds.includes(g.id)}
                  onChange={(e) =>
                    setGroupIds((prev) =>
                      e.target.checked ? [...prev, g.id] : prev.filter((id) => id !== g.id),
                    )
                  }
                />
                <span>{g.name}</span>
                {g.isAdminGroup && (
                  <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-900">Admin</span>
                )}
              </label>
            ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {groupIds.length === 0 ? "Au moins un groupe." : `${groupIds.length} groupe(s) sélectionné(s).`}
        </span>
      </fieldset>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1 font-medium">Majorité</legend>
        <LegalInfoFields value={legal} onChange={setLegal} />
      </fieldset>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Création…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
