module.exports = [
"[project]/packages/config/app.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
}),
"[project]/packages/finder-core/src/cart/usePickerCartStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePickerCartStore",
    ()=>usePickerCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.15_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const usePickerCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        items: new Map(),
        addToCart: (node)=>set((state)=>{
                if (state.items.has(node.path)) return state; // déjà présent → no-op
                const next = new Map(state.items);
                next.set(node.path, node);
                return {
                    items: next
                };
            }),
        removeFromCart: (path)=>set((state)=>{
                if (!state.items.has(path)) return state; // absent → no-op
                const next = new Map(state.items);
                next.delete(path);
                return {
                    items: next
                };
            }),
        toggleCart: (node)=>set((state)=>{
                const next = new Map(state.items);
                if (next.has(node.path)) {
                    next.delete(node.path);
                } else {
                    next.set(node.path, node);
                }
                return {
                    items: next
                };
            }),
        clearCart: ()=>set({
                items: new Map()
            }),
        isInCart: (path)=>get().items.has(path),
        getPaths: ()=>Array.from(get().items.keys()),
        getNodes: ()=>Array.from(get().items.values())
    }));
}),
"[project]/packages/backend/src/prisma.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildMediaProxyUrl",
    ()=>buildMediaProxyUrl
]);
function buildMediaProxyUrl(asset, audience = 'admin') {
    const encodeSegments = (path)=>path.split('/').map(encodeURIComponent).join('/');
    if (asset.publicId !== null) {
        return `/api/media/by-public-id/${encodeSegments(asset.publicId)}?variant=large`;
    }
    const r2Prefix = audience === 'public' ? '/api/media/public/r2' : '/api/media/r2';
    return `${r2Prefix}/${encodeSegments(asset.fullPath)}`;
}
}),
"[project]/packages/backend/src/modules/media/services/resolveMediaByIds.service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveMediaByIds",
    ()=>resolveMediaByIds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-ssr] (ecmascript)");
;
async function resolveMediaByIds(db, mediaIds, audience = 'admin') {
    const byId = {};
    for (const id of mediaIds)byId[id] = null;
    if (mediaIds.length === 0) return byId;
    const assets = await db.mediaAsset.findMany({
        where: {
            id: {
                in: [
                    ...mediaIds
                ]
            },
            status: 'published'
        },
        select: {
            id: true,
            publicId: true,
            fullPath: true,
            mimeType: true,
            width: true,
            height: true,
            duration: true,
            resourceType: true
        }
    });
    for (const asset of assets){
        const isVideo = asset.resourceType === 'video' || asset.mimeType.startsWith('video/');
        const isAudio = !isVideo && asset.mimeType.startsWith('audio/');
        const isImage = !isVideo && !isAudio && asset.mimeType.startsWith('image/');
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])(asset);
        byId[asset.id] = {
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])(asset, audience),
            kind: isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : 'document',
            posterUrl: isVideo ? `${baseUrl}&as=poster` : null,
            mimeType: asset.mimeType,
            fileName: lastSegment(asset.fullPath),
            width: asset.width,
            height: asset.height,
            duration: asset.duration
        };
    }
    return byId;
}
/* ─────────────────────────────────────────────────────────────────────── */ /*  Helpers                                                                */ /* ─────────────────────────────────────────────────────────────────────── */ /**
 * Extrait le dernier segment d'un path (le « nom de fichier »).
 *
 * Sert de label de repli côté View quand l'éditeur n'a pas saisi de
 * title/label/caption. Tolérant aux trailing slashes.
 */ function lastSegment(fullPath) {
    const trimmed = fullPath.replace(/\/+$/, '');
    const idx = trimmed.lastIndexOf('/');
    return idx === -1 ? trimmed : trimmed.slice(idx + 1);
}
}),
"[project]/packages/contracts/src/shared/prosemirror.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "proseMirrorContentSchema",
    ()=>proseMirrorContentSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
