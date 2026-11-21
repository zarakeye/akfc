import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { RANGE_PENDING, USERS } from "./data.mjs";

/**
 * Maj + clic sélectionne la plage AFFICHÉE : un fichier masqué par le filtre de statut
 * (ici `plage-en-attente.png`, en attente, sous le filtre « Validés ») n'y entre pas.
 */
test("une plage ne prend pas les fichiers masqués par le filtre", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/library?path=AKFC/e2e");
  const hidden = RANGE_PENDING.key.split("/").pop()!;
  // Les fichiers seulement (leur nom porte une extension) : le dossier « Dépôt commun » n'a pas de case.
  const cards = page.locator('div.aspect-square[title*="."]');
  await expect(page.locator(`div.aspect-square[title="${hidden}"]`)).toHaveCount(1);

  const filter = page.getByRole("group", { name: "Filtrer par statut" });
  await filter.getByRole("button", { name: "Validés" }).click();
  await expect(page.locator(`div.aspect-square[title="${hidden}"]`)).toHaveCount(0);

  const first = cards.first();
  const last = cards.last();
  await first.hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await expect(first.locator('input[type="checkbox"]')).toBeChecked();
  await last.click({ modifiers: ["Shift"] });
  await expect(last.locator('input[type="checkbox"]')).toBeChecked();

  // Autant de sélectionnés que de fichiers affichés : le fichier masqué n'en fait pas partie.
  const shown = await cards.count();
  await expect(page.getByText(`${shown} sélectionnés`, { exact: true })).toBeVisible();
});
