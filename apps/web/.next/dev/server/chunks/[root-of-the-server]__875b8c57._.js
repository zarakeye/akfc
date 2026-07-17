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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/headers.js [app-route] (ecmascript)");
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
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
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
        payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$BRf4imah$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/initTRPC-BRf4imah.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
const t = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$BRf4imah$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initTRPC"].context().create({
    transformer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$superjson$40$2$2e$2$2e$6$2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]
});
const router = t.router;
const publicProcedure = t.procedure;
const isAuthed = t.middleware(({ ctx, next })=>{
    const sessionClient = ctx.sessionClient;
    if (!sessionClient?.user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.3/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
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
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: "7d"
    });
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value;
    if (!token) return;
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
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
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return cookieStore.get(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$auth$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COOKIE_NAME"])?.value ?? null;
}
function verifyJwt(token) {
    try {
        if (!token) return null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$3$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED",
            message: "INVALID_CREDENTIALS"
        });
    }
    const valid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
    if (!valid) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
    login: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
        password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit avoir au moins 12 caractères")
    })).mutation(async ({ input })=>{
        const { email, password } = input;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$auth$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginService"])(email, password);
            return {
                success: true
            };
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"] && error.message === "INVALID_CREDENTIALS") {
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
    requestPasswordReset: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email()
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
    resetPassword: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        token: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(10),
        newPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit faire au moins 12 caractères")
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Invalid or expired token"
            });
        }
        if (entry.usedAt) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Token already used"
            });
        }
        if (entry.expiresAt.getTime() < Date.now()) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
const requirePermission = (permissionName)=>__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["t"].middleware(({ ctx, next })=>{
        const user = ctx.sessionClient?.user;
        if (!user) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "UNAUTHORIZED",
                message: "Authentication required."
            });
        }
        const permissions = user.role?.permissions ?? [];
        const hasPermission = permissions.includes(permissionName);
        if (!hasPermission) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "FORBIDDEN",
                message: `Missing permission: ${permissionName}`
            });
        }
        return next();
    });
const isAdmin = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["t"].middleware(({ ctx, next })=>{
    const user = ctx.sessionClient?.user;
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "UNAUTHORIZED",
            message: "Authentication required."
        });
    }
    if (user.role?.name !== "ADMIN") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const updateMeFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    firstName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Le prénom doit avoir au moins 1 caractère"),
    lastName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "Le nom de famille doit avoir au moins 2 caractères"),
    // email: z.string().refine((value) => {
    //   // Regular expression to validate email format
    //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    // }, 'Veuillez fournir une adresse e-mail valide'),
    pseudo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2).optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    aboutMe: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000).optional().or(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('')),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>{
        if (!val) return true;
        const cleaned = val.replace(/\D/g, ""); // supprime espaces, tirets, etc.
        return /^0[1-9]\d{8}$/.test(cleaned);
    }, "Le numéro de téléphone doit être valide (ex: 0XXXXXXXXX)"),
    birthDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().refine((val)=>{
        if (!val) return true;
        return !Number.isNaN(Date.parse(val));
    }, "Date de naissance invalide")
});
}),
"[project]/packages/contracts/src/forms/updateUserRoleById.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateUserRoleByIdSchema",
    ()=>updateUserRoleByIdSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const updateUserRoleByIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    userId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "userId is required"),
    roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive("roleId must be a positive integer")
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        return user;
    }),
    getByEmail: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "User not found"
            });
        }
        return user;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email format"),
        password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.user.findUnique({
            where: {
                email: input.email
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_users")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    getProfileById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    /**
   * Liste tous les users qui sont **factuellement** instructeurs — c'est-à-dire
   * qui ont au moins une relation d'animation dans le club : ils animent
   * une discipline, un cours, ou un stage (en tant qu'animateur principal
   * ou secondaire).
   *
   * Le club n'a pas de rôle "instructor" nominal en schéma ; cette
   * définition factuelle permet de peupler les sélecteurs des forms admin
   * (Course, Stage, etc.) sans dépendre d'un signal qui n'existe pas.
   *
   * Si un jour tu veux désigner un nouvel instructeur qui n'anime encore
   * rien, il faudra introduire un autre signal (rôle dédié ou flag
   * `isInstructor` sur User) — auquel cas cette query devra évoluer.
   *
   * Sélection minimale (id + nom) suffisante pour l'affichage en dropdown.
   * Tri par lastName puis firstName pour l'UX du select.
   */ getInstructors: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.user.findMany({
            where: {
                OR: [
                    {
                        disciplinesAsInstructor: {
                            some: {}
                        }
                    },
                    {
                        coursesAsInstructor: {
                            some: {}
                        }
                    },
                    {
                        stagesAsPrimaryAnimator: {
                            some: {}
                        }
                    },
                    {
                        stagesAsAnimator: {
                            some: {}
                        }
                    }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                pseudo: true,
                email: true
            },
            orderBy: [
                {
                    lastName: "asc"
                },
                {
                    firstName: "asc"
                }
            ]
        });
    }),
    /**
   * Liste tous les administrateurs (rôle ADMIN) avec leur avatar courant,
   * pour peupler le sélecteur d'avatar du bloc media-text (« utiliser
   * l'avatar de X »). Inclut les admins SANS avatar (avatar `null`) — l'UI
   * affichera un placeholder. `avatar` est un publicId Cloudinary brut ;
   * l'URL d'affichage est construite côté client comme pour l'avatar du
   * header.
   */ listAvatarCandidates: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.user.findMany({
            where: {
                role: {
                    name: "ADMIN"
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                pseudo: true,
                avatar: true
            },
            orderBy: [
                {
                    lastName: "asc"
                },
                {
                    firstName: "asc"
                }
            ]
        });
    })
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
"[project]/packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "readUploadedAssetMetadata",
    ()=>readUploadedAssetMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
;
;
/**
 * readUploadedAssetMetadata.service.ts
 *
 * Relit les métadonnées d'un asset fraîchement uploadé directement depuis
 * Cloudinary (source de vérité), plutôt que de faire confiance au payload
 * envoyé par le client.
 *
 * ─── mimeType : dérivé de Cloudinary, jamais du client ──────────────────────
 *
 * Cloudinary ne renvoie pas un mimeType complet, mais il renvoie le couple
 * fiable `resource_type` (image | video) + `format` (jpg, mp4, mp3…). On en
 * dérive un mimeType correct. C'est ce qui empêche les lignes aberrantes du
 * type `image/mp4` (un .mp4 dont le client avait déclaré `mimeType: image/...`).
 *
 * Note : Cloudinary range l'AUDIO sous `resource_type: "video"`. On
 * désambiguïse par le `format` (mp3/wav/… → audio/*).
 */ /* -------------------------------------------------------------------------- */ /*                          DÉRIVATION DU MIME TYPE                           */ /* -------------------------------------------------------------------------- */ const AUDIO_MIME_BY_FORMAT = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    weba: "audio/webm"
};
const VIDEO_MIME_BY_FORMAT = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    m4v: "video/x-m4v",
    ogv: "video/ogg"
};
const IMAGE_MIME_BY_FORMAT = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    tiff: "image/tiff",
    ico: "image/x-icon",
    heic: "image/heic",
    heif: "image/heif"
};
/**
 * Dérive un mimeType depuis le couple (resourceType, format) Cloudinary.
 * Toujours préférable au mimeType déclaré par le client, qui peut mentir.
 */ function deriveMimeType(resourceType, format) {
    const fmt = (format ?? "").toLowerCase();
    if (resourceType === "video") {
        // Cloudinary range l'audio sous "video" → on teste d'abord les formats
        // audio connus, sinon on retombe sur de la vraie vidéo.
        if (fmt in AUDIO_MIME_BY_FORMAT) return AUDIO_MIME_BY_FORMAT[fmt];
        return VIDEO_MIME_BY_FORMAT[fmt] ?? "video/mp4";
    }
    return IMAGE_MIME_BY_FORMAT[fmt] ?? `image/${fmt || "octet-stream"}`;
}
async function readUploadedAssetMetadata(params) {
    const { publicId, resourceType } = params;
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
            resource_type: resourceType,
            type: "authenticated"
        });
        const format = result.format ?? null;
        return {
            publicId: result.public_id,
            assetId: result.asset_id ?? null,
            secureUrl: result.secure_url,
            resourceType,
            format,
            // mimeType dérivé de Cloudinary (resourceType + format), JAMAIS du client.
            mimeType: deriveMimeType(resourceType, format),
            bytes: result.bytes ?? 0,
            width: result.width ?? null,
            height: result.height ?? null,
            duration: result.duration ?? null,
            version: result.version ?? null
        };
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Uploaded asset not found on Cloudinary."
        });
    }
}
}),
"[project]/packages/backend/src/modules/avatar/avatar.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "avatarFolder",
    ()=>avatarFolder,
    "createAvatarUploadSignature",
    ()=>createAvatarUploadSignature,
    "deleteAvatar",
    ()=>deleteAvatar,
    "registerAvatar",
    ()=>registerAvatar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$readUploadedAssetMetadata$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/readUploadedAssetMetadata.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
;
;
;
function avatarFolder(appRoot, userId) {
    return `${appRoot}/avatars/${userId}`;
}
/** Vrai si le publicId appartient bien à l'espace avatar de CE user. */ function isOwnAvatarPublicId(publicId, appRoot, userId) {
    return publicId.startsWith(`${avatarFolder(appRoot, userId)}/`);
}
function createAvatarUploadSignature(params) {
    const { appRoot, userId } = params;
    const folder = avatarFolder(appRoot, userId);
    // publicId unique : timestamp ms + court aléatoire (évite collision si
    // deux uploads dans la même ms).
    const unique = `${Date.now()}-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(3).toString("hex")}`;
    const publicId = unique;
    const fullPublicId = `${folder}/${publicId}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = {
        folder,
        public_id: publicId,
        timestamp,
        type: "authenticated"
    };
    const signature = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha1").update(Object.keys(toSign).sort().map((k)=>`${k}=${toSign[k]}`).join("&") + process.env.CLOUDINARY_API_SECRET).digest("hex");
    return {
        folder,
        publicId,
        fullPublicId,
        timestamp,
        type: "authenticated",
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
}
async function registerAvatar(params) {
    const { prisma, appRoot, userId, publicId } = params;
    if (!isOwnAvatarPublicId(publicId, appRoot, userId)) {
        throw new Error("publicId hors de l'espace avatar de l'utilisateur.");
    }
    // Confirme que l'upload a bien abouti (jette sinon).
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$readUploadedAssetMetadata$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readUploadedAssetMetadata"])({
        publicId,
        resourceType: "image"
    });
    // Ancien avatar (à supprimer après bascule).
    const prev = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            avatar: true
        }
    });
    const oldPublicId = prev?.avatar ?? null;
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            avatar: publicId
        }
    });
    // Supprime l'ancien fichier Cloudinary (best-effort, jamais bloquant).
    if (oldPublicId && oldPublicId !== publicId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(oldPublicId, {
                resource_type: "image",
                type: "authenticated",
                invalidate: true
            });
        } catch  {
        // ancien déjà absent — rien à faire
        }
    }
    return {
        publicId
    };
}
async function deleteAvatar(params) {
    const { prisma, userId } = params;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            avatar: true
        }
    });
    const publicId = user?.avatar ?? null;
    if (publicId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(publicId, {
                resource_type: "image",
                type: "authenticated",
                invalidate: true
            });
        } catch  {
        // déjà absent — rien à faire
        }
    }
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            avatar: null
        }
    });
}
}),
"[project]/packages/backend/src/modules/avatar/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "avatarRouter",
    ()=>avatarRouter,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$avatar$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/avatar/avatar.service.ts [app-route] (ecmascript)");
;
;
;
const avatarRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /** Signature d'upload direct (publicId UNIQUE généré côté serveur). */ getUploadSignature: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].mutation(({ ctx })=>{
        const userId = ctx.sessionClient.user.id;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$avatar$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAvatarUploadSignature"])({
            appRoot: ctx.appRoot,
            userId
        });
    }),
    /** Après upload : pointe User.avatar sur le nouveau publicId, supprime l'ancien. */ register: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        publicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const userId = ctx.sessionClient.user.id;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$avatar$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerAvatar"])({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            userId,
            publicId: input.publicId
        });
    }),
    /** Avatar courant du user connecté (publicId ou null). */ getMine: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const user = await ctx.prisma.user.findUnique({
            where: {
                id: ctx.sessionClient.user.id
            },
            select: {
                avatar: true
            }
        });
        return {
            publicId: user?.avatar ?? null
        };
    }),
    /** Suppression de l'avatar. */ remove: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].mutation(async ({ ctx })=>{
        const userId = ctx.sessionClient.user.id;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$avatar$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteAvatar"])({
            prisma: ctx.prisma,
            userId
        });
        return {
            ok: true
        };
    })
});
const __TURBOPACK__default__export__ = avatarRouter;
}),
"[project]/packages/backend/src/modules/roles/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "roleRouter",
    ()=>roleRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const role = await ctx.prisma.role.findUnique({
            where: {
                id: input.id
            }
        });
        if (!role) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Role not found"
            });
        }
        return role;
    }),
    getByIdWithPermissions: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Role not found"
            });
        }
        return role;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        permissionIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()).optional()
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.role.findUnique({
            where: {
                name: input.name
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        permissions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()).default([])
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Another role with this name already exists."
            });
        }
        const roleId = input.id;
        // ⚠️ `RolePermissions` est une jointure EXPLICITE : `set` ne connecte
        // que des lignes de jointure DÉJÀ existantes et n'en crée jamais une
        // absente — donc assigner une nouvelle permission via `set` échoue
        // silencieusement. Remplacement réel du jeu : `deleteMany` (scopé à la
        // relation = ce rôle) puis `create` des liaisons voulues.
        return ctx.prisma.role.update({
            where: {
                id: roleId
            },
            data: {
                name: input.name,
                permissions: {
                    deleteMany: {},
                    create: input.permissions.map((permissionId)=>({
                            permissionId
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
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_roles")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.role.delete({
            where: {
                id: input.id
            }
        });
    })
});
const __TURBOPACK__default__export__ = roleRouter;
}),
"[project]/packages/backend/src/modules/session/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sessionRouter",
    ()=>sessionRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
    updateExpiration: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdmin"]).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        expiresAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].date()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const folderKindSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'pending',
    'published',
    'bin'
]);
/* ---------- SOURCE ---------- */ const fileSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('file'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const folderSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/**
 * ✅ Multi-selection support
 */ const selectionSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('selection'),
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
    excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
});
const sourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    fileSourceSchema,
    folderSourceSchema,
    selectionSourceSchema
]);
/* ---------- TARGET ---------- */ const virtualTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('virtual-folder'),
    status: folderKindSchema
});
const folderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const targetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    virtualTargetSchema,
    folderTargetSchema
]);
const moveSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    source: sourceSchema,
    target: targetSchema
});
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/utils/cloudinary.utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
;
;
;
;
async function moveService(intent) {
    const { source, target } = intent;
    console.log("Executing move intent:", intent);
    /**
   * ---------------------------------------------------------------------------
   * ✅ 0) MULTI-SELECT
   * ---------------------------------------------------------------------------
   */ if (source.type === "selection") {
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
        if (target.type === "virtual-folder") {
            for (const asset of uniqueAssets){
                const nextPublicId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(asset.public_id, target.status);
                // no-op : déjà dans le bon status
                if (nextPublicId === asset.public_id) continue;
                await renameAsset(asset.public_id, nextPublicId, asset.resource_type);
            }
            return;
        }
        // ---------- selection -> folder ----------
        if (target.type === "folder") {
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
        throw new Error("Invalid target for selection");
    }
    /**
   * ---------------------------------------------------------------------------
   * 1) FILE / FOLDER -> VIRTUAL
   * ---------------------------------------------------------------------------
   */ if (target.type === "virtual-folder") {
        const newPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["replaceStatusSegment"])(source.fullPath, target.status);
        if (source.type === "file") {
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
   */ if (target.type === "folder") {
        if (source.type === "file") {
            const newPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$cloudinary$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveFileIntoFolder"])(source.fullPath, target.fullPath);
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(source.fullPath);
            await renameAsset(source.fullPath, newPath, info.resource_type);
        } else {
            const folderName = source.fullPath.split("/").pop();
            if (!folderName) return;
            const targetPrefix = `${target.fullPath}/${folderName}`;
            await moveFolderRecursively(source.fullPath, targetPrefix);
        }
        return;
    }
    throw new Error("Invalid move intent");
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
    // Le compte est en DYNAMIC FOLDERS : le public_id et l'`asset_folder`
    // (dossier-entité, source de vérité de l'arbo Cloudinary) sont deux
    // champs INDÉPENDANTS. Un rename qui ne touche que le public_id laisse
    // l'asset rattaché à son ancien dossier-entité → Media Library et
    // sub_folders/delete_folder le voient toujours à l'ancien emplacement
    // (fantômes, arbo divergente). On aligne donc explicitement
    // l'`asset_folder` sur le nouveau chemin : tout sauf le dernier segment
    // du public_id cible.
    const nextAssetFolder = to.includes("/") ? to.slice(0, to.lastIndexOf("/")) : "";
    // ✅ on passe resource_type pour que rename marche (image/video/raw)
    //
    // `asset_folder` est accepté par l'API rename (dynamic folders) mais
    // absent du type RenameOptions du SDK. On construit les options typées
    // normalement, puis on ajoute asset_folder via un spread élargi en
    // `Record<string, unknown>` (double cast `as unknown as` — la voie que
    // TS impose pour un champ runtime-valide mais non typé).
    const renameOptions = {
        type: "authenticated",
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
        // Déplace aussi le dossier-entité (dynamic folders).
        asset_folder: nextAssetFolder
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, renameOptions);
    // ⚠ `uploader.rename` déplace le public_id mais IGNORE `asset_folder`
    // (confirmé en test : le retour garde l'ancien dossier-entité, quoi
    // qu'on passe au rename). En DYNAMIC FOLDERS, le dossier-entité — source
    // de vérité de l'arbo Cloudinary (Media Library, sub_folders,
    // delete_folder) — se met à jour via l'Admin API `api.update` en appel
    // SÉPARÉ. Sans lui : fantômes, arbo divergente, picker aveugle.
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.update(to, {
        asset_folder: nextAssetFolder,
        resource_type: resourceType,
        type: "authenticated"
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
        "image",
        "video",
        "raw"
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
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
        "image",
        "video",
        "raw"
    ]){
        let nextCursor;
        do {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
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
        "image",
        "video",
        "raw"
    ]){
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resource(publicId, {
                type: "authenticated",
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
        const folderName = root.split("/").pop();
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
    const existing = await db.folder.findMany({
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
    await db.folder.createMany({
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
        const registered = await prisma.folder.findMany({
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
        const existing = await prisma.folder.findUnique({
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
        await prisma.folder.create({
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
"[project]/packages/backend/src/modules/media/services/resolvePersoBaseFolder.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolvePersoBaseFolder",
    ()=>resolvePersoBaseFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$9$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/slugify@1.6.9/node_modules/slugify/slugify.js [app-route] (ecmascript)");
;
const SLUG_OPTIONS = {
    lower: true,
    strict: true
};
function slug(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$9$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(input, SLUG_OPTIONS);
}
async function resolvePersoBaseFolder(params) {
    const { prisma, appRoot, userId } = params;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            firstName: true,
            lastName: true,
            pseudo: true
        }
    });
    if (!user) {
        throw new Error(`Acting user not found (id=${userId})`);
    }
    const fullName = [
        user.firstName,
        user.lastName
    ].filter((part)=>Boolean(part && part.trim())).join(" ");
    const personSlug = slug(fullName) || slug(user.pseudo ?? "") || `user-${userId}`;
    return `${appRoot}/pending/persos/${personSlug}-${userId}`;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolvePendingUploadFolder",
    ()=>resolvePendingUploadFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$9$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/slugify@1.6.9/node_modules/slugify/slugify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolvePersoBaseFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/resolvePersoBaseFolder.service.ts [app-route] (ecmascript)");
;
;
/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedName)}`
 *     Les assets restent isolés dans `new/` jusqu'à validation admin.
 *
 * ─── Destinations découplées (fondation « destination générique ») ────────
 *   - general : `${appRoot}/pending/general`
 *       Espace club sans discipline ni catégorie. Sert d'espace partagé de
 *       fait entre admins (pas de permissions : club petit, confiance).
 *   - perso   : `${appRoot}/pending/persos/${personSlug}-${userId}`
 *       Espace personnel de l'admin qui uploade. Le dossier est dérivé de
 *       `userId` (identité AUTHENTIFIÉE issue du contexte tRPC, jamais un id
 *       fourni par le client) → un admin ne peut écrire que dans son dossier.
 *       `personSlug` = slug(firstName lastName), sinon slug(pseudo), sinon
 *       `user-${userId}` (les trois champs de nom sont nullable en DB).
 *
 * ─── ⚠️ Pourquoi slug du nom et pas l'ID numérique (disciplines) ──────────
 *
 * Historiquement le path utilisait `discipline.id`, ce qui divergeait de
 * `buildR2Path` (UI, en slug) et du finder/TreeView (navigation en slug) :
 * les assets sous `cours/3/` devenaient invisibles dans le finder qui
 * cherchait sous `cours/tchoy-lee-fut/`. On aligne donc Cloudinary sur la
 * convention slug, la seule cohérente avec la navigation UI.
 */ const SLUG_OPTIONS = {
    lower: true,
    strict: true
};
function slug(input) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$slugify$40$1$2e$6$2e$9$2f$node_modules$2f$slugify$2f$slugify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(input, SLUG_OPTIONS);
}
async function resolvePendingUploadFolder(params) {
    const { prisma, destination, appRoot, userId } = params;
    /* ── Destination club générique (sans discipline ni catégorie) ── */ if (destination.kind === "general") {
        // Pas de sous-dossier → dépôt à la racine de `general/`.
        if (!destination.folder) {
            return `${appRoot}/pending/general`;
        }
        const folderSlug = slug(destination.folder);
        if (!folderSlug) {
            throw new Error("General folder name must contain at least one slug-friendly character");
        }
        return `${appRoot}/pending/general/${folderSlug}`;
    }
    /* ── Destination événement ── */ if (destination.kind === "event") {
        const event = await prisma.event.findUnique({
            where: {
                id: destination.eventId
            },
            select: {
                id: true,
                slug: true
            }
        });
        if (!event) {
            throw new Error(`Event not found (id=${destination.eventId})`);
        }
        // `Event.slug` est nullable (le temps du backfill) → fallback sur l'id,
        // qui reste stable et unique.
        const eventSlug = event.slug ? slug(event.slug) : `event-${event.id}`;
        return `${appRoot}/pending/events/${eventSlug || `event-${event.id}`}`;
    }
    /* ── Destination personnelle de l'admin (dérivée de userId) ── */ if (destination.kind === "perso") {
        const base = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$resolvePersoBaseFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePersoBaseFolder"])({
            prisma,
            appRoot,
            userId
        });
        // Les photos vivent dans le sous-dossier `photos/` de l'espace perso, pour
        // une structure homogène avec les futures zones R2 (documents/, audio/).
        return `${base}/photos`;
    }
    /* ── Destinations couplées à une discipline (historique) ── */ const category = await prisma.category.findUnique({
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
                categoryId: true,
                name: true
            }
        });
        if (!discipline) {
            throw new Error(`Discipline not found (id=${destination.disciplineId})`);
        }
        if (discipline.categoryId !== destination.categoryId) {
            throw new Error(`Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`);
        }
        // Fallback `disc-${id}` si le nom slugifie en chaîne vide (cas très rare
        // de nom uniquement composé de caractères non transliterables).
        const disciplineSlug = slug(discipline.name) || `disc-${discipline.id}`;
        return `${appRoot}/pending/${categorySegment}/${disciplineSlug}`;
    }
    // kind === "new-discipline"
    const proposedSlug = slug(destination.proposedDisciplineName);
    if (!proposedSlug) {
        throw new Error("Proposed discipline name must contain at least one slug-friendly character");
    }
    return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}
}),
"[project]/packages/backend/src/modules/media/services/countPersoImages.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "countPersoImages",
    ()=>countPersoImages
]);
async function countPersoImages(params) {
    const { prisma, appRoot, userId } = params;
    const grouped = await prisma.mediaAsset.groupBy({
        by: [
            "status"
        ],
        where: {
            appRoot,
            uploaderUserId: userId,
            resourceType: "image",
            status: {
                in: [
                    "pending",
                    "published"
                ]
            },
            fullPath: {
                contains: "/persos/"
            }
        },
        _count: true
    });
    let pending = 0;
    let published = 0;
    for (const row of grouped){
        if (row.status === "pending") {
            pending = row._count;
        } else if (row.status === "published") {
            published = row._count;
        }
    }
    return {
        pending,
        published,
        total: pending + published
    };
}
}),
"[project]/packages/backend/src/modules/media/services/persoPhotoQuota.constants.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Quota d'images de l'espace perso d'un admin.
 *
 * Constante volontaire (pas de modèle DB) : le club est petit, le réglage est
 * global et rarement modifié. Le jour où d'autres réglages arrivent, on
 * introduira une table AppConfig clé-valeur et cette constante en deviendra le
 * défaut. En attendant, ajuster le quota = éditer cette ligne.
 */ __turbopack_context__.s([
    "PERSO_PHOTO_QUOTA",
    ()=>PERSO_PHOTO_QUOTA
]);
const PERSO_PHOTO_QUOTA = 30;
}),
"[project]/packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createUploadSignatures",
    ()=>createUploadSignatures
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$countPersoImages$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/countPersoImages.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/persoPhotoQuota.constants.ts [app-route] (ecmascript)");
;
;
;
;
async function createUploadSignatures(params) {
    const { prisma, appRoot, userId, destination, assets, allowOverwrite } = params;
    // Le dossier perso n'accepte que des images (comme les avatars).
    if (destination.kind === "perso") {
        const hasNonImage = assets.some((asset)=>asset.mediaType !== "image");
        if (hasNonImage) {
            throw new Error("Le dossier perso n'accepte que des images.");
        }
    }
    const folder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePendingUploadFolder"])({
        prisma,
        destination,
        appRoot,
        userId
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const overwrite = allowOverwrite ?? false;
    // ─── Détection de conflit, AVANT tout upload ───────────────────────────
    //
    // Le `publicId` stocké en DB est le publicId COMPLET (Cloudinary préfixe
    // le public_id par le folder à l'upload : `folder/nom`). On calcule donc
    // les publicIds complets prospectifs et on regarde lesquels existent déjà,
    // en une seule requête.
    const fullPublicIdFor = (fileName)=>`${folder}/${fileName.replace(/\.[^/.]+$/, "")}`;
    const existing = await prisma.mediaAsset.findMany({
        where: {
            publicId: {
                in: assets.map((a)=>fullPublicIdFor(a.fileName))
            }
        },
        select: {
            publicId: true
        }
    });
    const existingSet = new Set(existing.map((e)=>e.publicId));
    // ── Enforcement du quota perso (AVANT tout upload) ──
    // Approximation volontaire : les fichiers déjà présents dans le dossier
    // (écrasements) n'augmentent pas le total → on ne compte que le neuf.
    // L'approximation penche du côté permissif (jamais de faux blocage).
    if (destination.kind === "perso") {
        const { total } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$countPersoImages$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countPersoImages"])({
            prisma,
            appRoot,
            userId
        });
        const newCount = assets.length - existing.length;
        if (total + newCount > __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSO_PHOTO_QUOTA"]) {
            throw new Error(`Quota d'images perso atteint (max ${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSO_PHOTO_QUOTA"]}). ` + `Actuel : ${total}. Nouvelles demandées : ${Math.max(0, newCount)}.`);
        }
    }
    return assets.map((asset)=>{
        const publicId = asset.fileName.replace(/\.[^/.]+$/, "");
        const fullPublicId = `${folder}/${publicId}`;
        // ⚠️ La signature Cloudinary couvre TOUS les params envoyés (hors
        // file/api_key/resource_type). On ajoute `overwrite` à la chaîne signée
        // (le tri alphabétique est garanti par `.sort()`), et le client DOIT
        // envoyer la même valeur en FormData.
        const toSign = {
            folder,
            overwrite,
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
            // Renvoyé au client : la valeur signée (à ré-émettre en FormData)…
            overwrite,
            // …et le signal de conflit (le client demandera confirmation avant
            // d'écraser un publicId déjà présent en DB).
            alreadyExists: existingSet.has(fullPublicId),
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Unsupported image mime type: ${mimeType}`
        });
    }
    if (mediaType === "video" && !ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Unsupported video mime type: ${mimeType}`
        });
    }
}
function assertResourceTypeMatchesMimeType(params) {
    const { resourceType, mimeType } = params;
    if (resourceType === "image" && !mimeType.startsWith("image/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Resource type and mime type do not match."
        });
    }
    if (resourceType === "video" && !mimeType.startsWith("video/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
;
function sanitizeBaseName(fileName) {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const sanitized = withoutExtension.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!sanitized) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Invalid file name."
        });
    }
    return sanitized;
}
function assertSafeCloudinaryPath(path, appRoot) {
    if (!path.startsWith(`${appRoot}/pending/`)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Uploads are only allowed under pending."
        });
    }
    if (path.includes("..") || path.includes("/.trash/")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Invalid asset path."
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
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
    // Le dossier perso n'accepte que des images (garde-fou côté persistance —
    // la source de vérité resourceType vient déjà de Cloudinary en amont).
    if (destination.kind === "perso") {
        const hasNonImage = assets.some((asset)=>asset.resourceType !== "image");
        if (hasNonImage) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Le dossier perso n'accepte que des images."
            });
        }
    }
    const expectedFolder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$resolvePendingUploadFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePendingUploadFolder"])({
        prisma,
        destination,
        appRoot,
        userId
    });
    // Les disciplines transmises doivent exister (sinon erreur FK opaque).
    if (destination.kind === "event" && destination.disciplineIds.length > 0) {
        const uniqueIds = [
            ...new Set(destination.disciplineIds)
        ];
        const found = await prisma.discipline.findMany({
            where: {
                id: {
                    in: uniqueIds
                }
            },
            select: {
                id: true
            }
        });
        if (found.length !== uniqueIds.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Discipline(s) introuvable(s) pour cet événement."
            });
        }
    }
    const created = await prisma.$transaction(async (tx)=>{
        // Les disciplines choisies à l'upload ENRICHISSENT l'événement : elles
        // décrivent ce qui a été présenté lors de l'événement, pas chaque photo.
        // `skipDuplicates` → l'enrichissement est idempotent.
        if (destination.kind === "event" && destination.disciplineIds.length > 0) {
            await tx.eventDiscipline.createMany({
                data: [
                    ...new Set(destination.disciplineIds)
                ].map((disciplineId)=>({
                        eventId: destination.eventId,
                        disciplineId
                    })),
                skipDuplicates: true
            });
        }
        const out = [];
        for (const asset of assets){
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$path$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertSafeCloudinaryPath"])(asset.folder, appRoot);
            // Garde-fou d'entrée : cohérence resourceType/mimeType déclarés par le
            // client. Note : la vérité retenue en base vient de Cloudinary
            // (cloudinaryAsset.*), pas de ces valeurs.
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$media$2d$validation$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertResourceTypeMatchesMimeType"])({
                resourceType: asset.resourceType,
                mimeType: asset.mimeType
            });
            if (asset.folder !== expectedFolder) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "FORBIDDEN",
                    message: "Asset folder does not match the authorized pending destination."
                });
            }
            if (!asset.publicId.startsWith(`${expectedFolder}/`)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "FORBIDDEN",
                    message: "Asset publicId does not match the authorized pending destination."
                });
            }
            const cloudinaryAsset = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$readUploadedAssetMetadata$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readUploadedAssetMetadata"])({
                publicId: asset.publicId,
                resourceType: asset.resourceType
            });
            if (cloudinaryAsset.publicId !== asset.publicId) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "PublicId mismatch."
                });
            }
            if (cloudinaryAsset.secureUrl !== asset.secureUrl) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "SecureUrl mismatch."
                });
            }
            const fullPath = `${cloudinaryAsset.publicId}${cloudinaryAsset.format ? "." + cloudinaryAsset.format : ""}`;
            const createdAsset = await tx.mediaAsset.upsert({
                where: {
                    publicId: cloudinaryAsset.publicId
                },
                create: {
                    publicId: cloudinaryAsset.publicId,
                    cloudinaryAssetId: cloudinaryAsset.assetId,
                    secureUrl: cloudinaryAsset.secureUrl,
                    resourceType: cloudinaryAsset.resourceType,
                    // mimeType dérivé de Cloudinary, pas du client.
                    mimeType: cloudinaryAsset.mimeType,
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
                    categoryId: destination.kind === "existing-discipline" || destination.kind === "new-discipline" ? destination.categoryId : null,
                    disciplineId: destination.kind === "existing-discipline" ? destination.disciplineId : null,
                    proposedDisciplineName: destination.kind === "new-discipline" ? destination.proposedDisciplineName : null,
                    eventId: destination.kind === "event" ? destination.eventId : null,
                    eventDate: eventDate ?? null,
                    uploaderUserId: userId,
                    fullPath
                },
                update: {
                    // On rafraîchit ce que le ré-upload change réellement…
                    secureUrl: cloudinaryAsset.secureUrl,
                    cloudinaryAssetId: cloudinaryAsset.assetId,
                    resourceType: cloudinaryAsset.resourceType,
                    // mimeType dérivé de Cloudinary, pas du client.
                    mimeType: cloudinaryAsset.mimeType,
                    format: cloudinaryAsset.format,
                    bytes: cloudinaryAsset.bytes,
                    width: cloudinaryAsset.width,
                    height: cloudinaryAsset.height,
                    duration: cloudinaryAsset.duration,
                    fullPath
                }
            });
            out.push(createdAsset);
        }
        return out;
    });
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const uploadDestinationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("kind", [
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("existing-discipline"),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("new-discipline"),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        proposedDisciplineName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120)
    }),
    // ── Destinations découplées de la discipline (fondation) ──
    // `general` : contenus du club sans discipline ni catégorie. Fait office
    //             d'espace partagé de fait entre admins (pas de permissions :
    //             club petit, confiance).
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("general"),
        // Sous-dossier OPTIONNEL sous `general/` (existant ou créé à la volée).
        // Absent → dépôt à la racine de `general/`.
        folder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional()
    }),
    // `perso`   : espace personnel de l'admin. Aucune identité transportée ici —
    //             le dossier cible est dérivé côté serveur de `ctx.user.id`, si
    //             bien qu'un admin ne peut uploader QUE dans son propre dossier.
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("perso")
    }),
    // `event` : contenus d'un événement (forum des associations, démonstration).
    // L'événement est créé par les admins ; le membre le choisit ici. Les
    // `disciplineIds` ENRICHISSENT les disciplines de l'événement (elles
    // décrivent l'ÉVÉNEMENT, pas chaque photo).
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("event"),
        eventId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        disciplineIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()).default([])
    })
]);
const uploadAssetRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    fileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    mediaType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "image",
        "video"
    ])
});
const createUploadSignaturesSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    destination: uploadDestinationSchema,
    assets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(uploadAssetRequestSchema).min(1).max(20),
    /**
   * Autorise l'écrasement d'un asset existant (même public_id).
   *
   * - absent / false (DÉFAUT) : la signature est calculée avec
   *   `overwrite: false`. Cloudinary REFUSE alors d'écraser un public_id
   *   déjà présent → le binaire d'origine est protégé même si le client
   *   tente l'upload par erreur. C'est le filet "dormir tranquille".
   * - true : signé `overwrite: true`, à n'envoyer qu'APRÈS confirmation
   *   explicite de l'utilisateur (dialogue « Écraser »).
   */ allowOverwrite: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
const registeredAssetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    publicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(500),
    secureUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url(),
    resourceType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "image",
        "video"
    ]),
    originalFileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    displayName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).optional(),
    mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    format: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(50).optional(),
    bytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    width: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    duration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().optional(),
    folder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(500)
});
const registerUploadedAssetsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    destination: uploadDestinationSchema,
    eventDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().optional(),
    assets: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(registeredAssetSchema).min(1).max(20)
});
}),
"[project]/packages/backend/src/modules/cloudinary/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloudinaryRouter",
    ()=>cloudinaryRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "FORBIDDEN",
            message: "Forbidden path."
        });
    }
    if (path.includes("..")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(fromPublicId, toPublicId, {
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
    throw lastError ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(publicId, {
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
    throw lastError ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
                type: "authenticated",
                resource_type: resourceType,
                prefix: fromPrefix,
                max_results: 500,
                next_cursor: nextCursor
            });
            for (const asset of res.resources ?? []){
                const from = asset.public_id;
                const to = from.replace(fromPrefix, toPrefix);
                await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, {
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
    const rows = await db.folder.findMany({
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
            await tx.folder.upsert({
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
            await tx.folder.delete({
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
            userId: ctx.user.id,
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
   */ getFolderTree: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
    deletePicture: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        publicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
   */ renamePicture: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fromPublicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        toPublicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
   */ createFolder: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
   */ renameFolderPrefix: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        fromPrefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        toPrefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
        const impacted = await ctx.prisma.folder.findMany({
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
        const collisions = await ctx.prisma.folder.findMany({
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Folder rename collision: ${collisions.map((c)=>c.fullPath).join(", ")}`
            });
        }
        await ctx.prisma.$transaction(async (tx)=>{
            const ancestors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$utils$2f$folder$2e$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderAncestorsOfFolderPath"])(toPrefix);
            for (const fullPath of ancestors){
                await tx.folder.upsert({
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
                await tx.folder.update({
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
    deleteFolder: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        prefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Deprecated. Use trash.deleteForever (or trash.emptyBin)."
        });
    }),
    deleteSelectionInBin: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
        excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
    })).mutation(async ()=>{
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: "Deprecated. Use trash.deleteForever (by trashIds)."
        });
    }),
    validatePictures: adminProcedure.input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        publicIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).min(1),
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        activity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
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
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(from, to, {
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
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
    const folder = await prisma.folder.findFirst({
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
            //    Donc on supprime les Folder dont le fullPath est dans ce sous-arbre.
            //
            // ⚠️ Le sous-arbre, c'est le dossier LUI-MÊME et ce qui est SOUS LUI —
            // pas tout ce qui commence par les mêmes lettres. Un `startsWith`
            // nu sur `AKFC/pending/cours` emportait aussi les lignes de
            // `AKFC/pending/cours-avance`, qui n'a rien à voir avec lui.
            //
            // C'est exactement la collision de préfixe contre laquelle la ligne
            // ci-dessus se prémunit côté Cloudinary (« trailing slash pour éviter
            // les collisions ») : la protection n'avait pas été portée côté DB. On
            // adopte ici la même forme que `pruneEmptyFolders`, qui la fait bien.
            await prisma.folder.deleteMany({
                where: {
                    appRoot,
                    OR: [
                        {
                            fullPath: normalized
                        },
                        {
                            fullPath: {
                                startsWith: `${normalized}/`
                            }
                        }
                    ]
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
"[project]/packages/backend/src/modules/storage/logicalPath.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * logicalPath.ts — traduction chemin LOGIQUE ↔ chemin PHYSIQUE.
 *
 * ─── Le problème qu'on démonte ────────────────────────────────────────────
 *
 * Historiquement, AKFC encode le statut de cycle de vie d'un asset DANS son
 * chemin : le segment juste après l'appRoot vaut `pending`, `published` ou
 * `bin`. Le chemin est donc la vérité et `MediaAsset.status` n'est qu'un
 * cache dérivé (`statusFromPath`). Conséquence directe : publier un asset
 * oblige à DÉPLACER son binaire chez le provider.
 *
 * Le chantier inverse la dépendance : `MediaAsset.status` devient la source
 * de vérité, publier devient un `UPDATE`, et le binaire ne bouge plus.
 *
 * ─── Ce que fait ce module ────────────────────────────────────────────────
 *
 * Il fournit le vocabulaire de la transition — rien de plus. Deux espaces
 * de chemins coexistent le temps du chantier :
 *
 *   LOGIQUE   ce que voit l'utilisateur      AKFC/cours/tchoy-lee-fut
 *   PHYSIQUE  où vit réellement le binaire   AKFC/pending/cours/tchoy-lee-fut
 *                                            AKFC/published/cours/tchoy-lee-fut
 *
 * ─── La règle de candidature, et pourquoi elle est uniforme ───────────────
 *
 *   candidats(P) = { P , P+pending , P+published }
 *
 * `P` lui-même figure dans la liste, et ce n'est pas un détail : c'est ce
 * qui rend le module compatible avec les DEUX bouts du chantier sans jamais
 * changer de règle.
 *
 *   - Aujourd'hui : `P` ne ramène rien (aucun asset n'est encore à plat),
 *     tout vient des deux candidats à strate.
 *   - Après l'étape 4 (uploads plats) : les nouveaux assets apparaissent via
 *     `P`, les anciens via les strates. Les deux mondes cohabitent, visibles
 *     dans le même dossier logique, sans code conditionnel.
 *   - Après l'étape 5 (migration des binaires) : les candidats à strate ne
 *     ramènent plus rien, `P` ramène tout. Le pliage devient l'identité et
 *     ce module — comme la vue qui l'utilise — peut être SUPPRIMÉ.
 *
 * Ce module est donc conçu pour mourir. Ne rien construire d'autre dessus.
 *
 * ─── La corbeille est hors-jeu ────────────────────────────────────────────
 *
 * `bin` reste un lieu, délibérément : la corbeille garde son système propre
 * (quarantaine physique sous `bin/.trash/<uuid>/` + `TrashEntry` en DB avec
 * `previousPath` pour la restauration). Aucun chemin sous `bin` n'est plié —
 * ce serait détruire l'information dont la restauration a besoin.
 */ /* -------------------------------------------------------------------------- */ /*  Vocabulaire                                                               */ /* -------------------------------------------------------------------------- */ /**
 * Les strates de statut qui sont PLIÉES par ce module.
 *
 * `bin` en est volontairement absent (cf. en-tête) : il reste un lieu réel.
 */ __turbopack_context__.s([
    "BIN_SEGMENT",
    ()=>BIN_SEGMENT,
    "FOLDABLE_STATUS_SEGMENTS",
    ()=>FOLDABLE_STATUS_SEGMENTS,
    "isBinPath",
    ()=>isBinPath,
    "isFoldedStratumPath",
    ()=>isFoldedStratumPath,
    "isUnderAppRoot",
    ()=>isUnderAppRoot,
    "physicalCandidates",
    ()=>physicalCandidates,
    "physicalResolutionOrder",
    ()=>physicalResolutionOrder,
    "stratumSegmentOf",
    ()=>stratumSegmentOf,
    "toLogicalPath",
    ()=>toLogicalPath,
    "toPhysicalPath",
    ()=>toPhysicalPath
]);
const FOLDABLE_STATUS_SEGMENTS = [
    'pending',
    'published'
];
const BIN_SEGMENT = 'bin';
function segmentsOf(path) {
    return path.split('/').filter(Boolean);
}
function isFoldable(segment) {
    return FOLDABLE_STATUS_SEGMENTS.includes(segment ?? '');
}
function isUnderAppRoot(path, appRoot) {
    const rootParts = segmentsOf(appRoot);
    const parts = segmentsOf(path);
    if (parts.length < rootParts.length) return false;
    return rootParts.every((seg, i)=>parts[i] === seg);
}
function stratumSegmentOf(path, appRoot) {
    if (!isUnderAppRoot(path, appRoot)) return null;
    const segment = segmentsOf(path)[segmentsOf(appRoot).length];
    if (isFoldable(segment)) return segment;
    return segment === BIN_SEGMENT ? BIN_SEGMENT : null;
}
function isBinPath(path, appRoot) {
    return stratumSegmentOf(path, appRoot) === BIN_SEGMENT;
}
function isFoldedStratumPath(path, appRoot) {
    if (!isUnderAppRoot(path, appRoot)) return false;
    const rootLength = segmentsOf(appRoot).length;
    const parts = segmentsOf(path);
    return parts.length === rootLength + 1 && isFoldable(parts[rootLength]);
}
function toLogicalPath(physicalPath, appRoot) {
    const stratum = stratumSegmentOf(physicalPath, appRoot);
    if (stratum === null || stratum === BIN_SEGMENT) return physicalPath;
    const parts = segmentsOf(physicalPath);
    parts.splice(segmentsOf(appRoot).length, 1);
    return parts.join('/');
}
function toPhysicalPath(logicalPath, appRoot, status) {
    // Normalisation défensive : si on nous passe déjà un chemin physique, on
    // le ramène d'abord en logique pour ne pas empiler deux strates.
    const logical = toLogicalPath(logicalPath, appRoot);
    if (!isUnderAppRoot(logical, appRoot)) return logical;
    if (isBinPath(logical, appRoot)) return logical;
    const parts = segmentsOf(logical);
    parts.splice(segmentsOf(appRoot).length, 0, status);
    return parts.join('/');
}
function physicalCandidates(logicalPath, appRoot) {
    const logical = toLogicalPath(logicalPath, appRoot);
    if (!isUnderAppRoot(logical, appRoot)) return [
        logical
    ];
    if (isBinPath(logical, appRoot)) return [
        logical
    ];
    return [
        logical,
        ...FOLDABLE_STATUS_SEGMENTS.map((status)=>toPhysicalPath(logical, appRoot, status))
    ];
}
function physicalResolutionOrder(path, appRoot) {
    const candidates = physicalCandidates(path, appRoot);
    return [
        path,
        ...candidates.filter((candidate)=>candidate !== path)
    ];
}
}),
"[project]/packages/backend/src/modules/storage/resolvePhysicalLocations.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolvePhysicalLocations",
    ()=>resolvePhysicalLocations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/logicalPath.ts [app-route] (ecmascript)");
;
async function resolvePhysicalLocations(params) {
    const { prisma, appRoot, paths } = params;
    const resolved = new Map();
    const candidatesByPath = new Map();
    for (const path of paths){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stratumSegmentOf"])(path, appRoot) !== null) {
            resolved.set(path, [
                path
            ]);
            continue;
        }
        candidatesByPath.set(path, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["physicalCandidates"])(path, appRoot));
    }
    if (candidatesByPath.size === 0) return resolved;
    const allCandidates = [
        ...new Set([
            ...candidatesByPath.values()
        ].flat())
    ];
    const [folders, assets] = await Promise.all([
        prisma.folder.findMany({
            where: {
                appRoot,
                fullPath: {
                    in: allCandidates
                }
            },
            select: {
                fullPath: true
            }
        }),
        prisma.mediaAsset.findMany({
            where: {
                appRoot,
                fullPath: {
                    in: allCandidates
                }
            },
            select: {
                fullPath: true
            }
        })
    ]);
    const existing = new Set([
        ...folders.map((row)=>row.fullPath),
        ...assets.map((row)=>row.fullPath)
    ]);
    for (const [path, candidates] of candidatesByPath){
        const found = candidates.filter((candidate)=>existing.has(candidate));
        if (found.length === 0) {
            throw new Error(`[resolvePhysicalLocations] Aucun emplacement connu pour "${path}". ` + `Ni le registre Folder ni MediaAsset ne connaissent aucun de : ` + `${candidates.join(", ")}. Le finder affiche un item que la DB ignore.`);
        }
        resolved.set(path, found);
    }
    return resolved;
}
}),
"[project]/packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pruneEmptyFolders",
    ()=>pruneEmptyFolders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
;
;
/**
 * pruneEmptyFolders.service.ts
 *
 * Supprime du registre DB (`Folder`) les dossiers source devenus vides
 * après un move Cloudinary.
 *
 * ─── Pourquoi c'est nécessaire ─────────────────────────────────────────────
 *
 * Les dossiers Cloudinary d'AKFC n'existent pas comme entités propres : ils
 * sont dérivés des préfixes de public_id, et `getCloudinaryFolderTree` les
 * persiste dans la table `Folder` (placeholders) pour pouvoir afficher les
 * dossiers vides. `move.service` renomme les ASSETS mais ne touche jamais
 * cette table. Quand on déplace tout le contenu d'un dossier (typiquement un
 * changement de statut), ses assets partent ailleurs mais sa ligne `Folder`
 * reste — d'où le "dossier fantôme" qui survit dans la vue source.
 *
 * Ce service prune ces lignes orphelines : en partant du dossier le plus
 * profond touché par le move, il remonte tant que le préfixe ne contient
 * plus AUCUN asset Cloudinary, et s'arrête au dossier-statut (jamais supprimé).
 *
 * ─── Pourquoi vérifier Cloudinary et pas la DB ─────────────────────────────
 *
 * L'autorité sur "reste-t-il un asset ici ?" est Cloudinary lui-même (les
 * assets viennent d'y être renommés). `move.service` a déjà invalidé le cache
 * resources, donc `api.resources({ prefix })` reflète l'état réel.
 *
 * Strictement Cloudinary : R2 n'utilise pas la table `Folder`. Appelé
 * uniquement depuis le `move` de l'adapter Cloudinary.
 */ const RESOURCE_TYPES = [
    "image",
    "video",
    "raw"
];
/** Reste-t-il au moins un asset Cloudinary STRICTEMENT sous ce dossier ? */ async function folderHasAssets(folderPath) {
    // Slash final : évite qu'un sibling `cours-avance` fasse croire que
    // `cours` est non-vide (Cloudinary matche par préfixe de chaîne).
    const prefix = `${folderPath}/`;
    for (const rt of RESOURCE_TYPES){
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
            type: "authenticated",
            resource_type: rt,
            prefix,
            max_results: 1
        });
        if (res.resources.length > 0) return true;
    }
    return false;
}
async function pruneEmptyFolders(params) {
    const { prisma, appRoot, startFolderPath } = params;
    // Borne basse : on ne supprime jamais le dossier-statut `${appRoot}/<status>`
    // ni au-dessus. Le statut est le segment juste après l'appRoot, donc on
    // s'arrête dès que le path n'est pas STRICTEMENT plus profond que lui.
    const minDepth = appRoot.split("/").length + 1;
    let folderPath = startFolderPath;
    while(folderPath.split("/").length > minDepth){
        // Un asset encore présent (ici ou dans un sous-dossier voisin non vidé)
        // ⇒ ni ce dossier ni ses ancêtres ne sont vides. On arrête.
        if (await folderHasAssets(folderPath)) break;
        // Supprime la ligne Folder du dossier ET DE TOUS SES DESCENDANTS.
        // La suppression Cloudinary (deleteCloudinaryFolderRecursive) est
        // récursive ; le nettoyage base doit l'être aussi, sinon les lignes
        // Folder des sous-dossiers (ex. `.../cours/taolu-multi-styles`)
        // survivent alors que le finder bâtit son arbre sur cette table →
        // dossier fantôme en base bien que Cloudinary soit propre
        // (cause exacte du fantôme « premier dossier », 2026-07-03).
        await prisma.folder.deleteMany({
            where: {
                appRoot,
                OR: [
                    {
                        fullPath: folderPath
                    },
                    {
                        fullPath: {
                            startsWith: `${folderPath}/`
                        }
                    }
                ]
            }
        });
        // L'entité DOSSIER Cloudinary survit au départ de ses assets (les
        // folders sont des objets à part — cf. cloudinary.service.ts) et le
        // finder bâtit son arbre sur `api.sub_folders` : sans suppression, un
        // dossier fantôme persiste côté source après un move.
        //
        // ⚠ On supprime RÉCURSIVEMENT (deleteCloudinaryFolderRecursive) et non
        // via `delete_folder` simple : ce dossier peut encore contenir des
        // SOUS-DOSSIERS vidés de leurs fichiers mais jamais supprimés (ex.
        // `pending/cours` gardant `pending/cours/taolu-multi-styles` après un
        // move) — et `delete_folder` refuse un dossier non vide (bug fantôme
        // du changement de statut, 2026-07-03). La fonction récursive est
        // tolérante (dossier absent = no-op).
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteCloudinaryFolderRecursive"])(folderPath);
        folderPath = folderPath.split("/").slice(0, -1).join("/");
    }
}
}),
"[project]/packages/backend/src/modules/trash/services/restoreFromBin.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "restoreFromBin",
    ()=>restoreFromBin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts [app-route] (ecmascript)");
;
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
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
    await prisma.$transaction(unique.map((fullPath)=>prisma.folder.upsert({
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
    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.rename(fromPublicId, toPublicId, {
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
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].api.resources({
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
        const folder = await prisma.folder.findFirst({
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
        // ─── La quarantaine vient d'être vidée : elle doit mourir ──────────
        //
        // `trashToBin` fait le ménage à l'aller (il supprime les lignes `Folder`
        // du dossier source). Personne ne le faisait au retour : les assets
        // sortent du wrapper `bin/.trash/<uuid>`, et sa ligne `Folder` survit.
        // Le finder bâtissant son arbre sur cette table, un chevron persistait
        // sur une corbeille visuellement vide.
        //
        // On ne passe pas par `adapter.move` (ce service renomme en direct),
        // donc le prune de l'adapter ne s'est jamais déclenché ici. On l'appelle
        // nous-mêmes.
        //
        // `pruneEmptyFolders` vérifie auprès de Cloudinary qu'aucun asset ne
        // subsiste avant de supprimer un palier, puis remonte : le wrapper, puis
        // `.trash` s'il ne reste plus rien, et s'arrête sur `${appRoot}/bin` que
        // sa borne `minDepth` protège.
        const wrapperPath = kind === "folder" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(entry.storageRoot) : // dossier est son parent. Peu importe si on démarre plus profond
        // que le wrapper, le prune remonte.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(entry.storageRoot).split("/").slice(0, -1).join("/");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneEmptyFolders"])({
            prisma,
            appRoot,
            startFolderPath: wrapperPath
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
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
            // ─── Tolérance aux assets orphelins ──────────────────────────────────
            //
            // Une TrashEntry peut être "orpheline" : la ligne DB existe mais
            // l'asset Cloudinary à `storageRoot` a déjà disparu (suppression
            // manuelle via dashboard, échec de move précédent, anciens artefacts
            // du refacto storage…). Dans ces cas, `getAssetInfo` lance
            // `Asset not found (any resource_type): <path>` et plantait tout le
            // batch — empêchant en particulier le "Vider la corbeille" de
            // s'exécuter.
            //
            // Politique : on **considère l'orphelin comme déjà supprimé**, on log
            // et on continue. La TrashEntry DB est mise à jour normalement
            // (status=DELETED) ce qui purge l'orpheline et débloque le flow.
            //
            // Cette tolérance est sûre : `deleteForever` est par nature
            // destructive et idempotente côté résultat (l'asset doit ne plus
            // exister à la fin) — donc un asset déjà absent est un état
            // intermédiaire acceptable.
            try {
                const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(entry.storageRoot);
                await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(entry.storageRoot, {
                    type: "authenticated",
                    resource_type: info.resource_type
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                if (message.startsWith("Asset not found")) {
                    console.warn(`[deleteForever] Orphan TrashEntry (asset already gone): id=${entry.id} path=${entry.storageRoot}`);
                // continue : on supprime la ligne DB ci-dessous
                } else {
                    throw err;
                }
            }
        } else {
            // Folder: supprime tout sous `${storageRoot}/`
            // (les assets n'existent pas comme dossiers réels)
            // `deleteByPrefix` est déjà tolérant : si rien n'existe sous le
            // préfixe, Cloudinary renvoie un dict vide sans erreur. Pas besoin
            // de try/catch ici.
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
"[project]/packages/backend/src/modules/trash/services/purge.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "purge",
    ()=>purge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cloudinary$2e$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cloudinary.client.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/cloudinary@2.10.0/node_modules/cloudinary/cloudinary.js [app-route] (ecmascript) <export v2 as cloudinary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/cache/resourcesCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts [app-route] (ecmascript)");
;
;
;
;
;
async function purge(params) {
    const { prisma, input } = params;
    const { appRoot } = input;
    // ─── Étape 1 : dériver les wrapper paths uniques ─────────────────────
    //
    // Chaque path utilisateur est ramené à son wrapper `${appRoot}/bin/.trash/<uuid>`.
    // Pour ça, on cherche le pattern `/bin/.trash/<uuid>` et on tronque
    // tout ce qui suit. Si le pattern n'est pas trouvé, le path n'est pas
    // dans la trash storage → on refuse (garde-fou).
    const wrapperPaths = new Set();
    const wrapperRegex = /^(.+\/bin\/\.trash\/[^/]+)(?:\/.*)?$/;
    for (const path of input.paths){
        const match = path.match(wrapperRegex);
        if (!match) {
            throw new Error(`purge: path is not in trash storage (expected '${appRoot}/bin/.trash/<uuid>...'): ${path}`);
        }
        const wrapper = match[1];
        // Double-check : le wrapper doit aussi être sous APP_ROOT/bin attendu.
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTrashStoragePath"])(appRoot, wrapper)) {
            throw new Error(`purge: refusing path outside trash storage of appRoot='${appRoot}': ${wrapper}`);
        }
        wrapperPaths.add(wrapper);
    }
    const purged = [];
    const vestiges = [];
    // ─── Étape 2 : pour chaque wrapper, dispatch entry / vestige ─────────
    for (const wrapperPath of wrapperPaths){
        const entry = await prisma.trashEntry.findFirst({
            where: {
                appRoot,
                storageRoot: wrapperPath,
                status: "IN_BIN"
            },
            select: {
                id: true,
                kind: true,
                storageRoot: true
            }
        });
        if (entry) {
            // ─── Flow standard (DB-backed) ─────────────────────────────────
            if (entry.kind === "file") {
                // Même tolérance que dans deleteForever.service.ts : si l'asset
                // a déjà disparu (corruption silencieuse), on continue et on
                // marque la TrashEntry comme DELETED pour purger l'orpheline.
                try {
                    const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(entry.storageRoot);
                    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$cloudinary$40$2$2e$10$2e$0$2f$node_modules$2f$cloudinary$2f$cloudinary$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__v2__as__cloudinary$3e$__["cloudinary"].uploader.destroy(entry.storageRoot, {
                        type: "authenticated",
                        resource_type: info.resource_type
                    });
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    if (!message.startsWith("Asset not found")) throw err;
                    console.warn(`[purge] Orphan asset (already gone), keeping entry purge: id=${entry.id} path=${entry.storageRoot}`);
                }
            } else {
                // kind === "folder" : on supprime tout sous le préfixe.
                // deleteByPrefix est déjà tolérant (dict vide si rien).
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
        } else {
            // ─── Flow vestige (no-DB) ──────────────────────────────────────
            //
            // Pas de TrashEntry : c'est un fragment Cloudinary orphelin. On le
            // supprime physiquement. On utilise `deleteByPrefix` qui couvre les
            // deux cas (asset unique ou arborescence) et ne lance pas si rien
            // n'existe.
            console.warn(`[purge] Vestige (no TrashEntry, physical purge): ${wrapperPath}`);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteByPrefix"])(`${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(wrapperPath)}/`);
            vestiges.push(wrapperPath);
        }
        // ─── Le wrapper est vide : sa ligne `Folder` n'a plus rien à décrire ──
        //
        // Même raison que dans `restoreFromBin` : `purge` supprime en direct et
        // ne passe donc pas par le prune de l'adapter Cloudinary. Sans ça, la
        // quarantaine purgée laisse une ligne `Folder` orpheline, et le finder —
        // qui bâtit son arbre sur cette table — garde un chevron sur une
        // corbeille vide.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneEmptyFolders"])({
            prisma,
            appRoot,
            startFolderPath: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizePath"])(wrapperPath)
        });
        purged.push(wrapperPath);
    }
    // 🔁 Invalidation finale (cf. note dans deleteForever.service.ts).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$cache$2f$resourcesCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["invalidate"])();
    return {
        purged,
        vestiges
    };
}
}),
"[project]/packages/backend/src/modules/trash/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "trashRouter",
    ()=>trashRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$listBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/listBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$readTrashFolder$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/readTrashFolder.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$trashToBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/trashToBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolvePhysicalLocations$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/resolvePhysicalLocations.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$restoreFromBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/restoreFromBin.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$deleteForever$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/deleteForever.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$purge$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/trash/services/purge.service.ts [app-route] (ecmascript)");
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
const listBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    cursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).nullable().optional(),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(100).optional(),
    search: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).optional()
});
const readTrashFolderInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    trashId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    relativePath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
const trashToBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    sources: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("folder"),
            fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("file"),
            fullPath: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("selection"),
            roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
        })
    ])).min(1),
    /**
   * Les `fullPath` / `roots` ci-dessus sont exprimés en chemins LOGIQUES
   * (cf. le flag `logical` du router storage).
   *
   * Un appelant qui lit le finder en vue pliée DOIT lever ce flag ici : les
   * chemins de DOSSIER qu'il détient n'ont pas d'emplacement physique unique
   * (un dossier logique vit dans 1..N strates). Les chemins de FICHIER, eux,
   * sont déjà physiques — `FinderNode.id` porte le `storagePath` — et la
   * projection les laisse passer sans requête.
   *
   * Baissé (le défaut), rien ne change.
   */ logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
});
/**
 * Redescend les sources de mise en corbeille dans l'espace physique.
 *
 * Jeter le dossier logique `AKFC/cours/x`, c'est jeter la copie en attente
 * ET la copie publiée : deux vrais dossiers, donc deux `TrashEntry`, donc
 * deux restaurations possibles vers leurs `previousPath` respectifs. Le
 * schema accepte déjà un TABLEAU de sources — il n'y a donc rien à
 * regrouper et aucune cible à projeter. C'est nettement plus simple que le
 * cas du move.
 *
 * La corbeille elle-même n'est pas concernée par le pliage : `bin` reste un
 * lieu (quarantaine physique + `TrashEntry.previousPath`), et les chemins
 * qui sont déjà dedans traversent intacts. Ce qui est projeté ici, c'est
 * l'ENTRÉE en corbeille, pas son contenu.
 *
 * Transitoire : à l'étape 5 du chantier, la projection devient l'identité et
 * cette fonction se supprime avec le reste du pliage.
 */ async function toPhysicalTrashSources(params) {
    const { prisma, appRoot, sources } = params;
    const paths = sources.flatMap((source)=>source.kind === "selection" ? source.roots : [
            source.fullPath
        ]);
    const locations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolvePhysicalLocations$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePhysicalLocations"])({
        prisma,
        appRoot,
        paths
    });
    const physical = (path)=>locations.get(path) ?? [
            path
        ];
    return sources.flatMap((source)=>{
        if (source.kind === "selection") {
            return [
                {
                    kind: "selection",
                    roots: source.roots.flatMap(physical)
                }
            ];
        }
        return physical(source.fullPath).map((fullPath)=>({
                kind: source.kind,
                fullPath
            }));
    });
}
const restoreFromBinInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    ids: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
});
const deleteForeverInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    ids: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
});
// `purge` accepte des **paths Cloudinary** (pas des TrashEntry ids) sous
// `${appRoot}/bin/.trash/...`. Voir purge.service.ts pour la motivation
// (gestion des vestiges absents en DB).
const purgeInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    paths: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1)
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
        const sources = input.logical ? await toPhysicalTrashSources({
            prisma: ctx.prisma,
            appRoot: input.appRoot,
            sources: input.sources
        }) : input.sources;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$trashToBin$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trashToBin"])({
            prisma: ctx.prisma,
            input: {
                ...input,
                sources
            }
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
    }),
    purge: adminProcedure.input(purgeInputSchema).mutation(async ({ ctx, input })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$services$2f$purge$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["purge"])({
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const permission = await ctx.prisma.permission.findUnique({
            where: {
                id: input.id
            }
        });
        if (!permission) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Permission not found"
            });
        }
        return permission;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.permission.findUnique({
            where: {
                name: input.name
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        const linked = await ctx.prisma.rolePermissions.count({
            where: {
                permissionId: input.id
            }
        });
        if (linked > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    assignToRole: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        permissionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
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
    removeFromRole: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_permissions")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        permissionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        roleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).query(async ({ ctx, input })=>{
        const category = await ctx.prisma.category.findUnique({
            where: {
                id: input.id
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Category not found"
            });
        }
        return category;
    }),
    getByType: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(async ({ ctx, input })=>{
        const category = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Category not found"
            });
        }
        return category;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (exists) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ ctx, input })=>{
        const exists = await ctx.prisma.category.findUnique({
            where: {
                type: input.type
            }
        });
        if (exists && exists.id !== input.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_categories")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
    })).mutation(async ({ ctx, input })=>{
        // Garde : on refuse la suppression tant que des entités y sont
        // rattachées (categoryId est obligatoire sur Discipline → un delete
        // sec lèverait un P2003 brut). Message explicite pour que l'admin
        // sache quoi réassigner d'abord.
        const [disciplineCount, mediaCount] = await Promise.all([
            ctx.prisma.discipline.count({
                where: {
                    categoryId: input.id
                }
            }),
            ctx.prisma.mediaAsset.count({
                where: {
                    categoryId: input.id
                }
            })
        ]);
        if (disciplineCount > 0 || mediaCount > 0) {
            const parts = [];
            if (disciplineCount > 0) {
                parts.push(`${disciplineCount} discipline(s)`);
            }
            if (mediaCount > 0) {
                parts.push(`${mediaCount} média(s)`);
            }
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Cette catégorie est encore utilisée par ${parts.join(" et ")}. Réassignez-les avant de la supprimer.`
            });
        }
        return ctx.prisma.category.delete({
            where: {
                id: input.id
            }
        });
    })
});
const __TURBOPACK__default__export__ = categoryRouter;
}),
"[project]/packages/contracts/src/shared/prosemirror.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "proseMirrorContentSchema",
    ()=>proseMirrorContentSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const proseMirrorContentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown());
}),
"[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emptyPageContentV1",
    ()=>emptyPageContentV1,
    "pageBlockSchemaV1",
    ()=>pageBlockSchemaV1,
    "pageContentSchemaV1",
    ()=>pageContentSchemaV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/shared/prosemirror.ts [app-route] (ecmascript)");
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
/* -------------------------------------------------------------------------- */ /*  Base commune                                                              */ /* -------------------------------------------------------------------------- */ const blockBaseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    /**
   * Identifiant stable du bloc à l'intérieur de la page.
   *
   * Généré côté builder (cuid recommandé pour cohérence avec le reste du
   * projet), il sert de clé React, de cible de focus/scroll au mount,
   * et de point d'ancrage pour le drag-and-drop.
   *
   * N'est PAS l'identifiant d'un asset — c'est l'identifiant du bloc
   * lui-même au sein de la page.
   */ id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
/* -------------------------------------------------------------------------- */ /*  Bloc tiptap                                                               */ /* -------------------------------------------------------------------------- */ const tiptapBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("tiptap"),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"]
});
/* -------------------------------------------------------------------------- */ /*  Bloc image-gallery                                                        */ /* -------------------------------------------------------------------------- */ const imageGalleryLayoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "grid",
    "carousel",
    "masonry"
]);
const imageGalleryBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("image-gallery"),
    /**
   * Liste des images de la galerie.
   *
   * Volontairement non `.min(1)` : un bloc fraîchement ajouté par le
   * builder peut être vide le temps que l'utilisateur sélectionne ses
   * premières images via le MediaPicker. La cohérence "non vide à la
   * publication" est une décision UX, pas une décision de schema —
   * elle pourra être imposée en amont du save par le builder ou par
   * une validation côté admin si nécessaire.
   */ items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })),
    layout: imageGalleryLayoutSchema.default("grid")
});
/* -------------------------------------------------------------------------- */ /*  Bloc audio-collection                                                     */ /* -------------------------------------------------------------------------- */ const audioCollectionBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("audio-collection"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Titre affiché à la place du nom de fichier brut. */ title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    }))
});
/* -------------------------------------------------------------------------- */ /*  Bloc document-list                                                        */ /* -------------------------------------------------------------------------- */ const documentListBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("document-list"),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        /** Libellé du lien (à défaut, on retombe sur le nom de fichier). */ label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
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
 */ /** Média issu de la bibliothèque (MediaAsset). */ const libraryMediaItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("library").default("library"),
    mediaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
