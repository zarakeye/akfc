import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { TAG_MEDIA, USERS } from "./data.mjs";

/**
 * Tous les gestes « supprimer » du finder passent par la même fenêtre de confirmation :
 * le menu d'un fichier comme le bouton de la barre d'outils.
 */
test("le menu d'un fichier demande confirmation avant la corbeille", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/library?path=AKFC/e2e");
  const name = TAG_MEDIA.key.split("/").pop()!;
  await page.getByTitle(name, { exact: true }).first().click({ button: "right" });
  await page.getByText("Mettre à la corbeille", { exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Envoyer à la corbeille" });
  await expect(dialog).toContainText("1 élément sera envoyé à la corbeille");
  await dialog.getByRole("button", { name: "Annuler" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByTitle(name, { exact: true }).first()).toBeVisible();
});
