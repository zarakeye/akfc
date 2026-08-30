/// Point d'entrée principal pour les types et schémas partagés
/// entre le backend et le frontend. Tout ce qui est exporté ici est accessible
/// depuis les deux environnements, ce qui facilite la synchronisation des types
/// et des contrats d'interface.

/* -------------------------------------------------------------------------- */
/*                                   AUTH / RBAC                              */
/* -------------------------------------------------------------------------- */
export * from '@contracts/auth/auth.schema';
export * from '@contracts/auth/session.types';
export * from '@contracts/auth/constants';

/* -------------------------------------------------------------------------- */
/*                                   CLOUDINARY                               */
/* -------------------------------------------------------------------------- */
export * from '@contracts/cloudinary/finder.types';
export * from '@contracts/cloudinary/folder.types';
export * from '@contracts/cloudinary/move.schema';
export * from '@contracts/cloudinary/move.types';
export * from '@contracts/cloudinary/upload.schema';

/* -------------------------------------------------------------------------- */
/*                                   FORMS                                    */
/* -------------------------------------------------------------------------- */
export * from '@contracts/forms/createPermissionForm.schema';
export * from '@contracts/forms/saveCategoryForm.schema';
export * from '@contracts/forms/form-action.types';
export * from '@contracts/forms/updateMeForm.schema';

export * from '@contracts/upload/upload.schema';

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/*  Contrat versionné du contenu d'une page (composite de blocs typés).       */
/*  Voir packages/contracts/src/page/README.md pour la philosophie.           */
/* -------------------------------------------------------------------------- */
export * from '@contracts/page';

/* -------------------------------------------------------------------------- */
/*                                   STORAGE                                  */
/*  Contrat agnostique des adapters de stockage (Cloudinary, R2, S3, FS…).    */
/*  Voir packages/contracts/src/storage/storage.adapter.ts pour les détails.  */
/* -------------------------------------------------------------------------- */
export * from '@contracts/storage';

// packages/contracts/src/index.ts
export * from "@contracts/slug/slug.schema";

/* -------------------------------------------------------------------------- */
/*                                   SHARED                                   */
/*  Schémas transverses réutilisés par plusieurs domaines (PageBuilder,       */
/*  commentaires…). Voir chaque module pour la doc.                           */
/* -------------------------------------------------------------------------- */
export * from '@contracts/shared/prosemirror';
