import { expect, test, type Locator } from "@playwright/test";

import { clickUntilUrl, loginAs } from "./helpers";
import { TAG_GALLERY, USERS } from "./data.mjs";

/**
 * Le tableau des images d'une galerie : une ligne par média, une pastille par usage du droit à
 * l'image. Un clic sur le média ouvre la modale des tags ; le verdict s'y recalcule à chaque case,
 * avant même d'enregistrer. Le membre coché a un refus saisi par le club : la photo passe au rouge.
 */
const badge = (scope: Locator, label: string) => scope.getByRole("img", { name: label, exact: true });

test("taguer une personne depuis le tableau d'une galerie fait passer ses pastilles au rouge", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/galleries");
  await clickUntilUrl(page, page.getByRole("cell", { name: TAG_GALLERY.title, exact: true }), /\/dashboard\/galleries\/\d+/);
  // La fiche est en lecture : les images s'éditent sur la page « Éditer ».
  await page.goto(`${page.url()}/edit`);

  const row = page.getByRole("row").filter({ has: page.getByRole("button", { name: "Taguer les personnes du média n° 1" }) });
  await expect(badge(row, "Site public : À taguer")).toBeVisible();

  // Le clic peut précéder l'hydratation : on recommence tant que la modale n'est pas là.
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await row.getByRole("button", { name: "Taguer les personnes du média n° 1" }).click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();

  await dialog.getByRole("searchbox", { name: "Rechercher un membre" }).fill(USERS.tagRefus.email);
  await dialog.getByRole("checkbox", { name: new RegExp(USERS.tagRefus.firstName) }).check();
  await expect(dialog.getByText("Verdict après enregistrement")).toBeVisible();
  await expect(badge(dialog, "Site public : Refus").first()).toBeVisible();

  await dialog.getByRole("button", { name: "Enregistrer les tags" }).click();
  await expect(dialog).toBeHidden();
  await expect(row.getByRole("button", { name: "1 personne" })).toBeVisible();
  await expect(badge(row, "Site public : Refus")).toBeVisible();
  await expect(badge(row, "Espace membres : Refus")).toBeVisible();

  // « Aucune personne reconnaissable » : tout passe au vert, aussitôt.
  await row.getByRole("button", { name: "1 personne" }).click();
  const none = dialog.getByRole("checkbox", { name: /Aucune personne reconnaissable/ });
  await none.click();
  await expect(none).toBeChecked();
  await expect(badge(dialog, "Site public : Accord").first()).toBeVisible();
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await expect(badge(row, "Site public : Accord")).toBeVisible();
});
