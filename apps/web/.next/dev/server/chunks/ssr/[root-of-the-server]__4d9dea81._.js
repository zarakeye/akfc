module.exports = [
"[project]/apps/web/src/app/favicon.ico.mjs { IMAGE => \"[project]/apps/web/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/favicon.ico.mjs { IMAGE => \"[project]/apps/web/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/web/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/apps/web/src/app/(public)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/(public)/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/backend/src/modules/media/services/resolveMediaByIds.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveMediaByIds",
    ()=>resolveMediaByIds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-rsc] (ecmascript)");
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
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])(asset);
        byId[asset.id] = {
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])(asset, audience),
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
"[project]/packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveAvatarsByUserIds",
    ()=>resolveAvatarsByUserIds
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-rsc] (ecmascript)");
;
async function resolveAvatarsByUserIds(prisma, userIds) {
    const out = {};
    for (const id of userIds)out[id] = null;
    if (userIds.length === 0) return out;
    const users = await prisma.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true,
            avatar: true,
            firstName: true,
            lastName: true
        }
    });
    for (const user of users){
        if (!user.avatar) continue; // pas d'avatar → reste null (placeholder)
        const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])({
            publicId: user.avatar,
            fullPath: ""
        }, "public");
        out[user.id] = {
            url,
            kind: "image",
            posterUrl: null,
            mimeType: "image/*",
            fileName: [
                user.firstName,
                user.lastName
            ].filter(Boolean).join(" ") || "avatar",
            width: null,
            height: null,
            duration: null
        };
    }
    return out;
}
}),
"[project]/packages/contracts/src/shared/prosemirror.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "proseMirrorContentSchema",
    ()=>proseMirrorContentSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
