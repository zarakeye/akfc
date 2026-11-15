import { expect, test, type Page } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// Groupes système : Instructeurs et Bureau existent sous Administrateurs, ne se suppriment pas,
// refusent un mineur, et rendent majeur le membre qu'on y ajoute.

async function ouvrirGroupe(page: Page, nom: string) {
  await page.goto("/dashboard/groups");
  await page.getByRole("cell", { name: nom, exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/groups\/[^/]+$/);
}

function ajouter(page: Page, prenom: string) {
  return page.getByRole("listitem").filter({ hasText: prenom }).getByRole("button", { name: "Ajouter" });
}

test("Instructeurs et Bureau sont des groupes système, impossibles à supprimer", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  for (const nom of ["Instructeurs", "Bureau"]) {
    await ouvrirGroupe(page, nom);
    await expect(page.getByText("Groupe système : il ne peut pas être supprimé.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Supprimer le groupe" })).toHaveCount(0);
  }
});

test("Bureau refuse un mineur, et rend majeur le membre qu'on y ajoute", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await ouvrirGroupe(page, "Bureau");

  await ajouter(page, USERS.tagMineur.firstName).click();
  await expect(page.getByText("Un mineur ne peut pas faire partie du groupe Bureau.")).toBeVisible();

  await ajouter(page, USERS.bureau.firstName).click();
  await expect(ajouter(page, USERS.bureau.firstName)).toHaveCount(0);

  await page.goto(`/dashboard/users/${USERS.bureau.id}`);
  await expect(page.getByRole("radio", { name: "Majeur" })).toBeChecked();
});
