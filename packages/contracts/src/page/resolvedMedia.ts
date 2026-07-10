/* ============================================================================
 *  ResolvedMedia
 * ----------------------------------------------------------------------------
 *  DTO transverse : la forme retournée par la résolution d'un mediaId vers
 *  les informations nécessaires au rendu d'un asset (URL + métadonnées).
 *
 *  Vit dans `@contracts/page` parce que c'est le carrefour entre :
 *
 *    - le service backend `resolveMediaByIds` (sous-chantier 6) qui produit
 *      ces objets en interrogeant MediaAsset et en construisant les URLs
 *      relatives via les routes de proxy
 *
 *    - les `View` du builder (RSC) qui les consomment via la fonction de
 *      lookup `resolveMedia(mediaId)` que le PageRenderer leur passe
 *
 *    - la procédure tRPC `media.resolveByIds` (sous-chantier 4) qui re-expose
 *      la même forme côté admin pour l'édition (NodeView, previews du
 *      MediaListEditor)
 *
 *  Garder ce type ici garantit qu'il n'y a qu'une seule définition canonique,
 *  pas de divergence entre backend et frontend.
 *
 *  Champs :
 *    - `url`       : chemin relatif vers la route de proxy
 *                    (`/api/media/by-public-id/...` pour Cloudinary,
 *                     `/api/media/r2/...` pour R2)
 *    - `mimeType`  : utile pour discriminer (image/audio/document) et
 *                    pour les attributs HTML (`<audio type="...">`)
 *    - `fileName`  : dernier segment du `fullPath`, sert de label de
 *                    repli quand l'éditeur n'a pas saisi de
 *                    title/label/caption
 *    - `width/height` : pour `<img>`, évitent le layout shift
 *    - `duration`     : pour audio/vidéo, optionnel
 * ========================================================================= */

export interface ResolvedMedia {
  url: string;
  /**
   * Nature du média, dérivée du resourceType/mimeType côté résolution.
   * Permet au rendu de choisir l'élément (`<img>` vs poster + `<video>`)
   * sans ré-inspecter le mimeType.
   */
  kind: 'image' | 'video' | 'audio' | 'document';
  /**
   * URL de poster (frame figée) pour les vidéos — chemin proxy avec
   * `&as=poster`. `null` pour tout ce qui n'est pas une vidéo : le rendu
   * utilise alors `url` directement.
   */
  posterUrl: string | null;
  mimeType: string;
  fileName: string;
  width: number | null;
  height: number | null;
  duration: number | null;
}
