"use client";

import { useState } from "react";
import { trpc } from "@trpc/trpcClient";

export interface CreateUserFormInput {
  email: string;
  groupId: string;
}

export interface CreateUserFormProps {
  onSubmit: (input: CreateUserFormInput) => Promise<void>;
  submitLabel?: string;
}

/**
 * Form de création d'utilisateur. On assigne un GROUPE : l'appartenance au groupe
 * Administrateurs confère l'admin (source de vérité unique). Le mot de passe est
 * généré côté serveur et envoyé par email — l'admin ne le saisit jamais.
 */
export function CreateUserForm({
  onSubmit,
  submitLabel = "Créer",
}: CreateUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
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
    if (groupId === "") {
      setSubmitError("Choisis un groupe.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), groupId });
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

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Groupe</span>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        >
          <option value="">— Choisir —</option>
          {(groups ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

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
