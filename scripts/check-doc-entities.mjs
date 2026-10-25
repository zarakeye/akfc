#!/usr/bin/env node
// Garde de la carte des entités et des parcours de la documentation (lancée par `pnpm check`).
// Chaque chapitre peut déclarer, dans son en-tête :
//
//   entities:
//     Ticket: [number, dueAt]          ← entités du schéma Prisma et propriétés citées
//   stories:
//     - title: Un membre dépose une demande
//       actor: Membre connecté
//       steps:
//         - label: …
//           call: ticket.submit         ← procédure tRPC, ou fonction exportée du backend
//           section: Déposer une demande ← titre d'une section du chapitre
//
// Une entité renommée, une propriété supprimée, une procédure disparue ou une section retitrée
// rendraient la carte fausse SANS erreur visible : cette garde le signale.
import { createRequire } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SCHEMA = "prisma/schema.prisma";
const DOCS = "apps/web/content/docs";
const PROCEDURE_MAP = "apps/web/src/features/docs/entities/procedureMap.generated.json";
const matter = createRequire(join(process.cwd(), "apps/web/package.json"))("gray-matter");

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

const map = JSON.parse(readFileSync(PROCEDURE_MAP, "utf8"));
const callExists = (call) => call in map.procedures || call in map.functions;

// Même règle que les ancres des titres (features/docs/lib/slugifyHeading.ts).
const slug = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\//g, "-").replace(/[^\w\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".mdx") ? [p] : [];
  });
}

const errors = [];
let chapters = 0;
let storyCount = 0;
for (const file of walk(DOCS)) {
  const where = relative(process.cwd(), file);
  const { data, content } = matter(readFileSync(file, "utf8"));
  if (data.entities) {
    chapters++;
    for (const [name, fields] of Object.entries(data.entities)) {
      const known = fieldsOf.get(name);
      if (!known) {
        errors.push(`${where} : l'entité ${name} n'existe pas dans ${SCHEMA}`);
        continue;
      }
      if (!Array.isArray(fields)) {
        errors.push(`${where} : ${name} — forme attendue : « ${name}: [propriété, propriété] »`);
        continue;
      }
      for (const f of fields) if (!known.has(f)) errors.push(`${where} : ${name}.${f} n'existe pas dans ${SCHEMA}`);
    }
  }
  if (data.stories) {
    if (!data.entities) errors.push(`${where} : des parcours (stories) sans entités (entities) : la carte n'est pas affichée`);
    const headings = new Set([...content.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => slug(m[1])));
    for (const s of data.stories) {
      storyCount++;
      if (!s?.title || !Array.isArray(s.steps) || s.steps.length === 0) {
        errors.push(`${where} : un parcours doit avoir un titre (title) et au moins une étape (steps)`);
        continue;
      }
      for (const st of s.steps) {
        if (!st?.call || !callExists(st.call)) {
          errors.push(`${where} : « ${s.title} » — ${st?.call ?? "(call manquant)"} n'est ni une procédure tRPC ni une fonction exportée du backend`);
        }
        if (st?.section && !headings.has(slug(st.section))) {
          errors.push(`${where} : « ${s.title} » — la section « ${st.section} » n'existe pas dans le chapitre`);
        }
      }
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ entités de la doc : ${e}`);
  process.exit(1);
}
console.log(`✓ entités de la doc : ${chapters} chapitre(s), ${storyCount} parcours, tout existe`);
