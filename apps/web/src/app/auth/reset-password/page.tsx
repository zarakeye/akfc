import { JSX } from "react";

import { PASSWORD_MIN_LENGTH } from "@akfc/contracts/auth/auth.schema.ts";
import { ResetPasswordForm } from "#features/auth/reset-password/ResetPasswordForm.tsx";

/**
 * /auth/reset-password?token=...[&bienvenue=1]
 *
 * Le jeton vient du lien de l'e-mail : « Mot de passe oublié », ou e-mail de bienvenue
 * (`bienvenue=1`), où le nouveau membre choisit son PREMIER mot de passe. La page, rendue sur le
 * serveur, lit ces paramètres et les passe au formulaire ; la server action fait le reste.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[]; bienvenue?: string | string[] }>;
}): Promise<JSX.Element> {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";
  const isWelcome = params.bienvenue === "1";

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

      <ResetPasswordForm token={token} isWelcome={isWelcome} />
    </main>
  );
}
