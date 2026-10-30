import { z } from "zod";

/**
 * richText.ts — le texte riche des blocs du constructeur de pages, assaini.
 *
 * Le contenu ProseMirror arrive en JSON, et `generateHTML` le transforme en HTML injecté tel quel
 * dans la page. Les extensions TipTap échappent le texte, mais certaines recopient leurs ATTRIBUTS
 * sans les valider quand le document vient du JSON (et non d'un collage HTML) :
 *
 *   - `textAlign` et la couleur de `highlight` partent dans un attribut `style` :
 *     `"left; position:fixed; inset:0; z-index:99"` recouvrirait toute la page ;
 *   - un attribut `class` sur un lien accepte n'importe quelle classe utilitaire ;
 *   - un type de nœud inconnu fait LEVER `generateHTML` : toute la page tombe en erreur.
 *
 * Une page est écrite par un administrateur, mais une présentation d'instructeur l'est par un
 * membre, et une requête se fabrique sans passer par l'éditeur. D'où une liste BLANCHE : seuls les
 * nœuds, marques et attributs que l'éditeur sait produire passent, avec des valeurs vérifiées.
 * Le reste est retiré (un nœud inconnu disparaît, son texte avec lui).
 *
 * Appliqué à l'entrée (validation zod des contenus enregistrés) ET à la lecture
 * (`parsePageContentV1`) : un contenu enregistré avant cette règle est assaini au rendu.
 */

type Json = Record<string, unknown>;

const ALIGN = new Set(["left", "center", "right", "justify"]);
const HIGHLIGHT_COLOR = /^(#[0-9a-fA-F]{3,8}|var\(--tt-color-highlight-[a-z]+\))$/;
const CODE_LANGUAGE = /^[a-zA-Z0-9+#-]{1,20}$/;
const LIST_TYPE = new Set(["1", "a", "A", "i", "I"]);
/** Profondeur maximale d'imbrication : au-delà, rien de ce que l'éditeur produit. */
const MAX_DEPTH = 40;

/** Un lien : web, courriel, téléphone, ou chemin du site. Jamais `javascript:` ni `data:`. */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== "string" || href.length > 2000) return false;
  const h = href.trim();
  if (h.startsWith("/") && !h.startsWith("//")) return true;
  if (h.startsWith("#")) return true;
  return /^(https?:|mailto:|tel:)/i.test(h);
}

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" ? v.slice(0, max) : null;

/** Attributs permis, par type de nœud ou de marque, avec leur validation. */
const NODE_ATTRS: Record<string, (attrs: Json) => Json> = {
  doc: () => ({}),
  text: () => ({}),
  paragraph: (a) => (ALIGN.has(a.textAlign as string) ? { textAlign: a.textAlign } : {}),
  heading: (a) => ({
    level: Number.isInteger(a.level) && (a.level as number) >= 1 && (a.level as number) <= 6 ? a.level : 2,
    ...(ALIGN.has(a.textAlign as string) ? { textAlign: a.textAlign } : {}),
  }),
  blockquote: () => ({}),
  bulletList: () => ({}),
  orderedList: (a) => ({
    ...(Number.isInteger(a.start) ? { start: a.start } : {}),
    ...(LIST_TYPE.has(a.type as string) ? { type: a.type } : {}),
  }),
  listItem: () => ({}),
  codeBlock: (a) => (typeof a.language === "string" && CODE_LANGUAGE.test(a.language) ? { language: a.language } : {}),
  hardBreak: () => ({}),
  horizontalRule: () => ({}),
  taskList: () => ({}),
  taskItem: (a) => ({ checked: a.checked === true }),
  "library-image": (a) => ({
    mediaId: str(a.mediaId, 100),
    caption: str(a.caption, 500),
  }),
};

const MARK_ATTRS: Record<string, (attrs: Json) => Json | null> = {
  bold: () => ({}),
  italic: () => ({}),
  strike: () => ({}),
  underline: () => ({}),
  code: () => ({}),
  subscript: () => ({}),
  superscript: () => ({}),
  // Un lien dont l'adresse n'est pas sûre perd sa marque : le texte reste, sans lien.
  link: (a) => (isSafeHref(a.href) ? { href: a.href.trim(), ...(a.target === "_blank" ? { target: "_blank" } : {}) } : null),
  highlight: (a) => (typeof a.color === "string" && HIGHLIGHT_COLOR.test(a.color) ? { color: a.color } : {}),
};

function sanitizeNode(node: unknown, depth: number): Json | null {
  if (!node || typeof node !== "object" || Array.isArray(node) || depth > MAX_DEPTH) return null;
  const n = node as Json;
  const type = n.type;
  if (typeof type !== "string") return null;
  const attrsOf = NODE_ATTRS[type];
  if (!attrsOf) return null;

  const out: Json = { type };
  const attrs = attrsOf((n.attrs && typeof n.attrs === "object" ? n.attrs : {}) as Json);
  if (Object.keys(attrs).length > 0) out.attrs = attrs;

  if (type === "text") {
    if (typeof n.text !== "string" || n.text.length === 0) return null;
    out.text = n.text;
    if (Array.isArray(n.marks)) {
      const marks = n.marks
        .map((m): Json | null => {
          if (!m || typeof m !== "object") return null;
          const mark = m as Json;
          const markAttrs = typeof mark.type === "string" ? MARK_ATTRS[mark.type] : undefined;
          if (!markAttrs) return null;
          const a = markAttrs((mark.attrs && typeof mark.attrs === "object" ? mark.attrs : {}) as Json);
          if (a === null) return null;
          return Object.keys(a).length > 0 ? { type: mark.type, attrs: a } : { type: mark.type };
        })
        .filter((m): m is Json => m !== null);
      if (marks.length > 0) out.marks = marks;
    }
    return out;
  }

  if (Array.isArray(n.content)) {
    out.content = n.content
      .map((child) => sanitizeNode(child, depth + 1))
      .filter((child): child is Json => child !== null);
  }
  return out;
}

/** Le document assaini ; un document inutilisable devient un document vide. */
export function sanitizeRichText(content: Json): Json {
  return sanitizeNode(content, 0) ?? { type: "doc", content: [] };
}

/** Texte riche d'un bloc : un objet, assaini à la validation. */
export const richTextContentSchema = z
  .record(z.string(), z.unknown())
  .transform((content) => sanitizeRichText(content));
