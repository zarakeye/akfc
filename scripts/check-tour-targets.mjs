#!/usr/bin/env node
// Garde des tutos interactifs (lancée par `pnpm check`). Quatre erreurs silencieuses :
//   - une étape vise `target: "…"` sans élément `data-tour="…"` dans apps/web/src (composant
//     renommé, attribut supprimé) : le tuto se bloquerait chez l'utilisateur ;
//   - une définition (definitions/*.ts) absente du registre : le tuto n'apparaîtrait nulle part ;
//   - une fiche de documentation qui lance un tuto inconnu (`<TourStartButton id="…" />`, ou un
//     parcours `<TourList ids="…" />`) ;
//   - un tuto dont la fiche (`doc: "/docs/…"`) n'existe pas.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const SRC = "apps/web/src";
const DEFS = join(SRC, "features/tours/definitions");
const REGISTRY = join(SRC, "features/tours/tour.registry.ts");
const DOCS = "apps/web/content/docs";

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
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/data-tour=["'{`]+([\w.:-]+)["'`}]/g)) anchors.add(m[1]);
  // Une ancre posée sous condition : data-tour={kind === "tiptap" ? "builder.add.text" : undefined}.
  for (const m of s.matchAll(/data-tour=\{[^}]*?\?\s*"([\w.:-]+)"/g)) anchors.add(m[1]);
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
  // Sa fiche existe : `doc: "/docs/guide/mon-profil"` → content/docs/guide/mon-profil.mdx.
  for (const m of s.matchAll(/^\s*doc:\s*"\/docs\/([^"]+)"/gm)) {
    if (!existsSync(join(DOCS, `${m[1]}.mdx`))) errors.push(`${relative(".", f)} : fiche « /docs/${m[1]} » introuvable (${join(DOCS, m[1])}.mdx)`);
  }
  for (const m of s.matchAll(/target:\s*"([^"]+)"/g)) {
    steps++;
    if (!anchors.has(m[1])) errors.push(`${relative(".", f)} : cible « ${m[1]} » introuvable (aucun data-tour="${m[1]}" dans ${SRC})`);
  }
}

// Chaque définition est enregistrée : importée par le registre.
const registry = readFileSync(REGISTRY, "utf8");
for (const f of walk(DEFS)) {
  const base = basename(f).replace(/\.tsx?$/, "");
  if (!registry.includes(`"./definitions/${base}"`)) {
    errors.push(`${relative(".", f)} n'est pas importé par ${relative(".", REGISTRY)} : le tuto n'apparaîtra nulle part`);
  }
}

// Chaque bouton de lancement de la documentation désigne un tuto qui existe.
let launchers = 0;
for (const f of walk(DOCS)) {
  for (const m of readFileSync(f, "utf8").matchAll(/<TourStartButton\s+id="([^"]+)"/g)) {
    launchers++;
    if (!ids.has(m[1])) errors.push(`${relative(".", f)} : <TourStartButton id="${m[1]}" /> désigne un tuto inconnu`);
  }
}

// Chaque parcours de la documentation (`<TourList ids="a,b" />`) ne liste que des tutos qui existent.
for (const f of walk(DOCS)) {
  for (const m of readFileSync(f, "utf8").matchAll(/<TourList\b[^>]*\bids="([^"]+)"/g)) {
    for (const id of m[1].split(",").map((x) => x.trim())) {
      launchers++;
      if (!ids.has(id)) errors.push(`${relative(".", f)} : <TourList> liste un tuto inconnu, « ${id} »`);
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ tutos : ${e}`);
  process.exit(1);
}
console.log(`✓ tutos : ${ids.size} tuto(s), ${steps} cible(s), ${launchers} bouton(s) de lancement, tout existe`);
