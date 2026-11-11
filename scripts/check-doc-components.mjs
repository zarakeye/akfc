#!/usr/bin/env node
/**
 * Les composants de la doc tiennent-ils leurs promesses ?
 *
 * - Chaque <Promesse vers="…"> vise un chapitre qui existe (apps/web/content/docs/<vers>.mdx) et, si
 *   elle nomme une section, un titre « ## » ou « ### » de ce chapitre portant exactement ce texte.
 * - Chaque <Callout type="…"> utilise un type connu du composant (sinon il s'affiche sans couleur).
 *
 * Une promesse se déplace avec la doc : son numéro est calculé à l'affichage, mais sa cible doit
 * exister. C'est ce que cette garde vérifie, à chaque pnpm check.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "apps/web/content/docs");
const CALLOUT = fs.readFileSync(path.join(ROOT, "apps/web/src/features/docs/ui/Callout.tsx"), "utf8");
const TYPES = new Set([...(CALLOUT.match(/CALLOUT_TYPES = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith(".mdx") ? [path.join(dir, d.name)] : [],
  );
}
const headings = (src) =>
  new Set(src.split("\n").filter((l) => /^#{2,3} /.test(l)).map((l) => l.replace(/^#{2,3} /, "").trim()));

const errors = [];
let promises = 0;
let callouts = 0;
for (const file of walk(DOCS)) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  for (const m of src.matchAll(/<Promesse\b([^>]*)>/g)) {
    promises += 1;
    const vers = m[1].match(/vers="([^"]*)"/)?.[1];
    const section = m[1].match(/section="([^"]*)"/)?.[1];
    if (!vers) { errors.push(`${rel} : <Promesse> sans attribut vers`); continue; }
    const target = path.join(DOCS, `${vers}.mdx`);
    if (!fs.existsSync(target)) { errors.push(`${rel} : promesse vers « ${vers} », chapitre introuvable`); continue; }
    if (section && !headings(fs.readFileSync(target, "utf8")).has(section)) {
      errors.push(`${rel} : promesse vers « ${vers} », section « ${section} » introuvable`);
    }
  }
  for (const m of src.matchAll(/<Callout\s+type="([^"]*)"/g)) {
    callouts += 1;
    if (!TYPES.has(m[1])) errors.push(`${rel} : <Callout type="${m[1]}"> inconnu (types : ${[...TYPES].join(", ")})`);
  }
}

if (errors.length) {
  console.error(`✗ composants de la doc : ${errors.length} problème(s)`);
  for (const e of errors.slice(0, 20)) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ composants de la doc : ${promises} promesse(s), ${callouts} encadré(s), tout existe`);
