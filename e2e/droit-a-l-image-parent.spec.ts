import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery, waitForEmail } from "./helpers";
import { MINOR, USERS } from "./data.mjs";

/**
 * Droit à l'image d'un mineur, validé en ligne par son parent référent (par l'API : les pages
 * viennent dans l'incrément suivant). Le parent n'a pas de compte : seul le lien reçu par e-mail
 * lui donne accès au formulaire, pré-rempli des souhaits du membre, qu'il peut changer.
 */
test("le parent reçoit les souhaits du mineur, les modifie et valide ; ses choix font foi", async ({ page, playwright, baseURL }) => {
  // 1. Le mineur, connecté, indique ses souhaits : le lien part à l'adresse saisie par le club.
  await loginAs(page, USERS.mineur.email);
  const since = new Date();
  const asked = await trpcMutation(page.request, "imageConsent.requestGuardian", {
    usages: ["MEMBER_SPACE", "SOCIAL_NETWORKS"],
    keepAfterLeave: true,
  });
  expect(asked.error, "demande du mineur").toBeUndefined();
  expect(asked.result).toMatchObject({ sentToMasked: "p•••@e2e.test" });

  const mail = await waitForEmail(page.request, MINOR.guardian.email, since);
  expect(mail).toContain(`Bonjour ${MINOR.guardian.name}`);
  const token = /autorisation-parent\/([A-Za-z0-9_-]{43})/.exec(mail)?.[1];
  expect(token, "lien personnel dans l'e-mail").toBeTruthy();

  // 2. Le parent, sans compte ni session : le formulaire pré-rempli des souhaits.
  const parent = await playwright.request.newContext({ baseURL });
  const shown = await trpcQuery(parent, "imageConsent.guardianRequest", { token });
  expect(shown.error).toBeUndefined();
  expect(shown.result).toMatchObject({
    memberName: `${USERS.mineur.firstName} ${MINOR.lastName}`,
    guardianName: MINOR.guardian.name,
    guardianRelation: MINOR.guardian.relation,
    usages: ["MEMBER_SPACE", "SOCIAL_NETWORKS"],
    keepAfterLeave: true,
  });
  expect(JSON.stringify(shown.result)).not.toContain("@");

  // Sans se déclarer représentant légal, rien n'est enregistré.
  const refused = await trpcMutation(parent, "imageConsent.confirmGuardian", {
    token, usages: ["MEMBER_SPACE"], keepAfterLeave: false, isLegalRepresentative: false,
  });
  expect(refused.error?.data.code).toBe("BAD_REQUEST");

  // 3. Le parent change : site public oui, réseaux non, retrait après le départ.
  const done = await trpcMutation(parent, "imageConsent.confirmGuardian", {
    token, usages: ["PUBLIC_SITE", "MEMBER_SPACE"], keepAfterLeave: false, isLegalRepresentative: true,
  });
  expect(done.error, "validation du parent").toBeUndefined();
  expect(done.result).toEqual({
    changes: [
      "Site public : souhaité Non → Oui",
      "Réseaux sociaux du club : souhaité Oui → Non",
      "Après le départ du club : souhaité Images conservées → Retrait sous un an",
    ],
  });

  // Le lien est grillé : une seconde validation, ou une simple lecture, échoue.
  const again = await trpcMutation(parent, "imageConsent.confirmGuardian", {
    token, usages: [], keepAfterLeave: null, isLegalRepresentative: true,
  });
  expect(again.error?.data.code).toBe("NOT_FOUND");
  expect((await trpcQuery(parent, "imageConsent.guardianRequest", { token })).error?.data.code).toBe("NOT_FOUND");
  await parent.dispose();

  // 4. Le membre est prévenu, avec ce que son parent a changé.
  const toMember = await waitForEmail(page.request, USERS.mineur.email, since);
  expect(toMember).toContain(`${MINOR.guardian.name} a validé ton autorisation`);
  expect(toMember).toContain("Réseaux sociaux du club : souhaité Oui → Non");

  // 5. La version enregistrée : celle du parent, souhaits gardés à côté.
  await loginAs(page, USERS.admin.email);
  const forms = await trpcQuery(page.request, "imageConsent.listForUser", { userId: USERS.mineur.id });
  const [latest] = forms.result as Array<Record<string, unknown>>;
  expect(latest).toMatchObject({
    source: "ONLINE_GUARDIAN",
    signerName: MINOR.guardian.name,
    signerQuality: MINOR.guardian.relation,
    usages: ["MEMBER_SPACE", "PUBLIC_SITE"],
    keepAfterLeave: false,
    memberWishes: { usages: ["MEMBER_SPACE", "SOCIAL_NETWORKS"], keepAfterLeave: true },
  });
});
