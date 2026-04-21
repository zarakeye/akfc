"use client";

import { JSX, useMemo, useState } from "react";
import { trpc } from "@/core/trpc/trpcClient";

/**
 * /auth/forgot-password
 *
 * - L’utilisateur saisit son email
 * - On appelle trpc.auth.requestPasswordReset
 * - On affiche toujours un message de succès (anti-enumeration)
 */

export default function ForgotPasswordPage(): JSX.Element {
  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailNormalized = useMemo(() => email.trim().toLowerCase(), [email]);

  const isEmailValid = useMemo(() => {
    // Validation simple côté UI (le backend fait foi)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized);
  }, [emailNormalized]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(false);

    // Même si l’email est invalide, on peut laisser le backend gérer,
    // mais c'est mieux d'éviter un round-trip inutile.
    if (!isEmailValid) return;

    await requestReset.mutateAsync({ email: emailNormalized });

    // Anti-enumeration: on affiche toujours "OK"
    setSubmitted(true);
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
        <p className="text-sm text-slate-600">
          Saisis ton email. Si un compte existe, tu recevras un lien de réinitialisation.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="grid gap-1">
          <span className="text-sm">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!isEmailValid || requestReset.isPending}
        >
          {requestReset.isPending ? "Envoi..." : "Envoyer le lien"}
        </button>

        {/* On n’affiche PAS d’erreur “email inconnu” (anti-enumeration).
           On peut toutefois afficher une erreur technique (ex: réseau) si tu veux.
           Ici je la garde minimaliste. */}
        {requestReset.error && (
          <div className="text-sm text-red-600">
            Une erreur est survenue. Réessaie plus tard.
          </div>
        )}
      </form>

      {submitted && (
        <div className="rounded border p-4 text-sm">
          <p className="font-medium">Si un compte existe pour cet email, un lien a été envoyé.</p>
          <p className="text-slate-600 mt-1">
            Pense à vérifier tes spams. Le lien expire au bout d’un certain temps.
          </p>
        </div>
      )}
    </main>
  );
}