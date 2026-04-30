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
export * from '@contracts/forms/createCategoryForm.schema';
export * from '@contracts/forms/createUserForm.schema';
export * from '@contracts/forms/createRoleForm.schema';
export * from '@contracts/forms/form-action.types';
export * from '@contracts/forms/updateMeForm.schema';
export * from '@contracts/forms/updateRoleForm.schema';
export * from '@contracts/forms/updateUserRoleById.schema';