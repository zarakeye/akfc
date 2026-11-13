import { expect, test, type Page } from "@playwright/test";

import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { ATELIER, TINY_PDF, TRASHED_FOLDER, USERS } from "./data.mjs";

/*
 * Les deux tutos de la corbeille et des versions. Ils montrent « Restaurer » sans rien restaurer.
 */
const bubble = (page: Page, title: string, n: number, total: number) =>
  page.getByRole("dialog", { name: `${title} — étape ${n} sur ${total}` });
const nextButton = (page: Page) => page.getByRole("button", { name: "Suivant", exact: true });

async function launch(page: Page, path: string, title: RegExp): Promise<void> {
  await page.goto(path);
  await page.getByRole("button", { name: "Tutoriels de cette page" }).click();
  await page.getByRole("button", { name: title }).click();
}

test("« Restaurer un élément de la corbeille » montre « Restaurer » sans rien restaurer", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await launch(page, "/dashboard/library", /Restaurer un élément de la corbeille/);
  const t = "Restaurer un élément de la corbeille";

  await expect(bubble(page, t, 1, 5)).toBeVisible();
  await page.locator('[data-tour="finder.bin"]').click();
  await expect(bubble(page, t, 2, 5)).toBeVisible();
  await expect(page.locator('[data-tour="bin.view"]')).toContainText(TRASHED_FOLDER.displayName);
  await nextButton(page).click();

  await expect(bubble(page, t, 3, 5)).toBeVisible();
  await page.locator('[data-tour="bin.view"]').getByText(TRASHED_FOLDER.displayName).first().click();
  await expect(bubble(page, t, 4, 5)).toBeVisible();
  // Le bouton est montré, pas cliquable pendant l'étape : rien n'est restauré.
  await page.locator('[data-tour="bin.restore"]').click({ force: true });
  await nextButton(page).click();
  await expect(bubble(page, t, 5, 5)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();

  const { result } = await trpcQuery(page.request, "trash.listBin", { appRoot: "AKFC", limit: 100 });
  expect((result as { items: { id: string }[] }).items.map((e) => e.id)).toContain(TRASHED_FOLDER.id);
});

test("« Retrouver une version précédente » ouvre le panneau des versions", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  // Un fichier remplacé une fois dans l'espace du groupe : deux versions.
  const destination = { kind: "group", groupId: ATELIER.id };
  for (const [i, body] of [Buffer.from(TINY_PDF), Buffer.from(`${TINY_PDF}% v2\n`)].entries()) {
    const auth = await trpcMutation(page.request, "storage.createR2Upload", {
      destination,
      originalFileName: "tuto-versions.pdf",
      mimeType: "application/pdf",
      maxBytes: body.length,
      ...(i > 0 ? { allowOverwrite: true } : {}),
    });
    const { uploadUrl, path } = auth.result as { uploadUrl: string; path: string };
    expect((await page.request.put(uploadUrl, { data: body, headers: { "Content-Type": "application/pdf" } })).ok()).toBe(true);
    const reg = await trpcMutation(page.request, "storage.registerR2Upload", {
      path,
      expectedBytes: body.length,
      expectedMimeType: "application/pdf",
      destination,
      originalFileName: "tuto-versions.pdf",
    });
    expect(reg.status).toBe(200);
  }

  await launch(page, "/mes-espaces", /Retrouver une version précédente/);
  const t = "Retrouver une version précédente";
  await expect(bubble(page, t, 1, 6)).toBeVisible();
  await page.getByTitle(ATELIER.name, { exact: true }).click();
  await expect(bubble(page, t, 2, 6)).toBeVisible();
  await page.getByTitle("tuto-versions.pdf", { exact: true }).first().click();
  await expect(bubble(page, t, 3, 6)).toBeVisible();
  await nextButton(page).click();
  await expect(bubble(page, t, 4, 6)).toBeVisible();
  await page.locator('[data-tour="finder.versions"]').click();
  await expect(bubble(page, t, 5, 6)).toBeVisible();
  await expect(page.getByTestId("versions-panel")).toContainText("Version actuelle");
  await nextButton(page).click();
  await expect(bubble(page, t, 6, 6)).toBeVisible();
  await page.getByRole("button", { name: "Terminer" }).click();
});
