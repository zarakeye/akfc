import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { TAG_PAGE_MEDIA, TAG_PUBLIC_GALLERY, USERS } from "./data.mjs";
import { TAG_DIGEST_DELAY_MS, TAG_DIGEST_MIN_GAP_MS, dueTagDigests } from "../packages/contracts/src/legal/mediaPeople";

/**
 * « Où j'apparais » : un membre voit les médias où le club l'a identifié (son droit d'accès), même
 * non publiés, et personne d'autre ne les ouvre par ce biais. Il peut refuser un média précis :
 * rouge partout pour celui-là, quelle que soit son autorisation générale. Et la règle des e-mails :
 * une heure après le premier tag, au plus un par jour.
 */
test("la règle des e-mails regroupe une séance de tags et n'écrit pas plus d'une fois par jour", () => {
  const now = new Date("2026-11-08T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const tags = [
    // A : deux tags de la même séance, la plus ancienne il y a plus d'une heure → un e-mail, 2 médias.
    { userId: "A", createdAt: ago(TAG_DIGEST_DELAY_MS + 1), notifiedAt: null },
    { userId: "A", createdAt: ago(10 * 60_000), notifiedAt: null },
    // B : tagué il y a dix minutes → on attend la fin de la séance.
    { userId: "B", createdAt: ago(10 * 60_000), notifiedAt: null },
    // C : déjà prévenu ce matin → demain.
    { userId: "C", createdAt: ago(TAG_DIGEST_DELAY_MS * 2), notifiedAt: null },
    { userId: "C", createdAt: ago(TAG_DIGEST_MIN_GAP_MS), notifiedAt: ago(TAG_DIGEST_MIN_GAP_MS - 60_000) },
    // D : tout est déjà annoncé.
    { userId: "D", createdAt: ago(TAG_DIGEST_MIN_GAP_MS * 3), notifiedAt: ago(TAG_DIGEST_MIN_GAP_MS * 2) },
  ];
  expect([...dueTagDigests(tags, now)]).toEqual([["A", 2]]);
});

test("un membre voit les médias où il est identifié, lui seul les ouvre, et peut en refuser un", async ({ page, browser }) => {
  await loginAs(page, USERS.admin.email);
  const tag = (userIds: string[]) => trpcMutation(page.request, "mediaPeople.setTags", { mediaAssetId: TAG_PAGE_MEDIA.id, userIds });
  expect((await tag([USERS.tagAccord.id])).error).toBeUndefined();

  // Le membre tagué : son droit à l'image, puis le média.
  await loginAs(page, USERS.tagAccord.email);
  const mine = await trpcQuery(page.request, "mediaPeople.mine", undefined);
  const items = (mine.result as { items: { mediaAssetId: string; thumbUrl: string }[] }).items;
  const item = items.find((i) => i.mediaAssetId === TAG_PAGE_MEDIA.id)!;
  expect(item, "le média où il est tagué").toBeTruthy();
  await page.goto("/profil/ou-j-apparais");
  await expect(page.getByRole("heading", { name: "Où j'apparais" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Mon droit à l'image" })).toBeVisible();
  await expect(page.locator(`img[src="${item.thumbUrl}"]`)).toBeVisible();
  const own = await page.request.get(item.thumbUrl, { maxRedirects: 0 });
  expect(own.status(), "il ouvre le fichier").not.toBe(404);

  // Il refuse cette photo-là : elle passe au rouge partout, son autorisation générale n'y change rien.
  const card = page.getByRole("listitem").filter({ has: page.locator(`img[src="${item.thumbUrl}"]`) });
  await expect(async () => {
    await card.getByRole("button", { name: "Je ne souhaite pas que cette photo soit diffusée" }).click({ timeout: 2_000 });
    await expect(card.getByText("Vous avez refusé cette photo")).toBeVisible({ timeout: 2_000 });
  }).toPass();
  const refusedFor = async () => {
    const admin = await browser.newPage();
    await loginAs(admin, USERS.admin.email);
    const r = await trpcQuery(admin.request, "mediaPeople.forMedia", { mediaAssetId: TAG_PAGE_MEDIA.id });
    await admin.close();
    return r.result as { verdicts: Record<string, string>; people: { refusedThisMedia: boolean }[] };
  };
  const refused = await refusedFor();
  expect(refused.people[0].refusedThisMedia).toBe(true);
  expect(Object.values(refused.verdicts)).toEqual(["REFUSED", "REFUSED", "REFUSED", "REFUSED", "REFUSED"]);

  // Il revient sur son refus : son autorisation générale s'applique de nouveau (ici, pas encore de réponse).
  await card.getByRole("button", { name: "Annuler mon refus pour cette photo" }).click();
  await expect(card.getByRole("button", { name: "Je ne souhaite pas que cette photo soit diffusée" })).toBeVisible();
  expect((await refusedFor()).verdicts.PUBLIC_SITE).not.toBe("REFUSED");

  // On ne refuse qu'un média où l'on est identifié.
  const foreign = await trpcMutation(page.request, "mediaPeople.setMyRefusal", { mediaAssetId: TAG_PUBLIC_GALLERY.mediaId, refused: true });
  expect(foreign.error?.data.code).toBe("NOT_FOUND");

  // Un autre membre : ni dans sa liste, ni par l'adresse du fichier.
  const other = await browser.newPage();
  await loginAs(other, USERS.membreA.email);
  expect(((await trpcQuery(other.request, "mediaPeople.mine", undefined)).result as { items: unknown[] }).items).toEqual([]);
  expect((await other.request.get(item.thumbUrl, { maxRedirects: 0 })).status()).toBe(404);
  await other.close();

  // Remise en état pour les autres tests.
  await loginAs(page, USERS.admin.email);
  await tag([]);
});
