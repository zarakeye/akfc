import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation } from "./helpers";
import { USERS } from "./data.mjs";

/** Un SVG minimal, encodé comme le fait le formulaire des réglages (base64 du fichier). */
const svg = (body: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${body}</svg>`, "utf8").toString("base64");

test.describe("Logo du site", () => {
  test("un SVG qui contient un script est refusé à l'envoi", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: svg("<script>alert(1)</script>"),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(400);
    expect(error?.message).toContain("contenu actif");
  });

  test("un SVG qui charge une ressource externe est refusé", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: svg('<image href="https://exemple.test/x.png" width="10" height="10"/>'),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(400);
    expect(error?.message).toContain("ressource externe");
  });

  test("un lien javascript déguisé par des références de caractères est refusé", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: svg('<a href="&#106;ava&#x09;script:alert(1)"><rect width="10" height="10"/></a>'),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(400);
    expect(error?.message).toContain("contenu actif");
  });

  test("une ressource externe chargée par le style est refusée", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: svg('<rect width="10" height="10" style="fill:url(https://exemple.test/x.svg#g)"/>'),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(400);
    expect(error?.message).toContain("ressource externe");
  });

  test("un SVG ordinaire, dégradé local compris, est accepté", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: svg('<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/>'),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(200);
  });

  test("un fichier qui n'est pas un SVG est refusé", async ({ page }) => {
    await loginAs(page, USERS.admin.email);
    const { status, error } = await trpcMutation(page.request, "siteSettings.uploadLogo", {
      dataBase64: Buffer.from("pas une image", "utf8").toString("base64"),
      mimeType: "image/svg+xml",
    });
    expect(status).toBe(400);
    expect(error?.message).toContain("pas un SVG");
  });
});
