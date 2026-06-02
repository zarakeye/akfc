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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@aws-sdk/client-s3", () => require("@aws-sdk/client-s3"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[project]/packages/backend/src/modules/storage/adapters/r2/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetR2ClientForTesting",
    ()=>__resetR2ClientForTesting,
    "getR2Bucket",
    ()=>getR2Bucket,
    "getR2Client",
    ()=>getR2Client
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs)");
;
/**
 * client.ts — singleton S3 Client configuré pour Cloudflare R2.
 *
 * R2 est S3-compatible : on utilise donc le SDK `@aws-sdk/client-s3` standard
 * en pointant son `endpoint` vers le S3 API endpoint de Cloudflare et en
 * forçant `region` à `"auto"`.
 *
 * ─── Pourquoi un singleton ? ─────────────────────────────────────────────
 *
 * Le S3Client maintient un pool de connexions HTTP keep-alive. Recréer un
 * client à chaque appel jetterait les connexions et coûterait de la latence
 * (handshake TLS + DNS à chaque fois). Un singleton réutilise les sockets,
 * c'est strictement plus efficace.
 *
 * Pas de problème de concurrence : le S3Client est conçu pour être partagé
 * entre requêtes concurrentes.
 *
 * ─── Pourquoi `region: "auto"` ? ──────────────────────────────────────────
 *
 * R2 ne segmente pas son storage en régions de la même façon qu'AWS S3 (il
 * est global avec une localisation principale par bucket). La valeur `"auto"`
 * dit au SDK de ne pas inclure de header de region — Cloudflare se débrouille.
 *
 * Si on mettait par exemple `"eu-west-1"`, AWS SDK le mettrait dans les
 * signatures et R2 refuserait les requêtes. `"auto"` est la valeur sûre.
 */ let cached = null;
function readEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`R2 env var manquante : ${name}. ` + `Vérifie ton .env.local — toutes les vars R2_* doivent être définies ` + `(R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT).`);
    }
    return value;
}
function getR2Client() {
    if (cached) return cached;
    cached = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["S3Client"]({
        region: "auto",
        endpoint: readEnv("R2_ENDPOINT"),
        credentials: {
            accessKeyId: readEnv("R2_ACCESS_KEY_ID"),
            secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY")
        }
    });
    return cached;
}
function getR2Bucket() {
    return readEnv("R2_BUCKET");
}
function __resetR2ClientForTesting() {
    cached = null;
}
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/contracts/src/auth/constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COOKIE_NAME",
    ()=>COOKIE_NAME,
    "SESSION_DURATION_MS",
    ()=>SESSION_DURATION_MS
]);
const COOKIE_NAME = "__session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
;
}),
"[project]/packages/backend/src/modules/auth/getSessionFromRequest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSessionFromRequest",
    ()=>getSessionFromRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.2/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/auth/constants.ts [app-route] (ecmascript)");
