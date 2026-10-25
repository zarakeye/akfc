#!/usr/bin/env node
// Garde de la carte des entités de la documentation (lancée par `pnpm check`).
// Chaque chapitre peut déclarer, dans son en-tête, les entités du schéma Prisma qu'il mobilise :
//
//   entities:
//     Ticket: [number, dueAt]
//     TicketCategory: [groupId]
//
// Une entité renommée ou une propriété supprimée par une migration rendrait la carte du chapitre
// fausse SANS erreur visible : cette garde le signale.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SCHEMA = "prisma/schema.prisma";
const DOCS = "apps/web/content/docs";

// Entités et propriétés du schéma : `model X {`, puis une propriété par ligne jusqu'à `}`.
const fieldsOf = new Map();
let current = null;
for (const raw of readFileSync(SCHEMA, "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  const open = /^model\s+(\w+)\s*\{/.exec(line);
  if (open) {
    current = new Set();
    fieldsOf.set(open[1], current);
    continue;
  }
  if (!current) continue;
  if (line === "}") {
    current = null;
    continue;
  }
  if (!line || line.startsWith("//") || line.startsWith("@@")) continue;
  current.add(line.split(/\s+/)[0]);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".mdx") ? [p] : [];
  });
}

const errors = [];
let chapters = 0;
for (const file of walk(DOCS)) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"));
  if (!fm) continue;
  const lines = fm[1].split(/\r?\n/);
  const start = lines.findIndex((l) => /^entities:\s*$/.test(l));
  if (start === -1) continue;
  chapters++;
  for (const l of lines.slice(start + 1)) {
    if (!/^\s+/.test(l)) break; // fin du bloc indenté
    const m = /^\s+(\w+):\s*\[([^\]]*)\]\s*$/.exec(l);
    const where = relative(process.cwd(), file);
    if (!m) {
      errors.push(`${where} : ligne « ${l.trim()} » — forme attendue : « Entité: [propriété, propriété] »`);
      continue;
    }
    const fields = fieldsOf.get(m[1]);
    if (!fields) {
      errors.push(`${where} : l'entité ${m[1]} n'existe pas dans ${SCHEMA}`);
      continue;
    }
    for (const f of m[2].split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!fields.has(f)) errors.push(`${where} : ${m[1]}.${f} n'existe pas dans ${SCHEMA}`);
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ entités de la doc : ${e}`);
  process.exit(1);
}
console.log(`✓ entités de la doc : ${chapters} chapitre(s), toutes les entités et propriétés existent`);
