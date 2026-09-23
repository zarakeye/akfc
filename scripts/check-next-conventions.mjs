#!/usr/bin/env node
// Garde des fichiers de convention Next (lancée par `pnpm check`).
// Next ne les lit que dans le dossier parent de `app/` : apps/web/src/ si l'app vit dans src/,
// sinon apps/web/. Ailleurs, ils sont ignorés SANS avertissement — d'où cette garde.
import { existsSync } from "node:fs";
import { join } from "node:path";

const WEB = "apps/web";
const NAMES = ["middleware", "proxy", "instrumentation", "instrumentation-client"];
const EXTS = ["ts", "tsx", "js", "mjs", "mts"];
const find = (dir, name) => EXTS.map((e) => join(dir, `${name}.${e}`)).filter(existsSync);

const srcLayout = existsSync(join(WEB, "src", "app"));
const active = srcLayout ? join(WEB, "src") : WEB;
const inactive = srcLayout ? WEB : join(WEB, "src");

const errors = [];
const warnings = [];

for (const name of NAMES) {
  for (const f of find(inactive, name)) {
    errors.push(`${f} est IGNORÉ par Next (l'app vit dans ${active}/app) → déplace-le dans ${active}/ ou supprime-le.`);
  }
}
const mw = find(active, "middleware");
const px = find(active, "proxy");
if (mw.length && px.length) errors.push(`middleware ET proxy coexistent dans ${active}/ : n'en garder qu'un (proxy en Next 16).`);
else if (mw.length) warnings.push(`${mw[0]} : 'middleware' est déprécié en Next 16 → renommer en proxy (fonction exportée 'proxy').`);

for (const w of warnings) console.warn(`⚠ conventions Next : ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`❌ conventions Next : ${e}`);
  process.exit(1);
}
console.log(`✓ conventions Next : fichiers au bon endroit (${active}/)`);
