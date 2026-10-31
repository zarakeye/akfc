import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { SEMINAR, USERS } from "./data.mjs";

/**
 * Les séances d'un stage se gèrent depuis son édition. Le formulaire des séances avait disparu de
 * l'interface lors du déplacement des pages d'administration : un stage ne pouvait plus recevoir
 * de date, ni donc apparaître dans l'agenda. Ce test le garde en place.
 */
test("un administrateur ajoute une séance à un stage depuis son édition", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/seminars");
  await page.getByText(SEMINAR.label, { exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/seminars\/\d+$/);
  await page.locator('[data-tour="fiche.edit"]').click();
  await expect(page).toHaveURL(/\/dashboard\/seminars\/\d+\/edit$/);

  const sessions = page.locator('[data-tour="seminars.sessions"]');
  await expect(sessions.getByText("Pas encore de séance")).toBeVisible();
  await sessions.getByRole("button", { name: "Ajouter une séance" }).click();
  await sessions.locator('input[type="date"]').fill("2027-03-14");
  await sessions.getByRole("button", { name: "Enregistrer la séance" }).click();

  // Le jour affiché est celui saisi (stocké à midi UTC, lu à Paris) ; la séance survit au rechargement.
  await expect(sessions.getByText("dimanche 14 mars 2027")).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-tour="seminars.sessions"]').getByText("dimanche 14 mars 2027")).toBeVisible();
});
