import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Ce test crée une vraie demande : il passe en dernier (préfixe « zz- »), après les tutos qui
 * attendent une boîte de demandes vide.
 */

test("« Écrire au club » : les champs manquants sont signalés, puis la demande part avec sa référence", async ({ page }) => {
  await loginAs(page, USERS.membreB.email);
  await page.goto("/contacts");

  const submit = page.locator('[data-tour="contact.form.submit"] button');
  await submit.click();
  await expect(page.getByText("L'objet est obligatoire")).toBeVisible();
  await expect(page.getByText("Le message est obligatoire")).toBeVisible();

  await page.locator('[data-tour="contact.form.category"] input[type="radio"]').first().check();
  await page.locator('[data-tour="contact.form.subject"] input').fill("zz-Demande e2e du formulaire");
  await page.locator('[data-tour="contact.form.body"] textarea').fill("Bonjour, ceci est une demande de test.");
  await submit.click();

  await expect(page.getByText("Message envoyé, merci !")).toBeVisible();
  await expect(page.getByText(/Référence :/)).toBeVisible();

  // Un autre message : le formulaire revient, vide.
  await page.getByRole("button", { name: "Écrire un autre message" }).click();
  await expect(page.locator('[data-tour="contact.form.subject"] input')).toHaveValue("");
});
