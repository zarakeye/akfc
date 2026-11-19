import { expect, test } from "@playwright/test";

import { loginAs, waitForEmail } from "./helpers";
import { MINOR, USERS } from "./data.mjs";

/**
 * Le même circuit, par les pages : le mineur indique ses souhaits depuis « Mon droit à l'image », le parent
 * (sans compte) valide sur /autorisation-parent/<jeton>, l'administrateur voit ce qu'il a changé.
 */
test("souhaits du mineur, page du parent, changements visibles sur la fiche", async ({ page, browser }) => {
  const g = MINOR.guardianPages;
  const name = `${USERS.mineurPages.firstName} ${MINOR.lastName}`;

  // 1. Le mineur : ses souhaits (espace membres et réseaux sociaux), envoyés à son parent.
  await loginAs(page, USERS.mineurPages.email);
  const since = new Date();
  await page.goto("/profil/droit-a-l-image");
  await page.getByRole("button", { name: "Indiquer mes souhaits" }).click();
  await page.getByRole("radio", { name: "Espace membres : oui" }).check();
  await page.getByRole("radio", { name: "Réseaux sociaux du club : oui" }).check();
  await page.getByRole("button", { name: "Envoyer à mon parent" }).click();
  await expect(page.getByRole("status")).toContainText("En attente de votre parent");

  const mail = await waitForEmail(page.request, g.email, since);
  const link = /(\/autorisation-parent\/[A-Za-z0-9_-]{43})/.exec(mail)?.[1];
  expect(link, "lien dans l'e-mail au parent").toBeTruthy();

  // 2. Le parent, dans un navigateur sans session : souhaits pré-cochés, il change les réseaux.
  const parentContext = await browser.newContext();
  const parent = await parentContext.newPage();
  await parent.goto(link as string);
  await expect(parent.getByText(`Bonjour ${g.name}`)).toBeVisible();
  await expect(parent.getByRole("radio", { name: "Espace membres : oui" })).toBeChecked();
  await expect(parent.getByRole("radio", { name: "Réseaux sociaux du club : oui" })).toBeChecked();
  await parent.getByRole("radio", { name: "Réseaux sociaux du club : non" }).check();
  await expect(parent.getByText("modifié")).toHaveCount(1);

  // Sans se déclarer représentant légal, pas de validation, et la page dit pourquoi.
  const submit = parent.getByRole("button", { name: "Je valide l'autorisation" });
  await submit.click();
  await expect(parent.getByText("Pour valider, cochez la case")).toBeVisible();
  // La date de naissance est facultative : le club ne la connaît pas, le parent peut la donner.
  const date = parent.getByLabel(`Date de naissance de ${name}`);
  await expect(date).toHaveValue("");
  // Cochée, l'erreur s'efface aussitôt ; la date reste facultative.
  await parent.getByRole("checkbox").check();
  await expect(parent.getByText("Pour valider, cochez la case")).toHaveCount(0);
  await date.fill("2012-09-10");
  await submit.click();
  await expect(parent.getByRole("status")).toContainText(`l'autorisation de ${name} est enregistrée`);
  await expect(parent.getByRole("status")).toContainText("Réseaux sociaux du club : souhaité Oui → Non");

  // Le même lien, rouvert : il ne sert plus.
  await parent.reload();
  await expect(parent.getByText("Ce lien n'est plus valable", { exact: false })).toBeVisible();
  await parentContext.close();

  // Le mineur voit sa date de naissance dans son profil, sans pouvoir la changer : c'est son parent.
  await page.goto("/profil/edit");
  const birth = page.getByLabel("Date de naissance");
  await expect(birth).toHaveValue("2012-09-10");
  await expect(birth).toBeDisabled();
  await expect(page.getByText("C'est votre parent référent qui corrige votre date de naissance")).toBeVisible();

  // 3. L'administrateur voit, sur la fiche, ce que le parent a changé.
  await loginAs(page, USERS.admin.email);
  await page.goto(`/dashboard/users/${USERS.mineurPages.id}`);
  const forms = page.getByRole("group", { name: "Formulaires signés" });
  await expect(forms).toContainText("Changements du parent par rapport aux souhaits du membre");
  await expect(forms).toContainText("Réseaux sociaux du club : souhaité Oui → Non");
});
