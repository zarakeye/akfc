/**
 * instrumentation.ts
 *
 * Hook officiel Next.js (App Router) appelé une fois au démarrage de chaque
 * runtime Node. Utilisé ici pour garantir la cohérence de données
 * structurantes : dossiers racines et libellés (`Folder`, `FolderLabel`),
 * espaces de groupe, groupes système, catégories de tickets, pages par défaut.
 *
 * Sécurité : ce hook s'exécute uniquement côté serveur Node, jamais côté
 * Edge ni client. Les imports backend sont donc sûrs.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { prisma } = await import("@backend/prisma");
  const { ensureRootFolders } = await import(
    "@backend/modules/storage/services/ensureRootFolders.service"
  );
  const { ensureAllGroupSpaces } = await import(
    "@backend/modules/memberGroups/ensureAllGroupSpaces.service"
  );
  const { ensureAdminGroup } = await import(
    "@backend/modules/memberGroups/ensureAdminGroup.service"
  );
  const { ensureTicketCategories } = await import(
    "@backend/modules/tickets/ensureTicketCategories.service"
  );
  const { ensureCategoryFolderLabels } = await import(
    "@backend/modules/storage/services/ensureCategoryFolderLabels.service"
  );
  const { ensureInstructorBioMediaReferences } = await import(
    "@backend/modules/media/services/ensureInstructorBioMediaReferences.service"
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
    await ensureAdminGroup(prisma, APP_ROOT);
    console.log(
      `[instrumentation] ensureAdminGroup: groupe Administrateurs garanti pour appRoot="${APP_ROOT}"`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureAdminGroup failed — app will still start",
      err
    );
  }

  try {
    const { created, supportGroupCreated } = await ensureTicketCategories(prisma);
    console.log(
      `[instrumentation] ensureTicketCategories: ${created.length} catégorie(s) créée(s)${supportGroupCreated ? ", groupe Support créé" : ""}`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureTicketCategories failed — app will still start",
      err
    );
  }

  try {
    const { ensureDefaultPartners } = await import(
      "@backend/modules/sitePartners/sitePartners.service"
    );
    const created = await ensureDefaultPartners(prisma);
    if (created) console.log(`[instrumentation] ensureDefaultPartners: ${created} partenaire(s) créé(s) ou complété(s) (MJC, FFK)`);
  } catch (err) {
    console.error(
      "[instrumentation] ensureDefaultPartners failed — app will still start",
      err
    );
  }

  try {
    const { ensureInscriptionPage } = await import(
      "@backend/modules/sitePages/ensureInscriptionPage.service"
    );
    const inscription = await ensureInscriptionPage(prisma);
    if (inscription !== "unchanged") console.log(`[instrumentation] page « S'inscrire » : texte de départ ${inscription === "created" ? "créé (brouillon)" : "mis à jour (liens d'inscription en ligne)"}`);
  } catch (err) {
    console.error(
      "[instrumentation] ensureInscriptionPage failed — app will still start",
      err
    );
  }

  try {
    const { ensureContactsPage } = await import(
      "@backend/modules/sitePages/ensureContactsPage.service"
    );
    const r = await ensureContactsPage(prisma);
    if (r.seeded || r.renamed) console.log(`[instrumentation] page « Nous contacter » :${r.seeded ? " texte de départ créé" : ""}${r.renamed ? " titre renommé" : ""}`);
  } catch (err) {
    console.error(
      "[instrumentation] ensureContactsPage failed — app will still start",
      err
    );
  }

  try {
    const { startTicketMailboxPolling } = await import(
      "@backend/modules/tickets/imapIntake.service"
    );
    const started = startTicketMailboxPolling(prisma);
    console.log(
      `[instrumentation] relève des réponses aux demandes : ${started ? "active" : "désactivée (TICKET_IMAP_HOST absent)"}`
    );
  } catch (err) {
    console.error(
      "[instrumentation] startTicketMailboxPolling failed — app will still start",
      err
    );
  }

  try {
    const { startRetentionSchedule } = await import(
      "@backend/modules/privacy/retention.service"
    );
    const started = startRetentionSchedule(prisma);
    console.log(`[instrumentation] purge RGPD (durées de conservation) : ${started ? "chaque jour à 3 h + au démarrage" : "désactivée"}`);
  } catch (err) {
    console.error("[instrumentation] startRetentionSchedule failed — app will still start", err);
  }

  try {
    const { startTicketRecapSchedule } = await import(
      "@backend/modules/tickets/recap.service"
    );
    const { started, hour } = startTicketRecapSchedule(prisma);
    console.log(
      `[instrumentation] récapitulatif des demandes : ${started ? `chaque jour à ${hour} h (heure de Paris)` : "désactivé"}`
    );
  } catch (err) {
    console.error(
      "[instrumentation] startTicketRecapSchedule failed — app will still start",
      err
    );
  }

  try {
    const { ensured } = await ensureCategoryFolderLabels(prisma, APP_ROOT);
    console.log(
      `[instrumentation] ensureCategoryFolderLabels: ${ensured} libellé(s) de catégorie garanti(s) pour appRoot="${APP_ROOT}"`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureCategoryFolderLabels failed — app will still start",
      err
    );
  }

  try {
    const { synced, failed } = await ensureInstructorBioMediaReferences(prisma);
    console.log(
      `[instrumentation] ensureInstructorBioMediaReferences: ${synced} bio(s) synchronisée(s), ${failed} en échec`
    );
  } catch (err) {
    console.error(
      "[instrumentation] ensureInstructorBioMediaReferences failed — app will still start",
      err
    );
  }
}