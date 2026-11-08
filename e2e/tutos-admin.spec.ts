import { expect, test, type Page } from "@playwright/test";

import { clickUntilUrl, loginAs, trpcMutation } from "./helpers";
import { SEMINAR, USERS } from "./data.mjs";

/**
 * Les tutos d'administration : un seul crée quelque chose (un flash info, en brouillon) ; les
 * autres montrent le bouton qui engage — publier, créer un compte, répondre — sans le cliquer.
 */
const bubble = (page: Page, title: string, n: number, total: number) =>
  page.getByRole("dialog", { name: `${title} — étape ${n} sur ${total}` });
const nextButton = (page: Page) => page.getByRole("button", { name: "Suivant", exact: true });

async function launch(page: Page, path: string, title: RegExp): Promise<void> {
  await page.goto(path);
  await page.getByRole("button", { name: "Tutoriels de cette page" }).click();
  await page.getByRole("button", { name: title }).click();
}

test.beforeEach(async ({ page }) => {
  await loginAs(page, USERS.admin.email);
});

test("« Le tableau de bord » se lit d'un bout à l'autre", async ({ page }) => {
  await launch(page, "/dashboard", /Le tableau de bord.*Repérer/);
  const t = "Le tableau de bord";
  for (const n of [1, 2, 3]) {
    await expect(bubble(page, t, n, 4)).toBeVisible();
    await nextButton(page).click();
  }
  await expect(bubble(page, t, 4, 4)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();
});

test("« Créer un flash info » enregistre un brouillon", async ({ page }) => {
  await launch(page, "/dashboard/breaking-news", /Créer un flash info.*ruban/);
  const t = "Créer un flash info";
  await expect(bubble(page, t, 1, 7)).toBeVisible();
  await page.locator('[data-tour="breaking-news.list.create"]').click();

  await expect(bubble(page, t, 2, 7)).toBeVisible();
  await page.locator('[data-tour="breaking-news.form.title"] input').fill("Exemple (tuto)");
  await nextButton(page).click();
  await expect(bubble(page, t, 3, 7)).toBeVisible();
  await page.locator('[data-tour="breaking-news.form.body"] textarea').fill("Texte d'essai.");
  await nextButton(page).click();
  for (const n of [4, 5]) {
    await expect(bubble(page, t, n, 7)).toBeVisible();
    await nextButton(page).click();
  }

  await expect(bubble(page, t, 6, 7)).toBeVisible();
  await page.locator('[data-tour="breaking-news.form.submit"] button').click();
  await expect(bubble(page, t, 7, 7)).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/dashboard\/breaking-news$/);
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByRole("row", { name: /Exemple \(tuto\).*Brouillon/ })).toBeVisible();
});

test("« Publier une page éditoriale » ne publie rien", async ({ page }) => {
  await launch(page, "/dashboard/pages", /Publier une page éditoriale.*Comprendre/);
  const t = "Publier une page éditoriale";
  const first = page.locator('[data-tour="pages.list"] li').first();
  await expect(first).toContainText("Brouillon");
  for (const n of [1, 2]) {
    await expect(bubble(page, t, n, 3)).toBeVisible();
    await nextButton(page).click();
  }
  await expect(bubble(page, t, 3, 3)).toBeVisible();
  // Le bouton montré est couvert : même un clic forcé ne publie pas.
  await page.locator('[data-tour="pages.item.publish"]').first().click({ force: true });
  await page.getByRole("button", { name: "Terminer" }).click();
  await page.reload();
  await expect(first).toContainText("Brouillon");
});

test("« Créer un utilisateur » s'arrête avant de créer le compte", async ({ page }) => {
  await launch(page, "/dashboard/users", /Créer un utilisateur.*Remplir/);
  const t = "Créer un utilisateur";
  await expect(bubble(page, t, 1, 5)).toBeVisible();
  await page.locator('[data-tour="users.list.create"]').click();
  await expect(bubble(page, t, 2, 5)).toBeVisible();
  await page.locator('[data-tour="users.form.email"] input').fill("nouveau-tuto@e2e.test");
  await nextButton(page).click();
  for (const n of [3, 4]) {
    await expect(bubble(page, t, n, 5)).toBeVisible();
    await nextButton(page).click();
  }
  await expect(bubble(page, t, 5, 5)).toBeVisible();
  await page.locator('[data-tour="users.form.submit"] button').click({ force: true });
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByText("Utilisateur créé.")).toHaveCount(0);
  await expect(page).toHaveURL(/\/dashboard\/users\/create$/);
});

