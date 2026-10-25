import fs from "node:fs";
import path from "node:path";

/*
 * Lecture du schéma Prisma pour la carte des entités de la documentation.
 *
 * Le schéma est la source unique : entités, propriétés, commentaires `///` et relations sont lus
 * dans prisma/schema.prisma à chaque construction de page (mis en cache), jamais recopiés. Une
 * migration qui ajoute un champ l'ajoute donc à la carte.
 *
 * Analyseur volontairement simple : il suit les conventions de ce schéma (un champ par ligne,
 * commentaires `///` au-dessus de l'élément qu'ils décrivent). Il ne valide pas le schéma : Prisma
 * s'en charge.
 */

export type EntityField = {
  name: string;
  /** Type tel qu'écrit, sans ? ni [] (String, DateTime, Ticket, TicketStatus…). */
  type: string;
  optional: boolean;
  list: boolean;
  kind: "scalar" | "enum" | "relation";
  /** Commentaire `///` (lignes jointes par un espace). */
  doc: string;
  /** Attributs bruts (@id, @unique, @default(…)…), sans la relation. */
  attributes: string[];
};

export type EntityModel = {
  name: string;
  doc: string;
  fields: EntityField[];
  /** Entité de liaison : relie deux entités et porte la relation elle-même (voir isJoinModel). */
  isJoin: boolean;
};

export type EntityEnum = { name: string; doc: string; values: { name: string; doc: string }[] };

/** Relation entre deux entités, vue du côté qui porte la clé (fields: […]). */
export type EntityLink = {
  id: string;
  /** Entité qui porte la clé étrangère (côté « plusieurs », ou côté secondaire d'un 1–1). */
  from: string;
  /** Champ de relation sur `from` (ex. Ticket.category). */
  fromField: string;
  /** Clés étrangères (ex. ["categoryId"]). */
  fkFields: string[];
  to: string;
  /** Champ inverse sur `to` (ex. TicketCategory.tickets), s'il existe. */
  toField: string | null;
  /** "N-1" (plusieurs `from` pour un `to`), "1-1", ou "N-N" (relation implicite). */
  cardinality: "N-1" | "1-1" | "N-N";
  /** Lien obligatoire (clé non optionnelle). */
  required: boolean;
  /** Effet de la suppression de `to` sur `from` (Cascade, SetNull, Restrict…). */
  onDelete: string;
};

export type EntityMap = {
  models: EntityModel[];
  enums: EntityEnum[];
  links: EntityLink[];
};

function resolveSchemaPath(): string {
  const candidates = [
    path.join(process.cwd(), "..", "..", "prisma", "schema.prisma"),
    path.join(process.cwd(), "prisma", "schema.prisma"),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`schema.prisma introuvable. Essayé :\n- ${candidates.join("\n- ")}`);
  return found;
}

/** Attribut @relation brut de chaque champ de relation (utilisé seulement pour calculer les liens). */
const relationAttr = new WeakMap<EntityField, string | null>();

/** Analyse le texte d'un schéma Prisma. */
export function parsePrismaSchema(source: string): EntityMap {
  const lines = source.split(/\r?\n/);
  const rawModels: { name: string; doc: string; lines: { text: string; doc: string }[]; uniques: string[][] }[] = [];
  const enums: EntityEnum[] = [];

  let docBuffer: string[] = [];
  let current: {
    kind: "model" | "enum";
    name: string;
    doc: string;
    body: { text: string; doc: string }[];
    uniques: string[][];
  } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("///")) {
      docBuffer.push(line.replace(/^\/\/\/\s?/, ""));
      continue;
    }
    if (!current) {
      const m = /^(model|enum)\s+(\w+)\s*\{/.exec(line);
      if (m) {
        current = { kind: m[1] as "model" | "enum", name: m[2], doc: joinDoc(docBuffer), body: [], uniques: [] };
      }
      docBuffer = [];
      continue;
    }
    if (line === "}") {
      if (current.kind === "model")
        rawModels.push({ name: current.name, doc: current.doc, lines: current.body, uniques: current.uniques });
      else
        enums.push({
          name: current.name,
          doc: current.doc,
          values: current.body.map((b) => ({ name: b.text.split(/\s+/)[0], doc: b.doc })),
        });
      current = null;
      docBuffer = [];
      continue;
    }
    // Clés composées (@@id, @@unique) : elles signalent une entité de liaison.
    const compound = /^@@(?:id|unique)\(\s*(?:fields:\s*)?\[([^\]]*)\]/.exec(line);
    if (compound) current.uniques.push(compound[1].split(",").map((f) => f.trim()).filter(Boolean));
    if (line === "" || line.startsWith("//") || line.startsWith("@@")) {
      if (line === "" || line.startsWith("@@")) docBuffer = [];
      continue;
    }
    current.body.push({ text: line, doc: joinDoc(docBuffer) });
    docBuffer = [];
  }

  const modelNames = new Set(rawModels.map((m) => m.name));
  const enumNames = new Set(enums.map((e) => e.name));

  const uniquesOf = new Map(rawModels.map((m) => [m.name, m.uniques]));
  const models: EntityModel[] = rawModels.map((m) => ({
    name: m.name,
    doc: m.doc,
    isJoin: false,
    fields: m.lines.map(({ text, doc }) => {
      const [name, rawType = "", ...rest] = text.split(/\s+/);
      const list = rawType.endsWith("[]");
      const optional = rawType.endsWith("?");
      const type = rawType.replace(/\[\]$|\?$/, "");
      const kind: EntityField["kind"] = modelNames.has(type)
        ? "relation"
        : enumNames.has(type)
          ? "enum"
          : "scalar";
      const attrs = splitAttributes(rest.join(" "));
      const field: EntityField = {
        name,
        type,
        optional,
        list,
        kind,
        doc,
        attributes: attrs.filter((a) => !a.startsWith("@relation")),
      };
      relationAttr.set(field, attrs.find((a) => a.startsWith("@relation")) ?? null);
      return field;
    }),
  }));

  const links = buildLinks(models);
  for (const m of models) m.isJoin = isJoinModel(m, links, uniquesOf.get(m.name) ?? []);

  return { models, enums, links };
}

