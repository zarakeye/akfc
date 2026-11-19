"use client";

import { JSX, startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { requestPasswordResetSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { requestPasswordResetFormAction } from "#features/auth/forgot-password/requestPasswordResetForm.action.ts";
import {
  initialRequestPasswordResetFormState,
  type RequestPasswordResetFormState,
  type RequestPasswordResetFormValues,
} from "#features/auth/forgot-password/requestPasswordResetForm.types.ts";

/**
 * Formulaire « Mot de passe oublié », sur le modèle hybride :
 *   - React Hook Form et le schéma partagé préviennent l'erreur sous le champ (confort) ;
 *   - useActionState relie le formulaire à la server action et suit l'envoi ;
 *   - la server action revalide avec le même schéma et appelle le service (vérité).
 * Sans JavaScript, le <form> s'envoie quand même à l'action : le serveur valide seul.
 */
export function ForgotPasswordForm(): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<RequestPasswordResetFormState, FormData>(
    requestPasswordResetFormAction,
    initialRequestPasswordResetFormState,
  );

  const form = useForm<RequestPasswordResetFormValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe ; pas en quittant le champ (onBlur) :
    // le message disparaîtrait au moment du clic, le bouton bougerait et le clic tomberait à côté.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;

  // Une erreur de champ renvoyée par le serveur se range sous le champ, comme une erreur locale.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors?.email) {
      setError("email", { type: "server", message: state.fieldErrors.email });
    }
  }, [state, setError]);

  const emailError = formState.errors.email?.message;
  const otherError = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <>
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
        <label className="grid gap-1" data-tour="auth.forgot.email">
          <span className="text-sm">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="border rounded px-3 py-2"
            placeholder="toi@exemple.com"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "forgot-email-error" : undefined}
            {...register("email")}
          />
          {emailError && (
            <span id="forgot-email-error" className="text-sm text-red-600">
              {emailError}
            </span>
          )}
        </label>

        <button
          type="submit"
          data-tour="auth.forgot.submit"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Envoi..." : "Envoyer le lien"}
        </button>

        {/* Jamais d'erreur « adresse inconnue » (anti-énumération) : seulement une panne technique. */}
        {otherError && <div className="text-sm text-red-600">{otherError}</div>}
      </form>

      {state.status === "success" && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium">Si un compte existe pour cet email, un lien a été envoyé.</p>
          <p className="text-slate-600 mt-1">
            Pense à vérifier tes spams. Le lien expire au bout d’un certain temps.
          </p>
        </div>
      )}
    </>
  );
}