;
;
;
;
const JWT_SECRET = process.env.JWT_SECRET;
function mapSessionDBToSessionClient(session) {
    const role = session.user.role;
    return {
        expiresAt: session.expiresAt,
        user: {
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            pseudo: session.user.pseudo,
            avatar: session.user.avatar,
            isFirstLogin: session.user.isFirstLogin,
            role: role ? {
                id: role.id,
                name: role.name,
                permissions: role.permissions.map((rp)=>rp.permission.name)
            } : null
        }
    };
}
function getCookieFromHeader(cookieHeader, name) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(";").map((p)=>p.trim());
    for (const p of parts){
        if (!p) continue;
        const eq = p.indexOf("=");
        if (eq === -1) continue;
        const k = p.slice(0, eq).trim();
        const v = p.slice(eq + 1).trim();
        if (k === name) return decodeURIComponent(v);
    }
    return null;
}
async function readAuthToken(req) {
    if (req) {
        const token = getCookieFromHeader(req.headers.get("cookie"), __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"]);
        if (token) return token;
    }
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        return cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value ?? null;
    } catch  {
        return null;
    }
}
async function getSessionFromRequest(req) {
    const token = await readAuthToken(req);
    if (!token) return null;
    if (!JWT_SECRET) return null;
    let payload;
    try {
        payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
    const sessionDB = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.findUnique({
        where: {
            id: payload.sessionId
        },
        // 🚀 Force Prisma à produire un JOIN SQL au lieu de N SELECT séquentiels.
        // Pour cette query qui traverse Session → User → Role → RolePermissions
        // → Permission (4 niveaux d'include), le mode 'query' par défaut émettait
        // 5 SELECT en cascade — soit 5 round-trips DB par requête HTTP. Avec
        // 'join', Prisma émet 1 seul SELECT avec des LATERAL JOIN.
        // C'est un findUnique (donc 0 ou 1 ligne), il n'y a aucun risque
        // de multiplication de lignes liée aux relations 1-N.
        relationLoadStrategy: "join",
        include: {
            user: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!sessionDB) return null;
    if (sessionDB.expiresAt < new Date()) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.deleteMany({
            where: {
                id: sessionDB.id
            }
        });
        return null;
    }
    if (!sessionDB.user) {
        return null;
    }
    return mapSessionDBToSessionClient(sessionDB);
}
}),
"[project]/apps/web/src/app/api/media/r2/[...path]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$s3$2d$request$2d$presigner$40$3$2e$1049$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+s3-request-presigner@3.1049.0/node_modules/@aws-sdk/s3-request-presigner/dist-es/getSignedUrl.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/r2/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$getSessionFromRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/auth/getSessionFromRequest.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * Proxy de preview pour les fichiers hébergés sur R2.
 *
 * Pattern : le navigateur appelle `/api/media/r2/<path>`, on vérifie la
 * session admin, on génère une **presigned GET URL** R2 valide 30 minutes,
 * puis on **redirige (302)** le navigateur vers cette URL. Le navigateur
 * va alors récupérer le contenu direct depuis R2 (zero egress côté
 * Cloudflare) — le backend n'est plus dans la boucle pour les octets.
 *
 * ─── Pourquoi un redirect plutôt qu'un streaming via le backend ? ────────
 *
 * Streamer le contenu via le backend Node imposerait que toute la bande
 * passante R2 → user passe par le serveur AKFC (donc charge réseau et
 * mémoire côté Hetzner). Le redirect 302 délègue ça au CDN Cloudflare,
 * qui est *fait* pour ça.
 *
 * Trade-off : l'URL signée est exposée au navigateur. Elle expire en
 * 30 min, est scopée à un seul fichier (GET only), et requiert une
 * session admin valide pour être générée. Acceptable.
 *
 * ─── Path encoding ────────────────────────────────────────────────────────
 *
 * Le `[...path]` de Next.js récupère un tableau de segments URL-decodés.
 * Pour reconstruire la R2 key, on rejoint avec `/` — pas besoin de
 * re-decoder. Si le client a bien encoded segment-par-segment côté UI
 * (split sur '/' puis encodeURIComponent par segment), tout matche.
 *
 * ─── Sécurité ─────────────────────────────────────────────────────────────
 *
 *   - Session admin requise (sinon 401)
 *   - Path validé : doit commencer par l'appRoot pour empêcher l'accès
 *     à des paths hors application
 *   - Pas de fallback "public" : tout le R2 d'AKFC est privé par défaut
 *
 * En cas de partage public (ex: lien envoyé par email), il faudra plus
 * tard une route séparée `/api/share/r2/[token]/...` avec ses propres
 * règles de validation.
 */ const PRESIGNED_URL_EXPIRY_SECONDS = 30 * 60; // 30 minutes
async function GET(req, { params }) {
    // ─── Auth ────────────────────────────────────────────────────────────
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$getSessionFromRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromRequest"])(req);
    if (!session) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Unauthorized', {
            status: 401
        });
    }
    // ─── Path ────────────────────────────────────────────────────────────
    const { path } = await params;
    if (!path || path.length === 0) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Path required', {
            status: 400
        });
    }
    const r2Key = path.join('/');
    // Validation : doit commencer par AKFC/ (isolation tenant)
    // On pourrait importer APP_ROOT mais l'app racine est connue et stable ;
    // on hardcode ici pour éviter une dépendance config dans une route triviale.
    // Si l'app racine change, ce check doit être mis à jour en accord.
    if (!r2Key.startsWith('AKFC/')) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Forbidden: path out of app root', {
            status: 403
        });
    }
    if (r2Key.includes('..')) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Forbidden: invalid path', {
            status: 403
        });
    }
    // ─── Sign GET URL ────────────────────────────────────────────────────
    try {
        const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
        const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["GetObjectCommand"]({
            Bucket: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])(),
            Key: r2Key
        });
        const signedUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$s3$2d$request$2d$presigner$40$3$2e$1049$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSignedUrl"])(s3, command, {
            expiresIn: PRESIGNED_URL_EXPIRY_SECONDS
        });
        // ─── Redirect ──────────────────────────────────────────────────────
        // 302 (temporary redirect) + Cache-Control headers prudents :
        //   - Pas de cache navigateur sur l'URL du proxy (la signature change à chaque appel)
        //   - Le navigateur cachera la réponse R2 elle-même selon ses propres headers
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signedUrl, {
            status: 302,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            }
        });
    } catch (err) {
        console.error('[api/media/r2] Failed to sign URL for', r2Key, err);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]('Internal server error', {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1a16474a._.js.map