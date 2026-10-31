import { expect, test } from "@playwright/test";

import { loginForm, trpcMutation } from "./helpers";
import { PASSWORD, USERS } from "./data.mjs";

test.describe("Connexion", () => {
  test("un membre se connecte depuis le header et voit son menu", async ({ page }) => {
    await page.goto("/");
    const form = loginForm(page);
    await form.email.fill(USERS.membreA.email);
    await form.password.fill(PASSWORD);
    await form.submit.click();

    // Le menu du membre remplace le formulaire : son prénom, et plus de bouton « Se connecter ».
    await expect(page.getByRole("button", { name: USERS.membreA.firstName }).filter({ visible: true })).toBeVisible();
    await expect(form.submit).toHaveCount(0);
  });

  test("un mauvais mot de passe est refusé, avec le même message qu'une adresse inconnue", async ({ page }) => {
    await page.goto("/");
    const form = loginForm(page);

    await form.email.fill(USERS.membreA.email);
    await form.password.fill("pas-le-bon-mot-de-passe");
    await form.submit.click();
    await expect(page.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();

    // Une adresse sans compte : même message, rien ne dit si l'adresse est inscrite au club.
    await form.email.fill("inconnu@e2e.test");
    await form.password.fill("pas-le-bon-mot-de-passe");
    await form.submit.click();
    await expect(page.getByText("Adresse e-mail ou mot de passe incorrect.")).toBeVisible();
  });

  test("après dix essais faux, même le bon mot de passe est refusé pour un quart d'heure", async ({ page }) => {
    // Dix échecs par l'API : la limite compte les essais par adresse, quelle que soit leur origine.
    for (let i = 0; i < 10; i++) {
      const { result } = await trpcMutation(page.request, "auth.login", {
        email: USERS.limite.email,
        password: `faux-mot-de-passe-${i}`,
      });
      expect(result).toEqual({ success: false, error: "INVALID_CREDENTIALS" });
    }

    await page.goto("/");
    const form = loginForm(page);
    await form.email.fill(USERS.limite.email);
    await form.password.fill(PASSWORD);
    await form.submit.click();
    await expect(page.getByText("Trop d’essais pour cette adresse.", { exact: false })).toBeVisible();

    // Et le refus est réel côté serveur : aucune session n'a été ouverte.
    const { result } = await trpcMutation(page.request, "auth.login", { email: USERS.limite.email, password: PASSWORD });
    expect(result).toEqual({ success: false, error: "TOO_MANY_ATTEMPTS" });
  });
});
