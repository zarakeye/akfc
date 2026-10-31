import { defineConfig, devices } from "@playwright/test";

import { E2E_APP_ENV, E2E_BASE_URL, E2E_PORT } from "./e2e/env.mjs";

/**
 * Tests de bout en bout : un vrai navigateur (Chromium) contre l'application construite pour la
 * production, sur une base et un stockage réservés aux tests (e2e/env.mjs).
 *
 *   pnpm e2e                    prépare la base, construit l'application, lance les tests
 *   E2E_NO_BUILD=1 pnpm e2e     réutilise la dernière construction (le code n'a pas changé)
 *
 * L'application de test est construite dans apps/web/.next-e2e (next.config.ts, AKFC_E2E=1) et
 * écoute sur le port 3100 : elle ne gêne pas `pnpm dev`, qui garde .next et le port 3000.
 */
const build = process.env.E2E_NO_BUILD === "1" ? "" : "next build --webpack && ";

export default defineConfig({
  testDir: "./e2e",
  // Un seul navigateur à la fois : les tests partagent un serveur, sa mémoire (la limite d'essais
  // de connexion) et une base. L'ordre reste celui des fichiers.
  workers: 1,
  fullyParallel: false,
  forbidOnly: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: E2E_BASE_URL,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `${build}next start --port ${E2E_PORT}`,
    cwd: "apps/web",
    url: E2E_BASE_URL,
    env: E2E_APP_ENV,
    timeout: 10 * 60 * 1000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
  },
});
