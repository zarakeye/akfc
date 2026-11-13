import { expect, test } from "@playwright/test";

/*
 * Les pages de la partie « Démarrer » s'affichent, avec leurs arborescences (<Arbre>) et leurs
 * commandes d'installation (<Installer>). Une page MDX n'est compilée qu'à la demande : seul un
 * affichage réel montre qu'un composant reçoit bien ses attributs.
 */
test("les arborescences de « Démarrer » s'affichent, branches comprises", async ({ page }) => {
  await page.goto("/docs/dev/demarrer/avant-de-commencer");
  const carte = page.getByRole("tree", { name: "Arborescence de akfc/" });
  await expect(carte).toContainText("proxy.ts");
  await expect(carte).toContainText("├── ");
  // La profondeur est respectée : backend est DANS packages (une branche │ devant).
  await expect(carte).toContainText("│ ├── backend");

  await page.goto("/docs/dev/demarrer/creer-le-projet");
  await expect(page.getByRole("tree", { name: "Arborescence de web/" })).toContainText("pnpm-workspace.yaml");
  await expect(page.getByText("pnpm add -w -D prisma typescript")).toBeVisible();
  await expect(page.getByText("Installé par create-next-app").first()).toBeVisible();

  await page.goto("/docs/dev/demarrer/organiser-le-depot");
  await expect(page.getByRole("tree", { name: "Arborescence de akfc/" })).toContainText("tsconfig.base.json");
});