test("« Le droit à l'image d'un mineur » conduit à sa fiche et montre où suivre la demande", async ({ page }) => {
  await launch(page, "/dashboard/users", /Le droit à l'image d'un mineur.*parent/);
  const t = "Le droit à l'image d'un mineur";
  await expect(bubble(page, t, 1, 3)).toBeVisible();
  await clickUntilUrl(page, page.getByRole("row", { name: new RegExp(USERS.mineur.email) }), new RegExp(`/dashboard/users/${USERS.mineur.id}$`));
  await expect(bubble(page, t, 2, 3)).toBeVisible();
  await nextButton(page).click();
  await expect(bubble(page, t, 3, 3)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();
});

test("« Traiter une demande » saute les étapes d'une demande quand la boîte est vide", async ({ page }) => {
  await launch(page, "/dashboard/tickets", /Traiter une demande.*Trier/);
  const t = "Traiter une demande";
  await expect(bubble(page, t, 1, 6)).toBeVisible();
  await nextButton(page).click();
  await expect(bubble(page, t, 6, 6)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Terminer" }).click();
});

test("« Traiter une demande » ouvre une demande, et n'y répond pas", async ({ page }) => {
  // Une demande du membre A, puis retour à l'administrateur.
  await loginAs(page, USERS.membreA.email);
  const sent = await trpcMutation(page.request, "ticket.submit", {
    categoryKey: "support",
    subject: "Demande e2e du tuto",
    body: "Bonjour, ceci est une demande de test.",
  });
  expect(sent.error).toBeUndefined();
  await loginAs(page, USERS.admin.email);

  await launch(page, "/dashboard/tickets", /Traiter une demande.*Trier/);
  const t = "Traiter une demande";
  await expect(bubble(page, t, 1, 6)).toBeVisible();
  await nextButton(page).click();
  await expect(bubble(page, t, 2, 6)).toBeVisible();
  await clickUntilUrl(page, page.locator('[data-tour="tickets.item"]', { hasText: "Demande e2e du tuto" }), /\/dashboard\/tickets\/[^/]+$/);
  for (const n of [3, 4, 5]) {
    await expect(bubble(page, t, n, 6)).toBeVisible();
    await nextButton(page).click();
  }
  await expect(bubble(page, t, 6, 6)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();
  await expect(page.getByText("Réponse envoyée.")).toHaveCount(0);
});

test("« Créer un groupe » fait taper un nom, et ne crée pas le groupe", async ({ page }) => {
  await launch(page, "/dashboard/groups", /Créer un groupe.*Créer un groupe de membres/);
  const t = "Créer un groupe";
  await page.locator('[data-tour="groups.list.create"]').click();
  await expect(bubble(page, t, 2, 5)).toBeVisible();
  await page.locator('[data-tour="groups.form.name"] input').fill("Groupe du tuto");
  for (const n of [2, 3, 4]) {
    await expect(bubble(page, t, n, 5)).toBeVisible();
    await nextButton(page).click();
  }
  await expect(bubble(page, t, 5, 5)).toBeVisible();
  await page.locator('[data-tour="groups.form.submit"] button').click({ force: true });
  await page.getByRole("button", { name: "Terminer" }).click();
  await page.goto("/dashboard/groups");
  await expect(page.getByText("Groupe du tuto")).toHaveCount(0);
});

for (const [path, title, total] of [
  ["/dashboard/disciplines", "Créer une discipline", 6],
  ["/dashboard/courses", "Créer un cours", 4],
  ["/dashboard/seminars", "Créer un stage", 6],
  ["/dashboard/events", "Créer un évènement", 5],
] as const) {
  test(`« ${title} » parcourt le formulaire jusqu'à son bouton`, async ({ page }) => {
    await launch(page, path, new RegExp(`${title}.`));
    await page.locator(`[data-tour="${path.split("/")[2]}.list.create"]`).click();
    for (let n = 2; n < total; n++) {
      await expect(bubble(page, title, n, total)).toBeVisible();
      await nextButton(page).click();
    }
    await expect(bubble(page, title, total, total)).toBeVisible();
    await page.getByRole("button", { name: "Terminer" }).click();
    await expect(page).toHaveURL(new RegExp(`${path}/create$`));
  });
}

test("« Ajouter des séances » conduit de la liste à l'édition d'un stage", async ({ page }) => {
  await launch(page, "/dashboard/seminars", /Ajouter des séances.*agenda/);
  const t = "Ajouter des séances";
  await expect(bubble(page, t, 1, 3)).toBeVisible();
  await clickUntilUrl(page, page.getByText(SEMINAR.label, { exact: true }), /\/dashboard\/seminars\/\d+$/);
  await expect(bubble(page, t, 2, 3)).toBeVisible();
  await page.locator('[data-tour="fiche.edit"]').click();
  await expect(bubble(page, t, 3, 3)).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/seminars\/\d+\/edit$/);
  await page.getByRole("button", { name: "Terminer" }).click();
});

test("la doc admin propose les tutos par parcours, numérotés et cliquables", async ({ page }) => {
  await page.goto("/docs/admin");
  const parcours = page.getByRole("region", { name: "3. Le catalogue et le programme" });
  await expect(parcours.getByRole("button", { name: /^6\. Créer un stage$/ })).toBeVisible();
  await parcours.getByRole("button", { name: /^4\. Créer une discipline$/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/disciplines$/);
  await expect(bubble(page, "Créer une discipline", 1, 6)).toBeVisible();
});

/** Suit les bulles d'explication jusqu'à la dernière, puis « Terminer ». */
async function nextToEnd(page: Page, title: string): Promise<void> {
  const dialog = page.getByRole("dialog", { name: new RegExp(`^${title} — étape`) });
  for (let i = 0; i < 12; i++) {
    await expect(dialog).toBeVisible();
    const terminer = page.getByRole("button", { name: "Terminer" });
    if (await terminer.isVisible()) {
      await terminer.click();
      await expect(dialog).toHaveCount(0);
      return;
    }
    await nextButton(page).click();
  }
  throw new Error(`${title} : pas de dernière étape`);
}

test("« Le constructeur de pages » ajoute un bloc dans le formulaire, sans créer le post", async ({ page }) => {
  await launch(page, "/dashboard/posts/create", /Le constructeur de pages.*Composer/);
  const t = "Le constructeur de pages";
  await expect(bubble(page, t, 1, 6)).toBeVisible();
  await nextButton(page).click();
  await page.locator('[data-tour="builder.add"]').click();
  await expect(bubble(page, t, 3, 6)).toBeVisible();
  await page.locator('[data-tour="builder.add.text"]').click();
  await expect(bubble(page, t, 4, 6)).toBeVisible();
  await expect(page.locator('[data-tour="builder.block"]')).toHaveCount(1);
  await nextToEnd(page, t);
  await expect(page).toHaveURL(/\/dashboard\/posts\/create$/);
});

test("« La bibliothèque » et « Les réglages du site » se lisent d'un bout à l'autre", async ({ page }) => {
  await launch(page, "/dashboard/library", /La bibliothèque.*Parcourir/);
  await nextToEnd(page, "La bibliothèque");
  await launch(page, "/dashboard/settings", /Les réglages du site.*titres/);
  await nextToEnd(page, "Les réglages du site");
});

test("« Créer une catégorie » propose la catégorie manquante et ne crée rien", async ({ page }) => {
  await launch(page, "/dashboard/categories", /Créer une catégorie.*manquante/);
  await page.locator('[data-tour="categories.list.create"]').click();
  const key = page.locator('[data-tour="categories.form.key"] select');
  await expect(key).toBeFocused();
  // Seule la catégorie qui manque est proposée ; le libellé suit.
  await expect(key.locator("option:not([disabled])")).toHaveText(["Évènement"]);
  await key.selectOption("event");
  await nextButton(page).click();
  const label = page.locator('[data-tour="categories.form.type"] input');
  await expect(label).toHaveValue("Évènement");
  await label.press("Enter");
  await nextToEnd(page, "Créer une catégorie");
  await page.goto("/dashboard/categories");
  await expect(page.getByText("Manquante : Évènement.")).toBeVisible();
});

for (const [path, title, description, anchor, field] of [
  ["/dashboard/discipline-families", "Créer une famille", "Regrouper", "families", '[data-tour="families.form.name"] input'],
  ["/dashboard/origins", "Créer une origine", "Décrire", "origins", '[data-tour="origins.form.name"] input'],
  ["/dashboard/galleries", "Créer une galerie", "Réunir", "galleries", '[data-tour="galleries.form.title"] input'],
] as const) {
  test(`« ${title} » fait remplir le nom et ne crée rien`, async ({ page }) => {
    await launch(page, path, new RegExp(`${title}.*${description}`));
    await page.locator(`[data-tour="${anchor}.list.create"]`).click();
    const name = page.locator(field);
    await expect(name).toBeFocused();
    await name.fill("Exemple du tuto");
    // Entrée dans le champ : le formulaire ne part pas pendant le tuto.
    await name.press("Enter");
    await nextToEnd(page, title);
    await page.goto(path);
    await expect(page.getByText("Exemple du tuto")).toHaveCount(0);
  });
}
