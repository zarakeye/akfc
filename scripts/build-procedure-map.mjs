#!/usr/bin/env node
// Carte des procédures : pour chaque procédure tRPC (et chaque fonction exportée du backend), les
// entités Prisma qu'elle lit, crée, modifie ou supprime, et les e-mails qu'elle envoie.
//
// Le code est la source : ce script lit packages/backend avec l'analyseur de TypeScript et suit
// les appels (services du backend importés) jusqu'aux appels Prisma (`prisma.ticket.create`,
// `tx.ticketEvent.create`…). Le résultat alimente les parcours de la documentation.
//
//   node scripts/build-procedure-map.mjs           → vérifie que le fichier est à jour (pnpm check)
//   node scripts/build-procedure-map.mjs --write   → le régénère (pnpm docs:procedures)
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = process.cwd();
const BACKEND = join(ROOT, "packages/backend/src");
const OUT = join(ROOT, "apps/web/src/features/docs/entities/procedureMap.generated.json");
const SCHEMA = join(ROOT, "prisma/schema.prisma");

// Modèles Prisma : `ticketEvent` (accesseur du client) → `TicketEvent`.
const models = new Map();
for (const m of readFileSync(SCHEMA, "utf8").matchAll(/^model\s+(\w+)\s*\{/gm)) {
  models.set(m[1][0].toLowerCase() + m[1].slice(1), m[1]);
}

// Champs de relation de chaque modèle : `Ticket.messages` → `TicketMessage` (écritures imbriquées).
const relationsOf = new Map();
{
  let current = null;
  for (const raw of readFileSync(SCHEMA, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    const open = /^model\s+(\w+)\s*\{/.exec(line);
    if (open) {
      current = new Map();
      relationsOf.set(open[1], current);
      continue;
    }
    if (!current) continue;
    if (line === "}") {
      current = null;
      continue;
    }
    const m = /^(\w+)\s+(\w+)(\[\]|\?)?/.exec(line);
    if (m && !line.startsWith("//") && [...models.values()].includes(m[2])) current.set(m[1], m[2]);
  }
}

const OPS = {
  findUnique: "read", findUniqueOrThrow: "read", findFirst: "read", findFirstOrThrow: "read",
  findMany: "read", count: "read", aggregate: "read", groupBy: "read",
  create: "create", createMany: "create", createManyAndReturn: "create",
  update: "update", updateMany: "update", updateManyAndReturn: "update", upsert: "upsert",
  delete: "delete", deleteMany: "delete",
};

// ─── Fichiers et imports ───────────────────────────────────────────────

// Ordre trié : le fichier produit est identique d'une machine à l'autre.
function walk(dir) {
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(n) && !n.endsWith(".d.ts") ? [p] : [];
  });
}

const files = new Map(); // chemin → SourceFile
for (const f of walk(BACKEND)) {
  files.set(f, ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
}

function resolveModule(fromFile, spec) {
  let base;
  if (spec.startsWith("@backend/")) base = join(BACKEND, spec.slice("@backend/".length));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  for (const c of [base + ".ts", base + ".tsx", join(base, "index.ts")]) if (files.has(c)) return c;
  return null;
}

/** Fonctions déclarées dans un fichier : `function f`, `const f = (…) =>` / `async (…) =>`. */
const declsOf = new Map();
function declarations(file) {
  if (declsOf.has(file)) return declsOf.get(file);
  const map = new Map();
  const sf = files.get(file);
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) map.set(st.name.text, st);
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) {
          map.set(d.name.text, d.initializer);
        }
      }
    }
  }
  declsOf.set(file, map);
  return map;
}

/** Imports d'un fichier : nom local → { fichier, nom exporté }. */
const importsOf = new Map();
function imports(file) {
  if (importsOf.has(file)) return importsOf.get(file);
  const map = new Map();
  for (const st of files.get(file).statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    const target = resolveModule(file, st.moduleSpecifier.text);
    if (!target) continue;
    const nb = st.importClause.namedBindings;
    if (nb && ts.isNamedImports(nb)) {
      for (const el of nb.elements) map.set(el.name.text, { file: target, name: (el.propertyName ?? el.name).text });
    }
    if (st.importClause.name) map.set(st.importClause.name.text, { file: target, name: "default" });
  }
  importsOf.set(file, map);
  return map;
}

