import type { PageContentV1 } from '@contracts/page/blocks.v1';

/**
 * Extraction du texte BRUT d'un composite de page.
 *
 * Sert à mesurer ce qu'un rédacteur a réellement tapé, sans compter le
 * balisage, les légendes ni les identifiants de médias. C'est la seule
 * mesure qui ait un sens pour une limite éditoriale : compter le JSON
 * pénaliserait quelqu'un qui met un mot en gras.
 */

/**
 * Longueur maximale de la présentation synthétique d'une discipline.
 *
 * Une présentation qui dépasse cette longueur cesse d'être synthétique et
 * fait double emploi avec la page détaillée — c'est précisément ce que la
 * limite empêche.
 *
 * Vit dans les contrats et non dans le formulaire pour que le backend
 * puisse la faire respecter à son tour, sans dupliquer la valeur.
 */
export const DISCIPLINE_SUMMARY_MAX_CHARS = 600;

/**
 * Texte d'un nœud ProseMirror et de sa descendance.
 *
 * Les nœuds sont joints par une espace : deux paragraphes successifs
 * comptent pour deux mots séparés et non pour un mot collé.
 */
function textFromNode(node: unknown): string {
  if (node === null || typeof node !== 'object') return '';
  const n = node as { text?: unknown; content?: unknown };
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(textFromNode).join(' ');
  }
  return '';
}

/**
 * Texte brut de tous les blocs porteurs de texte riche (tiptap, media-text,
 * float-text). Les blocs de médias n'ont pas de texte propre et ne comptent
 * donc pas.
 */
export function plainTextFromPageContentV1(content: PageContentV1): string {
  return content.blocks
    .map((block) => ('content' in block ? textFromNode(block.content) : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