/**
 * Référence LOGIQUE à l'avatar d'un utilisateur (pas au binaire). Résolue
 * dynamiquement au rendu : la page affiche toujours l'avatar COURANT du user
 * — pas de copie, pas de synchro, pas de dérive. Si le user change d'avatar,
 * la page suit automatiquement.
 */ const avatarMediaItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("avatar"),
    userId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    caption: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
/**
 * Média d'un bloc media-text : soit un média de bibliothèque, soit une
 * référence avatar. Discriminé par `kind`. L'ancien format (objet
 * `{ mediaId }` sans `kind`) est traité comme `library` par le preprocess.
 */ const mediaTextItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("kind", [
    libraryMediaItemSchema,
    avatarMediaItemSchema
]);
const mediaTextBlockSchema = blockBaseSchema.extend({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal("media-text"),
    /** Texte riche optionnel (ProseMirror). Absent/vide → côté texte masqué. */ content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"].optional(),
    /**
   * UN SEUL média optionnel : média de bibliothèque OU référence avatar.
   * Absent → côté médias masqué.
   *
   * Compat : preprocess tolérant — (1) un ancien TABLEAU est réduit à son
   * premier élément ; (2) un objet SANS `kind` (ancien format média
   * bibliothèque) reçoit `kind: "library"`.
   */ media: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>{
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
const pageBlockSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion("type", [
    tiptapBlockSchema,
    imageGalleryBlockSchema,
    audioCollectionBlockSchema,
    documentListBlockSchema,
    mediaTextBlockSchema
]);
const pageContentSchemaV1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal(1),
    blocks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(pageBlockSchemaV1)
});
function emptyPageContentV1() {
    return {
        version: 1,
        blocks: []
    };
}
}),
"[project]/packages/contracts/src/page/extractMediaIds.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/contracts/src/page/resolvedMedia.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/contracts/src/page/parseContent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePageContentV1",
    ()=>parsePageContentV1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
;
function parsePageContentV1(raw) {
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].safeParse(raw);
    return result.success ? result.data : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emptyPageContentV1"])();
}
}),
"[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/extractMediaIds.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$resolvedMedia$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/resolvedMedia.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$parseContent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/parseContent.ts [app-route] (ecmascript)");
;
;
;
;
}),
"[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "syncPageMediaReferences",
    ()=>syncPageMediaReferences
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/extractMediaIds.ts [app-route] (ecmascript)");
;
;
async function syncPageMediaReferences(tx, args) {
    const { pageType, pageId, newContent } = args;
    /* ─── 1. Lecture des références anciennes ─────────────────────────── */ const oldRows = await tx.pageMediaReference.findMany({
        where: {
            pageType,
            pageId
        },
        select: {
            mediaAssetId: true
        }
    });
    const oldRefs = new Set(oldRows.map((r)=>r.mediaAssetId));
    /* ─── 2. Cas "delete" : on supprime tout et on s'arrête ───────────── */ if (newContent === null) {
        if (oldRefs.size === 0) {
            return {
                added: [],
                removed: []
            };
        }
        await tx.pageMediaReference.deleteMany({
            where: {
                pageType,
                pageId
            }
        });
        return {
            added: [],
            removed: [
                ...oldRefs
            ]
        };
    }
    /* ─── 3. Cas "save" : calcul du diff ──────────────────────────────── */ const newRefs = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$extractMediaIds$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractMediaIdsFromContent"])(newContent));
    const toRemove = [
        ...oldRefs
    ].filter((id)=>!newRefs.has(id));
    const toAdd = [
        ...newRefs
    ].filter((id)=>!oldRefs.has(id));
    /* ─── 4. Validation des nouvelles refs ────────────────────────────── */ if (toAdd.length > 0) {
        const validAssets = await tx.mediaAsset.findMany({
            where: {
                id: {
                    in: toAdd
                },
                status: 'published'
            },
            select: {
                id: true
            }
        });
        const validIds = new Set(validAssets.map((a)=>a.id));
        const invalid = toAdd.filter((id)=>!validIds.has(id));
        if (invalid.length > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: 'BAD_REQUEST',
                message: `Le composite référence ${invalid.length} mediaId(s) qui n'existent pas ` + `ou qui ne sont pas en 'published'. Ids fautifs : ${invalid.join(', ')}.`,
                cause: {
                    invalidMediaIds: invalid
                }
            });
        }
    }
    /* ─── 5. Application du diff ──────────────────────────────────────── */ if (toRemove.length > 0) {
        await tx.pageMediaReference.deleteMany({
            where: {
                pageType,
                pageId,
                mediaAssetId: {
                    in: toRemove
                }
            }
        });
    }
    if (toAdd.length > 0) {
        await tx.pageMediaReference.createMany({
            data: toAdd.map((mediaAssetId)=>({
                    mediaAssetId,
                    pageType,
                    pageId
                }))
        });
    }
    return {
        added: toAdd,
        removed: toRemove
    };
}
}),
"[project]/packages/backend/src/modules/courses/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "courseRouter",
    ()=>courseRouter,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
;
;
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
 *
 * ─── Composite de page et intégrité référentielle ────────────────────────
 *
 * Le champ `content` n'est plus un `z.json()` opaque mais un
 * `pageContentSchemaV1` typé — la silhouette d'un composite de blocs
 * définie au sous-chantier 1. Toute mutation qui touche ce champ
 * (create, update avec content fourni, delete) s'exécute désormais dans
 * une transaction qui appelle `syncPageMediaReferences` pour maintenir
 * la table `PageMediaReference` à jour.
 *
 * Conséquences :
 *   - Si le composite référence un mediaId qui n'existe pas ou qui n'est
 *     pas en `published`, la mutation roll-back avec un BAD_REQUEST
 *     précis (cf. `syncPageMediaReferences`).
 *   - Si la mutation parente (course.create/update) plante pour une
 *     autre raison (P2002 par exemple), la sync ne s'exécute pas — c'est
 *     le contrat de la transaction.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const dayEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
]);
const audienceEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "KIDS",
    "TEENAGERS",
    "ADULTS",
    "ALL_AGES"
]);
/**
 * `beginTime` / `endTime` au format **HHMM** — entier compact où les
 * deux derniers digits sont les minutes, les autres les heures.
 *   - 0    = 00:00
 *   - 905  = 09:05
 *   - 1830 = 18:30
 *   - 2359 = 23:59
 *
 * La `.refine()` rejette les valeurs structurellement invalides comme
 * `1860` (60 minutes inexistantes) que `max(2359)` laisserait passer.
 * Pas de timezone — heure locale du club.
 */ const hhmmSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(2359).refine((v)=>v % 100 < 60, {
    message: "Minutes part must be 0-59 (e.g. 1860 is not a valid time)."
});
const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    audience: audienceEnum,
    day: dayEnum,
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).nullable().optional(),
    requisites: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)).default([]),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"]
}).refine((data)=>data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    audience: audienceEnum.optional(),
    day: dayEnum.optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).nullable().optional(),
    requisites: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)).optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional()
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
   */ getAllByDiscipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const course = await ctx.prisma.course.findUnique({
            where: {
                id: input.id
            }
        });
        if (!course) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Course not found."
            });
        }
        return course;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(createInput).mutation(async ({ ctx, input })=>{
        // ─── Validations pré-transaction (lectures simples) ────────────────
        //
        // On fait ces lectures hors transaction pour ne pas tenir un lock
        // pendant le temps qu'elles prennent. Les inserts qui suivent sont
        // tous dans une transaction commune.
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline not found (id=${input.disciplineId}).`
            });
        }
        if (discipline.category.type !== "Cours") {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Discipline ${input.disciplineId} is not in the "Cours" category.`
            });
        }
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
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${input.instructorId}).`
                });
            }
        }
        // ─── Transaction : create course + sync references ─────────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let created;
            try {
                created = await tx.course.create({
                    data: {
                        disciplineId: input.disciplineId,
                        audience: input.audience,
                        day: input.day,
                        beginTime: input.beginTime,
                        endTime: input.endTime,
                        instructorId: input.instructorId ?? null,
                        requisites: input.requisites,
                        content: input.content
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A course already exists at this discipline/day/beginTime/audience."
                    });
                }
                throw err;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "COURSE",
                pageId: String(created.id),
                newContent: input.content
            });
            return created;
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        // ─── Validation pré-transaction (instructeur) ──────────────────────
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
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${rest.instructorId}).`
                });
            }
        }
        // ─── Transaction : update course + sync references si content fourni
        return await ctx.prisma.$transaction(async (tx)=>{
            let updated;
            try {
                const data = {
                    audience: rest.audience,
                    day: rest.day,
                    beginTime: rest.beginTime,
                    endTime: rest.endTime,
                    instructorId: rest.instructorId,
                    requisites: rest.requisites,
                    content: rest.content === undefined ? undefined : rest.content
                };
                updated = await tx.course.update({
                    where: {
                        id
                    },
                    data
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                    if (err.code === "P2002") {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "CONFLICT",
                            message: "A course already exists at this discipline/day/beginTime/audience."
                        });
                    }
                    if (err.code === "P2025") {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "NOT_FOUND",
                            message: "Course not found."
                        });
                    }
                }
                throw err;
            }
            // La sync n'est appelée que si l'update a effectivement touché au
            // content. Si l'admin met juste à jour `audience` ou `requisites`,
            // les références médias n'ont pas changé.
            if (rest.content !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "COURSE",
                    pageId: String(id),
                    newContent: rest.content
                });
            }
            return updated;
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_courses")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        return await ctx.prisma.$transaction(async (tx)=>{
            // On nettoie les références AVANT le delete du Course, pour ne
            // pas laisser de rows orphelines dans `PageMediaReference` (qui
            // n'a pas de FK DB sur `pageId` — c'est l'application qui tient
            // l'intégrité côté référenceur, cf. PATCH-schema.md).
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "COURSE",
                pageId: String(input.id),
                newContent: null
            });
            try {
                return await tx.course.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Course not found."
                    });
                }
                throw err;
            }
        });
    })
});
const __TURBOPACK__default__export__ = courseRouter;
}),
"[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "slugSchema",
    ()=>slugSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const slugSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with single hyphens (no leading/trailing hyphen)."
});
}),
"[project]/packages/backend/src/modules/disciplines/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "disciplineRouter",
    ()=>disciplineRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
/**
 * disciplines/router.ts
 *
 * CRUD Discipline (modèle 2-niveaux : Category → Discipline).
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les disciplines alimentent potentiellement
 *                  le site public, au même titre que les catégories).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *
 * Règles métier :
 *   - `categoryId` N'EST PAS modifiable via `update`. Déplacer une discipline
 *     de catégorie briserait la cohérence des chemins Cloudinary existants
 *     (qui encodent `category.type` slugifié dans leurs segments).
 *   - `delete` est un hard delete : avant de supprimer, on vérifie qu'aucune
 *     dépendance ne subsiste (Course, Stage, Event, MediaAsset). Si oui,
 *     CONFLICT.
 *   - L'unicité `(categoryId, name)` est portée par le schéma Prisma ; une
 *     violation renvoie une erreur CONFLICT explicite.
 *
 * ─── Évolution v2 (migration domain_v2_expansion) ─────────────────────────
 *
 * Deux changements de schéma adressés ici :
 *
 *   1. `Discipline.origin` (String? libre) → `originId` (Int? FK vers Origin).
 *      L'input métier passe d'un texte libre à un id résolu depuis l'admin
 *      (sélecteur peuplé par `origin.getAll`). La validation côté router
 *      vérifie que l'origine référencée existe en DB.
 *
 *   2. `Discipline.description` (String?) → `description` (Json) — composite
 *      éditable au PageBuilder. Le champ accepte désormais un
 *      `pageContentSchemaV1`, et toute mutation qui le touche s'exécute
 *      dans une transaction qui appelle `syncPageMediaReferences` pour
 *      maintenir la table `PageMediaReference` à jour (pageType: "DISCIPLINE").
 *      Si le composite référence un mediaId non-published, la mutation
 *      roll-back avec un BAD_REQUEST précis.
 *
 * ─── Évolution navigation (socle slugs + DisciplineFamily) ────────────────
 *
 * Trois changements adressés ici :
 *
 *   1. `slug String @unique` — saisi par l'admin (le front le pré-remplit
 *      via `slugify`, mais il reste éditable), validé par `slugSchema`, et
 *      stable au renommage. Sert la page publique `/disciplines/[slug]`.
 *
 *   2. `Discipline.family` (String? libre) → `familyId` (Int? FK vers
 *      DisciplineFamily). Même logique qu'`originId` : un id résolu depuis
 *      l'admin, dont l'existence est validée côté router. Promeut le
 *      regroupement de menu (« Kung-fu », etc.) en entité, pour fuir les
 *      doublons orthographiques d'un champ libre.
 *
 *   3. `getBySlug` (publicProcedure) — lookup par slug pour la page détail.
 *
 * Comme `slug` introduit une 2ᵉ contrainte d'unicité (en plus de
 * `(categoryId, name)`), les `catch` P2002 distinguent désormais le conflit
 * de slug du conflit de nom via `err.meta.target`.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const disciplineTypeEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "MARTIAL_ART",
    "CALLIGRAPHY"
]);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"],
    type: disciplineTypeEnum,
    // ID de la famille de disciplines (relation vers le modèle
    // DisciplineFamily). Nullable : une discipline peut ne pas être
    // rattachée à une famille (création progressive).
    familyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    school: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    classification: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    // ID de l'origine culturelle (relation vers le modèle Origin).
    // Nullable : une discipline peut ne pas avoir d'origine renseignée
    // (création progressive — on lie l'origine plus tard).
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    // Composite Json du PageBuilder pour la page de présentation de la
    // discipline. Requis au create — le frontend envoie au minimum
    // `emptyPageContentV1()` si l'admin n'a rien rédigé.
    description: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"],
    categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1)
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"].optional(),
    type: disciplineTypeEnum.optional(),
    // familyId nullable + optional : permet d'attacher, détacher, ou
    // ne pas toucher selon `undefined` vs `null` vs un id.
    familyId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    school: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    classification: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    // originId nullable + optional : permet d'attacher, détacher, ou
    // ne pas toucher selon `undefined` vs `null` vs un id.
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    // description optional : si non fourni, le composite reste tel qu'il
    // est en DB. Si fourni, la sync transactionnelle s'applique.
    description: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional(),
    instructorId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).optional()
});
const disciplineRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les disciplines d'une catégorie donnée.
   * Usage typique : formulaire d'upload (sélecteur de discipline après choix
   * de catégorie).
   */ getAllByCategory: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const discipline = await ctx.prisma.discipline.findUnique({
            where: {
                id: input.id
            }
        });
        if (!discipline) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Discipline not found."
            });
        }
        return discipline;
    }),
    /**
   * Lookup par slug — alimente la page publique `/disciplines/[slug]`.
   */ getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"]
    })).query(async ({ ctx, input })=>{
        const discipline = await ctx.prisma.discipline.findUnique({
            where: {
                slug: input.slug
            }
        });
        if (!discipline) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Discipline not found."
            });
        }
        return discipline;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(createInput).mutation(async ({ ctx, input })=>{
        // ─── Validations pré-transaction (lectures simples) ────────────────
        const category = await ctx.prisma.category.findUnique({
            where: {
                id: input.categoryId
            },
            select: {
                id: true
            }
        });
        if (!category) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Category not found (id=${input.categoryId}).`
            });
        }
        const instructor = await ctx.prisma.user.findUnique({
            where: {
                id: input.instructorId
            },
            select: {
                id: true
            }
        });
        if (!instructor) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Instructor not found (id=${input.instructorId}).`
            });
        }
        if (input.familyId !== null && input.familyId !== undefined) {
            const family = await ctx.prisma.disciplineFamily.findUnique({
                where: {
                    id: input.familyId
                },
                select: {
                    id: true
                }
            });
            if (!family) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `DisciplineFamily not found (id=${input.familyId}).`
                });
            }
        }
        if (input.originId !== null && input.originId !== undefined) {
            const origin = await ctx.prisma.origin.findUnique({
                where: {
                    id: input.originId
                },
                select: {
                    id: true
                }
            });
            if (!origin) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Origin not found (id=${input.originId}).`
                });
            }
        }
        // ─── Transaction : create discipline + sync references ─────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let created;
            try {
                created = await tx.discipline.create({
                    data: {
                        name: input.name,
                        slug: input.slug,
                        type: input.type,
                        familyId: input.familyId ?? null,
                        school: input.school ?? null,
                        classification: input.classification ?? null,
                        originId: input.originId ?? null,
                        description: input.description,
                        categoryId: input.categoryId,
                        instructorId: input.instructorId
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                    const t = err.meta?.target;
                    const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: onSlug ? "This slug is already used. Choose a different one." : "A discipline with this name already exists in this category."
                    });
                }
                throw err;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "DISCIPLINE",
                pageId: String(created.id),
                newContent: input.description
            });
            return created;
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        // ─── Validations pré-transaction ───────────────────────────────────
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
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Instructor not found (id=${rest.instructorId}).`
                });
            }
        }
        // familyId : on valide seulement si fourni ET non-null
        // (null = détachement explicite, autorisé).
        if (rest.familyId !== undefined && rest.familyId !== null) {
            const family = await ctx.prisma.disciplineFamily.findUnique({
                where: {
                    id: rest.familyId
                },
                select: {
                    id: true
                }
            });
            if (!family) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `DisciplineFamily not found (id=${rest.familyId}).`
                });
            }
        }
        // originId : on valide seulement si fourni ET non-null
        // (null = détachement explicite, autorisé).
        if (rest.originId !== undefined && rest.originId !== null) {
            const origin = await ctx.prisma.origin.findUnique({
                where: {
                    id: rest.originId
                },
                select: {
                    id: true
                }
            });
            if (!origin) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Origin not found (id=${rest.originId}).`
                });
            }
        }
        // ─── Transaction : update + sync references si description fournie ─
        return await ctx.prisma.$transaction(async (tx)=>{
            let updated;
            try {
                const data = {
                    name: rest.name,
                    slug: rest.slug,
                    type: rest.type,
                    familyId: rest.familyId,
                    school: rest.school,
                    classification: rest.classification,
                    originId: rest.originId,
                    instructorId: rest.instructorId,
                    description: rest.description === undefined ? undefined : rest.description
                };
                updated = await tx.discipline.update({
                    where: {
                        id
                    },
                    data
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                    if (err.code === "P2002") {
                        const t = err.meta?.target;
                        const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "CONFLICT",
                            message: onSlug ? "This slug is already used. Choose a different one." : "A discipline with this name already exists in this category."
                        });
                    }
                    if (err.code === "P2025") {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "NOT_FOUND",
                            message: "Discipline not found."
                        });
                    }
                }
                throw err;
            }
            // La sync n'est appelée que si l'update a effectivement touché à
            // la description. Si l'admin met juste à jour `name` ou `family`,
            // les références médias n'ont pas changé.
            if (rest.description !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "DISCIPLINE",
                    pageId: String(id),
                    newContent: rest.description
                });
            }
            return updated;
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Pré-vérification des dépendances — on refuse plutôt que de cascader.
        // Étendue à Event (nouvelle entité v2) en plus de Course/Stage/MediaAsset.
        const [courseCount, stageCount, eventCount, mediaAssetCount] = await Promise.all([
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
            // Via la jointure : compte aussi les événements multi-disciplines.
            ctx.prisma.eventDiscipline.count({
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
        if (eventCount > 0) deps.push(`${eventCount} event(s)`);
        if (mediaAssetCount > 0) deps.push(`${mediaAssetCount} media asset(s)`);
        if (deps.length > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Cannot delete discipline: ${deps.join(", ")} still reference it. Migrate or delete them first.`
            });
        }
        // Transaction : nettoyage des PageMediaReference avant le delete
        // physique de la discipline. Cohérent avec le pattern courses :
        // on libère les références AVANT pour ne pas laisser de rows
        // orphelines (la table n'a pas de FK DB sur `pageId`).
        return await ctx.prisma.$transaction(async (tx)=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "DISCIPLINE",
                pageId: String(input.id),
                newContent: null
            });
            try {
                return await tx.discipline.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Discipline not found."
                    });
                }
                throw err;
            }
        });
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
/**
 * stages/router.ts
 *
 * CRUD Stage — un événement ponctuel. Un Stage n'a pas de date/heure
 * directes : ses dates concrètes sont portées par `StageSession`
 * (cf. router `stageSession`).
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
 *
 * ─── Évolution v2 (migration domain_v2_expansion) ─────────────────────────
 *
 * Trois changements de schéma adressés ici :
 *
 *   1. `Stage.disciplineId` est passé de `Int` à `Int?`. Un Stage peut
 *      désormais ne PAS être rattaché à une discipline enseignée — typique
 *      d'un intervenant externe sur une discipline non enregistrée
 *      (« Calligraphie chinoise », par exemple).
 *
 *   2. Deux nouveaux champs accompagnent le découplage :
 *      - `externalDisciplineLabel: String?` — pour nommer la discipline
 *        externe quand `disciplineId` est null
 *      - `originId: Int?` — pour rattacher à une culture (Origin) quand
 *        ni la discipline du club ni un label externe ne suffisent
 *
 *   3. **Au moins un des trois** (`disciplineId`, `externalDisciplineLabel`,
 *      `originId`) doit être renseigné pour qu'un Stage ait du contexte.
 *      Vérifié en Zod au create, et en router après merge pour l'update.
 *
 * Et migration des composites Json vers `pageContentSchemaV1` typé,
 * comme on l'a fait pour Course (sous-chantier 4) et Discipline
 * (livraison 1). Le Stage porte **deux composites séparés** —
 * `description` et `program` — qui ont donc deux syncs distinctes,
 * avec leurs `pageType` respectifs : `STAGE_DESCRIPTION` et `STAGE_PROGRAM`.
 *
 * ─── Garde métier sur la catégorie de discipline ────────────────────────
 *
 * Conservée mais désormais **conditionnelle** : si `disciplineId` est
 * fourni, on vérifie que la discipline appartient à la catégorie « Stage ».
 * Si null (stage externe), pas de vérification — la catégorie n'a pas
 * de sens dans ce cas.
 *
 * ─── Évolution navigation (socle slugs) ───────────────────────────────────
 *
 * Ajout d'un `slug String @unique` saisi par l'admin (pré-rempli via
 * `slugify` côté front, validé par `slugSchema`, stable au renommage) et
 * d'un `getBySlug` public pour la page détail `/stages/[slug]`. Le slug
 * étant une 2ᵉ contrainte d'unicité (en plus de `(disciplineId, label)`),
 * les `catch` P2002 distinguent le conflit de slug du conflit de label
 * via `err.meta.target`.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const audienceEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "KIDS",
    "TEENAGERS",
    "ADULTS",
    "ALL_AGES"
]);
const userIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1);
/**
 * `coAnimatorIds` doit :
 *   - ne pas contenir de doublons
 *   - ne pas contenir le `primaryAnimatorId` (déjà principal, pas co)
 * Ces deux règles sont appliquées au niveau de l'objet parent via `.refine`.
 */ const coAnimatorIdsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).default([]);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    // Trois champs de rattachement, tous optionnels en Zod —
    // au moins un requis via `.refine` en bas du schema.
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    externalDisciplineLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"],
    audience: audienceEnum,
    // Composites Json typés au PageBuilder. Requis au create — le
    // frontend envoie `emptyPageContentV1()` au minimum.
    description: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"],
    program: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"],
    preRegistered: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).default([]),
    primaryAnimatorId: userIdSchema,
    coAnimatorIds: coAnimatorIdsSchema,
    // Date de publication éditoriale. null/absent = brouillon (non visible
    // publiquement). Une date = publié/programmé. Cohérent avec Post/Event.
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
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
}).refine((data)=>data.disciplineId !== null && data.disciplineId !== undefined || data.externalDisciplineLabel !== null && data.externalDisciplineLabel !== undefined || data.originId !== null && data.originId !== undefined, {
    message: "At least one of disciplineId, externalDisciplineLabel, or originId must be provided.",
    path: [
        "disciplineId"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    // Les trois champs de rattachement deviennent modifiables (cf. v2).
    // Validation « au moins un des trois » faite en router après merge
    // avec l'état actuel en DB, parce que Zod ne peut pas le savoir seul.
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    externalDisciplineLabel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"].optional(),
    audience: audienceEnum.optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional(),
    program: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional(),
    preRegistered: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).optional(),
    primaryAnimatorId: userIdSchema.optional(),
    coAnimatorIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(userIdSchema).optional(),
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `User(s) not found: ${missing.join(", ")}`
        });
    }
}
/**
 * Si `disciplineId` est fourni, vérifie qu'elle existe. Tolère
 * null/undefined (stage externe : rattachement par label ou origine).
 *
 * Note : contrairement à une version antérieure, on ne contraint PLUS la
 * catégorie de la discipline. Un stage peut porter sur n'importe quelle
 * discipline du club, comme le fait déjà Event. La catégorie sert au
 * rangement (médias, listing), pas à restreindre les rattachements.
 */ async function assertDisciplineExists(prisma, disciplineId) {
    if (disciplineId === null || disciplineId === undefined) return;
    const discipline = await prisma.discipline.findUnique({
        where: {
            id: disciplineId
        },
        select: {
            id: true
        }
    });
    if (!discipline) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Discipline not found (id=${disciplineId}).`
        });
    }
}
async function assertOriginExists(prisma, originId) {
    if (originId === null || originId === undefined) return;
    const origin = await prisma.origin.findUnique({
        where: {
            id: originId
        },
        select: {
            id: true
        }
    });
    if (!origin) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Origin not found (id=${originId}).`
        });
    }
}
const stageRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste publique des stages PUBLIÉS (publicationDate non null et passée).
   * L'admin utilise `getAllAdmin` (inclut brouillons et programmés).
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.stage.findMany({
            where: {
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
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
   * Liste admin de TOUS les stages — brouillons et programmés inclus.
   * Tri : programmés/brouillons d'abord (nulls first), puis par création.
   */ getAllAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).query(async ({ ctx })=>{
        return ctx.prisma.stage.findMany({
            orderBy: [
                {
                    publicationDate: {
                        sort: "desc",
                        nulls: "first"
                    }
                },
                {
                    createdAt: "desc"
                }
            ]
        });
    }),
    /**
   * Liste publique des stages PUBLIÉS d'une discipline donnée.
   */ getAllByDiscipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.stage.findMany({
            where: {
                disciplineId: input.disciplineId,
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            orderBy: {
                label: "asc"
            }
        });
    }),
    /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la page d'édition `/dashboard/stages/[id]/edit`.
   */ getByIdAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Stage not found."
            });
        }
        return stage;
    }),
    /**
   * Lookup public par slug — alimente `/stages/[slug]`.
   * Seuls les stages PUBLIÉS sont visibles ; un brouillon/programmé
   * renvoie NOT_FOUND (on ne révèle pas son existence publiquement).
   */ getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"]
    })).query(async ({ ctx, input })=>{
        const stage = await ctx.prisma.stage.findFirst({
            where: {
                slug: input.slug,
                publicationDate: {
                    not: null,
                    lte: new Date()
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
                },
                sessions: {
                    orderBy: {
                        date: "asc"
                    }
                }
            }
        });
        if (!stage) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Stage not found."
            });
        }
        return stage;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(createInput).mutation(async ({ ctx, input })=>{
        // ─── Validations pré-transaction ───────────────────────────────────
        await assertDisciplineExists(ctx.prisma, input.disciplineId);
        await assertOriginExists(ctx.prisma, input.originId);
        const allAnimatorIds = [
            input.primaryAnimatorId,
            ...input.coAnimatorIds
        ];
        await assertUsersExist(ctx.prisma, allAnimatorIds);
        // ─── Transaction : create stage + sync DEUX composites ─────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let created;
            try {
                created = await tx.stage.create({
                    data: {
                        disciplineId: input.disciplineId ?? null,
                        externalDisciplineLabel: input.externalDisciplineLabel ?? null,
                        originId: input.originId ?? null,
                        label: input.label,
                        slug: input.slug,
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
                        },
                        publicationDate: input.publicationDate ?? null
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
                    const t = err.meta?.target;
                    const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: onSlug ? "This slug is already used. Choose a different one." : "A stage with this label already exists for this discipline."
                    });
                }
                throw err;
            }
            // Deux syncs séparées : description et program portent chacun
            // leur propre composite, donc leurs propres références médias.
            // Cohérent avec le `PageReferencerKind` enum qui les distingue.
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "STAGE_DESCRIPTION",
                pageId: String(created.id),
                newContent: input.description
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "STAGE_PROGRAM",
                pageId: String(created.id),
                newContent: input.program
            });
            return created;
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, coAnimatorIds, primaryAnimatorId, description, program, ...rest } = input;
        // ─── Lecture de l'état actuel (validation post-merge) ──────────────
        //
        // On a besoin de l'état actuel pour deux raisons :
        //   1. Animateurs : si l'un des deux champs change, on recalcule
        //      la liste complète à partir de l'existant
        //   2. Validation « au moins un des trois » : on vérifie que la
        //      combinaison après merge satisfait toujours la règle
        const existing = await ctx.prisma.stage.findUnique({
            where: {
                id
            },
            select: {
                disciplineId: true,
                externalDisciplineLabel: true,
                originId: true,
                primaryAnimatorId: true,
                animators: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (!existing) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Stage not found."
            });
        }
        // Validation « au moins un des trois » après merge.
        // `rest.disciplineId !== undefined` signifie que le champ est dans
        // le payload — soit avec un id, soit avec `null` (détachement).
        const mergedDisciplineId = rest.disciplineId !== undefined ? rest.disciplineId : existing.disciplineId;
        const mergedExternalLabel = rest.externalDisciplineLabel !== undefined ? rest.externalDisciplineLabel : existing.externalDisciplineLabel;
        const mergedOriginId = rest.originId !== undefined ? rest.originId : existing.originId;
        const hasAtLeastOne = mergedDisciplineId !== null || mergedExternalLabel !== null && mergedExternalLabel.length > 0 || mergedOriginId !== null;
        if (!hasAtLeastOne) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "A stage must keep at least one of disciplineId, externalDisciplineLabel, or originId set."
            });
        }
        // Validation discipline si modifiée et non-null
        if (rest.disciplineId !== undefined && rest.disciplineId !== null) {
            await assertDisciplineExists(ctx.prisma, rest.disciplineId);
        }
        // Validation origine si modifiée et non-null
        if (rest.originId !== undefined && rest.originId !== null) {
            await assertOriginExists(ctx.prisma, rest.originId);
        }
        // ─── Recalcul de la liste des animateurs si nécessaire ─────────────
        const animatorsChanged = primaryAnimatorId !== undefined || coAnimatorIds !== undefined;
        let finalAnimatorIds = null;
        if (animatorsChanged) {
            const newPrimary = primaryAnimatorId ?? existing.primaryAnimatorId;
            const existingCoIds = existing.animators.map((a)=>a.id).filter((aid)=>aid !== existing.primaryAnimatorId);
            const newCo = coAnimatorIds ?? existingCoIds;
            if (newCo.includes(newPrimary)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
        // ─── Transaction : update + syncs conditionnels ────────────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let updated;
            try {
                const data = {
                    disciplineId: rest.disciplineId,
                    externalDisciplineLabel: rest.externalDisciplineLabel,
                    originId: rest.originId,
                    label: rest.label,
                    slug: rest.slug,
                    audience: rest.audience,
                    preRegistered: rest.preRegistered,
                    publicationDate: rest.publicationDate,
                    description: description === undefined ? undefined : description,
                    program: program === undefined ? undefined : program,
                    ...primaryAnimatorId !== undefined ? {
                        primaryAnimatorId
                    } : {},
                    ...finalAnimatorIds ? {
                        animators: {
                            set: finalAnimatorIds.map((aid)=>({
                                    id: aid
                                }))
                        }
                    } : {}
                };
                updated = await tx.stage.update({
                    where: {
                        id
                    },
                    data,
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
                        const t = err.meta?.target;
                        const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "CONFLICT",
                            message: onSlug ? "This slug is already used. Choose a different one." : "A stage with this label already exists for this discipline."
                        });
                    }
                    if (err.code === "P2025") {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "NOT_FOUND",
                            message: "Stage not found."
                        });
                    }
                }
                throw err;
            }
            // Syncs conditionnels — chaque composite indépendamment.
            if (description !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "STAGE_DESCRIPTION",
                    pageId: String(id),
                    newContent: description
                });
            }
            if (program !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "STAGE_PROGRAM",
                    pageId: String(id),
                    newContent: program
                });
            }
            return updated;
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Les StageSession liées seront supprimées en cascade
        // (onDelete: Cascade dans le schéma). Mais les `PageMediaReference`
        // n'ont pas de FK DB côté `pageId` — il faut les nettoyer
        // explicitement avant le delete.
        return await ctx.prisma.$transaction(async (tx)=>{
            // Sync des deux composites : libération de toutes les références
            // médias de ce stage. `newContent: null` = mode delete du helper.
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "STAGE_DESCRIPTION",
                pageId: String(input.id),
                newContent: null
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "STAGE_PROGRAM",
                pageId: String(input.id),
                newContent: null
            });
            try {
                return await tx.stage.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Stage not found."
                    });
                }
                throw err;
            }
        });
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
 * Même logique que dans le router `course` : `beginTime` / `endTime`
 * au format **HHMM** (1830 = 18h30, 905 = 9h05). La `.refine()` rejette
 * les minutes invalides (≥ 60).
 */ const hhmmSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(2359).refine((v)=>v % 100 < 60, {
    message: "Minutes part must be 0-59 (e.g. 1860 is not a valid time)."
});
const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    stageId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date(),
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.beginTime === undefined || data.endTime === undefined || data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const stageSessionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les sessions d'un stage donné, triées par date puis heure.
   */ getAllByStage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        stageId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const session = await ctx.prisma.stageSession.findUnique({
            where: {
                id: input.id
            }
        });
        if (!session) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A session already exists for this stage at this date and beginTime."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Stage session not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_stages")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.stageSession.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
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
"[project]/packages/backend/src/modules/events/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "eventRouter",
    ()=>eventRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
