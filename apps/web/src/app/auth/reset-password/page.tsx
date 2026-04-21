"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/core/trpc/trpcClient";

/**
 * /auth/reset-password?token=...
 *
 * - Le token vient du lien email
 * - L’utilisateur saisit un nouveau password (min 12)
 * - Appelle trpc.auth.resetPassword
 * - En cas de succès: message + redirection possible vers /auth/login
 */

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resetPassword = trpc.auth.resetPassword.useMutation();

  const token = useMemo(() => {
    const t = searchParams?.get("token");
    return t ? t.trim() : "";
  }, [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [done, setDone] = useState(false);

  const passwordOk = useMemo(() => password.length >= 12, [password]);
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
        <h1 className="text-2xl font-semibold">Réinitialiser le mot de passe</h1>
        <p className="text-sm text-slate-600">
          Choisis un nouveau mot de passe. Il doit faire au moins 12 caractères.
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
        <label className="grid gap-1">
          <span className="text-sm">Nouveau mot de passe</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 12 caractères"
            disabled={!token || resetPassword.isPending || done}
          />
          {!passwordOk && password.length > 0 && (
            <span className="text-xs text-red-600">Minimum 12 caractères.</span>
          )}
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Confirmer</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={!token || resetPassword.isPending || done}
          />
          {passwordConfirm.length > 0 && !confirmOk && (
            <span className="text-xs text-red-600">La confirmation ne correspond pas.</span>
          )}
        </label>

        <button
          type="submit"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!canSubmit || done}
        >
          {resetPassword.isPending ? "Validation..." : "Réinitialiser"}
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
            Tu peux maintenant te reconnecter.
          </p>

          <button
            type="button"
            className="mt-3 rounded border px-3 py-2 text-sm"
            onClick={() => router.push("/auth/login")}
          >
            Aller à la connexion
          </button>
        </div>
      )}
    </main>
  );
}