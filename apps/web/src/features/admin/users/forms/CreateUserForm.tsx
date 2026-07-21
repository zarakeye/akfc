"use client";

import { useState } from "react";
import { trpc } from "@trpc/trpcClient";

export interface CreateUserFormInput {
  email: string;
  roleId: number;
}

export interface CreateUserFormProps {
  onSubmit: (input: CreateUserFormInput) => Promise<void>;
  submitLabel?: string;
}

/**
 * Form de création d'utilisateur. Pas de mode édition : côté admin, seul le
 * rôle est modifiable (sur la fiche, via `updateUserRoleById`). Le mot de
 * passe est GÉNÉRÉ côté serveur à la création et envoyé par email — l'admin
 * ne le saisit jamais.
 */
export function CreateUserForm({
  onSubmit,
  submitLabel = "Créer",
}: CreateUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [roleId, setRoleId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Liste des rôles pour le sélecteur (procédure protégée `manage_roles`).
  const { data: roles } = trpc.role.getAll.useQuery();

  const handleSubmit = async () => {
    setSubmitError(null);
    if (email.trim() === "") {
      setSubmitError("L'email est obligatoire.");
      return;
    }
    if (roleId === 0) {
      setSubmitError("Choisis un rôle.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), roleId });
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
        <span className="font-medium">Rôle</span>
        <select
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="rounded border border-input bg-background px-2 py-1"
        >
          <option value={0}>— Choisir —</option>
          {(roles ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
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