/**
 * events/router.ts
 *
 * CRUD Event — événement ponctuel non récurrent, plus libre que Stage.
 *
 * Repas, conférence, journée portes ouvertes, atelier culturel, etc.
 * Ce qui distingue Event de Stage :
 *
 *   - **Pas obligatoirement rattaché** à une discipline (`disciplineId`
 *     nullable, comme Stage en v2) — un événement culturel large peut
 *     ne pas être rattaché à une discipline enseignée
 *   - **Un seul composite** Json (`content`) — pas la dichotomie
 *     description/program de Stage. Plus léger en structure
 *   - **`publicationDate?`** pour gérer brouillons (cohérent Post)
 *   - **Pattern animation simplifié** : un seul `organizerId`, pas de
 *     distinction primary/secondary, pas de relation many-to-many
 *
 * La date n'est pas portée par Event lui-même mais par ses
 * `EventSession[]` — comme Stage, un Event est un container temporel.
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les events alimentent le site public).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_events"))`.
 *                  Permission dédiée — si elle n'existe pas encore dans
 *                  ton seed, à ajouter (cf. NOTES.md de cette livraison).
 *
 * ─── Sync transactionnelle des références médias ────────────────────────
 *
 * Le champ `content` accepte un `pageContentSchemaV1` typé, et toute
 * mutation qui le touche s'exécute dans une transaction qui appelle
 * `syncPageMediaReferences` avec `pageType: "EVENT"`. Si le composite
 * référence un mediaId non-published, la mutation roll-back avec un
 * BAD_REQUEST précis.
 *
 * ─── Validation « au moins un des trois » ───────────────────────────────
 *
 * Cohérent avec Stage v2 : au moins un de `disciplineId`,
 * `externalDisciplineLabel`, `originId` doit être renseigné pour qu'un
 * Event ait du contexte. Vérifié en Zod au create, en router après
 * merge à l'update.
 *
 * ─── Évolution navigation (socle slugs) ───────────────────────────────────
 *
 * Ajout d'un `slug String @unique` saisi par l'admin (pré-rempli via
 * `slugify` côté front, validé par `slugSchema`, stable au renommage) et
 * d'un `getBySlug` public pour la page détail `/evenements/[slug]`.
 * Particularité : le slug est la **première** contrainte d'unicité d'Event
 * (il n'en avait aucune). Les mutations gagnent donc une gestion P2002
 * qu'elles n'avaient pas — au create (où il n'y avait aucun `catch`) et à
 * l'update (où seul P2025 était traité).
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const audienceEnum = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "KIDS",
    "TEENAGERS",
    "ADULTS",
    "ALL_AGES"
]);
const userIdSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1);
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"],
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"],
    audience: audienceEnum,
    // Rattachements, tous optionnels en Zod — au moins un requis via
    // `.refine` en bas.
    //
    // Un événement présente 0..N disciplines ENSEIGNÉES (forum des
    // associations, démonstration multi-disciplines) et 0..N disciplines non
    // enseignées (« Calligraphie chinoise »).
    disciplineIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()).optional(),
    externalDisciplineLabels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120)).optional(),
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    organizerId: userIdSchema,
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
}).refine((data)=>(data.disciplineIds ?? []).length > 0 || (data.externalDisciplineLabels ?? []).length > 0 || data.originId !== null && data.originId !== undefined, {
    message: "At least one of disciplineIds, externalDisciplineLabels, or originId must be provided.",
    path: [
        "disciplineIds"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    label: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"].optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional(),
    audience: audienceEnum.optional(),
    // Validation « au moins un des trois » faite en router après merge
    // avec l'état actuel en DB (Zod ne connaît pas l'état actuel).
    disciplineIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()).optional(),
    externalDisciplineLabels: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120)).optional(),
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    organizerId: userIdSchema.optional(),
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
});
/* -------------------------------------------------------------------------- */ /*                             INTERNAL HELPERS                               */ /* -------------------------------------------------------------------------- */ /** Vérifie que TOUTES les disciplines existent (0..N). */ async function assertDisciplinesExist(prisma, disciplineIds) {
    if (disciplineIds.length === 0) return;
    const unique = [
        ...new Set(disciplineIds)
    ];
    const found = await prisma.discipline.findMany({
        where: {
            id: {
                in: unique
            }
        },
        select: {
            id: true
        }
    });
    const foundIds = new Set(found.map((d)=>d.id));
    const missing = unique.filter((id)=>!foundIds.has(id));
    if (missing.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Discipline(s) not found: ${missing.join(", ")}.`
        });
    }
}
async function assertOriginExists(prisma, originId) {
    if (originId === null || originId === undefined) return;
    const origin = await prisma.origin.findUnique({
        where: {
            id: originId
        },
        select: {
            id: true
        }
    });
    if (!origin) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `Origin not found (id=${originId}).`
        });
    }
}
async function assertUserExists(prisma, userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    });
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "BAD_REQUEST",
            message: `User not found (id=${userId}).`
        });
    }
}
const eventRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste tous les events publiés (publicationDate non null et passé).
   * Pour l'admin, utiliser `getAllAdmin` qui inclut les brouillons.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.event.findMany({
            where: {
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            orderBy: {
                publicationDate: "desc"
            }
        });
    }),
    /**
   * Liste tous les events sans filtre — incluant brouillons et programmés.
   * Réservé à l'admin (requirePermission).
   */ getAllAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).query(async ({ ctx })=>{
        return ctx.prisma.event.findMany({
            orderBy: [
                {
                    publicationDate: {
                        sort: "desc",
                        nulls: "first"
                    }
                },
                {
                    createdAt: "desc"
                }
            ],
            include: {
                // Disciplines enseignées (0..N) — alimente la colonne
                // « rattachement » de la table admin.
                disciplineLinks: {
                    select: {
                        discipline: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }),
    /**
   * Liste légère des événements pour le picker de l'uploader.
   * `protectedProcedure` SANS `manage_events` : tout membre authentifié peut
   * déposer des photos sur un événement, même s'il ne peut pas l'éditer.
   * Brouillons inclus — un événement peut être préparé avant sa publication.
   */ listForUpload: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.event.findMany({
            select: {
                id: true,
                label: true,
                slug: true
            },
            orderBy: [
                {
                    publicationDate: {
                        sort: "desc",
                        nulls: "first"
                    }
                },
                {
                    createdAt: "desc"
                }
            ]
        });
    }),
    getAllByDiscipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        // Via la jointure : capte AUSSI les événements multi-disciplines,
        // que l'ancienne colonne `disciplineId` (1 seule) ratait.
        return ctx.prisma.event.findMany({
            where: {
                disciplineLinks: {
                    some: {
                        disciplineId: input.disciplineId
                    }
                },
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            orderBy: {
                publicationDate: "desc"
            }
        });
    }),
    getAllByOrigin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.event.findMany({
            where: {
                originId: input.originId,
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            orderBy: {
                publicationDate: "desc"
            }
        });
    }),
    /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la page d'édition `/dashboard/events/[id]/edit`.
   */ getByIdAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const event = await ctx.prisma.event.findUnique({
            where: {
                id: input.id
            },
            relationLoadStrategy: "join",
            include: {
                sessions: {
                    orderBy: {
                        date: "asc"
                    }
                },
                // Disciplines enseignées (0..N) — alimente le formulaire admin.
                disciplineLinks: {
                    select: {
                        disciplineId: true,
                        discipline: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
        if (!event) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Event not found."
            });
        }
        return event;
    }),
    /**
   * Lookup public par slug — alimente `/evenements/[slug]`.
   * Seuls les events PUBLIÉS sont visibles ; un brouillon/programmé
   * renvoie NOT_FOUND (on ne révèle pas son existence publiquement).
   */ getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"]
    })).query(async ({ ctx, input })=>{
        const event = await ctx.prisma.event.findFirst({
            where: {
                slug: input.slug,
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            relationLoadStrategy: "join",
            include: {
                sessions: {
                    orderBy: {
                        date: "asc"
                    }
                },
                // Disciplines enseignées (0..N) — pour l'affichage public.
                disciplineLinks: {
                    select: {
                        disciplineId: true,
                        discipline: {
                            select: {
                                name: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });
        if (!event) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Event not found."
            });
        }
        return event;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(createInput).mutation(async ({ ctx, input })=>{
        // ─── Validations pré-transaction ───────────────────────────────────
        const disciplineIds = [
            ...new Set(input.disciplineIds ?? [])
        ];
        const externalLabels = [
            ...new Set(input.externalDisciplineLabels ?? [])
        ];
        await assertDisciplinesExist(ctx.prisma, disciplineIds);
        await assertOriginExists(ctx.prisma, input.originId);
        await assertUserExists(ctx.prisma, input.organizerId);
        // ─── Transaction : create event + sync references ──────────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let created;
            try {
                created = await tx.event.create({
                    data: {
                        label: input.label,
                        slug: input.slug,
                        content: input.content,
                        audience: input.audience,
                        // Nouvelle vérité : la jointure + le tableau de labels.
                        disciplineLinks: {
                            create: disciplineIds.map((disciplineId)=>({
                                    disciplineId
                                }))
                        },
                        externalDisciplineLabels: externalLabels,
                        originId: input.originId ?? null,
                        organizerId: input.organizerId,
                        publicationDate: input.publicationDate ?? null
                    }
                });
            } catch (err) {
                // `slug` est la seule contrainte unique d'Event — un P2002 ne
                // peut donc venir que de lui. On garde le test sur `target`
                // par cohérence avec discipline/stage et pour rester robuste
                // si une autre contrainte unique apparaît plus tard.
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                    const t = err.meta?.target;
                    const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                    if (onSlug) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "CONFLICT",
                            message: "This slug is already used. Choose a different one."
                        });
                    }
                }
                throw err;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "EVENT",
                pageId: String(created.id),
                newContent: input.content
            });
            return created;
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, content, ...rest } = input;
        // ─── Lecture pré-transaction (pour validation post-merge) ──────────
        const existing = await ctx.prisma.event.findUnique({
            where: {
                id
            },
            select: {
                externalDisciplineLabels: true,
                originId: true,
                disciplineLinks: {
                    select: {
                        disciplineId: true
                    }
                }
            }
        });
        if (!existing) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Event not found."
            });
        }
        const disciplinesChanged = rest.disciplineIds !== undefined;
        const labelsChanged = rest.externalDisciplineLabels !== undefined;
        const mergedDisciplineIds = disciplinesChanged ? [
            ...new Set(rest.disciplineIds ?? [])
        ] : existing.disciplineLinks.map((l)=>l.disciplineId);
        const mergedExternalLabels = labelsChanged ? [
            ...new Set(rest.externalDisciplineLabels ?? [])
        ] : existing.externalDisciplineLabels;
        const mergedOriginId = rest.originId !== undefined ? rest.originId : existing.originId;
        // Validation « au moins un des trois » après merge.
        const hasAtLeastOne = mergedDisciplineIds.length > 0 || mergedExternalLabels.length > 0 || mergedOriginId !== null;
        if (!hasAtLeastOne) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "An event must keep at least one of disciplineIds, externalDisciplineLabels, or originId set."
            });
        }
        // Validations existence si champs modifiés
        if (disciplinesChanged) {
            await assertDisciplinesExist(ctx.prisma, mergedDisciplineIds);
        }
        if (rest.originId !== undefined && rest.originId !== null) {
            await assertOriginExists(ctx.prisma, rest.originId);
        }
        if (rest.organizerId !== undefined) {
            await assertUserExists(ctx.prisma, rest.organizerId);
        }
        // ─── Transaction : update + sync conditionnel ──────────────────────
        return await ctx.prisma.$transaction(async (tx)=>{
            let updated;
            try {
                const data = {
                    label: rest.label,
                    slug: rest.slug,
                    audience: rest.audience,
                    // La jointure est synchronisée juste après.
                    externalDisciplineLabels: labelsChanged ? mergedExternalLabels : undefined,
                    originId: rest.originId,
                    organizerId: rest.organizerId,
                    publicationDate: rest.publicationDate,
                    content: content === undefined ? undefined : content
                };
                updated = await tx.event.update({
                    where: {
                        id
                    },
                    data
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                    if (err.code === "P2002") {
                        const t = err.meta?.target;
                        const onSlug = Array.isArray(t) ? t.includes("slug") : String(t ?? "").includes("slug");
                        if (onSlug) {
                            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                                code: "CONFLICT",
                                message: "This slug is already used. Choose a different one."
                            });
                        }
                    }
                    if (err.code === "P2025") {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                            code: "NOT_FOUND",
                            message: "Event not found."
                        });
                    }
                }
                throw err;
            }
            // Synchro de la jointure (source de vérité des disciplines).
            if (disciplinesChanged) {
                await tx.eventDiscipline.deleteMany({
                    where: {
                        eventId: id
                    }
                });
                if (mergedDisciplineIds.length > 0) {
                    await tx.eventDiscipline.createMany({
                        data: mergedDisciplineIds.map((disciplineId)=>({
                                eventId: id,
                                disciplineId
                            })),
                        skipDuplicates: true
                    });
                }
            }
            if (content !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "EVENT",
                    pageId: String(id),
                    newContent: content
                });
            }
            return updated;
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Les EventSession liées seront supprimées en cascade
        // (onDelete: Cascade dans le schéma). Mais les `PageMediaReference`
        // n'ont pas de FK DB côté `pageId` — il faut les nettoyer
        // explicitement avant le delete.
        return await ctx.prisma.$transaction(async (tx)=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "EVENT",
                pageId: String(input.id),
                newContent: null
            });
            try {
                return await tx.event.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Event not found."
                    });
                }
                throw err;
            }
        });
    })
});
const __TURBOPACK__default__export__ = eventRouter;
}),
"[project]/packages/backend/src/modules/eventSessions/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "eventSessionRouter",
    ()=>eventSessionRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * eventSessions/router.ts
 *
 * CRUD EventSession — une séance concrète d'un Event. Un Event peut
 * comporter plusieurs sessions si son programme s'étale sur plusieurs
 * journées (conférence en deux soirées, week-end culturel, etc.).
 *
 * Cloné fidèlement sur `stageSession` :
 *   - Mêmes conventions d'unicité `(eventId, date, beginTime)`
 *   - `beginTime`/`endTime` en minutes depuis minuit (0-1439 / 0-1440),
 *     pas en HHMM — cohérent avec courses et stageSession
 *   - `onDelete: Cascade` côté schéma : supprimer un Event supprime ses
 *     sessions
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les sessions d'un event public
 *                  doivent être visibles).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_events"))`.
 *                  Réutilise la permission du domaine Event — une session
 *                  n'est rien sans son event parent.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ /**
 * Même logique que les routers `course` et `stageSession` :
 * `beginTime` / `endTime` au format **HHMM** (1830 = 18h30, 905 = 9h05).
 * La `.refine()` rejette les minutes invalides (≥ 60).
 */ const hhmmSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(2359).refine((v)=>v % 100 < 60, {
    message: "Minutes part must be 0-59 (e.g. 1860 is not a valid time)."
});
const beginTimeSchema = hhmmSchema;
const endTimeSchema = hhmmSchema;
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    eventId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date(),
    beginTime: beginTimeSchema,
    endTime: endTimeSchema,
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().optional(),
    beginTime: beginTimeSchema.optional(),
    endTime: endTimeSchema.optional(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).nullable().optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional()
}).refine((data)=>data.beginTime === undefined || data.endTime === undefined || data.endTime > data.beginTime, {
    message: "endTime must be strictly greater than beginTime.",
    path: [
        "endTime"
    ]
});
const eventSessionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les sessions d'un event donné, triées par date puis heure.
   */ getAllByEvent: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        eventId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.eventSession.findMany({
            where: {
                eventId: input.eventId
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
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const session = await ctx.prisma.eventSession.findUnique({
            where: {
                id: input.id
            }
        });
        if (!session) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Event session not found."
            });
        }
        return session;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(createInput).mutation(async ({ ctx, input })=>{
        // Vérifie que l'event parent existe.
        const event = await ctx.prisma.event.findUnique({
            where: {
                id: input.eventId
            },
            select: {
                id: true
            }
        });
        if (!event) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: `Event not found (id=${input.eventId}).`
            });
        }
        try {
            return await ctx.prisma.eventSession.create({
                data: {
                    eventId: input.eventId,
                    date: input.date,
                    beginTime: input.beginTime,
                    endTime: input.endTime,
                    location: input.location ?? null,
                    notes: input.notes ?? null
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "A session already exists for this event at this date and beginTime."
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        try {
            return await ctx.prisma.eventSession.update({
                where: {
                    id
                },
                data: rest
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: "A session already exists for this event at this date and beginTime."
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Event session not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_events")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.eventSession.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Event session not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = eventSessionRouter;
}),
"[project]/packages/backend/src/modules/posts/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "postRouter",
    ()=>postRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/page/blocks.v1.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
/**
 * posts/router.ts — refactor v2.
 *
 * Aligne Post sur le pattern des autres composites (Stage/Event) :
 *
 *   - **`content` en `pageContentSchemaV1`** (PageBuilder) au lieu de la
 *     string brute de la v1 — un article a du contenu riche (texte,
 *     images, documents).
 *   - **`publicationDate?`** pour le cycle brouillon/publié, identique à
 *     Event : `null` = brouillon, date passée = publié, future = programmé.
 *   - **Sync transactionnelle** des références médias (`pageType: "POST"`)
 *     sur create/update/delete.
 *   - **`authorId` = utilisateur courant** au create (pas un input) —
 *     l'auteur est celui qui écrit.
 *
 * Lectures publiques (`getAll` published, `getById`), écritures sous
 * `requirePermission("manage_posts")`.
 *
 * Le `delete` nettoie aussi les réactions polymorphes (du post + de ses
 * commentaires), puisque `Reaction` n'a pas de FK DB.
 */ /* -------------------------------------------------------------------------- */ /*                                  SCHEMAS                                   */ /* -------------------------------------------------------------------------- */ const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"],
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(255).optional(),
    content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$page$2f$blocks$2e$v1$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pageContentSchemaV1"].optional(),
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
});
const postRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /** Posts publiés uniquement (pages publiques). */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.post.findMany({
            where: {
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            },
            orderBy: {
                publicationDate: "desc"
            }
        });
    }),
    /** Tous les posts, brouillons inclus (back-office). */ getAllAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).query(async ({ ctx })=>{
        return ctx.prisma.post.findMany({
            orderBy: [
                {
                    publicationDate: {
                        sort: "desc",
                        nulls: "first"
                    }
                },
                {
                    createdAt: "desc"
                }
            ]
        });
    }),
    /**
   * Lookup public par id — seuls les posts PUBLIÉS (publicationDate non
   * null et passée). Un brouillon/programmé renvoie NOT_FOUND.
   */ getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const post = await ctx.prisma.post.findFirst({
            where: {
                id: input.id,
                publicationDate: {
                    not: null,
                    lte: new Date()
                }
            }
        });
        if (!post) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Post not found."
            });
        }
        return post;
    }),
    /**
   * Lookup admin par id — brouillons/programmés inclus.
   * Alimente la fiche et l'édition admin.
   */ getByIdAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.id
            }
        });
        if (!post) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Post not found."
            });
        }
        return post;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(createInput).mutation(async ({ ctx, input })=>{
        return await ctx.prisma.$transaction(async (tx)=>{
            const created = await tx.post.create({
                data: {
                    title: input.title,
                    content: input.content,
                    authorId: ctx.sessionClient.user.id,
                    publicationDate: input.publicationDate ?? null
                }
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "POST",
                pageId: String(created.id),
                newContent: input.content
            });
            return created;
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, content, ...rest } = input;
        return await ctx.prisma.$transaction(async (tx)=>{
            let updated;
            try {
                const data = {
                    title: rest.title,
                    publicationDate: rest.publicationDate,
                    content: content === undefined ? undefined : content
                };
                updated = await tx.post.update({
                    where: {
                        id
                    },
                    data
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Post not found."
                    });
                }
                throw err;
            }
            if (content !== undefined) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                    pageType: "POST",
                    pageId: String(id),
                    newContent: content
                });
            }
            return updated;
        });
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Ids des commentaires (pour nettoyer leurs réactions polymorphes).
        const comments = await ctx.prisma.comment.findMany({
            where: {
                postId: input.id
            },
            select: {
                id: true
            }
        });
        const commentIds = comments.map((c)=>c.id);
        return await ctx.prisma.$transaction(async (tx)=>{
            // Libère les médias référencés par le composite.
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$syncPageMediaReferences$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncPageMediaReferences"])(tx, {
                pageType: "POST",
                pageId: String(input.id),
                newContent: null
            });
            // Réactions polymorphes (pas de cascade DB).
            await tx.reaction.deleteMany({
                where: {
                    targetType: "POST",
                    targetId: input.id
                }
            });
            await tx.reaction.deleteMany({
                where: {
                    targetType: "COMMENT",
                    targetId: {
                        in: commentIds
                    }
                }
            });
            // Commentaires et sondage cascadent en DB.
            try {
                return await tx.post.delete({
                    where: {
                        id: input.id
                    }
                });
            } catch (err) {
                if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Post not found."
                    });
                }
                throw err;
            }
        });
    })
});
const __TURBOPACK__default__export__ = postRouter;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const storageProviderSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'cloudinary',
    'r2'
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const lifecycleStatusSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    'pending',
    'published',
    'bin'
]);
/* -------------------------------------------------------------------------- */ /*  Sources possibles d'un move                                               */ /* -------------------------------------------------------------------------- */ const fileSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('file'),
    /** Path concret du fichier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const folderSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    /** Path concret du dossier source. */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
 */ const selectionSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('selection'),
    roots: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).min(1),
    excluded: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).optional()
});
const moveSourceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    fileSourceSchema,
    folderSourceSchema,
    selectionSourceSchema
]);
/* -------------------------------------------------------------------------- */ /*  Cibles possibles d'un move                                                */ /* -------------------------------------------------------------------------- */ /**
 * Cible exprimée par un path concret.
 * Exemple : `target: { type: 'folder', path: 'AKFC/published/cours/12' }`.
 */ const concreteFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('folder'),
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
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
 */ const statusFolderTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('status-folder'),
    status: lifecycleStatusSchema
});
const moveTargetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('type', [
    concreteFolderTargetSchema,
    statusFolderTargetSchema
]);
const storageMoveIntentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    source: moveSourceSchema,
    target: moveTargetSchema
});
}),
"[project]/packages/contracts/src/storage/virtual-path.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/contracts/src/storage/r2-upload.schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createR2UploadAuthorizationSchema",
    ()=>createR2UploadAuthorizationSchema,
    "registerR2UploadedAssetSchema",
    ()=>registerR2UploadedAssetSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
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
const createR2UploadAuthorizationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    /**
   * Path virtuel cible (ex: "AKFC/pending/Cours/12/intro.mp3"). Doit
   * commencer par l'appRoot configuré côté backend — la validation
   * détaillée est faite par l'adapter.
   */ path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    /**
   * MIME type du fichier qui sera uploadé. Sera **verrouillé dans la
   * signature** du presigned POST — toute tentative d'upload avec un
   * Content-Type différent sera rejetée par R2.
   */ mimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    /**
   * Borne supérieure de taille en octets. Bornée par
   * `HARD_MAX_UPLOAD_BYTES` (500 MiB). R2 rejettera tout upload dont
   * `Content-Length` dépasse cette valeur.
   */ maxBytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(HARD_MAX_UPLOAD_BYTES, {
        message: `maxBytes ne peut pas dépasser ${HARD_MAX_UPLOAD_BYTES} octets (500 MiB). Pour les fichiers plus gros, utilise un multipart upload.`
    })
});
const registerR2UploadedAssetSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    expectedBytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    expectedMimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
}),
"[project]/packages/contracts/src/storage/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$adapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.adapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/move.intent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/virtual-path.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$r2$2d$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/r2-upload.schema.ts [app-route] (ecmascript)");
;
;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$mappers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/cloudinary/mappers.ts [app-route] (ecmascript)");
;
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
            // ─── Bug fix critique : double tail ─────────────────────────────────
            //
            // `operation.target.path` est le path **FINAL** attendu pour l'item
            // après move (avec le nom du fichier/dossier concaténé par
            // `resolveTargetPath` dans `resolveMoveIntent.service.ts`). C'est le
            // contrat agnostique du module storage.
            //
            // Or le service Cloudinary `moveService` legacy attend
            // `target.fullPath` = path du **DOSSIER PARENT** dans lequel placer
            // l'item — il rajoute lui-même le nom dérivé du source via
            // `moveFileIntoFolder` (pour les fichiers) ou un concat similaire
            // (pour les folders).
            //
            // Sans cette correction, le rename Cloudinary final aboutit à un
            // path dupliqué :
            //   - source: `bin/.trash/<uuid>/trotinette`
            //   - target.path attendu: `pending/cours/X/trotinette`
            //   - target.fullPath envoyé à moveService: `pending/cours/X/trotinette`
            //   - moveService rajoute `/trotinette` → `pending/cours/X/trotinette/trotinette`
            //   - Cloudinary interprète comme un asset dans un "dossier" du même nom
            //     → effet visuel "dossier wrapper qui contient le fichier".
            //
            // Le R2 adapter, lui, attend directement le path final (cf. son `move`
            // qui passe `operation.target.path` à `moveFile` sans transformation).
            // Cette divergence est purement Cloudinary-specific et héritée du
            // moveService legacy qu'on n'a pas refactoré.
            //
            // Fix : on extrait le parent path AVANT de passer à moveService.
            const targetParentPath = operation.target.path.split("/").slice(0, -1).join("/");
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
                    fullPath: targetParentPath
                }
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$move$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["moveService"])(intent);
            // ─── Synchro MediaAsset (fullPath + status) ──────────────────────────
            //
            // moveService renomme dans Cloudinary mais ne touche JAMAIS la table
            // MediaAsset : sans cette synchro, les `fullPath` deviennent périmés
            // (résolutions par chemin cassées — bug picker taolu, 2026-07-03) et
            // le `status` reste figé (assets publiés invisibles du public).
            //
            // Deltas vs le pattern R2 :
            //   - préfixe : les fullPath Cloudinary incluent l'appRoot
            //     (`AKFC/pending/…`), les paths d'opération non ;
            //   - extension : fullPath = `publicId.format` — le SQL préserve le
            //     suffixe par SUBSTRING (un updateMany à valeur fixe le perdrait) ;
            //   - status : dérivé du premier segment du chemin CIBLE
            //     (`pending`/`published` uniquement — la corbeille a son propre
            //     mécanisme TrashEntry) ;
            //   - LIKE : `%` et `_` sont des jokers SQL — les noms de fichiers
            //     regorgent d'underscores, on échappe (ESCAPE '\').
            // Les chemins d'opération INCLUENT l'appRoot (invariant de
            // resolveTargetPath : parts[0] === appRoot) — on les utilise
            // tels quels ; les préfixer une seconde fois faisait chercher
            // `AKFC/AKFC/…` (zéro match silencieux, 2026-07-03).
            const escLike = (s)=>s.replace(/([\\%_])/g, "\\$1");
            const srcDb = operation.source.path;
            const dstDb = operation.target.path;
            // Statut = segment APRÈS l'appRoot ([1], pas [0] qui est l'appRoot).
            const topSegment = operation.target.path.split("/")[1];
            const nextStatus = topSegment === "pending" || topSegment === "published" ? topSegment : null;
            if (operation.source.type === "file") {
                // Exact (fullPath sans extension, improbable) OU `préfixe.` + ext.
                // (1) fullPath + status par substitution de préfixe (fullPath a
                //     l'extension → la longueur srcDb.length est correcte pour LUI).
                await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${dstDb} || SUBSTRING("fullPath" FROM ${srcDb.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND ("fullPath" = ${srcDb}
              OR "fullPath" LIKE ${escLike(srcDb) + ".%"} ESCAPE '\\');
        `;
                // (2) publicId dérivé du NOUVEAU fullPath, sans son extension.
                //     ⚠ On NE PEUT PAS réutiliser la substitution de fullPath pour
                //     publicId : `srcDb` inclut l'extension alors que publicId n'en a
                //     pas → `SUBSTRING(publicId FROM srcDb.length+1)` couperait trop
                //     et laissait publicId périmé (bug désync 2026-07, aperçus 404).
                //     Par invariant publicId === fullPath sans extension : on le
                //     recalcule donc directement depuis le fullPath fraîchement mis à
                //     jour, pour toutes les lignes désormais sous dstDb.
                await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "publicId" = regexp_replace("fullPath", '\\.[^./]+$', '')
          WHERE "appRoot" = ${appRoot}
            AND ("fullPath" = ${dstDb}
              OR "fullPath" LIKE ${escLike(dstDb) + ".%"} ESCAPE '\\');
        `;
            } else {
                const oldPrefix = `${srcDb}/`;
                const newPrefix = `${dstDb}/`;
                await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
              "publicId" = ${newPrefix} || SUBSTRING("publicId" FROM ${oldPrefix.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" LIKE ${escLike(oldPrefix) + "%"} ESCAPE '\\';
        `;
            }
            // ─── Nettoyage du dossier source vidé ───────────────────────────────
            //
            // moveService renomme les assets mais ne touche pas la table `Folder`
            // (registre qui sert à afficher les dossiers vides). Quand un move vide
            // un dossier source, sa ligne `Folder` survit → dossier fantôme dans la
            // vue source. On prune ces lignes orphelines ici.
            //
            // Rappel : `resolveMoveIntent` expanse les selections en moves de
            // FICHIERS atomiques. C'est donc le move du dernier fichier d'un dossier
            // qui le vide réellement — `folderHasAssets` renverra false uniquement à
            // ce moment-là, les précédents s'arrêtant immédiatement (dossier encore
            // peuplé). Pour une source `folder`, on part du dossier lui-même.
            const startFolderPath = operation.source.type === "file" ? operation.source.path.split("/").slice(0, -1).join("/") : operation.source.path;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$pruneEmptyFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pruneEmptyFolders"])({
                prisma,
                appRoot,
                startFolderPath
            });
        },
        // delete: NON IMPLÉMENTÉ (cf. doc en tête de fichier). Le contrat
        // autorise l'absence — la propriété restera `undefined` sur l'objet.
        /* ====================================================================== */ /*  createUploadAuthorization — délivre des signatures Cloudinary         */ /* ====================================================================== */ async createUploadAuthorization (input) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$createUploadSignatures$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignatures"])({
                prisma,
                appRoot,
                userId: input.userId,
                destination: input.destination,
                assets: input.assets,
                allowOverwrite: input.allowOverwrite
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
"[project]/packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createR2StorageAdapter",
    ()=>createR2StorageAdapter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$s3$2d$request$2d$presigner$40$3$2e$1056$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@aws-sdk+s3-request-presigner@3.1056.0/node_modules/@aws-sdk/s3-request-presigner/dist-es/getSignedUrl.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/r2/client.ts [app-route] (ecmascript)");
;
;
;
function createR2StorageAdapter(deps) {
    const { prisma, appRoot } = deps;
    return {
        /* ====================================================================== */ /*  Lecture                                                               */ /* ====================================================================== */ async list (options) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            const Prefix = ensureTrailingSlash(options.path);
            const response = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
                Bucket,
                Prefix,
                Delimiter: "/",
                MaxKeys: options.limit ?? 1000,
                ContinuationToken: options.cursor
            }));
            const folders = (response.CommonPrefixes ?? []).map((cp)=>cp.Prefix).filter((p)=>Boolean(p)).map((fullPath)=>{
                const normalizedPath = stripTrailingSlash(fullPath);
                return {
                    type: "folder",
                    name: lastSegment(normalizedPath),
                    path: normalizedPath,
                    hasChildren: true
                };
            });
            const files = (response.Contents ?? []).filter((obj)=>Boolean(obj.Key) && obj.Key !== Prefix).map((obj)=>objectToFileNode(obj));
            return {
                folders,
                files,
                nextCursor: response.NextContinuationToken ?? null
            };
        },
        async getTree (options) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            const depth = options.depth ?? 1;
            const root = await buildSubTree(s3, Bucket, options.path, depth);
            return {
                root
            };
        },
        async getNode (path) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            try {
                const head = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["HeadObjectCommand"]({
                    Bucket,
                    Key: path
                }));
                return {
                    type: "file",
                    name: lastSegment(path),
                    path,
                    metadata: {
                        bytes: head.ContentLength,
                        updatedAt: head.LastModified?.toISOString(),
                        mimeType: head.ContentType ?? inferMimeFromPath(path),
                        format: extensionOf(path)
                    }
                };
            } catch (err) {
                if (!isNotFoundError(err)) throw err;
            }
            const Prefix = ensureTrailingSlash(path);
            const list = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
                Bucket,
                Prefix,
                Delimiter: "/",
                MaxKeys: 1
            }));
            const hasAny = (list.Contents?.length ?? 0) > 0 || (list.CommonPrefixes?.length ?? 0) > 0;
            if (!hasAny) return null;
            return {
                type: "folder",
                name: lastSegment(path),
                path,
                hasChildren: true
            };
        },
        async getMetadata (path) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            try {
                const head = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["HeadObjectCommand"]({
                    Bucket,
                    Key: path
                }));
                return {
                    bytes: head.ContentLength,
                    updatedAt: head.LastModified?.toISOString(),
                    mimeType: head.ContentType ?? inferMimeFromPath(path),
                    format: extensionOf(path)
                };
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
        /* ====================================================================== */ /*  Écriture                                                              */ /* ====================================================================== */ async move (operation) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            // Statut dérivé du premier segment du chemin cible (même logique
            // que l'adapter Cloudinary — le trou était identique ici).
            // Statut = segment APRÈS l'appRoot ([1] — les paths incluent l'appRoot).
            const topSegment = operation.target.path.split("/")[1];
            const nextStatus = topSegment === "pending" || topSegment === "published" ? topSegment : null;
            if (operation.source.type === "file") {
                await moveFile(s3, Bucket, operation.source.path, operation.target.path);
                // Phase 2 : on update aussi la row MediaAsset pour refléter le nouveau path
                await prisma.mediaAsset.updateMany({
                    where: {
                        appRoot,
                        fullPath: operation.source.path
                    },
                    data: {
                        fullPath: operation.target.path,
                        ...nextStatus ? {
                            status: nextStatus
                        } : {}
                    }
                });
                return;
            }
            await moveFolder(s3, Bucket, operation.source.path, operation.target.path);
            // Pour les folders : update tous les MediaAssets sous le préfixe.
            // On fait ça en SQL raw pour profiter du UPDATE...SET en une passe
            // (Prisma ne supporte pas REPLACE/SUBSTRING dans updateMany).
            const oldPrefix = `${operation.source.path}/`;
            const newPrefix = `${operation.target.path}/`;
            await prisma.$executeRaw`
        UPDATE "MediaAsset"
        SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
            "status" = COALESCE(${nextStatus}, "status")
        WHERE "appRoot" = ${appRoot} AND "fullPath" LIKE ${oldPrefix + "%"};
      `;
        },
        async delete (path) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["DeleteObjectCommand"]({
                Bucket,
                Key: path
            }));
            await deleteAllUnderPrefix(s3, Bucket, path);
            // Phase 2 : nettoyer les MediaAssets DB correspondantes
            await prisma.mediaAsset.deleteMany({
                where: {
                    appRoot,
                    OR: [
                        {
                            fullPath: path
                        },
                        {
                            fullPath: {
                                startsWith: `${path}/`
                            }
                        }
                    ]
                }
            });
        },
        /* ====================================================================== */ /*  Upload                                                                */ /* ====================================================================== */ async createUploadAuthorization (input) {
            assertUploadPathSafe(input.path, appRoot);
            assertUploadConstraints(input);
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            const expiresInSeconds = 5 * 60;
            const expiresAtMs = Date.now() + expiresInSeconds * 1000;
            const command = new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["PutObjectCommand"]({
                Bucket,
                Key: input.path,
                ContentType: input.mimeType
            });
            const uploadUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$aws$2d$sdk$2b$s3$2d$request$2d$presigner$40$3$2e$1056$2e$0$2f$node_modules$2f40$aws$2d$sdk$2f$s3$2d$request$2d$presigner$2f$dist$2d$es$2f$getSignedUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSignedUrl"])(s3, command, {
                expiresIn: expiresInSeconds
            });
            return {
                uploadUrl,
                fields: {},
                expiresAt: new Date(expiresAtMs).toISOString()
            };
        },
        /**
     * Phase 2 — créer la row MediaAsset après validation HeadObject.
     *
     * Pipeline :
     *   1. HeadObject pour confirmer l'existence + valider taille/mime
     *   2. Résoudre categoryId/disciplineId depuis input.destination
     *   3. Créer la row MediaAsset avec :
     *      - fullPath = input.path (clé universelle)
     *      - publicId/secureUrl/resourceType = null (concepts Cloudinary-only)
     *      - originalFileName = input.originalFileName
     *      - mimeType, bytes = depuis HeadObject (source de vérité serveur)
     *      - categoryId/disciplineId/proposedDisciplineName = depuis destination
     *      - uploaderUserId = input.userId (depuis ctx.user.id côté router)
     *      - status = 'pending' (les uploads atterrissent toujours en pending)
     */ async registerUploadedAsset (input) {
            const s3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Client"])();
            const Bucket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getR2Bucket"])();
            // 1. HeadObject — confirme existence + sert de source de vérité
            const head = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["HeadObjectCommand"]({
                Bucket,
                Key: input.path
            })).catch((err)=>{
                if (isNotFoundError(err)) {
                    throw new Error(`Upload introuvable sur R2 : ${input.path}. ` + `Le client a peut-être abandonné avant de finir l'upload.`);
                }
                throw err;
            });
            const actualBytes = head.ContentLength ?? 0;
            const actualMime = head.ContentType ?? "";
            if (actualBytes !== input.expectedBytes) {
                throw new Error(`Taille incohérente sur ${input.path} : ` + `attendu ${input.expectedBytes}, reçu ${actualBytes}.`);
            }
            if (actualMime !== input.expectedMimeType) {
                throw new Error(`MIME type incohérent sur ${input.path} : ` + `attendu "${input.expectedMimeType}", reçu "${actualMime}".`);
            }
            // 2. Résoudre destination → categoryId + disciplineId
            //
            // Cas existing-discipline : on a directement les FK.
            // Cas new-discipline : on garde proposedDisciplineName, disciplineId = null.
            let categoryId = null;
            let disciplineId = null;
            let proposedDisciplineName = null;
            switch(input.destination.kind){
                case "existing-discipline":
                    categoryId = input.destination.categoryId;
                    disciplineId = input.destination.disciplineId;
                    break;
                case "new-discipline":
                    categoryId = input.destination.categoryId;
                    proposedDisciplineName = input.destination.proposedDisciplineName;
                    break;
                case "general":
                    break;
                case "event":
                    break;
                case "perso":
                    // R2 perso toujours reporté (photos Cloudinary d'abord).
                    throw new Error("La destination 'perso' n'est pas supportée pour les uploads R2.");
                default:
                    // Exhaustivité : un nouveau kind non traité fera échouer le build ici.
                    input.destination;
                    throw new Error("Unhandled upload destination kind.");
            }
            // 3. Création de la MediaAsset.
            //
            // Idempotence : si l'user re-soumet le même fichier (même path),
            // la contrainte @unique sur fullPath bloque le create. On utilise
            // upsert pour faire évoluer la row existante plutôt que d'échouer.
            // C'est cohérent avec le comportement Cloudinary (re-upload écrase).
            const asset = await prisma.mediaAsset.upsert({
                where: {
                    fullPath: input.path
                },
                create: {
                    fullPath: input.path,
                    publicId: null,
                    secureUrl: null,
                    resourceType: null,
                    mimeType: actualMime,
                    format: extensionOf(input.path),
                    originalFileName: input.originalFileName,
                    bytes: actualBytes,
                    appRoot,
                    status: "pending",
                    categoryId,
                    disciplineId,
                    proposedDisciplineName,
                    uploaderUserId: input.userId
                },
                update: {
                    mimeType: actualMime,
                    bytes: actualBytes,
                    originalFileName: input.originalFileName,
                    // Pas de changement de catégorie/discipline sur re-upload (ce qui
                    // serait peu intuitif — l'user qui re-soumet veut juste écraser).
                    uploaderUserId: input.userId
                }
            });
            return {
                ok: true,
                path: input.path,
                bytes: actualBytes,
                mimeType: actualMime,
                mediaAssetId: asset.id
            };
        }
    };
}
/* -------------------------------------------------------------------------- */ /*  Helpers — listing récursif                                                */ /* -------------------------------------------------------------------------- */ async function buildSubTree(s3, Bucket, path, depth) {
    const Prefix = ensureTrailingSlash(path);
    const normalizedPath = stripTrailingSlash(path);
    const response = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
        Bucket,
        Prefix,
        Delimiter: "/",
        MaxKeys: 1000
    }));
    const subPrefixes = (response.CommonPrefixes ?? []).map((cp)=>cp.Prefix).filter((p)=>Boolean(p)).map(stripTrailingSlash);
    let subFolders;
    if (depth > 0) {
        subFolders = await Promise.all(subPrefixes.map((p)=>buildSubTree(s3, Bucket, p, depth - 1)));
    } else {
        subFolders = subPrefixes.map((p)=>({
                type: "folder",
                name: lastSegment(p),
                path: p,
                hasChildren: true
            }));
    }
    const files = (response.Contents ?? []).filter((obj)=>Boolean(obj.Key) && obj.Key !== Prefix).map((obj)=>objectToFileNode(obj));
    const children = [
        ...subFolders,
        ...files
    ];
    return {
        type: "folder",
        name: lastSegment(normalizedPath),
        path: normalizedPath,
        children,
        hasChildren: children.length > 0
    };
}
function objectToFileNode(obj) {
    return {
        type: "file",
        name: lastSegment(obj.Key),
        path: obj.Key,
        metadata: {
            bytes: obj.Size,
            updatedAt: obj.LastModified?.toISOString(),
            mimeType: inferMimeFromPath(obj.Key),
            format: extensionOf(obj.Key)
        }
    };
}
/* -------------------------------------------------------------------------- */ /*  Helpers — validation upload                                               */ /* -------------------------------------------------------------------------- */ const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
function assertUploadPathSafe(path, appRoot) {
    if (!path) throw new Error("createUploadAuthorization: path vide");
    if (path.startsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas commencer par "/" (reçu: "${path}")`);
    if (path.endsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas se terminer par "/" (reçu: "${path}")`);
    if (path.includes("..")) throw new Error(`createUploadAuthorization: segment ".." interdit (path traversal) dans "${path}"`);
    if (path.includes("//")) throw new Error(`createUploadAuthorization: "//" consécutifs interdits dans "${path}"`);
    if (!path.startsWith(`${appRoot}/`)) {
        throw new Error(`createUploadAuthorization: path doit commencer par "${appRoot}/" ` + `(reçu: "${path}"). Aucun upload hors de la racine applicative n'est autorisé.`);
    }
}
function assertUploadConstraints(input) {
    if (!input.mimeType || input.mimeType.length === 0) {
        throw new Error("createUploadAuthorization: mimeType requis");
    }
    if (input.maxBytes <= 0) {
        throw new Error(`createUploadAuthorization: maxBytes doit être > 0 (reçu: ${input.maxBytes})`);
    }
    if (input.maxBytes > HARD_MAX_UPLOAD_BYTES) {
        throw new Error(`createUploadAuthorization: maxBytes ${input.maxBytes} dépasse la limite ` + `dure de ${HARD_MAX_UPLOAD_BYTES} octets.`);
    }
}
/* -------------------------------------------------------------------------- */ /*  Helpers — écriture                                                        */ /* -------------------------------------------------------------------------- */ async function moveFile(s3, Bucket, srcKey, dstKey) {
    await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["CopyObjectCommand"]({
        Bucket,
        Key: dstKey,
        CopySource: buildCopySource(Bucket, srcKey)
    }));
    await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["DeleteObjectCommand"]({
        Bucket,
        Key: srcKey
    }));
}
async function moveFolder(s3, Bucket, srcPath, dstPath) {
    const srcPrefix = ensureTrailingSlash(srcPath);
    const dstPrefix = ensureTrailingSlash(dstPath);
    let continuationToken;
    do {
        const response = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
            Bucket,
            Prefix: srcPrefix,
            ContinuationToken: continuationToken,
            MaxKeys: 1000
        }));
        const objects = (response.Contents ?? []).filter((o)=>Boolean(o.Key));
        if (objects.length > 0) {
            await Promise.all(objects.map((obj)=>{
                const relativeKey = obj.Key.slice(srcPrefix.length);
                const newKey = dstPrefix + relativeKey;
                return s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["CopyObjectCommand"]({
                    Bucket,
                    Key: newKey,
                    CopySource: buildCopySource(Bucket, obj.Key)
                }));
            }));
            await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["DeleteObjectsCommand"]({
                Bucket,
                Delete: {
                    Objects: objects.map((o)=>({
                            Key: o.Key
                        })),
                    Quiet: true
                }
            }));
        }
        continuationToken = response.NextContinuationToken;
    }while (continuationToken)
}
async function deleteAllUnderPrefix(s3, Bucket, path) {
    const Prefix = ensureTrailingSlash(path);
    let continuationToken;
    do {
        const response = await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["ListObjectsV2Command"]({
            Bucket,
            Prefix,
            ContinuationToken: continuationToken,
            MaxKeys: 1000
        }));
        const objects = (response.Contents ?? []).filter((o)=>Boolean(o.Key));
        if (objects.length > 0) {
            await s3.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$29$__["DeleteObjectsCommand"]({
                Bucket,
                Delete: {
                    Objects: objects.map((o)=>({
                            Key: o.Key
                        })),
                    Quiet: true
                }
            }));
        }
        continuationToken = response.NextContinuationToken;
    }while (continuationToken)
}
function buildCopySource(Bucket, srcKey) {
    const encodedKey = srcKey.split("/").map(encodeURIComponent).join("/");
    return `${Bucket}/${encodedKey}`;
}
/* -------------------------------------------------------------------------- */ /*  Helpers — paths                                                           */ /* -------------------------------------------------------------------------- */ function lastSegment(path) {
    const trimmed = stripTrailingSlash(path);
    const i = trimmed.lastIndexOf("/");
    return i === -1 ? trimmed : trimmed.slice(i + 1);
}
function stripTrailingSlash(path) {
    return path.endsWith("/") ? path.slice(0, -1) : path;
}
function ensureTrailingSlash(path) {
    return path.endsWith("/") ? path : `${path}/`;
}
function extensionOf(path) {
    const name = lastSegment(path);
    const i = name.lastIndexOf(".");
    if (i === -1 || i === name.length - 1) return undefined;
    return name.slice(i + 1).toLowerCase();
}
/* -------------------------------------------------------------------------- */ /*  Helpers — MIME inference & error detection                                */ /* -------------------------------------------------------------------------- */ function inferMimeFromPath(path) {
    const ext = extensionOf(path);
    if (!ext) return "application/octet-stream";
    switch(ext){
        case "mp3":
            return "audio/mpeg";
        case "wav":
            return "audio/wav";
        case "ogg":
            return "audio/ogg";
        case "m4a":
            return "audio/mp4";
        case "flac":
            return "audio/flac";
        case "aac":
            return "audio/aac";
        case "opus":
            return "audio/opus";
        case "pdf":
            return "application/pdf";
        case "txt":
            return "text/plain";
        case "md":
        case "markdown":
            return "text/markdown";
        case "json":
            return "application/json";
        case "csv":
            return "text/csv";
        case "xml":
            return "application/xml";
        case "html":
            return "text/html";
        case "doc":
            return "application/msword";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "xls":
            return "application/vnd.ms-excel";
        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        case "ppt":
            return "application/vnd.ms-powerpoint";
        case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case "zip":
            return "application/zip";
        case "tar":
            return "application/x-tar";
        case "gz":
            return "application/gzip";
        case "rar":
            return "application/vnd.rar";
        case "7z":
            return "application/x-7z-compressed";
        default:
            return "application/octet-stream";
    }
}
function isNotFoundError(err) {
    if (typeof err !== "object" || err === null) return false;
    const e = err;
    if (e.name === "NotFound" || e.name === "NoSuchKey") return true;
    if (e.$metadata?.httpStatusCode === 404) return true;
    return false;
}
}),
"[project]/packages/backend/src/modules/storage/adapters/r2/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$r2StorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts [app-route] (ecmascript)");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/r2/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$r2StorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts [app-route] (ecmascript)");
;
;
function getAdapter(provider, deps) {
    switch(provider){
        case "cloudinary":
            // `as AdapterFor<P>` est nécessaire ici parce que TypeScript ne peut
            // pas inférer la corrélation entre la valeur littérale du discriminant
            // et le générique `P` à l'intérieur du switch. Le cast est sûr parce
            // que le case ne s'exécute que pour P === 'cloudinary'.
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$cloudinary$2f$cloudinaryStorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCloudinaryStorageAdapter"])(deps);
        case "r2":
            // R2 — stub pour l'instant (sous-chantier 3.B). Implémentation réelle
            // au sous-chantier 6.A. Le contrat de la factory ne changera pas, donc
            // ce callsite restera valide.
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$adapters$2f$r2$2f$r2StorageAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createR2StorageAdapter"])(deps);
        default:
            // Le typecheck nous garantit que ce default est inatteignable tant
            // que tous les cas de l'enum sont couverts. Si tu ajoutes un provider
            // sans l'enregistrer ici, tu auras un type error de cohérence.
            throw new Error(`Unknown storage provider: ${String(provider)}`);
    }
}
}),
"[project]/packages/backend/src/modules/storage/virtualStorage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VirtualStorage",
    ()=>VirtualStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/virtual-path.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/providerRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/cloudinary/services/cloudinary.service.ts [app-route] (ecmascript)");
