import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { DISCIPLINES, USERS } from "./data.mjs";

// Inscriptions aux cours : à la création d'un compte, un cours pour mineurs pré-coche « Mineur » ;
// sur la fiche d'un membre, les cours suivis s'enregistrent.

const nom = DISCIPLINES.seconde.name.replace(/[()]/g, "\\$&");

test("un cours pour adolescents pré-coche « Mineur » à la création d'un compte", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/users/create");
  const majorite = page.getByRole("radiogroup", { name: "Majorité" });
  await expect(majorite.getByRole("radio", { name: "Mineur" })).not.toBeChecked();

  await page.getByRole("checkbox", { name: new RegExp(`${nom} — Jeudi 18h00–19h30 · Ados`) }).check();
  await expect(majorite.getByRole("radio", { name: "Mineur" })).toBeChecked();
  await expect(page.getByRole("note")).toContainText("Mineur pré-coché");

  // Majeur choisi malgré tout : l'avertissement change, le choix reste à l'administrateur.
  await majorite.getByRole("radio", { name: "Majeur" }).check();
  await expect(page.getByRole("note")).toContainText("Le membre est-il bien majeur ?");
});

test("les cours suivis s'enregistrent sur la fiche d'un membre", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto(`/dashboard/users/${USERS.membreA.id}`);
  const cours = page.getByRole("region", { name: "Cours suivis" });
  const adultes = cours.getByRole("checkbox", { name: new RegExp(`${nom} — Mardi 20h00–21h30 · Adultes`) });
  await adultes.check();
  await cours.getByRole("button", { name: "Enregistrer les cours" }).click();
  await expect(cours.getByRole("status")).toContainText("Cours enregistrés");

  await page.reload();
  await expect(page.getByRole("region", { name: "Cours suivis" }).getByRole("checkbox", { name: /Mardi 20h00/ })).toBeChecked();
});
