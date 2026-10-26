"use client";

import { JSX, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@trpc/trpcClient";
import { PasswordField } from "@features/auth/PasswordField";
import { PASSWORD_MIN_LENGTH, passwordSchema } from "@contracts/auth/auth.schema";

/**
 * /auth/reset-password?token=...[&bienvenue=1]
 *
 * - Le token vient du lien de l'e-mail : « Mot de passe oublié », ou e-mail de bienvenue
 *   (`bienvenue=1`), où le nouveau membre choisit son PREMIER mot de passe
 * - L’utilisateur saisit un mot de passe (règle partagée : passwordSchema, packages/contracts)
 * - Appelle trpc.auth.resetPassword
 * - En cas de succès : message + bouton vers l'accueil, où se trouve le formulaire de connexion
 *
 * Le formulaire utilise `useSearchParams()`, qui force un client-side
 * bailout lors du prerender SSG. Next 15+ exige un `<Suspense>` autour
 * de ce composant pour que la page reste prérenderable (le boundary
 * sert de point où Next bascule en CSR pour cette partie).
 */

function ResetPasswordForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resetPassword = trpc.auth.resetPassword.useMutation();

  const token = useMemo(() => {
    const t = searchParams?.get("token");
    return t ? t.trim() : "";
  }, [searchParams]);

  const isWelcome = searchParams?.get("bienvenue") === "1";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [done, setDone] = useState(false);

  const passwordOk = passwordSchema.safeParse(password).success;
  const confirmOk = useMemo(() => password === passwordConfirm, [password, passwordConfirm]);

  const canSubmit = token.length > 0 && passwordOk && confirmOk && !resetPassword.isPending;

  useEffect(() => {
    // Si pas de token, on reste sur la page et on affiche un message
    // (pas de redirect automatique pour éviter un UX "WTF")
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);

    if (!canSubmit) return;

    await resetPassword.mutateAsync({
      token,
      newPassword: password,
    });

    setDone(true);

    // Option: rediriger vers login après 2s
    // Je le fais simplement, sans timer pour rester prévisible.
    // Tu peux le remplacer par un bouton.
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {isWelcome ? "Bienvenue ! Choisis ton mot de passe" : "Réinitialiser le mot de passe"}
        </h1>
        <p className="text-sm text-slate-600">
          {isWelcome
            ? `Il te servira à te connecter au site, avec ton adresse e-mail. Il doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`
            : `Choisis un nouveau mot de passe. Il doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`}
        </p>
      </header>

      {!token && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium text-red-700">Lien invalide</p>
          <p className="text-slate-600 mt-1">
            Il manque le token dans l’URL. Reviens sur “Mot de passe oublié” et redemande un lien.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField
          label="Nouveau mot de passe"
          autoComplete="new-password"
          placeholder={`Min. ${PASSWORD_MIN_LENGTH} caractères`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token || resetPassword.isPending || done}
          error={
            !passwordOk && password.length > 0 ? `Minimum ${PASSWORD_MIN_LENGTH} caractères.` : undefined
          }
        />

        <PasswordField
          label="Confirmer"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={!token || resetPassword.isPending || done}
          error={
            passwordConfirm.length > 0 && !confirmOk
              ? "La confirmation ne correspond pas."
              : undefined
          }
        />

        <button
          type="submit"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!canSubmit || done}
        >
          {resetPassword.isPending ? "Validation..." : isWelcome ? "Enregistrer mon mot de passe" : "Réinitialiser"}
        </button>

        {resetPassword.error && (
          <div className="text-sm text-red-600">
            {resetPassword.error.message || "Token invalide ou expiré."}
          </div>
        )}
      </form>

      {done && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium">Mot de passe mis à jour ✅</p>
          <p className="text-slate-600 mt-1">
            Tu peux maintenant te connecter avec ton adresse e-mail et ce mot de passe.
          </p>

          {/* Le formulaire de connexion est dans le header du site. */}
          <button
            type="button"
            className="mt-3 rounded border px-3 py-2 text-sm"
            onClick={() => router.push("/")}
          >
            Aller sur le site pour me connecter
          </button>
        </div>
      )}
    </main>
  );
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-6">
          <p className="text-sm text-slate-500">Chargement…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
