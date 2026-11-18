import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// Le flash info passe par sa server action : erreurs sous les champs, dates cohérentes, et des
// dates qui reviennent à l'identique à l'édition (converties en ISO dans le navigateur, elles ne
// dépendent pas de l'heure du serveur).

test("flash info : champs obligatoires, dates cohérentes, puis édition à l'heure saisie", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/breaking-news/create");
  const creer = page.getByRole("button", { name: "Créer", exact: true });

  await creer.click();
  await expect(page.getByText("Le titre est obligatoire.")).toBeVisible();
  await expect(page.getByText("Le texte est obligatoire.")).toBeVisible();

  await page.getByLabel("Titre").fill("Stage annulé (e2e)");
  await page.getByLabel("Corps").fill("Le stage de samedi est annulé.");
  await page.getByLabel("Date de publication").fill("2099-03-10T18:30");
  await page.getByLabel("Date d'expiration").fill("2099-03-10T08:00");
  await creer.click();
  await expect(page.getByText("L'expiration doit être postérieure à la publication.")).toBeVisible();

  await page.getByLabel("Date d'expiration").fill("2099-03-12T08:00");
  await creer.click();
  await expect(page).toHaveURL(/\/dashboard\/breaking-news$/);
  const ligne = page.getByRole("row", { name: /Stage annulé \(e2e\).*Programmée/ });
  await expect(ligne).toBeVisible();

  // Édition : les dates reviennent telles qu'elles ont été saisies.
  await ligne.click();
  await expect(page.getByLabel("Date de publication")).toHaveValue("2099-03-10T18:30");
  await page.getByLabel("Titre").fill("Stage reporté (e2e)");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/breaking-news$/);
  await expect(page.getByRole("row", { name: /Stage reporté \(e2e\)/ })).toBeVisible();
});
