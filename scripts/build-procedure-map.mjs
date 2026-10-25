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
const parse = (f) => ts.createSourceFile(f, readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true, f.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
for (const f of walk(BACKEND)) files.set(f, parse(f));

// Server actions du front (fichiers « use server ») : elles écrivent aussi en base (profil…).
const WEB = join(ROOT, "apps/web/src");
const serverActions = new Set();
for (const f of walk(WEB)) {
  const head = readFileSync(f, "utf8").slice(0, 200);
  if (/^\s*["']use server["']/.test(head)) {
    files.set(f, parse(f));
    serverActions.add(f);
  }
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

/*
 * Méthodes du backend : `adapter.registerUploadedAsset(…)` appelle une méthode d'objet (adaptateur
 * de stockage, service en objet) ou de classe. Sans types, on ne sait pas quel objet est derrière
 * `adapter` ; on suit donc la méthode seulement si son nom est déclaré UNE seule fois dans le
 * backend (et qu'il est composé, comme `registerUploadedAsset` : pas `get` ni `list`).
 */
const methodIndex = new Map(); // nom → [{ file, node }]
for (const [file, sf] of files) {
  if (serverActions.has(file)) continue;
  const visit = (n) => {
    let name = null;
    let fn = null;
    if ((ts.isMethodDeclaration(n) || ts.isPropertyAssignment(n)) && n.name && ts.isIdentifier(n.name)) {
      name = n.name.text;
      fn = ts.isMethodDeclaration(n) ? n : n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer)) ? n.initializer : null;
    }
    if (name && fn && /^[a-z]+[A-Z]/.test(name)) {
      if (!methodIndex.has(name)) methodIndex.set(name, []);
      methodIndex.get(name).push({ file, node: fn, name });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
function resolveMethod(name) {
  const found = methodIndex.get(name);
  return found && found.length === 1 ? found[0] : null;
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
function keysOf(obj, scope = null) {
  obj = resolveObject(obj, scope);
  if (!obj || !ts.isObjectLiteralExpression(obj)) return [];
  const keys = [];
  for (const p of obj.properties) {
    if ((ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name && ts.isIdentifier(p.name)) keys.push(p.name.text);
    // `...(cond ? {} : { a })`, `...base` : les clés des objets étalés.
    else if (ts.isSpreadAssignment(p)) {
      let x = p.expression;
      while (ts.isParenthesizedExpression(x)) x = x.expression;
      const parts = ts.isConditionalExpression(x) ? [x.whenTrue, x.whenFalse] : [x];
      for (const part of parts) keys.push(...keysOf(part, scope));
    }
  }
  return [...new Set(keys)];
}

/** `data: updateData` : l'objet littéral d'une constante locale de la fonction analysée. */
function resolveObject(expr, scope) {
  while (expr && ts.isParenthesizedExpression(expr)) expr = expr.expression;
  if (!expr || !scope || !ts.isIdentifier(expr)) return expr;
  let found = null;
  const find = (n) => {
    if (found) return;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === expr.text && n.initializer) found = n.initializer;
    else ts.forEachChild(n, find);
  };
  find(scope);
  while (found && (ts.isParenthesizedExpression(found) || ts.isSatisfiesExpression?.(found) || ts.isAsExpression(found))) found = found.expression;
  return found && ts.isObjectLiteralExpression(found) ? found : expr;
}

function argProperty(call, key) {
  const arg = call.arguments[0];
  if (!arg || !ts.isObjectLiteralExpression(arg)) return null;
  const p = arg.properties.find((x) => (ts.isPropertyAssignment(x) || ts.isShorthandPropertyAssignment(x)) && ts.isIdentifier(x.name) && x.name.text === key);
  return p ? (ts.isShorthandPropertyAssignment(p) ? p.name : p.initializer) : null;
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
            fields.push(...keysOf(data, node));
            if (op === "upsert") fields.push(...keysOf(argProperty(n, "update"), node));
          }
          const kinds = op === "upsert" ? ["create", "update"] : [op];
          for (const k of kinds) acc.effects.push({ model, op: k, fields });
          // Écritures imbriquées : `data: { messages: { create: { … } } }` crée un TicketMessage.
          const data = argProperty(n, "data");
          if (data) nestedWrites(model, data, acc);
        }
      }
      // `f(…)` : une fonction du backend, suivie ; `objet.méthode(…)` : une méthode au nom unique.
      const calleeName = ts.isIdentifier(e) ? e.text : null;
      const methodName = ts.isPropertyAccessExpression(e) && !OPS[e.name.text] && ts.isIdentifier(e.name) ? e.name.text : null;
      if ((calleeName || methodName) && depth < 6) {
        const target = calleeName ? resolveCallee(file, calleeName) : resolveMethod(methodName);
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

/**
 * Nature et accès d'une procédure, lus dans sa CHAÎNE seulement (`adminProcedure.input(…).query(…)`,
 * `protectedProcedure.use(isAdmin)…`) — jamais dans son corps, qui peut très bien appeler
 * isAdminByGroup sans être réservé aux admins. Une base locale (`const adminProcedure =
 * protectedProcedure.use(isAdmin)`) est remplacée par sa définition.
 */
function procedureShape(file, node) {
  let kind = "autre";
  const uses = [];
  let cur = node;
  while (ts.isCallExpression(cur) && ts.isPropertyAccessExpression(cur.expression)) {
    const method = cur.expression.name.text;
    if (method === "query" || method === "mutation" || method === "subscription") kind = kind === "autre" ? method : kind;
    if (method === "use") uses.push(...cur.arguments.map((a) => a.getText()));
    cur = cur.expression.expression;
  }
  let base = ts.isIdentifier(cur) ? cur.text : cur.getText();
  const local = declarationsAny(file).get(base);
  if (local) base = local;
  const chain = `${base} ${uses.join(" ")}`;
  const access = /isAdmin\b|adminProcedure/.test(chain) ? "admin" : /protectedProcedure/.test(chain) ? "membre" : "public";
  return { kind, access };
}

/** Constantes du fichier (texte de leur valeur) : bases de procédure définies localement. */
function declarationsAny(file) {
  const map = new Map();
  for (const st of files.get(file).statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer) map.set(d.name.text, d.initializer.getText());
    }
  }
  return map;
}

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
        const { kind, access } = procedureShape(file, p.initializer);
        procedures[name] = { kind, access, file: rel(file), line: lineOf(file, p), ...effectsOf(file, p.initializer) };
      }
      return;
    }
    ts.forEachChild(n, find);
  });
}

// Fonctions exportées du backend (tâches du serveur, services) et server actions du front :
// utilisables comme étape d'un parcours.
const functions = {};
for (const [file, sf] of files) {
  for (const st of sf.statements) {
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    const name = ts.isFunctionDeclaration(st) && st.name ? st.name.text : null;
    if (!name) continue;
    const s = effectsOf(file, st);
    if (s.effects.length || s.emails.length) {
      functions[name] = {
        // Une server action vérifie elle-même la session : son accès se lit dans son code.
        ...(serverActions.has(file) ? { kind: "server action" } : {}),
        file: rel(file),
        line: lineOf(file, st),
        ...s,
      };
    }
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
