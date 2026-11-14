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
  test.setTimeout(180_000);
  // Comme la garde check-doc-installs : un <Installer> cité dans du code n'en est pas un.
  const sansCode = (t: string) => t.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const pages = walk(root).filter((f) => sansCode(fs.readFileSync(f, "utf8")).includes("<Installer paquets="));
  expect(pages.length).toBeGreaterThan(20);
  for (const f of pages) {
    const slug = f.slice(root.length + 1, -".mdx".length);
    const res = await page.goto(`/docs/dev/${slug}`);
    expect(res?.status(), slug).toBe(200);
    await expect(page.getByText(/À installer|Installé par/).first(), slug).toBeVisible();
  }
});

test("la 2.1 montre chaque package.json et les seize scripts de la racine", async ({ page }) => {
  const res = await page.goto("/docs/dev/configuration/package-json-et-monorepo");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("tree", { name: "Arborescence de akfc/" })).toContainText("finder-core");
  for (const titre of ["packages/finder-core/package.json, en entier", "packages/config/package.json, en entier", "apps/web/package.json, en entier", "package.json (la racine), en entier"]) {
    await expect(page.getByText(titre), titre).toBeVisible();
  }
  for (const script of ["dev:infra:stop", "db:seed:dev", "docs:procedures", "e2e:report"]) {
    await expect(page.getByRole("cell", { name: script, exact: true }), script).toBeVisible();
  }
});

test("la partie Docker s'affiche, schémas compris, et la 2.3 y renvoie", async ({ page }) => {
  for (const slug of ["pourquoi-docker", "l-infrastructure-locale", "l-image-docker", "une-infrastructure-serveur"]) {
    const res = await page.goto(`/docs/dev/docker/${slug}`);
    expect(res?.status(), slug).toBe(200);
  }
  await page.goto("/docs/dev/docker/l-infrastructure-locale");
  const local = page.getByRole("figure", { name: "Schéma : La machine du développeur" });
  await expect(local).toContainText("akfc-dev_akfc-dev-pgdata");
  await expect(local).toContainText("pnpm dev");
  await page.goto("/docs/dev/docker/une-infrastructure-serveur");
  await expect(page.getByRole("figure", { name: "Schéma : Le serveur" })).toContainText("Réseau internal");
  await expect(page.getByRole("tree", { name: "Arborescence de infra/" })).toContainText("Caddyfile");
  await page.goto("/docs/dev/configuration/next-config");
  await expect(page.getByRole("link", { name: /L’image Docker · Ce que next\.config\.ts prépare pour l’image/ })).toBeVisible();
});

test("plus aucune arborescence en texte : le routage et le modèle passent par <Arbre>", async ({ page }) => {
  await page.goto("/docs/dev/front/routage");
  await expect(page.getByRole("tree", { name: "Arborescence de apps/web/src/" })).toContainText("dashboard");
  await page.goto("/docs/dev/donnees/pourquoi-le-modele");
  await expect(page.getByRole("tree", { name: "Arborescence de akfc/" })).toContainText("schema.prisma");
});

test("le routage détaille dossiers, fichiers réservés (absents compris) et exports d'une page", async ({ page }) => {
  await page.goto("/docs/dev/front/routage");
  for (const cell of ["[...path]", "not-found.tsx", "loading.tsx", "generateMetadata", "favicon.ico"]) {
    await expect(page.getByRole("cell", { name: cell, exact: true }), cell).toBeVisible();
  }
  await expect(page.getByText("{ path: [\"AKFC\", \"courses\", \"salut.jpg\"] }", { exact: false })).toBeVisible();
});
