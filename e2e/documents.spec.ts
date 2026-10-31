import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { DOCUMENT_A, USERS } from "./data.mjs";

const fichier = `/api/media/member-document/${DOCUMENT_A.id}`;

test.describe("Documents des membres", () => {
  test("le destinataire voit le document et peut l'ouvrir", async ({ page }) => {
    await loginAs(page, USERS.membreA.email);
    await page.goto("/documents");
    await expect(page.getByText(DOCUMENT_A.title)).toBeVisible();

    const res = await page.request.get(fichier);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });

  test("un autre membre ne le voit pas, et son adresse répond 404", async ({ page }) => {
    await loginAs(page, USERS.membreB.email);
    await page.goto("/documents");
    await expect(page.getByText(DOCUMENT_A.title)).toHaveCount(0);

    // 404 et non 403 : le site ne confirme même pas que le document existe.
    const res = await page.request.get(fichier);
    expect(res.status()).toBe(404);
  });

  test("sans session, le fichier est refusé", async ({ request }) => {
    const res = await request.get(fichier);
    expect(res.status()).toBe(401);
  });
});