;
;
;
const STATUS_SEGMENTS = [
    'pending',
    'published',
    'bin'
];
/**
 * Statut applicatif dérivé d'un path : le segment juste après l'appRoot.
 * `AKFC/published/cours/x/trotinette` → 'published'. Renvoie null si le
 * segment n'est pas un statut connu. Convention identique au front
 * (statusFromPath) et à resolveMoveIntent, dupliquée ici pour ne pas créer
 * de dépendance backend → features front.
 */ function statusFromPath(path, appRoot) {
    const parts = path.split('/').filter(Boolean);
    const rootParts = appRoot.split('/').filter(Boolean);
    const seg = parts[rootParts.length];
    return STATUS_SEGMENTS.includes(seg) ? seg : null;
}
class VirtualStorage {
    cloudinary;
    r2;
    deps;
    constructor(deps){
        this.deps = deps;
        this.cloudinary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("cloudinary", deps);
        this.r2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("r2", deps);
    }
    /* ====================================================================== */ /*  Lecture                                                               */ /* ====================================================================== */ async list(options) {
        const results = await Promise.allSettled([
            this.cloudinary.list(options),
            this.r2.list(options)
        ]);
        const cloudinary = pickFulfilled(results[0], "cloudinary.list");
        const r2 = pickFulfilled(results[1], "r2.list");
        if (!cloudinary && !r2) {
            // Les deux providers en panne — on propage la première erreur.
            throw results[0].reason;
        }
        return {
            folders: dedupeFoldersByPath([
                ...cloudinary?.folders ?? [],
                ...r2?.folders ?? []
            ]),
            files: [
                ...cloudinary?.files ?? [],
                ...r2?.files ?? []
            ],
            nextCursor: null
        };
    }
    async getTree(options) {
        const results = await Promise.allSettled([
            this.cloudinary.getTree(options),
            this.r2.getTree(options)
        ]);
        const cloudinary = pickFulfilled(results[0], "cloudinary.getTree");
        const r2 = pickFulfilled(results[1], "r2.getTree");
        if (!cloudinary && !r2) {
            throw results[0].reason;
        }
        // Si l'un des deux a répondu, on l'utilise comme base et on merge l'autre
        // s'il a répondu aussi. Sinon on retourne juste celui qui a répondu.
        if (cloudinary && r2) {
            return {
                root: mergeFolderTrees(cloudinary.root, r2.root)
            };
        }
        return {
            root: (cloudinary ?? r2).root
        };
    }
    async getNode(path) {
        const results = await Promise.allSettled([
            this.cloudinary.getNode ? this.cloudinary.getNode(path) : Promise.resolve(null),
            this.r2.getNode ? this.r2.getNode(path) : Promise.resolve(null)
        ]);
        const c = pickFulfilled(results[0], "cloudinary.getNode");
        const r = pickFulfilled(results[1], "r2.getNode");
        if (results[0].status === "rejected" && results[1].status === "rejected") {
            throw results[0].reason;
        }
        // ⚠️ On PRÉFÈRE une réponse `file` concrète à une réponse `folder`.
        //
        // Un fichier à un path donné est non-ambigu ; une réponse `folder` est
        // souvent un provider qui rapporte un préfixe de façon optimiste — cas
        // typique : Cloudinary répond "folder" pour le path d'un fichier qui vit
        // en réalité sur R2. Avec un simple `c ?? r`, ce folder Cloudinary
        // masquait le `file` de R2 → resolveMoveIntent traitait le fichier R2
        // comme un dossier, `getTree` dessus ne ramassait rien, et l'item était
        // ignoré en silence lors d'un move multi-sélection. Préférer le `file`
        // corrige ça à la racine.
        const candidates = [
            c,
            r
        ].filter((n)=>n != null);
        const file = candidates.find((n)=>n.type === "file");
        return file ?? candidates[0] ?? null;
    }
    async getMetadata(path) {
        // On ne peut pas deviner le provider d'un path sans interroger la DB. On ne peut pas non plus se fier à l'extension (Cloudinary est extensionless). On doit donc interroger la DB pour savoir qui héberge le fichier, puis interroger le provider correspondant.
        const primary = await this.resolveProvider(path);
        const primaryAdapter = primary === "cloudinary" ? this.cloudinary : this.r2;
        const fallbackAdapter = primary === "cloudinary" ? this.r2 : this.cloudinary;
        try {
            if (primaryAdapter.getMetadata) {
                return await primaryAdapter.getMetadata(path);
            }
        } catch (err) {
            console.warn(`[VirtualStorage] primary getMetadata (${primary}) failed for "${path}", trying fallback. Error:`, err);
        }
        if (fallbackAdapter.getMetadata) {
            return fallbackAdapter.getMetadata(path);
        }
        return null;
    }
    /* ====================================================================== */ /*  Dispatch de provider — autoritaire via la DB                          */ /* ====================================================================== */ /**
   * Détermine quel provider héberge le file à ce virtual path, en lisant le
   * discriminant DB plutôt qu'en devinant par l'extension.
   *
   * ─── Pourquoi pas l'extension ───────────────────────────────────────────
   *
   * Dans l'espace des virtual paths, un asset Cloudinary est EXTENSIONLESS
   * (c'est son public_id), un asset R2 porte son extension (vraie clé de
   * fichier). `pickBackendByExtension` faisait donc tomber tout public_id
   * Cloudinary (`…/trotinette`) sur le défaut R2 → `NoSuchKey` au move. Et un
   * public_id contenant un point (`…/taolu-v2.1`) piégerait n'importe quelle
   * heuristique. La source de vérité est la ligne `MediaAsset` : `publicId`
   * non-null ⇒ Cloudinary, `publicId` null ⇒ R2.
   *
   * ─── Matching tolérant (identique au media router) ──────────────────────
   *
   * Le `fullPath` stocké porte l'extension. Pour R2 le virtual path la porte
   * aussi → égalité stricte. Pour Cloudinary le virtual path est le public_id
   * extensionless → on matche `fullPath` commençant par `path + '.'`.
   *
   * Repli si la DB ne connaît pas le path (orphelin non enregistré, ou DB
   * indisponible) : heuristique améliorée `fallbackProviderForPath`.
   */ async resolveProvider(path) {
        const { prisma, appRoot } = this.deps;
        try {
            const asset = await prisma.mediaAsset.findFirst({
                where: {
                    appRoot,
                    OR: [
                        {
                            fullPath: path
                        },
                        {
                            fullPath: {
                                startsWith: `${path}.`
                            }
                        }
                    ]
                },
                select: {
                    publicId: true
                }
            });
            if (asset) return asset.publicId == null ? "r2" : "cloudinary";
        } catch (err) {
            console.warn(`[VirtualStorage] resolveProvider: lookup DB échoué pour "${path}", repli heuristique. Error:`, err);
        }
        return fallbackProviderForPath(path);
    }
    /**
   * Réconcilie la DB après un move physique réussi. Le move physique a déplacé
   * le fichier sur le provider, mais la DB n'est pas encore alignée sur le
   * nouvel emplacement (fullPath / publicId / status). Cette méthode met à
   * jour la ligne MediaAsset correspondante pour que la façade continue à
   * fonctionner correctement.
   * 
   * @param oldPath 
   * @param newPath 
   * @returns 
   */ async reconcileMovedAsset(oldPath, newPath) {
        const { prisma, appRoot } = this.deps;
        // Le provider est déterminé AVANT le move (la ligne existe encore à
        // l'ancien path). On le repasse pour éviter une 2e lecture DB.
        const provider = await this.resolveProvider(newPath).catch(()=>null);
        // R2 : pas d'asset_id Cloudinary. On réconcilie par fullPath (clé S3
        // exacte, qui EST le path — pas de fragilité d'historique côté R2 car la
        // clé R2 = le path, et le move R2 déplace réellement la clé).
        if (provider === "r2") {
            await prisma.mediaAsset.updateMany({
                where: {
                    appRoot,
                    fullPath: oldPath
                },
                data: {
                    fullPath: newPath,
                    ...statusFromPath(newPath, appRoot) ? {
                        status: statusFromPath(newPath, appRoot)
                    } : {}
                }
            });
            return;
        }
        // Cloudinary : on relit l'asset au NOUVEAU path pour son asset_id
        // immuable, puis on réancre la ligne par cet id — robuste quel que soit
        // l'historique des moves (contrairement au matching par ancien path).
        let info = null;
        try {
            info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$services$2f$cloudinary$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAssetInfo"])(newPath);
        } catch (err) {
            console.warn(`[VirtualStorage] reconcileMovedAsset: getAssetInfo("${newPath}") a échoué, réconciliation ignorée.`, err);
            return;
        }
        const assetId = info?.asset_id;
        if (!assetId) {
            console.warn(`[VirtualStorage] reconcileMovedAsset: pas d'asset_id pour "${newPath}", réconciliation ignorée.`);
            return;
        }
        const nextStatus = statusFromPath(newPath, appRoot);
        const nextFullPath = `${newPath}${info?.format ? "." + info.format : ""}`;
        await prisma.mediaAsset.updateMany({
            where: {
                appRoot,
                cloudinaryAssetId: assetId
            },
            data: {
                fullPath: nextFullPath,
                publicId: newPath,
                ...nextStatus ? {
                    status: nextStatus
                } : {}
            }
        });
    }
    /* ====================================================================== */ /*  Écriture                                                              */ /* ====================================================================== */ async move(operation) {
        if (operation.source.type === "file") {
            const provider = await this.resolveProvider(operation.source.path);
            const adapter = provider === "cloudinary" ? this.cloudinary : this.r2;
            if (!adapter.move) {
                throw new Error(`move(file) non supporté sur le provider "${provider}"`);
            }
            await adapter.move(operation);
            // Le déplacement physique a réussi : on aligne la DB sur le nouvel
            // emplacement (fullPath / publicId / status), sinon resolveByPaths,
            // l'enrichissement et les filtres par status restent sur l'ancien path.
            await this.reconcileMovedAsset(operation.source.path, operation.target.path);
            return;
        }
        // Folder → on applique aux backends qui SUPPORTENT move. Un dossier
        // "logique" peut contenir des items des deux. Les "n'existe pas" sont
        // tolérés silencieusement (au moins un des deux doit réussir).
        const promises = [];
        if (this.cloudinary.move) promises.push(this.cloudinary.move(operation));
        if (this.r2.move) promises.push(this.r2.move(operation));
        if (promises.length === 0) {
            throw new Error("move(folder) : aucun provider n'implémente move");
        }
        const results = await Promise.allSettled(promises);
        const failures = results.filter((r)=>r.status === "rejected");
        // Si TOUS échouent, on remonte la première erreur.
        if (failures.length === promises.length) {
            throw failures[0].reason;
        }
    }
    async delete(path) {
        // Même logique que move : file → dispatch ; folder → broadcast tolérant.
        // On ne peut pas savoir sans interroger si le path est un file ou un
        // folder. Stratégie pragmatique : on tente d'abord en mode file
        // (dispatch par extension). Si l'extension ne donne pas de signal
        // clair (pas d'extension), on broadcast aux deux.
        const hasExtension = /\.[^/]+$/.test(path);
        if (hasExtension) {
            const provider = await this.resolveProvider(path);
            const adapter = provider === "cloudinary" ? this.cloudinary : this.r2;
            if (!adapter.delete) {
                throw new Error(`delete non supporté sur le provider "${provider}"`);
            }
            return adapter.delete(path);
        }
        const promises = [];
        if (this.cloudinary.delete) promises.push(this.cloudinary.delete(path));
        if (this.r2.delete) promises.push(this.r2.delete(path));
        if (promises.length === 0) {
            throw new Error("delete(folder) : aucun provider n'implémente delete");
        }
        const results = await Promise.allSettled(promises);
        const failures = results.filter((r)=>r.status === "rejected");
        if (failures.length === promises.length) {
            throw failures[0].reason;
        }
    }
}
/* -------------------------------------------------------------------------- */ /*  Helpers internes — tolérance aux pannes                                   */ /* -------------------------------------------------------------------------- */ /**
 * Extrait la valeur d'une promesse settled, en loggant l'erreur si elle est
 * rejetée. Retourne `null` en cas d'erreur — le caller décide quoi faire
 * (typiquement : utiliser l'autre backend ou propager si les deux ont échoué).
 *
 * Cette discipline transforme la façade en système robuste : un provider en
 * panne ne fait pas tomber tout le finder, il est juste invisible le temps
 * de la panne, avec un log côté serveur pour diagnostic.
 */ function pickFulfilled(result, context) {
    if (result.status === "fulfilled") return result.value;
    console.warn(`[VirtualStorage] ${context} failed — provider ignored for this call. Error:`, result.reason);
    return null;
}
/* -------------------------------------------------------------------------- */ /*  Helpers internes — déduplication                                          */ /* -------------------------------------------------------------------------- */ /**
 * Déduplique une liste de folders par leur `path`.
 *
 * Quand un dossier "logique" existe dans les deux backends (parce qu'il
 * a été créé par des items Cloudinary ET R2 sous-jacents), la façade le
 * voit deux fois. On garde la première occurrence — leur structure
 * surface (name, path) est censée être identique de toute façon.
 *
 * Si l'un des deux porte des `children` chargés et l'autre non, on
 * privilégie celui qui en a (logique "plus d'info gagne").
 */ function dedupeFoldersByPath(folders) {
    const map = new Map();
    for (const f of folders){
        const existing = map.get(f.path);
        if (!existing) {
            map.set(f.path, f);
            continue;
        }
        // Conflit : l'un des deux a peut-être plus d'info. On garde celui qui
        // a `children` chargé, sinon le premier.
        if (existing.children === undefined && f.children !== undefined) {
            map.set(f.path, f);
        }
    }
    return Array.from(map.values());
}
/**
 * Fusionne deux folder trees (racines partagées) en un seul arbre logique.
 *
 * Algo récursif : pour chaque sous-folder, on cherche les occurrences
 * dans les deux côtés et on les merge récursivement. Les files sont
 * concaténés (chaque file appartient à un seul backend).
 *
 * ─── Frontière de profondeur : ne JAMAIS matérialiser un `undefined` ─────
 *
 * Le contrat `StorageFolderNode` distingue deux états très différents :
 *
 *   children === undefined  → « non chargé » (profondeur max de getTree)
 *   children === []         → « vide pour de vrai »
 *
 * `mapClientFolderTreeToStorageNode` respecte scrupuleusement cette
 * distinction : à depth 0 il renvoie `{ children: undefined, hasChildren }`
 * pour que la TreeView sache qu'il reste quelque chose à charger.
 *
 * La version précédente de ce merge écrasait le premier état par le second :
 *
 *   children: [...mergedFolders, ...aFiles, ...bFiles]   // → [] si rien chargé
 *   hasChildren: mergedFolders.length + ... > 0          // → false
 *
 * Résultat : un dossier présent dans les DEUX backends et situé à la
 * frontière de profondeur ressortait `{ children: [], hasChildren: false }`.
 * La TreeView le traitait comme définitivement vide → impossible à déplier,
 * son contenu invisible. Le hint `hasChildren` des deux côtés était perdu.
 *
 * Règles rétablies ici :
 *   - `children` n'est matérialisé que si AU MOINS un côté l'a chargé.
 *     Si aucun des deux n'a chargé, on propage `undefined`.
 *   - `hasChildren` est l'OU des deux hints, jamais recalculé à la baisse.
 *     Un hint à `true` d'un côté survit même si l'autre côté est vide.
 *
 * ⚠️ Ce point devient critique avec le chantier « arbre sans strate de
 * statut » : le pliage fait converger `pending/<x>` et `published/<x>` sur
 * un même path logique, donc « présent des deux côtés » y est le cas NORMAL
 * et non plus l'exception.
 */ function mergeFolderTrees(a, b) {
    // Hint de présence d'enfants : c'est un OU, jamais un recalcul. Un côté
    // qui sait qu'il a des enfants (sans les avoir chargés) fait autorité.
    const hasChildrenHint = (a.hasChildren ?? false) || (b.hasChildren ?? false);
    const aLoaded = a.children !== undefined;
    const bLoaded = b.children !== undefined;
    // Aucun des deux n'a chargé ses enfants → on est à la frontière de
    // profondeur. On propage `undefined` (et surtout PAS `[]`), avec le hint.
    if (!aLoaded && !bLoaded) {
        return {
            type: "folder",
            name: a.name,
            path: a.path,
            hasChildren: hasChildrenHint
        };
    }
    const childrenA = a.children ?? [];
    const childrenB = b.children ?? [];
    // Map des sous-folders pour merge par nom
    const aFolders = new Map();
    const aFiles = [];
    for (const c of childrenA){
        if (c.type === "folder") aFolders.set(c.path, c);
        else aFiles.push(c);
    }
    const bFolders = new Map();
    const bFiles = [];
    for (const c of childrenB){
        if (c.type === "folder") bFolders.set(c.path, c);
        else bFiles.push(c);
    }
    const mergedFolders = [];
    for (const [path, fa] of aFolders){
        const fb = bFolders.get(path);
        mergedFolders.push(fb ? mergeFolderTrees(fa, fb) : fa);
        bFolders.delete(path);
    }
    // Folders uniques à B
    for (const fb of bFolders.values()){
        mergedFolders.push(fb);
    }
    const children = [
        ...mergedFolders,
        ...aFiles,
        ...bFiles
    ];
    return {
        type: "folder",
        name: a.name,
        path: a.path,
        children,
        // Le hint des deux côtés prime ; `children.length > 0` n'est qu'un
        // repli quand ni a ni b ne portaient de hint explicite.
        hasChildren: hasChildrenHint || children.length > 0
    };
}
/**
 * Repli de dispatch quand la DB ne connaît pas le path (orphelin non
 * enregistré, ou DB indisponible). Utilisé uniquement par `resolveProvider`.
 *
 * Invariant : un virtual path Cloudinary est extensionless (public_id), un
 * virtual path R2 porte son extension. Un segment final SANS extension ne
 * peut donc être qu'un public_id Cloudinary — plus fiable que le
 * `pickBackendByExtension` brut, qui routait l'extensionless vers R2.
 */ function fallbackProviderForPath(path) {
    const name = path.split("/").pop() ?? "";
    const dot = name.lastIndexOf(".");
    const hasRealExtension = dot > 0 && dot < name.length - 1;
    return hasRealExtension ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickBackendByExtension"])(path) : "cloudinary";
}
}),
"[project]/packages/backend/src/modules/storage/statusFoldingReadView.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatusFoldingReadView",
    ()=>StatusFoldingReadView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/logicalPath.ts [app-route] (ecmascript)");
