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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
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
"[project]/packages/config/app.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
}),
"[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTRPCContext",
    ()=>createTRPCContext,
    "protectedProcedure",
    ()=>protectedProcedure,
    "publicProcedure",
    ()=>publicProcedure,
    "router",
    ()=>router,
    "t",
    ()=>t
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$CB9uBez5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/initTRPC-CB9uBez5.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$superjson$40$2$2e$2$2e$6$2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/superjson@2.2.6/node_modules/superjson/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$getSessionFromRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/auth/getSessionFromRequest.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-route] (ecmascript)");
;
;
;
;
;
function getIpFromRequest(req) {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) {
        const first = xff.split(",")[0]?.trim();
        if (first) return first;
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
    return null;
}
async function createTRPCContext({ req }) {
    const sessionClient = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$getSessionFromRequest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromRequest"])(req);
    return {
        sessionClient,
        prisma: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"],
        requestIp: getIpFromRequest(req),
        userAgent: req.headers.get("user-agent"),
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["APP_ROOT"],
        user: {
            id: sessionClient?.user?.id ?? "anonymous"
        }
    };
}
const t = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$CB9uBez5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initTRPC"].context().create({
    transformer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$superjson$40$2$2e$2$2e$6$2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]
});
const router = t.router;
const publicProcedure = t.procedure;
const isAuthed = t.middleware(({ ctx, next })=>{
    const sessionClient = ctx.sessionClient;
    if (!sessionClient?.user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED"
        });
    }
    return next({
        ctx: {
            ...ctx,
            sessionClient: sessionClient
        }
    });
});
const protectedProcedure = t.procedure.use(isAuthed);
}),
"[project]/packages/backend/src/lib/session/session.server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSessionJWT",
    ()=>createSessionJWT,
    "deleteSessionFromCookie",
    ()=>deleteSessionFromCookie,
    "getToken",
    ()=>getToken,
    "verifyJwt",
    ()=>verifyJwt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.2/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/auth/constants.ts [app-route] (ecmascript)");
;
;
;
;
const JWT_SECRET = process.env.JWT_SECRET;
async function createSessionJWT(user) {
    const expiresAt = new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_DURATION_MS"]);
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.create({
        data: {
            userId: user.id,
            expiresAt
        }
    });
    const payload = {
        sessionId: session.id
    };
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: "7d"
    });
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"], token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/"
    });
    return {
        sessionId: session.id
    };
}
async function deleteSessionFromCookie() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value;
    if (!token) return;
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].session.deleteMany({
            where: {
                id: payload.sessionId
            }
        });
    } catch (err) {
        console.error("deleteSession error:", err);
    }
    cookieStore.delete(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"]);
}
async function getToken() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value ?? null;
}
function verifyJwt(token) {
    try {
        if (!token) return null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
}
}),
"[project]/packages/backend/src/modules/auth/services/auth.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @server/services/auth.service.ts
__turbopack_context__.s([
    "loginService",
    ()=>loginService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$lib$2f$session$2f$session$2e$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/lib/session/session.server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
;
;
;
;
async function loginService(email, password) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            email
        },
        // 🚀 JOIN SQL au lieu de SELECT en cascade (cf. note dans
        // getSessionFromRequest pour le détail).
        relationLoadStrategy: "join",
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
    });
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED",
            message: "INVALID_CREDENTIALS"
        });
    }
    const valid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
    if (!valid) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED",
            message: "INVALID_CREDENTIALS"
        });
    }
    const normalizedUser = {
        ...user,
        role: user.role ? {
            ...user.role,
            permissions: user.role.permissions.map((p)=>p.permission)
        } : null
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$lib$2f$session$2f$session$2e$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSessionJWT"])(normalizedUser);
}
}),
"[project]/packages/backend/src/modules/auth/services/passwordReset.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RESET_TOKEN_COOLDOWN_MS",
    ()=>RESET_TOKEN_COOLDOWN_MS,
    "RESET_TOKEN_TTL_MS",
    ()=>RESET_TOKEN_TTL_MS,
    "createPasswordResetToken",
    ()=>createPasswordResetToken,
    "hashResetToken",
    ()=>hashResetToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min
const RESET_TOKEN_COOLDOWN_MS = 1000 * 60 * 2; // 2 min
function createPasswordResetToken() {
    const token = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString("hex"); // 64 chars
    const tokenHash = hashResetToken(token);
    return {
        token,
        tokenHash
    };
}
function hashResetToken(token) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(token).digest("hex");
}
}),
"[project]/packages/backend/src/email/services/sendPasswordResetEmail.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * sendPasswordResetEmail.ts
 *
 * Remplace ce fichier par ton provider email (Resend, SES, Nodemailer, etc.)
 * On garde une implémentation safe pour dev.
 */ __turbopack_context__.s([
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail
]);
const APP_URL = process.env.APP_URL || "http://localhost:3000";
async function sendPasswordResetEmail(params) {
    const { toEmail, token } = params;
    const resetLink = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
    // ✅ DEV STUB: log
    // En prod: envoyer un email HTML/text
    console.log("🔐 Password reset email");
    console.log("To:", toEmail);
    console.log("Link:", resetLink);
    return {
        ok: true
    };
}
}),
"[project]/packages/backend/src/modules/auth/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authRouter",
    ()=>authRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$lib$2f$session$2f$session$2e$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/lib/session/session.server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/auth/services/auth.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$passwordReset$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/auth/services/passwordReset.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$email$2f$services$2f$sendPasswordResetEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/email/services/sendPasswordResetEmail.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const authRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    login: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
        password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit avoir au moins 12 caractères")
    })).mutation(async ({ input })=>{
        const { email, password } = input;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginService"])(email, password);
            return {
                success: true
            };
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"] && error.message === "INVALID_CREDENTIALS") {
                return {
                    success: false,
                    error: "INVALID_CREDENTIALS"
                };
            }
            return {
                success: false,
                error: "LOGIN_FAILED"
            };
        }
    }),
    logout: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].mutation(async ()=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$lib$2f$session$2f$session$2e$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteSessionFromCookie"])();
        return {
            success: true
        };
    }),
    getSession: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.sessionClient;
    }),
    requestPasswordReset: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email()
    })).mutation(async ({ input, ctx })=>{
        const email = input.email.trim().toLowerCase();
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                email: true
            }
        });
        if (!user) {
            return {
                ok: true
            };
        }
        const lastToken = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.findFirst({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                createdAt: true
            }
        });
        if (lastToken) {
            const elapsed = Date.now() - lastToken.createdAt.getTime();
            if (elapsed < __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$passwordReset$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RESET_TOKEN_COOLDOWN_MS"]) {
                return {
                    ok: true
                };
            }
        }
        const { token, tokenHash } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$passwordReset$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPasswordResetToken"])();
        const expiresAt = new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$passwordReset$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RESET_TOKEN_TTL_MS"]);
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
                requestIp: ctx.requestIp ?? null,
                userAgent: ctx.userAgent ?? null
            }
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$email$2f$services$2f$sendPasswordResetEmail$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])({
            toEmail: user.email,
            token
        });
        return {
            ok: true
        };
    }),
    resetPassword: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        token: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10),
        newPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit faire au moins 12 caractères")
    })).mutation(async ({ input })=>{
        const token = input.token.trim();
        const tokenHash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$passwordReset$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashResetToken"])(token);
        const entry = await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].passwordResetToken.findUnique({
            where: {
                tokenHash
            },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
                usedAt: true
            }
        });
        if (!entry) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Invalid or expired token"
            });
        }
        if (entry.usedAt) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Token already used"
            });
        }
        if (entry.expiresAt.getTime() < Date.now()) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Token expired"
            });
        }
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(input.newPassword, 12);
        await __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            await tx.user.update({
                where: {
                    id: entry.userId
                },
                data: {
                    password: hashedPassword,
                    isFirstLogin: false
                }
            });
            await tx.passwordResetToken.update({
                where: {
                    id: entry.id
                },
                data: {
                    usedAt: new Date()
                }
            });
            await tx.session.deleteMany({
                where: {
                    userId: entry.userId
                }
            });
        });
        return {
            ok: true
        };
    })
});
}),
"[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isAdmin",
    ()=>isAdmin,
    "requirePermission",
    ()=>requirePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
const requirePermission = (permissionName)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["t"].middleware(({ ctx, next })=>{
        const user = ctx.sessionClient?.user;
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "UNAUTHORIZED",
                message: "Authentication required."
            });
        }
        const permissions = user.role?.permissions ?? [];
        const hasPermission = permissions.includes(permissionName);
        if (!hasPermission) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "FORBIDDEN",
                message: `Missing permission: ${permissionName}`
            });
        }
        return next();
    });
const isAdmin = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["t"].middleware(({ ctx, next })=>{
    const user = ctx.sessionClient?.user;
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED",
            message: "Authentication required."
        });
    }
    if (user.role?.name !== "ADMIN") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Administrator access required."
        });
    }
    return next();
});
}),
"[project]/packages/contracts/src/forms/updateMeForm.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateMeFormSchema",
    ()=>updateMeFormSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const updateMeFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    firstName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Le prénom doit avoir au moins 1 caractère"),
    lastName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "Le nom de famille doit avoir au moins 2 caractères"),
    // email: z.string().refine((value) => {
    //   // Regular expression to validate email format
    //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    // }, 'Veuillez fournir une adresse e-mail valide'),
    pseudo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    aboutMe: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000).optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>{
        if (!val) return true;
        const cleaned = val.replace(/\D/g, ""); // supprime espaces, tirets, etc.
        return /^0[1-9]\d{8}$/.test(cleaned);
    }, "Le numéro de téléphone doit être valide (ex: 0XXXXXXXXX)"),
    birthDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>{
        if (!val) return true;
        return !Number.isNaN(Date.parse(val));
    }, "Date de naissance invalide"),
    avatar: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url("URL invalide").optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(''))
});
}),
"[project]/packages/contracts/src/forms/updateUserRoleById.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateUserRoleByIdSchema",
    ()=>updateUserRoleByIdSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const updateUserRoleByIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    userId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "userId is required"),
    roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive("roleId must be a positive integer")
});
}),
"[project]/packages/backend/src/modules/users/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "userRouter",
    ()=>userRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$updateMeForm$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/forms/updateMeForm.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$updateUserRoleById$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/forms/updateUserRoleById.schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const userRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).query(async ({ ctx })=>{
        return ctx.prisma.user.findMany({
            orderBy: {
                id: "asc"
            },
            relationLoadStrategy: "join",
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
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        const user = await ctx.prisma.user.findUnique({
            where: {
                id: input.id
            },
            relationLoadStrategy: "join",
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
        });
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        return user;
    }),
    getByEmail: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email()
    })).query(async ({ ctx, input })=>{
        const user = await ctx.prisma.user.findUnique({
            where: {
                email: input.email
            },
            relationLoadStrategy: "join",
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
        });
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        return user;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email format"),
        password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.user.findUnique({
            where: {
                email: input.email
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "User already exists"
            });
        }
        const hash = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(input.password, 12);
        const user = await ctx.prisma.user.create({
            data: {
                email: input.email,
                password: hash,
                roleId: input.roleId
            }
        });
        return {
            success: true,
            user
        };
    }),
    updateProfile: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$updateMeForm$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateMeFormSchema"]).mutation(async ({ ctx, input })=>{
        const userId = ctx.sessionClient.user.id;
        return ctx.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...input,
                isFirstLogin: false
            }
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.user.delete({
            where: {
                id: input.id
            }
        });
    }),
    getCurrentUserProfile: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const userId = ctx.sessionClient.user.id;
        const user = await ctx.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                pseudo: true,
                avatar: true,
                aboutMe: true,
                phone: true,
                birthDate: true,
                isFirstLogin: true,
                role: true
            }
        });
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        const userProfile = {
            ...user,
            birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null
        };
        return userProfile;
    }),
    updateUserRoleById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$forms$2f$updateUserRoleById$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateUserRoleByIdSchema"]).mutation(async ({ ctx, input })=>{
        const actorId = ctx.sessionClient.user.id;
        if (actorId === input.userId) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "FORBIDDEN",
                message: "You cannot change your own role."
            });
        }
        const role = await ctx.prisma.role.findUnique({
            where: {
                id: input.roleId
            },
            select: {
                id: true
            }
        });
        if (!role) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Role not found"
            });
        }
        const user = await ctx.prisma.user.update({
            where: {
                id: input.userId
            },
            data: {
                roleId: input.roleId
            },
            relationLoadStrategy: "join",
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
        });
        return user;
    }),
    getProfileById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        const user = await ctx.prisma.user.findUnique({
            where: {
                id: input.id
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                pseudo: true,
                avatar: true,
                aboutMe: true,
                phone: true,
                birthDate: true,
                isFirstLogin: true,
                role: true
            }
        });
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        const userProfile = {
            ...user,
            birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null
        };
        return userProfile;
    })
});
}),
"[project]/packages/backend/src/modules/roles/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "roleRouter",
    ()=>roleRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
const roleRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).query(async ({ ctx })=>{
        return ctx.prisma.role.findMany({
            orderBy: {
                id: "asc"
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const role = await ctx.prisma.role.findUnique({
            where: {
                id: input.id
            }
        });
        if (!role) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Role not found"
            });
        }
        return role;
    }),
    getByIdWithPermissions: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const role = await ctx.prisma.role.findUnique({
            where: {
                id: input.id
            },
            relationLoadStrategy: "join",
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        if (!role) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Role not found"
            });
        }
        return role;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        permissionIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()).optional()
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.role.findUnique({
            where: {
                name: input.name
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Role already exists"
            });
        }
        return ctx.prisma.role.create({
            data: {
                name: input.name,
                permissions: input.permissionIds ? {
                    create: input.permissionIds.map((id)=>({
                            permissionId: id
                        }))
                } : undefined
            },
            relationLoadStrategy: "join",
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        permissions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()).default([])
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.role.findUnique({
            where: {
                name: input.name
            },
            select: {
                id: true
            }
        });
        if (exists && exists.id !== input.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Another role with this name already exists."
            });
        }
        const roleId = input.id;
        return ctx.prisma.role.update({
            where: {
                id: roleId
            },
            data: {
                name: input.name,
                permissions: {
                    set: input.permissions.map((permissionId)=>({
                            roleId_permissionId: {
                                roleId,
                                permissionId
                            }
                        }))
                }
            },
            relationLoadStrategy: "join",
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.role.delete({
            where: {
                id: input.id
            }
        });
    })
});
}),
"[project]/packages/backend/src/modules/session/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sessionRouter",
    ()=>sessionRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
const sessionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]).query(async ({ ctx })=>{
        return ctx.prisma.session.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
    }),
    updateExpiration: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        expiresAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].date()
    })).mutation(async ({ ctx, input })=>{
        const session = await ctx.prisma.session.findUnique({
            where: {
                id: input.id
            },
            select: {
                id: true
            }
        });
        if (!session) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Session not found"
            });
        }
        return ctx.prisma.session.update({
            where: {
                id: input.id
            },
            data: {
                expiresAt: input.expiresAt
            }
        });
    })
});
}),
"[project]/packages/contracts/src/cloudinary/move.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "folderKindSchema",
    ()=>folderKindSchema,
    "moveSchema",
    ()=>moveSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const folderKindSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'pending',
    'published',
    'bin'
]);
/* ---------- SOURCE ---------- */ const fileSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('file'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const folderSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/**
 * ✅ Multi-selection support
 */ const selectionSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('selection'),
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
    excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
});
const sourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    fileSourceSchema,
    folderSourceSchema,
    selectionSourceSchema
]);
/* ---------- TARGET ---------- */ const virtualTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('virtual-folder'),
    status: folderKindSchema
});
const folderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const targetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    virtualTargetSchema,
    folderTargetSchema
]);
const moveSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    source: sourceSchema,
    target: targetSchema
});
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
"[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript)");
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["v2"].config({
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
    "deleteByPrefix",
    ()=>deleteByPrefix,
    "fetchAuthenticatedAsset",
    ()=>fetchAuthenticatedAsset,
    "fileExists",
    ()=>fileExists,
    "getAssetInfo",
    ()=>getAssetInfo,
    "listAuthenticatedResources",
    ()=>listAuthenticatedResources
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
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
function buildAuthenticatedUrl(publicId, variant, resourceType = "image") {
    const transformation = transformations[variant] ?? {};
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].url(publicId, {
        transformation,
        sign_url: true,
        type: "authenticated",
        resource_type: resourceType,
        secure: true
    });
}
async function fetchAuthenticatedAsset(publicId, variant) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        try {
            const url = buildAuthenticatedUrl(publicId, variant, rt);
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
                type: "authenticated",
                resource_type: rt
            });
            if (res?.public_id) {
                return {
                    resource_type: rt,
                    bytes: typeof res.bytes === "number" ? res.bytes : undefined,
                    created_at: res.created_at ? String(res.created_at) : undefined
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
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
    for (const resourceType of [
        "image",
        "video",
        "raw"
    ]){
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.delete_resources_by_prefix(prefix, {
            type: "authenticated",
            resource_type: resourceType
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
    return {
        success: true
    };
}
async function listAuthenticatedResources(prefix) {
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCached"])(prefix);
    if (cached !== null) {
        return cached;
    }
    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
        type: "authenticated",
        prefix,
        max_results: 500
    });
    const mapped = result.resources.map((r)=>({
            publicId: r.public_id,
            url: r.secure_url,
            format: r.format
        }));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCached"])(prefix, mapped);
    return mapped;
}
}),
"[project]/packages/backend/src/modules/cloudinary/utils/cloudinary.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "folderTarget",
    ()=>folderTarget,
    "makeMoveIntent",
    ()=>makeMoveIntent,
    "moveFileIntoFolder",
    ()=>moveFileIntoFolder,
    "replaceStatusSegment",
    ()=>replaceStatusSegment,
    "virtualTarget",
    ()=>virtualTarget
]);
function replaceStatusSegment(fullPath, newStatus) {
    const parts = fullPath.split('/');
    if (parts.length < 2) {
        throw new Error(`Invalid Cloudinary path: ${fullPath}`);
    }
    // part[0] = app name
    // part[1] = status segment
    parts[1] = newStatus;
    return parts.join('/');
}
function moveFileIntoFolder(filePath, folderPath) {
    const fileName = filePath.split('/').pop();
    if (!fileName) {
        throw new Error(`Invalid filePath: ${filePath}`);
    }
    return `${folderPath}/${fileName}`;
}
function virtualTarget(status) {
    return {
        type: 'virtual',
        status
    };
}
function folderTarget(fullPath) {
    return {
        type: 'folder',
        fullPath
    };
}
function makeMoveIntent(source, target) {
    return source.type === 'file' ? {
        source: {
            type: 'file',
            fullPath: source.fullPath
        },
        target
    } : {
        source: {
            type: 'folder',
            fullPath: source.fullPath
        },
        target
    };
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/move.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "moveService",
    ()=>moveService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/cloudinary.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
;
;
async function moveService(intent) {
    const { source, target } = intent;
    console.log('Executing move intent:', intent);
    /**
   * ---------------------------------------------------------------------------
   * ✅ 0) MULTI-SELECT
   * ---------------------------------------------------------------------------
   */ if (source.type === 'selection') {
        // Matérialiser la sélection (roots/excluded) en assets (public_id + resource_type)
        const assets = await collectSelectedAssets({
            roots: source.roots,
            excluded: source.excluded ?? []
        });
        // Dedup par public_id (au cas où roots se recoupent)
        const dedup = new Map();
        for (const a of assets)dedup.set(a.public_id, a);
        const uniqueAssets = Array.from(dedup.values());
        // ---------- selection -> virtual-folder ----------
        if (target.type === 'virtual-folder') {
            for (const asset of uniqueAssets){
                const nextPublicId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(asset.public_id, target.status);
                // no-op : déjà dans le bon status
                if (nextPublicId === asset.public_id) continue;
                await renameAsset(asset.public_id, nextPublicId, asset.resource_type);
            }
            return;
        }
        // ---------- selection -> folder ----------
        if (target.type === 'folder') {
            /**
       * IMPORTANT:
       * - On doit préserver la structure pour les dossiers sélectionnés.
       * - Mais ici on a seulement les assets. Donc on fait du renommage "par root":
       *   - si root est un fichier => moveFileIntoFolder
       *   - si root est un dossier => replace prefix root -> target/fullFolderName
       *
       * Pour ça, on va exécuter les moves root par root, en tenant compte des excluded.
       */ await moveSelectionIntoFolder({
                roots: source.roots,
                excluded: source.excluded ?? [],
                targetFolder: target.fullPath
            });
            return;
        }
        throw new Error('Invalid target for selection');
    }
    /**
   * ---------------------------------------------------------------------------
   * 1) FILE / FOLDER -> VIRTUAL
   * ---------------------------------------------------------------------------
   */ if (target.type === 'virtual-folder') {
        const newPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(source.fullPath, target.status);
        if (source.type === 'file') {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(source.fullPath);
            await renameAsset(source.fullPath, newPrefix, info.resource_type);
        } else {
            await moveFolderRecursively(source.fullPath, newPrefix);
        }
        return;
    }
    /**
   * ---------------------------------------------------------------------------
   * 2) FILE / FOLDER -> FOLDER
   * ---------------------------------------------------------------------------
   */ if (target.type === 'folder') {
        if (source.type === 'file') {
            const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveFileIntoFolder"])(source.fullPath, target.fullPath);
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(source.fullPath);
            await renameAsset(source.fullPath, newPath, info.resource_type);
        } else {
            const folderName = source.fullPath.split('/').pop();
            if (!folderName) return;
            const targetPrefix = `${target.fullPath}/${folderName}`;
            await moveFolderRecursively(source.fullPath, targetPrefix);
        }
        return;
    }
    throw new Error('Invalid move intent');
}
/**
 * ---------------------------------------------------------------------------
 * Cloudinary helpers
 * ---------------------------------------------------------------------------
 */ /**
 * Rename an asset on Cloudinary with the given resource type.
 * @param from The current public ID of the asset.
 * @param to The new public ID of the asset.
 * @param resourceType The type of the asset to rename.
 * @returns A promise that resolves when the asset has been renamed.
 */ async function renameAsset(from, to, resourceType) {
    // ✅ on passe resource_type pour que rename marche (image/video/raw)
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, {
        type: 'authenticated',
        resource_type: resourceType,
        overwrite: true
    });
    // 🔁 Le state Cloudinary vient de changer — purge le cache des resources
    // pour que la prochaine lecture (tree, list) reflète l'état réel.
    // C'est une purge totale par simplicité ; voir resourcesCache.ts pour
    // les considérations sur une invalidation plus granulaire.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
}
/**
 * List all the assets under a given prefix (authenticated) for image/video/raw.
 * NOTE perf:
 * - on pagine par 500.
 * - en cas de gros dossiers, cette liste peut être lourde.
 *   On optimise plus tard si nécessaire (cache, listing par "subfolders", etc.).
 * @param prefix The prefix to list assets under.
 * @returns A promise that resolves with an array of ListedAsset objects.
 */ async function listAssetsByPrefix(prefix) {
    const out = [];
    for (const rt of [
        'image',
        'video',
        'raw'
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: 'authenticated',
                resource_type: rt,
                prefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources){
                out.push({
                    public_id: asset.public_id,
                    resource_type: rt
                });
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
    return out;
}
/**
 * Renomme un dossier récursivement (image/video/raw) de sourcePrefix vers targetPrefix.
 * - On bouge image/video/raw, paginé.
 * - (Ton ancienne version ne gérait qu'un type implicite et une pagination partielle selon usage.)
 * @param sourcePrefix Le préfixe actuel du dossier à renommer.
 * @param targetPrefix Le préfixe cible du dossier à renommer.
 * @returns Une promesse qui se résout lorsqu'un dossier a été renommé.
 */ async function moveFolderRecursively(sourcePrefix, targetPrefix) {
    /**
   * Version robuste: on bouge image/video/raw, paginé.
   * (Ton ancienne version ne gérait qu’un type implicite et une pagination partielle selon usage.)
   */ for (const rt of [
        'image',
        'video',
        'raw'
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: 'authenticated',
                resource_type: rt,
                prefix: sourcePrefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources){
                const newPublicId = asset.public_id.replace(sourcePrefix, targetPrefix);
                await renameAsset(asset.public_id, newPublicId, rt);
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
}
/**
 * ---------------------------------------------------------------------------
 * ✅ Multi-select resolver: roots/excluded -> liste d'assets
 * ---------------------------------------------------------------------------
 */ /**
 * Collect all the assets that are under the given roots and not excluded.
 * @param input The input object with roots and excluded arrays.
 * @returns A promise that resolves with an array of ListedAsset objects.
 */ async function collectSelectedAssets(input) {
    const excluded = input.excluded ?? [];
    const isExcluded = (publicId)=>excluded.some((ex)=>publicId === ex || publicId.startsWith(`${ex}/`));
    const out = [];
    for (const root of input.roots){
        if (isExcluded(root)) continue;
        // 1) root est-il un asset ?
        const asset = await tryGetAsset(root);
        if (asset) {
            if (!isExcluded(asset.public_id)) out.push(asset);
            continue;
        }
        // 2) sinon root est un dossier => liste tous les assets sous le prefix
        const assetsUnder = await listAssetsByPrefix(root);
        for (const a of assetsUnder){
            if (!isExcluded(a.public_id)) out.push(a);
        }
    }
    return out;
}
/**
 * Try to get an asset from Cloudinary by its public ID, authenticated.
 * The function will try all the resource types in order (image, video, raw).
 * If an asset is found, it returns a ListedAsset object with the public ID and resource type.
 * If no asset is found (any resource type), it returns null.
 * @param publicId The public ID of the asset to try to get.
 * @returns A promise that resolves with a ListedAsset object or null.
 */ async function tryGetAsset(publicId) {
    for (const rt of [
        'image',
        'video',
        'raw'
    ]){
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
                type: 'authenticated',
                resource_type: rt
            });
            if (res?.public_id) {
                return {
                    public_id: res.public_id,
                    resource_type: rt
                };
            }
        } catch  {
        // continue
        }
    }
    return null;
}
/**
 * ---------------------------------------------------------------------------
 * ✅ selection -> folder (préserve la structure des dossiers sélectionnés)
 * ---------------------------------------------------------------------------
 *
 * On traite root par root (pas juste "assets globaux") pour:
 * - fichier root => moveFileIntoFolder
 * - dossier root => move sous targetFolder en conservant le nom du dossier
 *
 * On respecte excluded (fichier ou dossier) via la même règle "prefix".
 */ async function moveSelectionIntoFolder(params) {
    const { roots, excluded, targetFolder } = params;
    /**
   * Returns true if the public ID is excluded, false otherwise.
   * An asset is excluded if its public ID is equal to an excluded string
   * or if it starts with an excluded string followed by a slash.
   * @param publicId The public ID to check.
   * @returns True if the asset is excluded, false otherwise.
   */ const isExcluded = (publicId)=>excluded.some((ex)=>publicId === ex || publicId.startsWith(`${ex}/`));
    for (const root of roots){
        if (isExcluded(root)) continue;
        // root asset ?
        const asset = await tryGetAsset(root);
        if (asset) {
            const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveFileIntoFolder"])(asset.public_id, targetFolder);
            await renameAsset(asset.public_id, newPath, asset.resource_type);
            continue;
        }
        // root folder => déplacer sous targetFolder en gardant folderName
        const folderName = root.split('/').pop();
        if (!folderName) continue;
        const targetPrefix = `${targetFolder}/${folderName}`;
        // On liste tous les assets sous root et on renomme root -> targetPrefix (en respectant excluded)
        const assetsUnder = await listAssetsByPrefix(root);
        for (const a of assetsUnder){
            if (isExcluded(a.public_id)) continue;
            const newPublicId = a.public_id.replace(root, targetPrefix);
            await renameAsset(a.public_id, newPublicId, a.resource_type);
        }
    }
}
}),
"[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCloudinaryTree",
    ()=>buildCloudinaryTree
]);
function buildCloudinaryTree(resources, registeredFolderPaths, rootPath) {
    const root = {
        type: "folder",
        name: rootPath.split("/").pop(),
        path: rootPath,
        children: []
    };
    /**
   * Ensures that the given absolute folder path exists in the tree.
   *
   * @param absoluteFolderPath - The absolute folder path to ensure
   *
   * This function will create all necessary intermediate folders in the tree
   * if they do not already exist.
   */ const ensureFolder = (absoluteFolderPath)=>{
        if (absoluteFolderPath === rootPath) return;
        const relative = absoluteFolderPath.replace(`${rootPath}/`, "");
        const parts = relative.split("/").filter(Boolean);
        let current = root;
        for (const part of parts){
            let next = current.children.find((c)=>c.type === "folder" && c.name === part);
            if (!next) {
                next = {
                    type: "folder",
                    name: part,
                    path: `${current.path}/${part}`,
                    children: []
                };
                current.children.push(next);
            }
            current = next;
        }
    };
    // 1) Créer d’abord tous les dossiers enregistrés en DB (y compris vides)
    for (const folderPath of registeredFolderPaths){
        if (folderPath === rootPath) continue;
        if (!folderPath.startsWith(rootPath)) continue;
        ensureFolder(folderPath);
    }
    // 2) Injecter ensuite les fichiers Cloudinary (et créer les dossiers au passage si manquants)
    for (const resource of resources){
        const relativePath = resource.publicId.replace(`${rootPath}/`, "");
        const parts = relativePath.split("/").filter(Boolean);
        let current = root;
        parts.forEach((part, index)=>{
            const isFile = index === parts.length - 1;
            if (isFile) {
                // éviter les doublons
                const already = current.children.find((c)=>c.type === "file" && c.publicId === resource.publicId);
                if (!already) {
                    current.children.push({
                        type: "file",
                        name: part,
                        publicId: resource.publicId,
                        url: resource.url,
                        format: resource.format
                    });
                }
                return;
            }
            let folder = current.children.find((c)=>c.type === "folder" && c.name === part);
            if (!folder) {
                folder = {
                    type: "folder",
                    name: part,
                    path: `${current.path}/${part}`,
                    children: []
                };
                current.children.push(folder);
            }
            current = folder;
        });
    }
    return root;
}
}),
"[project]/packages/backend/src/modules/cloudinary/tree/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * 🧱 Cloudinary Tree – Public Facade
 *
 * This module acts as the **stable public entry point** for building a
 * Cloudinary folder tree on the server.
 *
 * ──────────────────────────────────────────────────────────────
 * Versioning strategy
 * ──────────────────────────────────────────────────────────────
 * - The actual implementation lives in versioned modules
 *   (e.g. `cloudinary.tree.v1.ts`).
 * - This facade re-exports a specific version under an explicit name
 *   (`buildCloudinaryTreeV1`).
 *
 * This allows:
 * - Multiple contract versions to coexist safely
 * - Explicit imports in consumers (no hidden breaking changes)
 * - A clear upgrade path when V2 / V3 are introduced
 *
 * ──────────────────────────────────────────────────────────────
 * Usage
 * ──────────────────────────────────────────────────────────────
 * Consumers SHOULD import from this facade, never directly
 * from versioned files.
 *
 * Example:
 * ```ts
 * import { buildCloudinaryTreeV1 } from "@/server/cloudinary/tree";
 * ```
 *
 * When a new version is released:
 * - A new implementation file is added
 * - This facade is updated (or extended) deliberately
 *
 * No automatic version switching is performed by design.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript) <export buildCloudinaryTree as buildCloudinaryTreeV1>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCloudinaryTreeV1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCloudinaryTree"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript)");
}),
"[project]/packages/backend/src/modules/cloudinary/utils/folder.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "folderAncestorsOfFolderPath",
    ()=>folderAncestorsOfFolderPath,
    "folderAncestorsOfPublicId",
    ()=>folderAncestorsOfPublicId,
    "statusFromPath",
    ()=>statusFromPath,
    "upsertFolders",
    ()=>upsertFolders
]);
/**
 * Utilitaires de manipulation de paths et folders Cloudinary.
 *
 * Ces helpers étaient inline dans `cloudinary/router.ts`. Ils ont été
 * extraits ici pour être réutilisables par les services et adapters
 * (notamment `getCloudinaryFolderTree.service.ts` et
 * `cloudinaryStorageAdapter`).
 *
 * Aucun changement de logique par rapport à la version inline du router.
 */ function normalizePath(path) {
    return path.replace(/^\/+|\/+$/g, "");
}
function folderAncestorsOfPublicId(publicId) {
    const parts = normalizePath(publicId).split("/").filter(Boolean);
    if (parts.length < 2) return [];
    const folders = parts.slice(0, -1);
    const out = [];
    for(let i = 1; i <= folders.length; i++){
        out.push(folders.slice(0, i).join("/"));
    }
    return out;
}
function folderAncestorsOfFolderPath(folderPath) {
    const parts = normalizePath(folderPath).split("/").filter(Boolean);
    const out = [];
    for(let i = 1; i <= parts.length; i++){
        out.push(parts.slice(0, i).join("/"));
    }
    return out;
}
function statusFromPath(path) {
    const parts = normalizePath(path).split("/").filter(Boolean);
    const status = parts[1];
    if (status === "published") return "published";
    if (status === "bin") return "bin";
    return "pending";
}
async function upsertFolders(db, paths, appRoot) {
    const unique = Array.from(new Set(paths)).filter(Boolean);
    if (unique.length === 0) return;
    // 🚀 Stratégie bulk : findMany + createMany(skipDuplicates) au lieu de N upserts en série.
    //
    // Avant : pour 10 dossiers ancêtres, on faisait 10 round-trips DB séquentiels
    // dans une transaction, soit ~2-9 secondes selon la latence — alors que la
    // grande majorité des dossiers existent déjà depuis longtemps.
    //
    // Maintenant : on lit en une seule round-trip quels paths existent déjà,
    // on filtre les nouveaux, et on les insère en bulk avec `skipDuplicates`
    // (filet de sécurité contre les races avec d'autres requêtes concurrentes).
    //
    // Sémantique : la version `upsert` précédente avait un `update: { status }`
    // qui ne servait à rien — `statusFromPath` est pure (dérive du path),
    // et le path est la PK donc immuable. L'update est donc un noop, on peut
    // s'en passer sans changement de comportement.
    // 1) Lecture en bulk des paths existants.
    const existing = await db.cloudinaryFolder.findMany({
        where: {
            appRoot,
            fullPath: {
                in: unique
            }
        },
        select: {
            fullPath: true
        }
    });
    const existingSet = new Set(existing.map((e)=>e.fullPath));
    // 2) Filtrage : on ne crée que les nouveaux.
    const newOnes = unique.filter((p)=>!existingSet.has(p));
    if (newOnes.length === 0) return;
    // 3) Création en bulk. `skipDuplicates` protège contre les races
    //    (deux requêtes parallèles qui voudraient créer le même path).
    await db.cloudinaryFolder.createMany({
        data: newOnes.map((fullPath)=>({
                appRoot,
                fullPath,
                status: statusFromPath(fullPath)
            })),
        skipDuplicates: true
    });
}
}),
"[project]/packages/backend/src/mappers/cloudinary/tree.v1.mapper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapCloudinaryFileToClient",
    ()=>mapCloudinaryFileToClient,
    "mapCloudinaryFolderToClient",
    ()=>mapCloudinaryFolderToClient,
    "mapCloudinaryNodeToClient",
    ()=>mapCloudinaryNodeToClient
]);
function mapCloudinaryFolderToClient(folder) {
    return {
        type: "folder",
        fullPath: folder.path,
        name: folder.name,
        children: folder.children.map(mapCloudinaryNodeToClient)
    };
}
function resolveKind(format) {
    if (!format) return 'document';
    if (/jpg|jpeg|png|webp|avif/.test(format)) return 'image';
    if (/mp4|webm|mov/.test(format)) return 'video';
    return 'document';
}
function mapCloudinaryFileToClient(file) {
    return {
        type: "file",
        name: file.name,
        fullPath: file.publicId,
        publicId: file.publicId,
        url: file.url,
        format: file.format,
        kind: resolveKind(file.format)
    };
}
function mapCloudinaryNodeToClient(node) {
    return node.type === "folder" ? mapCloudinaryFolderToClient(node) : mapCloudinaryFileToClient(node);
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/getCloudinaryFolderTree.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCloudinaryFolderTree",
    ()=>getCloudinaryFolderTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__buildCloudinaryTree__as__buildCloudinaryTreeV1$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript) <export buildCloudinaryTree as buildCloudinaryTreeV1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/folder.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$mappers$2f$cloudinary$2f$tree$2e$v1$2e$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/mappers/cloudinary/tree.v1.mapper.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Map des promesses "en vol" par clé `appRoot::normalizedPath`.
 *
 * ─── Pourquoi ? ────────────────────────────────────────────────────────────
 *
 * Au montage du Finder, deux composants demandent en parallèle l'arbre
 * sous le `rootPath` :
 *   1. `FinderTree` (sidebar gauche) appelle `adapter.getTree({ depth: 2 })`
 *   2. `useFinderData` (panneau central) appelle `adapter.list({ })`, qui
 *      côté backend redescend également vers `getCloudinaryFolderTree`
 *
 * Les deux appels HTTP arrivent quasi-simultanément, déclenchent chacun
 * la cascade Cloudinary + Prisma (transactions DB séquentielles, ~1.5s
 * en dev mode), et font donc deux fois exactement le même travail.
 *
 * Ce dedupe résout le problème côté service : si un appel sur le même
 * `(appRoot, normalizedPath)` est déjà en cours, le second l'attend au
 * lieu de tout refaire. Pour le client tRPC, le résultat reste identique
 * (deux requêtes répondues avec les mêmes données) — mais le backend
 * n'exécute le travail qu'une seule fois.
 *
 * ─── Pourquoi pas en HashMap global de cache ? ─────────────────────────────
 *
 * On ne cache pas les résultats au-delà de la durée de la promesse :
 *   - Si on cachait au-delà, on rendrait des données stale après une
 *     mutation (move, delete, etc.)
 *   - Le vrai cache (Cloudinary resources) est déjà géré par
 *     `resourcesCache.ts` avec TTL et invalidations explicites
 *
 * Ce `Map` ne sert qu'à fusionner les appels strictement simultanés.
 * Dès que la promesse résout (succès ou erreur), l'entrée est retirée
 * via le `.finally()` interne — le prochain appel sur le même path
 * relance un fetch frais.
 *
 * ─── Sécurité mémoire ──────────────────────────────────────────────────────
 *
 * Le `Map` est borné de fait par le nombre de paths distincts en cours
 * de fetch à un instant T (donc quelques dizaines au plus). Pas de risque
 * de fuite mémoire — chaque entrée est retirée à la résolution de sa promesse.
 */ const inFlight = new Map();
