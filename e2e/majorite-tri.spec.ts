import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers";
import { USERS } from "./data.mjs";

// Le tri de la majorité des comptes existants : seuls les comptes cochés passent en majeurs.

test("le tri passe en majeurs les comptes cochés, et eux seuls", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  await page.goto("/dashboard/users");
  const panneau = page.getByRole("region", { name: "Majorité à renseigner" });
  await expect(panneau).toContainText("sans majorité renseignée");
  await panneau.getByRole("button", { name: "Trier la majorité" }).click();

  // On ne garde coché que le compte réservé à ce test.
  const cases = panneau.getByRole("checkbox");
  for (const c of await cases.all()) {
    const nom = (await c.getAttribute("aria-label")) ?? "";
    if (!nom.includes(USERS.majorite.firstName)) await c.uncheck();
  }
  await panneau.getByRole("button", { name: "Marquer majeurs (1)" }).click();
  await expect(panneau.getByRole("status")).toContainText("1 compte(s) passé(s) en majeurs");

  // Les autres restent à trier ; le compte trié n'y figure plus.
  await panneau.getByRole("button", { name: "Trier la majorité" }).click();
  await expect(panneau.getByRole("checkbox", { name: new RegExp(USERS.membreA.firstName) })).toBeVisible();
  await expect(panneau.getByRole("checkbox", { name: new RegExp(USERS.majorite.firstName) })).toHaveCount(0);
});
