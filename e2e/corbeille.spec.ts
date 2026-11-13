import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { ATELIER, TRASHED_FOLDER, TRASHED_IN_GROUP, USERS } from "./data.mjs";

type SpaceBinItem = { id: string; groupName: string; trashedByName: string | null; trashedAt: string; purgeAt: string };

const DAY_MS = 24 * 3600 * 1000;

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

  test("la corbeille annonce la date de suppression définitive et l'auteur", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { result } = await trpcQuery(page.request, "trash.listBin", { appRoot: "AKFC", limit: 100 });
    const items = (result as { items: (SpaceBinItem & { id: string })[] }).items;
    const entry = items.find((e) => e.id === TRASHED_IN_GROUP.id);
    expect(entry?.trashedByName).toBe(USERS.admin.firstName);
    // 90 jours par défaut.
    expect(Date.parse(entry!.purgeAt) - Date.parse(entry!.trashedAt)).toBe(90 * DAY_MS);
  });

  test("un lecteur du groupe ne restaure pas, un autre éditeur que l'auteur le peut", async ({ page }) => {
    // Le lecteur ne voit rien de l'espace dans sa corbeille, et la restauration lui est refusée.
    await loginAs(page, USERS.membreB.email);
    const asViewer = await trpcQuery(page.request, "trash.listSpacesBin", undefined);
    expect(asViewer.status).toBe(200);
    expect((asViewer.result as SpaceBinItem[]).map((e) => e.id)).not.toContain(TRASHED_IN_GROUP.id);
    const refused = await trpcMutation(page.request, "trash.restoreFromBin", { appRoot: "AKFC", ids: [TRASHED_IN_GROUP.id] });
    expect(refused.status).toBe(403);

    // Hors des espaces de groupe, un membre ne restaure que ce qu'il a jeté lui-même.
    await page.context().clearCookies();
    await loginAs(page, USERS.membreA.email);
    const elsewhere = await trpcMutation(page.request, "trash.restoreFromBin", { appRoot: "AKFC", ids: [TRASHED_FOLDER.id] });
    expect(elsewhere.status).toBe(403);

    // L'éditeur voit l'élément jeté par l'admin dans l'espace du groupe, et le restaure.
    const asEditor = await trpcQuery(page.request, "trash.listSpacesBin", undefined);
    const entry = (asEditor.result as SpaceBinItem[]).find((e) => e.id === TRASHED_IN_GROUP.id);
    expect(entry?.groupName).toBe(ATELIER.name);
    expect(entry?.trashedByName).toBe(USERS.admin.firstName);
    const restored = await trpcMutation(page.request, "trash.restoreFromBin", { appRoot: "AKFC", ids: [TRASHED_IN_GROUP.id] });
    expect(restored.status).toBe(200);
    const after = await trpcQuery(page.request, "trash.listSpacesBin", undefined);
    expect((after.result as SpaceBinItem[]).map((e) => e.id)).not.toContain(TRASHED_IN_GROUP.id);
  });
});
