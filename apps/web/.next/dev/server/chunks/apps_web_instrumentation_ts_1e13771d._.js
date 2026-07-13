module.exports = [
"[project]/apps/web/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const { prisma } = await __turbopack_context__.A("[project]/packages/backend/src/prisma.ts [instrumentation] (ecmascript, async loader)");
    const { ensureRootFolders } = await __turbopack_context__.A("[project]/packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts [instrumentation] (ecmascript, async loader)");
    const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";
    try {
        const result = await ensureRootFolders(prisma, APP_ROOT);
        if (result.created > 0) {
            console.log(`[instrumentation] ensureRootFolders: ${result.created}/${result.total} root folders created for appRoot="${APP_ROOT}"`);
        } else {
            console.log(`[instrumentation] ensureRootFolders: all ${result.total} root folders already present for appRoot="${APP_ROOT}"`);
        }
    } catch (err) {
        // Le boot ne doit pas être bloqué par une erreur de convergence DB.
        // On log pour investigation, mais l'app démarre quand même.
        console.error("[instrumentation] ensureRootFolders failed — app will still start", err);
    }
}
}),
];

//# sourceMappingURL=apps_web_instrumentation_ts_1e13771d._.js.map