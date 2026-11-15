import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Inscrit mineur, il a eu 18 ans (date de naissance vérifiée) : il est majeur, même avant la tâche
 * de nuit. Les choix signés par son parent restent valables ; on lui demande de confirmer les siens.
 * Sa date de naissance, il la corrige, sans pouvoir redevenir mineur par une erreur de saisie.
 */
test("à 18 ans : reconfirmer les choix du parent, et la date de naissance reste majeure", async ({ page }) => {
  await loginAs(page, USERS.dixHuit.email);
  await page.goto("/profil/droit-a-l-image");
  await expect(page.getByRole("status").filter({ hasText: "Vous êtes majeur(e)" })).toContainText(
    "Les choix de votre parent restent valables",
  );
  await page.getByRole("button", { name: "Confirmer ou modifier mes choix" }).click();
  await expect(page.getByRole("radio", { name: "Espace membres : oui" })).toBeChecked();

  await page.goto("/profil/edit");
  const birth = page.getByLabel("Date de naissance");
  await expect(birth).toHaveValue("2000-03-01");
  await expect(birth).toBeEnabled();
  await birth.fill("2015-01-01");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Cette date ferait de vous un mineur")).toBeVisible();
});
