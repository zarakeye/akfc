import { expect, test, type Page } from "@playwright/test";

import { loginAs } from "./helpers";
import { TINY_PDF, USERS } from "./data.mjs";

/** Dépose un formulaire signé (sans usage coché : un refus) depuis la fiche du membre. */
async function deposit(page: Page, signedAt: string | null) {
  const forms = page.getByRole("group", { name: "Formulaires signés" });
  await forms.locator('input[type="file"]').setInputFiles({
    name: "formulaire.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(TINY_PDF),
  });
  if (signedAt) await forms.getByLabel("Date de signature").fill(signedAt);
  await forms.getByRole("button", { name: "Déposer" }).click();
}

const status = (page: Page, label: string) =>
  page.getByRole("radiogroup", { name: "Droit à l'image" }).getByRole("radio", { name: label });

test.describe("Droit à l'image", () => {
  // Les deux dépôts se suivent sur le même membre : le second dépend du premier.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    await page.goto(`/dashboard/users/${USERS.droitImage.id}`);
    await expect(status(page, "Accordée")).toHaveAttribute("aria-checked", "true");
  });

  test("un formulaire signé avant les droits en vigueur est archivé, sans changer le statut", async ({ page }) => {
    await deposit(page, "2026-03-01");
    await expect(page.getByText("Formulaire archivé", { exact: false })).toBeVisible();
    await page.reload();
    await expect(status(page, "Accordée")).toHaveAttribute("aria-checked", "true");
  });

  test("un formulaire plus récent change le statut", async ({ page }) => {
    // Sans date de signature : les droits du jour, donc les plus récents.
    await deposit(page, null);
    await expect(page.getByText("le statut du membre est à jour", { exact: false })).toBeVisible();
    await expect(status(page, "Refusée")).toHaveAttribute("aria-checked", "true");
  });
});
