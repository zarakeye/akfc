import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * Ce test crée une vraie demande : il passe en dernier (préfixe « zz- »), après les tutos qui
 * attendent une boîte de demandes vide.
 *
 * Répondre et transférer passent par leurs server actions : erreurs sous les champs, puis la
 * réponse part et apparaît dans le fil.
 */

test("une demande : répondre (formule d'appel seule refusée), puis transférer (champs obligatoires)", async ({ page }) => {
  // Un membre écrit au club.
  await loginAs(page, USERS.membreB.email);
  const categories = (await trpcQuery(page.request, "ticket.categories", undefined)).result as { key: string }[];
  const subject = "zz-Demande e2e à laquelle répondre";
  await trpcMutation(page.request, "ticket.submit", {
    categoryKey: categories[0]?.key,
    subject,
    body: "Bonjour, une question de test.",
  });

  // Un administrateur l'ouvre.
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/tickets");
  await page.getByText(subject).click();
  const repondre = page.getByRole("button", { name: "Envoyer la réponse" });

  // La formule d'appel seule n'est pas une réponse.
  await repondre.click();
  await expect(page.getByText("Écrivez votre réponse.")).toBeVisible();

  await page.getByLabel("Répondre").fill("Bonjour,\n\nVoici la réponse du club.");
  await repondre.click();
  await expect(page.getByText(/^Réponse (envoyée|enregistrée)( \(|\.$)/)).toBeVisible();
  await expect(page.getByText("Voici la réponse du club.")).toBeVisible();
  // Le champ revient à la formule d'appel.
  await expect(page.getByLabel("Répondre")).not.toHaveValue(/Voici la réponse/);

  // Transférer : une personne et une note sont obligatoires.
  await page.getByRole("button", { name: "Transférer…" }).click();
  await page.getByRole("button", { name: "Transférer", exact: true }).click();
  await expect(page.getByText("Choisissez une personne.")).toBeVisible();
  await expect(page.getByText("La note est obligatoire.")).toBeVisible();
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByRole("button", { name: "Transférer…" })).toBeVisible();
});
