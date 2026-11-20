import { expect, test, type Browser, type Page } from "@playwright/test";

import { loginAs, waitForEmail } from "./helpers";
import { BIRTH_DATE, USERS } from "./data.mjs";

/**
 * Un mineur ne modifie pas sa date de naissance : il la demande à son parent référent, qui reçoit
 * un lien personnel. Une date de majeur doit être confirmée, et fait passer le membre majeur.
 * L'administrateur peut aussi passer un compte majeur sur justificatif, sans date.
 */

/** Le mineur demande, le parent ouvre le lien reçu dans un navigateur sans session. */
async function askAndOpen(page: Page, browser: Browser, email: string, parentEmail: string, action: string): Promise<Page> {
  await loginAs(page, email);
  const since = new Date();
  await page.goto("/profil/edit");
  await expect(page.getByLabel("Date de naissance")).toBeDisabled();
  await page.getByRole("button", { name: `Demander à mon parent de ${action} ma date de naissance` }).click();
  await expect(page.getByRole("status").filter({ hasText: "Demande envoyée" })).toBeVisible();
  const mail = await waitForEmail(page.request, parentEmail, since);
  const link = /(\/date-de-naissance-parent\/[A-Za-z0-9_-]{43})/.exec(mail)?.[1];
  expect(link, "lien dans l'e-mail au parent").toBeTruthy();
  const parent = await (await browser.newContext()).newPage();
  await parent.goto(link as string);
  return parent;
}

test.describe("Date de naissance demandée au parent", () => {
  test.describe.configure({ mode: "serial" });

  test("le parent corrige la date ; une date de majeur est d'abord signalée", async ({ page, browser }) => {
    const name = `${USERS.mineurDate.firstName} ${BIRTH_DATE.lastName}`;
    const parent = await askAndOpen(page, browser, USERS.mineurDate.email, BIRTH_DATE.guardianLou.email, "corriger");
    const date = parent.getByLabel(`Date de naissance de ${name}`);
    await expect(date).toHaveValue("2013-02-02");
    await parent.getByRole("checkbox", { name: /représentant légal/ }).check();
    const submit = parent.getByRole("button", { name: "J'enregistre la date" });

    // Une faute de frappe qui en ferait un majeur : alerte, validation bloquée tant qu'elle n'est pas confirmée.
    await date.fill("2003-02-02");
    const alerte = parent.getByRole("alert").filter({ hasText: "il est majeur" });
    await expect(alerte).toBeVisible();
    await submit.click();
    await expect(parent.getByText("Vérifiez la date, ou confirmez-la.")).toBeVisible();
    await date.fill("2013-03-03");
    await expect(alerte).toHaveCount(0);
    await submit.click();
    await expect(parent.getByRole("status")).toContainText(`La date de naissance de ${name} est enregistrée`);

    await page.reload();
    await expect(page.getByLabel("Date de naissance")).toHaveValue("2013-03-03");
    await expect(page.getByLabel("Date de naissance")).toBeDisabled();
  });

  test("une date de majeur confirmée fait passer le membre majeur", async ({ page, browser }) => {
    const name = `${USERS.mineurMajeur.firstName} ${BIRTH_DATE.lastName}`;
    const parent = await askAndOpen(page, browser, USERS.mineurMajeur.email, BIRTH_DATE.guardianTom.email, "renseigner");
    await parent.getByLabel(`Date de naissance de ${name}`).fill("2005-01-01");
    await parent.getByRole("checkbox", { name: /représentant légal/ }).check();
    const submit = parent.getByRole("button", { name: "J'enregistre la date" });
    await submit.click();
    await expect(parent.getByText("Vérifiez la date, ou confirmez-la.")).toBeVisible();
    await parent.getByRole("checkbox", { name: "Je confirme cette date de naissance." }).check();
    await submit.click();
    await expect(parent.getByRole("status")).toContainText(`${name} est majeur`);

    // Majeur : sa date est à lui, il la corrige ; la demande au parent n'existe plus.
    await page.reload();
    await expect(page.getByLabel("Date de naissance")).toHaveValue("2005-01-01");
    await expect(page.getByLabel("Date de naissance")).toBeEnabled();
    await expect(page.getByRole("button", { name: /Demander à mon parent/ })).toHaveCount(0);
  });

  test("l'administrateur passe un compte majeur sur justificatif, sans date", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    await page.goto(`/dashboard/users/${USERS.mineurDate.id}`);
    const majorite = page.getByRole("region", { name: "Majorité" });
    await expect(majorite).toContainText("Mineur");
    await majorite.getByRole("button", { name: "Passer majeur (justificatif vu)" }).click();
    const confirmation = page.getByRole("dialog", { name: "Passer ce membre en majeur ?" });
    await expect(confirmation).toContainText("pièce d'identité");
    await expect(confirmation).toContainText("restent valables");
    await confirmation.getByRole("button", { name: "Passer majeur", exact: true }).click();
    await expect(majorite.getByRole("button", { name: "Passer majeur (justificatif vu)" })).toHaveCount(0);
    await expect(majorite.getByRole("radio", { name: "Majeur" })).toBeChecked();
    await expect(majorite).not.toContainText("renseignée ✓");
  });
});