;
const proseMirrorContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown());
}),
"[project]/packages/contracts/src/page/blocks.v1.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emptyPageContentV1",
    ()=>emptyPageContentV1,
    "pageBlockSchemaV1",
    ()=>pageBlockSchemaV1,
    "pageContentSchemaV1",
    ()=>pageContentSchemaV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/shared/prosemirror.ts [app-ssr] (ecmascript)");
;
;
/**
 * Contrat versionné de contenu de page — v1.
 *
 * Une page est composée d'une liste ordonnée de blocs discriminés par
 * un champ `type`. Quatre types de blocs sont définis en v1 :
 *
 *   - `tiptap`           : texte riche (ProseMirror JSON)
 *   - `image-gallery`    : galerie d'images
 *   - `audio-collection` : collection de pistes audio
 *   - `document-list`    : liste de documents téléchargeables
 *
 * Voir README.md pour la philosophie (référence stable par mediaId,
 * versioning, frontière contrat / builder / renderer).
 */ /* -------------------------------------------------------------------------- */ /*  Contenu ProseMirror                                                       */ /* -------------------------------------------------------------------------- */ // Le schéma vit désormais dans shared/prosemirror.ts : il ne concerne plus
// seulement le PageBuilder (Comment.content le réutilise côté backend).
// La doc complète (opacité, raisons, consommateurs) est là-bas.
/* -------------------------------------------------------------------------- */ /*  Base commune                                                              */ /* -------------------------------------------------------------------------- */ const blockBaseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    /**
   * Identifiant stable du bloc à l'intérieur de la page.
   *
   * Généré côté builder (cuid recommandé pour cohérence avec le reste du
   * projet), il sert de clé React, de cible de focus/scroll au mount,
   * et de point d'ancrage pour le drag-and-drop.
   *
   * N'est PAS l'identifiant d'un asset — c'est l'identifiant du bloc
   * lui-même au sein de la page.
   */ id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/* -------------------------------------------------------------------------- */ /*  Bloc tiptap                                                               */ /* -------------------------------------------------------------------------- */ const tiptapBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("tiptap"),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"]
});
/* -------------------------------------------------------------------------- */ /*  Bloc image-gallery                                                        */ /* -------------------------------------------------------------------------- */ const imageGalleryLayoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "grid",
    "carousel",
    "masonry"
]);
const imageGalleryBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("image-gallery"),
    /**
   * Liste des images de la galerie.
   *
   * Volontairement non `.min(1)` : un bloc fraîchement ajouté par le
   * builder peut être vide le temps que l'utilisateur sélectionne ses
   * premières images via le MediaPicker. La cohérence "non vide à la
   * publication" est une décision UX, pas une décision de schema —
   * elle pourra être imposée en amont du save par le builder ou par
   * une validation côté admin si nécessaire.
   */ items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })),
    layout: imageGalleryLayoutSchema.default("grid")
});
/* -------------------------------------------------------------------------- */ /*  Bloc audio-collection                                                     */ /* -------------------------------------------------------------------------- */ const audioCollectionBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("audio-collection"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Titre affiché à la place du nom de fichier brut. */ title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }))
});
/* -------------------------------------------------------------------------- */ /*  Bloc document-list                                                        */ /* -------------------------------------------------------------------------- */ const documentListBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("document-list"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Libellé du lien (à défaut, on retombe sur le nom de fichier). */ label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }))
});
/* -------------------------------------------------------------------------- */ /*  Bloc media-text                                                           */ /* -------------------------------------------------------------------------- */ /**
 * Bloc composite « médias + texte » côte à côte, pensé pour une mise en page
 * éditoriale. Les DEUX parties sont optionnelles :
 *
 *   - `content` + `media` non vides → rendu en deux colonnes ; le RENDERER
 *     alterne automatiquement le côté des médias d'un bloc media-text au
 *     suivant (1er : médias à gauche ; 2e : à droite ; etc.). L'ordre n'est
 *     donc PAS stocké ici — c'est une décision de rendu fondée sur la
 *     position, pas une donnée du bloc.
 *   - une seule des deux parties → rendu centré, pleine largeur.
 *
 * `media` accepte plusieurs items (images et/ou une vidéo) ; le renderer
 * décide de leur agencement (grille pour plusieurs images, lecteur pour une
 * vidéo). `content` est le même ProseMirror JSON que le bloc tiptap.
 */ const mediaTextBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("media-text"),
    /** Texte riche optionnel (ProseMirror). Absent/vide → côté texte masqué. */ content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"].optional(),
    /** Médias optionnels (images et/ou vidéo). Vide → côté médias masqué. */ media: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }))
});
const pageBlockSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("type", [
    tiptapBlockSchema,
    imageGalleryBlockSchema,
    audioCollectionBlockSchema,
    documentListBlockSchema,
    mediaTextBlockSchema
]);
const pageContentSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(1),
    blocks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(pageBlockSchemaV1)
});
function emptyPageContentV1() {
    return {
        version: 1,
        blocks: []
    };
}
}),
"[project]/packages/contracts/src/page/extractMediaIds.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractMediaIdsFromBlock",
    ()=>extractMediaIdsFromBlock,
    "extractMediaIdsFromContent",
    ()=>extractMediaIdsFromContent
]);
function extractMediaIdsFromBlock(block) {
    switch(block.type){
        case "image-gallery":
            return block.items.map((item)=>item.mediaId);
        case "audio-collection":
            return block.items.map((item)=>item.mediaId);
        case "document-list":
            return block.items.map((item)=>item.mediaId);
        case "tiptap":
            return walkProseMirrorForMediaIds(block.content);
        case "media-text":
            // mediaIds directs (tableau media) + images éventuelles du ProseMirror.
            return [
                ...block.media.map((item)=>item.mediaId),
                ...walkProseMirrorForMediaIds(block.content)
            ];
        default:
            return assertNever(block);
    }
}
function extractMediaIdsFromContent(content) {
    const ids = content.blocks.flatMap(extractMediaIdsFromBlock);
    return Array.from(new Set(ids));
}
/* -------------------------------------------------------------------------- */ /*  Walker ProseMirror                                                        */ /* -------------------------------------------------------------------------- */ /**
 * Traverse un arbre ProseMirror à la recherche des nodes `library-image`
 * et collecte leurs `mediaId`.
 *
 * Le node `library-image` est introduit par l'extension TipTap du builder
 * (sous-chantier 3 du plan). On le reconnaît par :
 *
 *   - `node.type === 'library-image'`
 *   - `node.attrs.mediaId` (string non-vide)
 *
 * Cette traversée est volontairement défensive : le contenu ProseMirror
 * est typé `Record<string, unknown>` dans le schema, donc on ne fait
 * aucune hypothèse forte sur la structure. Un payload corrompu ou
 * inattendu rend une liste vide plutôt que de jeter — le save d'une
 * page ne doit pas exploser à cause d'un artefact d'édition.
 */ function walkProseMirrorForMediaIds(content) {
    const ids = [];
    function walk(node) {
        if (!node || typeof node !== "object") return;
        const candidate = node;
        if (candidate.type === "library-image" && typeof candidate.attrs?.mediaId === "string" && candidate.attrs.mediaId.length > 0) {
            ids.push(candidate.attrs.mediaId);
        }
        if (Array.isArray(candidate.content)) {
            for (const child of candidate.content)walk(child);
        }
    }
    walk(content);
    return ids;
}
/* -------------------------------------------------------------------------- */ /*  Garde d'exhaustivité                                                      */ /* -------------------------------------------------------------------------- */ /**
 * Vérifie à la compilation que tous les cas d'une union discriminée
 * sont couverts. Utilisée comme `default` dans le switch ci-dessus —
 * si une branche manque, TypeScript échoue parce que `value` n'est
 * pas `never`.
 */ function assertNever(value) {
    throw new Error(`Cas de bloc non couvert dans extractMediaIdsFromBlock : ${JSON.stringify(value)}`);
}
}),
"[project]/packages/contracts/src/page/resolvedMedia.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 * ========================================================================= */ __turbopack_context__.s([]);
;
}),
"[project]/packages/contracts/src/page/parseContent.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePageContentV1",
    ()=>parsePageContentV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-ssr] (ecmascript)");
