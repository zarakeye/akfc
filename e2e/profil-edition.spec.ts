import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// Le formulaire du profil s'active dès qu'un champ change. Avec le React Compiler, il restait
// grisé : react-hook-form et la mémorisation du rendu ne s'entendaient pas.

test("modifier un champ du profil active « Enregistrer », et l'enregistrement aboutit", async ({ page }) => {
  await loginAs(page, USERS.profil.email);
  await page.goto("/profil/edit");
  const enregistrer = page.getByRole("button", { name: "Enregistrer" });
  await expect(page.getByLabel("Prénom")).toHaveValue(USERS.profil.firstName);
  await expect(enregistrer).toBeDisabled();

  await page.getByLabel("Nom", { exact: true }).fill("Profil");
  await page.getByLabel("Pseudo").fill("Mael-e2e");
  await expect(enregistrer).toBeEnabled();
  await enregistrer.click();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByText("Mael-e2e")).toBeVisible();
});
