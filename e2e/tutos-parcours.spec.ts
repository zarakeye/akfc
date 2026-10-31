import { expect, test, type Page } from "@playwright/test";

import { loginAs } from "./helpers";
import { DOCUMENT_A, USERS } from "./data.mjs";

/**
 * Les tutos des visiteurs et des membres : lancés depuis une fiche du guide ou depuis le bouton
 * « ? », sur une ou deux pages, avec des étapes facultatives. Aucun ne doit rien envoyer.
 */
const bubble = (page: Page, title: string, n: number, total: number) =>
  page.getByRole("dialog", { name: `${title} — étape ${n} sur ${total}` });

async function launchFromHelp(page: Page, title: RegExp): Promise<void> {
  await page.getByRole("button", { name: "Tutoriels de cette page" }).click();
  await page.getByRole("button", { name: title }).click();
}

test("depuis une fiche du guide, « Mot de passe oublié » conduit à sa page et n'envoie rien", async ({ page }) => {
  await page.goto("/docs/guide/mot-de-passe-oublie");
  await page.getByRole("button", { name: "Lancer le tuto" }).click();

  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  const t = "Mot de passe oublié";
  await expect(bubble(page, t, 1, 2)).toBeVisible();
  const next = page.getByRole("button", { name: "Suivant", exact: true });
  await expect(next).toBeDisabled();
  // La cible est le libellé ; le curseur est dans le champ qu'il contient.
  const email = page.locator('[data-tour="auth.forgot.email"] input');
  await expect(email).toBeFocused();
  await email.fill("pas-une-adresse");
  await expect(next).toBeDisabled();
  await email.fill(USERS.oubli.email);
  // Entrée dans le champ enverrait le formulaire (le bouton est actif) : pendant le tuto, rien ne part.
  await email.press("Enter");
  await expect(page.getByText("un lien a été envoyé")).toHaveCount(0);
  await next.click();

  await expect(bubble(page, t, 2, 2)).toBeVisible();
  // Le bouton d'envoi est montré, pas cliquable pendant l'étape : rien ne part.
  await page.locator('[data-tour="auth.forgot.submit"]').click({ force: true });
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByRole("dialog", { name: new RegExp(t) })).toHaveCount(0);
  await expect(page.getByText("un lien a été envoyé")).toHaveCount(0);
});

test("« Mes documents » saute les étapes de lecture quand la liste est vide", async ({ page }) => {
  await loginAs(page, USERS.membreB.email);
  await page.goto("/documents");
  await launchFromHelp(page, /Mes documents.*Trouver/);

  const t = "Mes documents";
  await expect(bubble(page, t, 1, 5)).toBeVisible();
  await page.getByRole("button", { name: "Suivant", exact: true }).click();
  // Étapes 2 à 4 facultatives : aucun document, donc aucune cible ; le tuto passe à la fin.
  await expect(bubble(page, t, 5, 5)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Terminer" }).click();
});

test("« Mes documents » ouvre un document quand il y en a un", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/documents");
  await launchFromHelp(page, /Mes documents.*Trouver/);

  const t = "Mes documents";
  const next = page.getByRole("button", { name: "Suivant", exact: true });
  await expect(bubble(page, t, 1, 5)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 2, 5)).toBeVisible();
  await page.locator('[data-tour="documents.item"]', { hasText: DOCUMENT_A.title }).click();
  await expect(bubble(page, t, 3, 5)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 4, 5)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 5, 5)).toBeVisible();
});

test("« Mon profil » passe de la page du profil au formulaire, sans rien enregistrer", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/profil");
  await launchFromHelp(page, /Mon profil.*Retrouver/);

  const t = "Mon profil";
  const next = page.getByRole("button", { name: "Suivant", exact: true });
  await expect(bubble(page, t, 1, 6)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 2, 6)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 3, 6)).toBeVisible();
  await page.locator('[data-tour="profil.edit"]').click();

  await expect(page).toHaveURL(/\/profil\/edit(\?|$)/);
  for (const n of [4, 5]) {
    await expect(bubble(page, t, n, 6)).toBeVisible();
    await next.click();
  }
  await expect(bubble(page, t, 6, 6)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page).toHaveURL(/\/profil\/edit(\?|$)/);
});

test("« Contacter le club » fait remplir le formulaire, et l'envoi reste au membre", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  await page.goto("/contacts");
  await launchFromHelp(page, /Contacter le club.*Écrire/);

  const t = "Contacter le club";
  const next = page.getByRole("button", { name: "Suivant", exact: true });
  // Deux catégories au démarrage : l'étape facultative du destinataire est là.
  await expect(bubble(page, t, 1, 4)).toBeVisible();
  await next.click();
  await expect(bubble(page, t, 2, 4)).toBeVisible();
  await page.locator('[data-tour="contact.form.subject"] input').fill("Essai du tuto");
  await next.click();
  await expect(bubble(page, t, 3, 4)).toBeVisible();
  await page.locator('[data-tour="contact.form.body"] textarea').fill("Message d'essai, non envoyé.");
  await next.click();

  await expect(bubble(page, t, 4, 4)).toBeVisible();
  // Au clavier non plus : Tab ne conduit pas au bouton montré, le curseur reste dans la bulle.
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  await expect(page.locator('[data-tour="contact.form.submit"] button')).not.toBeFocused();
  // Pendant l'étape, un clic sur « Envoyer » ne passe pas : la cible d'une étape « Suivant » est couverte.
  await page.locator('[data-tour="contact.form.submit"] button').click({ force: true });
  await expect(page.getByText("Message envoyé, merci !")).toHaveCount(0);
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByText("Message envoyé, merci !")).toHaveCount(0);
});

test("le guide liste les parcours ; un tuto de membre y est grisé pour un visiteur", async ({ page }) => {
  await page.goto("/docs/guide");
  const membre = page.getByRole("region", { name: "Parcours membre" });
  await expect(membre.getByRole("button", { name: "1. Mon profil (indisponible)" })).toBeDisabled();
  await expect(membre.getByRole("link", { name: "La fiche" }).first()).toHaveAttribute("href", "/docs/guide/mon-profil");
  const visiteur = page.getByRole("region", { name: "Parcours visiteur" });
  await visiteur.getByRole("button", { name: "2. Mot de passe oublié" }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  await expect(page.getByRole("dialog", { name: "Mot de passe oublié — étape 1 sur 2" })).toBeVisible();
});