;
function parsePageContentV1(raw) {
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].safeParse(raw);
    return result.success ? result.data : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["emptyPageContentV1"])();
}
}),
"[project]/packages/contracts/src/page/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/extractMediaIds.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$resolvedMedia$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/resolvedMedia.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$parseContent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/parseContent.ts [app-ssr] (ecmascript)");
;
;
;
;
}),
"[project]/packages/contracts/src/storage/storage.types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storageProviderSchema",
    ()=>storageProviderSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
;
const storageProviderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'cloudinary',
    'r2'
]);
}),
"[project]/packages/contracts/src/storage/storage.adapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/packages/contracts/src/storage/move.intent.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lifecycleStatusSchema",
    ()=>lifecycleStatusSchema,
    "storageMoveIntentSchema",
    ()=>storageMoveIntentSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
;
const lifecycleStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'pending',
    'published',
    'bin'
]);
/* -------------------------------------------------------------------------- */ /*  Sources possibles d'un move                                               */ /* -------------------------------------------------------------------------- */ const fileSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('file'),
    /** Path concret du fichier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const folderSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    /** Path concret du dossier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/**
 * Sélection multi-items.
 *
 * `roots` désigne les paths inclus dans la sélection (au moins un).
 * `excluded` permet d'exclure des sous-paths spécifiques d'une racine
 * englobante — par exemple "tout sous `cours/12/` sauf `cours/12/draft/`".
 *
 * La résolution (couche 2) expanse cette sélection en N opérations
 * atomiques en s'appuyant sur l'adapter pour lister les enfants des
 * roots et filtrer les exclus.
 */ const selectionSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('selection'),
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
    excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
});
const moveSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    fileSourceSchema,
    folderSourceSchema,
    selectionSourceSchema
]);
/* -------------------------------------------------------------------------- */ /*  Cibles possibles d'un move                                                */ /* -------------------------------------------------------------------------- */ /**
 * Cible exprimée par un path concret.
 * Exemple : `target: { type: 'folder', path: 'AKFC/published/cours/12' }`.
 */ const concreteFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/**
 * Cible exprimée par un statut applicatif.
 * Le path concret est calculé par la résolution (couche 2) en respectant
 * la convention `${appRoot}/${status}/${suffixePréservéDeLaSource}`.
 *
 * Exemple : `target: { type: 'status-folder', status: 'published' }`
 *   appliqué à une source `AKFC/pending/cours/12/photo.jpg`
 *   produit l'opération `target: { path: 'AKFC/published/cours/12/photo.jpg' }`.
 *
 * Voir le commentaire en tête de fichier pour la nuance importante entre
 * `status-folder` (cible logique par statut) et "dossier virtuel" (notion
 * provider-spécifique sans rapport).
 */ const statusFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('status-folder'),
    status: lifecycleStatusSchema
});
const moveTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    concreteFolderTargetSchema,
    statusFolderTargetSchema
]);
const storageMoveIntentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    source: moveSourceSchema,
    target: moveTargetSchema
});
}),
"[project]/packages/contracts/src/storage/virtual-path.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Virtual paths et dispatch de provider.
 *
 * Ce fichier introduit deux concepts qui rendent le finder vraiment
 * indépendant du provider de stockage : le **virtual path** (le path
 * tel que vu par la UI) et le **dispatcher** (la fonction qui décide
 * quel provider héberge quel asset).
 *
 * ─── Pourquoi un nouveau type `VirtualPath` distinct de `StoragePath` ? ───
 *
 * Aujourd'hui le contrat utilise `StoragePath = string` partout. Quand on
 * n'a qu'un seul provider, c'est suffisant : le path Cloudinary publié par
 * l'API tRPC est exactement le path utilisé en interne par l'adapter.
 *
 * Avec deux providers, on a une distinction sémantique importante :
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  VirtualPath  — vue UI, neutre, agnostique du provider          │
 *   │  ex: "AKFC/pending/Cours/12/intro.mp3"                          │
 *   └────────────────────────────┬────────────────────────────────────┘
 *                                │
 *               pickBackend(mimeType / extension)
 *                                │
 *                ┌───────────────┴───────────────┐
 *                ▼                               ▼
 *   ┌────────────────────────┐    ┌───────────────────────────────┐
 *   │ StoragePath Cloudinary │    │ StoragePath R2 (key bucket)   │
 *   │ "AKFC/pending/Cours/   │    │ "AKFC/pending/Cours/12/       │
 *   │  12/intro" (sans ext)  │    │  intro.mp3" (avec ext)        │
 *   └────────────────────────┘    └───────────────────────────────┘
 *
 * Le mapping virtual ↔ storage est responsabilité de chaque adapter. Pour
 * Cloudinary, ça peut être l'identité (ou presque — extension retirée
 * pour le publicId). Pour R2, ça peut aussi être l'identité (la clé R2
 * peut accepter la même structure). Mais le contrat ne tranche pas : on
 * laisse les adapters libres.
 *
 * Le bénéfice de cette distinction n'est pas tellement dans le runtime
 * (souvent l'identité) mais dans le **type system** : on encode dans les
 * signatures qu'un path manipulé côté UI n'est PAS interchangeable avec
 * un path stocké côté backend. Une erreur de conversion oubliée sera
 * détectée à la compilation.
 *
 * ─── Branded type ────────────────────────────────────────────────────────
 *
 * `VirtualPath` est un branded type : c'est essentiellement un `string`
 * mais avec un tag de phantom type qui empêche l'usage d'un `string`
 * quelconque sans passer par `toVirtualPath()`. C'est une discipline
 * pure-TypeScript, zéro overhead runtime.
 */ __turbopack_context__.s([
    "pickBackend",
    ()=>pickBackend,
    "pickBackendByExtension",
    ()=>pickBackendByExtension,
    "toVirtualPath",
    ()=>toVirtualPath,
    "tryToVirtualPath",
    ()=>tryToVirtualPath
]);
function toVirtualPath(raw) {
    if (typeof raw !== 'string' || raw.length === 0) {
        throw new Error('toVirtualPath: path vide');
    }
    if (raw.endsWith('/')) {
        throw new Error(`toVirtualPath: path ne doit pas se terminer par "/" (reçu: "${raw}")`);
    }
    const segments = raw.split('/');
    for (const seg of segments){
        if (seg.length === 0) {
            throw new Error(`toVirtualPath: segment vide dans "${raw}" (probable "//" consécutifs)`);
        }
        if (seg === '..') {
            throw new Error(`toVirtualPath: segment ".." interdit (path traversal) dans "${raw}"`);
        }
    }
    return raw;
}
function tryToVirtualPath(raw) {
    try {
        return toVirtualPath(raw);
    } catch  {
        return null;
    }
}
function pickBackend(mimeType) {
    if (!mimeType) return 'r2';
    if (mimeType.startsWith('image/')) return 'cloudinary';
    if (mimeType.startsWith('video/')) return 'cloudinary';
    return 'r2';
}
function pickBackendByExtension(filename) {
    const dot = filename.lastIndexOf('.');
    if (dot === -1 || dot === filename.length - 1) return 'r2';
    const ext = filename.slice(dot + 1).toLowerCase();
    // Images
    if ([
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'avif',
        'svg',
        'bmp',
        'tiff',
        'ico'
    ].includes(ext)) {
        return 'cloudinary';
    }
    // Vidéos
    if ([
        'mp4',
        'webm',
        'mov',
        'avi',
        'mkv',
        'm4v',
        'wmv',
        'flv',
        'ogv'
    ].includes(ext)) {
        return 'cloudinary';
    }
    // Tout le reste → R2 (audios, docs, archives, etc.)
    return 'r2';
}
}),
"[project]/packages/contracts/src/storage/r2-upload.schema.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createR2UploadAuthorizationSchema",
    ()=>createR2UploadAuthorizationSchema,
    "registerR2UploadedAssetSchema",
    ()=>registerR2UploadedAssetSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
