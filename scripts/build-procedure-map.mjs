#!/usr/bin/env node
// Carte des procédures : pour chaque procédure tRPC (et chaque fonction exportée du backend), les
// entités Prisma qu'elle lit, crée, modifie ou supprime, et les e-mails qu'elle envoie.
//
// Le code est la source : ce script charge packages/backend avec le vérificateur de types de
// TypeScript et suit les appels (fonctions, méthodes d'objets et de classes, implémentations
// d'interfaces) jusqu'aux appels Prisma (`prisma.ticket.create`, `tx.ticketEvent.create`…) et aux
// requêtes SQL écrites à la main. Chaque effet garde sa piste (les appels traversés, avec fichier
// et ligne). Le résultat alimente les parcours de la documentation.
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

// Le backend et les server actions du front sont chargés comme un projet TypeScript complet, avec
// le vérificateur de types : c'est lui qui dit quelle fonction se cache derrière `adapter.move(…)`
// ou `service.publish(…)`, comme le ferait « Aller à la définition » dans l'éditeur.
const WEB = join(ROOT, "apps/web/src");
const backendFiles = walk(BACKEND);
// Server actions du front (fichiers « use server ») : elles écrivent aussi en base (profil…).
const serverActions = new Set(
  walk(WEB).filter((f) => /^\s*["']use server["']/.test(readFileSync(f, "utf8").slice(0, 200))),
);

// Pages (composants serveur) et routes d'API du front qui lisent ou écrivent la base elles-mêmes :
// `/agenda`, `GET /api/me/export`… Elles peuvent aussi servir d'étape à un parcours.
const APP = join(WEB, "app");
const appEntries = walk(APP).filter((f) => /\/(page\.tsx|layout\.tsx|route\.ts)$/.test(f));

const backendConfig = join(ROOT, "packages/backend/tsconfig.json");
const parsedConfig = ts.parseJsonConfigFileContent(
  ts.readConfigFile(backendConfig, ts.sys.readFile).config,
  ts.sys,
  dirname(backendConfig),
);
// Alias des deux côtés (`@backend/…`, `@features/…`, `@/…`), en chemins absolus : un même programme
// résout les imports du backend et ceux du front.
const webConfig = join(ROOT, "apps/web/tsconfig.json");
const webPaths = ts.parseJsonConfigFileContent(ts.readConfigFile(webConfig, ts.sys.readFile).config, ts.sys, dirname(webConfig)).options.paths ?? {};
const absolutePaths = {};
for (const [alias, targets] of Object.entries(webPaths)) absolutePaths[alias] = targets.map((t) => resolve(dirname(webConfig), t));
for (const [alias, targets] of Object.entries(parsedConfig.options.paths ?? {})) absolutePaths[alias] = targets.map((t) => resolve(dirname(backendConfig), t));
const program = ts.createProgram({
  rootNames: [...new Set([...parsedConfig.fileNames, ...backendFiles, ...serverActions, ...appEntries])],
  options: { ...parsedConfig.options, paths: absolutePaths, noEmit: true, jsx: ts.JsxEmit.Preserve },
});
const checker = program.getTypeChecker();

const files = new Map(); // chemin → SourceFile (ceux du programme : les nœuds sont partagés avec le vérificateur)
for (const f of [...backendFiles, ...serverActions, ...appEntries]) {
  const sf = program.getSourceFile(f);
  if (sf) files.set(f, sf);
}
/** Fichier du projet (pas une bibliothèque de node_modules) : on y suit les appels. */
const isProjectFile = (f) => f.startsWith(ROOT) && !f.includes("/node_modules/");

function resolveModule(fromFile, spec) {
  let base;
  if (spec.startsWith("@backend/")) base = join(BACKEND, spec.slice("@backend/".length));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  for (const c of [base + ".ts", base + ".tsx", join(base, "index.ts")]) if (files.has(c)) return c;
  return null;
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

/** Corps de fonction d'une déclaration : fonction, méthode, `x: async (…) => …`, `const f = (…) =>`. */
function functionNodeOf(d) {
  if (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d) || ts.isFunctionExpression(d) || ts.isArrowFunction(d)) return d.body ? d : null;
  if ((ts.isPropertyAssignment(d) || ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d)) && d.initializer) {
    const i = d.initializer;
    return ts.isArrowFunction(i) || ts.isFunctionExpression(i) ? i : null;
  }
  return null;
}

/*
 * Implémentations des méthodes : `adapter.move` est déclaré dans une interface (StorageAdapter, dans
 * contracts) ; le code qui s'exécute est la méthode de l'objet renvoyé par createR2StorageAdapter.
 * On indexe donc chaque méthode d'objet ou de classe du projet avec le type de son objet, pour
 * retrouver celles qui réalisent une méthode d'interface.
 */
const implIndex = new Map(); // nom → [{ node, container }]
for (const sf of files.values()) {
  const visit = (n) => {
    if ((ts.isMethodDeclaration(n) || ts.isPropertyAssignment(n) || ts.isPropertyDeclaration(n)) && n.name && ts.isIdentifier(n.name) && functionNodeOf(n)) {
      const container = n.parent;
      if (ts.isObjectLiteralExpression(container) || ts.isClassLike(container)) {
        if (!implIndex.has(n.name.text)) implIndex.set(n.name.text, []);
        implIndex.get(n.name.text).push({ node: n, container });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

function implementationsOf(signature, name, receiver) {
  const owner = signature.parent;
  if (!owner || !(ts.isInterfaceDeclaration(owner) || ts.isTypeLiteralNode(owner))) return [];
  // Le type de l'objet sur lequel on appelle (`adapter` : R2StorageAdapter, paramètres de type
  // résolus) ; à défaut, celui de l'interface.
  const target = receiver ? checker.getTypeAtLocation(receiver) : checker.getTypeAtLocation(owner);
  return (implIndex.get(name) ?? []).filter(({ container }) => {
    const t = ts.isObjectLiteralExpression(container)
      ? checker.getContextualType(container) ?? checker.getTypeAtLocation(container)
      : checker.getTypeAtLocation(container);
    return t && checker.isTypeAssignableTo(t, target);
  });
}

/**
 * Ce qu'exécute un appel `f(…)` ou `objet.méthode(…)` : la ou les fonctions du projet, trouvées par
 * le vérificateur de types (imports, réexportations, méthodes d'objets et de classes, interfaces).
 */
function resolveCall(call) {
  return resolveCallee(call.expression);
}

/** Même résolution pour ce qui est appelé : `f`, `objet.méthode`, ou la balise d'un composant `<Footer />`. */
function resolveCallee(e) {
  const at = ts.isPropertyAccessExpression(e) ? e.name : ts.isIdentifier(e) ? e : null;
  if (!at) return [];
  let sym = checker.getSymbolAtLocation(at);
  if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
  const out = [];
  for (const d of sym?.declarations ?? []) {
    const file = d.getSourceFile().fileName;
    if (!isProjectFile(file)) continue;
    if (ts.isShorthandPropertyAssignment(d)) {
      // `{ publish }` : la fonction `publish` du fichier.
      const v = checker.getShorthandAssignmentValueSymbol(d);
      for (const vd of v?.declarations ?? []) {
        const fn = functionNodeOf(vd);
        if (fn && isProjectFile(vd.getSourceFile().fileName)) out.push({ file: vd.getSourceFile().fileName, node: fn, name: at.text });
      }
      continue;
    }
    if (ts.isMethodSignature(d) || ts.isPropertySignature(d)) {
      for (const impl of implementationsOf(d, at.text, ts.isPropertyAccessExpression(e) ? e.expression : null)) {
        out.push({ file: impl.node.getSourceFile().fileName, node: functionNodeOf(impl.node), name: at.text });
      }
      continue;
    }
    const fn = functionNodeOf(d);
    if (fn) out.push({ file, node: fn, name: at.text });
  }
  return out;
}

// ─── Effets ────────────────────────────────────────────────────────────

/** Clés d'un objet littéral `{ a: …, b }` (champs écrits par data:, lus par select:). */
function keysOf(obj, scope = null, depth = 0) {
  obj = resolveObject(obj, scope);
  // `data: legalInfoData(…)` : les clés des objets que renvoie la fonction du projet appelée.
  if (obj && ts.isCallExpression(obj) && depth < 3) {
    const keys = [];
    for (const target of resolveCall(obj)) {
      const visit = (n) => {
        if (ts.isReturnStatement(n) && n.expression) keys.push(...keysOf(n.expression, target.node, depth + 1));
        else if (!ts.isFunctionLike(n) || n === target.node) ts.forEachChild(n, visit);
      };
      if (ts.isArrowFunction(target.node) && !ts.isBlock(target.node.body)) keys.push(...keysOf(target.node.body, target.node, depth + 1));
      else visit(target.node);
    }
    return [...new Set(keys)];
  }
  if (!obj || !ts.isObjectLiteralExpression(obj)) return [];
  const keys = [];
  for (const p of obj.properties) {
    if ((ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name && ts.isIdentifier(p.name)) keys.push(p.name.text);
    // `...(cond ? {} : { a })`, `...base` : les clés des objets étalés.
    else if (ts.isSpreadAssignment(p)) {
      let x = p.expression;
      while (ts.isParenthesizedExpression(x)) x = x.expression;
      const parts = ts.isConditionalExpression(x) ? [x.whenTrue, x.whenFalse] : [x];
      for (const part of parts) keys.push(...keysOf(part, scope, depth));
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
function nestedWrites(model, data, acc, trail) {
  if (!ts.isObjectLiteralExpression(data)) return;
  const rels = relationsOf.get(model) ?? new Map();
  for (const p of data.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
    const target = rels.get(p.name.text);
    if (!target || !ts.isObjectLiteralExpression(p.initializer)) continue;
    const firstObject = (x) => (x && ts.isArrayLiteralExpression(x) ? x.elements[0] : x);
    const create = firstObject(prop(p.initializer, "create"));
    if (create) {
      acc.effects.push({ model: target, op: "create", fields: keysOf(create), trail });
      nestedWrites(target, create, acc, trail);
    }
    const many = prop(p.initializer, "createMany");
    if (many) acc.effects.push({ model: target, op: "create", fields: keysOf(firstObject(prop(many, "data"))), trail });
    if (prop(p.initializer, "update") || prop(p.initializer, "updateMany") || prop(p.initializer, "upsert")) {
      acc.effects.push({ model: target, op: "update", fields: [], trail });
    }
    if (prop(p.initializer, "delete") || prop(p.initializer, "deleteMany")) {
      acc.effects.push({ model: target, op: "delete", fields: [], trail });
      cascadeDeletes(target, acc, trail);
    }
  }
}

// Tables SQL → modèles (`@@map("…")` sinon le nom du modèle), pour les requêtes SQL écrites à la main.
const tableToModel = new Map([...models.values()].map((m) => [m, m]));
{
  let current = null;
  for (const raw of readFileSync(SCHEMA, "utf8").split(/\r?\n/)) {
    const open = /^model\s+(\w+)\s*\{/.exec(raw.trim());
    if (open) current = open[1];
    const mapped = /^\s*@@map\(\s*"([^"]+)"/.exec(raw);
    if (mapped && current) {
      tableToModel.delete(current);
      tableToModel.set(mapped[1], current);
    }
  }
}

/** Effets d'une requête SQL écrite à la main (`prisma.$executeRaw\`UPDATE "User" SET …\``). */
function sqlEffects(sql) {
  const out = [];
  const model = (t) => tableToModel.get(t);
  for (const m of sql.matchAll(/INSERT\s+INTO\s+"(\w+)"\s*(?:\(([^)]*)\))?/gi)) {
    if (model(m[1])) out.push({ model: model(m[1]), op: "create", fields: [...(m[2] ?? "").matchAll(/"(\w+)"/g)].map((x) => x[1]) });
  }
  for (const m of sql.matchAll(/UPDATE\s+"(\w+)"\s+SET\s+([\s\S]*?)(?:\bWHERE\b|\bFROM\b|\bRETURNING\b|$)/gi)) {
    if (model(m[1])) out.push({ model: model(m[1]), op: "update", fields: [...m[2].matchAll(/"(\w+)"\s*=/g)].map((x) => x[1]) });
  }
  for (const m of sql.matchAll(/DELETE\s+FROM\s+"(\w+)"/gi)) {
    if (model(m[1])) out.push({ model: model(m[1]), op: "delete", fields: [] });
  }
  for (const m of sql.matchAll(/(?<!DELETE\s{1,10})\b(?:FROM|JOIN)\s+"(\w+)"/gi)) {
    if (model(m[1])) out.push({ model: model(m[1]), op: "read", fields: [] });
  }
  return out;
}

const lineOf = (node) => node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
const rel = (f) => relative(ROOT, f);
/** Une étape de la piste : ce qui est appelé, et où le lire (`fichier:ligne`). */
const hop = (label, node) => [label.replace(/\s+/g, " ").slice(0, 80), `${rel(node.getSourceFile().fileName)}:${lineOf(node)}`];

/** Lectures imbriquées : `select` / `include` d'une relation lisent aussi l'entité liée. */
function nestedReads(model, call, acc, trail) {
  const visitShape = (m, shape) => {
    if (!shape || !ts.isObjectLiteralExpression(shape)) return;
    const rels = relationsOf.get(m) ?? new Map();
    for (const p of shape.properties) {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
      const target = rels.get(p.name.text);
      if (!target) continue;
      acc.effects.push({ model: target, op: "read", fields: [], trail });
      if (ts.isObjectLiteralExpression(p.initializer)) {
        visitShape(target, prop(p.initializer, "select"));
        visitShape(target, prop(p.initializer, "include"));
      }
    }
  };
  visitShape(model, argProperty(call, "select"));
  visitShape(model, argProperty(call, "include"));
  // Filtre sur une relation (`where: { pageReferences: { some: {} } }`) : l'entité liée est lue
  // pour décider. AND / OR / NOT et some / every / none / is / isNot sont parcourus.
  const visitWhere = (m, where, depth = 0) => {
    if (!where || !ts.isObjectLiteralExpression(where) || depth > 4) return;
    const rels = relationsOf.get(m) ?? new Map();
    for (const p of where.properties) {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
      const key = p.name.text;
      if (key === "AND" || key === "OR" || key === "NOT") {
        const parts = ts.isArrayLiteralExpression(p.initializer) ? p.initializer.elements : [p.initializer];
        for (const part of parts) visitWhere(m, part, depth + 1);
        continue;
      }
      const target = rels.get(key);
      if (!target) continue;
      acc.effects.push({ model: target, op: "read", fields: [], trail });
      if (ts.isObjectLiteralExpression(p.initializer)) {
        let inner = false;
        for (const q of ["some", "every", "none", "is", "isNot"]) {
          const sub = prop(p.initializer, q);
          if (sub) {
            inner = true;
            visitWhere(target, sub, depth + 1);
          }
        }
        if (!inner) visitWhere(target, p.initializer, depth + 1);
      }
    }
  };
  visitWhere(model, argProperty(call, "where"));
}

/*
 * Suppressions en cascade, lues dans le schéma : supprimer un Ticket supprime ses TicketMessage
 * (`onDelete: Cascade`) ; supprimer un User vide le champ des lignes en `onDelete: SetNull`.
 * C'est la base qui le fait, sans une ligne de code : la piste mène donc au schéma.
 */
const cascadesOf = new Map(); // modèle parent → [{ child, action, fields, line }]
{
  let current = null;
  readFileSync(SCHEMA, "utf8").split(/\r?\n/).forEach((raw, i) => {
    const open = /^model\s+(\w+)\s*\{/.exec(raw.trim());
    if (open) current = open[1];
    const m = /^\s*\w+\s+(\w+)\??\s+@relation\(([^)]*)\)/.exec(raw);
    if (!m || !current) return;
    const action = /onDelete:\s*(Cascade|SetNull)/.exec(m[2]);
    if (!action) return;
    const fields = /fields:\s*\[([^\]]*)\]/.exec(m[2]);
    if (!cascadesOf.has(m[1])) cascadesOf.set(m[1], []);
    cascadesOf.get(m[1]).push({
      child: current,
      action: action[1],
      fields: fields ? fields[1].split(",").map((f) => f.trim()).filter(Boolean) : [],
      line: i + 1,
    });
  });
}

function cascadeDeletes(model, acc, trail, seen = new Set([model])) {
  for (const c of cascadesOf.get(model) ?? []) {
    const where = [...trail, [`onDelete: ${c.action} (${c.child} → ${model})`, `prisma/schema.prisma:${c.line}`]];
    if (c.action === "SetNull") {
      acc.effects.push({ model: c.child, op: "update", fields: c.fields, cascade: true, trail: where });
      continue;
    }
    acc.effects.push({ model: c.child, op: "delete", fields: [], cascade: true, trail: where });
    if (!seen.has(c.child)) {
      seen.add(c.child);
      cascadeDeletes(c.child, acc, where, seen);
    }
  }
}

/**
 * Effets d'un nœud (corps d'une procédure ou d'une fonction), appels suivis. Chaque effet garde sa
 * PISTE : les appels traversés depuis la procédure jusqu'à l'appel Prisma, avec l'endroit où lire
 * chacun. C'est le chemin qu'on suivrait à la main avec « Aller à la définition ».
 */
function collect(node, acc, seen, depth, trail) {
  const visit = (n) => {
    // Une méthode d'objet ou de classe (`return { async move() { … } }`) n'est pas exécutée là où
    // elle est écrite : on la suivra seulement là où elle est appelée (`adapter.move(…)`).
    if (n !== node && isMemberFunction(n)) return;
    // Requête SQL écrite à la main : `prisma.$executeRaw\`…\``, `prisma.$queryRawUnsafe("…")`.
    const rawTag = ts.isTaggedTemplateExpression(n) ? n.tag : ts.isCallExpression(n) ? n.expression : null;
    if (rawTag && ts.isPropertyAccessExpression(rawTag) && /^\$(query|execute)Raw(Unsafe)?$/.test(rawTag.name.text)) {
      const sql = ts.isTaggedTemplateExpression(n) ? n.template.getText() : n.arguments[0]?.getText() ?? "";
      const where = [...trail, hop(`${rawTag.getText()} (SQL)`, n)];
      for (const e of sqlEffects(sql)) {
        acc.effects.push({ ...e, raw: true, trail: where });
        if (e.op === "delete") cascadeDeletes(e.model, acc, where);
      }
    }
    if (ts.isCallExpression(n)) {
      const e = n.expression;
      let prismaCall = false;
      // `<x>.<modèle>.<opération>(…)` : un appel Prisma.
      if (ts.isPropertyAccessExpression(e) && ts.isPropertyAccessExpression(e.expression)) {
        const op = OPS[e.name.text];
        const model = models.get(e.expression.name.text);
        if (op && model) {
          prismaCall = true;
          const fields = [];
          if (op !== "read" && op !== "delete") {
            const data = argProperty(n, "data") ?? argProperty(n, "create") ?? argProperty(n, "update");
            fields.push(...keysOf(data, node));
            if (op === "upsert") fields.push(...keysOf(argProperty(n, "update"), node));
          }
          const where = [...trail, hop(e.getText(), n)];
          const kinds = op === "upsert" ? ["create", "update"] : [op];
          for (const k of kinds) acc.effects.push({ model, op: k, fields, trail: where });
          if (op === "delete") cascadeDeletes(model, acc, where);
          nestedReads(model, n, acc, where);
          // Écritures imbriquées : `data: { messages: { create: { … } } }` crée un TicketMessage.
          const data = argProperty(n, "data");
          if (data) nestedWrites(model, data, acc, where);
        }
      }
      // Tout autre appel : la ou les fonctions du projet qu'il exécute, suivies.
      if (!prismaCall && depth < 8) {
        for (const target of resolveCall(n)) {
          if (/\/email\//.test(target.file) && /^send/.test(target.name)) acc.emails.add(target.name);
          const key = `${target.file}#${target.node.pos}`;
          if (seen.has(key)) continue;
          seen.add(key);
          collect(target.node, acc, seen, depth + 1, [...trail, hop(e.getText(), target.node)]);
        }
      }
    }
    // `<Footer />` dans un composant serveur : le composant s'exécute sur le serveur au rendu de
    // la page, et peut lire la base lui-même. On le suit comme un appel.
    if ((ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) && depth < 8) {
      const tag = n.tagName;
      const name = ts.isIdentifier(tag) ? tag.text : ts.isPropertyAccessExpression(tag) ? tag.name.text : "";
      if (/^[A-Z]/.test(name)) {
        for (const target of resolveCallee(tag)) {
          const key = `${target.file}#${target.node.pos}`;
          if (seen.has(key)) continue;
          seen.add(key);
          collect(target.node, acc, seen, depth + 1, [...trail, hop(`<${tag.getText()}>`, target.node)]);
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
}

function isMemberFunction(n) {
  if (ts.isMethodDeclaration(n) || ts.isGetAccessor(n) || ts.isSetAccessor(n) || ts.isConstructorDeclaration(n)) return true;
  return (ts.isPropertyAssignment(n) || ts.isPropertyDeclaration(n)) && functionNodeOf(n) !== null;
}

const MAX_TRAILS = 3;

function summarize(acc) {
  // Fusion par (entité, opération) : champs dédoublonnés, pistes distinctes (trois au plus).
  const merged = new Map();
  for (const e of acc.effects) {
    const k = `${e.model}:${e.op}`;
    if (!merged.has(k)) merged.set(k, { model: e.model, op: e.op, fields: new Set(), raw: false, direct: false, trails: new Map() });
    const m = merged.get(k);
    for (const f of e.fields) m.fields.add(f);
    if (e.raw) m.raw = true;
    if (!e.cascade) m.direct = true;
    const t = JSON.stringify(e.trail);
    if (m.trails.size < MAX_TRAILS && !m.trails.has(t)) m.trails.set(t, e.trail);
  }
  return {
    effects: [...merged.values()]
      .map((e) => ({
        model: e.model,
        op: e.op,
        fields: [...e.fields].sort(),
        ...(e.raw ? { raw: true } : {}),
        // Seulement par la base (onDelete), jamais par un appel du code.
        ...(e.direct ? {} : { cascade: true }),
        trails: [...e.trails.values()],
      }))
      .sort((a, b) => a.model.localeCompare(b.model) || a.op.localeCompare(b.op)),
    emails: [...acc.emails].sort(),
  };
}

function effectsOf(node) {
  const acc = { effects: [], emails: new Set() };
  collect(node, acc, new Set(), 0, []);
  return summarize(acc);
}
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
  let resolver = null;
  let cur = node;
  while (ts.isCallExpression(cur) && ts.isPropertyAccessExpression(cur.expression)) {
    const method = cur.expression.name.text;
    if (method === "query" || method === "mutation" || method === "subscription") {
      kind = kind === "autre" ? method : kind;
      resolver = cur.arguments[0] ?? null;
    }
    if (method === "use") uses.push(...cur.arguments.map((a) => a.getText()));
    cur = cur.expression.expression;
  }
  let base = ts.isIdentifier(cur) ? cur.text : cur.getText();
  const local = declarationsAny(file).get(base);
  if (local) base = local;
  const chain = `${base} ${uses.join(" ")}`;
  const access =
    /isAdmin\b|adminProcedure/.test(chain) || guardsAdmin(resolver)
      ? "admin"
      : /protectedProcedure/.test(chain)
        ? "membre"
        : "public";
  return { kind, access };
}

/**
 * Garde d'administrateur posée en tête du corps (`await assertAdmin(ctx)`), et non dans une
 * condition : elle s'applique à tout appel de la procédure.
 */
function guardsAdmin(resolver) {
  if (!resolver || !(ts.isArrowFunction(resolver) || ts.isFunctionExpression(resolver)) || !ts.isBlock(resolver.body)) return false;
  return resolver.body.statements.some((st) => {
    if (!ts.isExpressionStatement(st)) return false;
    let e = st.expression;
    if (ts.isAwaitExpression(e)) e = e.expression;
    return ts.isCallExpression(e) && ts.isIdentifier(e.expression) && /^assert(Is)?Admin$/.test(e.expression.text);
  });
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
        procedures[name] = { kind, access, file: rel(file), line: lineOf(p), ...effectsOf(p.initializer) };
      }
      return;
    }
    ts.forEachChild(n, find);
  });
}

// Fonctions exportées du backend (tâches du serveur, services) et server actions du front :
// utilisables comme étape d'un parcours.
const functions = {};
const appEntrySet = new Set(appEntries);
for (const [file, sf] of files) {
  if (appEntrySet.has(file)) continue;
  for (const st of sf.statements) {
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    const name = ts.isFunctionDeclaration(st) && st.name ? st.name.text : null;
    if (!name) continue;
    const s = effectsOf(st);
    if (s.effects.length || s.emails.length) {
      functions[name] = {
        // Une server action vérifie elle-même la session : son accès se lit dans son code.
        ...(serverActions.has(file) ? { kind: "server action" } : {}),
        file: rel(file),
        line: lineOf(st),
        ...s,
      };
    }
  }
}

// Pages et routes : nommées par leur adresse (`page /agenda`, `GET /api/me/export`), groupes de
// routes `(public)` retirés comme le fait Next.
// Un layout garde ses groupes (`layout /(public)`) : sans eux, celui de la racine et celui du
// site public auraient la même adresse.
const routeOf = (file, keepGroups = false) =>
  "/" +
  relative(APP, dirname(file))
    .split("/")
    .filter((seg) => seg && (keepGroups || !/^\(.*\)$/.test(seg)))
    .join("/");
for (const file of appEntries) {
  const sf = files.get(file);
  if (!sf) continue;
  const isPage = file.endsWith("page.tsx") || file.endsWith("layout.tsx");
  const pageKind = file.endsWith("layout.tsx") ? "layout" : "page";
  for (const st of sf.statements) {
    const mods = st.modifiers ?? [];
    if (!mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    let fn = null;
    let name = null;
    if (ts.isFunctionDeclaration(st)) {
      fn = st;
      name = st.name?.text ?? "default";
    } else if (ts.isVariableStatement(st)) {
      const d = st.declarationList.declarations[0];
      if (d && ts.isIdentifier(d.name) && d.initializer && functionNodeOf(d)) {
        fn = functionNodeOf(d);
        name = d.name.text;
      }
    }
    if (!fn) continue;
    const isDefault = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    let key = null;
    if (isPage && isDefault) key = `${pageKind} ${routeOf(file, pageKind === "layout")}`;
    if (!isPage && /^(GET|POST|PUT|PATCH|DELETE)$/.test(name)) key = `${name} ${routeOf(file)}`;
    if (!key) continue;
    const s = effectsOf(fn);
    if (s.effects.length || s.emails.length) {
      functions[key] = { kind: isPage ? pageKind : "route", file: rel(file), line: lineOf(st), ...s };
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