async function getCloudinaryFolderTree(params) {
    const { prisma, appRoot, normalizedPath } = params;
    const key = `${appRoot}::${normalizedPath}`;
    // Si un appel sur la même clé est déjà en cours, on retourne sa promesse
    // — elle résoudra simultanément pour les deux appelants.
    const existing = inFlight.get(key);
    if (existing) return existing;
    const promise = (async ()=>{
        // 1) Récupérer les assets réels sous le préfixe (image / video / raw, paginés).
        const resources = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAuthenticatedResources"])(normalizedPath);
        // 2) Découvrir tous les dossiers ancêtres de chaque asset, et les upsert
        //    dans le registre DB. C'est ce qui permet aux dossiers vides de survivre.
        const discoveredFolderPaths = resources.flatMap((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfPublicId"])(r.publicId));
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertFolders"])(prisma, discoveredFolderPaths, appRoot);
        // 3) Lire le registre DB filtré par préfixe — il contient à la fois les
        //    dossiers ancêtres qu'on vient d'upserter ET les dossiers vides
        //    déjà enregistrés (placeholders).
        const registered = await prisma.cloudinaryFolder.findMany({
            where: {
                appRoot,
                fullPath: {
                    startsWith: normalizedPath
                }
            },
            select: {
                fullPath: true
            }
        });
        // 4) Construire l'arbre interne et le mapper vers la forme client.
        //
        // ─── Note importante sur `.trash` ───────────────────────────────────────
        //
        // L'arbre construit INCLUT le sous-arbre `bin/.trash/<uuid>/...` tel
        // qu'il existe côté Cloudinary. Le filtrage visuel de ce sous-arbre est
        // de la responsabilité du FRONTEND :
        //   - TreeView : skip pur du node `.trash` (rend ses enfants directement),
        //     et substitution des uuids par leur `displayName` via `trash.listBin`
        //   - Grille en bin root : remplace le rendu standard par la liste plate
        //     des trashEntries (vue corbeille intégrée)
        //
        // Ce design (vs filtrage backend) permet :
        //   - La navigation profonde dans une trashEntry depuis le finder
        //     (le path Cloudinary reste réel, donc Cloudinary peut répondre)
        //   - Une logique d'affichage co-localisée avec l'UI qui a besoin du
        //     `trashMap` de toute façon (pour les displayName)
        // ───────────────────────────────────────────────────────────────────────
        const finderTree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__buildCloudinaryTree__as__buildCloudinaryTreeV1$3e$__["buildCloudinaryTreeV1"])(resources, registered.map((f)=>f.fullPath), normalizedPath);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$mappers$2f$cloudinary$2f$tree$2e$v1$2e$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapCloudinaryFolderToClient"])(finderTree);
    })();
    inFlight.set(key, promise);
    // Cleanup quelle que soit l'issue (résolution ou erreur). On utilise
    // `.finally` pour ne jamais transformer l'erreur — la promesse originale
    // (avec son rejet éventuel) est bien celle retournée à l'appelant.
    promise.finally(()=>{
        inFlight.delete(key);
    });
    return promise;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROOT_FOLDER_STATUSES",
    ()=>ROOT_FOLDER_STATUSES,
    "ensureRootFolders",
    ()=>ensureRootFolders,
    "isRootFolder",
    ()=>isRootFolder
]);
const ROOT_FOLDER_STATUSES = [
    "pending",
    "published",
    "bin"
];
async function ensureRootFolders(prisma, appRoot) {
    let created = 0;
    for (const status of ROOT_FOLDER_STATUSES){
        const fullPath = `${appRoot}/${status}`;
        const existing = await prisma.cloudinaryFolder.findUnique({
            where: {
                appRoot_fullPath: {
                    appRoot,
                    fullPath
                }
            },
            select: {
                id: true
            }
        });
        if (existing) continue;
        await prisma.cloudinaryFolder.create({
            data: {
                appRoot,
                fullPath,
                status
            }
        });
        created += 1;
    }
    return {
        created,
        total: ROOT_FOLDER_STATUSES.length
    };
}
function isRootFolder(appRoot, fullPath) {
    const normalized = fullPath.replace(/^\/+|\/+$/g, "");
    if (normalized === appRoot) return true;
    for (const status of ROOT_FOLDER_STATUSES){
        if (normalized === `${appRoot}/${status}`) return true;
    }
    return false;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolvePendingUploadFolder",
    ()=>resolvePendingUploadFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$6$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/slugify@1.6.6/node_modules/slugify/slugify.js [app-route] (ecmascript)");
;
/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * Règles du chemin :
 *   - `${appRoot}/pending/${slug(category.type)}/${discipline.id}`
 *     pour une `existing-discipline` : discipline déjà inscrite en DB,
 *     identifiée par son id numérique.
 *   - `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedDisciplineName)}`
 *     pour une `new-discipline` : discipline non encore créée en DB. Les assets
 *     restent isolés dans un sous-dossier `new/` jusqu'à ce qu'un admin valide
 *     la création de la discipline.
 *
 * Pourquoi slugifier `category.type` et pas `discipline.id` :
 *   - `category.type` est un libellé humain ("Cours", "Stage", "Démo") qui
 *     peut contenir accents et majuscules — non safe comme segment d'URL/path.
 *   - `discipline.id` est un entier autoincrement : aucun besoin de slug.
 *
 * Invariant de cohérence :
 *   La discipline ciblée doit appartenir à la catégorie ciblée
 *   (`discipline.categoryId === destination.categoryId`). Cette validation
 *   remplace l'ancienne règle soft `activity.martialArt === category.type`
 *   du modèle 3-niveaux — elle est maintenant portée par une foreign key.
 */ const SLUG_OPTIONS = {
    lower: true,
    strict: true
};
function slug(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$6$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(input, SLUG_OPTIONS);
}
async function resolvePendingUploadFolder(params) {
    const { prisma, destination, appRoot } = params;
    const category = await prisma.category.findUnique({
        where: {
            id: destination.categoryId
        },
        select: {
            id: true,
            type: true
        }
    });
    if (!category) {
        throw new Error(`Category not found (id=${destination.categoryId})`);
    }
    const categorySegment = slug(category.type);
    if (destination.kind === "existing-discipline") {
        const discipline = await prisma.discipline.findUnique({
            where: {
                id: destination.disciplineId
            },
            select: {
                id: true,
                categoryId: true
            }
        });
        if (!discipline) {
            throw new Error(`Discipline not found (id=${destination.disciplineId})`);
        }
        if (discipline.categoryId !== destination.categoryId) {
            throw new Error(`Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`);
        }
        return `${appRoot}/pending/${categorySegment}/${discipline.id}`;
    }
    // kind === "new-discipline"
    const proposedSlug = slug(destination.proposedDisciplineName);
    if (!proposedSlug) {
        throw new Error("Proposed discipline name must contain at least one slug-friendly character");
    }
    return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUploadSignatures",
    ()=>createUploadSignatures
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts [app-route] (ecmascript)");
;
;
async function createUploadSignatures(params) {
    const { prisma, appRoot, destination, assets } = params;
    const folder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePendingUploadFolder"])({
        prisma,
        destination,
        appRoot
    });
    const timestamp = Math.floor(Date.now() / 1000);
    return assets.map((asset)=>{
        const publicId = asset.fileName.replace(/\.[^/.]+$/, "");
        const toSign = {
            folder,
            timestamp,
            public_id: publicId,
            type: "authenticated"
        };
        const signature = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha1").update(Object.keys(toSign).sort().map((k)=>`${k}=${toSign[k]}`).join("&") + process.env.CLOUDINARY_API_SECRET).digest("hex");
        return {
            fileName: asset.fileName,
            mimeType: asset.mimeType,
            mediaType: asset.mediaType,
            resourceType: asset.mediaType,
            folder,
            publicId,
            timestamp,
            type: "authenticated",
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        };
    });
}
}),
"[project]/packages/backend/src/modules/cloudinary/utils/media-validation.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertResourceTypeMatchesMimeType",
    ()=>assertResourceTypeMatchesMimeType,
    "assertSupportedMimeType",
    ()=>assertSupportedMimeType
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
]);
const ALLOWED_VIDEO_MIME_TYPES = new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime"
]);
function assertSupportedMimeType(params) {
    const { mimeType, mediaType } = params;
    if (mediaType === "image" && !ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Unsupported image mime type: ${mimeType}`
        });
    }
    if (mediaType === "video" && !ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Unsupported video mime type: ${mimeType}`
        });
    }
}
function assertResourceTypeMatchesMimeType(params) {
    const { resourceType, mimeType } = params;
    if (resourceType === "image" && !mimeType.startsWith("image/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Resource type and mime type do not match."
        });
    }
    if (resourceType === "video" && !mimeType.startsWith("video/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Resource type and mime type do not match."
        });
    }
}
}),
"[project]/packages/backend/src/modules/cloudinary/utils/path-validation.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertSafeCloudinaryPath",
    ()=>assertSafeCloudinaryPath,
    "sanitizeBaseName",
    ()=>sanitizeBaseName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
;
function sanitizeBaseName(fileName) {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const sanitized = withoutExtension.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!sanitized) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Invalid file name."
        });
    }
    return sanitized;
}
function assertSafeCloudinaryPath(path, appRoot) {
    if (!path.startsWith(`${appRoot}/pending/`)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Uploads are only allowed under pending."
        });
    }
    if (path.includes("..") || path.includes("/.trash/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Invalid asset path."
        });
    }
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readUploadedAssetMetadata",
    ()=>readUploadedAssetMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
