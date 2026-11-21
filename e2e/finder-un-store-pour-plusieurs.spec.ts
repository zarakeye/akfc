import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Le store du finder est global : il sert la bibliothèque, Mes espaces et le sélecteur, un
 * finder après l'autre. Passer de Mes espaces à la bibliothèque sans recharger la page ne doit
 * pas laisser la bibliothèque sur la racine virtuelle des espaces, ni sur leur contenu en cache.
 */
test("la bibliothèque repart de sa racine après Mes espaces, sans rechargement", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/mes-espaces");
  await expect(page.getByText("Atelier e2e").first()).toBeVisible();

  // Navigation côté client : le module du store, et son état, survivent.
  await page.getByRole("button", { name: new RegExp(USERS.admin.firstName) }).first().click();
  await page.locator('a[href="/dashboard"]').first().click();
  await page.waitForURL(/\/dashboard$/);
  await page.getByText("Bibliothèque", { exact: true }).first().click();
  await page.waitForURL(/\/dashboard\/library/);

  await expect(page.getByText("__mes-espaces__")).toHaveCount(0);
  await expect(page.getByRole("main").getByText("Dépôt commun").first()).toBeVisible();
});
