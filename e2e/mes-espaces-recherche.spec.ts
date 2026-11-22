import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { ATELIER_FILE, USERS } from "./data.mjs";

/**
 * La racine « Mes espaces » n'existe pas dans le stockage : y chercher, c'est chercher dans
 * chacun des espaces du membre (l'adapter le dit par `searchScopes`), pas sous un préfixe
 * inventé que le serveur refuserait.
 */
test("un membre trouve un fichier de ses espaces depuis la racine Mes espaces", async ({ page }) => {
  await loginAs(page, USERS.membreB.email);
  await page.goto("/mes-espaces");
  await expect(page.getByText("Atelier e2e").first()).toBeVisible();

  await page.getByRole("textbox", { name: "Rechercher des fichiers" }).fill("planning");
  await expect(page.getByText(ATELIER_FILE.name).first()).toBeVisible();
  await expect(page.getByText("Accès refusé")).toHaveCount(0);
});
