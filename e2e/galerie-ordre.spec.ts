import { expect, test } from "@playwright/test";

import { DISCIPLINES } from "./data.mjs";

/**
 * La galerie publique range ses disciplines comme le menu « Nos disciplines » : la famille d'abord
 * (son rang, réglé dans le tableau de bord), puis le nom. Elle suivait une liste de noms écrite
 * dans le code : une discipline renommée ou nouvelle tombait en fin de liste. Les données de test
 * placent « Arnis (e2e) », première dans l'alphabet, dans la famille de rang 2.
 */
test("la page Galeries range les disciplines par famille, comme le menu", async ({ page }) => {
  await page.goto("/gallery");
  // Les boutons de premier niveau (une discipline, ou « Divers ») : enfants directs d'une section.
  const disciplines = page.locator("section > button").filter({ hasText: "(e2e)" });
  await expect(disciplines).toHaveText([
    new RegExp(escape(DISCIPLINES.publiee.name)),
    new RegExp(escape(DISCIPLINES.seconde.name)),
  ]);
});

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
