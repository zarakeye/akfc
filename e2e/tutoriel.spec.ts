import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Le moteur des tutoriels, parcouru comme un administrateur : lancé depuis le bouton « ? », il
 * traverse deux pages, attend un clic, une saisie, des « Suivant », puis la page créée.
 */
test("le tuto « Créer un post » se suit jusqu'au bout", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/posts");

  await page.getByRole("button", { name: "Tutoriels de cette page" }).click();
  await page.getByRole("button", { name: /Créer un post.*Rédiger/ }).click();
  const bubble = (n: number) => page.getByRole("dialog", { name: `Créer un post — étape ${n} sur 6` });

  // 1. Un clic sur la cible : seul l'élément en lumière répond.
  await expect(bubble(1)).toBeVisible();
  await page.locator('[data-tour="posts.list.create"]').click();

  // 2. Une saisie, sur une autre page : le curseur est déjà dans le champ.
  await expect(bubble(2)).toBeVisible();
  const title = page.locator('[data-tour="posts.form.title"]');
  await expect(title).toBeFocused();
  const next = page.getByRole("button", { name: "Suivant" });
  await expect(next).toBeDisabled();
  await title.fill("Exemple (tuto)");
  await next.click();

  // 3 et 4. Des explications : « Suivant ».
  await expect(bubble(3)).toBeVisible();
  await next.click();
  await expect(bubble(4)).toBeVisible();
  await next.click();

  // 5. L'enregistrement : l'étape passe quand la page de l'article s'ouvre.
  await expect(bubble(5)).toBeVisible();
  await page.locator('[data-tour="posts.form.submit"]').click();
  await expect(bubble(6)).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/dashboard\/posts\/\d+$/);

  // 6. La fin : « Terminer » range le tuto.
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByRole("dialog", { name: /Créer un post/ })).toHaveCount(0);
});

test("Échap interrompt le tuto", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/posts");
  await page.getByRole("button", { name: "Tutoriels de cette page" }).click();
  await page.getByRole("button", { name: /Créer un post.*Rédiger/ }).click();
  await expect(page.getByRole("dialog", { name: /étape 1 sur 6/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Créer un post/ })).toHaveCount(0);
});
