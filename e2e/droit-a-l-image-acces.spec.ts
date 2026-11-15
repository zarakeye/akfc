import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// Le formulaire de droit à l'image doit se trouver sans le savoir : par le menu du compte, par le
// profil, et avec une explication quand il ne peut pas encore s'afficher.

test("le menu du compte et le profil mènent à « Mon droit à l'image »", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: new RegExp(USERS.membreA.firstName) }).click();
  await page.getByRole("link", { name: "Mon droit à l'image" }).click();
  await expect(page).toHaveURL(/\/profil\/droit-a-l-image$/);
  await expect(page.getByRole("heading", { name: "Mon droit à l'image", level: 1 })).toBeVisible();

  await page.goto("/profil");
  const bloc = page.getByRole("region", { name: "Mon droit à l'image" });
  await expect(bloc).toBeVisible();
  await bloc.getByRole("link").click();
  await expect(page).toHaveURL(/\/profil\/droit-a-l-image$/);
});

test("majorité non renseignée : la page dit pourquoi, et quoi faire", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/profil/droit-a-l-image");
  await expect(page.getByText("Pourquoi pas de formulaire en ligne ?")).toBeVisible();
  await expect(page.getByText("contact@akfc.fr pour qu'un administrateur le renseigne", { exact: false })).toBeVisible();
});

test("majeur : le formulaire en ligne s'ouvre depuis la page", async ({ page }) => {
  await loginAs(page, USERS.tagAccord.email);
  await page.goto("/profil/droit-a-l-image");
  await page.getByRole("button", { name: /Donner mon autorisation|Modifier mes choix/ }).click();
  await expect(page.getByRole("button", { name: "Je confirme mes choix" })).toBeVisible();
});

test("le formulaire vierge se lit, sans Télécharger ni Imprimer", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/profil/droit-a-l-image");
  await page.getByRole("button", { name: "Lire le formulaire" }).click();
  const apercu = page.getByRole("dialog", { name: "Autorisation de droit à l'image (consultation)" });
  await expect(apercu).toBeVisible();
  await expect(apercu.getByRole("link", { name: "Télécharger" })).toHaveCount(0);
  await expect(apercu.getByRole("button", { name: "Imprimer" })).toHaveCount(0);
});
