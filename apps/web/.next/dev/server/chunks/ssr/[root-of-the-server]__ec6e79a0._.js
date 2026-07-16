module.exports = [
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/packages/backend/src/prisma.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "error",
        "warn"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/packages/contracts/src/slug/slug.schema.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "slugSchema",
    ()=>slugSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
;
const slugSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with single hyphens (no leading/trailing hyphen)."
});
}),
"[project]/packages/contracts/src/forms/createGalleryForm.schema.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGalleryFormSchema",
    ()=>createGalleryFormSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-rsc] (ecmascript)");
;
;
// 🧩 Schéma — création d'une galerie (métadonnées seulement).
// `visibility` en z.enum littéral pour garder @contracts indépendant de Prisma.
//
// `date` et les cinq facettes arrivent du DOM en STRINGS (input type="date"
// et selects) — le contrat valide la forme, l'action convertit ("" = null).
// Les facettes sont CUMULABLES (décision 2026-07-03).
const facetIdString = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d*$/, "Identifiant invalide.");
const createGalleryFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1, "Le titre est obligatoire.").max(120),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["slugSchema"],
    visibility: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "PUBLIC",
        "MEMBERS"
    ]),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0),
    /** "YYYY-MM-DD" ou "" (pas de date). */ date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    disciplineId: facetIdString,
    categoryId: facetIdString,
    stageId: facetIdString,
    eventId: facetIdString,
    originId: facetIdString
});
}),
"[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"7f232a73f0932d1aa7211e84721744d2c60ed84d64":"createGalleryFormAction"},"",""] */ __turbopack_context__.s([
    "createGalleryFormAction",
    ()=>createGalleryFormAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$createGalleryForm$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/forms/createGalleryForm.schema.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
/** Select vide ("") → null, sinon l'id numérique. */ const toFacetId = (s)=>s === "" ? null : Number(s);
/** input type="date" vide ("") → null, sinon minuit local du jour choisi. */ const toDate = (s)=>s === "" ? null : new Date(`${s}T00:00:00`);
const createGalleryFormAction = async (prevState, formData)=>{
    // Métadonnées
    const str = (k)=>{
        const v = formData.get(k);
        return v == null ? "" : String(v);
    };
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$createGalleryForm$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createGalleryFormSchema"].safeParse({
        title: str('title'),
        slug: formData.get('slug'),
        visibility: formData.get('visibility'),
        sortOrder: Number(formData.get('sortOrder') ?? 0),
        date: str('date'),
        disciplineId: str('disciplineId'),
        categoryId: str('categoryId'),
        stageId: str('stageId'),
        eventId: str('eventId'),
        originId: str('originId')
    });
    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0].message
        };
    }
    // Items (ids média) — parsés à part, comme les permissions du form de rôle.
    const rawItems = formData.get('items');
    let mediaIds = [];
    try {
        mediaIds = rawItems ? JSON.parse(String(rawItems)) : [];
    } catch  {
        return {
            success: false,
            error: "Format des médias invalide."
        };
    }
    try {
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].gallery.create({
            data: {
                title: result.data.title,
                slug: result.data.slug,
                visibility: result.data.visibility,
                sortOrder: result.data.sortOrder,
                date: toDate(result.data.date),
                disciplineId: toFacetId(result.data.disciplineId),
                categoryId: toFacetId(result.data.categoryId),
                stageId: toFacetId(result.data.stageId),
                eventId: toFacetId(result.data.eventId),
                originId: toFacetId(result.data.originId),
                items: mediaIds.length > 0 ? {
                    create: mediaIds.map((mediaAssetId, index)=>({
                            mediaAssetId,
                            sortOrder: index
                        }))
                } : undefined
            }
        });
        return {
            success: true,
            galleryId: created.id
        };
    } catch  {
        return {
            success: false,
            error: "Création impossible : ce slug est peut-être déjà utilisé."
        };
    }
};
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createGalleryFormAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createGalleryFormAction, "7f232a73f0932d1aa7211e84721744d2c60ed84d64", null);
}),
"[project]/apps/web/.next-internal/server/app/(admin)/dashboard/galleries/create/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$admin$2f$galleries$2f$actions$2f$createGalleryForm$2e$action$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)");
;
}),
"[project]/apps/web/.next-internal/server/app/(admin)/dashboard/galleries/create/page/actions.js { ACTIONS_MODULE0 => \"[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "7f232a73f0932d1aa7211e84721744d2c60ed84d64",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$admin$2f$galleries$2f$actions$2f$createGalleryForm$2e$action$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createGalleryFormAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f2e$next$2d$internal$2f$server$2f$app$2f28$admin$292f$dashboard$2f$galleries$2f$create$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$admin$2f$galleries$2f$actions$2f$createGalleryForm$2e$action$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/apps/web/.next-internal/server/app/(admin)/dashboard/galleries/create/page/actions.js { ACTIONS_MODULE0 => "[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$admin$2f$galleries$2f$actions$2f$createGalleryForm$2e$action$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ec6e79a0._.js.map