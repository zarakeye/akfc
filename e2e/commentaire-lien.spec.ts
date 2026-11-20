import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { COMMENT_POST, USERS } from "./data.mjs";

/**
 * Un lien dans un commentaire se saisit dans un champ de la page, sous la barre d'outils,
 * et non plus dans la boîte « prompt » du navigateur.
 */
test("ajouter un lien à un commentaire par le champ de l'éditeur", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/");
  const card = page.locator("article", { hasText: COMMENT_POST.title }).first();
  await card.getByRole("button", { name: /commentaire/ }).click();

  const editor = card.getByRole("textbox").first();
  await editor.click();
  await editor.pressSequentially("Le programme du stage");
  await page.keyboard.press("ControlOrMeta+a");

  await card.getByRole("button", { name: "Insérer un lien" }).click();
  const url = card.getByRole("textbox", { name: "Adresse du lien" });
  await expect(url).toBeFocused();
  await url.fill("https://akfc.fr/agenda");
  await url.press("Enter");
  await expect(url).toHaveCount(0);

  await card.getByRole("button", { name: "Commenter" }).click();
  await expect(card.getByRole("link", { name: "Le programme du stage" })).toHaveAttribute("href", "https://akfc.fr/agenda");
});
