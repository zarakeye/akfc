'use client';

import { JSX, startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpcClient } from "#core/trpc/trpcClient.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { loginSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { loginFormAction } from "#features/auth/login/loginForm.action.ts";
import {
  initialLoginFormState,
  type LoginField,
  type LoginFormState,
  type LoginFormValues,
} from "#features/auth/login/loginForm.types.ts";

/**
 * Connexion (en-tête du site), sur le modèle hybride :
 *   - React Hook Form et le schéma partagé avec la procédure auth.login préviennent les erreurs,
 *     avec les mêmes messages que le serveur ;
 *   - useActionState relie le formulaire à la server action loginFormAction, qui pose le cookie ;
 *   - une fois connecté, le formulaire relit la session (getSession) et la range dans le store.
 */
export default function LoginForm(): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [showPassword, setShowPassword] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const loginSuccess = useSessionStore((state) => state.loginSuccess);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    loginFormAction,
    initialLoginFormState,
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;

  useEffect(() => {
    if (state.status === "success") {
      // Le cookie est posé ; la connexion ne renvoie pas la session : on la demande à getSession.
      void trpcClient.auth.getSession
        .query()
        .then((session) => {
          if (!session) {
            setSessionError("Connexion réussie, mais la session n’a pas pu être chargée. Rechargez la page.");
            return;
          }
          loginSuccess(session);
          router.push("/");
        })
        .catch(() => setSessionError("Connexion réussie, mais la session n’a pas pu être chargée. Rechargez la page."));
      return;
    }
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(name as LoginField, { type: "server", message });
    }
  }, [state, loginSuccess, router, setError]);

  // Une seule ligne de message, sous les deux champs côte à côte : la première erreur.
  const message =
    formState.errors.email?.message ??
    formState.errors.password?.message ??
    (state.status === "error" && !state.fieldErrors ? state.error : null) ??
    sessionError;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Lu tout de suite, tant que l'évènement est disponible.
        const formData = new FormData(e.currentTarget);
        // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
        void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Adresse e-mail"
          autoComplete="email"
          aria-invalid={!!formState.errors.email}
          className="border rounded bg-white px-2 py-1"
          {...register("email")}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            autoComplete="current-password"
            aria-invalid={!!formState.errors.password}
            className="border rounded bg-white px-2 py-1 pr-9"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 transition-colors hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || state.status === "success"}
        className="px-4 py-2 rounded bg-blue-500 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Connexion…" : "Se connecter"}
      </button>

      {message && <p className="text-red-500">{message}</p>}

      <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
