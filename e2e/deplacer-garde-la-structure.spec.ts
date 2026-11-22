import { expect, test } from "@playwright/test";
import { loginAs, trpcMutation, trpcQuery } from "./helpers";
import { MOVE_TREE, USERS } from "./data.mjs";

/**
 * « Ce dossier, sauf ce sous-dossier, mais cette photo du sous-dossier » : déplacée, la photo
 * recochée garde sa place sous le dossier, au lieu d'arriver à plat dans la cible. Et un dossier
 * qui part en morceaux ne se dépose pas dans lui-même.
 */
test("un déplacement avec exclusions garde la structure", async ({ page }) => {
  await loginAs(page, USERS.admin.email);
  const source = {
    type: "selection",
    roots: [MOVE_TREE.folder, MOVE_TREE.reselected],
    excluded: [MOVE_TREE.excluded],
  };

  const inside = await trpcMutation(page.request, "storage.move", {
    intent: { source, target: { type: "folder", path: `${MOVE_TREE.folder}/garde` } },
  });
  expect(inside.error?.message).toContain("lui-même");

  const moved = await trpcMutation(page.request, "storage.move", {
    intent: { source, target: { type: "folder", path: MOVE_TREE.target } },
  });
  expect(moved.error?.message).toBeUndefined();

  const tree = await trpcQuery(page.request, "storage.getTree", { path: MOVE_TREE.target, depth: 5 });
  const paths = JSON.stringify(tree.result);
  expect(paths).toContain(`${MOVE_TREE.target}/deplacer-e2e/a.png`);
  expect(paths).toContain(`${MOVE_TREE.target}/deplacer-e2e/garde/c.png`);
  expect(paths).not.toContain(`${MOVE_TREE.target}/c.png`);

  const left = await trpcQuery(page.request, "storage.getTree", { path: MOVE_TREE.excluded });
  expect(JSON.stringify(left.result)).toContain(MOVE_TREE.left);
});
