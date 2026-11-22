import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

/**
 * À la confirmation, la proposition locale reste affichée tant que la nouvelle image n'est pas
 * chargée : elle doit rester une image lisible, pas une URL déjà libérée.
 */
test("avatar : l'image d'attente reste lisible pendant le chargement de la nouvelle", async ({ page }) => {
  await loginAs(page, USERS.instructeur.email);
  // L'avatar servi par le site arrive en retard : on observe l'image d'attente.
  await page.route("**/api/media/public/avatar/**", async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    await route.continue();
  });
  await page.goto("/profil/edit");

  const base64 = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, 400, 400);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    const bytes = new Uint8Array(await blob!.arrayBuffer());
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  });
  await page.locator('input[accept="image/*,.heic,.heif"]').setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  });
  await page.getByRole("button", { name: "Recadrer" }).click();
  await page.getByRole("button", { name: "Valider" }).click();

  const waiting = page.locator('img[alt="Votre avatar"]');
  await expect(waiting).toBeVisible();
  await expect
    .poll(() => waiting.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
});
