module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript)");
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
;
}),
"[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🚀 Cache in-memory des résultats `listAuthenticatedResources`.
 *
 * 🎯 Pourquoi ?
 *
 * L'API admin Cloudinary (`cloudinary.api.resources`) met typiquement
 * **plusieurs secondes** par appel — comportement connu et documenté
 * de l'API. Pour un finder qui interroge à chaque navigation (entrer
 * dans un dossier, déplier un nœud de la TreeView), ça rend l'UX
 * inutilisable au-delà de quelques niveaux.
 *
 * Ce cache stocke en mémoire les résultats d'appels précédents, indexés
 * par `prefix`. Un hit court-circuite complètement l'appel API et passe
 * de ~5s à <1ms.
 *
 * 🔁 Stratégie d'invalidation
 *
 * - **TTL** : 1 heure par entrée. Long mais raisonnable — l'admin qui
 *   édite activement bénéficie surtout des invalidations explicites
 *   ci-dessous, le TTL sert de filet de sécurité.
 *
 * - **Invalidation explicite** : appelée depuis chaque service qui mute
 *   l'état Cloudinary (move, destroy, delete by prefix, register après
 *   upload). Pour 4.4-bis-perf on adopte une purge totale (`invalidate()`
 *   sans argument) — simple et garanti correct. Une invalidation plus
 *   granulaire (par prefix affecté) pourra être mise en place plus tard
 *   si on observe que la purge totale fait perdre trop de hits.
 *
 * ⚠️ Limites assumées
 *
 * - **Single-node** : le cache vit en mémoire du process Node.js, donc
 *   il n'est pas partagé entre instances en déploiement multi-node. C'est
 *   acceptable pour AKFC (déploiement single-node) ; si on passe en
 *   multi-node un jour, il faudra migrer vers Redis ou similaire.
 *
 * - **Perdu au redémarrage** : le cache s'efface à chaque restart du
 *   serveur. C'est OK — le 1er appel après restart sera lent (5s), puis
 *   tout sera rapide.
 *
 * - **Pas de coalescence** : si N requêtes simultanées arrivent en même
 *   temps sur un prefix non-caché, elles déclencheront chacune un appel
 *   API. Pour AKFC c'est probablement OK (faible concurrence admin) ;
 *   à raffiner via un `Map<prefix, Promise>` "in-flight" si nécessaire.
 */ __turbopack_context__.s([
    "getCached",
    ()=>getCached,
    "invalidate",
    ()=>invalidate,
    "setCached",
    ()=>setCached,
    "size",
    ()=>size
]);
/**
 * Durée de vie par entrée du cache, en millisecondes.
 * 1 heure : suffisamment long pour que la majorité des navigations soient
 * cachées, mais assez court pour que les entrées orphelines (cas d'oubli
 * d'invalidation) finissent par disparaître.
 */ const TTL_MS = 60 * 60 * 1000;
