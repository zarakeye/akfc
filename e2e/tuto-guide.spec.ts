import { expect, test } from "@playwright/test";
import { USERS } from "./data.mjs";
import { loginAs } from "./helpers";

/**
 * Tuto guidé (le mode de la démo) : le curseur s'arrête sur la cible, la bulle dit quoi faire ;
 * « Remplir pour moi » écrit la valeur attendue dans le champ, Entrée valide l'étape, et
 * « ← Précédent » revient en arrière, jusqu'à la page d'avant.
 */
test("tuto guidé : la bulle dit quoi faire, « Remplir pour moi » écrit, Entrée valide", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/groups");
  await page.evaluate(() =>
    sessionStorage.setItem("akfc.tour", JSON.stringify({ tourId: "admin.groups.create", index: 0, cursor: true })),
  );
  await page.reload();
  await expect(page.getByText("Cliquez là où s'est arrêté le curseur")).toBeVisible({ timeout: 5000 });
  await page.locator('[data-tour="groups.list.create"]').first().click();

  const field = page.locator('[data-tour="groups.form.name"] input');
  await expect(field).toBeFocused({ timeout: 8000 });
  await page.getByRole("button", { name: "Remplir pour moi" }).click();
  await expect(field).toHaveValue("Bureau", { timeout: 3000 });
  await field.press("Enter");
  await expect(page.getByText("Le groupe parent")).toBeVisible({ timeout: 5000 });

  // « ← Précédent » : l'étape du nom revient ; encore une fois, et l'on retourne à la liste.
  await page.getByRole("button", { name: "Revenir à l'étape précédente" }).click();
  await expect(page.getByText("Tapez :")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "Revenir à l'étape précédente" }).click();
  await expect(page).toHaveURL(/\/dashboard\/groups$/);
  await expect(page.getByText("Cliquez là où s'est arrêté le curseur")).toBeVisible({ timeout: 8000 });
});