/**
 * Commentaire `///` : les lignes sont GARDÉES (pas fusionnées) pour que l'affichage respecte la mise
 * en forme du schéma — paragraphes séparés par une ligne vide, listes en « - », suite d'un élément
 * de liste indentée. Voir DocText (EntityExplorer).
 */
function joinDoc(buffer: string[]): string {
  return buffer.map((l) => l.replace(/\s+$/, "")).join("\n").trim();
}

/** « @id @default(cuid()) @relation(fields: [a], …) » → ["@id", "@default(cuid())", "@relation(…)"]. */
function splitAttributes(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "@" && depth === 0 && cur.trim()) {
      out.push(cur.trim());
      cur = "";
    }
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((a) => a.startsWith("@"));
}

function relationArgs(attr: string | null): { name: string | null; fields: string[]; onDelete: string | null } {
  if (!attr) return { name: null, fields: [], onDelete: null };
  const name = /@relation\(\s*"([^"]+)"/.exec(attr)?.[1] ?? /name:\s*"([^"]+)"/.exec(attr)?.[1] ?? null;
  const fields = /fields:\s*\[([^\]]*)\]/.exec(attr)?.[1].split(",").map((f) => f.trim()).filter(Boolean) ?? [];
  const onDelete = /onDelete:\s*(\w+)/.exec(attr)?.[1] ?? null;
  return { name, fields, onDelete };
}

function buildLinks(models: EntityModel[]): EntityLink[] {
  const byName = new Map(models.map((m) => [m.name, m]));
  const rel = (f: EntityField) => relationArgs(relationAttr.get(f) ?? null);
  const links: EntityLink[] = [];
  const seenImplicit = new Set<string>();

  for (const m of models) {
    for (const f of m.fields) {
      if (f.kind !== "relation") continue;
      const r = rel(f);
      const target = byName.get(f.type);
      if (!target) continue;
      // Champ inverse : même nom de relation (ou sans nom), type = m.
      const inverse =
        target.fields.find(
          (g) => g.kind === "relation" && g.type === m.name && g !== f && rel(g).name === r.name,
        ) ?? null;

      if (r.fields.length > 0) {
        const required = !f.optional;
        links.push({
          id: `${m.name}.${f.name}`,
          from: m.name,
          fromField: f.name,
          fkFields: r.fields,
          to: target.name,
          toField: inverse?.name ?? null,
          cardinality: inverse && !inverse.list ? "1-1" : "N-1",
          required,
          // Défauts de Prisma : Restrict pour une relation obligatoire, SetNull sinon.
          onDelete: r.onDelete ?? (required ? "Restrict" : "SetNull"),
        });
      } else if (f.list && inverse?.list) {
        // Relation N–N implicite (table de liaison gérée par Prisma) : un seul lien.
        const key = [m.name, target.name].sort().join("~") + (r.name ?? "");
        if (seenImplicit.has(key)) continue;
        seenImplicit.add(key);
        links.push({
          id: `${m.name}.${f.name}`,
          from: m.name,
          fromField: f.name,
          fkFields: [],
          to: target.name,
          toField: inverse.name,
          cardinality: "N-N",
          required: false,
          onDelete: "Cascade",
        });
      }
    }
  }
  return links;
}

/**
 * Entité de liaison : elle relie deux autres entités par des clés OBLIGATOIRES, et le couple est
 * unique (@@unique ou @@id composé) — une adhésion par membre et par groupe, un accusé de lecture par
 * membre et par document. Elle peut porter une donnée de la relation (le niveau d'accès, la date de
 * lecture). Sur la carte, elle est dessinée comme un petit atome posé sur la liaison.
 */
function isJoinModel(m: EntityModel, links: EntityLink[], uniques: string[][]): boolean {
  const own = links.filter((l) => l.from === m.name && l.required && l.to !== m.name);
  return uniques.some((u) => {
    const targets = new Set(own.filter((l) => l.fkFields.some((f) => u.includes(f))).map((l) => l.to));
    return targets.size >= 2;
  });
}

let cache: { mtimeMs: number; map: EntityMap } | null = null;

/** Carte des entités du projet (relue si le schéma a changé). */
export function getEntityMap(): EntityMap {
  const file = resolveSchemaPath();
  const mtimeMs = fs.statSync(file).mtimeMs;
  if (cache && cache.mtimeMs === mtimeMs) return cache.map;
  const map = parsePrismaSchema(fs.readFileSync(file, "utf8"));
  cache = { mtimeMs, map };
  return map;
}
