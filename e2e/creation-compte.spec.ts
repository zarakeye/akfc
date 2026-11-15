import { expect, test, type Page } from "@playwright/test";

import { loginAs } from "./helpers";
import { DISCIPLINES, USERS } from "./data.mjs";

// Création d'un compte : le statut (Administrateur, Instructeur, Bureau, ou simple membre), les
// cours (un cours pour mineurs exclut les autres, sauf « Tous publics »), et la majorité, décidée
// par la date de naissance quand elle est donnée. Les adresses créées commencent par « zz- » : la
// liste des utilisateurs, triée par adresse, garde ainsi les comptes de test en première page.

const nom = DISCIPLINES.seconde.name.replace(/[()]/g, "\\$&");
const unique = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function ouvrir(page: Page) {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/users/create");
  await expect(page.getByRole("group", { name: "Statut" })).toBeVisible();
}

test("un instructeur est majeur d'office, sans saisie de majorité", async ({ page }) => {
  await ouvrir(page);
  await page.getByLabel("Email").fill(`zz-instructeur-${unique()}@e2e.test`);
  await page.getByRole("checkbox", { name: "Instructeur" }).check();
  await expect(page.getByText("les administrateurs, instructeurs et membres du bureau sont majeurs")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Majorité" })).toHaveCount(0);
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await expect(page.getByText("Utilisateur créé.")).toBeVisible();
  await page.waitForURL(/\/dashboard\/users\/[^/]+$/);
  await expect(page.getByRole("radio", { name: "Majeur" })).toBeChecked();
});

test("une date de naissance de mineur décide, et appelle le parent référent", async ({ page }) => {
  await ouvrir(page);
  await page.getByLabel("Email").fill(`zz-ado-${unique()}@e2e.test`);
  const quinzeAns = new Date();
  quinzeAns.setUTCFullYear(quinzeAns.getUTCFullYear() - 15);
  await page.getByLabel("Date de naissance (facultative)").fill(quinzeAns.toISOString().slice(0, 10));
  await expect(page.getByRole("status").filter({ hasText: "15 ans" })).toContainText("mineur");
  await expect(page.getByRole("radiogroup", { name: "Majorité" })).toHaveCount(0);

  // Sans parent, la création est refusée.
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await expect(page.getByText("Indiquez le prénom et le nom du parent.")).toBeVisible();

  const parent = page.getByRole("group", { name: "Parent référent" });
  await parent.getByLabel("Prénom", { exact: true }).fill("Claire");
  await parent.getByLabel("Nom", { exact: true }).fill("Parent");
  await parent.getByLabel("Qualité").selectOption("mère");
  await parent.getByLabel("Adresse e-mail").fill(`parent-${unique()}@e2e.test`);
  await parent.getByLabel("Téléphone (facultatif)").fill("06 12 34 56 78");
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await expect(page.getByText("Utilisateur créé.")).toBeVisible();
  await page.waitForURL(/\/dashboard\/users\/[^/]+$/);
  await expect(page.getByRole("radio", { name: "Mineur" })).toBeChecked();
});

test("un cours pour ados grise les autres cours, sauf « Tous publics »", async ({ page }) => {
  await ouvrir(page);
  const adultes = page.getByRole("checkbox", { name: new RegExp(`${nom} — Mardi 20h00–21h30 · Adultes`) });
  await expect(adultes).toBeEnabled();
  await page.getByRole("checkbox", { name: new RegExp(`${nom} — Jeudi 18h00–19h30 · Ados`) }).check();
  await expect(adultes).toBeDisabled();

  // Un instructeur, lui, peut suivre n'importe quel cours.
  await page.getByRole("checkbox", { name: "Instructeur" }).check();
  await expect(adultes).toBeEnabled();
});
