import { expect, test } from "@playwright/test";

import { loginAs, trpcQuery } from "./helpers";
import { PASSWORD, USERS } from "./data.mjs";

// Le changement de mot de passe (page profil) passe par sa server action : erreurs sous les
// champs, refus du serveur sous le champ concerné, et, une fois changé, les AUTRES appareils
// déconnectés, celui qu'on utilise restant connecté.

const NEW_PASSWORD = "nouveau-mot-de-passe-e2e";

test("changer son mot de passe : erreurs sous les champs, puis les autres appareils déconnectés", async ({ page, browser }) => {
  // Un autre appareil, connecté avant le changement.
  const other = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const otherPage = await other.newPage();
  await loginAs(otherPage, USERS.motDePasse.email);

  await loginAs(page, USERS.motDePasse.email);
  await page.goto("/profil/edit");
  const changer = page.getByRole("button", { name: "Changer le mot de passe" });
  const actuel = page.getByLabel("Mot de passe actuel");
  const nouveau = page.getByLabel(/^Nouveau mot de passe/);
  const confirmation = page.getByLabel("Confirmer le nouveau mot de passe");

  // Rien de saisi : les erreurs du schéma partagé, avant tout envoi.
  await changer.click();
  await expect(page.getByText("Mot de passe actuel requis")).toBeVisible();

  // Confirmation différente : vérifiée dans le navigateur.
  await actuel.fill(PASSWORD);
  await nouveau.fill(NEW_PASSWORD);
  await confirmation.fill(`${NEW_PASSWORD}x`);
  await changer.click();
  await expect(page.getByText("Les mots de passe ne correspondent pas")).toBeVisible();

  // Mot de passe actuel faux : seul le serveur peut le savoir ; son refus revient sous le champ.
  await confirmation.fill(NEW_PASSWORD);
  await actuel.fill("pas-le-bon-mot-de-passe");
  await changer.click();
  await expect(page.getByText("Mot de passe actuel incorrect.")).toBeVisible();

  // Le bon : changé, champs vidés.
  await actuel.fill(PASSWORD);
  await changer.click();
  await expect(page.getByText("Mot de passe modifié. Les autres appareils ont été déconnectés.")).toBeVisible();
  await expect(actuel).toHaveValue("");

  // Cet appareil reste connecté ; l'autre ne l'est plus.
  const here = await trpcQuery(page.request, "auth.getSession", undefined);
  expect(here.result).not.toBeNull();
  const there = await trpcQuery(otherPage.request, "auth.getSession", undefined);
  expect(there.result).toBeNull();
  await other.close();
});
