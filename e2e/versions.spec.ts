import { expect, test, type APIRequestContext } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { ATELIER, TINY_PDF, USERS } from "./data.mjs";

/*
 * Versions d'un fichier, par l'API : remplacer un fichier en garde l'ancien contenu ; un éditeur du
 * groupe le restaure, un lecteur le voit sans pouvoir le restaurer, un non-membre ne voit rien ;
 * seul un admin efface une version.
 */

type Versions = {
  mediaAssetId: string;
  fullPath: string;
  current: { bytes: number; authorName: string | null };
  versions: { id: string; bytes: number; authorName: string | null }[];
  canRestore: boolean;
  canDelete: boolean;
};

const V1 = Buffer.from(TINY_PDF);
const V2 = Buffer.from(`${TINY_PDF}% deuxième version, plus longue\n`);

/** Dépôt dans l'espace du groupe, comme le navigateur : demande signée, envoi, enregistrement. */
async function upload(request: APIRequestContext, body: Buffer, allowOverwrite = false) {
  const destination = { kind: "group", groupId: ATELIER.id };
  const auth = await trpcMutation(request, "storage.createR2Upload", {
    destination,
    originalFileName: "programme.pdf",
    mimeType: "application/pdf",
    maxBytes: body.length,
    ...(allowOverwrite ? { allowOverwrite: true } : {}),
  });
  if (auth.status !== 200) return auth;
  const { uploadUrl, path } = auth.result as { uploadUrl: string; path: string };
  const put = await request.put(uploadUrl, { data: body, headers: { "Content-Type": "application/pdf" } });
  expect(put.ok()).toBe(true);
  return trpcMutation(request, "storage.registerR2Upload", {
    path,
    expectedBytes: body.length,
    expectedMimeType: "application/pdf",
    destination,
    originalFileName: "programme.pdf",
  });
}

test.describe.serial("Versions des fichiers", () => {
  let fullPath = "";

  test("remplacer un fichier garde l'ancien contenu en version", async ({ page }) => {
    await loginAs(page, USERS.membreA.email);
    const first = await upload(page.request, V1);
    expect(first.status).toBe(200);
    fullPath = (first.result as { path: string }).path;

    // Sans confirmation, pas d'écrasement.
    const refused = await upload(page.request, V2);
    expect(refused.status).toBe(409);

    const second = await upload(page.request, V2, true);
    expect(second.status).toBe(200);

    const { result } = await trpcQuery(page.request, "fileVersion.list", { fullPath });
    const v = result as Versions;
    expect(v.current.bytes).toBe(V2.length);
    expect(v.versions).toHaveLength(1);
    expect(v.versions[0].bytes).toBe(V1.length);
    expect(v.versions[0].authorName).toBe(USERS.membreA.firstName);
    expect(v.canRestore).toBe(true);
    expect(v.canDelete).toBe(false);

    // Le lien de téléchargement rend l'ancien contenu.
    const link = await trpcMutation(page.request, "fileVersion.downloadUrl", { versionId: v.versions[0].id });
    const res = await page.request.get((link.result as { url: string }).url);
    expect(Buffer.from(await res.body()).equals(V1)).toBe(true);
  });

  test("un lecteur voit les versions sans les restaurer, un non-membre ne les voit pas", async ({ page }) => {
    await loginAs(page, USERS.membreB.email);
    const { status, result } = await trpcQuery(page.request, "fileVersion.list", { fullPath });
    expect(status).toBe(200);
    const v = result as Versions;
    expect(v.canRestore).toBe(false);
    const restore = await trpcMutation(page.request, "fileVersion.restore", { versionId: v.versions[0].id });
    expect(restore.status).toBe(403);

    await page.context().clearCookies();
    await loginAs(page, USERS.limite.email);
    expect((await trpcQuery(page.request, "fileVersion.list", { fullPath })).status).toBe(403);
  });

  test("restaurer échange la version et le contenu actuel ; seul un admin efface", async ({ page }) => {
    await loginAs(page, USERS.membreA.email);
    const before = (await trpcQuery(page.request, "fileVersion.list", { fullPath })).result as Versions;
    const restored = await trpcMutation(page.request, "fileVersion.restore", { versionId: before.versions[0].id });
    expect(restored.status).toBe(200);

    const after = (await trpcQuery(page.request, "fileVersion.list", { fullPath })).result as Versions;
    expect(after.current.bytes).toBe(V1.length);
    expect(after.versions.map((x) => x.bytes)).toEqual([V2.length]);

    expect((await trpcMutation(page.request, "fileVersion.delete", { versionId: after.versions[0].id })).status).toBe(403);

    await page.context().clearCookies();
    await loginAs(page, USERS.admin.email);
    expect((await trpcMutation(page.request, "fileVersion.delete", { versionId: after.versions[0].id })).status).toBe(200);
    const empty = (await trpcQuery(page.request, "fileVersion.list", { fullPath })).result as Versions;
    expect(empty.versions).toHaveLength(0);
    expect(empty.canDelete).toBe(true);
  });
});