;
class StatusFoldingReadView {
    inner;
    appRoot;
    constructor(inner, appRoot){
        this.inner = inner;
        this.appRoot = appRoot;
    }
    /* ====================================================================== */ /*  Lecture                                                               */ /* ====================================================================== */ async list(options) {
        const results = await this.readCandidates((path)=>this.inner.list({
                ...options,
                path
            }), options.path, 'list');
        // Les dossiers fusionnent par path logique ; les fichiers, JAMAIS.
        // Cf. `mergeFoldedFolders` pour le raisonnement sur les collisions.
        const folders = new Map();
        const files = [];
        for (const result of results){
            for (const folder of result.folders){
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFoldedStratumPath"])(folder.path, this.appRoot)) continue;
                const folded = this.foldFolder(folder);
                const existing = folders.get(folded.path);
                folders.set(folded.path, existing ? mergeFoldedFolders(existing, folded) : folded);
            }
            for (const file of result.files){
                files.push(this.foldFile(file));
            }
        }
        return {
            folders: [
                ...folders.values()
            ],
            files,
            // Les candidats sont consommés intégralement avant retour, comme dans
            // les adapters sous-jacents. Pas de pagination composée à ce stade.
            nextCursor: null
        };
    }
    async getTree(options) {
        const results = await this.readCandidates((path)=>this.inner.getTree({
                ...options,
                path
            }), options.path, 'getTree');
        const folded = results.map((result)=>this.foldFolder(result.root));
        // Tous les candidats repliés partagent désormais le même path logique
        // (celui demandé) : la réduction les empile deux à deux.
        return {
            root: folded.reduce((accumulator, tree)=>mergeFoldedFolders(accumulator, tree))
        };
    }
    async getNode(path) {
        const innerGetNode = this.inner.getNode?.bind(this.inner);
        if (!innerGetNode) return null;
        const answers = [];
        for (const candidate of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["physicalResolutionOrder"])(path, this.appRoot)){
            const outcome = await this.settle(()=>innerGetNode(candidate), `getNode(${candidate})`);
            if (outcome.ok && outcome.value) answers.push(outcome.value);
        }
        // ⚠️ On PRÉFÈRE une réponse `file` concrète à une réponse `folder`, pour
        // la même raison que `VirtualStorage.getNode` : un provider répond
        // volontiers « folder » sur un simple préfixe. Ici le risque est même
        // plus grand — le premier candidat est le chemin à plat, qui n'existe
        // pas encore avant l'étape 5 mais dont Cloudinary peut rapporter le
        // préfixe de façon optimiste, masquant le vrai fichier sous sa strate.
        const file = answers.find((node)=>node.type === 'file');
        const resolved = file ?? answers[0];
        return resolved ? this.foldNode(resolved) : null;
    }
    async getMetadata(path) {
        const innerGetMetadata = this.inner.getMetadata?.bind(this.inner);
        if (!innerGetMetadata) return null;
        // `physicalResolutionOrder` essaie le chemin TEL QUEL en premier : un
        // appelant qui détient déjà le `storagePath` (le cas normal) paie un
        // seul aller-retour. Les autres candidats sont un filet, pas la règle.
        for (const candidate of (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["physicalResolutionOrder"])(path, this.appRoot)){
            const outcome = await this.settle(()=>innerGetMetadata(candidate), `getMetadata(${candidate})`);
            if (outcome.ok && outcome.value) return outcome.value;
        }
        return null;
    }
    /* ====================================================================== */ /*  Interrogation des candidats                                           */ /* ====================================================================== */ /**
   * Lit les emplacements physiques d'un chemin logique et retourne les
   * réponses obtenues.
   *
   * Le premier candidat est lu SÉQUENTIELLEMENT, les suivants en parallèle :
   * à la racine le premier est l'ancêtre des autres, donc il réchauffe le
   * cache hiérarchique de `resourcesCache` et les deux suivants sont servis
   * en mémoire.
   *
   * Un candidat en échec est ignoré (un emplacement peut légitimement ne pas
   * exister — c'est même le cas normal pendant toute la transition). On ne
   * propage l'erreur que si AUCUN candidat n'a répondu : même discipline de
   * tolérance aux pannes que `VirtualStorage`.
   */ async readCandidates(read, requestedPath, label) {
        const [first, ...rest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["physicalCandidates"])(requestedPath, this.appRoot);
        const firstOutcome = await this.settle(()=>read(first), `${label}(${first})`);
        const restOutcomes = await Promise.all(rest.map((path)=>this.settle(()=>read(path), `${label}(${path})`)));
        const outcomes = [
            firstOutcome,
            ...restOutcomes
        ];
        const values = outcomes.filter((outcome)=>outcome.ok).map((outcome)=>outcome.value);
        if (values.length === 0) {
            const firstFailure = outcomes.find((outcome)=>!outcome.ok);
            throw firstFailure && !firstFailure.ok ? firstFailure.reason : new Error(`[StatusFoldingReadView] ${label}: aucun candidat lisible.`);
        }
        return values;
    }
    async settle(run, context) {
        try {
            return {
                ok: true,
                value: await run()
            };
        } catch (reason) {
            console.warn(`[StatusFoldingReadView] ${context} a échoué — candidat ignoré.`, reason);
            return {
                ok: false,
                reason
            };
        }
    }
    /* ====================================================================== */ /*  Pliage des nodes                                                      */ /* ====================================================================== */ foldNode(node) {
        return node.type === 'file' ? this.foldFile(node) : this.foldFolder(node);
    }
    /**
   * Un fichier garde son emplacement réel dans `storagePath` et prend son
   * chemin logique dans `path`.
   *
   * `storagePath` est renseigné SYSTÉMATIQUEMENT, même quand il est déjà
   * égal à `path` (asset à plat, ou fichier de corbeille). L'invariant
   * « tout fichier sorti de cette vue porte son storagePath » évite aux
   * consommateurs un `?? path` défensif, et rend la suppression du champ
   * à l'étape 5 mécanique.
   */ foldFile(file) {
        return {
            ...file,
            path: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toLogicalPath"])(file.path, this.appRoot),
            storagePath: file.path
        };
    }
    /**
   * Un dossier prend son chemin logique — et PAS de `storagePath`.
   *
   * C'est délibéré : un dossier logique correspond à plusieurs dossiers
   * physiques (un par strate), il n'a donc pas d'emplacement réel unique à
   * désigner. Poser un `storagePath` arbitraire serait un mensonge sur
   * lequel du code finirait par s'appuyer.
   *
   * Deux dossiers logiques ne peuvent pas entrer en collision (ils
   * fusionnent), donc leur `path` suffit comme identité côté UI.
   */ foldFolder(folder) {
        const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toLogicalPath"])(folder.path, this.appRoot);
        const name = path.split('/').filter(Boolean).pop() ?? folder.name;
        // Les strates elles-mêmes (`AKFC/pending`, `AKFC/published`) sont des
        // lieux qui n'existent plus dans l'espace logique : on les masque quand
        // elles apparaissent comme enfants directs de la racine. Leur contenu
        // remonte par ailleurs, via les autres candidats. `bin` n'est pas
        // concerné — c'est un vrai dossier, il reste.
        const children = folder.children?.filter((child)=>!(child.type === 'folder' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFoldedStratumPath"])(child.path, this.appRoot))).map((child)=>this.foldNode(child));
        return {
            type: 'folder',
            name,
            path,
            children,
            hasChildren: folder.hasChildren
        };
    }
}
/* -------------------------------------------------------------------------- */ /*  Fusion des arbres repliés                                                 */ /* -------------------------------------------------------------------------- */ /**
 * Fusionne deux arbres qui partagent le même path logique.
 *
 * Cousin de `mergeFolderTrees` (virtualStorage.ts), qui fusionne DEUX
 * PROVIDERS. Celui-ci fusionne DEUX STRATES du même provider. Deux règles
 * les distinguent, et elles comptent :
 *
 * ─── 1. Les fichiers ne sont JAMAIS dédupliqués ───────────────────────────
 *
 * Entre providers, un fichier n'appartient qu'à un seul backend : une
 * concaténation suffit. Entre strates, `pending/cours/x/photo` et
 * `published/cours/x/photo` sont DEUX fichiers distincts qui, une fois
 * repliés, portent le MÊME path logique — une photo publiée et sa
 * remplaçante homonyme en attente de relecture, cas parfaitement banal.
 * Dédupliquer par path en cacherait une. On les garde tous les deux ; c'est
 * leur `storagePath` qui les distingue, et c'est lui qui sert d'identité.
 *
 * ─── 2. La frontière de profondeur est préservée ──────────────────────────
 *
 * `children === undefined` (« non chargé ») ne doit jamais devenir `[]`
 * (« vide pour de vrai ») : la TreeView en conclurait que le dossier est
 * vide et refuserait de le déplier. Même discipline que `mergeFolderTrees`
 * — dont c'était précisément le bug corrigé juste avant ce chantier.
 */ function mergeFoldedFolders(a, b) {
    const hasChildrenHint = (a.hasChildren ?? false) || (b.hasChildren ?? false);
    const aLoaded = a.children !== undefined;
    const bLoaded = b.children !== undefined;
    if (!aLoaded && !bLoaded) {
        return {
            type: 'folder',
            name: a.name,
            path: a.path,
            hasChildren: hasChildrenHint
        };
    }
    const folders = new Map();
    const files = [];
    for (const child of [
        ...a.children ?? [],
        ...b.children ?? []
    ]){
        if (child.type === 'file') {
            files.push(child);
            continue;
        }
        const existing = folders.get(child.path);
        folders.set(child.path, existing ? mergeFoldedFolders(existing, child) : child);
    }
    const children = [
        ...folders.values(),
        ...files
    ];
    return {
        type: 'folder',
        name: a.name,
        path: a.path,
        children,
        hasChildren: hasChildrenHint || children.length > 0
    };
}
}),
"[project]/packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toPhysicalMoveIntents",
    ()=>toPhysicalMoveIntents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/logicalPath.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolvePhysicalLocations$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/resolvePhysicalLocations.service.ts [app-route] (ecmascript)");
