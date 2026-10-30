import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";
import { sanitizeRichText } from "@contracts/page/richText";
import type { ResolvedMedia } from "@contracts/page";

/**
 * richTextHtml.ts — le texte riche d'un bloc, en HTML. Une seule écriture pour les rendus serveur
 * (tiptap, media-text, float-text) et les aperçus de l'éditeur.
 *
 * Les extensions sont CELLES de l'éditeur (builder-tiptap-editor) : le rendu reflète exactement
 * ce que l'administrateur peut produire. Une extension ajoutée à l'éditeur s'ajoute ICI, sinon
 * le nœud qu'elle produit ne se rendrait pas.
 *
 * Deux protections :
 *   - le contenu est ASSAINI avant rendu (liste blanche de nœuds, marques et attributs,
 *     @contracts/page/richText) : les attributs recopiés dans `style` et les liens `javascript:`
 *     ne passent pas, même pour un contenu enregistré avant la règle ;
 *   - `generateHTML` LÈVE sur un nœud qu'il ne connaît pas : un seul bloc abîmé ferait tomber
 *     toute la page. On rend alors une chaîne vide pour ce bloc, et on le journalise.
 *
 * Le HTML produit est injecté tel quel (`dangerouslySetInnerHTML`) : il ne vient que des
 * `renderHTML` des extensions, qui échappent le texte et les attributs.
 */

type ResolveMedia = (mediaId: string) => ResolvedMedia | null;

/**
 * Image de la bibliothèque dans le texte. Même nom et mêmes attributs que le nœud de l'éditeur
 * (library-image), mais sans vue React : son `renderHTML` lit l'URL résolue par le serveur. Sans
 * résolution (aperçu), ou pour un fichier non publié, il n'émet rien de visible.
 */
const LibraryImageHtml = Node.create<{ resolveMedia: ResolveMedia }>({
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
    const media = mediaId ? this.options.resolveMedia(mediaId) : null;
    if (!media) return ["span", { class: "hidden", "aria-hidden": "true" }];

    const imgAttrs: Record<string, unknown> = {
      src: media.url,
      alt: caption ?? "",
      loading: "lazy",
      decoding: "async",
    };
    if (media.width !== null) imgAttrs.width = media.width;
    if (media.height !== null) imgAttrs.height = media.height;

    return caption
      ? ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs], ["figcaption", {}, caption]]
      : ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs]];
  },
});

/** Le contenu a-t-il quelque chose à rendre ? (un objet non vide) */
export function hasRichText(content: unknown): content is Record<string, unknown> {
  return !!content && typeof content === "object" && Object.keys(content).length > 0;
}

/** HTML du texte riche, assaini ; "" si le contenu est vide ou impossible à rendre. */
export function richTextHtml(content: unknown, resolveMedia?: ResolveMedia): string {
  if (!hasRichText(content)) return "";
  try {
    return generateHTML(sanitizeRichText(content) as JSONContent, [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Subscript,
      Superscript,
      LibraryImageHtml.configure({ resolveMedia: resolveMedia ?? (() => null) }),
    ]);
  } catch (err) {
    console.error("[page-builder] texte riche impossible à rendre", err);
    return "";
  }
}
