import { expect, test } from "@playwright/test";

// Les formulaires hybrides valident au premier envoi, puis revérifient à la frappe : une erreur
// corrigée disparaît sans nouveau clic. Vérifié sur « Mot de passe oublié », sans compte.

test("une erreur corrigée disparaît à la frappe, sans nouvel envoi", async ({ page }) => {
  await page.goto("/auth/forgot-password");
  await page.getByRole("button", { name: "Envoyer le lien" }).click();
  const erreur = page.getByText("Saisissez votre adresse e-mail.");
  await expect(erreur).toBeVisible();
  // Le curseur est placé sur le champ en erreur : on tape directement.
  await page.keyboard.type("quelquun@example.com");
  await expect(erreur).toHaveCount(0);
});
