import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";
import { TAG_MEDIA, USERS } from "./data.mjs";

/**
 * En mode sélection, entrer dans un dossier coché garde la sélection : un clic sur une photo
 * de ce dossier l'exclut (« ce dossier, sauf cette photo »).
 */
test("cocher un dossier, y entrer, exclure une photo", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/library?path=AKFC");
  const folder = page.locator('div.aspect-square[title="e2e"]');
  await folder.hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await expect(page.getByText("1 sélectionné", { exact: true })).toBeVisible();

  await folder.dblclick();
  const photo = page.locator(`div.aspect-square[title="${TAG_MEDIA.key.split("/").pop()}"]`);
  await expect(photo.locator('input[type="checkbox"]')).toBeChecked();
  await photo.click();
  await expect(photo.locator('input[type="checkbox"]')).not.toBeChecked();
  await expect(page.getByText("1 sélectionné sauf 1", { exact: true })).toBeVisible();
});
