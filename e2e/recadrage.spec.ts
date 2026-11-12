import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { DISCIPLINES, USERS } from "./data.mjs";
import { outputSide, renameForType } from "../packages/contracts/src/media/cropOutput";

test.describe("Recadrage : le fichier produit", () => {
  test("rend la résolution de la photo, sans l'agrandir ni dépasser le plafond", () => {
    // Photo 4000 × 3000 dans un établi de 500 px : un pixel d'établi vaut 8 pixels de photo.
    const base = { imageWidth: 4000, imageHeight: 3000, workspaceSize: 500 };
    expect(outputSide({ ...base, gridWidth: 200, gridHeight: 200, zoom: 1 })).toBe(1600);
    // Zoomer resserre le cadre sur la photo : moins de pixels réels.
    expect(outputSide({ ...base, gridWidth: 200, gridHeight: 200, zoom: 2 })).toBe(800);
    // Plafond.
    expect(outputSide({ ...base, gridWidth: 500, gridHeight: 500, zoom: 1 })).toBe(4000);
    expect(outputSide({ ...base, gridWidth: 500, gridHeight: 500, zoom: 1, maxSide: 1024 })).toBe(1024);
  });

  test("le nom suit le format obtenu", () => {
    expect(renameForType("Stage 2026.JPG", "image/webp")).toBe("Stage 2026.webp");
    expect(renameForType("photo.jpeg", "image/avif")).toBe("photo.avif");
    expect(renameForType("scan.png", "image/jpeg")).toBe("scan.jpg");
    expect(renameForType("sans-extension", "image/png")).toBe("sans-extension.png");
  });

  test("une photo JPEG recadrée dans la bibliothèque est acceptée par le serveur", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    await page.goto("/dashboard/library/add");

    // Une vraie photo JPEG, fabriquée par le navigateur.
    const base64 = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, 0, 1200, 900);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(300, 200, 600, 500);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
      const bytes = new Uint8Array(await blob!.arrayBuffer());
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin);
    });

    await page.locator("select").first().selectOption({ label: DISCIPLINES.publiee.name });
    await page.locator('input[type="file"]').last().setInputFiles({
      name: `recadrage-e2e-${Date.now()}.jpg`,
      mimeType: "image/jpeg",
      buffer: Buffer.from(base64, "base64"),
    });

    // Ouvrir le recadrage depuis la vignette, puis recadrer.
    await page.locator("form img").first().click();
    await page.getByRole("button", { name: "Recadrer" }).click();
    await expect(page.getByRole("button", { name: "Recadrer" })).toHaveCount(0);

    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("✅ OK")).toBeVisible({ timeout: 30_000 });
  });

  test("sur un téléphone, le cadre de départ de la galerie est centré dans l'établi", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, USERS.admin.email);
    await page.goto("/dashboard/library/add");

    const base64 = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      canvas.getContext("2d")!.fillRect(0, 0, 800, 600);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
      const bytes = new Uint8Array(await blob!.arrayBuffer());
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin);
    });
    await page.locator("select").first().selectOption({ label: DISCIPLINES.publiee.name });
    await page.locator('input[type="file"]').last().setInputFiles({
      name: `cadre-e2e-${Date.now()}.jpg`,
      mimeType: "image/jpeg",
      buffer: Buffer.from(base64, "base64"),
    });
    await page.locator("form img").first().click();

    // L'établi rétrécit avec l'écran ; le cadre doit rester un carré centré, à 40 % de sa largeur.
    const workspace = page.locator(".bg-checkerboard.aspect-square").first();
    const frame = workspace.locator(".cursor-move.touch-none");
    await expect(frame).toBeVisible();
    const w = (await workspace.boundingBox())!;
    const f = (await frame.boundingBox())!;
    expect(w.width).toBeLessThan(500);
    expect(Math.abs(f.width - w.width * 0.4)).toBeLessThan(2);
    expect(Math.abs(f.x - w.x - (w.width - f.width) / 2)).toBeLessThan(2);
    expect(Math.abs(f.y - w.y - (w.height - f.height) / 2)).toBeLessThan(2);
  });
});
