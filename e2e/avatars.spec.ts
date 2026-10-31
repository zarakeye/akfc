import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation } from "./helpers";
import { USERS } from "./data.mjs";

/** Un contenu d'une page, avec un bloc média-texte qui montre l'avatar de `userId`. */
const pageWithAvatar = (userId: string) => ({
  slug: "e2e-avatar",
  title: "Page de test e2e",
  content: { version: 1, blocks: [{ id: "bloc-1", type: "media-text", media: { kind: "avatar", userId } }] },
});

test.describe("Avatars", () => {
  test("un administrateur ne peut pas poser l'avatar d'un autre membre dans une page", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "sitePage.save", pageWithAvatar(USERS.membreA.id));
    expect(status).toBe(403);
    expect(error?.data.code).toBe("FORBIDDEN");
    expect(error?.message).toContain("votre propre avatar");
  });

  test("il peut poser le sien", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status } = await trpcMutation(page.request, "sitePage.save", pageWithAvatar(USERS.admin.id));
    expect(status).toBe(200);
  });
});
