"use client";

import { startTransition, useActionState, useEffect, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { changePasswordFormSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { PasswordField } from "#features/auth/PasswordField.tsx";
import { changePasswordFormAction } from "#features/auth/change-password/changePasswordForm.action.ts";
import {
  initialChangePasswordFormState,
  type ChangePasswordFormState,
  type ChangePasswordFormValues,
} from "#features/auth/change-password/changePasswordForm.types.ts";

/**
 * Changement de mot de passe (membre connecté, page profil), sur le modèle hybride :
 *   - React Hook Form et le schéma partagé (confirmation comprise) préviennent les erreurs ;
 *   - useActionState relie le formulaire à la server action et suit l'envoi ;
 *   - la server action revalide et appelle le service, qui vérifie le mot de passe ACTUEL.
 * Succès → les autres appareils sont déconnectés ; la session en cours est conservée.
 */
export default function ChangePasswordForm(): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<ChangePasswordFormState, FormData>(
    changePasswordFormAction,
    initialChangePasswordFormState,
  );

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, reset, setError, formState } = form;

  // Réussite : les champs se vident. Refus du serveur : chaque erreur se range sous son champ.
  useEffect(() => {
    if (state.status === "success") {
      reset();
      return;
    }
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(field as keyof ChangePasswordFormValues, { type: "server", message });
    }
  }, [state, reset, setError]);

  const okMsg = state.status === "success" ? state.message : null;
  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // La validation de React Hook Form est asynchrone : on suspend TOUJOURS l'envoi (un
        // preventDefault après un await arriverait trop tard), puis on le relance s'il est valide.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        void form.trigger().then((valid) => {
          if (valid) startTransition(() => formAction(formData));
        });
      }}
      noValidate
      className="max-w-xl space-y-4"
    >
      {okMsg && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {okMsg}
        </div>
      )}
      {errMsg && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <div className="grid gap-2">
        <PasswordField
          label="Mot de passe actuel"
          autoComplete="current-password"
          error={formState.errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <PasswordField
          label="Nouveau mot de passe"
          autoComplete="new-password"
          error={formState.errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordField
          label="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          error={formState.errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "Modification…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
