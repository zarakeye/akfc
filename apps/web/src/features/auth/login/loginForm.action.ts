'use server';

import { TRPCError } from "@trpc/server";

import { loginSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { loginService } from "@akfc/backend/modules/auth/services/auth.service.ts";
import { AUTH_ERRORS } from "#features/auth/errors/auth.errors.ts";
import type { LoginField, LoginFormState } from "#features/auth/login/loginForm.types.ts";

/**
 * Connexion : la server action du formulaire de l'en-tête.
 *
 * Elle valide avec le schéma partagé, puis appelle le même service que la procédure auth.login,
 * loginService, qui vérifie le mot de passe et pose le cookie de session. Un identifiant faux ou
 * trop d'essais sont des résultats attendus : ils reviennent comme des messages, pas comme des pannes.
 */
export async function loginFormAction(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<LoginField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "email" || field === "password") && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", error: parsed.error.issues[0]?.message ?? AUTH_ERRORS.DEFAULT, fieldErrors };
  }

  try {
    await loginService(parsed.data.email, parsed.data.password);
    return { status: "success" };
  } catch (err) {
    if (err instanceof TRPCError && (err.message === "INVALID_CREDENTIALS" || err.message === "TOO_MANY_ATTEMPTS")) {
      return { status: "error", error: AUTH_ERRORS[err.message] };
    }
    console.error("[auth] connexion impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: AUTH_ERRORS.DEFAULT };
  }
}
