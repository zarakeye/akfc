import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { DISCIPLINES, USERS } from "./data.mjs";

const publiee = `/disciplines/${DISCIPLINES.publiee.slug}`;
const brouillon = `/disciplines/${DISCIPLINES.brouillon.slug}`;

test.describe("Pages brouillon", () => {
  test("un visiteur voit une page publiée, et pas un brouillon", async ({ page }) => {
    const ok = await page.goto(publiee);
    expect(ok?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(DISCIPLINES.publiee.name.replace(/[()]/g, "\\$&")));

    // Le brouillon n'existe pas pour lui : 404, sans rien révéler de son contenu.
    const draft = await page.goto(brouillon);
    expect(draft?.status()).toBe(404);
    await expect(page.getByText(DISCIPLINES.brouillon.name)).toHaveCount(0);
  });

  test("un membre connecté non administrateur ne voit pas davantage le brouillon", async ({ page }) => {
    await loginAs(page, USERS.membreA.email);
    const draft = await page.goto(brouillon);
    expect(draft?.status()).toBe(404);
  });

  test("un administrateur prévisualise le brouillon, signalé, et jamais indexable", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const draft = await page.goto(brouillon);
    expect(draft?.status()).toBe(200);
    await expect(page.getByText("Page non publiée")).toBeVisible();
    // Même en aperçu, la page dit aux robots de ne pas l'indexer.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("le plan du site liste la page publiée, pas le brouillon", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(publiee);
    expect(sitemap).not.toContain(brouillon);
  });
});