;
/**
 * Schemas Zod pour les procédures tRPC R2 upload.
 *
 * ─── Pourquoi des schemas dédiés à R2 (séparés de Cloudinary) ? ──────────
 *
 * Cloudinary et R2 ont des modèles d'upload fondamentalement différents :
 *
 *   - Cloudinary : signature SHA-1 d'une combinaison de params, le client
 *     envoie ensuite le fichier à l'endpoint upload de Cloudinary avec
 *     ces params + le payload.
 *
 *   - R2 (S3) : presigned POST policy avec conditions verrouillées dans
 *     la signature, le client envoie un `multipart/form-data` directement
 *     vers l'URL signée.
 *
 * Les structures d'input et d'output divergent assez pour qu'une procédure
 * unifiée devienne un "soup of fields". On préfère deux paires de procédures
 * dédiées et un dispatch côté UI (qui sait quel backend cibler via
 * `pickBackend(mimeType)`).
 *
 * Voir aussi : `@contracts/cloudinary/upload.schema.ts` pour l'équivalent
 * Cloudinary.
 */ /* -------------------------------------------------------------------------- */ /*  Input : demande d'autorisation d'upload                                   */ /* -------------------------------------------------------------------------- */ /**
 * Limite max côté contrat — duplique la garde côté adapter pour échouer
 * tôt (avant l'appel SDK). 500 MiB est cohérent avec l'usage AKFC
 * (audios, PDFs, archives). Au-delà, il faudrait un multipart upload.
 */ const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
