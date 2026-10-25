import type { EntityEnum, EntityLink, EntityMap, EntityModel } from "@features/docs/entities/prismaSchema";

/** En-tête d'un chapitre : entités mobilisées, et pour chacune les propriétés dont il parle. */
export type ChapterEntities = Record<string, string[]>;

/**
 * Rôle d'une entité dans la carte d'un chapitre :
 * - `focus` : déclarée par le chapitre ;
 * - `bridge` : non déclarée, mais reliée à au moins deux entités du chapitre (souvent une entité de
 *   liaison, comme l'adhésion d'un membre à un groupe) — elle explique comment elles tiennent ensemble ;
 * - `neighbor` : reliée à une seule entité du chapitre ; affichée seulement à la demande.
 */
export type EntityRole = "focus" | "bridge" | "neighbor" | "story";

export type GraphModel = EntityModel & { role: EntityRole; focusFields: string[] };

export type ChapterGraph = {
  models: GraphModel[];
  links: EntityLink[];
  /** Énumérations utilisées par les propriétés des entités présentes. */
  enums: EntityEnum[];
};

/** Lit l'en-tête `entities` d'un chapitre (YAML) ; ignore ce qui n'a pas la bonne forme. */
export function readChapterEntities(raw: unknown): ChapterEntities | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: ChapterEntities = {};
  for (const [name, fields] of Object.entries(raw as Record<string, unknown>)) {
    out[name] = Array.isArray(fields) ? fields.filter((f): f is string => typeof f === "string") : [];
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Sous-carte d'un chapitre : ses entités, celles qui les relient, et leurs voisines. `extra` :
 * entités touchées par les parcours du chapitre et absentes du reste (rôle `story`, affichées
 * seulement pendant un parcours).
 */
export function buildChapterGraph(map: EntityMap, declared: ChapterEntities, extra: string[] = []): ChapterGraph {
  const byName = new Map(map.models.map((m) => [m.name, m]));
  const focus = new Set(Object.keys(declared).filter((n) => byName.has(n)));

  // Entités reliées à une entité du chapitre, et combien d'entités du chapitre chacune touche.
  const touches = new Map<string, Set<string>>();
  for (const l of map.links) {
    const pairs: [string, string][] = [
      [l.from, l.to],
      [l.to, l.from],
    ];
    for (const [a, b] of pairs) {
      if (focus.has(b) && !focus.has(a)) {
        if (!touches.has(a)) touches.set(a, new Set());
        touches.get(a)!.add(b);
      }
    }
  }

  const role = (name: string): EntityRole | null => {
    if (focus.has(name)) return "focus";
    const t = touches.get(name);
    if (t) return t.size >= 2 ? "bridge" : "neighbor";
    return extra.includes(name) ? "story" : null;
  };

  const models: GraphModel[] = map.models
    .map((m) => ({ m, r: role(m.name) }))
    .filter((x): x is { m: EntityModel; r: EntityRole } => x.r !== null)
    .map(({ m, r }) => ({ ...m, role: r, focusFields: declared[m.name] ?? [] }));

  const present = new Set(models.map((m) => m.name));
  const links = map.links.filter((l) => present.has(l.from) && present.has(l.to));
  const usedEnums = new Set(models.flatMap((m) => m.fields.filter((f) => f.kind === "enum").map((f) => f.type)));
  const enums = map.enums.filter((e) => usedEnums.has(e.name));

  return { models, links, enums };
}

/** Ce qu'un en-tête déclare et que le schéma ne connaît pas (entité ou propriété). */
export function unknownChapterEntities(map: EntityMap, declared: ChapterEntities): string[] {
  const byName = new Map(map.models.map((m) => [m.name, m]));
  const errors: string[] = [];
  for (const [name, fields] of Object.entries(declared)) {
    const m = byName.get(name);
    if (!m) {
      errors.push(name);
      continue;
    }
    for (const f of fields) if (!m.fields.some((x) => x.name === f)) errors.push(`${name}.${f}`);
  }
  return errors;
}
