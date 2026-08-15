/**
 * instrumentation.ts
 *
 * Hook officiel Next.js (App Router) appelé une fois au démarrage de chaque
 * runtime Node. Utilisé ici pour garantir la cohérence de données
 * structurantes : les 3 dossiers racines immuables (`pending`, `published`,
 * `bin`) dans la table `CloudinaryFolder`.
 *
 * Sécurité : ce hook s'exécute uniquement côté serveur Node, jamais côté
 * Edge ni client. Les imports backend sont donc sûrs.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { prisma } = await import("@backend/prisma");
  const { ensureRootFolders } = await import(
    "@backend/modules/cloudinary/services/ensureRootFolders.service"
  );
  const { ensureAllGroupSpaces } = await import(
    "@backend/modules/memberGroups/ensureAllGroupSpaces.service"
  );
  const { ensureAdminGroup } = await import(
    "@backend/modules/memberGroups/ensureAdminGroup.service"
  );

  const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";

  try {
    const result = await ensureRootFolders(prisma, APP_ROOT);

    if (result.created > 0) {
      console.log(
        `[instrumentation] ensureRootFolders: ${result.created}/${result.total} root folders created for appRoot="${APP_ROOT}"`
      );
    } else {
      console.log(
        `[instrumentation] ensureRootFolders: all ${result.total} root folders already present for appRoot="${APP_ROOT}"`
      );
    }
  } catch (err) {
    // Le boot ne doit pas être bloqué par une erreur de convergence DB.
    // On log pour investigation, mais l'app démarre quand même.
    console.error(
      "[instrumentation] ensureRootFolders failed — app will still start",
      err
    );
  }

  try {
    const { ensured } = await ensureAllGroupSpaces(prisma, APP_ROOT);
    console.log(
      `[instrumentation] ensureAllGroupSpaces: ${ensured} espace(s) de groupe collaboratif garanti(s) pour appRoot="${APP_ROOT}"`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureAllGroupSpaces failed — app will still start",
      err
    );
  }

  try {
    const { adminsLinked } = await ensureAdminGroup(prisma, APP_ROOT);
    console.log(
      `[instrumentation] ensureAdminGroup: groupe Administrateurs garanti, ${adminsLinked} admin(s) inscrit(s) pour appRoot="${APP_ROOT}"`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureAdminGroup failed — app will still start",
      err
    );
  }
}