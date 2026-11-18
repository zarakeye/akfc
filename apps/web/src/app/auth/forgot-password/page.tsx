import { JSX } from "react";

import { ForgotPasswordForm } from "#features/auth/forgot-password/ForgotPasswordForm.tsx";

/**
 * /auth/forgot-password
 *
 * L'utilisateur saisit son adresse ; la server action crée et envoie le lien s'il existe un compte.
 * Le message de réussite est toujours le même (anti-énumération).
 */
export default function ForgotPasswordPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
        <p className="text-sm text-slate-600">
          Saisis ton email. Si un compte existe, tu recevras un lien de réinitialisation.
        </p>
      </header>

      <ForgotPasswordForm />
    </main>
  );
}
