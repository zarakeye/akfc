import { expect, type APIRequestContext, type Page } from "@playwright/test";

import { MAILPIT_API } from "./env.mjs";
import { PASSWORD } from "./data.mjs";

/**
 * Appelle une procédure tRPC comme le fait le navigateur : `POST /api/trpc/<procédure>`, l'entrée
 * sérialisée par superjson (`{ json: … }`). Les cookies du contexte (la session) partent avec.
 */
export async function trpcMutation(request: APIRequestContext, path: string, input: unknown) {
  const res = await request.post(`/api/trpc/${path}`, { data: { json: input } });
  const body = (await res.json()) as {
    result?: { data: { json: unknown } };
    error?: { json: { message: string; data: { code: string; httpStatus: number } } };
  };
  return { status: res.status(), result: body.result?.data.json, error: body.error?.json };
}

/** Lit une procédure tRPC (query) : `GET /api/trpc/<procédure>?input=…`, comme le navigateur. */
export async function trpcQuery(request: APIRequestContext, path: string, input: unknown) {
  const res = await request.get(`/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`);
  const body = (await res.json()) as {
    result?: { data: { json: unknown } };
    error?: { json: { message: string; data: { code: string; httpStatus: number } } };
  };
  return { status: res.status(), result: body.result?.data.json, error: body.error?.json };
}

/**
 * Ouvre une session par l'API, sans passer par le formulaire : le cookie de session est posé dans
 * le contexte de la page, qui est alors connectée. Le formulaire, lui, a son propre test.
 */
export async function loginAs(page: Page, email: string, password = PASSWORD): Promise<void> {
  const { result } = await trpcMutation(page.request, "auth.login", { email, password });
  expect(result, `connexion de ${email}`).toEqual({ success: true });
}

/** Le formulaire de connexion visible du header (le header en rend deux : barre et panneau mobile). */
export function loginForm(page: Page) {
  return {
    email: page.getByPlaceholder("Adresse e-mail").filter({ visible: true }),
    password: page.getByPlaceholder("Mot de passe").filter({ visible: true }),
    submit: page.getByRole("button", { name: "Se connecter" }).filter({ visible: true }),
  };
}

type MailpitSummary = { ID: string; Created: string };

/**
 * Attend le premier e-mail reçu par `to` après `since`, dans Mailpit, et rend son texte. Le site
 * envoie ses e-mails sans faire attendre sa réponse : on interroge la boîte jusqu'à ce qu'il arrive.
 */
export async function waitForEmail(request: APIRequestContext, to: string, since: Date): Promise<string> {
  let text: string | null = null;
  await expect
    .poll(
      async () => {
        const res = await request.get(`${MAILPIT_API}/search?query=${encodeURIComponent(`to:${to}`)}`);
        const { messages } = (await res.json()) as { messages: MailpitSummary[] };
        const fresh = messages.find((m) => new Date(m.Created) >= since);
        if (!fresh) return null;
        const message = await (await request.get(`${MAILPIT_API}/message/${fresh.ID}`)).json();
        text = (message as { Text: string }).Text;
        return text;
      },
      { message: `e-mail pour ${to}`, timeout: 20_000 },
    )
    .not.toBeNull();
  return text as unknown as string;
}
