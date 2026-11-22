import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { TINY_PNG_BASE64, USERS } from "./data.mjs";

/**
 * Deux photos qui, une fois leur nom nettoyé, aboutiraient à la même clé : la seconde n'est pas
 * envoyée, et son message le dit tout de suite. La première arrive.
 */
test("mes photos : un doublon du lot est écarté avec un message", async ({ page }) => {
  await loginAs(page, USERS.instructeur.email);
  await page.goto("/profil");
  await page.getByText("Mes photos", { exact: true }).click();
  const png = Buffer.from(TINY_PNG_BASE64, "base64");
  await page.locator('details input[type="file"]').setInputFiles([
    { name: "Photo 1.png", mimeType: "image/png", buffer: png },
    { name: "photo-1.png", mimeType: "image/png", buffer: png },
  ]);
  await page.getByRole("button", { name: "Envoyer 2 photo(s)" }).click();
  await expect(page.getByText("1 ajoutée(s) · 1 en erreur")).toBeVisible();
  await expect(page.getByText(/porte le même nom qu'une autre photo de cet envoi/)).toBeVisible();
});