/** Résout un appel `f(…)` vers sa déclaration (même fichier, ou fichier importé). */
function resolveCallee(file, name) {
  const local = declarations(file).get(name);
  if (local) return { file, node: local, name };
  const imp = imports(file).get(name);
  if (!imp) return null;
  const node = declarations(imp.file).get(imp.name);
  return node ? { file: imp.file, node, name: imp.name } : null;
}

// ─── Effets ────────────────────────────────────────────────────────────

/** Clés d'un objet littéral `{ a: …, b }` (champs écrits par data:, lus par select:). */
function keysOf(obj) {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return [];
  return obj.properties
    .map((p) => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name && ts.isIdentifier(p.name) ? p.name.text : null)
    .filter(Boolean);
}

function argProperty(call, key) {
  const arg = call.arguments[0];
  if (!arg || !ts.isObjectLiteralExpression(arg)) return null;
  const p = arg.properties.find((x) => ts.isPropertyAssignment(x) && ts.isIdentifier(x.name) && x.name.text === key);
  return p ? p.initializer : null;
}

/** Propriété `key` d'un objet littéral. */
function prop(obj, key) {
  if (!obj || !ts.isObjectLiteralExpression(obj)) return null;
  const p = obj.properties.find((x) => ts.isPropertyAssignment(x) && ts.isIdentifier(x.name) && x.name.text === key);
  return p ? p.initializer : null;
}

/** Écritures imbriquées dans `data` : create / createMany / update / delete sur une relation. */
function nestedWrites(model, data, acc) {
  if (!ts.isObjectLiteralExpression(data)) return;
  const rels = relationsOf.get(model) ?? new Map();
  for (const p of data.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
    const target = rels.get(p.name.text);
    if (!target || !ts.isObjectLiteralExpression(p.initializer)) continue;
    const firstObject = (x) => (x && ts.isArrayLiteralExpression(x) ? x.elements[0] : x);
    const create = firstObject(prop(p.initializer, "create"));
    if (create) {
      acc.effects.push({ model: target, op: "create", fields: keysOf(create) });
      nestedWrites(target, create, acc);
    }
    const many = prop(p.initializer, "createMany");
    if (many) acc.effects.push({ model: target, op: "create", fields: keysOf(firstObject(prop(many, "data"))) });
    if (prop(p.initializer, "update") || prop(p.initializer, "updateMany") || prop(p.initializer, "upsert")) {
      acc.effects.push({ model: target, op: "update", fields: [] });
    }
    if (prop(p.initializer, "delete") || prop(p.initializer, "deleteMany")) {
      acc.effects.push({ model: target, op: "delete", fields: [] });
    }
  }
}

