import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation } from "./helpers";
import { TAG_PAGE_MEDIA, USERS } from "./data.mjs";

/**
 * Les contenus du constructeur de pages (ici une actualité, sur la page d'accueil) vont tous sur le
 * site public. Un média dont une personne taguée a refusé le site public est masqué à l'affichage,
 * et le contenu ne peut plus être enregistré avec lui. Non tagué : il passe.
 */
test("contenu de page : un refus d'une personne taguée masque l'image et bloque l'enregistrement", async ({ page }) => {
  const content = {
    version: 1,
    blocks: [{ id: "e2e-tags-galerie", type: "image-gallery", layout: "grid", items: [{ mediaId: TAG_PAGE_MEDIA.id }] }],
  };
  // La page d'accueil (rendu public, même pour un administrateur) montre les dernières actualités.
  // Les données de test la laissent « en construction » : seul un administrateur la voit.
  const homeShowsImage = async () => (await (await page.request.get("/")).text()).includes("tags-page");

  await loginAs(page, USERS.admin.email);
  const created = await trpcMutation(page.request, "post.create", {
    title: TAG_PAGE_MEDIA.post,
    content,
    publicationDate: new Date(Date.now() - 60_000).toISOString(),
  });
  expect(created.error, "non tagué : l'actualité s'enregistre").toBeUndefined();
  const postId = (created.result as { id: number }).id;
  expect(await homeShowsImage(), "non tagué : image en ligne").toBe(true);

  const tag = async (userIds: string[]) =>
    expect((await trpcMutation(page.request, "mediaPeople.setTags", { mediaAssetId: TAG_PAGE_MEDIA.id, userIds })).error).toBeUndefined();

  await tag([USERS.tagRefus.id]);
  expect(await homeShowsImage(), "refus : image masquée en ligne").toBe(false);
  const updated = await trpcMutation(page.request, "post.update", { id: postId, content });
  expect(updated.error?.message).toContain("« tags-page.png » : une personne taguée a refusé « Site public »");

  // Une absence de réponse ne bloque pas : le site doit vivre pendant la collecte des autorisations.
  await tag([USERS.membreA.id]);
  expect(await homeShowsImage()).toBe(true);
  expect((await trpcMutation(page.request, "post.update", { id: postId, content })).error).toBeUndefined();

  await trpcMutation(page.request, "post.delete", { id: postId });
});
