import { expect, test, type Page } from "@playwright/test";

import { readFileSync } from "node:fs";
import ts from "typescript";

import type { DemoTour } from "../../apps/web/src/features/demo/demoTours.ts";
import { MAILPIT_API } from "../env.mjs";

/**
 * La liste du panneau, lue dans le code du site. Un import ordinaire ne marche pas : apps/web n'est
 * pas « type: module », et Node y charge le .ts comme du CommonJS, qui n'a pas d'`export`. Le
 * fichier est donc traduit en JavaScript (TypeScript, sans vérifier les types), puis importé tel
 * quel. Il ne doit importer que des types : un import de valeur échouerait ici, et le dirait.
 */
async function loadDemoTours(): Promise<DemoTour[]> {
  const source = readFileSync(new URL("../../apps/web/src/features/demo/demoTours.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = (await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`)) as { DEMO_TOURS: DemoTour[] };
  return mod.DEMO_TOURS;
}
const DEMO_TOURS = await loadDemoTours();

/**
 * Les parcours guidés de la démo, joués comme un visiteur : à chaque étape, le test lit la bulle,
 * puis clique EXACTEMENT là où s'arrête le curseur, tape ce qu'elle demande, ou clique « Suivant ».
 * Si la zone éclairée n'est pas celle qu'il faut cliquer, le clic tombe à côté et l'étape suivante
 * n'arrive pas : le test échoue. Chaque parcours est joué deux fois de suite : la démo doit pouvoir
 * le refaire (ce qu'il crée, il le défait, ou le second passage le retrouve).
 *
 * La liste vient du panneau de la démo (DEMO_TOURS) : un parcours ajouté au panneau est testé.
 * Lancement : pnpm e2e:demo (e2e/demo/run.mjs), pas pnpm e2e.
 */

/** Le curseur du mode guidé : un élément fixe, placé par transform (features/tours). */
async function cursorPos(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("div.pointer-events-none.fixed.z-\\[10003\\]");
    const m = el?.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
    // La pointe de la flèche est à 3 px du coin de l'élément.
    return m ? { x: Number(m[1]) + 3, y: Number(m[2]) + 3 } : null;
  });
}

/** L'adresse d'une page qui n'en a pas de fixe : le lien du dernier e-mail reçu par `to`. */
async function linkFromMail(page: Page, to: string) {
  for (let k = 0; k < 20; k++) {
    const search = await page.request.get(`${MAILPIT_API}/search?query=${encodeURIComponent(`to:${to}`)}`);
    const { messages } = (await search.json()) as { messages: { ID: string }[] };
    if (messages[0]) {
      const message = await page.request.get(`${MAILPIT_API}/message/${messages[0].ID}`);
      const path = /\/autorisation-parent\/[A-Za-z0-9_-]+/.exec(((await message.json()) as { Text: string }).Text)?.[0];
      if (path) return path;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`aucun lien dans le courrier de ${to}`);
}

/** Un tuto : lancé en mode curseur, comme le bouton du panneau, puis suivi jusqu'au bout. */
async function playTour(page: Page, tourId: string, route: string) {
  await page.evaluate((id) => sessionStorage.setItem("akfc.tour", JSON.stringify({ tourId: id, index: 0, cursor: true })), tourId);
  await page.goto(route);
  // La bulle du tuto, et pas un autre dialogue de la page.
  const bubble = page.getByRole("dialog").filter({ hasText: /Étape \d+ sur/ });
  let last = "";
  for (let n = 0; n < 30; n++) {
    if (!(await bubble.count())) {
      await page.waitForTimeout(1500);
      if (!(await bubble.count())) return; // le tuto est terminé
    }
    // L'étape suivante : un autre texte, et la bulle finie d'apparaître.
    await page.waitForFunction(
      (prev) => {
        const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => /Étape \d+ sur/.test(x.textContent ?? ""));
        return !d || (d.textContent !== prev && getComputedStyle(d).opacity === "1");
      },
      last,
      { timeout: 15000 },
    );
    await page.waitForTimeout(250);
    if (!(await bubble.count())) continue;
    const text = (await bubble.textContent()) ?? "";
    last = text;
    if (/Chargement de la page/.test(text)) {
      await page.waitForFunction(
        () => ![...document.querySelectorAll('[role="dialog"]')].some((x) => /Chargement de la page/.test(x.textContent ?? "")),
        null,
        { timeout: 15000 },
      );
      n--;
      last = "";
      continue;
    }
    expect(text, `${tourId} : élément introuvable`).not.toMatch(/introuvable/);
    const pos = await cursorPos(page);
    if (text.includes("Tapez :")) {
      const value = (await bubble.locator("code").first().textContent()) ?? "";
      await page.mouse.click(pos!.x, pos!.y);
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type(value);
      const multiline = await page.evaluate(
        () => document.activeElement?.tagName === "TEXTAREA" || !!(document.activeElement as HTMLElement | null)?.isContentEditable,
      );
      // Entrée valide un champ d'une ligne ; dans un texte long, elle ajouterait une ligne.
      if (multiline) {
        await page.waitForTimeout(600);
        if ((await bubble.textContent()) === text) await bubble.getByRole("button", { name: "Suivant" }).click();
      } else await page.keyboard.press("Enter");
    } else if (text.includes("clic droit là")) {
      await page.mouse.click(pos!.x, pos!.y, { button: "right" });
    } else if (text.includes("Cliquez là")) {
      await page.mouse.click(pos!.x, pos!.y);
      // Le visiteur lâche la souris pour lire la bulle : elle quitte ce qu'elle vient de cliquer.
      const { width, height } = page.viewportSize()!;
      await page.mouse.move(Math.round(width / 2), height - 2, { steps: 6 });
    } else {
      await bubble.getByRole("button", { name: /Suivant|Terminer/ }).click();
    }
  }
  throw new Error(`${tourId} : plus de 30 étapes, le tuto tourne en rond`);
}

/** Les tutos d'un parcours, dans l'ordre du panneau, avec la page où chacun commence. */
function plan(parcours: DemoTour) {
  return parcours.steps.flatMap((step) => {
    if (!step.tour) return [];
    if (step.here && step.role !== "parent") throw new Error(`${step.tour} : « here » sans moyen de trouver sa page`);
    return [{ tourId: step.tour, route: step.here ? "MAIL" : (step.href ?? "/") }];
  });
}

for (const parcours of DEMO_TOURS) {
  const tours = plan(parcours);
  if (tours.length === 0) continue;
  test(`${parcours.title}, deux fois`, async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    await page.goto("/");
    for (let round = 1; round <= 2; round++) {
      for (const { tourId, route } of tours) {
        await test.step(`${round}. ${tourId}`, async () => {
          await playTour(page, tourId, route === "MAIL" ? await linkFromMail(page, "parent@sandbox.local") : route);
        });
      }
    }
  });
}