const createR2UploadAuthorizationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    /**
   * Path virtuel cible (ex: "AKFC/pending/Cours/12/intro.mp3"). Doit
   * commencer par l'appRoot configuré côté backend — la validation
   * détaillée est faite par l'adapter.
   */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    /**
   * MIME type du fichier qui sera uploadé. Sera **verrouillé dans la
   * signature** du presigned POST — toute tentative d'upload avec un
   * Content-Type différent sera rejetée par R2.
   */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    /**
   * Borne supérieure de taille en octets. Bornée par
   * `HARD_MAX_UPLOAD_BYTES` (500 MiB). R2 rejettera tout upload dont
   * `Content-Length` dépasse cette valeur.
   */ maxBytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(HARD_MAX_UPLOAD_BYTES, {
        message: `maxBytes ne peut pas dépasser ${HARD_MAX_UPLOAD_BYTES} octets (500 MiB). Pour les fichiers plus gros, utilise un multipart upload.`
    })
});
const registerR2UploadedAssetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    expectedBytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    expectedMimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
}),
"[project]/packages/contracts/src/storage/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.types.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$adapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.adapter.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/move.intent.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/virtual-path.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$r2$2d$upload$2e$schema$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/r2-upload.schema.ts [app-ssr] (ecmascript)");
;
;
;
;
;
}),
"[project]/packages/contracts/src/slug/slugify.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * slugify — transforme un texte libre en slug URL-safe.
 *
 * Fonction **pure**, zéro dépendance (pas de zod). Utilisée côté front
 * (pré-remplissage du champ slug dans les forms admin) et par le script
 * de backfill.
 *
 *   slugify("Karaté Shotokan")          // "karate-shotokan"
 *   slugify("Choy Lee Fut")             // "choy-lee-fut"
 *   slugify("Stage Sensei Tanaka 2026") // "stage-sensei-tanaka-2026"
 */ __turbopack_context__.s([
    "slugify",
    ()=>slugify
]);
function slugify(input) {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire les diacritiques (é → e)
    .toLowerCase().replace(/[^a-z0-9]+/g, "-") // tout caractère non alphanumérique → tiret
    .replace(/^-+|-+$/g, ""); // trim des tirets aux extrémités
}
}),
];

//# sourceMappingURL=packages_eb985cfe._.js.map