;
const proseMirrorContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown());
}),
"[project]/packages/contracts/src/page/blocks.v1.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emptyPageContentV1",
    ()=>emptyPageContentV1,
    "pageBlockSchemaV1",
    ()=>pageBlockSchemaV1,
    "pageContentSchemaV1",
    ()=>pageContentSchemaV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/shared/prosemirror.ts [app-rsc] (ecmascript)");
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
/* -------------------------------------------------------------------------- */ /*  Base commune                                                              */ /* -------------------------------------------------------------------------- */ const blockBaseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    /**
   * Identifiant stable du bloc à l'intérieur de la page.
   *
   * Généré côté builder (cuid recommandé pour cohérence avec le reste du
   * projet), il sert de clé React, de cible de focus/scroll au mount,
   * et de point d'ancrage pour le drag-and-drop.
   *
   * N'est PAS l'identifiant d'un asset — c'est l'identifiant du bloc
   * lui-même au sein de la page.
   */ id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/* -------------------------------------------------------------------------- */ /*  Bloc tiptap                                                               */ /* -------------------------------------------------------------------------- */ const tiptapBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("tiptap"),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"]
});
/* -------------------------------------------------------------------------- */ /*  Bloc image-gallery                                                        */ /* -------------------------------------------------------------------------- */ const imageGalleryLayoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "grid",
    "carousel",
    "masonry"
]);
const imageGalleryBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("image-gallery"),
    /**
   * Liste des images de la galerie.
   *
   * Volontairement non `.min(1)` : un bloc fraîchement ajouté par le
   * builder peut être vide le temps que l'utilisateur sélectionne ses
   * premières images via le MediaPicker. La cohérence "non vide à la
   * publication" est une décision UX, pas une décision de schema —
   * elle pourra être imposée en amont du save par le builder ou par
   * une validation côté admin si nécessaire.
   */ items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })),
    layout: imageGalleryLayoutSchema.default("grid")
});
/* -------------------------------------------------------------------------- */ /*  Bloc audio-collection                                                     */ /* -------------------------------------------------------------------------- */ const audioCollectionBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("audio-collection"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Titre affiché à la place du nom de fichier brut. */ title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }))
});
/* -------------------------------------------------------------------------- */ /*  Bloc document-list                                                        */ /* -------------------------------------------------------------------------- */ const documentListBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("document-list"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Libellé du lien (à défaut, on retombe sur le nom de fichier). */ label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
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
 */ /** Média issu de la bibliothèque (MediaAsset). */ const libraryMediaItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("library").default("library"),
    mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
/**
 * Référence LOGIQUE à l'avatar d'un utilisateur (pas au binaire). Résolue
 * dynamiquement au rendu : la page affiche toujours l'avatar COURANT du user
 * — pas de copie, pas de synchro, pas de dérive. Si le user change d'avatar,
 * la page suit automatiquement.
 */ const avatarMediaItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("avatar"),
    userId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
/**
 * Média d'un bloc media-text : soit un média de bibliothèque, soit une
 * référence avatar. Discriminé par `kind`. L'ancien format (objet
 * `{ mediaId }` sans `kind`) est traité comme `library` par le preprocess.
 */ const mediaTextItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("kind", [
    libraryMediaItemSchema,
    avatarMediaItemSchema
]);
const mediaTextBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("media-text"),
    /** Texte riche optionnel (ProseMirror). Absent/vide → côté texte masqué. */ content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"].optional(),
    /**
   * UN SEUL média optionnel : média de bibliothèque OU référence avatar.
   * Absent → côté médias masqué.
   *
   * Compat : preprocess tolérant — (1) un ancien TABLEAU est réduit à son
   * premier élément ; (2) un objet SANS `kind` (ancien format média
   * bibliothèque) reçoit `kind: "library"`.
   */ media: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
        let v = val;
        if (Array.isArray(v)) v = v.length > 0 ? v[0] : undefined;
        if (v && typeof v === "object" && !("kind" in v)) {
            // Ancien format { mediaId, caption } → média bibliothèque.
            return {
                kind: "library",
                ...v
            };
        }
        return v;
    }, mediaTextItemSchema.optional())
});
const pageBlockSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("type", [
    tiptapBlockSchema,
    imageGalleryBlockSchema,
    audioCollectionBlockSchema,
    documentListBlockSchema,
    mediaTextBlockSchema
]);
const pageContentSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(1),
    blocks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(pageBlockSchemaV1)
});
function emptyPageContentV1() {
    return {
        version: 1,
        blocks: []
    };
}
}),
"[project]/packages/contracts/src/page/extractMediaIds.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
            // Seul un média de bibliothèque a un mediaId à résoudre ; une référence
            // avatar est résolue dynamiquement ailleurs (via User.avatar).
            return [
                ...block.media && block.media.kind === "library" ? [
                    block.media.mediaId
                ] : [],
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
"[project]/packages/contracts/src/page/resolvedMedia.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/contracts/src/page/parseContent.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePageContentV1",
    ()=>parsePageContentV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-rsc] (ecmascript)");
;
function parsePageContentV1(raw) {
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].safeParse(raw);
    return result.success ? result.data : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emptyPageContentV1"])();
}
}),
"[project]/packages/contracts/src/page/index.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/extractMediaIds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$resolvedMedia$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/resolvedMedia.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$parseContent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/parseContent.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "TipTapEditor",
    ()=>TipTapEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TipTapEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TipTapEditor() from the server but TipTapEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx <module evaluation>", "TipTapEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "TipTapEditor",
    ()=>TipTapEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const TipTapEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TipTapEditor() from the server but TipTapEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx", "TipTapEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/stream/web [external] (stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream/web", () => require("stream/web"));

module.exports = mod;
}),
"[externals]/vm [external] (vm, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("vm", () => require("vm"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[project]/apps/web/src/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HorizontalRule",
    ()=>HorizontalRule,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+core@3.27.3_@tiptap+pm@3.27.3/node_modules/@tiptap/core/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$horizontal$2d$rule$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$horizontal$2d$rule$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-horizontal-rule@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-horizontal-rule/dist/index.js [app-rsc] (ecmascript)");
