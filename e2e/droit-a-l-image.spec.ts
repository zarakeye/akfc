import { expect, test, type Page } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// La correction à la main est repliée sous « Corriger le statut à la main » : includeHidden la lit
// sans la déplier.
const status = (page: Page, label: string) =>
  page
    .getByRole("radiogroup", { name: "Droit à l'image", includeHidden: true })
    .getByRole("radio", { name: label, includeHidden: true });

/**
 * Tout se fait en ligne : sur la fiche d'un membre, l'administrateur consulte les formulaires, il
 * n'en dépose aucun. Seule compte la volonté du membre (ou de son parent).
 */
test("la fiche d'un membre n'a plus de dépôt de formulaire", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto(`/dashboard/users/${USERS.droitImage.id}`);
  await expect(status(page, "Accordée")).toHaveAttribute("aria-checked", "true");
  const forms = page.getByRole("group", { name: "Formulaires signés" });
  await expect(forms).toBeVisible();
  await expect(forms.locator('input[type="file"]')).toHaveCount(0);
  await expect(forms.getByRole("button", { name: "Déposer" })).toHaveCount(0);
  await expect(page.getByText("Déposer un formulaire signé")).toHaveCount(0);
});
