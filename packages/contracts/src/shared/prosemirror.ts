import { z } from 'zod';

/**
 * Contenu ProseMirror — schéma partagé.
 *
 * Le contenu ProseMirror est traité comme une donnée OPAQUE par le contrat.
 *
 * Raison : la grammaire ProseMirror est récursive et dépend des extensions
 * TipTap chargées — elle diffère donc d'un éditeur à l'autre (le builder
 * complet du PageBuilder n'accepte pas les mêmes nodes que l'éditeur bridé
 * des commentaires). La modéliser strictement reviendrait à dupliquer ce
 * que TipTap valide déjà à l'hydratation. On exige juste que ce soit un
 * objet (pas null, pas un primitif), ce qui filtre les payloads
 * grossièrement corrompus sans contraindre la structure interne.
 *
 * Consommateurs actuels :
 *   - blocs `tiptap` du PageBuilder (page/blocks.v1.ts) ;
 *   - `Comment.content` (router `comments` côté backend).
 *
 * Note : l'extracteur du PageBuilder (page/extractMediaIds.ts) traverse
 * cet arbre défensivement — un payload mal formé rend une liste vide
 * plutôt que de jeter.
 */
export const proseMirrorContentSchema = z.record(z.string(), z.unknown());

export type ProseMirrorContent = z.infer<typeof proseMirrorContentSchema>;
