import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery, waitForEmail } from "./helpers";
import { PASSWORD, TAG_MEDIA, USERS } from "./data.mjs";

/**
 * Tags de personnes sur un média (par l'API) : le verdict de chaque usage se recalcule à partir du
 * droit à l'image ACTUEL des personnes taguées. Un refus l'emporte sur une absence de réponse ;
 * « aucune personne reconnaissable » met tout au vert ; la relance a un délai.
 */
type Verdicts = Record<string, string>;
const media = { mediaAssetId: TAG_MEDIA.id };

test("le verdict de chaque usage suit le droit à l'image des personnes taguées", async ({ page }) => {
  // Un majeur donne son accord en ligne pour le seul espace membres.
  await loginAs(page, USERS.tagAccord.email);
  const confirmed = await trpcMutation(page.request, "imageConsent.confirmMine", {
    usages: ["MEMBER_SPACE"],
    keepAfterLeave: false,
    password: PASSWORD,
  });
  expect(confirmed.error, "accord en ligne").toBeUndefined();

  // Les tags sont réservés aux administrateurs.
  expect((await trpcQuery(page.request, "mediaPeople.forMedia", media)).error?.data.code).toBe("FORBIDDEN");

  await loginAs(page, USERS.admin.email);
  const empty = await trpcQuery(page.request, "mediaPeople.forMedia", media);
  expect((empty.result as { verdicts: Verdicts }).verdicts.PUBLIC_SITE).toBe("UNTAGGED");

  const tag = async (userIds: string[]) => {
    const r = await trpcMutation(page.request, "mediaPeople.setTags", { ...media, userIds });
    expect(r.error, "pose des tags").toBeUndefined();
    return (r.result as { verdicts: Verdicts; people: unknown[] });
  };

  // L'accord en ligne : vert pour l'espace membres, refus pour le site public.
  let v = (await tag([USERS.tagAccord.id])).verdicts;
  expect([v.MEMBER_SPACE, v.PUBLIC_SITE]).toEqual(["OK", "REFUSED"]);

  // Un membre sans réponse : l'espace membres passe à « pas d'autorisation ».
  v = (await tag([USERS.tagAccord.id, USERS.membreA.id])).verdicts;
  expect([v.MEMBER_SPACE, v.PUBLIC_SITE]).toEqual(["MISSING", "REFUSED"]);

  // Un refus saisi par le club l'emporte sur l'absence de réponse.
  const three = await tag([USERS.tagAccord.id, USERS.membreA.id, USERS.tagRefus.id]);
  expect(three.verdicts.MEMBER_SPACE).toBe("REFUSED");
  expect(three.people).toHaveLength(3);

  // Le tableau d'une galerie lit les mêmes verdicts, plusieurs médias d'un coup.
  const batch = await trpcQuery(page.request, "mediaPeople.verdicts", { mediaAssetIds: [TAG_MEDIA.id] });
  expect(batch.result).toMatchObject({ [TAG_MEDIA.id]: { count: 3, verdicts: { MEMBER_SPACE: "REFUSED" } } });

  // « Aucune personne reconnaissable » : vert partout.
  const none = await trpcMutation(page.request, "mediaPeople.setNoRecognizable", { ...media, value: true });
  expect(Object.values((none.result as { verdicts: Verdicts }).verdicts)).toEqual(["OK", "OK", "OK", "OK", "OK"]);
  await trpcMutation(page.request, "mediaPeople.setNoRecognizable", { ...media, value: false });

  // Retirer des tags : seuls restent ceux cochés.
  expect((await tag([USERS.tagAccord.id])).people).toHaveLength(1);
});

test("la relance écrit au membre, ou au mineur s'il n'a rien demandé à son parent, puis attend 7 jours", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  const since = new Date();

  const adult = await trpcMutation(page.request, "mediaPeople.remind", { userId: USERS.membreA.id });
  expect(adult.result).toMatchObject({ channel: "MEMBER_EMAIL" });
  expect(await waitForEmail(page.request, USERS.membreA.email, since)).toContain("droit à l'image");

  const again = await trpcMutation(page.request, "mediaPeople.remind", { userId: USERS.membreA.id });
  expect(again.error?.data.code).toBe("TOO_MANY_REQUESTS");

  const minor = await trpcMutation(page.request, "mediaPeople.remind", { userId: USERS.tagMineur.id });
  expect(minor.result).toMatchObject({ channel: "MEMBER_EMAIL" });
  expect(await waitForEmail(page.request, USERS.tagMineur.email, since)).toContain("Envoyer à mon parent");
});
