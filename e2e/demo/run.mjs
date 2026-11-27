#!/usr/bin/env node
// @ts-check
/**
 * pnpm e2e:demo [1440] [1280] [1024] — les parcours guidés de la démo, à chaque largeur demandée
 * (les trois par défaut). Avant chaque largeur : une base et un stockage neufs (e2e/prepare.mjs),
 * puis le décor de la démo (e2e/demo/seed.mjs). Les parcours se jouent ensuite deux fois chacun.
 *
 * L'application n'est construite qu'une fois, pour la première largeur ; E2E_NO_BUILD=1 réutilise
 * la dernière construction dès la première.
 */
import { execFileSync } from "node:child_process";

const WIDTHS = ["1440", "1280", "1024"];
const asked = process.argv.slice(2);
const bad = asked.filter((w) => !WIDTHS.includes(w));
if (bad.length) {
  console.error(`❌ largeur inconnue : ${bad.join(", ")} (au choix : ${WIDTHS.join(", ")})`);
  process.exit(1);
}
const widths = asked.length ? asked : WIDTHS;

let failed = 0;
let built = process.env.E2E_NO_BUILD === "1";
for (const width of widths) {
  console.log(`\n── ${width} px ──`);
  execFileSync("node", ["e2e/prepare.mjs"], { stdio: "inherit" });
  execFileSync("node", ["e2e/demo/seed.mjs"], { stdio: "inherit" });
  try {
    execFileSync("pnpm", ["exec", "playwright", "test", "-c", "playwright.demo.config.ts", `--project=${width}`], {
      stdio: "inherit",
      env: { ...process.env, ...(built ? { E2E_NO_BUILD: "1" } : {}) },
    });
  } catch {
    failed++;
  }
  built = true;
}
if (failed) {
  console.error(`\n❌ ${failed} largeur(s) en échec sur ${widths.length} — rapport : pnpm e2e:report`);
  process.exit(1);
}
console.log(`\n✅ tous les parcours, à ${widths.join(", ")} px`);