const cache = new Map();
function getCached(prefix) {
    // 1. Hit exact ?
    const exact = cache.get(prefix);
    if (exact) {
        if (Date.now() <= exact.expiresAt) {
            return exact.data;
        }
        cache.delete(prefix);
    }
    // 2. Hit d'un préfixe ancêtre ? On cherche le plus profond.
    let bestAncestor = null;
    for (const [cachedPrefix, entry] of cache.entries()){
        // On nettoie les entrées expirées au passage — moins coûteux qu'un job de purge périodique.
        if (Date.now() > entry.expiresAt) {
            cache.delete(cachedPrefix);
            continue;
        }
        // Un ancêtre strict est un préfixe dont `prefix` commence par
        // `cachedPrefix + '/'`. Le `+ '/'` est crucial pour éviter qu'un
        // path `AKFC-bis` matche le cache `AKFC` (false positive).
        if (prefix.startsWith(cachedPrefix + '/')) {
            // On garde le plus profond (= le plus long) car son dataset
            // est plus petit, donc le filtrage est plus rapide.
            if (!bestAncestor || cachedPrefix.length > bestAncestor.prefix.length) {
                bestAncestor = {
                    prefix: cachedPrefix,
                    data: entry.data
                };
            }
        }
    }
    if (bestAncestor) {
        // Filtrage en mémoire : on garde uniquement les assets dont le
        // publicId est dans le périmètre `prefix` (égalité exacte OU descendance).
        return bestAncestor.data.filter((r)=>r.publicId === prefix || r.publicId.startsWith(prefix + '/'));
    }
    return null;
}
function setCached(prefix, data) {
    cache.set(prefix, {
        data,
        expiresAt: Date.now() + TTL_MS
    });
}
function invalidate(prefix) {
    if (prefix === undefined) {
        cache.clear();
        return;
    }
    cache.delete(prefix);
}
function size() {
    return cache.size;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAuthenticatedUrl",
    ()=>buildAuthenticatedUrl,
    "buildVideoPosterUrl",
    ()=>buildVideoPosterUrl,
    "deleteByPrefix",
    ()=>deleteByPrefix,
    "deleteCloudinaryFolderRecursive",
    ()=>deleteCloudinaryFolderRecursive,
    "fetchAuthenticatedAsset",
    ()=>fetchAuthenticatedAsset,
    "fetchVideoPoster",
    ()=>fetchVideoPoster,
    "fileExists",
    ()=>fileExists,
    "getAssetInfo",
    ()=>getAssetInfo,
    "listAuthenticatedResources",
    ()=>listAuthenticatedResources
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
/* -------------------------------------------------------------------------- */ /*                              CONFIG TRANSFO                                */ /* -------------------------------------------------------------------------- */ const transformations = {
    thumb: {
        width: 150,
        height: 150,
        crop: "fill"
    },
    small: {
        width: 300,
        crop: "scale"
    },
    medium: {
        width: 600,
        crop: "scale"
    },
    large: {
        width: 1200,
        crop: "scale"
    },
    original: {}
};
function buildAuthenticatedUrl(publicId, variant, resourceType = "image", version) {
    const transformation = transformations[variant] ?? {};
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].url(publicId, {
        transformation,
        sign_url: true,
        type: "authenticated",
        resource_type: resourceType,
        secure: true,
        // Version Cloudinary (numéro du binaire) : produit une URL `.../v<n>/...`
        // que le CDN traite comme unique. Sans elle, un asset écrasé (publicId
        // fixe, ex. avatar) sert l'ANCIEN binaire encore en cache CDN.
        ...version ? {
            version
        } : {}
    });
}
async function fetchAuthenticatedAsset(publicId, variant, version) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        try {
            const url = buildAuthenticatedUrl(publicId, variant, rt, version);
            const res = await fetch(url, {
                cache: "no-store"
            });
            if (!res.ok) continue;
            return res; // ✅ on retourne le Response natif
        } catch  {
        // on tente le prochain resource_type
        }
    }
    return null;
}
async function getAssetInfo(publicId) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
                type: "authenticated",
                resource_type: rt
            });
            console.log("[asset_id check]", res?.asset_id, res?.public_id);
            if (res?.public_id) {
                return {
                    resource_type: rt,
                    bytes: typeof res.bytes === "number" ? res.bytes : undefined,
                    created_at: res.created_at ? String(res.created_at) : undefined,
                    asset_id: typeof res.asset_id === "string" ? res.asset_id : undefined,
                    format: typeof res.format === "string" ? res.format : undefined
                };
            }
        } catch  {
        // try next
        }
    }
    throw new Error(`Asset not found (any resource_type): ${publicId}`);
}
async function fileExists(publicId) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
                type: "authenticated",
                resource_type: rt
            });
            if (res?.public_id) return true;
        } catch  {
        // continue
        }
    }
    return false;
}
async function deleteByPrefix(prefix) {
    // ─── Étape 1 : supprimer tous les assets sous le prefix ─────────────────
    for (const resourceType of [
        "image",
        "video",
        "raw"
    ]){
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.delete_resources_by_prefix(prefix, {
            type: "authenticated",
            resource_type: resourceType
        });
    }
    // ─── Étape 2 : supprimer récursivement les sous-dossiers vides ──────────
    //
    // Une fois les assets supprimés, on peut tenter de supprimer le dossier
    // racine `prefix` lui-même via `deleteCloudinaryFolderRecursive`. Cette
    // helper descend en profondeur (DFS) pour vider les enfants avant le
    // parent — sinon `delete_folder` échoue avec "folder not empty".
    //
    // On tolère silencieusement les erreurs : si le dossier n'existe pas
    // (cas typique d'un `prefix` sans aucun asset historique), pas grave.
    await deleteCloudinaryFolderRecursive(prefix);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
    return {
        success: true
    };
}
async function deleteCloudinaryFolderRecursive(folderPath) {
    // Liste les sous-dossiers directs.
    let subFolders = [];
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.sub_folders(folderPath);
        subFolders = result.folders ?? [];
    } catch (err) {
        const desc = describeCloudinaryError(err);
        // Le dossier n'existe pas → nothing to do, on retourne silencieusement.
        // Cloudinary répond typiquement avec "Folder not found" ou HTTP 404.
        if (desc.message.toLowerCase().includes("not found") || desc.http_code === 404) {
            return;
        }
        // Autre erreur : on log et on continue (on ne propage pas — la fonction
        // est utilisée dans des batches où une erreur partielle ne doit pas
        // bloquer le reste).
        console.warn(`[deleteCloudinaryFolderRecursive] sub_folders failed for '${folderPath}':`, desc);
        return;
    }
    // DFS : on vide d'abord les enfants pour pouvoir supprimer le parent.
    for (const sub of subFolders){
        await deleteCloudinaryFolderRecursive(sub.path);
    }
    // Maintenant le dossier `folderPath` ne devrait plus avoir de sous-dossiers.
    // On tente de le supprimer. Encore tolérant — si le dossier contient
    // encore des assets cachés (par exemple resource_type pas couvert ailleurs),
    // l'API renverra une erreur qu'on log mais sans bloquer.
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.delete_folder(folderPath);
    } catch (err) {
        const desc = describeCloudinaryError(err);
        if (desc.message.toLowerCase().includes("not found") || desc.http_code === 404) {
            // Pas un échec — le dossier n'existait déjà plus.
            return;
        }
        console.warn(`[deleteCloudinaryFolderRecursive] delete_folder failed for '${folderPath}':`, desc);
    }
}
/**
 * Helper pour extraire un message + http_code lisible depuis une erreur
 * Cloudinary. L'API admin renvoie typiquement
 *   { error: { message, http_code }, http_code, name, ... }
 * — quand on fait `String(err)` ou `err.message` directement, on obtient
 * `[object Object]` ou `undefined`. Ce helper sait dénormaliser.
 */ function describeCloudinaryError(err) {
    if (err instanceof Error) {
        return {
            message: err.message
        };
    }
    if (typeof err === "string") {
        return {
            message: err
        };
    }
    if (err && typeof err === "object") {
        const obj = err;
        const inner = obj.error && typeof obj.error === "object" ? obj.error : null;
        const message = String(inner?.message ?? obj.message ?? JSON.stringify(err) ?? "<unknown>");
        const http_code = typeof inner?.http_code === "number" ? inner.http_code : typeof obj.http_code === "number" ? obj.http_code : undefined;
        return {
            message,
            http_code
        };
    }
    return {
        message: String(err)
    };
}
async function listAuthenticatedResources(prefix) {
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCached"])(prefix);
    if (cached !== null) {
        return cached;
    }
    const baseArgs = {
        type: "authenticated",
        prefix,
        max_results: 500
    };
    const settled = await Promise.allSettled([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
            ...baseArgs,
            resource_type: "image"
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
            ...baseArgs,
            resource_type: "video"
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
            ...baseArgs,
            resource_type: "raw"
        })
    ]);
    const mapped = [];
    const labels = [
        "image",
        "video",
        "raw"
    ];
    // for (let i = 0; i < settled.length; i++) {
    //   const o = settled[i];
    // }
    for(let i = 0; i < settled.length; i++){
        const outcome = settled[i];
        if (outcome.status === "rejected") {
            // On log mais on continue : mieux vaut une liste partielle qu'aucune.
            console.error(`[listAuthenticatedResources] resource_type=${labels[i]} failed for prefix '${prefix}':`, outcome.reason);
            continue;
        }
        for (const r of outcome.value.resources){
            mapped.push({
                publicId: r.public_id,
                url: r.secure_url,
                format: r.format
            });
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCached"])(prefix, mapped);
    return mapped;
}
function buildVideoPosterUrl(publicId, variant = "large") {
    const sizing = transformations[variant] ?? {};
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].url(publicId, {
        resource_type: "video",
        type: "authenticated",
        format: "jpg",
        sign_url: true,
        secure: true,
        transformation: [
            {
                start_offset: "0"
            },
            sizing
        ]
    });
}
async function fetchVideoPoster(publicId, variant) {
    try {
        const url = buildVideoPosterUrl(publicId, variant);
        console.log("[poster] url=", url);
        const res = await fetch(url, {
            cache: "no-store"
        });
        console.log("[poster] status=", res.status, "ct=", res.headers.get("content-type"));
        if (!res.ok) return null;
        return res;
    } catch (e) {
        console.log("[poster] threw", e);
        return null;
    }
}
}),
"[project]/apps/web/src/app/api/media/by-public-id/[...publicId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
;
function parseVariant(value) {
    if (value === "thumb") return "thumb";
    if (value === "small") return "small";
    if (value === "medium") return "medium";
    if (value === "large") return "large";
    if (value === "original") return "original";
    return "large";
}
/* -------------------------------------------------------------------------- */ /*                               FALLBACK IMAGE                               */ /* -------------------------------------------------------------------------- */ // 👉 à remplacer par un vrai asset public (Cloudinary ou local)
const FALLBACK_URL = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
async function GET(req, { params }) {
    try {
        const { publicId } = await params;
        const id = publicId?.join("/");
        if (!id) {
            return new Response("Missing publicId", {
                status: 400
            });
        }
        const { searchParams } = new URL(req.url);
        const variant = parseVariant(searchParams.get("variant"));
        const asPoster = searchParams.get("as") === "poster";
        // `v` = version Cloudinary du binaire (transmise par le store d'avatar).
        // Passée à Cloudinary, elle garantit le bon fichier malgré un publicId
        // fixe écrasé (sinon l'ancien binaire caché sur le CDN).
        const vParam = searchParams.get("v");
        const version = vParam ? Number(vParam) : undefined;
        const safeVersion = version && Number.isFinite(version) ? version : undefined;
        const asset = asPoster ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchVideoPoster"])(id, variant) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAuthenticatedAsset"])(id, variant, safeVersion);
        /* ---------------------------------------------------------------------- */ /*                               NOT FOUND                                */ /* ---------------------------------------------------------------------- */ if (!asset || !asset.ok || !asset.body) {
            console.warn(`[media] asset not found → fallback`, {
                id,
                variant
            });
            const fallback = await fetch(FALLBACK_URL);
            if (!fallback.ok || !fallback.body) {
                return new Response("Fallback failed", {
                    status: 500
                });
            }
            return new Response(fallback.body, {
                status: 200,
                headers: buildHeaders(fallback, true)
            });
        }
        /* ---------------------------------------------------------------------- */ /*                                SUCCESS                                 */ /* ---------------------------------------------------------------------- */ return new Response(asset.body, {
            status: 200,
            headers: buildHeaders(asset)
        });
    } catch (error) {
        console.error("[media] unexpected error", error);
        return new Response("Internal Server Error", {
            status: 500
        });
    }
}
/* -------------------------------------------------------------------------- */ /*                                HEADERS BUILDER                             */ /* -------------------------------------------------------------------------- */ function buildHeaders(res, isFallback = false) {
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    return {
        "Content-Type": contentType,
        // 🔥 CDN / navigateur cache
        "Cache-Control": isFallback ? "public, max-age=60" // fallback → court
         : "public, max-age=31536000, immutable",
        // 🔥 optionnel mais utile (debug / observabilité)
        "X-Asset-Source": isFallback ? "fallback" : "cloudinary"
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6d7c4d65._.js.map