;
;
async function readUploadedAssetMetadata(params) {
    const { publicId, resourceType } = params;
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
            resource_type: resourceType,
            type: "authenticated"
        });
        return {
            publicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType,
            format: result.format ?? null,
            bytes: result.bytes ?? 0,
            width: result.width ?? null,
            height: result.height ?? null,
            duration: result.duration ?? null
        };
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Uploaded asset not found on Cloudinary."
        });
    }
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/registerUploadedAssets.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "registerUploadedAssets",
    ()=>registerUploadedAssets
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$media$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/media-validation.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$path$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/path-validation.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$readUploadedAssetMetadata$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function registerUploadedAssets(params) {
    const { prisma, appRoot, userId, destination, assets, eventDate } = params;
    const expectedFolder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePendingUploadFolder"])({
        prisma,
        destination,
        appRoot
    });
    const created = await prisma.$transaction(async (tx)=>{
        const out = [];
        for (const asset of assets){
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$path$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertSafeCloudinaryPath"])(asset.folder, appRoot);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$media$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertResourceTypeMatchesMimeType"])({
                resourceType: asset.resourceType,
                mimeType: asset.mimeType
            });
            if (asset.folder !== expectedFolder) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "FORBIDDEN",
                    message: "Asset folder does not match the authorized pending destination."
                });
            }
            if (!asset.publicId.startsWith(`${expectedFolder}/`)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "FORBIDDEN",
                    message: "Asset publicId does not match the authorized pending destination."
                });
            }
            const cloudinaryAsset = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$readUploadedAssetMetadata$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readUploadedAssetMetadata"])({
                publicId: asset.publicId,
                resourceType: asset.resourceType
            });
            if (cloudinaryAsset.publicId !== asset.publicId) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "PublicId mismatch."
                });
            }
            if (cloudinaryAsset.secureUrl !== asset.secureUrl) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "SecureUrl mismatch."
                });
            }
            const createdAsset = await tx.mediaAsset.create({
                data: {
                    publicId: cloudinaryAsset.publicId,
                    secureUrl: cloudinaryAsset.secureUrl,
                    resourceType: cloudinaryAsset.resourceType,
                    mimeType: asset.mimeType,
                    format: cloudinaryAsset.format,
                    originalFileName: asset.originalFileName,
                    displayName: asset.displayName ?? null,
                    description: asset.description ?? null,
                    bytes: cloudinaryAsset.bytes,
                    width: cloudinaryAsset.width,
                    height: cloudinaryAsset.height,
                    duration: cloudinaryAsset.duration,
                    appRoot,
                    status: "pending",
                    categoryId: destination.categoryId,
                    disciplineId: destination.kind === "existing-discipline" ? destination.disciplineId : null,
                    proposedDisciplineName: destination.kind === "new-discipline" ? destination.proposedDisciplineName : null,
                    eventDate: eventDate ?? null,
                    uploaderUserId: userId
                }
            });
            out.push(createdAsset);
        }
        return out;
    });
    // 🔁 Les assets viennent d'être uploadés sur Cloudinary par le client
    // (via signature) puis enregistrés en DB ici. Le cache backend ne sait
    // pas qu'ils existent — purge pour que le prochain `listAuthenticatedResources`
    // refasse l'appel API et les voie.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
    return {
        success: true,
        assets: created.map((asset)=>({
                id: asset.id,
                publicId: asset.publicId,
                secureUrl: asset.secureUrl
            }))
    };
}
}),
"[project]/packages/contracts/src/cloudinary/upload.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUploadSignaturesSchema",
    ()=>createUploadSignaturesSchema,
    "registerUploadedAssetsSchema",
    ()=>registerUploadedAssetsSchema,
    "registeredAssetSchema",
    ()=>registeredAssetSchema,
    "uploadAssetRequestSchema",
    ()=>uploadAssetRequestSchema,
    "uploadDestinationSchema",
    ()=>uploadDestinationSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const uploadDestinationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("existing-discipline"),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("new-discipline"),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        proposedDisciplineName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120)
    })
]);
const uploadAssetRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    fileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    mediaType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "image",
        "video"
    ])
});
const createUploadSignaturesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    destination: uploadDestinationSchema,
    assets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(uploadAssetRequestSchema).min(1).max(20)
});
const registeredAssetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    publicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(500),
    secureUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    resourceType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "image",
        "video"
    ]),
    originalFileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    displayName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).optional(),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    format: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(50).optional(),
    bytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    width: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional(),
    folder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(500)
});
const registerUploadedAssetsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    destination: uploadDestinationSchema,
    eventDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().optional(),
    assets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(registeredAssetSchema).min(1).max(20)
});
}),
"[project]/packages/backend/src/modules/cloudinary/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloudinaryRouter",
    ()=>cloudinaryRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$move$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/cloudinary/move.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$move$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/move.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/getCloudinaryFolderTree.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__buildCloudinaryTree__as__buildCloudinaryTreeV1$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/tree/finder.tree.v1.ts [app-route] (ecmascript) <export buildCloudinaryTree as buildCloudinaryTreeV1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/cloudinary.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/folder.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$ensureRootFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$createUploadSignatures$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$registerUploadedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/registerUploadedAssets.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/cloudinary/upload.schema.ts [app-route] (ecmascript)");
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
;
;
;
;
;
;
const PROJECT_ROOT = process.env.APP_SHORT_NAME || "my-app";
const adminProcedure = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]);
/**
 * Helper de déprécation pour les procédures du router Cloudinary qui ont
 * un équivalent dans le router agnostique `storage.*` (chantier 1, statut B2).
 *
 * Loggué à chaque appel runtime pour rendre visible côté serveur les
 * callsites front qui n'ont pas encore migré. La suppression effective
 * de ces procédures interviendra quand un audit confirmera que plus
 * aucun callsite n'appelle la version dépréciée.
 *
 * Garder un format de message stable facilite le grep côté logs de prod
 * (`grep '\[deprecated cloudinary\]' logs/`) pour mesurer la migration.
 */ function logDeprecation(oldProcedure, newProcedure) {
    console.warn(`[deprecated cloudinary] "${oldProcedure}" is deprecated. ` + `Use "${newProcedure}" instead. ` + `This procedure will be removed once all frontend callsites have migrated.`);
}
function normalizePath(path) {
    return path.replace(/^\/+|\/+$/g, "");
}
function assertSafePath(path) {
    if (!path.startsWith(PROJECT_ROOT)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Forbidden path."
        });
    }
    if (path.includes("..")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Invalid path."
        });
    }
}
/**
 * Interdit toute opération "cloudinaryRouter" sur le storage caché du bin.
 *
 * Pourquoi :
 * - Un contenu placé en corbeille est immuable (lecture / restore / deleteForever uniquement).
 * - Toute mutation sur `.trash` doit passer par `trashRouter`.
 */ function assertNotInTrashStorage(path) {
    const p = normalizePath(path);
    if (p.startsWith(`${PROJECT_ROOT}/bin/.trash/`)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Forbidden operation on trash storage. Use trashRouter."
        });
    }
}
/**
 * Interdit toute mutation d'un dossier racine immuable (`pending`, `published`,
 * `bin`) ou de la racine du projet elle-même.
 *
 * Pourquoi :
 * - Ces dossiers structurent l'architecture Cloudinary ; leur disparition ou
 *   renommage briserait `assertSafePath`, `statusFromPath` et le routage de
 *   tout upload.
 * - Ils sont garantis présents par `ensureRootFolders` (au boot et au seed).
 * - Leur existence étant acquise, l'UI ne doit jamais avoir besoin de les
 *   créer ni les modifier.
 */ function assertRootFolder(path) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$ensureRootFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRootFolder"])(PROJECT_ROOT, path)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Forbidden operation on a root folder (pending / published / bin). Root folders are immutable."
        });
    }
}
/**
 * Renommer un asset Cloudinary (authenticated) de manière robuste.
 * Cloudinary exige souvent le bon resource_type.
 */ async function renameAuthenticatedResource(fromPublicId, toPublicId) {
    const resourceTypes = [
        "image",
        "video",
        "raw"
    ];
    let lastError = null;
    for (const resourceType of resourceTypes){
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(fromPublicId, toPublicId, {
                type: "authenticated",
                resource_type: resourceType,
                overwrite: true
            });
            // 🔁 Mutation Cloudinary réussie → purge le cache des resources.
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
            return;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
        code: "INTERNAL_SERVER_ERROR",
        message: "Rename failed."
    });
}
/**
 * Détruire un asset Cloudinary (authenticated) de manière robuste.
 * Les typings Cloudinary exigent parfois resource_type => on teste image/video/raw.
 */ async function destroyAuthenticatedResource(publicId) {
    const resourceTypes = [
        "image",
        "video",
        "raw"
    ];
    let lastError = null;
    for (const resourceType of resourceTypes){
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(publicId, {
                type: "authenticated",
                resource_type: resourceType
            });
            // 🔁 Mutation Cloudinary réussie → purge le cache des resources.
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
            return;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
        code: "INTERNAL_SERVER_ERROR",
        message: "Destroy failed."
    });
}
/**
 * Renommer/migrer un préfixe de dossier sur Cloudinary :
 * - renomme TOUS les assets sous fromPrefix/ vers toPrefix/
 * - pour image/video/raw
 */ async function renameFolderPrefixOnCloudinary(fromPrefix, toPrefix) {
    const resourceTypes = [
        "image",
        "video",
        "raw"
    ];
    for (const resourceType of resourceTypes){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: resourceType,
                prefix: fromPrefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                const from = asset.public_id;
                const to = from.replace(fromPrefix, toPrefix);
                await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, {
                    type: "authenticated",
                    resource_type: resourceType,
                    overwrite: true
                });
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
    // 🔁 Une seule invalidation en fin d'opération plutôt qu'à chaque rename :
    // on évite les invalidations en rafale pendant un long batch. Le cache
    // n'est pas lu pendant la boucle (seul `cloudinary.api.resources` est
    // appelé directement, pas via le cache), donc c'est sans risque de stale.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
}
/**
 * Upsert un ensemble de folders (ancêtres inclus).
 * Important pour “matérialiser” en DB des dossiers rencontrés via Cloudinary.
 */ /**
 * NOTE : `upsertFolders` est désormais importé depuis `folder.utils.ts`.
 * Sa signature est `(db, paths, appRoot)` — `appRoot` doit être passé
 * explicitement par chaque callsite (ici on utilise `PROJECT_ROOT`).
 */ /**
 * ✅ DB SYNC: déplacer/renommer des dossiers “DB-only” sous un préfixe.
 *
 * Pourquoi :
 * - Cloudinary n'a pas de dossiers réels.
 * - Un dossier vide (placeholder DB) n'a pas d'assets => moveService ne “voit” rien.
 * - Donc si on glisse ce dossier vers /bin (ou autre status), la DB doit être renommée.
 */ async function moveDbFoldersPrefix(params) {
    const { db, fromPrefix, toPrefix, nextStatus } = params;
    const rows = await db.cloudinaryFolder.findMany({
        where: {
            appRoot: PROJECT_ROOT,
            OR: [
                {
                    fullPath: fromPrefix
                },
                {
                    fullPath: {
                        startsWith: `${fromPrefix}/`
                    }
                }
            ]
        },
        select: {
            id: true,
            fullPath: true
        }
    });
    if (!rows.length) return;
    await db.$transaction(async (tx)=>{
        for (const row of rows){
            const newFullPath = row.fullPath === fromPrefix ? toPrefix : `${toPrefix}${row.fullPath.slice(fromPrefix.length)}`;
            await tx.cloudinaryFolder.upsert({
                where: {
                    appRoot_fullPath: {
                        appRoot: PROJECT_ROOT,
                        fullPath: newFullPath
                    }
                },
                create: {
                    appRoot: PROJECT_ROOT,
                    fullPath: newFullPath,
                    status: nextStatus
                },
                update: {
                    status: nextStatus
                }
            });
            await tx.cloudinaryFolder.delete({
                where: {
                    id: row.id
                }
            });
        }
    });
}
const cloudinaryRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Prépare des uploads signés Cloudinary.
   *
   * Règle métier :
   * - tout user connecté peut uploader
   * - tout upload arrive obligatoirement sous `pending`
   * - la destination finale est résolue côté serveur
   *
   * @deprecated Use `storage.createUploadAuthorization` instead (router
   *   storage agnostique, chantier 1.5 statut B2). Cette procédure est
   *   conservée pour ne pas casser les callsites front qui ne sont pas
   *   encore migrés. Sera supprimée après audit zéro-callsite.
   */ createUploadSignatures: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignaturesSchema"]).mutation(async ({ ctx, input })=>{
        logDeprecation("cloudinary.createUploadSignatures", "storage.createUploadAuthorization");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$createUploadSignatures$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignatures"])({
            prisma: ctx.prisma,
            appRoot: PROJECT_ROOT,
            destination: input.destination,
            assets: input.assets
        });
    }),
    /**
   * Enregistre côté backend les assets réellement uploadés sur Cloudinary.
   *
   * Règle métier :
   * - l'uploader réel vient toujours de la session
   * - le backend revalide la destination `pending`
   * - le backend relit les métadonnées réelles depuis Cloudinary
   * - création des MediaAsset en DB
   * - `appRoot` est résolu côté serveur (jamais fourni par le client) afin
   *   d'éviter qu'un client malveillant cible un autre projet
   *
   * @deprecated Use `storage.registerUploadedAsset` instead (router storage
   *   agnostique, chantier 1.5 statut B2). Cette procédure est conservée
   *   pour ne pas casser les callsites front qui ne sont pas encore migrés.
   *   Sera supprimée après audit zéro-callsite.
   */ registerUploadedAssets: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerUploadedAssetsSchema"]).mutation(async ({ ctx, input })=>{
        logDeprecation("cloudinary.registerUploadedAssets", "storage.registerUploadedAsset");
        const userId = ctx.sessionClient.user.id;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$registerUploadedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerUploadedAssets"])({
            prisma: ctx.prisma,
            appRoot: PROJECT_ROOT,
            userId,
            destination: input.destination,
            assets: input.assets,
            eventDate: input.eventDate
        });
    }),
    /**
   * ✅ Tree Finder (DB folders + Cloudinary files)
   * - Sync opportuniste: on upsert en DB les folders rencontrés via Cloudinary.
   *
   * @deprecated Use `storage.getTree` instead (router storage agnostique,
   *   chantier 1.5 statut B2). La nouvelle procédure prend un paramètre
   *   `provider: 'cloudinary'` et un `depth` optionnel. Sera supprimée
   *   après audit zéro-callsite.
   */ getFolderTree: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).query(async ({ ctx, input })=>{
        logDeprecation("cloudinary.getFolderTree", "storage.getTree");
        const normalizedPath = normalizePath(input.path);
        assertSafePath(normalizedPath);
        // Logique entière déléguée au service `getCloudinaryFolderTree`
        // pour qu'elle soit aussi consommable par l'adapter du contrat
        // agnostique. Comportement strictement identique à l'inline historique.
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCloudinaryFolderTree"])({
            prisma: ctx.prisma,
            appRoot: PROJECT_ROOT,
            normalizedPath
        });
    }),
    getPendingTree: adminProcedure.query(async ()=>{
        const rootPath = `${PROJECT_ROOT}/pending`;
        const resources = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAuthenticatedResources"])(rootPath);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$tree$2f$finder$2e$tree$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__buildCloudinaryTree__as__buildCloudinaryTreeV1$3e$__["buildCloudinaryTreeV1"])(resources, [
            rootPath
        ], rootPath);
    }),
    deletePicture: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        publicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ input })=>{
        const publicId = normalizePath(input.publicId);
        assertSafePath(publicId);
        assertNotInTrashStorage(publicId);
        await destroyAuthenticatedResource(publicId);
        return {
            success: true
        };
    }),
    /**
   * ✅ Renommer un fichier (ou asset) — robuste image/video/raw
   * + Sync DB: upsert ancêtres de la destination
   */ renamePicture: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fromPublicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        toPublicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const from = normalizePath(input.fromPublicId);
        const to = normalizePath(input.toPublicId);
        assertSafePath(from);
        assertSafePath(to);
        assertNotInTrashStorage(from);
        assertNotInTrashStorage(to);
        await renameAuthenticatedResource(from, to);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertFolders"])(ctx.prisma, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfPublicId"])(to), PROJECT_ROOT);
        return {
            success: true
        };
    }),
    /**
   * ✅ Créer un dossier (même vide) dans la registry DB.
   */ createFolder: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const fullPath = normalizePath(input.fullPath);
        assertSafePath(fullPath);
        assertNotInTrashStorage(fullPath);
        assertRootFolder(fullPath);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertFolders"])(ctx.prisma, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfFolderPath"])(fullPath), PROJECT_ROOT);
        return {
            success: true
        };
    }),
    /**
   * ✅ Renommer / déplacer un dossier (préfixe)
   */ renameFolderPrefix: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fromPrefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        toPrefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const fromPrefix = normalizePath(input.fromPrefix);
        const toPrefix = normalizePath(input.toPrefix);
        assertSafePath(fromPrefix);
        assertSafePath(toPrefix);
        assertNotInTrashStorage(fromPrefix);
        assertNotInTrashStorage(toPrefix);
        assertRootFolder(fromPrefix);
        assertRootFolder(toPrefix);
        if (fromPrefix === toPrefix) {
            return {
                success: true
            };
        }
        await renameFolderPrefixOnCloudinary(fromPrefix, toPrefix);
        const impacted = await ctx.prisma.cloudinaryFolder.findMany({
            where: {
                appRoot: PROJECT_ROOT,
                OR: [
                    {
                        fullPath: fromPrefix
                    },
                    {
                        fullPath: {
                            startsWith: `${fromPrefix}/`
                        }
                    }
                ]
            },
            select: {
                id: true,
                fullPath: true
            }
        });
        if (impacted.length === 0) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertFolders"])(ctx.prisma, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfFolderPath"])(toPrefix), PROJECT_ROOT);
            return {
                success: true
            };
        }
        const updates = impacted.map((folder)=>({
                id: folder.id,
                nextFullPath: folder.fullPath.replace(fromPrefix, toPrefix)
            }));
        const targetPaths = Array.from(new Set(updates.map((u)=>u.nextFullPath)));
        const collisions = await ctx.prisma.cloudinaryFolder.findMany({
            where: {
                appRoot: PROJECT_ROOT,
                fullPath: {
                    in: targetPaths
                },
                id: {
                    notIn: impacted.map((i)=>i.id)
                }
            },
            select: {
                fullPath: true
            }
        });
        if (collisions.length > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Folder rename collision: ${collisions.map((c)=>c.fullPath).join(", ")}`
            });
        }
        await ctx.prisma.$transaction(async (tx)=>{
            const ancestors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfFolderPath"])(toPrefix);
            for (const fullPath of ancestors){
                await tx.cloudinaryFolder.upsert({
                    where: {
                        appRoot_fullPath: {
                            appRoot: PROJECT_ROOT,
                            fullPath
                        }
                    },
                    create: {
                        appRoot: PROJECT_ROOT,
                        fullPath,
                        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["statusFromPath"])(fullPath)
                    },
                    update: {
                        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["statusFromPath"])(fullPath)
                    }
                });
            }
            for (const update of updates){
                await tx.cloudinaryFolder.update({
                    where: {
                        id: update.id
                    },
                    data: {
                        fullPath: update.nextFullPath,
                        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["statusFromPath"])(update.nextFullPath)
                    }
                });
            }
        });
        return {
            success: true
        };
    }),
    deleteFolder: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        prefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ input })=>{
        const normalizedPrefix = normalizePath(input.prefix);
        assertSafePath(normalizedPrefix);
        assertNotInTrashStorage(normalizedPrefix);
        assertRootFolder(normalizedPrefix);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteByPrefix"])(normalizedPrefix);
        return {
            success: true
        };
    }),
    emptyBin: adminProcedure.mutation(async ()=>{
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Deprecated. Use trash.deleteForever (or trash.emptyBin)."
        });
    }),
    deleteSelectionInBin: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
        excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
    })).mutation(async ()=>{
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Deprecated. Use trash.deleteForever (by trashIds)."
        });
    }),
    validatePictures: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        publicIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).min(1),
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        activity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        for (const oldPublicId of input.publicIds){
            const oldId = normalizePath(oldPublicId);
            assertSafePath(oldId);
            assertNotInTrashStorage(oldId);
            const filename = oldId.split("/").pop();
            if (!filename) continue;
            const newPublicId = `${PROJECT_ROOT}/${input.category}/${input.activity}/${filename}`;
            const newId = normalizePath(newPublicId);
            assertSafePath(newId);
            assertNotInTrashStorage(newId);
            await renameAuthenticatedResource(oldId, newId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertFolders"])(ctx.prisma, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfPublicId"])(newId), PROJECT_ROOT);
        }
        return {
            success: true
        };
    }),
    /**
   * ✅ Move (DnD + multi-select)
   * IMPORTANT : move -> bin est interdit ici (trash.trashToBin).
   *
   * @deprecated Use `storage.move` instead (router storage agnostique,
   *   chantier 1.5 statut B2). La nouvelle procédure prend un paramètre
   *   `provider: 'cloudinary'` et un `intent: StorageMoveIntent` agnostique
   *   (où `virtual-folder` est devenu `status-folder`). Sera supprimée
   *   après audit zéro-callsite.
   */ move: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$move$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveSchema"]).mutation(async ({ ctx, input })=>{
        logDeprecation("cloudinary.move", "storage.move");
        if (input.target.type === "virtual-folder" && input.target.status === "bin") {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Move to bin is not allowed here. Use trash.trashToBin."
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$move$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveService"])(input);
        const { source, target } = input;
        if (target.type === "virtual-folder") {
            if (source.type === "folder") {
                const fromPrefix = normalizePath(source.fullPath);
                assertSafePath(fromPrefix);
                assertNotInTrashStorage(fromPrefix);
                const toPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(fromPrefix, target.status);
                assertSafePath(toPrefix);
                assertNotInTrashStorage(toPrefix);
                await moveDbFoldersPrefix({
                    db: ctx.prisma,
                    fromPrefix,
                    toPrefix,
                    nextStatus: target.status
                });
            }
            if (source.type === "selection") {
                for (const root of source.roots){
                    const fromPrefix = normalizePath(root);
                    assertSafePath(fromPrefix);
                    assertNotInTrashStorage(fromPrefix);
                    const toPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(fromPrefix, target.status);
                    assertSafePath(toPrefix);
                    assertNotInTrashStorage(toPrefix);
                    await moveDbFoldersPrefix({
                        db: ctx.prisma,
                        fromPrefix,
                        toPrefix,
                        nextStatus: target.status
                    });
                }
            }
        }
        return {
            success: true
        };
    })
});
}),
"[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * trash.utils.ts
 *
 * Petites fonctions utilitaires centralisées pour la corbeille.
 *
 * Objectifs :
 * - Garder un format stable et testable
 * - Éviter de dupliquer des règles de normalisation / affichage
 */ /**
 * Normalise un chemin (supprime les / en début/fin).
 */ __turbopack_context__.s([
    "bigIntToSafeNumber",
    ()=>bigIntToSafeNumber,
    "buildPreviousPathShort",
    ()=>buildPreviousPathShort,
    "formatBinSuffix",
    ()=>formatBinSuffix,
    "isTrashStoragePath",
    ()=>isTrashStoragePath,
    "normalizePath",
    ()=>normalizePath,
    "suffixFileName",
    ()=>suffixFileName,
    "suffixFilePath",
    ()=>suffixFilePath,
    "suffixFolderPath",
    ()=>suffixFolderPath
]);
function normalizePath(path) {
    return path.replace(/^\/+|\/+$/g, "");
}
function buildPreviousPathShort(previousPath) {
    const p = normalizePath(previousPath);
    const parts = p.split("/").filter(Boolean);
    if (parts.length <= 2) return p;
    // Retirer appRoot si présent (1er segment)
    const withoutRoot = parts.slice(1);
    if (withoutRoot.length <= 2) return `…/${withoutRoot.join("/")}`;
    const tail = withoutRoot.slice(-2);
    return `…/${tail.join("/")}`;
}
function bigIntToSafeNumber(value) {
    if (value === null || value === undefined) return undefined;
    const max = BigInt(Number.MAX_SAFE_INTEGER);
    if (value > max) return undefined;
    return Number(value);
}
function isTrashStoragePath(appRoot, path) {
    const p = normalizePath(path);
    return p.startsWith(`${appRoot}/bin/.trash/`);
}
function formatBinSuffix(trashedAt) {
    const pad = (n)=>String(n).padStart(2, "0");
    const yyyy = trashedAt.getFullYear();
    const mm = pad(trashedAt.getMonth() + 1);
    const dd = pad(trashedAt.getDate());
    const hh = pad(trashedAt.getHours());
    const mi = pad(trashedAt.getMinutes());
    return ` (bin ${yyyy}-${mm}-${dd} ${hh}-${mi})`;
}
function splitPath(path) {
    return normalizePath(path).split("/").filter(Boolean);
}
function suffixFolderPath(path, suffix) {
    const parts = splitPath(path);
    if (parts.length === 0) return path;
    parts[parts.length - 1] = `${parts[parts.length - 1]}${suffix}`;
    return parts.join("/");
}
function suffixFileName(fileName, suffix) {
    const idx = fileName.lastIndexOf(".");
    if (idx <= 0) return `${fileName}${suffix}`;
    const base = fileName.slice(0, idx);
    const ext = fileName.slice(idx);
    return `${base}${suffix}${ext}`;
}
function suffixFilePath(path, suffix) {
    const parts = splitPath(path);
    if (parts.length === 0) return path;
    parts[parts.length - 1] = suffixFileName(parts[parts.length - 1], suffix);
    return parts.join("/");
}
}),
"[project]/packages/backend/src/modules/trash/services/listBin.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "listBin",
    ()=>listBin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
;
async function listBin(params) {
    const { prisma, input } = params;
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const where = {
        appRoot: input.appRoot,
        status: "IN_BIN"
    };
    if (input.search && input.search.trim().length > 0) {
        const q = input.search.trim();
        where.OR = [
            {
                displayName: {
                    contains: q,
                    mode: "insensitive"
                }
            },
            {
                previousPath: {
                    contains: q,
                    mode: "insensitive"
                }
            }
        ];
    }
    const rows = await prisma.trashEntry.findMany({
        where,
        orderBy: [
            {
                trashedAt: "desc"
            },
            {
                id: "desc"
            }
        ],
        take: limit + 1,
        ...input.cursor ? {
            cursor: {
                id: input.cursor
            },
            skip: 1
        } : {},
        select: {
            id: true,
            appRoot: true,
            kind: true,
            status: true,
            displayName: true,
            previousPath: true,
            storageRoot: true,
            trashedAt: true,
            sizeBytes: true,
            cloudinaryCreatedAt: true,
            mediaKind: true
        }
    });
    const hasNextPage = rows.length > limit;
    const sliced = hasNextPage ? rows.slice(0, limit) : rows;
    const items = sliced.map((r)=>({
            id: r.id,
            appRoot: r.appRoot,
            kind: r.kind === "folder" ? "folder" : "file",
            status: r.status,
            displayName: r.displayName,
            previousPath: r.previousPath,
            previousPathShort: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildPreviousPathShort"])(r.previousPath),
            trashedAt: r.trashedAt.toISOString(),
            sizeBytes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bigIntToSafeNumber"])(r.sizeBytes),
            createdAt: r.cloudinaryCreatedAt ? r.cloudinaryCreatedAt.toISOString() : undefined,
            publicId: r.kind === "file" ? r.storageRoot : undefined,
            // mediaKind: stocké en String? côté DB, narrow vers le type strict du contrat.
            // Les rows antérieures à la migration auront NULL → undefined.
            mediaKind: r.mediaKind === "image" || r.mediaKind === "video" || r.mediaKind === "document" ? r.mediaKind : undefined
        }));
    return {
        items,
        nextCursor: hasNextPage ? sliced[sliced.length - 1]?.id ?? null : null
    };
}
}),
"[project]/packages/backend/src/modules/cloudinary/utils/mediaKind.utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Traduit un `resource_type` Cloudinary en `mediaKind` applicatif.
 *
 * Cloudinary expose trois resource_type :
 *   - "image" : tous les formats raster/vectoriels traités comme images
 *   - "video" : vidéos ET pistes audio (Cloudinary les confond)
 *   - "raw"   : tout le reste (PDF, ZIP, txt, etc.)
 *
 * Notre vocabulaire applicatif `mediaKind` est volontairement plus pauvre
 * (image | video | document) parce qu'il vit côté UI/contrats, où on n'a
 * pas besoin de la distinction interne Cloudinary.
 *
 * Ce helper VIT dans la couche Cloudinary parce que la traduction est
 * provider-spécifique. Quand R2 viendra, il aura son propre helper
 * (probablement `mediaKindFromContentType` qui regardera le mime type
 * complet) et alimentera la même colonne SQL agnostique `mediaKind`.
 */ __turbopack_context__.s([
    "mediaKindFromCloudinaryResourceType",
    ()=>mediaKindFromCloudinaryResourceType
]);
function mediaKindFromCloudinaryResourceType(resourceType) {
    switch(resourceType){
        case "image":
            return "image";
        case "video":
            return "video";
        case "raw":
            return "document";
    }
}
}),
"[project]/packages/backend/src/modules/trash/services/readTrashFolder.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readTrashFolder",
    ()=>readTrashFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$mediaKind$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/mediaKind.utils.ts [app-route] (ecmascript)");
;
;
;
/**
 * Liste tous les assets sous un prefix (authenticated) pour image/video/raw.
 *
 * NOTE perf:
 * - on pagine par 500.
 * - en cas de gros dossiers, cette liste peut être lourde.
 *   On optimise plus tard si nécessaire (cache, listing par "subfolders", etc.).
 */ async function listAssetsByPrefix(prefix) {
    const resourceTypes = [
        "image",
        "video",
        "raw"
    ];
    const out = [];
    for (const resource_type of resourceTypes){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type,
                prefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                out.push({
                    publicId: asset.public_id,
                    bytes: typeof asset.bytes === "number" ? asset.bytes : undefined,
                    createdAt: asset.created_at ? String(asset.created_at) : undefined,
                    resourceType: resource_type
                });
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
    return out;
}
/**
 * À partir d'une liste d'assets sous un prefix, extrait les enfants directs:
 * - folders: premier segment relatif
 * - files  : segment unique relatif
 */ function computeDirectChildren(params) {
    const { assets, storagePrefix, virtualPrefix, meta } = params;
    const prefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(storagePrefix);
    const folders = new Map();
    const files = new Map();
    for (const a of assets){
        const publicId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(a.publicId);
        if (publicId === prefix) continue;
        if (!publicId.startsWith(`${prefix}/`)) continue;
        const relative = publicId.slice(prefix.length + 1);
        const parts = relative.split("/").filter(Boolean);
        if (parts.length === 0) continue;
        if (parts.length === 1) {
            const name = parts[0];
            if (!files.has(name)) {
                files.set(name, {
                    type: "file",
                    name,
                    fullPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(`${virtualPrefix}/${name}`),
                    publicId: a.publicId,
                    sizeBytes: a.bytes,
                    createdAt: a.createdAt,
                    mediaKind: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$mediaKind$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mediaKindFromCloudinaryResourceType"])(a.resourceType),
                    meta
                });
            }
            continue;
        }
        const folderName = parts[0];
        if (!folders.has(folderName)) {
            folders.set(folderName, {
                type: "folder",
                name: folderName,
                fullPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(`${virtualPrefix}/${folderName}`),
                children: [],
                meta
            });
        }
    }
    const folderNodes = Array.from(folders.values()).sort((a, b)=>a.name.localeCompare(b.name));
    const fileNodes = Array.from(files.values()).sort((a, b)=>a.name.localeCompare(b.name));
    return [
        ...folderNodes,
        ...fileNodes
    ];
}
async function readTrashFolder(params) {
    const { prisma, input } = params;
    const relativePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(input.relativePath ?? "");
    const entry = await prisma.trashEntry.findFirst({
        where: {
            id: input.trashId,
            appRoot: input.appRoot,
            status: "IN_BIN"
        },
        select: {
            id: true,
            kind: true,
            displayName: true,
            previousPath: true,
            trashedAt: true,
            storageRoot: true
        }
    });
    if (!entry) {
        throw new Error("TrashEntry not found (or not in bin)");
    }
    if (entry.kind !== "folder") {
        throw new Error("readTrashFolder can only open folder trash entries");
    }
    const storagePrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(relativePath ? `${entry.storageRoot}/${relativePath}` : entry.storageRoot);
    const virtualPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(relativePath ? `${input.appRoot}/bin/${entry.displayName}/${relativePath}` : `${input.appRoot}/bin/${entry.displayName}`);
    const meta = {
        kind: "trash",
        trashId: entry.id,
        previousPath: entry.previousPath,
        trashedAt: entry.trashedAt.toISOString()
    };
    const assets = await listAssetsByPrefix(storagePrefix);
    const children = computeDirectChildren({
        assets,
        storagePrefix,
        virtualPrefix,
        meta
    });
    const name = virtualPrefix.split("/").filter(Boolean).pop() ?? entry.displayName;
    const folder = {
        type: "folder",
        name,
        fullPath: virtualPrefix,
        children,
        meta
    };
    return {
        folder,
        displayPath: virtualPrefix
    };
}
}),
"[project]/packages/backend/src/modules/trash/services/trashToBin.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "trashToBin",
    ()=>trashToBin
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$mediaKind$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/mediaKind.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function lastSegment(path) {
    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(path);
    const parts = p.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? p;
}
function assertNotStatusOrRoot(appRoot, fullPath) {
    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(fullPath);
    if (p === appRoot) {
        throw new Error("Cannot trash the app root");
    }
    const forbidden = [
        `${appRoot}/pending`,
        `${appRoot}/published`,
        `${appRoot}/bin`
    ];
    if (forbidden.includes(p)) {
        throw new Error("Cannot trash a status folder root");
    }
    if (p.startsWith(`${appRoot}/bin/.trash/`)) {
        throw new Error("Cannot trash an item already in trash storage");
    }
}
async function listAssetsByPrefix(prefix) {
    const out = [];
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: rt,
                prefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                out.push({
                    public_id: asset.public_id,
                    resource_type: rt,
                    bytes: typeof asset.bytes === "number" ? asset.bytes : undefined,
                    created_at: asset.created_at ? String(asset.created_at) : undefined
                });
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
    return out;
}
async function renameAsset(from, to, resourceType) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, {
        type: "authenticated",
        resource_type: resourceType,
        overwrite: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
}
async function moveFolderRecursively(sourcePrefix, targetPrefix) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: rt,
                prefix: sourcePrefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                const newPublicId = String(asset.public_id).replace(sourcePrefix, targetPrefix);
                await renameAsset(String(asset.public_id), newPublicId, rt);
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
}
async function detectKind(params) {
    const { prisma, appRoot, fullPath } = params;
    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(fullPath);
    // 1) Si on a un registre folder DB, c'est un folder.
    const folder = await prisma.cloudinaryFolder.findFirst({
        where: {
            appRoot,
            fullPath: p
        },
        select: {
            id: true
        }
    });
    if (folder) return "folder";
    // 2) Si Cloudinary connaît la ressource exacte => file.
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(p);
        return "file";
    } catch  {
    // continue
    }
    // 3) Si on a au moins un asset sous prefix => folder.
    const assets = await listAssetsByPrefix(`${p}/`);
    if (assets.length > 0) return "folder";
    throw new Error(`Unable to detect kind (file/folder) for: ${p}`);
}
function computeAggregateFromAssets(assets) {
    let total = 0;
    let hasBytes = false;
    let maxCreated = null;
    for (const a of assets){
        if (typeof a.bytes === "number") {
            total += a.bytes;
            hasBytes = true;
        }
        if (a.created_at) {
            const d = new Date(a.created_at);
            if (!Number.isNaN(d.valueOf())) {
                if (!maxCreated || d > maxCreated) maxCreated = d;
            }
        }
    }
    return {
        sizeBytes: hasBytes ? BigInt(total) : undefined,
        cloudinaryCreatedAt: maxCreated ?? undefined
    };
}
async function normalizeSources(params) {
    const { prisma, input } = params;
    const out = [];
    const seen = new Set();
    for (const s of input.sources){
        if (s.kind === "selection") {
            for (const root of s.roots){
                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(root);
                if (seen.has(p)) continue;
                seen.add(p);
                // On détecte le kind pour être robuste.
                const kind = await detectKind({
                    prisma,
                    appRoot: input.appRoot,
                    fullPath: p
                });
                out.push({
                    kind,
                    fullPath: p
                });
            }
            continue;
        }
        const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(s.fullPath);
        if (seen.has(p)) continue;
        seen.add(p);
        out.push({
            kind: s.kind,
            fullPath: p
        });
    }
    return out;
}
async function trashToBin(params) {
    const { prisma, input } = params;
    const appRoot = input.appRoot;
    // Normalise la liste et déduplique.
    const sources = await normalizeSources({
        prisma,
        input
    });
    const results = [];
    for (const source of sources){
        assertNotStatusOrRoot(appRoot, source.fullPath);
        // Interdit d'envoyer un contenu déjà dans bin/trash.
        const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(source.fullPath);
        if (normalized.startsWith(`${appRoot}/bin/`)) {
            throw new Error("Cannot trash an item already under appRoot/bin");
        }
        const displayName = lastSegment(normalized);
        const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        // NOTE : même pour un file, on stocke sous `.trash/<id>/<displayName>`
        // (bin navigable caché, collisions impossibles)
        const storageRoot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(`${appRoot}/bin/.trash/${id}/${displayName}`);
        // 1) Calcul des agrégats (sizeBytes + createdAt) et du mediaKind
        let sizeBytes;
        let cloudinaryCreatedAt;
        let mediaKind;
        if (source.kind === "file") {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(normalized);
            sizeBytes = typeof info.bytes === "number" ? BigInt(info.bytes) : undefined;
            cloudinaryCreatedAt = info.created_at ? new Date(info.created_at) : undefined;
            // mediaKind: dérivé du resource_type Cloudinary (image|video|raw → image|video|document)
            mediaKind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$mediaKind$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mediaKindFromCloudinaryResourceType"])(info.resource_type);
        } else {
            // ✅ trailing slash pour éviter les collisions de prefix (ex: cours1 vs cours10)
            const assets = await listAssetsByPrefix(`${normalized}/`);
            const agg = computeAggregateFromAssets(assets);
            sizeBytes = agg.sizeBytes;
            cloudinaryCreatedAt = agg.cloudinaryCreatedAt;
        // mediaKind reste undefined pour un folder (pas de type unique applicable)
        }
        // 2) Création TrashEntry (avant move) : on "réserve" l'id et on garde la provenance.
        await prisma.trashEntry.create({
            data: {
                id,
                appRoot,
                kind: source.kind,
                status: "IN_BIN",
                displayName,
                previousPath: normalized,
                storageRoot,
                trashedAt: new Date(),
                sizeBytes,
                cloudinaryCreatedAt,
                mediaKind
            }
        });
        // 3) Déplacement Cloudinary vers storageRoot
        if (source.kind === "file") {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(normalized);
            await renameAsset(normalized, storageRoot, info.resource_type);
        } else {
            // ✅ trailing slash pour éviter les collisions de prefix
            await moveFolderRecursively(`${normalized}/`, `${storageRoot}/`);
            // 4) Nettoyage registry DB des dossiers :
            //    Si tu jettes un dossier, il ne doit plus exister "à l'ancien endroit".
            //    Donc on supprime les CloudinaryFolder dont le fullPath est dans ce sous-arbre.
            await prisma.cloudinaryFolder.deleteMany({
                where: {
                    appRoot,
                    fullPath: {
                        startsWith: normalized
                    }
                }
            });
        }
        results.push({
            id,
            appRoot,
            kind: source.kind,
            status: "IN_BIN",
            displayName,
            previousPath: normalized,
            previousPathShort: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildPreviousPathShort"])(normalized),
            trashedAt: new Date().toISOString(),
            sizeBytes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bigIntToSafeNumber"])(sizeBytes),
            createdAt: cloudinaryCreatedAt ? cloudinaryCreatedAt.toISOString() : undefined,
            mediaKind
        });
    }
    return {
        trashed: results,
        message: `${results.length} item(s) moved to bin`
    };
}
}),
"[project]/packages/backend/src/modules/trash/services/restoreFromBin.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "restoreFromBin",
    ()=>restoreFromBin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
;
;
;
;
async function hasAnyResourceWithPrefix(prefix) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: rt,
                prefix,
                max_results: 1
            });
            if ((res.resources ?? []).length > 0) return true;
        } catch  {
        // ignore (treat as none)
        }
    }
    return false;
}
function statusFromPath(path) {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(path).split("/").filter(Boolean);
    const status = parts[1];
    if (status === "pending" || status === "published" || status === "bin") return status;
    return "pending";
}
function folderAncestorsOfFolderPath(folderPath) {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(folderPath).split("/").filter(Boolean);
    const out = [];
    for(let i = 1; i <= parts.length; i++){
        out.push(parts.slice(0, i).join("/"));
    }
    return out;
}
function folderAncestorsOfPublicId(publicId) {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(publicId).split("/").filter(Boolean);
    if (parts.length < 2) return [];
    // remove last segment (file name)
    const folders = parts.slice(0, -1);
    const out = [];
    for(let i = 1; i <= folders.length; i++){
        out.push(folders.slice(0, i).join("/"));
    }
    return out;
}
async function upsertFolders(prisma, appRoot, paths) {
    const unique = Array.from(new Set(paths.map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"]))).filter(Boolean);
    if (!unique.length) return;
    await prisma.$transaction(unique.map((fullPath)=>prisma.cloudinaryFolder.upsert({
            where: {
                appRoot_fullPath: {
                    appRoot,
                    fullPath
                }
            },
            create: {
                appRoot,
                fullPath,
                status: statusFromPath(fullPath)
            },
            update: {
                status: statusFromPath(fullPath)
            }
        })));
}
async function renameAsset(fromPublicId, toPublicId, resourceType) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(fromPublicId, toPublicId, {
        type: "authenticated",
        resource_type: resourceType,
        overwrite: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
}
async function moveFolderRecursively(sourcePrefix, targetPrefix) {
    for (const rt of [
        "image",
        "video",
        "raw"
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: rt,
                prefix: sourcePrefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                const from = String(asset.public_id);
                const to = from.replace(sourcePrefix, targetPrefix);
                await renameAsset(from, to, rt);
            }
            nextCursor = res.next_cursor;
        }while (nextCursor)
    }
}
async function pathCollides(params) {
    const { prisma, appRoot, kind, targetPath } = params;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(targetPath);
    // Collision DB (folder placeholder)
    if (kind === "folder") {
        const folder = await prisma.cloudinaryFolder.findFirst({
            where: {
                appRoot,
                fullPath: t
            },
            select: {
                id: true
            }
        });
        if (folder) return true;
    }
    // Collision Cloudinary
    if (kind === "file") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fileExists"])(t);
    }
    // Folder => collision si au moins un asset existe sous prefix `${t}/`
    return hasAnyResourceWithPrefix(`${t}/`);
}
function addCounterToFolderPath(path, counter) {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(path).split("/").filter(Boolean);
    if (!parts.length) return path;
    parts[parts.length - 1] = `${parts[parts.length - 1]} (${counter})`;
    return parts.join("/");
}
function addCounterToFilePath(path, counter) {
    const parts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(path).split("/").filter(Boolean);
    if (!parts.length) return path;
    const fileName = parts[parts.length - 1];
    parts[parts.length - 1] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["suffixFileName"])(fileName, ` (${counter})`);
    return parts.join("/");
}
async function computeRestoredToPath(params) {
    const { prisma, appRoot, kind, previousPath, trashedAt } = params;
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(previousPath);
    const collides = await pathCollides({
        prisma,
        appRoot,
        kind,
        targetPath: base
    });
    if (!collides) return {
        restoredToPath: base,
        wasCollision: false
    };
    const suffix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatBinSuffix"])(trashedAt);
    let candidate = kind === "folder" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["suffixFolderPath"])(base, suffix) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["suffixFilePath"])(base, suffix);
    // Collision persistante (rare) => compteur
    let i = 2;
    while(await pathCollides({
        prisma,
        appRoot,
        kind,
        targetPath: candidate
    })){
        candidate = kind === "folder" ? addCounterToFolderPath(candidate, i) : addCounterToFilePath(candidate, i);
        i++;
    }
    return {
        restoredToPath: candidate,
        wasCollision: true
    };
}
async function restoreFromBin(params) {
    const { prisma, input } = params;
    const appRoot = input.appRoot;
    const entries = await prisma.trashEntry.findMany({
        where: {
            appRoot,
            id: {
                in: input.ids
            },
            status: "IN_BIN"
        },
        select: {
            id: true,
            kind: true,
            displayName: true,
            previousPath: true,
            storageRoot: true,
            trashedAt: true
        }
    });
    if (entries.length !== input.ids.length) {
        const found = new Set(entries.map((e)=>e.id));
        const missing = input.ids.filter((id)=>!found.has(id));
        throw new Error(`restoreFromBin: missing TrashEntry ids: ${missing.join(", ")}`);
    }
    const restored = [];
    for (const entry of entries){
        const kind = entry.kind === "folder" ? "folder" : "file";
        // Sécurité absolue
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrashStoragePath"])(appRoot, entry.storageRoot)) {
            throw new Error(`Refusing restore: storageRoot is not trash storage: ${entry.storageRoot}`);
        }
        const { restoredToPath, wasCollision } = await computeRestoredToPath({
            prisma,
            appRoot,
            kind,
            previousPath: entry.previousPath,
            trashedAt: entry.trashedAt
        });
        // Parents DB (registry)
        if (kind === "folder") {
            await upsertFolders(prisma, appRoot, folderAncestorsOfFolderPath(restoredToPath));
        } else {
            await upsertFolders(prisma, appRoot, folderAncestorsOfPublicId(restoredToPath));
        }
        // Move Cloudinary
        if (kind === "file") {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(entry.storageRoot);
            await renameAsset(entry.storageRoot, restoredToPath, info.resource_type);
        } else {
            // IMPORTANT: trailing slash pour éviter collisions cours1 vs cours10
            await moveFolderRecursively(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(entry.storageRoot)}/`, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(restoredToPath)}/`);
        }
        await prisma.trashEntry.update({
            where: {
                id: entry.id
            },
            data: {
                status: "RESTORED",
                restoredAt: new Date(),
                restoredToPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(restoredToPath)
            }
        });
        restored.push({
            id: entry.id,
            kind,
            displayName: entry.displayName,
            previousPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(entry.previousPath),
            restoredToPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(restoredToPath),
            wasCollision,
            trashedAt: entry.trashedAt.toISOString(),
            renameReason: wasCollision ? "COLLISION" : undefined
        });
    }
    return {
        restored
    };
}
}),
"[project]/packages/backend/src/modules/trash/services/deleteForever.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteForever",
    ()=>deleteForever
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.8.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
;
;
async function deleteForever(params) {
    const { prisma, input } = params;
    const appRoot = input.appRoot;
    const entries = await prisma.trashEntry.findMany({
        where: {
            appRoot,
            id: {
                in: input.ids
            },
            status: "IN_BIN"
        },
        select: {
            id: true,
            kind: true,
            storageRoot: true
        }
    });
    if (entries.length !== input.ids.length) {
        const found = new Set(entries.map((e)=>e.id));
        const missing = input.ids.filter((id)=>!found.has(id));
        throw new Error(`deleteForever: missing TrashEntry ids: ${missing.join(", ")}`);
    }
    for (const entry of entries){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrashStoragePath"])(appRoot, entry.storageRoot)) {
            throw new Error(`Refusing deleteForever: storageRoot is not trash storage: ${entry.storageRoot}`);
        }
        if (entry.kind === "file") {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(entry.storageRoot);
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$8$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(entry.storageRoot, {
                type: "authenticated",
                resource_type: info.resource_type
            });
        } else {
            // Folder: supprime tout sous `${storageRoot}/`
            // (les assets n'existent pas comme dossiers réels)
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteByPrefix"])(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(entry.storageRoot)}/`);
        }
        await prisma.trashEntry.update({
            where: {
                id: entry.id
            },
            data: {
                status: "DELETED",
                deletedAt: new Date()
            }
        });
    }
    // 🔁 Une seule invalidation en fin de batch : on peut supprimer plusieurs
    // entries en série, inutile de purger le cache à chaque iteration. Note
    // que `deleteByPrefix` invalide déjà de son côté pour le cas folder ;
    // ici on couvre aussi le cas file (cloudinary.uploader.destroy direct).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
    return {
        deletedIds: entries.map((e)=>e.id)
    };
}
}),
"[project]/packages/backend/src/modules/trash/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "trashRouter",
    ()=>trashRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$listBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/listBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$readTrashFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/readTrashFolder.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$trashToBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/trashToBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$restoreFromBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/restoreFromBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$deleteForever$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/deleteForever.service.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
