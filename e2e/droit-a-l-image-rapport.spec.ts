import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { DISCIPLINES, TAG_PUBLIC_GALLERY, USERS } from "./data.mjs";

/**
 * « Droit à l'image » (centre de contrôle) : les médias montrés sur le site public qui demandent une
 * action. Un média refusé par une personne taguée y est « à retirer », avec l'endroit où il est
 * montré ; réglé depuis la fenêtre des tags, il quitte la liste. L'image de carte d'une discipline
 * suit la même règle que les contenus.
 */
const media = TAG_PUBLIC_GALLERY.mediaId;

test("le rapport liste les médias masqués avec leur emplacement, et l'image de carte est vérifiée", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  const setTags = (userIds: string[]) => trpcMutation(page.request, "mediaPeople.setTags", { mediaAssetId: media, userIds });
  expect((await setTags([USERS.tagRefus.id])).error).toBeUndefined();

  // L'image de carte d'une discipline : même règle que les contenus des pages.
  const all = await trpcQuery(page.request, "discipline.getAll", undefined);
  const discipline = (all.result as { id: number; slug: string | null }[]).find((d) => d.slug === DISCIPLINES.publiee.slug)!;
  const summary = await trpcMutation(page.request, "discipline.update", { id: discipline.id, summaryMediaId: media });
  expect(summary.error?.message).toContain("« tags-public.png » : une personne taguée a refusé « Site public »");

  await page.goto("/dashboard/droit-image");
  const tab = page.getByRole("tab", { name: /Masqués : à retirer/ });
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const row = page.getByRole("row").filter({ hasText: "tags-public.png" });
  await expect(row.getByRole("link", { name: `Galerie « ${TAG_PUBLIC_GALLERY.title} »` })).toBeVisible();

  // Réglé depuis la fenêtre des tags (la personne n'y est pas reconnaissable) : il quitte la liste.
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await row.getByRole("button", { name: "Taguer les personnes de tags-public.png" }).click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();
  const none = dialog.getByRole("checkbox", { name: /Aucune personne reconnaissable/ });
  await none.click();
  await expect(none).toBeChecked();
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await expect(row).toHaveCount(0);

  // Remise en état pour les autres tests.
  await trpcMutation(page.request, "mediaPeople.setNoRecognizable", { mediaAssetId: media, value: false });
  await setTags([]);
});
