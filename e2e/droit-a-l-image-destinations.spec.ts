import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { TAG_PUBLIC_GALLERY, USERS } from "./data.mjs";

/**
 * La destination d'une galerie décide de ce que le droit à l'image bloque. Galerie publique : un
 * REFUS d'une personne taguée empêche d'enregistrer le média et le masque en ligne ; une ABSENCE de
 * réponse avertit seulement (le site doit vivre pendant que les autorisations se recueillent).
 */
const media = TAG_PUBLIC_GALLERY.mediaId;

test("galerie publique : un refus bloque et masque, une absence de réponse avertit seulement", async ({ page, request }) => {
  type PublicGallery = { slug: string; items: { mediaAssetId: string }[] };
  // `request` : un visiteur anonyme (sans les cookies de la page).
  const online = async (): Promise<string[]> => {
    const r = await trpcQuery(request, "gallery.getPublicIndex", undefined);
    const g = (r.result as PublicGallery[]).find((x) => x.slug === TAG_PUBLIC_GALLERY.slug);
    return (g?.items ?? []).map((i) => i.mediaAssetId);
  };
  expect(await online(), "pas encore tagué : en ligne").toContain(media);

  await loginAs(page, USERS.admin.email);
  const all = await trpcQuery(page.request, "gallery.getAll", undefined);
  const galleryId = (all.result as { id: number; slug: string }[]).find((g) => g.slug === TAG_PUBLIC_GALLERY.slug)!.id;
  const tag = async (userIds: string[]) =>
    expect((await trpcMutation(page.request, "mediaPeople.setTags", { mediaAssetId: media, userIds })).error).toBeUndefined();
  const save = () => trpcMutation(page.request, "gallery.setItems", { galleryId, mediaAssetIds: [media] });

  // Un membre sans réponse : on publie quand même.
  await tag([USERS.membreA.id]);
  expect((await save()).error, "absence de réponse : enregistrement accepté").toBeUndefined();
  expect(await online()).toContain(media);

  // Un refus saisi par le club : enregistrement refusé, média masqué en ligne (la galerie, elle, le garde).
  await tag([USERS.membreA.id, USERS.tagRefus.id]);
  expect((await save()).error?.message).toContain("Média n° 1 : une personne taguée a refusé « Site public »");
  expect(await online(), "refus : masqué en ligne").not.toContain(media);

  // Le tableau le dit avant même d'enregistrer : destination, bandeau rouge, ligne en rouge.
  await page.goto(`/dashboard/galleries/${galleryId}/edit`);
  const banner = page.getByTestId("rights-banner");
  await expect(banner).toContainText("Destination : Site public");
  await expect(banner.getByRole("alert")).toContainText("Média n° 1 : une personne taguée a refusé « Site public »");

  // Le tag retiré, le média revient en ligne.
  await tag([USERS.membreA.id]);
  expect(await online()).toContain(media);
});
