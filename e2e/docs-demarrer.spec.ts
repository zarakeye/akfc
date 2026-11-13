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

test("chaque chapitre qui installe une dépendance s'affiche, avec sa commande", async ({ page }) => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const root = "apps/web/content/docs/dev";
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith(".mdx") ? [path.join(dir, d.name)] : [],
    );
  const pages = walk(root).filter((f) => fs.readFileSync(f, "utf8").includes("<Installer paquets="));
  expect(pages.length).toBeGreaterThan(20);
  for (const f of pages) {
    const slug = f.slice(root.length + 1, -".mdx".length);
    const res = await page.goto(`/docs/dev/${slug}`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.getByText(/À installer|Installé par/).first(), slug).toBeVisible();
  }
});