;
;
async function toPhysicalMoveIntents(params) {
    const { prisma, appRoot, intent } = params;
    const sourcePaths = sourcePathsOf(intent.source);
    const locations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolvePhysicalLocations$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePhysicalLocations"])({
        prisma,
        appRoot,
        paths: sourcePaths
    });
    // Regroupement par strate : tous les chemins sources qui vivent dans la
    // même strate partent dans la même intention. La clé `null` est la strate
    // « à plat » — vide aujourd'hui, peuplée après l'étape 4 du chantier.
    const buckets = new Map();
    for (const sourcePath of sourcePaths){
        for (const physicalPath of locations.get(sourcePath) ?? []){
            const stratum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stratumSegmentOf"])(physicalPath, appRoot);
            const bucket = buckets.get(stratum);
            if (bucket) bucket.push(physicalPath);
            else buckets.set(stratum, [
                physicalPath
            ]);
        }
    }
    return [
        ...buckets.entries()
    ].map(([stratum, paths])=>({
            source: projectSource(intent.source, paths, appRoot, stratum),
            target: projectTarget(intent.target, appRoot, stratum)
        }));
}
/* -------------------------------------------------------------------------- */ /*  Projection                                                                */ /* -------------------------------------------------------------------------- */ function sourcePathsOf(source) {
    return source.type === "selection" ? [
        ...source.roots
    ] : [
        source.path
    ];
}
/**
 * Reconstruit la source dans une strate donnée.
 *
 * Le TYPE de source est préservé, délibérément. Rabattre un dossier sur une
 * `selection` serait tentant (ça s'auto-nettoierait quand une strate est
 * vide) mais changerait la sémantique : `resolveSource` expanse une
 * sélection en opérations FICHIER, et un dossier vide n'en produirait
 * aucune — il cesserait donc de se déplacer. On préfère garder l'opération
 * dossier et payer une requête d'existence.
 */ function projectSource(source, physicalPaths, appRoot, stratum) {
    if (source.type === "selection") {
        return {
            type: "selection",
            roots: [
                ...physicalPaths
            ],
            ...source.excluded ? {
                excluded: source.excluded.map((path)=>projectPath(path, appRoot, stratum))
            } : {}
        };
    }
    // `file` / `folder` : un chemin source ne peut occuper qu'UN emplacement
    // par strate, donc ce bucket en contient exactement un.
    return {
        type: source.type,
        path: physicalPaths[0]
    };
}
/**
 * Reconstruit la cible dans la strate de la source.
 *
 * Une cible `status-folder` traverse INCHANGÉE : son métier est justement de
 * changer de strate, et `resolveTargetPath` s'en charge à partir de la source
 * physique qu'on vient de lui garantir.
 *
 * ⚠️ Après l'étape 4 (uploads à plat), une source à plat combinée à une cible
 * `status-folder` fera lever `resolveTargetPath` (« segment[1] n'est pas un
 * statut connu »). C'est voulu, et c'est ce qui rend l'ordre du chantier
 * contraignant : l'étape 3 (publier = UPDATE du statut) doit précéder
 * l'étape 4, et elle fait disparaître les cibles `status-folder`. Si cette
 * erreur apparaît un jour, elle dit « tu as sauté une étape » — pas
 * « bricole une exception ici ».
 */ function projectTarget(target, appRoot, stratum) {
    if (target.type === "status-folder") return target;
    return {
        type: "folder",
        path: projectPath(target.path, appRoot, stratum)
    };
}
/**
 * Redescend un chemin logique dans une strate. `null` (à plat) et la
 * corbeille laissent le chemin logique tel quel — il EST déjà son propre
 * chemin physique dans ces deux cas.
 */ function projectPath(path, appRoot, stratum) {
    if (stratum === null) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toLogicalPath"])(path, appRoot);
    if (!isFoldable(stratum)) return path;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPhysicalPath"])(path, appRoot, stratum);
}
function isFoldable(stratum) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FOLDABLE_STATUS_SEGMENTS"].includes(stratum);
}
}),
"[project]/packages/backend/src/modules/storage/resolveMoveIntent.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "executeMoveOperations",
    ()=>executeMoveOperations,
    "planMoveOperations",
    ()=>planMoveOperations,
    "resolveMoveIntent",
    ()=>resolveMoveIntent
]);
async function resolveMoveIntent(params) {
    const operations = await planMoveOperations(params);
    await executeMoveOperations(params.adapter, operations);
    return operations;
}
async function planMoveOperations(params) {
    const { adapter, appRoot, intent } = params;
    if (!adapter.move) {
        throw new Error("Adapter does not support move(). " + "Cannot resolve a StorageMoveIntent on a read-only adapter.");
    }
    // 1) Résoudre la SOURCE en items concrets (file ou folder).
    const items = await resolveSource(intent.source, adapter);
    // 2) Pour chaque item, traduire la TARGET en path concret et produire
    //    une opération atomique.
    return items.map((item)=>({
            source: item,
            target: {
                path: resolveTargetPath(item, intent.target, appRoot)
            }
        }));
}
async function executeMoveOperations(adapter, operations) {
    if (!adapter.move) {
        throw new Error("Adapter does not support move(). " + "Cannot execute move operations on a read-only adapter.");
    }
    for (const operation of operations){
        await adapter.move(operation);
    }
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
"[project]/packages/backend/src/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertOperationsDontUnpublishReferencedAssets",
    ()=>assertOperationsDontUnpublishReferencedAssets
]);
async function assertOperationsDontUnpublishReferencedAssets(db, operations, appRoot) {
    const publishedPrefix = `${appRoot}/published/`;
    // 1) Filtrer les ops qui sortent de published.
    const exitingOps = operations.filter((op)=>op.source.path.startsWith(publishedPrefix) && !op.target.path.startsWith(publishedPrefix));
    if (exitingOps.length === 0) return;
    // 2) Pour chaque op, collecter les fullPaths concernés.
    //    Fichier : un seul path. Dossier : préfixe (assets sous le dossier).
    const filePaths = new Set();
    const folderPrefixes = [];
    for (const op of exitingOps){
        if (op.source.type === 'file') {
            filePaths.add(op.source.path);
        } else {
            // 'folder' — tout asset dont fullPath commence par <dossier>/
            folderPrefixes.push(`${op.source.path}/`);
        }
    }
    // 3) Récupérer les MediaAsset concernés.
    //    Une requête OR : id par fullPath exact OU fullPath commence par préfixe.
    const orClauses = [];
    if (filePaths.size > 0) {
        orClauses.push({
            fullPath: {
                in: [
                    ...filePaths
                ]
            }
        });
    }
    for (const prefix of folderPrefixes){
        orClauses.push({
            fullPath: {
                startsWith: prefix
            }
        });
    }
    const affectedAssets = await db.mediaAsset.findMany({
        where: {
            OR: orClauses
        },
        select: {
            id: true,
            fullPath: true
        }
    });
    if (affectedAssets.length === 0) return;
    // 4) Chercher les références.
    const assetIds = affectedAssets.map((a)=>a.id);
    const refs = await db.pageMediaReference.findMany({
        where: {
            mediaAssetId: {
                in: assetIds
            }
        },
        select: {
            mediaAssetId: true,
            pageType: true,
            pageId: true
        }
    });
    if (refs.length === 0) return;
    // 5) Construire le diagnostic et throw.
    const refsByAssetId = new Map();
    for (const ref of refs){
        const list = refsByAssetId.get(ref.mediaAssetId) ?? [];
        list.push({
            pageType: ref.pageType,
            pageId: ref.pageId
        });
        refsByAssetId.set(ref.mediaAssetId, list);
    }
    const blockedAssets = affectedAssets.filter((a)=>refsByAssetId.has(a.id));
    const lines = blockedAssets.map((asset)=>{
        const items = refsByAssetId.get(asset.id) ?? [];
        const formatted = items.map((r)=>`${r.pageType} #${r.pageId}`).join(', ');
        return `  - ${asset.fullPath} → utilisé par : ${formatted}`;
    });
    throw new Error(`Cannot move out of \`published\`: ${blockedAssets.length} referenced asset(s) blocking.\n` + `Remove these assets from the referencing pages first, then retry.\n` + lines.join('\n'));
}
}),
"[project]/packages/backend/src/modules/media/services/listGeneralFolders.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "listGeneralFolders",
    ()=>listGeneralFolders
]);
async function listGeneralFolders(params) {
    const { prisma, appRoot } = params;
    const assets = await prisma.mediaAsset.findMany({
        where: {
            appRoot,
            status: {
                in: [
                    "pending",
                    "published"
                ]
            },
            fullPath: {
                contains: "/general/"
            }
        },
        select: {
            fullPath: true
        }
    });
    const prefixes = [
        `${appRoot}/pending/general/`,
        `${appRoot}/published/general/`
    ];
    const names = new Set();
    for (const { fullPath } of assets){
        for (const prefix of prefixes){
            if (fullPath.startsWith(prefix)) {
                const segment = fullPath.slice(prefix.length).split("/")[0];
                if (segment) names.add(segment);
                break;
            }
        }
    }
    return [
        ...names
    ].sort((a, b)=>a.localeCompare(b, "fr"));
}
}),
"[project]/packages/backend/src/modules/storage/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "storageRouter",
    ()=>storageRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/storage.types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/move.intent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$r2$2d$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/r2-upload.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/cloudinary/upload.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/providerRegistry.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/virtualStorage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$statusFoldingReadView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/statusFoldingReadView.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$toPhysicalMoveIntents$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolveMoveIntent$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/resolveMoveIntent.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$assertOperationsDontUnpublishReferencedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$countPersoImages$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/countPersoImages.service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/persoPhotoQuota.constants.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$listGeneralFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/services/listGeneralFolders.service.ts [app-route] (ecmascript)");
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
/**
 * storageRouter — Phase 2 update
 *
 * Le seul changement par rapport à la version précédente est le schema
 * d'input de `registerR2Upload`, qui doit maintenant transporter la
 * destination métier (categoryId, disciplineId) et l'originalFileName
 * pour créer la row MediaAsset côté adapter R2.
 *
 * Le schema legacy `registerR2UploadedAssetSchema` n'avait que
 * `{ path, expectedBytes, expectedMimeType }` — insuffisant pour le
 * tracking DB. On le redéfinit en inline dans ce router pour ne pas
 * forcer une modif côté contracts (le contract est à jour côté Cloudinary
 * via `registerUploadedAssetsSchema.destination`, on reproduit la même
 * forme ici).
 *
 * ⚠️ NOTE : si un autre endroit du code utilise `registerR2UploadedAssetSchema`
 * importé depuis `@contracts/storage`, il faudra aussi l'aligner. À ce jour,
 * seul ce router le consomme.
 */ /* -------------------------------------------------------------------------- */ /*  Schema R2 Phase 2 — inline                                                */ /* -------------------------------------------------------------------------- */ /**
 * Destination metier — discriminée pour gérer les deux cas :
 *   - existing-discipline : on a categoryId + disciplineId direct
 *   - new-discipline : on a categoryId + proposedDisciplineName (admin validera plus tard)
 *
 * Forme identique à ce que `DragNDropForm` construit déjà côté frontend
 * pour Cloudinary — on réutilise.
 */ const r2UploadDestinationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('kind', [
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('existing-discipline'),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('new-discipline'),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        proposedDisciplineName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(120)
    }),
    // Espace club partagé, sans discipline ni catégorie.
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('general'),
        folder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional()
    }),
    // Contenus d'un événement (parité avec `general`).
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('event'),
        eventId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        disciplineIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()).default([])
    })
]);
const registerR2UploadInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    expectedBytes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    expectedMimeType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    // Phase 2 — nouveaux champs requis pour créer la row MediaAsset
    destination: r2UploadDestinationSchema,
    originalFileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255)
});
const storageRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /* ====================================================================== */ /*  Lecture (inchangé)                                                    */ /* ====================================================================== */ /**
   * Compteurs « à traiter » de la bibliothèque, pour la cloche du header :
   * assets en attente de classement (MediaAsset.status "pending") et
   * entrées de corbeille (TrashEntry IN_BIN). protectedProcedure simple,
   * comme le reste du router — la cloche est de plus gatée côté client
   * sur la présence d'au moins une permission.
   */ getAttentionCounts: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const [pending, bin, generalPending, persoCounts] = await Promise.all([
            ctx.prisma.mediaAsset.count({
                where: {
                    status: "pending"
                }
            }),
            ctx.prisma.trashEntry.count({
                where: {
                    status: "IN_BIN"
                }
            }),
            ctx.prisma.mediaAsset.count({
                where: {
                    status: "pending",
                    appRoot: ctx.appRoot,
                    fullPath: {
                        contains: "/general/"
                    }
                }
            }),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$countPersoImages$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countPersoImages"])({
                prisma: ctx.prisma,
                appRoot: ctx.appRoot,
                userId: ctx.user.id
            })
        ]);
        return {
            pending,
            bin,
            generalPending,
            persoPending: persoCounts.pending
        };
    }),
    /**
   * Statut du quota d'images de l'espace perso de l'admin courant (lecture
   * seule). Le dossier perso est dérivé de `ctx.user.id`, jamais d'un input.
   */ getPersoPhotoQuota: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        const counts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$countPersoImages$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countPersoImages"])({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            userId: ctx.user.id
        });
        const remaining = Math.max(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSO_PHOTO_QUOTA"] - counts.total);
        return {
            quota: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$persoPhotoQuota$2e$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PERSO_PHOTO_QUOTA"],
            pending: counts.pending,
            published: counts.published,
            total: counts.total,
            remaining
        };
    }),
    /**
   * Sous-dossiers existants sous `general/` (pending + published), pour peupler
   * le select « dossier existant » de l'uploader général.
   */ listGeneralFolders: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].query(async ({ ctx })=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$listGeneralFolders$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listGeneralFolders"])({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
    }),
    /**
   * ═══ Le flag `logical` — chantier « arbre sans strate de statut » ═══════
   *
   * Levé, il enveloppe l'adapter dans `StatusFoldingReadView` : le nœud
   * logique `AKFC/cours/x` fusionne alors les physiques
   * `AKFC/pending/cours/x` et `AKFC/published/cours/x`, et le statut cesse
   * d'être un lieu pour redevenir ce qu'il aurait toujours dû être — une
   * métadonnée (`MediaAsset.status`, déjà exposée en `MediaMeta.status`).
   *
   * Baissé (le défaut), rien ne change : l'appelant voit l'arbre physique,
   * exactement comme avant ce chantier.
   *
   * ─── Pourquoi un flag plutôt qu'une bascule sèche ─────────────────────
   *
   * Le pliage change ce que voit l'admin dans sa bibliothèque. Un flag
   * découple la mise en place (backend, inerte, vérifiable) du basculement
   * (front, visible) — et surtout, il rend le retour arrière instantané :
   * un booléen, pas un revert en catastrophe un soir de démo.
   *
   * ⚠️ Un appelant qui lève `logical` sur une lecture DOIT le lever aussi
   * sur `move` : les chemins qu'il reçoit sont logiques, et le pipeline de
   * move ne sait travailler qu'en physique (cf. `toPhysicalMoveIntents`).
   * Les mélanger, c'est envoyer des chemins logiques à `resolveTargetPath`,
   * qui lève. En pratique il n'y a qu'un seul appelant
   * (`finderStorageAdapter`), donc un seul endroit à tenir cohérent.
   *
   * ─── Durée de vie ─────────────────────────────────────────────────────
   *
   * Transitoire. À l'étape 5 du chantier, tous les binaires vivent à plat,
   * le pliage devient l'identité, et le flag disparaît avec les trois
   * modules qu'il commande.
   */ list: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"].optional(),
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        cursor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
        limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
        logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).query(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        const backend = input.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, deps) : new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VirtualStorage"](deps);
        const reader = input.logical ? new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$statusFoldingReadView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StatusFoldingReadView"](backend, ctx.appRoot) : backend;
        return reader.list({
            path: input.path,
            cursor: input.cursor,
            limit: input.limit
        });
    }),
    getTree: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"].optional(),
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        depth: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
        logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).query(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        const backend = input.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, deps) : new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VirtualStorage"](deps);
        const reader = input.logical ? new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$statusFoldingReadView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StatusFoldingReadView"](backend, ctx.appRoot) : backend;
        return reader.getTree({
            path: input.path,
            depth: input.depth
        });
    }),
    getNode: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"].optional(),
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).query(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        const backend = input.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, deps) : new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VirtualStorage"](deps);
        const reader = input.logical ? new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$statusFoldingReadView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StatusFoldingReadView"](backend, ctx.appRoot) : backend;
        if (!reader.getNode) {
            throw new Error(`Provider "${input.provider ?? "virtual"}" does not support getNode().`);
        }
        return reader.getNode(input.path);
    }),
    getMetadata: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"].optional(),
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).query(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        const backend = input.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, deps) : new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VirtualStorage"](deps);
        const reader = input.logical ? new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$statusFoldingReadView$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["StatusFoldingReadView"](backend, ctx.appRoot) : backend;
        if (!reader.getMetadata) {
            throw new Error(`Provider "${input.provider ?? "virtual"}" does not support getMetadata().`);
        }
        return reader.getMetadata(input.path);
    }),
    move: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"].optional(),
        intent: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$move$2e$intent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageMoveIntentSchema"],
        /**
         * L'intention est exprimée en chemins LOGIQUES (cf. `list`).
         *
         * Un appelant qui lit en `logical` DOIT lever ce flag ici aussi :
         * les chemins qu'il détient viennent de la vue pliée.
         */ logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    })).mutation(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        // ⚠️ L'adapter reste PHYSIQUE, toujours. On n'enveloppe JAMAIS le
        // pipeline de move dans `StatusFoldingReadView` : `planMoveOperations`
        // lit la source via cet adapter puis calcule la cible avec
        // `resolveTargetPath`, qui exige un segment de statut en position 1 et
        // lève sinon. Lui donner des chemins logiques casserait la
        // publication. La traduction se fait en amont, sur l'INTENTION.
        const adapter = input.provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])(input.provider, deps) : new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$virtualStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["VirtualStorage"](deps);
        // Une intention logique peut recouvrir plusieurs emplacements réels
        // (un dossier logique vit dans 1..N strates). `toPhysicalMoveIntents`
        // les résout contre la DB et n'émet que des intentions RÉELLES — pas
        // de spéculation, donc pas de tolérance à installer ici.
        const intents = input.logical ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$toPhysicalMoveIntents$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPhysicalMoveIntents"])({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            intent: input.intent
        }) : [
            input.intent
        ];
        // On planifie TOUT avant de garder, et on garde sur l'UNION.
        //
        // C'est le point non négociable de cet enchaînement :
        // `assertOperationsDontUnpublishReferencedAssets` doit voir l'ensemble
        // des opérations. La faire tourner par intention la laisserait
        // raisonner sur un sous-ensemble — et une garde qui juge sur une
        // partie du geste ne garde rien.
        const plans = await Promise.all(intents.map((intent)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolveMoveIntent$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["planMoveOperations"])({
                adapter,
                appRoot: ctx.appRoot,
                intent
            })));
        // ─── Une opération sur place n'est pas une opération ───────────
        //
        // Rien en aval ne filtre `{ source: X, target: X }` : `adapter.move`
        // partirait renommer un objet sur lui-même, le provider refuserait, et
        // l'exception ferait échouer TOUT le geste — y compris sa partie utile.
        //
        // Le cas devient courant avec le pliage : publier un dossier logique
        // émet une intention par strate occupée, et celle qui vit DÉJÀ dans la
        // strate cible se résout en X → X. Elle n'a simplement rien à faire.
        //
        // Le filtre est posé AVANT les gardes, pour qu'elles ne raisonnent que
        // sur des opérations réelles — une opération sur place ne dépublie
        // rien, elle n'a donc pas à peser dans leur verdict. Et il est posé
        // avant `return { operations }` : l'appelant reçoit ce qui a bougé, pas
        // ce qu'on a envisagé.
        const effectiveOperations = plans.flat().filter((operation)=>operation.source.path !== operation.target.path);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$services$2f$assertOperationsDontUnpublishReferencedAssets$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertOperationsDontUnpublishReferencedAssets"])(ctx.prisma, effectiveOperations, ctx.appRoot);
        // Exécution séquentielle, comme avant : Cloudinary n'aime pas les
        // opérations concurrentes sur des préfixes voisins.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$resolveMoveIntent$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeMoveOperations"])(adapter, effectiveOperations);
        return {
            operations: effectiveOperations
        };
    }),
    /* ====================================================================== */ /*  Upload Cloudinary (inchangé)                                          */ /* ====================================================================== */ createUploadAuthorization: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createUploadSignaturesSchema"].shape
    })).mutation(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        switch(input.provider){
            case "cloudinary":
                {
                    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("cloudinary", deps);
                    return adapter.createUploadAuthorization({
                        userId: ctx.user.id,
                        destination: input.destination,
                        assets: input.assets,
                        allowOverwrite: input.allowOverwrite
                    });
                }
            case "r2":
                {
                    throw new Error("R2 uploads not supported via this procedure. " + "Use storage.createR2Upload / storage.registerR2Upload instead.");
                }
        }
    }),
    registerUploadedAsset: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        provider: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$storage$2e$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageProviderSchema"],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$cloudinary$2f$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerUploadedAssetsSchema"].shape
    })).mutation(async ({ ctx, input })=>{
        const deps = {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        };
        switch(input.provider){
            case "cloudinary":
                {
                    const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("cloudinary", deps);
                    return adapter.registerUploadedAsset({
                        destination: input.destination,
                        assets: input.assets,
                        eventDate: input.eventDate,
                        userId: ctx.user.id
                    });
                }
            case "r2":
                {
                    throw new Error("R2 register-uploaded-asset not supported via this procedure. " + "Use storage.createR2Upload / storage.registerR2Upload instead.");
                }
        }
    }),
    /* ====================================================================== */ /*  Upload R2 — Phase 2 (enrichi avec destination + originalFileName)     */ /* ====================================================================== */ createR2Upload: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$r2$2d$upload$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createR2UploadAuthorizationSchema"]).mutation(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("r2", {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        return adapter.createUploadAuthorization({
            path: input.path,
            mimeType: input.mimeType,
            maxBytes: input.maxBytes
        });
    }),
    /**
   * Phase 2 — l'input transporte maintenant `destination` + `originalFileName`
   * pour permettre à l'adapter R2 de créer la row MediaAsset après HeadObject.
   */ registerR2Upload: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(registerR2UploadInputSchema).mutation(async ({ ctx, input })=>{
        const adapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdapter"])("r2", {
            prisma: ctx.prisma,
            appRoot: ctx.appRoot
        });
        return adapter.registerUploadedAsset({
            path: input.path,
            userId: ctx.user.id,
            expectedBytes: input.expectedBytes,
            expectedMimeType: input.expectedMimeType,
            destination: input.destination,
            originalFileName: input.originalFileName
        });
    })
});
}),
"[project]/packages/backend/src/modules/media/helpers/deriveMediaKind.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * deriveMediaKind.ts
 *
 * Source UNIQUE de la dérivation du `kind` d'un média à partir du couple
 * (resourceType Cloudinary, mimeType). Auparavant cette logique était
 * dupliquée inline dans `media.resolveByIds` ET `gallery.getCarousel`, avec
 * le risque qu'elles divergent. On la centralise ici.
 *
 * ─── Règles ─────────────────────────────────────────────────────────────────
 *
 *   - `resourceType` fait foi en priorité (le mimeType a pu être corrompu à
 *     l'upload, ex. l'ancien bug `image/mp4`).
 *   - Cloudinary range l'AUDIO sous `resource_type: "video"` → on désambiguïse
 *     l'audio par le mimeType (`audio/*`).
 *   - En l'absence de resourceType fiable (assets R2 : resourceType null), on
 *     retombe sur le mimeType.
 *   - Tout le reste (pdf, docs, archives…) → `document`.
 */ __turbopack_context__.s([
    "deriveMediaKind",
    ()=>deriveMediaKind
]);
function deriveMediaKind(resourceType, mimeType) {
    const mime = mimeType ?? "";
    if (resourceType === "video") {
        return mime.startsWith("audio/") ? "audio" : "video";
    }
    if (resourceType === "image") {
        return "image";
    }
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("image/")) return "image";
    return "document";
}
}),
"[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/packages/backend/src/modules/media/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 📂 Module `media` — accès aux métadonnées MediaAsset depuis le finder
 *
 * Phase 2 + fix : matching par `fullPath`, avec **tolérance d'extension**
 * pour les fichiers Cloudinary.
 *
 * ─── Pourquoi le matching tolérant ────────────────────────────────────
 *
 * Convention Cloudinary : les publicIds sont SANS extension (Cloudinary
 * stocke le format séparément). Le finder frontend reçoit donc
 * `path = "AKFC/pending/cours/foo/trotinette"` pour une image Cloudinary.
 *
 * Convention R2 : les keys S3 contiennent l'extension. Le finder reçoit
 * `path = "AKFC/pending/cours/foo/bernhoft.mp3"` directement.
 *
 * Mais en DB, on a unifié sur `fullPath = publicId + '.' + format` côté
 * Cloudinary pour avoir une clé universelle (Phase 2). Du coup :
 *   - R2 : `path` UI === `fullPath` DB ✓
 *   - Cloudinary : `path` UI === `publicId` MAIS `fullPath` DB === `publicId + '.' + format`
 *
 * Conséquence : matcher par `fullPath = path` strict casse pour Cloudinary.
 * On accepte donc DEUX patterns :
 *   1. `fullPath === path` (cas R2, match direct)
 *   2. `fullPath startsWith path + '.'` (cas Cloudinary, path sans extension)
 *
 * Le `+ '.'` dans le startsWith évite de matcher accidentellement
 * `foobar.jpg` quand on cherche `foo` (foobar.jpg ne commence pas par
 * "foo.", il commence par "foob").
 *
 * Les résultats sont **toujours indexés par le path d'entrée** (UI-facing),
 * pas par le fullPath DB. C'est ce que le frontend attend depuis Phase 1.
 */ __turbopack_context__.s([
    "mediaRouter",
    ()=>mediaRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$deriveMediaKind$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/deriveMediaKind.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/logicalPath.ts [app-route] (ecmascript)");
;
;
;
;
;
/* -------------------------------------------------------------------------- */ /*                                  HELPERS                                   */ /* -------------------------------------------------------------------------- */ function composeDisplayName(user) {
    if (user.pseudo && user.pseudo.trim()) return user.pseudo.trim();
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email;
}
function parentOf(path, appRoot) {
    if (path === appRoot) return appRoot;
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.slice(0, lastSlash) : appRoot;
}
/** Dernier segment d'un fullPath → nom de fichier. */ function fileNameOf(fullPath) {
    return fullPath.split('/').pop() ?? fullPath;
}
/**
 * Détermine si un `fullPath` DB matche un `path` d'entrée frontend.
 * Cf. doc en tête de fichier.
 */ function matchesPath(fullPath, inputPath) {
    if (fullPath === inputPath) return true;
    if (fullPath.startsWith(`${inputPath}.`)) return true;
    return false;
}
const mediaRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Lookup batch des MediaAsset rows pour une liste de paths.
   * Matching tolérant à l'extension (cf. doc en tête de fichier).
   */ getByPaths: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        paths: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).max(500)
    })).query(async ({ input, ctx })=>{
        if (input.paths.length === 0) return {};
        // Construit les conditions OR : pour chaque path, on essaie
        // (exact match) OU (match avec extension).
        const orConditions = input.paths.flatMap((p)=>[
                {
                    fullPath: p
                },
                {
                    fullPath: {
                        startsWith: `${p}.`
                    }
                }
            ]);
        const assets = await ctx.prisma.mediaAsset.findMany({
            where: {
                appRoot: input.appRoot,
                OR: orConditions
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        pseudo: true,
                        email: true
                    }
                }
            }
        });
        const byPath = {};
        for (const asset of assets){
            if (!asset.fullPath) continue;
            // Retrouve le path d'entrée qui matche cet asset.
            // O(N) par asset, donc O(N*M) global — acceptable pour N,M ≤ 500.
            const inputPath = input.paths.find((p)=>matchesPath(asset.fullPath, p));
            if (!inputPath) continue;
            byPath[inputPath] = {
                // Source de vérité visée du statut (cf. MediaMeta.status).
                status: asset.status,
                createdAt: asset.uploadedAt.toISOString(),
                uploadedBy: composeDisplayName(asset.uploader),
                uploaderId: asset.uploader.id,
                mimeType: asset.mimeType,
                width: asset.width,
                height: asset.height,
                duration: asset.duration,
                description: asset.description,
                bytes: asset.bytes
            };
        }
        return byPath;
    }),
    /**
   * 🔗 Résout une liste de paths (côté UI/finder) vers leur `mediaId`
   * stable correspondant.
   *
   * Matching tolérant à l'extension (cf. doc en tête de fichier).
   *
   * Retourne un Record indexé par le path d'entrée. Si un path ne
   * correspond à aucun asset, la valeur est `null` plutôt qu'omise.
   */ resolveByPaths: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        paths: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).max(500)
    })).query(async ({ input, ctx })=>{
        if (input.paths.length === 0) {
            return {};
        }
        const orConditions = input.paths.flatMap((p)=>[
                {
                    fullPath: p
                },
                {
                    fullPath: {
                        startsWith: `${p}.`
                    }
                }
            ]);
        const assets = await ctx.prisma.mediaAsset.findMany({
            where: {
                appRoot: input.appRoot,
                OR: orConditions
            },
            select: {
                id: true,
                fullPath: true
            }
        });
        const byPath = {};
        for (const p of input.paths)byPath[p] = null;
        for (const asset of assets){
            if (!asset.fullPath) continue;
            const inputPath = input.paths.find((p)=>matchesPath(asset.fullPath, p));
            if (inputPath) byPath[inputPath] = asset.id;
        }
        return byPath;
    }),
    /**
   * 🔗 Résout une liste de `mediaId` (cuid stable) vers les
   * informations nécessaires au rendu d'un asset (URL + metadata).
   *
   * ─── Politique : `published` uniquement ────────────────────────────
   *
   * On filtre `status === 'published'`. Un asset en `pending` ou en
   * `bin` n'est jamais résolu — le caller reçoit `null` pour cet id
   * et affichera son placeholder « média indisponible ».
   *
   * La forme de retour est le type canonique `ResolvedMedia`
   * (`@contracts/page`) — source unique partagée avec le PageRenderer,
   * le MediaListEditor (qui l'infère via inferRouterOutputs) et le
   * MediaItemsEditor.
   *
   * Retourne un Record indexé par mediaId. Les ids absents de la DB
   * ou non-published rendent `null`.
   */ resolveByIds: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        mediaIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)).max(500)
    })).query(async ({ input, ctx })=>{
        if (input.mediaIds.length === 0) {
            return {};
        }
        const assets = await ctx.prisma.mediaAsset.findMany({
            where: {
                id: {
                    in: input.mediaIds
                },
                status: 'published'
            },
            select: {
                id: true,
                publicId: true,
                fullPath: true,
                mimeType: true,
                resourceType: true,
                width: true,
                height: true,
                duration: true
            }
        });
        const byId = {};
        for (const id of input.mediaIds)byId[id] = null;
        for (const asset of assets){
            const kind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$deriveMediaKind$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveMediaKind"])(asset.resourceType, asset.mimeType);
            const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])(asset);
            byId[asset.id] = {
                url: baseUrl,
                kind,
                posterUrl: kind === 'video' ? `${baseUrl}&as=poster` : null,
                mimeType: asset.mimeType,
                fileName: fileNameOf(asset.fullPath),
                width: asset.width,
                height: asset.height,
                duration: asset.duration
            };
        }
        return byId;
    }),
    /**
   * 🔎 Recherche récursive — files + folders (status + métier).
   * Matche par `fullPath` (clé universelle).
   */ searchRecursive: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        prefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(200),
        /**
         * `prefix` est un chemin LOGIQUE (cf. le flag `logical` du router
         * storage) : la recherche s'élargit alors à ses emplacements
         * physiques, replie les chemins trouvés, et n'expose plus les
         * strates `pending`/`published` comme des dossiers.
         *
         * Baissé (le défaut), rien ne change.
         */ logical: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        caseSensitive: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
        wholeWord: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
        useRegex: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
        limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(500).default(200)
    })).query(async ({ input, ctx })=>{
        // 1. Compile le matcher selon les flags
        let matcher = null;
        try {
            if (input.useRegex) {
                const flags = input.caseSensitive ? '' : 'i';
                const re = new RegExp(input.query, flags);
                matcher = (s)=>re.test(s);
            } else {
                const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = input.wholeWord ? `\\b${escaped}\\b` : escaped;
                const flags = input.caseSensitive ? '' : 'i';
                const re = new RegExp(pattern, flags);
                matcher = (s)=>re.test(s);
            }
        } catch  {
            return {
                results: [],
                truncated: false
            };
        }
        // ─── Pliage de la strate de statut ────────────────────────────
        //
        // Un prefix logique recouvre plusieurs emplacements physiques :
        // `AKFC/cours` vit sous `pending`, sous `published`, et (après
        // l'étape 4 du chantier) à plat. On interroge les trois.
        //
        // `toLogical` replie ensuite chaque fullPath trouvé. Tout ce qui suit
        // — dérivation des dossiers, calcul des parents, noms — travaille donc
        // en chemins LOGIQUES sans le savoir, et n'a pas eu à changer.
        const prefixes = input.logical ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["physicalCandidates"])(input.prefix, input.appRoot) : [
            input.prefix
        ];
        const toLogical = (fullPath)=>input.logical ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$logicalPath$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toLogicalPath"])(fullPath, input.appRoot) : fullPath;
        // 2. Lookup DB — match par fullPath
        const candidates = await ctx.prisma.mediaAsset.findMany({
            where: {
                appRoot: input.appRoot,
                OR: prefixes.flatMap((prefix)=>[
                        {
                            fullPath: prefix
                        },
                        {
                            fullPath: {
                                startsWith: `${prefix}/`
                            }
                        }
                    ])
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        pseudo: true,
                        email: true
                    }
                }
            },
            take: input.limit * 5
        });
        // 3a. FICHIERS qui matchent
        const filteredFiles = candidates.filter((asset)=>{
            if (matcher(asset.originalFileName)) return true;
            if (asset.description && matcher(asset.description)) return true;
            const displayName = composeDisplayName(asset.uploader);
            if (matcher(displayName)) return true;
            return false;
        });
        // 3b. DOSSIERS MÉTIER : dérivés des fullPaths des assets sous le prefix
        const folderPaths = new Set();
        for (const asset of candidates){
            if (!asset.fullPath) continue;
            // Replié AVANT la dérivation : `folderPaths` étant un Set, le dossier
            // logique `AKFC/cours` dérivé depuis un asset `pending` et depuis un
            // asset `published` se dédoublonne tout seul. La fusion des strates
            // n'a pas besoin d'être écrite — elle tombe.
            const fullPath = toLogical(asset.fullPath);
            const relative = fullPath.startsWith(`${input.prefix}/`) ? fullPath.slice(input.prefix.length + 1) : fullPath === input.prefix ? '' : null;
            if (relative === null) continue;
            const segments = relative.split('/');
            if (segments.length <= 1) continue;
            let acc = input.prefix;
            for(let i = 0; i < segments.length - 1; i++){
                acc = `${acc}/${segments[i]}`;
                folderPaths.add(acc);
            }
        }
        const matchedFolders = [];
        for (const path of folderPaths){
            const lastSlash = path.lastIndexOf('/');
            const name = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
            if (matcher(name)) {
                matchedFolders.push({
                    path,
                    name
                });
            }
        }
        // 3c. STATUS FOLDERS — exposés depuis la racine
        //
        // En vue pliée, `pending` et `published` ne sont plus des lieux : les
        // faire remonter comme résultats de recherche donnerait à l'admin un
        // dossier sur lequel cliquer et qui n'existe nulle part. `bin`, lui,
        // reste un vrai dossier et reste cherchable.
        const STATUS_FOLDERS = input.logical ? [
            'bin'
        ] : [
            'pending',
            'published',
            'bin'
        ];
        const statusFolders = [];
        if (input.prefix === input.appRoot) {
            for (const folder of STATUS_FOLDERS){
                if (matcher(folder)) {
                    statusFolders.push({
                        path: `${input.appRoot}/${folder}`,
                        name: folder
                    });
                }
            }
        }
        // 4. Concat + truncation
        matchedFolders.sort((a, b)=>a.path.localeCompare(b.path));
        const totalCount = statusFolders.length + matchedFolders.length + filteredFiles.length;
        const truncated = totalCount > input.limit;
        const folderResultsCount = statusFolders.length + matchedFolders.length;
        const fileBudget = Math.max(0, input.limit - folderResultsCount);
        const limitedFiles = filteredFiles.slice(0, fileBudget);
        // 5. Projection
        const folderResults = [
            ...statusFolders,
            ...matchedFolders
        ].map((f)=>({
                kind: 'folder',
                id: `folder:${f.path}`,
                path: f.path,
                // Pas de `storagePath` sur un dossier : un dossier logique recouvre
                // plusieurs dossiers physiques, il n'a pas d'emplacement unique à
                // désigner. Les écritures qui en ont besoin le résolvent côté
                // backend (cf. `resolvePhysicalLocations`).
                storagePath: null,
                parentPath: parentOf(f.path, input.appRoot),
                name: f.name,
                mimeType: null,
                format: null,
                bytes: null,
                createdAt: null,
                uploadedBy: null,
                uploaderId: null,
                description: null,
                width: null,
                height: null,
                duration: null
            }));
        const fileResults = limitedFiles.map((asset)=>{
            // `id` reste le cuid `MediaAsset.id` : c'est une identité d'unicité
            // parfaitement valable, et le contrat finder l'autorise
            // explicitement. Le LOCALISATEUR, lui, voyage à part.
            const storagePath = asset.fullPath;
            const path = toLogical(storagePath);
            const lastSlash = path.lastIndexOf('/');
            const parentPath = lastSlash > 0 ? path.slice(0, lastSlash) : input.appRoot;
            const name = lastSlash > 0 ? path.slice(lastSlash + 1) : path;
            return {
                kind: 'file',
                id: asset.id,
                path,
                storagePath,
                parentPath,
                name,
                mimeType: asset.mimeType,
                format: asset.format,
                bytes: asset.bytes,
                createdAt: asset.uploadedAt.toISOString(),
                uploadedBy: composeDisplayName(asset.uploader),
                uploaderId: asset.uploader.id,
                description: asset.description,
                width: asset.width,
                height: asset.height,
                duration: asset.duration
            };
        });
        return {
            results: [
                ...folderResults,
                ...fileResults
            ],
            truncated
        };
    }),
    /**
   * ✏️ Mise à jour de la description d'un fichier.
   * Matching tolérant à l'extension (cf. doc en tête de fichier).
   */ updateDescription: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
        description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000)
    })).mutation(async ({ input, ctx })=>{
        const result = await ctx.prisma.mediaAsset.updateMany({
            where: {
                appRoot: input.appRoot,
                OR: [
                    {
                        fullPath: input.path
                    },
                    {
                        fullPath: {
                            startsWith: `${input.path}.`
                        }
                    }
                ]
            },
            data: {
                description: input.description.trim() || null
            }
        });
        if (result.count === 0) {
            throw new Error(`Aucune MediaAsset trouvée pour ce fichier (path: ${input.path}). ` + `Si c'est un fichier R2 historique, lance le backfill ` + `via /api/admin/backfill-r2-assets.`);
        }
        if (result.count > 1) {
            console.warn(`[media.updateDescription] ${result.count} rows updated pour path="${input.path}" ` + `— le path matche plusieurs MediaAssets. À investiguer si non intentionnel.`);
        }
        return {
            ok: true,
            updatedAt: new Date().toISOString()
        };
    })
});
}),
"[project]/packages/backend/src/modules/origins/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "originRouter",
    ()=>originRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