;
;
const HorizontalRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$horizontal$2d$rule$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$horizontal$2d$rule$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].extend({
    renderHTML () {
        return [
            "div",
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeAttributes"])(this.options.HTMLAttributes, {
                "data-type": this.name
            }),
            [
                "hr"
            ]
        ];
    }
});
const __TURBOPACK__default__export__ = HorizontalRule;
}),
"[project]/apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TipTapView",
    ()=>TipTapView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+core@3.27.3_@tiptap+pm@3.27.3/node_modules/@tiptap/core/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$html$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3_happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f40$tiptap$2f$html$2f$dist$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+html@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3_happy-dom@20.9.0/node_modules/@tiptap/html/dist/server/index.js [app-rsc] (ecmascript)");
// Mêmes extensions que `BuilderTipTapEditor` (sous-chantier 5d), pour
// que le rendu serveur reflète exactement les nodes/marks que l'admin
// peut produire en édition.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$starter$2d$kit$40$3$2e$27$2e$1$2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+starter-kit@3.27.1/node_modules/@tiptap/starter-kit/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-list@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-list/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$text$2d$align$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-text-align@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-text-align/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$typography$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$typography$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-typography@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-typography/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$highlight$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$highlight$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-highlight@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-highlight/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$subscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$subscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-subscript@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-subscript/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$superscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$superscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-superscript@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-superscript/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$editor$2d$tiptap$2f$node$2f$horizontal$2d$rule$2d$node$2f$horizontal$2d$rule$2d$node$2d$extension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const ServerLibraryImageNode = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Node"].create({
    name: "library-image",
    group: "block",
    atom: true,
    addOptions () {
        return {
            resolveMedia: ()=>null
        };
    },
    addAttributes () {
        return {
            mediaId: {
                default: null
            },
            caption: {
                default: null
            }
        };
    },
    renderHTML ({ node }) {
        const mediaId = node.attrs.mediaId;
        const caption = node.attrs.caption;
        // Pas de mediaId → on n'émet rien d'utile (cas anormal mais
        // possible si un composite a été manipulé hors UI).
        if (!mediaId) {
            return [
                "span",
                {
                    class: "hidden",
                    "aria-hidden": "true"
                }
            ];
        }
        const media = this.options.resolveMedia(mediaId);
        // Asset introuvable (hors `published` ou supprimé) → silencieusement
        // omis côté visiteur, cohérent avec le filtrage des autres Views.
        if (!media) {
            return [
                "span",
                {
                    class: "hidden",
                    "aria-hidden": "true"
                }
            ];
        }
        const imgAttrs = {
            src: media.url,
            alt: caption ?? "",
            loading: "lazy",
            decoding: "async"
        };
        if (media.width !== null) imgAttrs.width = media.width;
        if (media.height !== null) imgAttrs.height = media.height;
        if (caption) {
            return [
                "figure",
                {
                    class: "tiptap-library-image"
                },
                [
                    "img",
                    imgAttrs
                ],
                [
                    "figcaption",
                    {},
                    caption
                ]
            ];
        }
        return [
            "figure",
            {
                class: "tiptap-library-image"
            },
            [
                "img",
                imgAttrs
            ]
        ];
    }
});
function TipTapView({ block, resolveMedia }) {
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$html$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3_happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f40$tiptap$2f$html$2f$dist$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateHTML"])(block.content, [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$starter$2d$kit$40$3$2e$27$2e$1$2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StarterKit"].configure({
            horizontalRule: false
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$editor$2d$tiptap$2f$node$2f$horizontal$2d$rule$2d$node$2f$horizontal$2d$rule$2d$node$2d$extension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HorizontalRule"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$text$2d$align$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextAlign"].configure({
            types: [
                "heading",
                "paragraph"
            ]
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TaskList"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TaskItem"].configure({
            nested: true
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$highlight$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$highlight$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Highlight"].configure({
            multicolor: true
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$typography$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$typography$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Typography"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$subscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$subscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Subscript"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$superscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$superscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Superscript"],
        ServerLibraryImageNode.configure({
            resolveMedia
        })
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "tiptap-rendered prose max-w-none",
        dangerouslySetInnerHTML: {
            __html: html
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/page-builder/blocks/tiptap/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tiptapDefinition",
    ()=>tiptapDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/type.js [app-rsc] (ecmascript) <export default as Type>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/tiptap/editor.client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx [app-rsc] (ecmascript)");
;
;
;
;
const tiptapDefinition = {
    kind: "tiptap",
    label: "Texte",
    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__["Type"], {
        className: "h-4 w-4",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/tiptap/index.tsx",
        lineNumber: 16,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    defaultData: (id)=>({
            id,
            type: "tiptap",
            content: {
                type: "doc",
                content: []
            }
        }),
    Editor: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TipTapEditor"],
    View: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TipTapView"]
};
}),
"[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ImageGalleryEditor",
    ()=>ImageGalleryEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ImageGalleryEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ImageGalleryEditor() from the server but ImageGalleryEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx <module evaluation>", "ImageGalleryEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "ImageGalleryEditor",
    ()=>ImageGalleryEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ImageGalleryEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ImageGalleryEditor() from the server but ImageGalleryEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx", "ImageGalleryEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageGalleryView",
    ()=>ImageGalleryView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function ImageGalleryView({ block, resolveMedia }) {
    const items = block.items.flatMap((item)=>{
        const media = resolveMedia(item.mediaId);
        return media ? [
            {
                item,
                media
            }
        ] : [];
    });
    if (items.length === 0) return null;
    switch(block.layout){
        case "grid":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
                children: items.map(({ item, media })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Figure, {
                        media: media,
                        caption: item.caption
                    }, item.mediaId, false, {
                        fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                        lineNumber: 40,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this);
        case "carousel":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2",
                children: items.map(({ item, media })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-72 flex-shrink-0 snap-start",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Figure, {
                            media: media,
                            caption: item.caption
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                            lineNumber: 53,
                            columnNumber: 15
                        }, this)
                    }, item.mediaId, false, {
                        fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                lineNumber: 47,
                columnNumber: 9
            }, this);
        case "masonry":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "columns-1 gap-3 sm:columns-2 lg:columns-3",
                children: items.map(({ item, media })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 break-inside-avoid",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Figure, {
                            media: media,
                            caption: item.caption
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                            lineNumber: 64,
                            columnNumber: 15
                        }, this)
                    }, item.mediaId, false, {
                        fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                        lineNumber: 63,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this);
    }
}
/* ─────────────────────────────────────────────────────────────────────── */ /*  Figure                                                                 */ /* ─────────────────────────────────────────────────────────────────────── */ /**
 * Rendu d'une image unique avec légende optionnelle.
 *
 * On émet `width` / `height` quand disponibles pour éviter le layout
 * shift (CLS). `loading="lazy"` + `decoding="async"` pour la perf —
 * pertinent surtout en grid/masonry avec plusieurs images sous la fold.
 *
 * `<img>` direct plutôt que `next/image` parce que notre URL pointe
 * vers une route Next interne (`/api/media/...`) — `next/image`
 * demanderait une config remotePatterns inutile pour des chemins
 * relatifs servis par notre propre app.
 */ function Figure({ media, caption }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("figure", {
        className: "m-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: media.url,
                alt: caption ?? "",
                width: media.width ?? undefined,
                height: media.height ?? undefined,
                loading: "lazy",
                decoding: "async",
                className: "block w-full rounded-md object-cover"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            caption && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("figcaption", {
                className: "mt-1 text-sm text-muted-foreground",
                children: caption
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/page-builder/blocks/image-gallery/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "imageGalleryDefinition",
    ()=>imageGalleryDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$images$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Images$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/images.js [app-rsc] (ecmascript) <export default as Images>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx [app-rsc] (ecmascript)");
;
;
;
;
const imageGalleryDefinition = {
    kind: "image-gallery",
    label: "Galerie d'images",
    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$images$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Images$3e$__["Images"], {
        className: "h-4 w-4",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/image-gallery/index.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    defaultData: (id)=>({
            id,
            type: "image-gallery",
            items: [],
            layout: "grid"
        }),
    Editor: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImageGalleryEditor"],
    View: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImageGalleryView"]
};
}),
"[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AudioCollectionEditor",
    ()=>AudioCollectionEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AudioCollectionEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AudioCollectionEditor() from the server but AudioCollectionEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx <module evaluation>", "AudioCollectionEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "AudioCollectionEditor",
    ()=>AudioCollectionEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AudioCollectionEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AudioCollectionEditor() from the server but AudioCollectionEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx", "AudioCollectionEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AudioCollectionView",
    ()=>AudioCollectionView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function AudioCollectionView({ block, resolveMedia }) {
    const items = block.items.flatMap((item)=>{
        const media = resolveMedia(item.mediaId);
        return media ? [
            {
                item,
                media
            }
        ] : [];
    });
    if (items.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
        className: "flex flex-col gap-3",
        children: items.map(({ item, media })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                className: "rounded-md border border-border bg-card p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-sm font-medium",
                        children: item.title ?? media.fileName
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx",
                        lineNumber: 45,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                        controls: true,
                        preload: "metadata",
                        src: media.url,
                        className: "w-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: media.url,
                            download: media.fileName,
                            children: "Télécharger l'audio"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx",
                            lineNumber: 54,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this)
                ]
            }, item.mediaId, true, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/page-builder/blocks/audio-collection/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "audioCollectionDefinition",
    ()=>audioCollectionDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/music.js [app-rsc] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/audio-collection/editor.client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/audio-collection/view.server.tsx [app-rsc] (ecmascript)");
;
;
;
;
const audioCollectionDefinition = {
    kind: "audio-collection",
    label: "Pistes audio",
    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
        className: "h-4 w-4",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/audio-collection/index.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    defaultData: (id)=>({
            id,
            type: "audio-collection",
            items: []
        }),
    Editor: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AudioCollectionEditor"],
    View: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AudioCollectionView"]
};
}),
"[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "DocumentListEditor",
    ()=>DocumentListEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const DocumentListEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call DocumentListEditor() from the server but DocumentListEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx <module evaluation>", "DocumentListEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "DocumentListEditor",
    ()=>DocumentListEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const DocumentListEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call DocumentListEditor() from the server but DocumentListEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx", "DocumentListEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DocumentListView",
    ()=>DocumentListView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/download.js [app-rsc] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-rsc] (ecmascript) <export default as FileText>");
;
;
function DocumentListView({ block, resolveMedia }) {
    const items = block.items.flatMap((item)=>{
        const media = resolveMedia(item.mediaId);
        return media ? [
            {
                item,
                media
            }
        ] : [];
    });
    if (items.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
        className: "flex flex-col gap-2",
        children: items.map(({ item, media })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: media.url,
                    download: media.fileName,
                    className: "flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                            className: "h-5 w-5 flex-shrink-0 text-muted-foreground",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
                            lineNumber: 51,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex-1 text-sm",
                            children: item.label ?? media.fileName
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
                            lineNumber: 55,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                            className: "h-4 w-4 flex-shrink-0 text-muted-foreground",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
                    lineNumber: 46,
                    columnNumber: 11
                }, this)
            }, item.mediaId, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
                lineNumber: 45,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/page-builder/blocks/document-list/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "documentListDefinition",
    ()=>documentListDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-rsc] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/document-list/editor.client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/document-list/view.server.tsx [app-rsc] (ecmascript)");
