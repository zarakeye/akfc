#!/usr/bin/env node
/**
 * Les extraits de code de la doc (CodeExample, CodeWalkthrough) montrent-ils toujours du code qui
 * existe ? Pour chaque bloc : le fichier existe ; une ancre de début (snippetStart) correspond à UNE
 * ligne du fichier, et l'ancre de fin (snippetEnd) se trouve après ; une plage (snippetRange) tient
 * dans le fichier ; les lignes surlignées et les étapes restent dans l'extrait.
 *
 * Règle de correspondance : la même que resolveSnippetBounds (apps/web/src/features/docs/lib/code.utils.ts).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "apps/web/content/docs");

function matches(line, anchor) {
  if (anchor.startsWith("^")) return line.startsWith(anchor.slice(1));
  if (/^\s/.test(anchor)) return line.startsWith(anchor);
  return line.trim().startsWith(anchor.trim());
}
const BLOCK_END = "(fin du bloc)";
function blockEndIndex(lines, from) {
  let depth = 0, opened = false;
  for (let i = from; i < lines.length; i += 1) {
    const code = lines[i].replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\/\/.*$/, "");
    for (const ch of code) {
      if (ch === "{" || ch === "(" || ch === "[") { depth += 1; opened = true; }
      else if (ch === "}" || ch === ")" || ch === "]") depth -= 1;
    }
    if (opened && depth <= 0) return i;
  }
  return -1;
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith(".mdx") ? [path.join(dir, d.name)] : [],
  );
}
const attr = (blk, name) => {
  const m = blk.match(new RegExp(`${name}="([^"]*)"`)) ?? blk.match(new RegExp(`${name}='([^']*)'`));
  return m ? m[1] : undefined;
};
const maxRel = (spec) => Math.max(0, ...(spec ?? "").split(",").flatMap((p) => p.split("-")).map(Number).filter(Number.isFinite));

const errors = [];
let count = 0;
let anchored = 0;
for (const doc of walk(DOCS)) {
  const rel = path.relative(ROOT, doc);
  const text = fs.readFileSync(doc, "utf8");
  for (const blk of text.match(/<Code(?:Example|Walkthrough)\n(?:[^\n]*\n)*?\/>/g) ?? []) {
    count += 1;
    const fp = attr(blk, "filepath");
    const where = `${rel} → ${fp}`;
    const file = fp && path.join(ROOT, fp);
    if (!file || !fs.existsSync(file)) { errors.push(`${where} : fichier introuvable`); continue; }
    const lines = fs.readFileSync(file, "utf8").split("\n");
    let start, end;
    const s = attr(blk, "snippetStart"), e = attr(blk, "snippetEnd"), r = attr(blk, "snippetRange");
    if (s) {
      anchored += 1;
      const hits = lines.flatMap((l, i) => (matches(l, s) ? [i] : []));
      if (hits.length !== 1) { errors.push(`${where} : ancre de début « ${s} » trouvée ${hits.length} fois (il en faut une)`); continue; }
      const lead = Number(attr(blk, "snippetLead") ?? 0);
      start = Math.max(1, hits[0] + 1 - lead);
      if (e === BLOCK_END) {
        const k = blockEndIndex(lines, hits[0]);
        if (k === -1) { errors.push(`${where} : fin du bloc introuvable après « ${s} »`); continue; }
        end = k + 1;
      } else if (e) {
        const k = lines.slice(hits[0]).findIndex((l) => matches(l, e));
        if (k === -1) { errors.push(`${where} : ancre de fin « ${e} » introuvable après le début`); continue; }
        end = hits[0] + 1 + k;
      } else end = hits[0] + Math.max(1, Number(attr(blk, "snippetLines") ?? 1));
    } else if (r) {
      const m = r.match(/^(\d+)\s*-\s*(\d+)$/);
      if (!m) { errors.push(`${where} : plage illisible « ${r} »`); continue; }
      [start, end] = [Number(m[1]), Number(m[2])];
      if (end > lines.length) { errors.push(`${where} : plage ${r} au-delà de la fin du fichier (${lines.length} lignes)`); continue; }
    } else continue;
    const size = end - start + 1;
    const hl = attr(blk, "snippetHighlight");
    if (maxRel(hl) > size) errors.push(`${where} : ligne surlignée ${hl} hors de l'extrait (${size} lignes)`);
    const steps = attr(blk, "stepsJson");
    if (steps) {
      for (const st of JSON.parse(steps)) {
        for (const k of ["scope", "focus"]) {
          if (st[k] && maxRel(st[k]) > size) errors.push(`${where} : étape « ${st.title} », ${k} ${st[k]} hors de l'extrait (${size} lignes)`);
        }
      }
    }
  }
}
if (errors.length) {
  console.error(`✗ extraits de la doc : ${errors.length} problème(s)`);
  for (const e of errors.slice(0, 30)) console.error("  " + e);
  process.exit(1);
}
console.log(`✓ extraits de la doc : ${count} extrait(s), ${anchored} ancré(s) sur le texte, tout existe`);
