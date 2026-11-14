import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// La 404 garde l'habillage du contexte : celui du site public pour une adresse inconnue ou une page
// publique introuvable, celui du panneau de contrôle pour une fiche d'administration introuvable.

test("une adresse inconnue répond 404, avec le header et le footer du site", async ({ page }) => {
  const res = await page.goto("/cette-adresse-n-existe-pas");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable", level: 1 })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.getByRole("link", { name: "Retour à l’accueil" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("une discipline inconnue répond 404 dans le site public", async ({ page }) => {
  const res = await page.goto("/disciplines/discipline-qui-n-existe-pas");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable", level: 1 })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
});

test("un membre introuvable reste dans le panneau de contrôle", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  const res = await page.goto("/dashboard/users/membre-qui-n-existe-pas");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retour au tableau de bord" })).toBeVisible();
});
