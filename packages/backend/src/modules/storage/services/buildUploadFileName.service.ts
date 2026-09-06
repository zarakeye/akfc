import slugify from 'slugify';

/**
 * Nom de fichier sûr pour une clé de stockage, dérivé du nom d'origine.
 *
 * Vivait côté client dans `DragNDropForm` (`buildR2Path` + un `slugify`
 * maison). Deux problèmes réglés en le remontant ici :
 *
 *   1. le `slugify` maison divergeait du paquet npm sur `&` (→ `and`) et `%`
 *      (→ `percent`) : une discipline « Arts & Combat » produisait deux
 *      dossiers, l'un pour ses photos (Cloudinary, chemin serveur), l'autre
 *      pour ses PDF (R2, chemin client). Une seule fonction = zéro écart ;
 *   2. la règle de nommage devient une décision serveur, pas une supposition
 *      que le client aurait pu contourner.
 *
 * Le base name est slugifié ; l'extension est conservée en minuscules. Un nom
 * sans extension reste sans extension.
 */
export function buildUploadFileName(originalFileName: string): string {
  const dotIdx = originalFileName.lastIndexOf('.');
  const hasExt = dotIdx > 0 && dotIdx < originalFileName.length - 1;

  const baseName = hasExt
    ? originalFileName.slice(0, dotIdx)
    : originalFileName;
  const ext = hasExt ? originalFileName.slice(dotIdx).toLowerCase() : '';

  // Underscores et séparateurs → tirets AVANT slugify (sinon strict les
  // SUPPRIME et colle les tokens : baccalaureat_stephane → baccalaureatstephane).
  const safeBase =
    slugify(baseName.replace(/_+/g, ' '), { lower: true, strict: true }) ||
    'fichier';

  return `${safeBase}${ext}`;
}
