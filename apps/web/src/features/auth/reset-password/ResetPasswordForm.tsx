"use client";

import Link from "next/link";
import { JSX, startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PASSWORD_MIN_LENGTH, resetPasswordFormSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { PasswordField } from "#features/auth/PasswordField.tsx";
import { resetPasswordFormAction } from "#features/auth/reset-password/resetPasswordForm.action.ts";
import {
  initialResetPasswordFormState,
  type ResetPasswordFormState,
  type ResetPasswordFormValues,
} from "#features/auth/reset-password/resetPasswordForm.types.ts";

/**
 * Formulaire de réinitialisation (ou de premier mot de passe, `isWelcome`), sur le modèle hybride :
 *   - React Hook Form et le schéma partagé préviennent les erreurs sous les champs ;
 *   - useActionState relie le formulaire à la server action et suit l'envoi ;
 *   - la server action revalide avec le même schéma et appelle le service, qui fait foi.
 * Le jeton du lien voyage dans un champ caché. Sans JavaScript, le formulaire s'envoie quand même.
 */
export function ResetPasswordForm({ token, isWelcome }: { token: string; isWelcome: boolean }): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<ResetPasswordFormState, FormData>(
    resetPasswordFormAction,
    initialResetPasswordFormState,
  );

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe ; pas en quittant le champ (onBlur) :
    // le message disparaîtrait au moment du clic, le bouton bougerait et le clic tomberait à côté.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;

  // Les erreurs de champ renvoyées par le serveur se rangent sous les champs, comme les locales.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(field as keyof ResetPasswordFormValues, { type: "server", message });
    }
  }, [state, setError]);

  const done = state.status === "success";
  const linkError = state.status === "error" && !state.fieldErrors ? state.error : null;
  const disabled = !token || isPending || done;

  return (
    <>
      {!token && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium text-destructive">Lien invalide</p>
          <p className="text-muted-foreground mt-1">
            Il manque le token dans l’URL. Reviens sur “Mot de passe oublié” et redemande un lien.
          </p>
        </div>
      )}

      <form
        action={formAction}
        onSubmit={(e) => {
          // Lu tout de suite, tant que l'évènement est disponible.
          const formData = new FormData(e.currentTarget);
          // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
          void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
        }}
        noValidate
        className="space-y-4"
      >
        {/* Le jeton n'est pas un champ saisi : il est dans les valeurs de React Hook Form (defaultValues)
            pour la validation, et dans ce champ caché pour l'envoi. */}
        <input type="hidden" name="token" value={token} />

        <PasswordField
          label="Nouveau mot de passe"
          autoComplete="new-password"
          placeholder={`Min. ${PASSWORD_MIN_LENGTH} caractères`}
          disabled={disabled}
          error={formState.errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordField
          label="Confirmer"
          autoComplete="new-password"
          disabled={disabled}
          error={formState.errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          className="rounded bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
          disabled={disabled}
        >
          {isPending ? "Validation..." : isWelcome ? "Enregistrer mon mot de passe" : "Réinitialiser"}
        </button>

        {linkError && <div className="text-sm text-destructive">{linkError}</div>}
      </form>

      {done && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium">Mot de passe mis à jour ✅</p>
          <p className="text-muted-foreground mt-1">
            Tu peux maintenant te connecter avec ton adresse e-mail et ce mot de passe.
          </p>

          {/* Le formulaire de connexion est dans le header du site. */}
          <Link href="/" className="mt-3 inline-block rounded border px-3 py-2 text-sm">
            Aller sur le site pour me connecter
          </Link>
        </div>
      )}
    </>
  );
}