/** Effets d'un nœud (corps d'une procédure ou d'une fonction), appels suivis. */
function collect(file, node, acc, seen, depth) {
  const visit = (n) => {
    if (ts.isCallExpression(n)) {
      const e = n.expression;
      // `<x>.<modèle>.<opération>(…)` : un appel Prisma.
      if (ts.isPropertyAccessExpression(e) && ts.isPropertyAccessExpression(e.expression)) {
        const op = OPS[e.name.text];
        const model = models.get(e.expression.name.text);
        if (op && model) {
          const fields = [];
          if (op !== "read" && op !== "delete") {
            const data = argProperty(n, "data") ?? argProperty(n, "create") ?? argProperty(n, "update");
            fields.push(...keysOf(data));
            if (op === "upsert") fields.push(...keysOf(argProperty(n, "update")));
          }
          const kinds = op === "upsert" ? ["create", "update"] : [op];
          for (const k of kinds) acc.effects.push({ model, op: k, fields });
          // Écritures imbriquées : `data: { messages: { create: { … } } }` crée un TicketMessage.
          const data = argProperty(n, "data");
          if (data) nestedWrites(model, data, acc);
        }
      }
      // `f(…)` : une fonction du backend, suivie.
      const calleeName = ts.isIdentifier(e) ? e.text : null;
      if (calleeName && depth < 6) {
        const target = resolveCallee(file, calleeName);
        if (target) {
          if (/\/email\//.test(target.file) && /^send/.test(target.name)) acc.emails.add(target.name);
          const key = `${target.file}#${target.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            collect(target.file, target.node, acc, seen, depth + 1);
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
}

function summarize(acc) {
  // Fusion par (entité, opération), champs dédoublonnés.
  const merged = new Map();
  for (const e of acc.effects) {
    const k = `${e.model}:${e.op}`;
    if (!merged.has(k)) merged.set(k, { model: e.model, op: e.op, fields: new Set() });
    for (const f of e.fields) merged.get(k).fields.add(f);
  }
  return {
    effects: [...merged.values()]
      .map((e) => ({ model: e.model, op: e.op, fields: [...e.fields].sort() }))
      .sort((a, b) => a.model.localeCompare(b.model) || a.op.localeCompare(b.op)),
    emails: [...acc.emails].sort(),
  };
}

function effectsOf(file, node) {
  const acc = { effects: [], emails: new Set() };
  collect(file, node, acc, new Set(), 0);
  return summarize(acc);
}

const lineOf = (file, node) => files.get(file).getLineAndCharacterOfPosition(node.getStart()).line + 1;
const rel = (f) => relative(ROOT, f);

// ─── Routeurs ──────────────────────────────────────────────────────────

const indexFile = join(BACKEND, "modules/index.ts");
const appRouterKeys = new Map(); // variable du routeur → clé dans appRouter
ts.forEachChild(files.get(indexFile), function find(n) {
  if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "router") {
    const obj = n.arguments[0];
    if (obj && ts.isObjectLiteralExpression(obj)) {
      for (const p of obj.properties) {
        if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.initializer)) appRouterKeys.set(p.initializer.text, p.name.text);
      }
    }
  }
  ts.forEachChild(n, find);
});

const procedures = {};
for (const [routerVar, prefix] of appRouterKeys) {
  const imp = imports(indexFile).get(routerVar);
  if (!imp) continue;
  const file = imp.file;
  const sf = files.get(file);
  // `export const xRouter = router({ … })`
  ts.forEachChild(sf, function find(n) {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === imp.name && n.initializer && ts.isCallExpression(n.initializer)) {
      const obj = n.initializer.arguments[0];
      if (!obj || !ts.isObjectLiteralExpression(obj)) return;
      for (const p of obj.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const name = `${prefix}.${p.name.getText(sf)}`;
        const text = p.initializer.getText(sf);
        const kind = /\.mutation\(/.test(text) ? "mutation" : /\.query\(/.test(text) ? "query" : "autre";
        const access = /isAdmin|adminProcedure/.test(text)
          ? "admin"
          : /protectedProcedure/.test(text)
            ? "membre"
            : "public";
        procedures[name] = { kind, access, file: rel(file), line: lineOf(file, p), ...effectsOf(file, p.initializer) };
      }
      return;
    }
    ts.forEachChild(n, find);
  });
}

// Fonctions exportées du backend (tâches du serveur, services) : utilisables comme étape.
const functions = {};
for (const [file, sf] of files) {
  for (const st of sf.statements) {
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    const name = ts.isFunctionDeclaration(st) && st.name ? st.name.text : null;
    if (!name) continue;
    const s = effectsOf(file, st);
    if (s.effects.length || s.emails.length) functions[name] = { file: rel(file), line: lineOf(file, st), ...s };
  }
}

const json = JSON.stringify({ procedures, functions }, null, 1) + "\n";

if (process.argv.includes("--write")) {
  writeFileSync(OUT, json);
  console.log(`✓ carte des procédures : ${Object.keys(procedures).length} procédures, ${Object.keys(functions).length} fonctions → ${rel(OUT)}`);
} else {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== json) {
    console.error("✗ carte des procédures périmée : le backend a changé. Lance « pnpm docs:procedures », puis recommence.");
    process.exit(1);
  }
  console.log(`✓ carte des procédures : à jour (${Object.keys(procedures).length} procédures)`);
}
