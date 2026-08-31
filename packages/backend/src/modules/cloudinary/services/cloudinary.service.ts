/**
 * Façade média — point d'import unique des ~25 consommateurs.
 *
 * Phase 2a : passthrough pur vers le backend Cloudinary (le service historique,
 * déplacé dans `backends/cloudinaryBackend.ts`). Aucun changement de
 * comportement. En Phase 2b, ce fichier deviendra un SÉLECTEUR qui re-exporte
 * soit le backend Cloudinary soit un backend local, selon `STORAGE_DRIVER` —
 * sans que les consommateurs changent quoi que ce soit.
 */
export * from "@backend/modules/cloudinary/backends/cloudinaryBackend";
