import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { TRASHED_FOLDER, USERS } from "./data.mjs";

test.describe("Corbeille", () => {
  test("un fichier d'un dossier jeté ne s'efface pas seul : le dossier reste entier", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "trash.purge", {
      appRoot: "AKFC",
      paths: [TRASHED_FOLDER.fileKey],
    });
    expect(status).toBe(400);
    expect(error?.message).toContain(TRASHED_FOLDER.displayName);

    // Toujours dans la corbeille.
    const { result } = await trpcQuery(page.request, "trash.listBin", { appRoot: "AKFC", limit: 100 });
    const ids = ((result as { items?: { id: string }[] } | undefined)?.items ?? []).map((e) => e.id);
    expect(ids).toContain(TRASHED_FOLDER.id);
  });

  test("un membre ne voit pas la corbeille", async ({ page }) => {
    await loginAs(page, USERS.membreA.email);
    const { status } = await trpcQuery(page.request, "trash.listBin", { appRoot: "AKFC", limit: 100 });
    expect(status).toBe(403);
  });
});
