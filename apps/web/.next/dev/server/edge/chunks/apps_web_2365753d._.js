(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/apps_web_2365753d._.js",
"[project]/apps/web/instrumentation.ts [instrumentation-edge] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const prisma = undefined;
    const ensureRootFolders = undefined;
    const APP_ROOT = undefined;
}
}),
"[project]/apps/web/edge-wrapper.js { MODULE => \"[project]/apps/web/instrumentation.ts [instrumentation-edge] (ecmascript)\" } [instrumentation-edge] (ecmascript)", ((__turbopack_context__, module, exports) => {

self._ENTRIES ||= {};
const modProm = Promise.resolve().then(()=>__turbopack_context__.i("[project]/apps/web/instrumentation.ts [instrumentation-edge] (ecmascript)"));
modProm.catch(()=>{});
self._ENTRIES["middleware_instrumentation"] = new Proxy(modProm, {
    get (modProm, name) {
        if (name === "then") {
            return (res, rej)=>modProm.then(res, rej);
        }
        let result = (...args)=>modProm.then((mod)=>(0, mod[name])(...args));
        result.then = (res, rej)=>modProm.then((mod)=>mod[name]).then(res, rej);
        return result;
    }
});
}),
]);

//# sourceMappingURL=apps_web_2365753d._.js.map