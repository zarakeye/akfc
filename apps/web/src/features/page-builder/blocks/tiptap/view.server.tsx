import type { TipTapBlockV1 } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";
import { richTextHtml } from "../../richTextHtml";

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `tiptap`.
 *
 * Le HTML vient de `richTextHtml` (../../richTextHtml) : contenu assaini par liste blanche, mêmes
 * extensions que l'éditeur, images de la bibliothèque résolues par le serveur, et un bloc abîmé
 * rendu vide au lieu de faire tomber la page.
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
  const html = richTextHtml(block.content, resolveMedia);

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