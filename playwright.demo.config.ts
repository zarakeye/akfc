import { defineConfig, devices } from "@playwright/test";

import baseConfig from "./playwright.config.ts";
import { E2E_APP_ENV } from "./e2e/env.mjs";

/**
 * Les parcours guidés de la démo (e2e/demo/parcours.demo.ts) : la même application de test que
 * `pnpm e2e` (même base, même port, même construction), mais lancée en mode démo, à trois largeurs
 * d'écran. Lancement par `pnpm e2e:demo` (e2e/demo/run.mjs), qui repart d'une base neuve avant
 * chaque largeur.
 *
 * Les fichiers s'appellent *.demo.ts : `pnpm e2e` (testMatch par défaut, *.spec.ts) ne les voit pas.
 */
const desktop = devices["Desktop Chrome"];
const server = baseConfig.webServer;
if (!server || Array.isArray(server)) throw new Error("playwright.config.ts : un seul webServer attendu");

export default defineConfig({
  ...baseConfig,
  testDir: "./e2e/demo",
  testMatch: "**/*.demo.ts",
  // Un seul fichier, long par nature (une vingtaine de minutes par largeur) : pas d'alerte « lent ».
  reportSlowTests: null,
  projects: [
    { name: "1440", use: { ...desktop, viewport: { width: 1440, height: 900 } } },
    { name: "1280", use: { ...desktop, viewport: { width: 1280, height: 720 } } },
    { name: "1024", use: { ...desktop, viewport: { width: 1024, height: 700 } } },
  ],
  // DEMO_MODE est lu au lancement du serveur, pas à la construction : le build de pnpm e2e convient.
  webServer: { ...server, env: { ...E2E_APP_ENV, DEMO_MODE: "1" } },
});
