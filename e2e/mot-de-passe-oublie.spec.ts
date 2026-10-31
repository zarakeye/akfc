import { expect, test } from "@playwright/test";

import { trpcMutation, waitForEmail } from "./helpers";
import { PASSWORD, USERS } from "./data.mjs";

const NEW_PASSWORD = "nouveau-mot-de-passe-e2e";

test("mot de passe oublié : le lien reçu par e-mail permet d'en choisir un nouveau", async ({ page }) => {
  const since = new Date(Date.now() - 1_000);
  await page.goto("/auth/forgot-password");
  await page.getByPlaceholder("toi@exemple.com").fill(USERS.oubli.email);
  await page.getByRole("button", { name: "Envoyer le lien" }).click();

  const mail = await waitForEmail(page.request, USERS.oubli.email, since);
  const link = mail.match(/https?:\/\/\S+\/auth\/reset-password\?token=[^\s>"]+/)?.[0];
  expect(link, "lien de réinitialisation dans l'e-mail").toBeTruthy();

  await page.goto(link as string);
  await page.getByLabel("Nouveau mot de passe").fill(NEW_PASSWORD);
  await page.getByLabel("Confirmer").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.getByText("Mot de passe mis à jour")).toBeVisible();

  // L'ancien mot de passe ne vaut plus rien, le nouveau ouvre une session.
  const old = await trpcMutation(page.request, "auth.login", { email: USERS.oubli.email, password: PASSWORD });
  expect(old.result).toEqual({ success: false, error: "INVALID_CREDENTIALS" });
  const fresh = await trpcMutation(page.request, "auth.login", { email: USERS.oubli.email, password: NEW_PASSWORD });
  expect(fresh.result).toEqual({ success: true });

  // Le lien est à usage unique.
  await page.goto(link as string);
  await page.getByLabel("Nouveau mot de passe").fill("encore-un-autre-mot-de-passe");
  await page.getByLabel("Confirmer").fill("encore-un-autre-mot-de-passe");
  await page.getByRole("button", { name: "Réinitialiser" }).click();
  await expect(page.getByText("Mot de passe mis à jour")).toHaveCount(0);
});
