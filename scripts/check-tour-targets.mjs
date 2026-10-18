#!/usr/bin/env node
// Garde des tutos interactifs (lancée par `pnpm check`).
// Chaque étape vise un élément par `target: "…"` ; l'élément doit porter `data-tour="…"` quelque
// part dans apps/web/src. Une cible orpheline (composant renommé, attribut supprimé) ferait
// échouer le tuto chez l'utilisateur : on la refuse ici, avant le commit.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "apps/web/src";
const DEFS = join(SRC, "features/tours/definitions");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|mdx)$/.test(name)) out.push(p);
  }
  return out;
}

const anchors = new Set();
for (const f of walk(SRC)) {
  for (const m of readFileSync(f, "utf8").matchAll(/data-tour=["'{`]+([\w.:-]+)["'`}]/g)) anchors.add(m[1]);
}

const errors = [];
const ids = new Map();
let steps = 0;
for (const f of walk(DEFS)) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/^\s*id:\s*"([^"]+)"/gm)) {
    if (ids.has(m[1])) errors.push(`identifiant de tuto en double « ${m[1]} » (${relative(".", f)} et ${ids.get(m[1])})`);
    ids.set(m[1], relative(".", f));
  }
  for (const m of s.matchAll(/target:\s*"([^"]+)"/g)) {
    steps++;
    if (!anchors.has(m[1])) errors.push(`${relative(".", f)} : cible « ${m[1]} » introuvable (aucun data-tour="${m[1]}" dans ${SRC})`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ tutos : ${e}`);
  process.exit(1);
}
console.log(`✓ tutos : ${ids.size} tuto(s), ${steps} cible(s), toutes présentes dans le code`);
