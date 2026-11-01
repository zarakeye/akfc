import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Une catégorie se reconnaît à sa clé (course, seminar, event), jamais à son libellé. Les données
 * de test nomment la catégorie des stages « Stages d'été » : avec l'ancienne comparaison au
 * libellé (« Stage » exactement), le choix du stage n'apparaissait jamais dans une galerie.
 */
test.beforeEach(async ({ page }) => {
  await loginAs(page, USERS.admin.email);
});

test("une galerie de la catégorie des stages propose de choisir le stage, quel que soit son libellé", async ({ page }) => {
  await page.goto("/dashboard/galleries/create");
  const facets = page.locator('[data-tour="galleries.form.facets"]');
  const category = facets.locator("select#categoryId");
  await expect(facets.locator("select#seminarId")).toHaveCount(0);
  await category.selectOption({ label: "Stages d'été" });
  await expect(facets.locator("select#seminarId")).toBeVisible();
  await category.selectOption({ label: "Cours" });
  await expect(facets.locator("select#seminarId")).toHaveCount(0);
});

test("la liste des catégories nomme celle qui manque, et sa clé, pas seulement son libellé", async ({ page }) => {
  await page.goto("/dashboard/categories");
  await expect(page.getByText("Manquante : Évènement.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer une catégorie" })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "Stages d'été" });
  await expect(row.getByText("Stage", { exact: true })).toBeVisible();
});
