import { expect, test } from "@playwright/test";

import { loginAs, trpcMutation } from "./helpers";
import { PARTANT_POST, USERS } from "./data.mjs";

/**
 * Supprimer le compte d'un membre qui a vécu sur le site.
 *
 * Avant, la base refusait : ses réactions, ses commentaires, ses fichiers retenaient le compte, et
 * l'administrateur ne lisait qu'une erreur interne. Désormais ses réactions partent avec lui, son
 * commentaire et son fichier restent, sans auteur, et l'administrateur peut retirer le commentaire.
 */
test("un membre qui a commenté, réagi et envoyé un fichier peut être supprimé", async ({ page }) => {
  // Le membre commente l'actualité et y réagit (le fichier envoyé est dans les données de test).
  await loginAs(page, USERS.partant.email);
  const comment = await trpcMutation(page.request, "comment.create", {
    postId: PARTANT_POST.id,
    content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Merci pour le stage !" }] }] },
  });
  expect(comment.error).toBeUndefined();
  const reaction = await trpcMutation(page.request, "reaction.toggle", { targetType: "POST", targetId: PARTANT_POST.id, emoji: "👍" });
  expect(reaction.error).toBeUndefined();

  // Un administrateur supprime son compte : la base l'accepte.
  await page.context().clearCookies();
  await loginAs(page, USERS.admin.email);
  const removed = await trpcMutation(page.request, "user.delete", { id: USERS.partant.id });
  expect(removed.error, removed.error?.message).toBeUndefined();

  // Le commentaire reste, sans auteur : « Ancien membre », sans bouton Éditer.
  await page.goto("/");
  const card = page.locator("article", { hasText: PARTANT_POST.title }).first();
  await card.getByRole("button", { name: /1 commentaire/ }).click();
  const anonymous = card.getByText("Ancien membre", { exact: true });
  await expect(anonymous).toBeVisible();
  await expect(card.getByText("Merci pour le stage !")).toBeVisible();
  await expect(card.getByRole("button", { name: "Éditer" })).toHaveCount(0);

  // La modération : l'administrateur retire le commentaire.
  page.once("dialog", (d) => void d.accept());
  await card.getByRole("button", { name: "Supprimer" }).click();
  await expect(card.getByText("Merci pour le stage !")).toHaveCount(0);
});

test("un membre ne supprime pas le commentaire d'un autre", async ({ page }) => {
  await loginAs(page, USERS.membreA.email);
  const created = await trpcMutation(page.request, "comment.create", {
    postId: PARTANT_POST.id,
    content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Commentaire de Bruno" }] }] },
  });
  const id = (created.result as { id: number }).id;
  await page.context().clearCookies();
  await loginAs(page, USERS.membreB.email);
  const refused = await trpcMutation(page.request, "comment.delete", { id });
  expect(refused.error?.data.code).toBe("FORBIDDEN");
});
