import { expect, test } from "@playwright/test";
import { loginAs, trpcQuery } from "./helpers";
import { USERS } from "./data.mjs";

/** Le Dépôt commun est une racine de contenu : visible à la racine, et nulle part ailleurs. */
test("le Dépôt commun n'apparaît qu'à la racine", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  const children = async (path: string): Promise<string[]> => {
    const { result } = await trpcQuery(page.request, "storage.getTree", { path, depth: 1 });
    return ((result as { root: { children?: { path: string }[] } }).root.children ?? []).map((c) => c.path);
  };
  expect(await children("AKFC")).toContain("AKFC/common-repository");
  expect(await children("AKFC/e2e")).not.toContain("AKFC/common-repository");
});
