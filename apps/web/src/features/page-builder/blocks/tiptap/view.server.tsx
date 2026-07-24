import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";

// Mêmes extensions que `BuilderTipTapEditor` (sous-chantier 5d), pour
// que le rendu serveur reflète exactement les nodes/marks que l'admin
// peut produire en édition.
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";

import type { ResolvedMedia, TipTapBlockV1 } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  ServerLibraryImageNode — variante server-only du nœud library-image    */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Variante de `LibraryImageNode` pour le rendu serveur.
 *
 * Pourquoi une variante ? Le `LibraryImageNode` de
 * `@/features/editor-tiptap/node/library-image-node` :
 *
 *   - importe son `NodeViewRenderer` (composant React `"use client"`)
 *     au module level — ça créerait une frontière client inutile si
 *     on l'importait depuis cette View server
 *   - a un `renderHTML` qui émet volontairement un placeholder sans URL
 *     (parce qu'il sert au copier-coller dans l'éditeur, pas au rendu
 *     final)
 *
 * La variante serveur résout ces deux points :
 *
 *   - même `name`, `group`, `atom`, mêmes `addAttributes` (mediaId +
 *     caption) — schema identique
 *   - pas de NodeView (jamais consommé par `generateHTML`)
 *   - `renderHTML` lit `this.options.resolveMedia(mediaId)` et produit
 *     un vrai `<figure><img/><figcaption/></figure>` avec l'URL
 *     résolue, ou rien si l'asset est introuvable
 *
 * La closure `resolveMedia` est injectée via `.configure({ resolveMedia })`
 * au moment du `generateHTML` (cf. `TipTapView` plus bas).
 */
interface ServerLibraryImageOptions {
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
}

const ServerLibraryImageNode = Node.create<ServerLibraryImageOptions>({
  name: "library-image",
  group: "block",
  atom: true,

  addOptions() {
    return { resolveMedia: () => null };
  },

  addAttributes() {
    return {
      mediaId: { default: null },
      caption: { default: null },
    };
  },

  renderHTML({ node }) {
    const mediaId = node.attrs.mediaId as string | null;
    const caption = node.attrs.caption as string | null;

    // Pas de mediaId → on n'émet rien d'utile (cas anormal mais
    // possible si un composite a été manipulé hors UI).
    if (!mediaId) {
      return ["span", { class: "hidden", "aria-hidden": "true" }];
    }

    const media = this.options.resolveMedia(mediaId);

    // Asset introuvable (hors `published` ou supprimé) → silencieusement
    // omis côté visiteur, cohérent avec le filtrage des autres Views.
    if (!media) {
      return ["span", { class: "hidden", "aria-hidden": "true" }];
    }

    const imgAttrs: Record<string, unknown> = {
      src: media.url,
      alt: caption ?? "",
      loading: "lazy",
      decoding: "async",
    };
    if (media.width !== null) imgAttrs.width = media.width;
    if (media.height !== null) imgAttrs.height = media.height;

    if (caption) {
      return [
        "figure",
        { class: "tiptap-library-image" },
        ["img", imgAttrs],
        ["figcaption", {}, caption],
      ];
    }
    return ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs]];
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `tiptap`.
 *
 * Sérialise le document ProseMirror en HTML via `@tiptap/html`, en
 * passant la même collection d'extensions que `BuilderTipTapEditor` —
 * sauf le `LibraryImageNode` du sous-chantier 3 (interactif, avec
 * NodeView), remplacé par sa variante serveur ci-dessus dont le
 * `renderHTML` ferme sur `resolveMedia` pour injecter les vraies URLs.
 *
 * ─── Sur `dangerouslySetInnerHTML` ─────────────────────────────────────
 *
 * Le HTML qu'on injecte est produit par nous-même via `generateHTML`,
 * qui passe par les `renderHTML` typés des extensions. Il n'y a pas
 * d'évaluation de chaîne arbitraire venue de l'utilisateur — toutes
 * les valeurs (text content, attributs) ont été échappées par les
 * extensions au moment de l'émission. C'est défendable de la même
 * façon que ce que fait tout site qui rend du contenu structuré
 * côté serveur.
 *
 * ─── Sur le styling ───────────────────────────────────────────────────
 *
 * On wrappe dans `.tiptap-rendered` sans imposer de tokens spécifiques
 * — à toi de styler la classe globalement (CSS, Tailwind base layer,
 * ou prose si tu installes @tailwindcss/typography). Les `<figure>`
 * des images de bibliothèque portent en plus `.tiptap-library-image`
 * pour un ciblage fin.
 */
export function TipTapView({
  block,
  resolveMedia,
}: BlockViewProps<TipTapBlockV1>) {
  const html = generateHTML(block.content as JSONContent, [
    StarterKit.configure({ horizontalRule: false }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Typography,
    Subscript,
    Superscript,
    ServerLibraryImageNode.configure({ resolveMedia }),
  ]);

  return (
    <div
      // `akfc-prose` manquait ici : ce bloc s'étalait sur toute la largeur
      // du puits — environ 150 caractères par ligne — pendant qu'un bloc
      // media-text réduit à son texte se limitait à 68. Deux blocs de texte
      // voisins ne se lisaient pas à la même largeur.
      className="akfc-prose tiptap-rendered prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}