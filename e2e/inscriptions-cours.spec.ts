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

test("un instructeur : ses cours donnés, sans « Cours suivis » pour eux", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  // L'administrateur de test donne tous les cours, par leur discipline.
  await page.goto(`/dashboard/users/${USERS.admin.id}`);
  const donnes = page.getByRole("region", { name: "Cours donnés" });
  const jeudi = donnes.getByRole("checkbox", { name: /Jeudi 18h00/ });
  await expect(jeudi).toBeChecked();
  await expect(jeudi).toBeDisabled();
  await expect(donnes).toContainText("par sa discipline");
  await expect(page.getByRole("region", { name: "Cours suivis", exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Autres cours suivis" })).toContainText("Aucun autre cours.");
});

test("créer un instructeur avec un cours donné, puis le lui retirer", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/users/create");
  const email = `zz-instructeur-${Date.now()}@e2e.test`;
  await page.getByLabel("Email").fill(email);
  await page.getByRole("checkbox", { name: "Instructeur", exact: true }).check();
  const donnes = page.getByRole("group", { name: "Cours donnés" });
  const jeudi = donnes.getByRole("checkbox", { name: /Jeudi 18h00/ });
  await expect(donnes).toContainText("actuellement :");
  await jeudi.check();
  await expect(donnes).toContainText("remplace");
  // Ce cours ne se « suit » plus : il n'est pas proposé dans les autres cours.
  await expect(page.getByRole("group", { name: "Autres cours suivis (facultatif)" }).getByRole("checkbox", { name: /Jeudi 18h00/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Créer", exact: true }).click();
  await page.waitForURL(/\/dashboard\/users\/(?!create)[^/]+$/);

  const fiche = page.getByRole("region", { name: "Cours donnés" });
  const coche = fiche.getByRole("checkbox", { name: /Jeudi 18h00/ });
  await expect(coche).toBeChecked();
  await expect(coche).toBeEnabled();
  // Retiré : le cours revient à l'instructeur de sa discipline.
  await coche.uncheck();
  await fiche.getByRole("button", { name: "Enregistrer les cours donnés" }).click();
  await expect(fiche.getByRole("status")).toContainText("Cours donnés enregistrés");
  await expect(fiche.getByRole("checkbox", { name: /Jeudi 18h00/ })).not.toBeChecked();
});