;
;
;
;
const documentListDefinition = {
    kind: "document-list",
    label: "Documents",
    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
        className: "h-4 w-4",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/document-list/index.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    defaultData: (id)=>({
            id,
            type: "document-list",
            items: []
        }),
    Editor: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DocumentListEditor"],
    View: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DocumentListView"]
};
}),
"[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "MediaTextEditor",
    ()=>MediaTextEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const MediaTextEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call MediaTextEditor() from the server but MediaTextEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx <module evaluation>", "MediaTextEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "MediaTextEditor",
    ()=>MediaTextEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const MediaTextEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call MediaTextEditor() from the server but MediaTextEditor is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx", "MediaTextEditor");
}),
"[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MediaTextView",
    ()=>MediaTextView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+core@3.27.3_@tiptap+pm@3.27.3/node_modules/@tiptap/core/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$html$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3_happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f40$tiptap$2f$html$2f$dist$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+html@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3_happy-dom@20.9.0/node_modules/@tiptap/html/dist/server/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$starter$2d$kit$40$3$2e$27$2e$1$2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+starter-kit@3.27.1/node_modules/@tiptap/starter-kit/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-list@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-list/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$text$2d$align$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-text-align@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-text-align/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$typography$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$typography$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-typography@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-typography/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$highlight$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$highlight$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-highlight@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3_/node_modules/@tiptap/extension-highlight/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$subscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$subscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-subscript@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-subscript/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$superscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$superscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+extension-superscript@3.27.1_@tiptap+core@3.27.3_@tiptap+pm@3.27.3__@tiptap+pm@3.27.3/node_modules/@tiptap/extension-superscript/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$editor$2d$tiptap$2f$node$2f$horizontal$2d$rule$2d$node$2f$horizontal$2d$rule$2d$node$2d$extension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const ServerLibraryImageNode = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$core$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Node"].create({
    name: "library-image",
    group: "block",
    atom: true,
    addOptions () {
        return {
            resolveMedia: ()=>null
        };
    },
    addAttributes () {
        return {
            mediaId: {
                default: null
            },
            caption: {
                default: null
            }
        };
    },
    renderHTML ({ node }) {
        const mediaId = node.attrs.mediaId;
        const caption = node.attrs.caption;
        if (!mediaId) return [
            "span",
            {
                class: "hidden",
                "aria-hidden": "true"
            }
        ];
        const media = this.options.resolveMedia(mediaId);
        if (!media) return [
            "span",
            {
                class: "hidden",
                "aria-hidden": "true"
            }
        ];
        const imgAttrs = {
            src: media.url,
            alt: caption ?? "",
            loading: "lazy",
            decoding: "async"
        };
        if (media.width !== null) imgAttrs.width = media.width;
        if (media.height !== null) imgAttrs.height = media.height;
        if (caption) {
            return [
                "figure",
                {
                    class: "tiptap-library-image"
                },
                [
                    "img",
                    imgAttrs
                ],
                [
                    "figcaption",
                    {},
                    caption
                ]
            ];
        }
        return [
            "figure",
            {
                class: "tiptap-library-image"
            },
            [
                "img",
                imgAttrs
            ]
        ];
    }
});
function MediaTextView({ block, resolveMedia, resolveAvatar, mediaSide = "left" }) {
    // Média unique résolu (ou null). Selon le kind : média de bibliothèque
    // (resolveMedia) ou référence avatar résolue dynamiquement (resolveAvatar).
    const resolvedMedia = !block.media ? null : block.media.kind === "avatar" ? resolveAvatar?.(block.media.userId) ?? null : resolveMedia(block.media.mediaId);
    const mediaCaption = block.media?.caption;
    // Texte : présent uniquement si content non vide.
    const hasText = block.content !== undefined && block.content !== null && Object.keys(block.content).length > 0;
    const hasMedia = resolvedMedia !== null;
    // Bloc vide (ni texte ni média résolu) → rien.
    if (!hasText && !hasMedia) return null;
    const textHtml = hasText ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$html$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3_happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f40$tiptap$2f$html$2f$dist$2f$server$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateHTML"])(block.content, [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$starter$2d$kit$40$3$2e$27$2e$1$2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StarterKit"].configure({
            horizontalRule: false
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$editor$2d$tiptap$2f$node$2f$horizontal$2d$rule$2d$node$2f$horizontal$2d$rule$2d$node$2d$extension$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HorizontalRule"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$text$2d$align$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$text$2d$align$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextAlign"].configure({
            types: [
                "heading",
                "paragraph"
            ]
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TaskList"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$list$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TaskItem"].configure({
            nested: true
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$highlight$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$highlight$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Highlight"].configure({
            multicolor: true
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$typography$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$2f$node_modules$2f40$tiptap$2f$extension$2d$typography$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Typography"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$subscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$subscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Subscript"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$extension$2d$superscript$40$3$2e$27$2e$1_$40$tiptap$2b$core$40$3$2e$27$2e$3_$40$tiptap$2b$pm$40$3$2e$27$2e$3_$5f40$tiptap$2b$pm$40$3$2e$27$2e$3$2f$node_modules$2f40$tiptap$2f$extension$2d$superscript$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Superscript"],
        ServerLibraryImageNode.configure({
            resolveMedia
        })
    ]) : null;
    const MediaColumn = hasMedia && resolvedMedia ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(MediaFigure, {
        media: resolvedMedia,
        caption: mediaCaption
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
        lineNumber: 119,
        columnNumber: 7
    }, this) : null;
    const TextColumn = textHtml ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "tiptap-rendered prose max-w-none",
        dangerouslySetInnerHTML: {
            __html: textHtml
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this) : null;
    // Une seule partie → centré, pleine largeur (impression de respiration).
    if (!hasText || !hasMedia) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-3xl",
            children: hasMedia ? MediaColumn : TextColumn
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
            lineNumber: 132,
            columnNumber: 7
        }, this);
    }
    // Deux parties → deux colonnes, côté médias selon l'alternance.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid items-center gap-10 md:grid-cols-2",
        children: mediaSide === "left" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: MediaColumn
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                    lineNumber: 143,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: TextColumn
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                    lineNumber: 144,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "md:order-2",
                    children: MediaColumn
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                    lineNumber: 148,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "md:order-1",
                    children: TextColumn
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                    lineNumber: 149,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
        lineNumber: 140,
        columnNumber: 5
    }, this);
}
/* ─────────────────────────────────────────────────────────────────────── */ /*  MediaFigure — image ou vidéo selon le kind résolu                       */ /* ─────────────────────────────────────────────────────────────────────── */ function MediaFigure({ media, caption }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("figure", {
        className: "m-0",
        children: [
            media.kind === "video" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                src: media.url,
                poster: media.posterUrl ?? undefined,
                controls: true,
                className: "block w-full rounded-md"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                lineNumber: 170,
                columnNumber: 9
            }, this) : // eslint-disable-next-line @next/next/no-img-element
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: media.url,
                alt: caption ?? "",
                width: media.width ?? undefined,
                height: media.height ?? undefined,
                loading: "lazy",
                decoding: "async",
                className: "block w-full rounded-md object-cover"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                lineNumber: 178,
                columnNumber: 9
            }, this),
            caption && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("figcaption", {
                className: "mt-1 text-sm text-muted-foreground",
                children: caption
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/page-builder/blocks/media-text/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mediaTextDefinition",
    ()=>mediaTextDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/columns-2.js [app-rsc] (ecmascript) <export default as Columns2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/media-text/view.server.tsx [app-rsc] (ecmascript)");
;
;
;
;
const mediaTextDefinition = {
    kind: "media-text",
    label: "Médias + texte",
    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$columns$2d$2$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Columns2$3e$__["Columns2"], {
        className: "h-4 w-4",
        "aria-hidden": true
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/blocks/media-text/index.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    defaultData: (id)=>({
            id,
            type: "media-text"
        }),
    Editor: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$editor$2e$client$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MediaTextEditor"],
    View: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$view$2e$server$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MediaTextView"]
};
}),
"[project]/apps/web/src/features/page-builder/blockRegistry.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_BLOCK_DEFINITIONS",
    ()=>ALL_BLOCK_DEFINITIONS,
    "getBlockDefinition",
    ()=>getBlockDefinition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/tiptap/index.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/image-gallery/index.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/audio-collection/index.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/document-list/index.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blocks/media-text/index.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
/* ─────────────────────────────────────────────────────────────────────── */ /*  Assemblage                                                             */ /* ─────────────────────────────────────────────────────────────────────── */ const BLOCK_REGISTRY = {
    "image-gallery": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["imageGalleryDefinition"],
    "audio-collection": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audioCollectionDefinition"],
    "document-list": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["documentListDefinition"],
    tiptap: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tiptapDefinition"],
    "media-text": __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mediaTextDefinition"]
};
function getBlockDefinition(kind) {
    return BLOCK_REGISTRY[kind];
}
const ALL_BLOCK_DEFINITIONS = [
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$tiptap$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tiptapDefinition"],
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$image$2d$gallery$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["imageGalleryDefinition"],
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$audio$2d$collection$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audioCollectionDefinition"],
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$document$2d$list$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["documentListDefinition"],
    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blocks$2f$media$2d$text$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mediaTextDefinition"]
];
}),
"[project]/apps/web/src/features/page-builder/PageRenderer.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageRenderer",
    ()=>PageRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolveMediaByIds$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/resolveMediaByIds.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolveAvatarsByUserIds$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/extractMediaIds.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blockRegistry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/blockRegistry.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function PageRenderer({ content }) {
    // 1. Extraction de tous les mediaIds référencés sur la page.
    const mediaIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractMediaIdsFromContent"])(content);
    // 2. Résolution batch (1 requête SQL, filtre `published`).
    //    Audience `public` : les URLs R2 pointent vers la route publique
    //    `/api/media/public/r2/...` qui valide qu'un PageMediaReference
    //    existe avant de signer (cf. sous-chantier 6c).
    const resolvedMap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolveMediaByIds$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveMediaByIds"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"], mediaIds, "public");
    // Lookup synchrone fermé sur la map — passé à chaque View.
    const resolveMedia = (mediaId)=>resolvedMap[mediaId] ?? null;
    // Résolution des avatars référencés par les blocs media-text (référence
    // logique { kind: "avatar", userId } → avatar courant du user).
    const avatarUserIds = content.blocks.flatMap((b)=>b.type === "media-text" && b.media?.kind === "avatar" ? [
            b.media.userId
        ] : []);
    const avatarMap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolveAvatarsByUserIds$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveAvatarsByUserIds"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"], avatarUserIds);
    const resolveAvatar = (userId)=>avatarMap[userId] ?? null;
    if (content.blocks.length === 0) {
        return null;
    }
    // Alternance media-text SANS mutation pendant le rendu (React Compiler) :
    // le côté dérive du rang du bloc dans la liste des seuls blocs media-text.
    const mediaTextIds = content.blocks.filter((b)=>b.type === "media-text").map((b)=>b.id);
    const sideFor = (blockId)=>{
        const rank = mediaTextIds.indexOf(blockId);
        if (rank === -1) return undefined;
        return rank % 2 === 0 ? "left" : "right";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "page-renderer flex flex-col gap-10",
        children: content.blocks.map((block)=>{
            const def = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$blockRegistry$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBlockDefinition"])(block.type);
            const View = def.View;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(View, {
                block: block,
                resolveMedia: resolveMedia,
                resolveAvatar: resolveAvatar,
                mediaSide: sideFor(block.id)
            }, block.id, false, {
                fileName: "[project]/apps/web/src/features/page-builder/PageRenderer.tsx",
                lineNumber: 120,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/page-builder/PageRenderer.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PublicDisciplinePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$PageRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/page-builder/PageRenderer.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$parseContent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/parseContent.ts [app-rsc] (ecmascript)");
;
;
;
;
;
async function PublicDisciplinePage({ params }) {
    const { slug } = await params;
    const discipline = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].discipline.findUnique({
        where: {
            slug
        },
        include: {
            family: {
                select: {
                    name: true
                }
            },
            origin: {
                select: {
                    name: true,
                    flag: true
                }
            }
        }
    });
    if (!discipline) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const description = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$parseContent$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePageContentV1"])(discipline.description);
    const meta = [];
    if (discipline.family?.name) meta.push({
        label: "Famille",
        value: discipline.family.name
    });
    if (discipline.origin?.name) meta.push({
        label: "Origine",
        value: `${discipline.origin.flag ? `${discipline.origin.flag} ` : ""}${discipline.origin.name}`
    });
    if (discipline.school) meta.push({
        label: "École",
        value: discipline.school
    });
    if (discipline.classification) meta.push({
        label: "Classification",
        value: discipline.classification
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "mx-auto max-w-3xl px-6 py-12",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$page$2d$builder$2f$PageRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageRenderer"], {
                content: description
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx",
            lineNumber: 67,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/src/app/(public)/disciplines/[slug]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4d9dea81._.js.map