import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// La création d'un groupe passe par sa server action : nom vide refusé sous le champ, puis le
// groupe créé apparaît dans la liste.

test("créer un groupe : le nom est obligatoire, puis le groupe apparaît dans la liste", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/groups/create");
  const creer = page.locator('[data-tour="groups.form.submit"] button');

  await creer.click();
  await expect(page.getByText("Le nom est obligatoire.")).toBeVisible();

  await page.getByLabel("Nom").fill("Commission e2e");
  await page.getByLabel(/Espace collaboratif/).check();
  await creer.click();
  await expect(page).toHaveURL(/\/dashboard\/groups$/);
  await expect(page.getByText("Commission e2e")).toBeVisible();
});