/**
 * trash.router.ts
 *
 * Router tRPC dédié à la corbeille.
 *
 * IMPORTANT (design validé) :
 * - Bin = lecture + restore + delete définitif
 * - Le stockage Cloudinary réel est caché : `${appRoot}/bin/.trash/<uuid>/...`
 * - L'utilisateur ne voit jamais `.trash/<uuid>`
 */ const adminProcedure = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]);
const listBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    cursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).nullable().optional(),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(100).optional(),
    search: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional()
});
const readTrashFolderInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    trashId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    relativePath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const trashToBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    sources: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("folder"),
            fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("file"),
            fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("selection"),
            roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
        })
    ])).min(1)
});
const restoreFromBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    ids: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
});
const deleteForeverInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    ids: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
});
const trashRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    listBin: adminProcedure.input(listBinInputSchema).query(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$listBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listBin"])({
            prisma: ctx.prisma,
            input
        });
    }),
    readTrashFolder: adminProcedure.input(readTrashFolderInputSchema).query(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$readTrashFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readTrashFolder"])({
            prisma: ctx.prisma,
            input
        });
    }),
    trashToBin: adminProcedure.input(trashToBinInputSchema).mutation(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$trashToBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trashToBin"])({
            prisma: ctx.prisma,
            input
        });
    }),
    restoreFromBin: adminProcedure.input(restoreFromBinInputSchema).mutation(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$restoreFromBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["restoreFromBin"])({
            prisma: ctx.prisma,
            input
        });
    }),
    deleteForever: adminProcedure.input(deleteForeverInputSchema).mutation(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$deleteForever$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteForever"])({
            prisma: ctx.prisma,
            input
        });
    })
});
}),
"[project]/packages/backend/src/modules/permissions/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "permissionRouter",
    ()=>permissionRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
const permissionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).query(async ({ ctx })=>{
        return ctx.prisma.permission.findMany({
            relationLoadStrategy: "join",
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: {
                id: "asc"
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const permission = await ctx.prisma.permission.findUnique({
            where: {
                id: input.id
            }
        });
        if (!permission) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Permission not found"
            });
        }
        return permission;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.permission.findUnique({
            where: {
                name: input.name
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Permission already exists"
            });
        }
        return ctx.prisma.permission.create({
            data: {
                name: input.name
            }
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.permission.findUnique({
            where: {
                name: input.name
            },
            select: {
                id: true
            }
        });
        if (exists && exists.id !== input.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Another permission with that name already exists."
            });
        }
        return ctx.prisma.permission.update({
            where: {
                id: input.id
            },
            data: {
                name: input.name
            }
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        const linked = await ctx.prisma.rolePermissions.count({
            where: {
                permissionId: input.id
            }
        });
        if (linked > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Cannot delete a permission that is assigned to roles."
            });
        }
        return ctx.prisma.permission.delete({
            where: {
                id: input.id
            }
        });
    }),
    assignToRole: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        permissionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        await ctx.prisma.rolePermissions.upsert({
            where: {
                roleId_permissionId: {
                    roleId: input.roleId,
                    permissionId: input.permissionId
                }
            },
            update: {},
            create: {
                roleId: input.roleId,
                permissionId: input.permissionId
            }
        });
        return {
            success: true
        };
    }),
    removeFromRole: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        permissionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        await ctx.prisma.rolePermissions.deleteMany({
            where: {
                roleId: input.roleId,
                permissionId: input.permissionId
            }
        });
        return {
            success: true
        };
    })
});
const __TURBOPACK__default__export__ = permissionRouter;
}),
"[project]/packages/backend/src/modules/categories/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "categoryRouter",
    ()=>categoryRouter,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
;
const categoryRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.category.findMany({
            orderBy: {
                id: "asc"
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const category = await ctx.prisma.category.findUnique({
            where: {
                id: input.id
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Category not found"
            });
        }
        return category;
    }),
    getByType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        const category = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Category not found"
            });
        }
        return category;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "This category already exists."
            });
        }
        return ctx.prisma.category.create({
            data: {
                type: input.type
            }
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (exists && exists.id !== input.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Another category with this type already exists."
            });
        }
        return ctx.prisma.category.update({
            where: {
                id: input.id
            },
            data: {
                type: input.type
            }
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.category.delete({
            where: {
                id: input.id
            }
        });
    })
});
const __TURBOPACK__default__export__ = categoryRouter;
}),
"[project]/packages/backend/src/modules/courses/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "courseRouter",
    ()=>courseRouter,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * courses/router.ts
 *
 * CRUD Course — une occurrence hebdomadaire d'une Discipline dans la catégorie
 * "Cours". Chaque ligne DB = un créneau (discipline, jour, heure, public) unique.
 *
 * Unicité naturelle : `(disciplineId, day, beginTime, audience)`. Deux cours
 * "Tchoy-Lee-Fut adultes" aux mêmes jour/heure ne peuvent pas coexister, mais
 * "Tchoy-Lee-Fut adultes mercredi 18h" et "Tchoy-Lee-Fut teenagers mercredi 18h"
 * sont deux cours légitimes.
 *
 * Champ `instructorId` optionnel : si null, le coach à afficher est
 * `discipline.instructor` (hérité). Permet de couvrir le cas des
 * remplacements ponctuels ou des co-enseignements.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les cours alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_courses"))`.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const dayEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
]);
const audienceEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "KIDS",
    "TEENAGERS",
    "ADULTS",
    "ALL_AGES"
]);
/**
 * `beginTime` / `endTime` sont des entiers : minutes depuis minuit.
 * - 0 = 00:00, 1439 = 23:59, 1440 = 24:00 (borne sup exclusive pour begin,
 *   inclusive pour end pour couvrir un cours qui finit à minuit pile).
 */ const beginTimeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(1439);
const endTimeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(1440);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    audience: audienceEnum,
    day: dayEnum,
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).nullable().optional(),
    requisites: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)).default([]),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].json()
}).refine((data)=>data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    audience: audienceEnum.optional(),
    day: dayEnum.optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).nullable().optional(),
    requisites: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)).optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].json().optional()
}).refine((data)=>data.beginTime === undefined || data.endTime === undefined || data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const courseRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste tous les cours, triés par discipline puis jour puis heure.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.course.findMany({
            orderBy: [
                {
                    disciplineId: "asc"
                },
                {
                    day: "asc"
                },
                {
                    beginTime: "asc"
                }
            ]
        });
    }),
    /**
   * Liste les cours d'une discipline donnée.
   * Usage typique : page "Cours de Tchoy-Lee-Fut" sur le site public.
   */ getAllByDiscipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.course.findMany({
            where: {
                disciplineId: input.disciplineId
            },
            orderBy: [
                {
                    day: "asc"
                },
                {
                    beginTime: "asc"
                }
            ]
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const course = await ctx.prisma.course.findUnique({
            where: {
                id: input.id
            }
        });
        if (!course) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Course not found."
            });
        }
        return course;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(createInput).mutation(async ({ ctx, input })=>{
        // Vérifie que la discipline existe ET qu'elle appartient à la catégorie "Cours".
        const discipline = await ctx.prisma.discipline.findUnique({
            where: {
                id: input.disciplineId
            },
            select: {
                id: true,
                category: {
                    select: {
                        type: true
                    }
                }
            }
        });
        if (!discipline) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline not found (id=${input.disciplineId}).`
            });
        }
        if (discipline.category.type !== "Cours") {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline ${input.disciplineId} is not in the "Cours" category.`
            });
        }
        // Si un instructeur est spécifié, on vérifie qu'il existe.
        if (input.instructorId) {
            const instructor = await ctx.prisma.user.findUnique({
                where: {
                    id: input.instructorId
                },
                select: {
                    id: true
                }
            });
            if (!instructor) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${input.instructorId}).`
                });
            }
        }
        try {
            return await ctx.prisma.course.create({
                data: {
                    disciplineId: input.disciplineId,
                    audience: input.audience,
                    day: input.day,
                    beginTime: input.beginTime,
                    endTime: input.endTime,
                    instructorId: input.instructorId ?? null,
                    requisites: input.requisites,
                    content: input.content === null ? __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].JsonNull : input.content
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "A course already exists at this discipline/day/beginTime/audience."
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        // Si on change l'instructeur, on vérifie qu'il existe.
        if (rest.instructorId !== undefined && rest.instructorId !== null) {
            const instructor = await ctx.prisma.user.findUnique({
                where: {
                    id: rest.instructorId
                },
                select: {
                    id: true
                }
            });
            if (!instructor) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${rest.instructorId}).`
                });
            }
        }
        try {
            return await ctx.prisma.course.update({
                where: {
                    id
                },
                data: {
                    ...rest,
                    content: rest.content === undefined ? undefined : rest.content === null ? __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].JsonNull : rest.content
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A course already exists at this discipline/day/beginTime/audience."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Course not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.course.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Course not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = courseRouter;
}),
"[project]/packages/backend/src/modules/disciplines/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "disciplineRouter",
    ()=>disciplineRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
;
;
/**
 * discipline/router.ts
 *
 * CRUD Discipline (modèle 2-niveaux : Category → Discipline).
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les disciplines alimentent potentiellement
 *                  le site public, au même titre que les catégories).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *                  La permission est à ajouter au seed.
 *
 * Règles métier :
 *   - `categoryId` N'EST PAS modifiable via `update`. Déplacer une discipline
 *     de catégorie briserait la cohérence des chemins Cloudinary existants
 *     (qui encodent `category.type` slugifié dans leurs segments).
 *   - `delete` est un hard delete : avant de supprimer, on vérifie qu'aucune
 *     dépendance ne subsiste (Course, Stage, MediaAsset). Si oui, CONFLICT.
 *   - L'unicité `(categoryId, name)` est portée par le schéma Prisma ; une
 *     violation renvoie une erreur CONFLICT explicite.
 */ const disciplineTypeEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "MARTIAL_ART",
    "CALLIGRAPHY"
]);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    type: disciplineTypeEnum,
    family: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    school: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    classification: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    origin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional(),
    categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    type: disciplineTypeEnum.optional(),
    family: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    school: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    classification: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    origin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).optional()
});
const disciplineRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les disciplines d'une catégorie donnée.
   * Usage typique : formulaire d'upload (sélecteur de discipline après choix
   * de catégorie).
   */ getAllByCategory: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.discipline.findMany({
            where: {
                categoryId: input.categoryId
            },
            orderBy: {
                name: "asc"
            }
        });
    }),
    /**
   * Liste toutes les disciplines toutes catégories confondues.
   * Utile pour les vues d'administration synthétiques.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.discipline.findMany({
            orderBy: [
                {
                    categoryId: "asc"
                },
                {
                    name: "asc"
                }
            ]
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const discipline = await ctx.prisma.discipline.findUnique({
            where: {
                id: input.id
            }
        });
        if (!discipline) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Discipline not found."
            });
        }
        return discipline;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(createInput).mutation(async ({ ctx, input })=>{
        // Vérifie que la catégorie existe (la FK le ferait, mais le message est plus clair ici).
        const category = await ctx.prisma.category.findUnique({
            where: {
                id: input.categoryId
            },
            select: {
                id: true
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Category not found (id=${input.categoryId}).`
            });
        }
        // Vérifie que l'instructeur existe.
        const instructor = await ctx.prisma.user.findUnique({
            where: {
                id: input.instructorId
            },
            select: {
                id: true
            }
        });
        if (!instructor) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Instructor not found (id=${input.instructorId}).`
            });
        }
        try {
            return await ctx.prisma.discipline.create({
                data: {
                    name: input.name,
                    type: input.type,
                    family: input.family ?? null,
                    school: input.school ?? null,
                    classification: input.classification ?? null,
                    origin: input.origin ?? null,
                    description: input.description ?? null,
                    categoryId: input.categoryId,
                    instructorId: input.instructorId
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "A discipline with this name already exists in this category."
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        // Si on change l'instructeur, on vérifie qu'il existe.
        if (rest.instructorId !== undefined) {
            const instructor = await ctx.prisma.user.findUnique({
                where: {
                    id: rest.instructorId
                },
                select: {
                    id: true
                }
            });
            if (!instructor) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${rest.instructorId}).`
                });
            }
        }
        try {
            return await ctx.prisma.discipline.update({
                where: {
                    id
                },
                data: rest
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A discipline with this name already exists in this category."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Discipline not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Pré-vérification des dépendances — on refuse plutôt que de cascader.
        const [courseCount, stageCount, mediaAssetCount] = await Promise.all([
            ctx.prisma.course.count({
                where: {
                    disciplineId: input.id
                }
            }),
            ctx.prisma.stage.count({
                where: {
                    disciplineId: input.id
                }
            }),
            ctx.prisma.mediaAsset.count({
                where: {
                    disciplineId: input.id
                }
            })
        ]);
        const deps = [];
        if (courseCount > 0) deps.push(`${courseCount} course(s)`);
        if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
        if (mediaAssetCount > 0) deps.push(`${mediaAssetCount} media asset(s)`);
        if (deps.length > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Cannot delete discipline: ${deps.join(", ")} still reference it. Migrate or delete them first.`
            });
        }
        try {
            return await ctx.prisma.discipline.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Discipline not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = disciplineRouter;
}),
"[project]/packages/backend/src/modules/stages/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "stageRouter",
    ()=>stageRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * stages/router.ts
 *
 * CRUD Stage — un événement ponctuel rattaché à une Discipline de catégorie
 * "Stage". Un Stage n'a pas de date/heure directes : ses dates concrètes
 * sont portées par `StageSession` (cf. router `stageSession`).
 *
 * Unicité : `(disciplineId, label)` — deux stages d'une même discipline ne
 * peuvent pas porter le même label, mais le même label peut être réutilisé
 * pour d'autres disciplines.
 *
 * Animateurs (ambiguïté 1-β validée) : `primaryAnimator` FAIT PARTIE de
 * `animators`. L'API expose deux champs distincts au create/update :
 *   - `primaryAnimatorId` : obligatoire, animateur principal
 *   - `coAnimatorIds[]`   : optionnel, les autres animateurs
 * Le serveur compose la liste complète `animators` = `[primary, ...co]`.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les stages alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_stages"))`.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const audienceEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "KIDS",
    "TEENAGERS",
    "ADULTS",
    "ALL_AGES"
]);
/**
 * Helpers hérités de l'ancien router — Prisma.Json ne tolère pas `null`/
 * `undefined` en champ NON NULL. On force le type d'input en
 * `Prisma.InputJsonValue` via un refine + transform.
 */ const prismaJsonNonNull = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().refine((v)=>v !== null && v !== undefined, {
    message: "JSON value cannot be null or undefined"
}).transform((v)=>v);
const prismaJsonOptionalWithFallback = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional().transform((v)=>v ?? {});
const userIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1);
/**
 * `coAnimatorIds` doit :
 *   - ne pas contenir de doublons
 *   - ne pas contenir le `primaryAnimatorId` (déjà principal, pas co)
 * Ces deux règles sont appliquées au niveau de l'objet parent via `.refine`.
 */ const coAnimatorIdsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).default([]);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    audience: audienceEnum,
    description: prismaJsonOptionalWithFallback,
    program: prismaJsonNonNull,
    preRegistered: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).default([]),
    primaryAnimatorId: userIdSchema,
    coAnimatorIds: coAnimatorIdsSchema
}).refine((data)=>!data.coAnimatorIds.includes(data.primaryAnimatorId), {
    message: "coAnimatorIds must not include primaryAnimatorId.",
    path: [
        "coAnimatorIds"
    ]
}).refine((data)=>new Set(data.coAnimatorIds).size === data.coAnimatorIds.length, {
    message: "coAnimatorIds must not contain duplicates.",
    path: [
        "coAnimatorIds"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    audience: audienceEnum.optional(),
    description: prismaJsonOptionalWithFallback,
    program: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional().transform((v)=>v === undefined ? undefined : v),
    preRegistered: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).optional(),
    primaryAnimatorId: userIdSchema.optional(),
    coAnimatorIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).optional()
}).refine((data)=>{
    // Si les deux champs sont fournis, on revalide la cohérence.
    if (data.primaryAnimatorId !== undefined && data.coAnimatorIds !== undefined) {
        return !data.coAnimatorIds.includes(data.primaryAnimatorId);
    }
    return true;
}, {
    message: "coAnimatorIds must not include primaryAnimatorId.",
    path: [
        "coAnimatorIds"
    ]
}).refine((data)=>data.coAnimatorIds === undefined || new Set(data.coAnimatorIds).size === data.coAnimatorIds.length, {
    message: "coAnimatorIds must not contain duplicates.",
    path: [
        "coAnimatorIds"
    ]
});
/* -------------------------------------------------------------------------- */ /*                             INTERNAL HELPERS                               */ /* -------------------------------------------------------------------------- */ async function assertUsersExist(prisma, userIds) {
    if (userIds.length === 0) return;
    const found = await prisma.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true
        }
    });
    const foundIds = new Set(found.map((u)=>u.id));
    const missing = userIds.filter((id)=>!foundIds.has(id));
    if (missing.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `User(s) not found: ${missing.join(", ")}`
        });
    }
}
const stageRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste tous les stages, triés par discipline puis label.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.stage.findMany({
            orderBy: [
                {
                    disciplineId: "asc"
                },
                {
                    label: "asc"
                }
            ]
        });
    }),
    /**
   * Liste les stages d'une discipline donnée.
   */ getAllByDiscipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.stage.findMany({
            where: {
                disciplineId: input.disciplineId
            },
            orderBy: {
                label: "asc"
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const stage = await ctx.prisma.stage.findUnique({
            where: {
                id: input.id
            },
            relationLoadStrategy: "join",
            include: {
                animators: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                sessions: {
                    orderBy: {
                        date: "asc"
                    }
                }
            }
        });
        if (!stage) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Stage not found."
            });
        }
        return stage;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(createInput).mutation(async ({ ctx, input })=>{
        // Vérifie que la discipline existe ET qu'elle appartient à la catégorie "Stage".
        const discipline = await ctx.prisma.discipline.findUnique({
            where: {
                id: input.disciplineId
            },
            select: {
                id: true,
                category: {
                    select: {
                        type: true
                    }
                }
            }
        });
        if (!discipline) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline not found (id=${input.disciplineId}).`
            });
        }
        if (discipline.category.type !== "Stage") {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline ${input.disciplineId} is not in the "Stage" category.`
            });
        }
        // Vérifie que tous les animateurs (primary + co) existent.
        const allAnimatorIds = [
            input.primaryAnimatorId,
            ...input.coAnimatorIds
        ];
        await assertUsersExist(ctx.prisma, allAnimatorIds);
        try {
            return await ctx.prisma.stage.create({
                data: {
                    disciplineId: input.disciplineId,
                    label: input.label,
                    audience: input.audience,
                    description: input.description,
                    program: input.program,
                    preRegistered: input.preRegistered,
                    primaryAnimatorId: input.primaryAnimatorId,
                    // `animators` inclut le primaryAnimator (β)
                    animators: {
                        connect: allAnimatorIds.map((id)=>({
                                id
                            }))
                    }
                },
                relationLoadStrategy: "join",
                include: {
                    animators: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "A stage with this label already exists for this discipline."
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, coAnimatorIds, primaryAnimatorId, program, ...rest } = input;
        // Si l'un des deux champs liés aux animateurs change, on doit
        // recalculer la liste complète. Sinon, on ne touche pas à la relation.
        const animatorsChanged = primaryAnimatorId !== undefined || coAnimatorIds !== undefined;
        let finalAnimatorIds = null;
        if (animatorsChanged) {
            const existing = await ctx.prisma.stage.findUnique({
                where: {
                    id
                },
                select: {
                    primaryAnimatorId: true,
                    animators: {
                        select: {
                            id: true
                        }
                    }
                }
            });
            if (!existing) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Stage not found."
                });
            }
            const newPrimary = primaryAnimatorId ?? existing.primaryAnimatorId;
            const existingCoIds = existing.animators.map((a)=>a.id).filter((aid)=>aid !== existing.primaryAnimatorId);
            const newCo = coAnimatorIds ?? existingCoIds;
            if (newCo.includes(newPrimary)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "coAnimatorIds must not include the (new) primaryAnimatorId."
                });
            }
            finalAnimatorIds = [
                newPrimary,
                ...newCo
            ];
            await assertUsersExist(ctx.prisma, finalAnimatorIds);
        }
        try {
            return await ctx.prisma.stage.update({
                where: {
                    id
                },
                data: {
                    ...rest,
                    ...primaryAnimatorId !== undefined ? {
                        primaryAnimatorId
                    } : {},
                    ...program !== undefined ? {
                        program
                    } : {},
                    ...finalAnimatorIds ? {
                        animators: {
                            set: finalAnimatorIds.map((aid)=>({
                                    id: aid
                                }))
                        }
                    } : {}
                },
                relationLoadStrategy: "join",
                include: {
                    animators: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A stage with this label already exists for this discipline."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Stage not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Les StageSession liées seront supprimées en cascade (onDelete: Cascade).
        // Rien à pré-vérifier côté DB.
        try {
            return await ctx.prisma.stage.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Stage not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = stageRouter;
}),
"[project]/packages/backend/src/modules/stageSessions/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "stageSessionRouter",
    ()=>stageSessionRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * stageSessions/router.ts
 *
 * CRUD StageSession — une session concrète d'un Stage (un jour, des horaires,
 * éventuellement un lieu). Un Stage peut avoir plusieurs sessions si son
 * programme s'étale sur plusieurs journées.
 *
 * Unicité : `(stageId, date, beginTime)`. Deux sessions du même stage à
 * la même date et la même heure ne sont pas autorisées.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les sessions d'un stage public doivent
 *                  être visibles pour que le site public puisse les afficher).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_stages"))`.
 *                  On réutilise la permission du domaine Stage — une session
 *                  n'est rien sans son stage parent.
 *
 * Note cascade : la suppression d'un Stage efface toutes ses sessions
 * automatiquement (onDelete: Cascade défini dans le schéma Prisma).
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ /**
 * Même logique que dans le router `course` : `beginTime`/`endTime` sont des
 * entiers représentant des minutes depuis minuit.
 */ const beginTimeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(1439);
const endTimeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(1440);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    stageId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date(),
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.beginTime === undefined || data.endTime === undefined || data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const stageSessionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les sessions d'un stage donné, triées par date puis heure.
   */ getAllByStage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        stageId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.stageSession.findMany({
            where: {
                stageId: input.stageId
            },
            orderBy: [
                {
                    date: "asc"
                },
                {
                    beginTime: "asc"
                }
            ]
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const session = await ctx.prisma.stageSession.findUnique({
            where: {
                id: input.id
            }
        });
        if (!session) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Stage session not found."
            });
        }
        return session;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(createInput).mutation(async ({ ctx, input })=>{
        // Vérifie que le stage parent existe.
        const stage = await ctx.prisma.stage.findUnique({
            where: {
                id: input.stageId
            },
            select: {
                id: true
            }
        });
        if (!stage) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Stage not found (id=${input.stageId}).`
            });
        }
        try {
            return await ctx.prisma.stageSession.create({
                data: {
                    stageId: input.stageId,
                    date: input.date,
                    beginTime: input.beginTime,
                    endTime: input.endTime,
                    location: input.location ?? null,
                    notes: input.notes ?? null
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "A session already exists for this stage at this date and beginTime."
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        try {
            return await ctx.prisma.stageSession.update({
                where: {
                    id
                },
                data: rest
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A session already exists for this stage at this date and beginTime."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Stage session not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.stageSession.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Stage session not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = stageSessionRouter;
}),
"[project]/packages/backend/src/modules/posts/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "postRouter",
    ()=>postRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-Blz8XOf1.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
const postRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Veuillez fournir un titre"),
        content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Veuillez fournir du contenu")
    })).mutation(async ({ ctx, input })=>{
        const authorId = ctx.sessionClient.user.id;
        return ctx.prisma.post.create({
            data: {
                title: input.title,
                content: input.content,
                authorId
            }
        });
    }),
    getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("view_posts")).query(async ({ ctx })=>{
        return ctx.prisma.post.findMany({
            relationLoadStrategy: "join",
            include: {
                author: true
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("view_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.id
            },
            relationLoadStrategy: "join",
            include: {
                author: true
            }
        });
        if (!post) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$Blz8XOf1$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Post not found"
            });
        }
        return post;
    }),
    getByTitle: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("view_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.post.findMany({
            where: {
                title: {
                    contains: input.title,
                    mode: "insensitive"
                }
            },
            relationLoadStrategy: "join",
            include: {
                author: true
            }
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.post.delete({
            where: {
                id: input.id
            }
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Veuillez fournir un titre"),
        content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Veuillez fournir du contenu")
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.post.update({
            where: {
                id: input.id
            },
            data: {
                title: input.title,
                content: input.content
            }
        });
    })
});
}),
"[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/index.ts [app-route] (ecmascript)");
;
;
}),
"[project]/packages/contracts/src/storage/storage.types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storageProviderSchema",
    ()=>storageProviderSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const storageProviderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'cloudinary'
]);
}),
"[project]/packages/contracts/src/storage/storage.adapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/packages/contracts/src/storage/move.intent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "lifecycleStatusSchema",
    ()=>lifecycleStatusSchema,
    "storageMoveIntentSchema",
    ()=>storageMoveIntentSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const lifecycleStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'pending',
    'published',
    'bin'
]);
/* -------------------------------------------------------------------------- */ /*  Sources possibles d'un move                                               */ /* -------------------------------------------------------------------------- */ const fileSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('file'),
    /** Path concret du fichier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const folderSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    /** Path concret du dossier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
 */ const selectionSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('selection'),
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
    excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
});
const moveSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    fileSourceSchema,
    folderSourceSchema,
    selectionSourceSchema
]);
/* -------------------------------------------------------------------------- */ /*  Cibles possibles d'un move                                                */ /* -------------------------------------------------------------------------- */ /**
 * Cible exprimée par un path concret.
 * Exemple : `target: { type: 'folder', path: 'AKFC/published/cours/12' }`.
 */ const concreteFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
 */ const statusFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('status-folder'),
    status: lifecycleStatusSchema
});
const moveTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    concreteFolderTargetSchema,
    statusFolderTargetSchema
]);
const storageMoveIntentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    source: moveSourceSchema,
    target: moveTargetSchema
});
}),
"[project]/packages/contracts/src/storage/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$adapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.adapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/move.intent.ts [app-route] (ecmascript)");
;
;
;
}),
"[project]/packages/backend/src/modules/storage/adapters/cloudinary/mappers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mapClientFolderTreeToStorageNode",
    ()=>mapClientFolderTreeToStorageNode
]);
function mapClientFolderTreeToStorageNode(tree, depth) {
    return mapNode(tree, depth);
}
function mapNode(node, depth) {
    if (node.type === "file") {
        return mapFile(node);
    }
    return mapFolder(node, depth);
}
function mapFolder(folder, depth) {
    const hasChildren = (folder.children?.length ?? 0) > 0;
    // À profondeur 0, on ne charge pas les enfants (children reste undefined).
    // hasChildren reste rempli pour informer la TreeView qu'il y a quelque chose.
    if (depth <= 0) {
        return {
            type: "folder",
            name: folder.name,
            path: folder.fullPath,
            hasChildren
        };
    }
    // À profondeur > 0, on descend dans les enfants en décrémentant.
    const children = (folder.children ?? []).map((child)=>mapNode(child, depth - 1));
    return {
        type: "folder",
        name: folder.name,
        path: folder.fullPath,
        children,
        hasChildren
    };
}
function mapFile(file) {
    return {
        type: "file",
        name: file.name,
        path: file.publicId,
        metadata: cloudinaryFileToMetadata(file)
    };
}
function cloudinaryFileToMetadata(file) {
    // FileNode Cloudinary porte `kind`, `url`, `format` (cf. finder.types.ts).
    // On translate ce qui est neutre vers StorageMetadata. `kind` et `url`
    // sont des notions qui n'ont pas leur place dans `StorageMetadata` —
    // un adapter frontend qui les veut peut les recalculer (kind depuis
    // format, url via getMediaUrl).
    return {
        format: file.format
    };
}
}),
"[project]/packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCloudinaryStorageAdapter",
    ()=>createCloudinaryStorageAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/getCloudinaryFolderTree.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$move$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/move.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$createUploadSignatures$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$registerUploadedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/registerUploadedAssets.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/cloudinary/mappers.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function createCloudinaryStorageAdapter(deps) {
    const { prisma, appRoot } = deps;
    return {
        /* ====================================================================== */ /*  list — enfants directs d'un dossier                                   */ /* ====================================================================== */ async list (options) {
            // On s'appuie sur getCloudinaryFolderTree (qui retourne le tree complet
            // sous le préfixe) puis on extrait uniquement les enfants directs.
            // C'est sous-optimal si le tree est gros, mais ça réutilise la logique
            // canonique sans réécriture. Une optimisation cursor-based viendra
            // si nécessaire plus tard.
            const tree = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCloudinaryFolderTree"])({
                prisma,
                appRoot,
                normalizedPath: options.path
            });
            const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapClientFolderTreeToStorageNode"])(tree, /* depth */ 1);
            // Si jamais le path résolvait un fichier, pas de children — retour vide.
            if (node.type !== "folder") {
                return {
                    folders: [],
                    files: [],
                    nextCursor: null
                };
            }
            const folders = [];
            const files = [];
            for (const child of node.children ?? []){
                if (child.type === "folder") {
                    folders.push(child);
                } else {
                    files.push(child);
                }
            }
            return {
                folders,
                files,
                // Cloudinary `getFolderTree` ne paginé pas par cursor à ce niveau —
                // la pagination se fait dans listAuthenticatedResources, mais elle
                // est consommée intégralement avant retour. Pas de page suivante.
                nextCursor: null
            };
        },
        /* ====================================================================== */ /*  getTree — sous-arbre jusqu'à `depth` niveaux                          */ /* ====================================================================== */ async getTree (options) {
            const depth = options.depth ?? 1;
            const tree = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCloudinaryFolderTree"])({
                prisma,
                appRoot,
                normalizedPath: options.path
            });
            const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapClientFolderTreeToStorageNode"])(tree, depth);
            // Si le path résolvait un fichier (cas marginal), on enveloppe dans un
            // folder vide pour respecter le contrat (`root: StorageFolderNode`).
            // Le caller pourra détecter ça via root.children === [] et root.path === options.path.
            if (root.type !== "folder") {
                return {
                    root: {
                        type: "folder",
                        name: root.name,
                        path: options.path,
                        children: [],
                        hasChildren: false
                    }
                };
            }
            return {
                root
            };
        },
        /* ====================================================================== */ /*  getNode — lit un node précis                                          */ /* ====================================================================== */ async getNode (path) {
            // Stratégie : tenter d'abord comme fichier, puis comme dossier.
            // 1) Si Cloudinary connaît un asset à ce path → c'est un fichier.
            try {
                const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(path);
                const name = path.split("/").pop() ?? path;
                return {
                    type: "file",
                    name,
                    path,
                    metadata: cloudinaryAssetInfoToStorageMetadata(info)
                };
            } catch  {
            // continuer
            }
            // 2) Sinon, on regarde si des enfants existent sous le préfixe.
            //    On utilise getCloudinaryFolderTree qui combine assets + registre DB.
            try {
                const tree = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$getCloudinaryFolderTree$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCloudinaryFolderTree"])({
                    prisma,
                    appRoot,
                    normalizedPath: path
                });
                const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapClientFolderTreeToStorageNode"])(tree, /* depth */ 0);
                if (node.type === "folder") return node;
            } catch  {
            // ignore
            }
            return null;
        },
        /* ====================================================================== */ /*  getMetadata — lit les métadonnées brutes                              */ /* ====================================================================== */ async getMetadata (path) {
            try {
                const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(path);
                return cloudinaryAssetInfoToStorageMetadata(info);
            } catch  {
                return null;
            }
        },
        /* ====================================================================== */ /*  move — déplace un file ou un folder atomique                          */ /* ====================================================================== */ async move (operation) {
            // On traduit l'opération atomique vers un MoveIntent Cloudinary
            // "pauvre" (pas de selection, pas de virtual-folder), puis on délègue
            // à moveService. Cette traduction est triviale parce que le contrat
            // agnostique a précisément été pensé comme un sous-ensemble qui
            // tient dans Cloudinary sans gymnastique.
            const intent = {
                source: operation.source.type === "file" ? {
                    type: "file",
                    fullPath: operation.source.path
                } : {
                    type: "folder",
                    fullPath: operation.source.path
                },
                target: {
                    type: "folder",
                    fullPath: operation.target.path
                }
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$move$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveService"])(intent);
        },
        // delete: NON IMPLÉMENTÉ (cf. doc en tête de fichier). Le contrat
        // autorise l'absence — la propriété restera `undefined` sur l'objet.
        /* ====================================================================== */ /*  createUploadAuthorization — délivre des signatures Cloudinary         */ /* ====================================================================== */ async createUploadAuthorization (input) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$createUploadSignatures$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignatures"])({
                prisma,
                appRoot,
                destination: input.destination,
                assets: input.assets
            });
        },
        /* ====================================================================== */ /*  registerUploadedAsset — persiste après revérification                 */ /* ====================================================================== */ async registerUploadedAsset (input) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$registerUploadedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerUploadedAssets"])({
                prisma,
                appRoot,
                userId: input.userId,
                destination: input.destination,
                assets: input.assets,
                eventDate: input.eventDate
            });
        }
    };
}
/* -------------------------------------------------------------------------- */ /*  Helpers privés au fichier                                                 */ /* -------------------------------------------------------------------------- */ /**
 * Mappe la sortie de `cloudinary.api.resource()` (via `getAssetInfo`) vers
 * un `StorageMetadata` agnostique.
 *
 * Le typage de `getAssetInfo` est faible (l'API Cloudinary retourne du `any`
 * en pratique). On lit défensivement, en laissant les champs absents devenir
 * `undefined` plutôt que de propager des `null` ou des chaînes vides.
 */ function cloudinaryAssetInfoToStorageMetadata(info) {
    return {
        bytes: typeof info.bytes === "number" ? info.bytes : undefined,
        format: info.format,
        createdAt: info.created_at
    };
}
}),
"[project]/packages/backend/src/modules/storage/adapters/cloudinary/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Adapter Cloudinary pour le contrat de stockage agnostique.
 *
 * Point d'entrée public : `createCloudinaryStorageAdapter`. La factory
 * retourne un objet qui satisfait `StorageAdapter & UploadCapableAdapter<…>`
 * en s'appuyant sur les services Cloudinary existants.
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$cloudinaryStorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts [app-route] (ecmascript)");
;
}),
"[project]/packages/backend/src/modules/storage/providerRegistry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAdapter",
    ()=>getAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/cloudinary/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$cloudinaryStorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts [app-route] (ecmascript)");
;
function getAdapter(provider, deps) {
    switch(provider){
        case "cloudinary":
            // `as AdapterFor<P>` est nécessaire ici parce que TypeScript ne peut
            // pas inférer la corrélation entre la valeur littérale du discriminant
            // et le générique `P` à l'intérieur du switch. Le cast est sûr parce
            // que le case ne s'exécute que pour P === 'cloudinary'.
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$cloudinaryStorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCloudinaryStorageAdapter"])(deps);
        default:
            // Le typecheck nous garantit que ce default est inatteignable tant
            // que tous les cas de l'enum sont couverts. Si tu ajoutes un provider
            // sans l'enregistrer ici, tu auras un type error de cohérence.
            throw new Error(`Unknown storage provider: ${String(provider)}`);
    }
}
}),
"[project]/packages/backend/src/modules/storage/resolveMoveIntent.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveMoveIntent",
    ()=>resolveMoveIntent
]);
async function resolveMoveIntent(params) {
    const { adapter, appRoot, intent } = params;
    if (!adapter.move) {
        throw new Error("Adapter does not support move(). " + "Cannot resolve a StorageMoveIntent on a read-only adapter.");
    }
    // 1) Résoudre la SOURCE en items concrets (file ou folder).
    const items = await resolveSource(intent.source, adapter);
    // 2) Pour chaque item, traduire la TARGET en path concret et produire
    //    une opération atomique.
    const operations = items.map((item)=>({
            source: item,
            target: {
                path: resolveTargetPath(item, intent.target, appRoot)
            }
        }));
    // 3) Exécuter les opérations séquentiellement via l'adapter.
    //    Séquentiel et non parallèle : certains backends (Cloudinary notamment)
    //    n'aiment pas les opérations concurrentes sur des prefixes voisins.
    for (const operation of operations){
        await adapter.move(operation);
    }
    return operations;
}
/**
 * Expanse la source d'une intention en une liste d'items concrets.
 *
 * - `file` ou `folder` : un seul item, retourné tel quel.
 * - `selection`        : on liste sous chaque root et on filtre les excluded.
 *                        On préserve les types (file/folder) découverts pour
 *                        que `adapter.move()` puisse traiter chaque cas.
 */ async function resolveSource(source, adapter) {
    if (source.type === "file" || source.type === "folder") {
        return [
            {
                type: source.type,
                path: source.path
            }
        ];
    }
    // source.type === 'selection'
    const excluded = new Set(source.excluded ?? []);
    // Exclusion par préfixe : un asset `cours/12/draft/x.jpg` est exclu si
    // `cours/12/draft` est dans excluded. C'est la même règle que celle
    // appliquée par moveService Cloudinary actuellement.
    const isExcluded = (path)=>{
        if (excluded.has(path)) return true;
        for (const ex of excluded){
            if (path.startsWith(`${ex}/`)) return true;
        }
        return false;
    };
    const out = [];
    const seen = new Set();
    for (const rootPath of source.roots){
        if (isExcluded(rootPath)) continue;
        // 1) Le root est-il un fichier ?
        //    Stratégie : tenter getNode pour discriminer file/folder.
        //    Si l'adapter n'a pas getNode, on assume folder et on liste.
        const rootNode = adapter.getNode ? await adapter.getNode(rootPath) : null;
        if (rootNode?.type === "file") {
            if (!seen.has(rootPath)) {
                out.push({
                    type: "file",
                    path: rootPath
                });
                seen.add(rootPath);
            }
            continue;
        }
        // 2) Sinon, c'est un dossier : on liste son contenu récursif via getTree
        //    pour récupérer tous les descendants.
        if (!adapter.getTree) {
            throw new Error("Adapter does not support getTree(). " + "Cannot resolve a 'selection' source without recursive listing.");
        }
        const subtree = await adapter.getTree({
            path: rootPath,
            depth: Infinity
        });
        // Parcourir le sous-arbre en profondeur, ramasser tous les files non exclus.
        walkTree(subtree.root, (node)=>{
            if (node.type === "file" && !isExcluded(node.path) && !seen.has(node.path)) {
                out.push({
                    type: "file",
                    path: node.path
                });
                seen.add(node.path);
            }
        });
    }
    return out;
}
/**
 * Visite récursive d'un arbre de StorageNode.
 */ function walkTree(node, visit) {
    visit(node);
    if (node.type === "folder" && node.children) {
        for (const child of node.children){
            walkTree(child, visit);
        }
    }
}
/* -------------------------------------------------------------------------- */ /*  Résolution de la target                                                   */ /* -------------------------------------------------------------------------- */ /**
 * Calcule le path concret d'arrivée pour un item donné.
 *
 * Pour une target de type `folder`, le path concret est `<targetFolder>/<sourceTail>`
 * où `sourceTail` est le dernier segment du path source (le nom du fichier
 * ou du dossier).
 *
 * Pour une target de type `status-folder`, on remplace le segment de statut
 * dans le path source. Convention : le statut est le SECOND segment du path
 * (juste après l'appRoot). Exemple : `AKFC/pending/cours/12/photo.jpg`
 *   → segment[0] = `AKFC` (appRoot)
 *   → segment[1] = `pending` (statut courant)
 *   → segments[2..] = `cours/12/photo.jpg` (suffixe à préserver)
 */ function resolveTargetPath(item, target, appRoot) {
    if (target.type === "folder") {
        const tail = lastSegment(item.path);
        return `${target.path}/${tail}`;
    }
    // target.type === 'status-folder'
    // On remplace le segment de statut dans le path source.
    const parts = item.path.split("/").filter(Boolean);
    // Invariant 1 : le path doit commencer par appRoot.
    // Toute source bien gérée par le système est sous appRoot.
    if (parts[0] !== appRoot) {
        throw new Error(`Cannot resolve status-folder target: source path does not start with appRoot. ` + `path="${item.path}" appRoot="${appRoot}"`);
    }
    // Invariant 2 : le segment de statut (parts[1]) doit être un statut connu.
    // Cet invariant traduit la règle applicative : un asset géré par le système
    // ne peut vivre que sous un status-folder ('pending' | 'published' | 'bin').
    // Si parts[1] est inconnu, c'est qu'on tente un move sur un asset qui
    // n'a pas été produit par le pipeline d'upload du système — bug en amont
    // qui mérite d'échouer fort plutôt que d'être bricolé silencieusement.
    const currentStatus = parts[1];
    if (currentStatus !== "pending" && currentStatus !== "published" && currentStatus !== "bin") {
        throw new Error(`Cannot resolve status-folder target: source path is not under a known ` + `lifecycle status segment. Expected segment[1] in {'pending', 'published', 'bin'}, ` + `got "${currentStatus ?? "<missing>"}". path="${item.path}"`);
    }
    // [appRoot, <oldStatus>, ...rest] → [appRoot, newStatus, ...rest]
    parts[1] = target.status;
    return parts.join("/");
}
function lastSegment(path) {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? path;
}
}),
"[project]/packages/backend/src/modules/storage/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storageRouter",
    ()=>storageRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.1.12/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/move.intent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/cloudinary/upload.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/providerRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolveMoveIntent$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/resolveMoveIntent.service.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const storageRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /* ====================================================================== */ /*  Lecture (couche 1 du contrat StorageAdapter)                          */ /* ====================================================================== */ list: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        cursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional()
    })).query(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        return adapter.list({
            path: input.path,
            cursor: input.cursor,
            limit: input.limit
        });
    }),
    getTree: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        depth: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional()
    })).query(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        return adapter.getTree({
            path: input.path,
            depth: input.depth
        });
    }),
    getNode: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).query(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        if (!adapter.getNode) {
            throw new Error(`Provider "${input.provider}" does not support getNode().`);
        }
        return adapter.getNode(input.path);
    }),
    getMetadata: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).query(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        if (!adapter.getMetadata) {
            throw new Error(`Provider "${input.provider}" does not support getMetadata().`);
        }
        return adapter.getMetadata(input.path);
    }),
    /* ====================================================================== */ /*  Move (couches 1 + 2 + 3)                                              */ /* ====================================================================== */ /**
   * Déplace un asset (file ou folder) ou une sélection.
   *
   * Le client envoie une `StorageMoveIntent` riche (avec `selection`,
   * `status-folder`, etc.). Le router :
   *   1) résout l'adapter du provider
   *   2) appelle `resolveMoveIntent` qui expanse l'intent en N opérations
   *      atomiques et les exécute via `adapter.move()`
   *
   * Cette procédure remplace l'ancienne `cloudinary.move`. Le frontend
   * doit migrer ses callsites vers `storage.move` avec un `provider` explicite.
   */ move: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        intent: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageMoveIntentSchema"]
    })).mutation(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        const operations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolveMoveIntent$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMoveIntent"])({
            adapter,
            appRoot: ctx.appRoot,
            intent: input.intent
        });
        return {
            operations
        };
    }),
    /* ====================================================================== */ /*  Upload (capability — input/output provider-spécifiques)               */ /* ====================================================================== */ /**
   * Délivre une autorisation d'upload bornée.
   *
   * Pour Cloudinary : un lot de signatures SHA1 prêtes à être présentées
   * à l'API d'upload Cloudinary. Pour R2 (à venir) : presigned URLs.
   *
   * L'output est provider-spécifique — le client doit savoir quel
   * provider il manipule pour interpréter la réponse (ce qui est attendu :
   * la mécanique d'upload qui suit dépend du provider).
   */ createUploadAuthorization: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignaturesSchema"].shape
    })).mutation(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        // Capability d'upload obligatoire pour cette procédure — on échoue
        // proprement si un provider non upload-capable est demandé.
        if (typeof adapter.createUploadAuthorization !== "function") {
            throw new Error(`Provider "${input.provider}" does not support uploads ` + `(no createUploadAuthorization method).`);
        }
        return adapter.createUploadAuthorization({
            destination: input.destination,
            assets: input.assets
        });
    }),
    /**
   * Persiste les assets uploadés en base, après revérification serveur.
   *
   * `userId` est lu depuis `ctx.user.id` — jamais depuis l'input client.
   * C'est l'auth tRPC (`protectedProcedure`) qui garantit qu'un userId
   * authentifié est présent.
   */ registerUploadedAsset: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$1$2e$12$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerUploadedAssetsSchema"].shape
    })).mutation(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        if (typeof adapter.registerUploadedAsset !== "function") {
            throw new Error(`Provider "${input.provider}" does not support uploads ` + `(no registerUploadedAsset method).`);
        }
        return adapter.registerUploadedAsset({
            destination: input.destination,
            assets: input.assets,
            eventDate: input.eventDate,
            userId: ctx.user.id
        });
    })
});
}),
"[project]/packages/backend/src/modules/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appRouter",
    ()=>appRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/auth/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$users$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/users/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$roles$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/roles/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$session$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/session/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$permissions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/permissions/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$categories$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/categories/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$courses$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/courses/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$disciplines$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/disciplines/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stages$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/stages/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stageSessions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/stageSessions/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$posts$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/posts/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/router.ts [app-route] (ecmascript)");
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
;
;
;
;
const appRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    auth: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authRouter"],
    user: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$users$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["userRouter"],
    role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$roles$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["roleRouter"],
    session: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$session$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sessionRouter"],
    cloudinary: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloudinaryRouter"],
    trash: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trashRouter"],
    permission: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$permissions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["permissionRouter"],
    category: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$categories$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["categoryRouter"],
    course: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$courses$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseRouter"],
    discipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$disciplines$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disciplineRouter"],
    stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stages$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stageRouter"],
    stageSession: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stageSessions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stageSessionRouter"],
    post: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$posts$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["postRouter"],
    storage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageRouter"]
});
}),
"[project]/apps/web/src/app/api/trpc/[trpc]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.7.1_typescript@5.9.3/node_modules/@trpc/server/dist/adapters/fetch/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
const handler = async (req)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$7$2e$1_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchRequestHandler"])({
        endpoint: "/api/trpc",
        req,
        router: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appRouter"],
        createContext: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createTRPCContext"])({
                req
            })
    });
};
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c03e6e09._.js.map