import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation } from "./helpers";
import { USERS } from "./data.mjs";

// Une limite d'essais vaut pour le service, quelle que soit l'entrée : la procédure tRPC et la
// server action du formulaire partagent les mêmes compteurs. Sinon, alterner les deux doublerait
// les essais permis.

test("cinq faux mots de passe par tRPC : le formulaire de la page profil refuse le sixième", async ({ page }) => {
  await loginAs(page, USERS.limiteMdp.email);
  for (let i = 0; i < 5; i++) {
    const { error } = await trpcMutation(page.request, "auth.changePassword", {
      currentPassword: `faux-mot-de-passe-${i}`,
      newPassword: "nouveau-mot-de-passe-e2e",
    });
    expect(error?.message).toBe("Mot de passe actuel incorrect.");
  }

  await page.goto("/profil/edit");
  await page.getByLabel("Mot de passe actuel").fill("encore-un-faux-mot-de-passe");
  await page.getByLabel(/^Nouveau mot de passe/).fill("nouveau-mot-de-passe-e2e");
  await page.getByLabel("Confirmer le nouveau mot de passe").fill("nouveau-mot-de-passe-e2e");
  await page.getByRole("button", { name: "Changer le mot de passe" }).click();
  await expect(page.getByText("Trop d'essais de mot de passe. Réessayez dans un quart d'heure.")).toBeVisible();
});