;
/**
 * origins/router.ts
 *
 * CRUD Origin — racine culturelle d'une discipline, d'un stage ou
 * d'un événement (« Japon », « Okinawa », « Chine », « Philippines »).
 *
 * Introduit par la migration v2 pour remplacer l'ancien champ
 * `Discipline.origin: String?` libre. Une entité dédiée permet de :
 *   - Éliminer les doublons orthographiques (contrainte `@unique` sur
 *     `name` et `slug`)
 *   - Ajouter des métadonnées culturelles riches (région, période
 *     historique, drapeau)
 *   - Regrouper transversalement disciplines / stages / events
 *
 * Conventions :
 *   - Lectures   : `publicProcedure` (les origines alimentent le site
 *                  public, comme les disciplines).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *                  Pas de permission dédiée pour la v1 — les origines
 *                  sont logiquement liées au domaine de gestion des
 *                  disciplines. À séparer en `manage_origins` si besoin.
 *
 * Règles métier :
 *   - `delete` est un hard delete : avant suppression, vérification qu'aucune
 *     dépendance ne subsiste (Discipline, Stage, Event). Si oui, CONFLICT.
 *   - L'unicité `(name)` et `(slug)` est portée par le schéma. Une violation
 *     renvoie CONFLICT avec un message précisant le champ fautif.
 *
 * Pas de PageBuilder ici : `description` reste un `String?` simple.
 * Si on veut une page riche par origine plus tard, on migrera ce champ
 * en `Json` (comme on l'a fait pour Discipline).
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ // Slug : minuscules + chiffres + tirets uniquement, pas de tirets aux
// extrémités. Convention URL-safe stricte.
const slugSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with single hyphens (no leading/trailing hyphen)."
});
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    slug: slugSchema,
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional(),
    country: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    region: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    flag: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(16).nullable().optional(),
    historicalPeriod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).default(0)
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    slug: slugSchema.optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(2000).nullable().optional(),
    country: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    region: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    flag: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(16).nullable().optional(),
    historicalPeriod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).nullable().optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional()
});
/* -------------------------------------------------------------------------- */ /*                          INTERNAL ERROR MAPPING                            */ /* -------------------------------------------------------------------------- */ /**
 * Mapping P2002 → message précisant le champ unique violé (name ou slug),
 * basé sur le `meta.target` de l'erreur Prisma. Fallback générique si la
 * meta n'est pas renseignée.
 */ function uniqueViolationMessage(err) {
    const target = err.meta?.target;
    if (Array.isArray(target)) {
        if (target.includes("name")) {
            return "An origin with this name already exists.";
        }
        if (target.includes("slug")) {
            return "An origin with this slug already exists.";
        }
    }
    return "An origin with this name or slug already exists.";
}
const originRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les origines, triées par sortOrder puis name.
   * Sert à peupler les sélecteurs dans les forms admin (DisciplineForm,
   * StageForm, EventForm) et la future page publique `/origines`.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.origin.findMany({
            orderBy: [
                {
                    sortOrder: "asc"
                },
                {
                    name: "asc"
                }
            ]
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const origin = await ctx.prisma.origin.findUnique({
            where: {
                id: input.id
            }
        });
        if (!origin) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Origin not found."
            });
        }
        return origin;
    }),
    /**
   * Lookup par slug — utile pour les futures pages publiques
   * `/origines/[slug]`.
   */ getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: slugSchema
    })).query(async ({ ctx, input })=>{
        const origin = await ctx.prisma.origin.findUnique({
            where: {
                slug: input.slug
            }
        });
        if (!origin) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Origin not found."
            });
        }
        return origin;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(createInput).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.origin.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description ?? null,
                    country: input.country ?? null,
                    region: input.region ?? null,
                    flag: input.flag ?? null,
                    historicalPeriod: input.historicalPeriod ?? null,
                    sortOrder: input.sortOrder
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: uniqueViolationMessage(err)
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        try {
            return await ctx.prisma.origin.update({
                where: {
                    id
                },
                data: rest
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: uniqueViolationMessage(err)
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Origin not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Pré-vérification des dépendances — on refuse plutôt que de
        // cascader. Une origine référencée par une discipline, un stage
        // ou un event ne peut pas être supprimée sans détacher d'abord
        // ces entités.
        const [disciplineCount, stageCount, eventCount] = await Promise.all([
            ctx.prisma.discipline.count({
                where: {
                    originId: input.id
                }
            }),
            ctx.prisma.stage.count({
                where: {
                    originId: input.id
                }
            }),
            ctx.prisma.event.count({
                where: {
                    originId: input.id
                }
            })
        ]);
        const deps = [];
        if (disciplineCount > 0) deps.push(`${disciplineCount} discipline(s)`);
        if (stageCount > 0) deps.push(`${stageCount} stage(s)`);
        if (eventCount > 0) deps.push(`${eventCount} event(s)`);
        if (deps.length > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Cannot delete origin: ${deps.join(", ")} still reference it. Detach them first.`
            });
        }
        try {
            return await ctx.prisma.origin.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Origin not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = originRouter;
}),
"[project]/packages/backend/src/modules/comments/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "commentRouter",
    ()=>commentRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/shared/prosemirror.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Router des commentaires (arborescents).
 *
 * - Lecture publique (`getByPost`) : les commentaires d'un post sont
 *   visibles par tous. Renvoyés à plat avec leur auteur ; le frontend
 *   reconstruit l'arbre via `parentId` (plus souple qu'un arbre figé
 *   côté serveur).
 * - Écriture protégée : tout utilisateur connecté peut commenter et
 *   répondre. L'édition/suppression est réservée à l'auteur (la
 *   modération admin pourra être ajoutée via un endpoint dédié).
 *
 * `content` est un document ProseMirror (Json, schéma opaque partagé —
 * cf. contracts/shared/prosemirror.ts). Les garanties de non-vacuité et
 * de taille sont portées par l'éditeur bridé côté front.
 *
 * `Reaction` étant polymorphe (pas de FK), la suppression d'un
 * commentaire nettoie explicitement les réactions de toute sa
 * sous-arborescence (le commentaire + ses réponses, qui cascadent en DB).
 */ const authorSelect = {
    id: true,
    firstName: true,
    lastName: true,
    pseudo: true,
    email: true,
    avatar: true,
    image: true
};
const commentRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /** Tous les commentaires d'un post (à plat, triés du plus ancien). */ getByPost: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        postId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    })).query(async ({ ctx, input })=>{
        return ctx.prisma.comment.findMany({
            where: {
                postId: input.postId
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                author: {
                    select: authorSelect
                }
            }
        });
    }),
    /** Crée un commentaire ou une réponse (si `parentId` fourni). */ create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        postId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        parentId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nullable().optional(),
        content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"]
    })).mutation(async ({ ctx, input })=>{
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.postId
            },
            select: {
                id: true
            }
        });
        if (!post) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Post introuvable."
            });
        }
        // Une réponse doit cibler un commentaire du même post.
        if (input.parentId != null) {
            const parent = await ctx.prisma.comment.findUnique({
                where: {
                    id: input.parentId
                },
                select: {
                    id: true,
                    postId: true
                }
            });
            if (!parent || parent.postId !== input.postId) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: "Commentaire parent invalide."
                });
            }
        }
        return ctx.prisma.comment.create({
            data: {
                postId: input.postId,
                parentId: input.parentId ?? null,
                content: input.content,
                authorId: ctx.sessionClient.user.id
            },
            include: {
                author: {
                    select: authorSelect
                }
            }
        });
    }),
    /** Édite son propre commentaire. */ update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        content: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$shared$2f$prosemirror$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["proseMirrorContentSchema"]
    })).mutation(async ({ ctx, input })=>{
        const comment = await ctx.prisma.comment.findUnique({
            where: {
                id: input.id
            },
            select: {
                authorId: true
            }
        });
        if (!comment) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "NOT_FOUND"
        });
        if (comment.authorId !== ctx.sessionClient.user.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "FORBIDDEN",
                message: "Vous ne pouvez éditer que vos propres commentaires."
            });
        }
        return ctx.prisma.comment.update({
            where: {
                id: input.id
            },
            data: {
                content: input.content
            },
            include: {
                author: {
                    select: authorSelect
                }
            }
        });
    }),
    /**
   * Supprime un commentaire et toute sa sous-arborescence. Les réponses
   * cascadent en DB ; on supprime au préalable les réactions polymorphes
   * de tous les commentaires concernés (récupérés par requête récursive).
   */ delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    })).mutation(async ({ ctx, input })=>{
        const comment = await ctx.prisma.comment.findUnique({
            where: {
                id: input.id
            },
            select: {
                authorId: true
            }
        });
        if (!comment) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
            code: "NOT_FOUND"
        });
        if (comment.authorId !== ctx.sessionClient.user.id) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "FORBIDDEN",
                message: "Vous ne pouvez supprimer que vos propres commentaires."
            });
        }
        // Sous-arborescence (le commentaire + tous ses descendants).
        const descendants = await ctx.prisma.$queryRaw`
        WITH RECURSIVE tree AS (
          SELECT id FROM "Comment" WHERE id = ${input.id}
          UNION ALL
          SELECT c.id FROM "Comment" c JOIN tree t ON c."parentId" = t.id
        )
        SELECT id FROM tree
      `;
        const ids = descendants.map((d)=>d.id);
        await ctx.prisma.$transaction([
            ctx.prisma.reaction.deleteMany({
                where: {
                    targetType: "COMMENT",
                    targetId: {
                        in: ids
                    }
                }
            }),
            // Supprime la racine ; les réponses cascadent (onDelete: Cascade).
            ctx.prisma.comment.delete({
                where: {
                    id: input.id
                }
            })
        ]);
        return {
            id: input.id,
            deletedCount: ids.length
        };
    })
});
}),
"[project]/packages/backend/src/modules/reactions/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "groupReactions",
    ()=>groupReactions,
    "reactionRouter",
    ()=>reactionRouter,
    "userSelect",
    ()=>userSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
;
const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    pseudo: true,
    email: true,
    avatar: true,
    image: true
};
function groupReactions(reactions, currentUserId) {
    const groups = new Map();
    for (const r of reactions){
        let g = groups.get(r.emoji);
        if (!g) {
            g = {
                emoji: r.emoji,
                count: 0,
                reactedByMe: false,
                users: []
            };
            groups.set(r.emoji, g);
        }
        g.count += 1;
        g.users.push(r.user);
        if (currentUserId && r.userId === currentUserId) g.reactedByMe = true;
    }
    return Array.from(groups.values());
}
const reactionRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /** Réactions d'une cible, groupées par emoji avec leurs auteurs. */ getByTarget: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        targetType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ReactionTarget"]),
        targetId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    })).query(async ({ ctx, input })=>{
        const reactions = await ctx.prisma.reaction.findMany({
            where: {
                targetType: input.targetType,
                targetId: input.targetId
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                user: {
                    select: userSelect
                }
            }
        });
        return groupReactions(reactions, ctx.sessionClient?.user?.id);
    }),
    /**
   * Variante batch : réactions de plusieurs cibles d'un même type (ex.
   * tous les commentaires d'un post), pour éviter le N+1. Renvoie un
   * dictionnaire `{ [targetId]: GroupedReaction[] }`.
   */ getByTargets: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        targetType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ReactionTarget"]),
        targetIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()).max(500)
    })).query(async ({ ctx, input })=>{
        const result = {};
        for (const id of input.targetIds)result[id] = [];
        if (input.targetIds.length === 0) return result;
        const reactions = await ctx.prisma.reaction.findMany({
            where: {
                targetType: input.targetType,
                targetId: {
                    in: input.targetIds
                }
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                user: {
                    select: userSelect
                }
            }
        });
        const byTarget = new Map();
        for (const r of reactions){
            if (!byTarget.has(r.targetId)) byTarget.set(r.targetId, []);
            byTarget.get(r.targetId).push(r);
        }
        const currentUserId = ctx.sessionClient?.user?.id;
        for (const [targetId, list] of byTarget){
            result[targetId] = groupReactions(list, currentUserId);
        }
        return result;
    }),
    /**
   * Bascule la réaction (userId, target, emoji) : la crée si absente,
   * la retire si présente. Renvoie l'état final (`active`).
   */ toggle: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        targetType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].nativeEnum(__TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ReactionTarget"]),
        targetId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        emoji: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(32)
    })).mutation(async ({ ctx, input })=>{
        const userId = ctx.sessionClient.user.id;
        const existing = await ctx.prisma.reaction.findUnique({
            where: {
                userId_targetType_targetId_emoji: {
                    userId,
                    targetType: input.targetType,
                    targetId: input.targetId,
                    emoji: input.emoji
                }
            },
            select: {
                id: true
            }
        });
        if (existing) {
            await ctx.prisma.reaction.delete({
                where: {
                    id: existing.id
                }
            });
            return {
                active: false
            };
        }
        await ctx.prisma.reaction.create({
            data: {
                userId,
                targetType: input.targetType,
                targetId: input.targetId,
                emoji: input.emoji
            }
        });
        return {
            active: true
        };
    })
});
}),
"[project]/packages/backend/src/modules/polls/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pollRouter",
    ()=>pollRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
const pollRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /** Sondage d'un post avec résultats et votes de l'utilisateur courant. */ getByPost: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        postId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    })).query(async ({ ctx, input })=>{
        const poll = await ctx.prisma.poll.findUnique({
            where: {
                postId: input.postId
            },
            include: {
                options: {
                    orderBy: {
                        sortOrder: "asc"
                    },
                    include: {
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    }
                }
            }
        });
        if (!poll) return null;
        const userId = ctx.sessionClient?.user?.id;
        let myVotes = [];
        if (userId) {
            const votes = await ctx.prisma.pollVote.findMany({
                where: {
                    pollId: poll.id,
                    userId
                },
                select: {
                    optionId: true
                }
            });
            myVotes = votes.map((v)=>v.optionId);
        }
        const options = poll.options.map((o)=>({
                id: o.id,
                label: o.label,
                sortOrder: o.sortOrder,
                count: o._count.votes
            }));
        return {
            id: poll.id,
            question: poll.question,
            multiple: poll.multiple,
            closesAt: poll.closesAt,
            isClosed: poll.closesAt != null && poll.closesAt.getTime() < Date.now(),
            options,
            myVotes,
            totalVotes: options.reduce((sum, o)=>sum + o.count, 0)
        };
    }),
    /** Crée le sondage d'un post (refuse si le post en a déjà un). */ create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        postId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        question: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(300),
        multiple: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
        closesAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional(),
        options: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(200)).min(2, "Au moins deux options.").max(20)
    })).mutation(async ({ ctx, input })=>{
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.postId
            },
            select: {
                id: true,
                poll: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (!post) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Post introuvable."
            });
        }
        if (post.poll) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: "Ce post a déjà un sondage."
            });
        }
        return ctx.prisma.poll.create({
            data: {
                postId: input.postId,
                question: input.question,
                multiple: input.multiple,
                closesAt: input.closesAt ?? null,
                options: {
                    create: input.options.map((label, index)=>({
                            label,
                            sortOrder: index
                        }))
                }
            },
            include: {
                options: {
                    orderBy: {
                        sortOrder: "asc"
                    }
                }
            }
        });
    }),
    /**
   * Enregistre les votes de l'utilisateur courant. Remplace tout vote
   * antérieur sur ce sondage (cohérent en mode simple comme multiple).
   */ vote: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        pollId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int(),
        optionIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()).min(1)
    })).mutation(async ({ ctx, input })=>{
        const userId = ctx.sessionClient.user.id;
        const poll = await ctx.prisma.poll.findUnique({
            where: {
                id: input.pollId
            },
            include: {
                options: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if (!poll) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Sondage introuvable."
            });
        }
        if (poll.closesAt != null && poll.closesAt.getTime() < Date.now()) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Ce sondage est clôturé."
            });
        }
        if (!poll.multiple && input.optionIds.length > 1) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "BAD_REQUEST",
                message: "Ce sondage n'autorise qu'un seul choix."
            });
        }
        const validIds = new Set(poll.options.map((o)=>o.id));
        for (const optionId of input.optionIds){
            if (!validIds.has(optionId)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "BAD_REQUEST",
                    message: `Option ${optionId} invalide pour ce sondage.`
                });
            }
        }
        await ctx.prisma.$transaction([
            ctx.prisma.pollVote.deleteMany({
                where: {
                    pollId: input.pollId,
                    userId
                }
            }),
            ctx.prisma.pollVote.createMany({
                data: input.optionIds.map((optionId)=>({
                        pollId: input.pollId,
                        optionId,
                        userId
                    }))
            })
        ]);
        return {
            ok: true
        };
    }),
    /** Supprime un sondage (et ses options/votes en cascade). */ delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_posts")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int()
    })).mutation(async ({ ctx, input })=>{
        await ctx.prisma.poll.delete({
            where: {
                id: input.id
            }
        });
        return {
            id: input.id
        };
    })
});
}),
"[project]/packages/backend/src/modules/disciplineFamilies/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "disciplineFamilyRouter",
    ()=>disciplineFamilyRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)");
;
;
;
;
;
;
/**
 * disciplineFamilies/router.ts
 *
 * CRUD DisciplineFamily — regroupement martial transverse des disciplines
 * (« Kung-fu », « Karaté », « Kali »). Sert d'axe de navigation dans le
 * menu public « Nos activités » (niveau intermédiaire entre le menu et la
 * discipline).
 *
 * Promu en entité (et non `Discipline.family: String?` libre) pour la même
 * raison qu'`Origin` : un axe de regroupement exposé au public ne doit pas
 * souffrir de doublons orthographiques. Modèle simple et stable :
 * `name`/`slug`/`sortOrder`.
 *
 * Conventions (calquées sur `origins`) :
 *   - Lectures   : `publicProcedure` (alimente le menu et les sélecteurs admin).
 *   - Écritures  : `protectedProcedure.use(requirePermission("manage_disciplines"))`.
 *                  Pas de permission dédiée — les familles relèvent du domaine
 *                  de gestion des disciplines. À séparer en
 *                  `manage_discipline_families` si besoin un jour.
 *
 * Règles métier :
 *   - `delete` est un hard delete : refusé si des disciplines y sont encore
 *     rattachées (CONFLICT), plutôt que de casser leur `familyId`.
 *   - Unicité `(name)` et `(slug)` portée par le schéma ; P2002 → CONFLICT
 *     avec le champ fautif.
 */ /* -------------------------------------------------------------------------- */ /*                           SHARED VALIDATION SCHEMAS                        */ /* -------------------------------------------------------------------------- */ const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"],
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).default(0)
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"].optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional()
});
/* -------------------------------------------------------------------------- */ /*                          INTERNAL ERROR MAPPING                            */ /* -------------------------------------------------------------------------- */ function uniqueViolationMessage(err) {
    const target = err.meta?.target;
    if (Array.isArray(target)) {
        if (target.includes("name")) {
            return "A discipline family with this name already exists.";
        }
        if (target.includes("slug")) {
            return "A discipline family with this slug already exists.";
        }
    }
    return "A discipline family with this name or slug already exists.";
}
const disciplineFamilyRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Liste toutes les familles, triées par sortOrder puis name.
   * Peuple le sélecteur `FamilySelect` (DisciplineForm) et le futur menu.
   */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        return ctx.prisma.disciplineFamily.findMany({
            orderBy: [
                {
                    sortOrder: "asc"
                },
                {
                    name: "asc"
                }
            ]
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const family = await ctx.prisma.disciplineFamily.findUnique({
            where: {
                id: input.id
            }
        });
        if (!family) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Discipline family not found."
            });
        }
        return family;
    }),
    getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"]
    })).query(async ({ ctx, input })=>{
        const family = await ctx.prisma.disciplineFamily.findUnique({
            where: {
                slug: input.slug
            }
        });
        if (!family) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Discipline family not found."
            });
        }
        return family;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(createInput).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.disciplineFamily.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    sortOrder: input.sortOrder
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: uniqueViolationMessage(err)
                });
            }
            throw err;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...rest } = input;
        try {
            return await ctx.prisma.disciplineFamily.update({
                where: {
                    id
                },
                data: {
                    name: rest.name,
                    slug: rest.slug,
                    sortOrder: rest.sortOrder
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "CONFLICT",
                        message: uniqueViolationMessage(err)
                    });
                }
                if (err.code === "P2025") {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                        code: "NOT_FOUND",
                        message: "Discipline family not found."
                    });
                }
            }
            throw err;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_disciplines")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Refus si des disciplines y sont encore rattachées — on ne casse
        // pas leur familyId par effet de bord.
        const disciplineCount = await ctx.prisma.discipline.count({
            where: {
                familyId: input.id
            }
        });
        if (disciplineCount > 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "CONFLICT",
                message: `Cannot delete family: ${disciplineCount} discipline(s) still reference it. Reassign or detach them first.`
            });
        }
        try {
            return await ctx.prisma.disciplineFamily.delete({
                where: {
                    id: input.id
                }
            });
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && err.code === "P2025") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "NOT_FOUND",
                    message: "Discipline family not found."
                });
            }
            throw err;
        }
    })
});
const __TURBOPACK__default__export__ = disciplineFamilyRouter;
}),
"[project]/packages/backend/src/modules/galleries/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CAROUSEL_SLUG",
    ()=>CAROUSEL_SLUG,
    "default",
    ()=>__TURBOPACK__default__export__,
    "galleryRouter",
    ()=>galleryRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/slug/slug.schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/media-url.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$deriveMediaKind$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/helpers/deriveMediaKind.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
;
;
;
;
;
const CAROUSEL_SLUG = "home-carousel";
/**
 * Items publiés → shape publique (URL proxy audience `public`, kind dérivé,
 * poster vidéo). Partagé par `getCarousel` et `getPublicIndex`.
 */ function mapPublicItems(items) {
    return items.filter((it)=>it.mediaAsset.status === "published").map((it)=>{
        const a = it.mediaAsset;
        const kind = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$deriveMediaKind$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveMediaKind"])(a.resourceType, a.mimeType);
        const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$helpers$2f$media$2d$url$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildMediaProxyUrl"])({
            publicId: a.publicId,
            fullPath: a.fullPath
        }, "public");
        return {
            mediaAssetId: it.mediaAssetId,
            url,
            kind,
            posterUrl: kind === "video" ? `${url}&as=poster` : null,
            mimeType: a.mimeType,
            fileName: a.fullPath.split("/").pop() ?? a.fullPath,
            width: a.width,
            height: a.height
        };
    });
}
/** include standard : items ordonnés + l'asset média de chaque item. */ const galleryWithItems = {
    items: {
        orderBy: {
            sortOrder: "asc"
        },
        include: {
            mediaAsset: true
        }
    }
};
const themeFields = {
    disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    stageId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    eventId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional(),
    originId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().nullable().optional()
};
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"],
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1, "Le titre est obligatoire.").max(120),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional(),
    visibility: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "PUBLIC",
        "MEMBERS"
    ]).optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional(),
    ...themeFields
});
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"].optional(),
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(120).optional(),
    date: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional(),
    visibility: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "PUBLIC",
        "MEMBERS"
    ]).optional(),
    sortOrder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional(),
    ...themeFields
});
const galleryRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /* ----- Lectures admin ----- */ getAll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).query(async ({ ctx })=>{
        return ctx.prisma.gallery.findMany({
            orderBy: {
                sortOrder: "asc"
            },
            include: {
                _count: {
                    select: {
                        items: true
                    }
                },
                discipline: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                stage: {
                    select: {
                        id: true,
                        label: true
                    }
                },
                event: {
                    select: {
                        id: true,
                        label: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        type: true
                    }
                },
                origin: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }),
    getById: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const gallery = await ctx.prisma.gallery.findUnique({
            where: {
                id: input.id
            },
            include: galleryWithItems
        });
        if (!gallery) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Galerie introuvable."
            });
        }
        return gallery;
    }),
    /* ----- Lectures publiques ----- */ getBySlug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        slug: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$slug$2f$slug$2e$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["slugSchema"]
    })).query(async ({ ctx, input })=>{
        const gallery = await ctx.prisma.gallery.findUnique({
            where: {
                slug: input.slug
            },
            include: galleryWithItems
        });
        if (!gallery || gallery.visibility === "MEMBERS" && !ctx.sessionClient?.user) {
            // NOT_FOUND aussi pour MEMBERS+anonyme : ne pas révéler l'existence.
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "Galerie introuvable."
            });
        }
        return gallery;
    }),
    /**
   * Récupère la galerie du carousel d'accueil (slug `CAROUSEL_SLUG`) avec ses
   * items filtrés (assets publiés uniquement) et transformés (URL de proxy +
   * métadonnées + kind/posterUrl).
   *
   * Accessible publiquement pour afficher le carousel sur la page d'accueil
   * sans authentification.
   *
   * Le `kind` est dérivé via le helper partagé `deriveMediaKind` (même logique
   * que `media.resolveByIds`), et le poster vidéo via la route proxy `&as=poster`.
   * Les URLs sont construites pour l'audience `public` (les assets R2
   * éventuels passent alors par la route publique).
   */ getCarousel: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        const gallery = await ctx.prisma.gallery.findUnique({
            where: {
                slug: CAROUSEL_SLUG
            },
            include: galleryWithItems
        });
        if (!gallery) return null;
        return {
            id: gallery.id,
            slug: gallery.slug,
            title: gallery.title,
            items: mapPublicItems(gallery.items)
        };
    }),
    /**
   * Index public des galeries — SESSION-AWARE : un visiteur anonyme ne
   * reçoit que les galeries PUBLIC ; un membre connecté reçoit aussi les
   * MEMBERS (droit à l'image : la visibilité se décide PAR galerie). Le
   * carousel d'accueil (slug réservé) est exclu — il a sa page. Items
   * publiés uniquement, même mapping que le carousel. Tri : date desc
   * (sans date en dernier), puis sortOrder.
   */ getPublicIndex: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        const galleries = await ctx.prisma.gallery.findMany({
            where: {
                slug: {
                    not: CAROUSEL_SLUG
                },
                ...ctx.sessionClient?.user ? {} : {
                    visibility: "PUBLIC"
                }
            },
            orderBy: [
                {
                    date: {
                        sort: "desc",
                        nulls: "last"
                    }
                },
                {
                    sortOrder: "asc"
                }
            ],
            include: {
                ...galleryWithItems,
                // Facettes nécessaires au groupement/filtrage de la vue publique :
                // discipline (niveau 1), catégorie (niveau 2), origine (filtre).
                discipline: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        type: true
                    }
                },
                origin: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return galleries.map((g)=>({
                id: g.id,
                slug: g.slug,
                title: g.title,
                date: g.date,
                visibility: g.visibility,
                discipline: g.discipline,
                category: g.category,
                origin: g.origin,
                items: mapPublicItems(g.items)
            }));
    }),
    /* ----- Écritures ----- */ create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).input(createInput).mutation(async ({ ctx, input })=>{
        try {
            return await ctx.prisma.gallery.create({
                data: input
            });
        } catch (e) {
            if (e instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && e.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "Ce slug de galerie est déjà utilisé."
                });
            }
            throw e;
        }
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...data } = input;
        try {
            return await ctx.prisma.gallery.update({
                where: {
                    id
                },
                data
            });
        } catch (e) {
            if (e instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["Prisma"].PrismaClientKnownRequestError && e.code === "P2002") {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                    code: "CONFLICT",
                    message: "Ce slug de galerie est déjà utilisé."
                });
            }
            throw e;
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        // Les GalleryItem sont supprimés en cascade (FK onDelete: Cascade).
        return ctx.prisma.gallery.delete({
            where: {
                id: input.id
            }
        });
    }),
    /* ----- Gestion des items (ajout / retrait / réordonnancement) ----- */ /**
   * Remplace l'intégralité des items d'une galerie par la liste ordonnée
   * `mediaAssetIds` (le `sortOrder` suit l'index du tableau). Couvre en une
   * seule opération l'ajout, le retrait et le réordonnancement — pratique
   * pour un écran admin en drag-and-drop. Transactionnel.
   */ setItems: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_galleries")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        galleryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
        mediaAssetIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).default([])
    })).mutation(async ({ ctx, input })=>{
        return ctx.prisma.$transaction(async (tx)=>{
            await tx.galleryItem.deleteMany({
                where: {
                    galleryId: input.galleryId
                }
            });
            if (input.mediaAssetIds.length > 0) {
                await tx.galleryItem.createMany({
                    data: input.mediaAssetIds.map((mediaAssetId, index)=>({
                            galleryId: input.galleryId,
                            mediaAssetId,
                            sortOrder: index
                        })),
                    skipDuplicates: true
                });
            }
            return tx.gallery.findUnique({
                where: {
                    id: input.galleryId
                },
                include: galleryWithItems
            });
        });
    })
});
const __TURBOPACK__default__export__ = galleryRouter;
}),
"[project]/packages/backend/src/modules/breakingNews/router.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "breakingNewsRouter",
    ()=>breakingNewsRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/tracked-DWInO6EQ.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/middleware.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Router des BreakingNews — les actualités courtes du club.
 *
 * La BreakingNews est la « voix du club » : diffusion UNIDIRECTIONNELLE
 * (ruban défilant + sidebar du site public), sans auteur affiché, sans
 * commentaires ni réactions — le pendant inverse de Post.
 *
 * Cycle de vie :
 *   - **`publicationDate?`** : pattern maison (Stage/Event/Post) —
 *     null = brouillon, future = programmée, passée = publiée.
 *   - **`expiresAt?`** : une actu est éphémère — passée cette échéance,
 *     elle disparaît du ruban et de la sidebar (null = sans expiration).
 *
 * Accès :
 *   - Lecture publique : `getActive` uniquement (publiées ET non
 *     expirées) — un brouillon ou une actu périmée n'existe pas
 *     publiquement.
 *   - Tout le reste : `requirePermission("manage_breaking_news")`.
 */ /* -------------------------------------------------------------------------- */ /*                                  SCHEMAS                                   */ /* -------------------------------------------------------------------------- */ const fields = {
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(150),
    /** Texte brut court — le ruban défile mal du texte riche. */ body: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(600),
    /**
   * Lien optionnel : interne (« /#post-12 » — un vote sur le mur) ou
   * externe. Pas de `.url()` : il doit accepter les chemins relatifs.
   */ href: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(500).nullable().optional(),
    publicationDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional(),
    expiresAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date().nullable().optional()
};
/** L'expiration, si présente avec une publication, doit lui être postérieure. */ const assertCoherentDates = (data, ctx)=>{
    if (data.publicationDate && data.expiresAt && data.expiresAt <= data.publicationDate) {
        ctx.addIssue({
            code: "custom",
            path: [
                "expiresAt"
            ],
            message: "L'expiration doit être postérieure à la publication."
        });
    }
};
const createInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object(fields).superRefine(assertCoherentDates);
const updateInput = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    ...fields
}).superRefine(assertCoherentDates);
const breakingNewsRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["router"])({
    /**
   * Actus actives = publiées ET non expirées, la plus récente d'abord.
   * Alimente le ruban et la sidebar sur toutes les pages publiques.
   * Cap défensif à 20 : le ruban n'a pas vocation à défiler l'histoire
   * du club.
   */ getActive: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publicProcedure"].query(async ({ ctx })=>{
        const now = new Date();
        return ctx.prisma.breakingNews.findMany({
            where: {
                publicationDate: {
                    not: null,
                    lte: now
                },
                OR: [
                    {
                        expiresAt: null
                    },
                    {
                        expiresAt: {
                            gt: now
                        }
                    }
                ]
            },
            orderBy: {
                publicationDate: "desc"
            },
            take: 20
        });
    }),
    /** Liste admin complète — brouillons d'abord (nulls first), puis par date. */ getAllAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_breaking_news")).query(async ({ ctx })=>{
        return ctx.prisma.breakingNews.findMany({
            orderBy: [
                {
                    publicationDate: {
                        sort: "desc",
                        nulls: "first"
                    }
                },
                {
                    createdAt: "desc"
                }
            ]
        });
    }),
    getByIdAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_breaking_news")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).query(async ({ ctx, input })=>{
        const news = await ctx.prisma.breakingNews.findUnique({
            where: {
                id: input.id
            }
        });
        if (!news) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "BreakingNews not found."
            });
        }
        return news;
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_breaking_news")).input(createInput).mutation(async ({ ctx, input })=>{
        return ctx.prisma.breakingNews.create({
            data: {
                title: input.title,
                body: input.body,
                href: input.href ?? null,
                publicationDate: input.publicationDate ?? null,
                expiresAt: input.expiresAt ?? null
            }
        });
    }),
    update: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_breaking_news")).input(updateInput).mutation(async ({ ctx, input })=>{
        const { id, ...data } = input;
        try {
            return await ctx.prisma.breakingNews.update({
                where: {
                    id
                },
                data: {
                    title: data.title,
                    body: data.body,
                    href: data.href ?? null,
                    publicationDate: data.publicationDate ?? null,
                    expiresAt: data.expiresAt ?? null
                }
            });
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "BreakingNews not found."
            });
        }
    }),
    delete: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["protectedProcedure"].use((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])("manage_breaking_news")).input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive()
    })).mutation(async ({ ctx, input })=>{
        try {
            await ctx.prisma.breakingNews.delete({
                where: {
                    id: input.id
                }
            });
            return {
                deleted: true
            };
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$tracked$2d$DWInO6EQ$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRPCError"]({
                code: "NOT_FOUND",
                message: "BreakingNews not found."
            });
        }
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/avatar/router.ts [app-route] (ecmascript)");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$events$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/events/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$eventSessions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/eventSessions/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$posts$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/posts/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/storage/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/media/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$origins$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/origins/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$comments$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/comments/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$reactions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/reactions/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$polls$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/polls/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$disciplineFamilies$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/disciplineFamilies/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$galleries$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/galleries/router.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$breakingNews$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/breakingNews/router.ts [app-route] (ecmascript)");
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
    avatar: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$avatar$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["avatarRouter"],
    role: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$roles$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["roleRouter"],
    session: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$session$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sessionRouter"],
    cloudinary: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$cloudinary$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cloudinaryRouter"],
    trash: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$trash$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trashRouter"],
    permission: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$permissions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["permissionRouter"],
    category: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$categories$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["categoryRouter"],
    course: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$courses$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["courseRouter"],
    discipline: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$disciplines$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disciplineRouter"],
    origin: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$origins$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["originRouter"],
    stage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stages$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stageRouter"],
    stageSession: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$stageSessions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stageSessionRouter"],
    event: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$events$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eventRouter"],
    eventSession: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$eventSessions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eventSessionRouter"],
    post: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$posts$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["postRouter"],
    storage: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$storage$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storageRouter"],
    media: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$media$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mediaRouter"],
    comment: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$comments$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commentRouter"],
    reaction: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$reactions$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reactionRouter"],
    poll: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$polls$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pollRouter"],
    disciplineFamily: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$disciplineFamilies$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disciplineFamilyRouter"],
    gallery: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$galleries$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["galleryRouter"],
    breakingNews: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$breakingNews$2f$router$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["breakingNewsRouter"]
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@trpc+server@11.17.0_typescript@5.9.3/node_modules/@trpc/server/dist/adapters/fetch/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$modules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/modules/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$backend$2f$src$2f$trpc$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/backend/src/trpc/core.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
const handler = async (req)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$trpc$2b$server$40$11$2e$17$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$adapters$2f$fetch$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchRequestHandler"])({
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

//# sourceMappingURL=%5Broot-of-the-server%5D__875b8c57._.js.map