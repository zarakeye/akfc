module.exports = [
"[project]/packages/config/app.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
}),
"[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFinderStore",
    ()=>useFinderStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.15_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
;
;
const VIEW_MODE_STORAGE_KEY = 'akfc:finder:view-mode';
function loadViewMode() {
    if ("TURBOPACK compile-time truthy", 1) return 'grid';
    //TURBOPACK unreachable
    ;
}
function saveViewMode(mode) {
    try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch  {}
}
const SORT_STORAGE_KEY = 'akfc:finder:sort';
const DEFAULT_SORT = {
    primary: 'name',
    primaryDirection: 'asc',
    secondary: null,
    secondaryDirection: 'asc'
};
function isValidSortField(v) {
    return v === 'name' || v === 'type' || v === 'size' || v === 'date' || v === 'sender';
}
function isValidSortDirection(v) {
    return v === 'asc' || v === 'desc';
}
function loadSort() {
    if ("TURBOPACK compile-time truthy", 1) return DEFAULT_SORT;
    //TURBOPACK unreachable
    ;
}
function saveSort(sort) {
    try {
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort));
    } catch  {}
}
/* ---- Search flags persistence ----
   La QUERY n'est pas persistée (éphémère) mais les FLAGS le sont
   (préférence user : si tu fais toujours du case-sensitive, tu ne veux
   pas le réactiver à chaque session). */ const SEARCH_FLAGS_STORAGE_KEY = 'akfc:finder:search-flags';
const DEFAULT_SEARCH_FLAGS = {
    caseSensitive: false,
    wholeWord: false,
    useRegex: false
};
function loadSearchFlags() {
    if ("TURBOPACK compile-time truthy", 1) return DEFAULT_SEARCH_FLAGS;
    //TURBOPACK unreachable
    ;
}
function saveSearchFlags(flags) {
    try {
        localStorage.setItem(SEARCH_FLAGS_STORAGE_KEY, JSON.stringify(flags));
    } catch  {}
}
const useFinderStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        currentPath: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}`,
        setPath: (path)=>set((state)=>{
                const cached = state.contentCache.get(path);
                return {
                    currentPath: path,
                    folders: cached?.folders ?? [],
                    files: cached?.files ?? [],
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    },
                    multiSelectActive: false,
                    // Sortie de la recherche au changement de path : la query est attachée
                    // au prefix actuel, ça n'a plus de sens de la garder active.
                    search: {
                        ...state.search,
                        query: '',
                        results: [],
                        truncated: false,
                        loading: false
                    }
                };
            }),
        folders: [],
        files: [],
        contentCache: new Map(),
        setContent: ({ folders, files })=>set((state)=>{
                const newCache = new Map(state.contentCache);
                newCache.set(state.currentPath, {
                    folders,
                    files
                });
                return {
                    folders,
                    files,
                    contentCache: newCache
                };
            }),
        cacheChildrenAt: (path, children)=>set((state)=>{
                const folders = children.filter((c)=>c.type === 'folder');
                const files = children.filter((c)=>c.type === 'file');
                const newCache = new Map(state.contentCache);
                newCache.set(path, {
                    folders,
                    files
                });
                return {
                    contentCache: newCache
                };
            }),
        reloadKey: 0,
        reloadFolderContent: ()=>set((state)=>({
                    reloadKey: state.reloadKey + 1,
                    contentCache: new Map()
                })),
        selection: {
            roots: new Set(),
            excluded: new Set(),
            anchorId: null
        },
        setSelection: (ids, anchorId = null)=>set(()=>({
                    selection: {
                        roots: new Set(ids),
                        excluded: new Set(),
                        anchorId
                    }
                })),
        toggleSelect: (id)=>set((state)=>{
                const { roots, excluded } = state.selection;
                const nextRoots = new Set(roots);
                const nextExcluded = new Set(excluded);
                if (nextRoots.has(id)) {
                    nextRoots.delete(id);
                } else {
                    nextRoots.add(id);
                    nextExcluded.delete(id);
                }
                return {
                    selection: {
                        roots: nextRoots,
                        excluded: nextExcluded,
                        anchorId: id
                    }
                };
            }),
        selectOnly: (id)=>set(()=>({
                    selection: {
                        roots: new Set([
                            id
                        ]),
                        excluded: new Set(),
                        anchorId: id
                    }
                })),
        selectRange: (ids)=>set((state)=>{
                if (!ids.length) return state;
                const nextRoots = new Set(state.selection.roots);
                for (const id of ids)nextRoots.add(id);
                return {
                    selection: {
                        ...state.selection,
                        roots: nextRoots,
                        anchorId: ids[ids.length - 1] ?? state.selection.anchorId
                    }
                };
            }),
        excludeItem: (id)=>set((state)=>{
                const nextExcluded = new Set(state.selection.excluded);
                nextExcluded.add(id);
                return {
                    selection: {
                        ...state.selection,
                        excluded: nextExcluded
                    }
                };
            }),
        clearSelection: ()=>set(()=>({
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    }
                })),
        multiSelectActive: false,
        enterMultiSelect: (firstId)=>set(()=>({
                    multiSelectActive: true,
                    selection: {
                        roots: new Set([
                            firstId
                        ]),
                        excluded: new Set(),
                        anchorId: firstId
                    }
                })),
        exitMultiSelect: ()=>set(()=>({
                    multiSelectActive: false,
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    }
                })),
        viewMode: loadViewMode(),
        setViewMode: (mode)=>{
            saveViewMode(mode);
            set({
                viewMode: mode
            });
        },
        sort: loadSort(),
        setSortPrimary: (field, direction)=>{
            set((state)=>{
                let nextDirection;
                if (direction) nextDirection = direction;
                else if (state.sort.primary === field) nextDirection = state.sort.primaryDirection === 'asc' ? 'desc' : 'asc';
                else nextDirection = state.sort.primaryDirection;
                const next = {
                    ...state.sort,
                    primary: field,
                    primaryDirection: nextDirection
                };
                saveSort(next);
                return {
                    sort: next
                };
            });
        },
        setSortSecondary: (field, direction)=>{
            set((state)=>{
                let nextDirection;
                if (direction) nextDirection = direction;
                else if (field !== null && state.sort.secondary === field) nextDirection = state.sort.secondaryDirection === 'asc' ? 'desc' : 'asc';
                else nextDirection = state.sort.secondaryDirection;
                const next = {
                    ...state.sort,
                    secondary: field,
                    secondaryDirection: nextDirection
                };
                saveSort(next);
                return {
                    sort: next
                };
            });
        },
        toggleSortDirection: (level)=>{
            set((state)=>{
                const next = {
                    ...state.sort
                };
                if (level === 'primary') next.primaryDirection = state.sort.primaryDirection === 'asc' ? 'desc' : 'asc';
                else next.secondaryDirection = state.sort.secondaryDirection === 'asc' ? 'desc' : 'asc';
                saveSort(next);
                return {
                    sort: next
                };
            });
        },
        resetSort: ()=>{
            saveSort(DEFAULT_SORT);
            set({
                sort: DEFAULT_SORT
            });
        },
        /* -------------------------------- SEARCH -------------------------------- */ search: {
            query: '',
            flags: loadSearchFlags(),
            results: [],
            truncated: false,
            loading: false
        },
        setSearchQuery: (query)=>set((state)=>({
                    search: {
                        ...state.search,
                        query
                    }
                })),
        toggleSearchFlag: (flag)=>set((state)=>{
                const nextFlags = {
                    ...state.search.flags,
                    [flag]: !state.search.flags[flag]
                };
                saveSearchFlags(nextFlags);
                return {
                    search: {
                        ...state.search,
                        flags: nextFlags
                    }
                };
            }),
        setSearchResults: (results, truncated)=>set((state)=>({
                    search: {
                        ...state.search,
                        results,
                        truncated,
                        loading: false
                    }
                })),
        setSearchLoading: (loading)=>set((state)=>({
                    search: {
                        ...state.search,
                        loading
                    }
                })),
        clearSearch: ()=>set((state)=>({
                    search: {
                        ...state.search,
                        query: '',
                        results: [],
                        truncated: false,
                        loading: false
                    }
                }))
    }));
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
"[project]/apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CropGridOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function CropGridOverlay({ grid, setGrid, workspaceRef }) {
    // const dragging = useRef<boolean>(false);
    const gridRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onMouseDown = (e)=>{
        e.preventDefault();
        dragStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            gridX: grid.x,
            gridY: grid.y
        };
    };
    // const [workspaceRect, setWorkspaceRect] = useState<DOMRect | null>(null);
    /* 📐 mesurer le workspace une fois monté */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onMouseMove = (e)=>{
            const start = dragStart.current;
            const workspace = workspaceRef.current;
            if (!start || !workspace) return;
            const dx = e.clientX - start.mouseX;
            const dy = e.clientY - start.mouseY;
            const workspaceRect = workspace.getBoundingClientRect();
            setGrid((prev)=>({
                    ...prev,
                    x: Math.min(Math.max(start.gridX + dx, 0), workspaceRect.width - prev.width),
                    y: Math.min(Math.max(start.gridY + dy, 0), workspaceRect.height - prev.height)
                }));
        };
        const onMouseUp = ()=>{
            dragStart.current = null;
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return ()=>{
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [
        setGrid,
        workspaceRef
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: gridRef,
        onMouseDown: onMouseDown,
        className: "absolute border  pointer-events-auto cursor-move select-none",
        style: {
            left: grid.x,
            top: grid.y,
            width: grid.width,
            height: grid.height
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full grid grid-cols-3 grid-rows-3 ",
            children: Array.from({
                length: 9
            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border border-gray-300"
                }, i, false, {
                    fileName: "[project]/apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx",
                    lineNumber: 94,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx",
            lineNumber: 92,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CropMaskOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function CropMaskOverlay({ grid }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "absolute inset-0 pointer-events-none",
        width: "100%",
        height: "100%",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mask", {
                    id: "crop-mask",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: "0",
                            y: "0",
                            width: "100%",
                            height: "100%",
                            fill: "white"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: grid.x,
                            y: grid.y,
                            width: grid.width,
                            height: grid.height,
                            fill: "black"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "0",
                y: "0",
                width: "100%",
                height: "100%",
                fill: "rgba(0,0,0,0.6)",
                mask: "url(#crop-mask)"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/gallery-crop/hooks/useTransformWithUndo.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTransformWithUndo",
    ()=>useTransformWithUndo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function useTransformWithUndo(initialValue, options = {}) {
    const { commitDelay = 300 } = options;
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialValue);
    const [, setHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const interactionStartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const interactionStartTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** ⚡ Appelé au début d’un geste (mousedown / touchstart / focus) */ const startInteraction = ()=>{
        if (interactionStartRef.current === null) {
            interactionStartRef.current = value;
            interactionStartTimeRef.current = Date.now();
        }
    };
    /** ⚡ Appelé à chaque changement */ const update = (nextValue)=>{
        setValue(nextValue);
    };
    /** ⚡ Appelé à la fin d’un geste (mouseup / touchend / blur) */ const endInteraction = ()=>{
        const startValue = interactionStartRef.current;
        const startTime = interactionStartTimeRef.current;
        if (startValue !== null && startTime !== null) {
            const duration = Date.now() - startTime;
            if (duration >= commitDelay) {
                setHistory((h)=>[
                        ...h,
                        startValue
                    ]);
            }
        }
        interactionStartRef.current = null;
        interactionStartTimeRef.current = null;
    };
    /**
   * Undoes the last transformation.
   * If there is no transformation to undo, it does nothing.
   * @returns {void}
   */ const undo = ()=>{
        setHistory((h)=>{
            const last = h[h.length - 1];
            if (last !== undefined) {
                setValue(last);
                return h.slice(0, -1);
            }
            return h;
        });
    };
    const reset = ()=>{
        setValue(initialValue);
        setHistory([]);
        interactionStartRef.current = null;
        interactionStartTimeRef.current = null;
    };
    return {
        value,
        set: update,
        undo,
        reset,
        startInteraction,
        endInteraction
    };
}
}),
"[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Cropper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$cropGridOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$cropMaskOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/gallery-crop/components/cropMaskOverlay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$hooks$2f$useTransformWithUndo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/gallery-crop/hooks/useTransformWithUndo.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const WORKSPACE = 500; // px, cf. le carré de l'établi ci-dessous
/**
 * Rendu du crop — UNE SEULE fonction, utilisée à la fois pour l'aperçu et
 * pour l'export. C'est la clé de la fidélité : aperçu == résultat, par
 * construction. On REPRODUIT à l'identique la scène que l'utilisateur voit
 * dans l'établi (image en `object-contain` dans un carré WORKSPACE, puis
 * CSS `scale(zoom) rotate(rotation)` autour du centre du workspace), et on
 * en extrait la zone couverte par la grille.
 *
 * Le canvas de sortie fait la taille de la grille (ou une version réduite à
 * `outSize` pour l'aperçu). Toutes les transformations (translation vers le
 * centre du workspace, rotation, zoom) sont appliquées AU CONTEXTE, comme le
 * ferait le navigateur — jamais recalculées à la main dans l'espace image.
 */ function drawCrop(canvas, img, grid, zoom, rotationDeg, workspaceSize, outSize) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 1) Placement `object-contain` de l'image dans le workspace (avant CSS
    //    transform) : l'image est centrée, mise à l'échelle pour tenir dans
    //    WORKSPACE×WORKSPACE en gardant son ratio.
    const containScale = Math.min(workspaceSize / img.width, workspaceSize / img.height);
    const drawnW = img.width * containScale;
    const drawnH = img.height * containScale;
    const imgLeft = (workspaceSize - drawnW) / 2; // position dans le workspace
    const imgTop = (workspaceSize - drawnH) / 2;
    // 2) Taille de sortie : celle de la grille, éventuellement réduite (aperçu).
    const scaleOut = outSize ? outSize / Math.max(grid.width, grid.height) : 1;
    const outW = Math.max(1, Math.round(grid.width * scaleOut));
    const outH = Math.max(1, Math.round(grid.height * scaleOut));
    canvas.width = outW;
    canvas.height = outH;
    ctx.clearRect(0, 0, outW, outH);
    ctx.save();
    // 3) On travaille dans l'espace du workspace, mais décalé pour que le coin
    //    haut-gauche de la GRILLE devienne l'origine (0,0) du canvas, puis mis
    //    à l'échelle de sortie.
    ctx.scale(scaleOut, scaleOut);
    ctx.translate(-grid.x, -grid.y);
    // 4) Reproduction EXACTE de la transform CSS : `transform-origin` par défaut
    //    d'un élément `w-full h-full` est son centre = centre du workspace.
    //    CSS applique scale() puis rotate() autour de ce centre.
    const cx = workspaceSize / 2;
    const cy = workspaceSize / 2;
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.rotate(rotationDeg * Math.PI / 180);
    ctx.translate(-cx, -cy);
    // 5) Dessin de l'image à sa position `object-contain`.
    ctx.drawImage(img, imgLeft, imgTop, drawnW, drawnH);
    ctx.restore();
}
function Cropper({ picture, onCrop, onCancel }) {
    const previewCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const workspaceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const imgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const zoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$hooks$2f$useTransformWithUndo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransformWithUndo"])(1, {
        commitDelay: 250
    });
    const rotation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$hooks$2f$useTransformWithUndo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransformWithUndo"])(0, {
        commitDelay: 250
    });
    const [grid, setGrid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 150,
        y: 150,
        width: 200,
        height: 200
    });
    // Charge l'image une fois, la garde en ref pour aperçu + export.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const img = new Image();
        img.src = picture.previewUrl;
        img.onload = ()=>{
            imgRef.current = img;
            renderPreview();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        picture.previewUrl
    ]);
    const workspaceSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return workspaceRef.current?.getBoundingClientRect().width ?? WORKSPACE;
    }, []);
    const renderPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const canvas = previewCanvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        drawCrop(canvas, img, grid, zoom.value, rotation.value, workspaceSize(), 120);
    }, [
        grid,
        zoom.value,
        rotation.value,
        workspaceSize
    ]);
    // Aperçu live à chaque changement.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        renderPreview();
    }, [
        renderPreview
    ]);
    const handleCrop = ()=>{
        const img = imgRef.current;
        if (!img) return;
        const canvas = document.createElement("canvas");
        // Export pleine résolution (pas d'outSize → taille exacte de la grille).
        drawCrop(canvas, img, grid, zoom.value, rotation.value, workspaceSize());
        canvas.toBlob((blob)=>{
            if (!blob) return;
            onCrop({
                pictureId: picture.id,
                croppedFile: new File([
                    blob
                ], picture.file.name, {
                    type: "image/png",
                    lastModified: Date.now()
                })
            });
        }, "image/png");
    };
    const resetAll = ()=>{
        zoom.reset();
        rotation.reset();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white p-4 rounded shadow gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: workspaceRef,
                            className: "relative w-[500px] h-[500px] overflow-hidden bg-checkerboard",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: picture.previewUrl,
                                    alt: "",
                                    className: "absolute w-full h-full object-contain pointer-events-none",
                                    style: {
                                        transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$cropMaskOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    grid: grid
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 173,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$cropGridOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    grid: grid,
                                    setGrid: setGrid,
                                    workspaceRef: workspaceRef
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 174,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                            ref: previewCanvasRef,
                            className: "border w-32 h-32 object-contain"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 181,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-6 mt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 0.1,
                                    max: 3,
                                    step: 0.01,
                                    value: zoom.value,
                                    onMouseDown: zoom.startInteraction,
                                    onMouseUp: zoom.endInteraction,
                                    onChange: (e)=>zoom.set(Number(e.target.value))
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 190,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: zoom.undo,
                                    children: "undo"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 200,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: zoom.reset,
                                    children: "reset"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 203,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 189,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: -180,
                                    max: 180,
                                    step: 1,
                                    value: rotation.value,
                                    onMouseDown: rotation.startInteraction,
                                    onMouseUp: rotation.endInteraction,
                                    onChange: (e)=>rotation.set(Number(e.target.value))
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 210,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: rotation.undo,
                                    children: "undo"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 220,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: rotation.reset,
                                    children: "reset"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                                    lineNumber: 223,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 209,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: resetAll,
                            className: "px-3 py-1 bg-red-500 text-white rounded",
                            children: "Reset all"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 228,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 mt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onCancel,
                            children: "Annuler"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 237,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleCrop,
                            className: "bg-blue-600 text-white px-3 py-1 rounded",
                            children: "Cropper"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                            lineNumber: 240,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
                    lineNumber: 236,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
            lineNumber: 158,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DragNDropForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$dropzone$40$14$2e$4$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-dropzone@14.4.1_react@19.2.0/node_modules/react-dropzone/dist/es/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$76$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-hook-form@7.76.1_react@19.2.0/node_modules/react-hook-form/dist/index.esm.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hookform$2b$resolvers$40$5$2e$4$2e$0_react$2d$hook$2d$form$40$7$2e$76$2e$1_react$40$19$2e$2$2e$0_$2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@hookform+resolvers@5.4.0_react-hook-form@7.76.1_react@19.2.0_/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/external.js [app-ssr] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$stores$2f$useSessionStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/stores/useSessionStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/contracts/src/storage/virtual-path.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$Cropper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/gallery-crop/components/Cropper.tsx [app-ssr] (ecmascript)");
'use client';
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
 * DragNDropForm — multi-backend (Cloudinary + R2)
 *
 * Formulaire d'upload pour la bibliothèque AKFC. Accepte plusieurs types de
 * fichiers (images, vidéos, audios, docs, archives) et **dispatche
 * automatiquement** sur le bon backend de stockage :
 *
 *   - image/*, video/*   → Cloudinary (transformations à la volée)
 *   - audio, docs, zip   → R2 (zero egress, stockage froid)
 *
 * Le dispatch repose sur `pickBackend(mimeType)` (`@contracts/storage`) —
 * même règle que côté finder pour la cohérence.
 *
 * ─── Conflits Cloudinary (ré-upload) ──────────────────────────────────────
 *
 * À l'autorisation, le backend signe `overwrite:false` par défaut et renvoie
 * `alreadyExists` par asset. Si des fichiers existent déjà, on demande à
 * l'utilisateur (dialogue) : Annuler (on ignore ces fichiers) ou Écraser
 * (on re-signe ces fichiers avec `overwrite:true`). Le binaire d'origine est
 * donc protégé tant que l'utilisateur n'a pas explicitement confirmé.
 */ /* -------------------------------------------------------------------------- */ /*                                CONSTANTES                                  */ /* -------------------------------------------------------------------------- */ const MAX_FILES_PER_BATCH = 20;
const MAX_FILE_SIZE_CLOUDINARY_MB = 50;
const MAX_FILE_SIZE_R2_MB = 500;
const MAX_FILE_SIZE_CLOUDINARY_BYTES = MAX_FILE_SIZE_CLOUDINARY_MB * 1024 * 1024;
const MAX_FILE_SIZE_R2_BYTES = MAX_FILE_SIZE_R2_MB * 1024 * 1024;
const ACCEPTED_MIME_TYPES = {
    // Images (Cloudinary)
    'image/jpeg': [
        '.jpg',
        '.jpeg'
    ],
    'image/png': [
        '.png'
    ],
    'image/webp': [
        '.webp'
    ],
    'image/avif': [
        '.avif'
    ],
    'image/gif': [
        '.gif'
    ],
    // Vidéos (Cloudinary)
    'video/mp4': [
        '.mp4'
    ],
    'video/webm': [
        '.webm'
    ],
    'video/quicktime': [
        '.mov'
    ],
    // Audios (R2)
    'audio/mpeg': [
        '.mp3'
    ],
    'audio/mp4': [
        '.m4a'
    ],
    'audio/ogg': [
        '.ogg',
        '.oga'
    ],
    'audio/wav': [
        '.wav'
    ],
    // Docs (R2)
    'application/pdf': [
        '.pdf'
    ],
    'text/plain': [
        '.txt'
    ],
    'text/markdown': [
        '.md',
        '.markdown'
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx'
    ],
    // Archives (R2)
    'application/zip': [
        '.zip'
    ]
};
/* -------------------------------------------------------------------------- */ /*                              SCHÉMA DE FORM                                */ /* -------------------------------------------------------------------------- */ const formSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('destinationKind', [
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        destinationKind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('existing-discipline'),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number({
            message: 'Choisis une catégorie'
        }).int().positive({
            message: 'Choisis une catégorie'
        }),
        disciplineId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number({
            message: 'Choisis une discipline'
        }).int().positive({
            message: 'Choisis une discipline'
        })
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        destinationKind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('new-discipline'),
        categoryId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number({
            message: 'Choisis une catégorie'
        }).int().positive({
            message: 'Choisis une catégorie'
        }),
        proposedDisciplineName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$4$2e$3$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1, {
            message: 'Nom requis'
        }).max(120, {
            message: 'Maximum 120 caractères'
        }).refine((v)=>/[a-zA-Z0-9]/.test(v), {
            message: 'Le nom doit contenir au moins une lettre ou un chiffre'
        })
    })
]);
/* -------------------------------------------------------------------------- */ /*                                  HELPERS                                   */ /* -------------------------------------------------------------------------- */ const EXT_TO_MIME = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    // Vidéos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    // Audios
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    wav: 'audio/wav',
    // Docs
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Archives
    zip: 'application/zip'
};
function resolveMimeFromExtension(filename) {
    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx === -1 || dotIdx === filename.length - 1) return null;
    const ext = filename.slice(dotIdx + 1).toLowerCase();
    return EXT_TO_MIME[ext] ?? null;
}
function ensureMimeType(file) {
    if (file.type && file.type.length > 0) return file;
    const resolved = resolveMimeFromExtension(file.name);
    if (!resolved) return file;
    return new File([
        file
    ], file.name, {
        type: resolved,
        lastModified: file.lastModified
    });
}
function slugify(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function getMaxBytesForFile(file) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickBackend"])(file.type) === 'cloudinary' ? MAX_FILE_SIZE_CLOUDINARY_BYTES : MAX_FILE_SIZE_R2_BYTES;
}
function isImageOrVideo(file) {
    return file.type.startsWith('image/') || file.type.startsWith('video/');
}
function iconForMime(mime) {
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime === 'application/pdf') return '📕';
    if (mime === 'application/zip') return '🗜️';
    if (mime.startsWith('text/')) return '📝';
    if (mime.includes('word')) return '📘';
    return '📄';
}
function DragNDropForm() {
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$stores$2f$useSessionStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSessionStore"])((s)=>s.session?.user);
    const { data: categories = [] } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].category.getAll.useQuery();
    const reloadFolderContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.reloadFolderContent);
    // -------------------------------
    // Formulaire react-hook-form
    // -------------------------------
    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$76$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$hookform$2b$resolvers$40$5$2e$4$2e$0_react$2d$hook$2d$form$40$7$2e$76$2e$1_react$40$19$2e$2$2e$0_$2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zodResolver"])(formSchema),
        mode: 'onTouched',
        defaultValues: {
            destinationKind: 'existing-discipline'
        }
    });
    // eslint-disable-next-line react-hooks/incompatible-library
    const destinationKind = watch('destinationKind');
    const categoryId = watch('categoryId');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setValue('disciplineId', undefined);
    }, [
        categoryId,
        setValue
    ]);
    // -------------------------------
    // Disciplines de la catégorie sélectionnée
    // -------------------------------
    const disciplinesQuery = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].discipline.getAllByCategory.useQuery({
        categoryId: categoryId ?? 0
    }, {
        enabled: typeof categoryId === 'number' && categoryId > 0
    });
    const disciplines = disciplinesQuery.data ?? [];
    // -------------------------------
    // Mutations tRPC
    // -------------------------------
    const createUploadAuthMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].storage.createUploadAuthorization.useMutation();
    const registerUploadedAssetMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].storage.registerUploadedAsset.useMutation();
    const createR2UploadMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].storage.createR2Upload.useMutation();
    const registerR2UploadMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].storage.registerR2Upload.useMutation();
    // -------------------------------
    // État items (hors form RHF)
    // -------------------------------
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [itemToCrop, setItemToCrop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [filesError, setFilesError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitError, setSubmitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitSuccess, setSubmitSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [skippedCount, setSkippedCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [overwritePrompt, setOverwritePrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Pause le pipeline jusqu'au choix de l'utilisateur (résolu par les boutons du dialogue).
    function askOverwrite(names) {
        return new Promise((resolve)=>setOverwritePrompt({
                names,
                resolve
            }));
    }
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // -------------------------------
    // Dropzone
    // -------------------------------
    const onDrop = (acceptedFiles)=>{
        setFilesError(null);
        const normalizedFiles = acceptedFiles.map(ensureMimeType);
        const oversized = normalizedFiles.filter((f)=>f.size > getMaxBytesForFile(f));
        if (oversized.length > 0) {
            setFilesError(`Fichiers trop volumineux : ${oversized.map((f)=>{
                const max = getMaxBytesForFile(f) / 1024 / 1024;
                return `${f.name} (max ${max} Mo pour ce type)`;
            }).join(', ')}`);
            return;
        }
        const validNew = normalizedFiles.filter((f)=>f.size <= getMaxBytesForFile(f));
        setItems((prev)=>{
            const total = prev.length + validNew.length;
            if (total > MAX_FILES_PER_BATCH) {
                setFilesError(`Maximum ${MAX_FILES_PER_BATCH} fichiers par envoi (tu en aurais ${total}).`);
                return prev;
            }
            const next = validNew.map((file)=>({
                    id: crypto.randomUUID(),
                    file,
                    originalFile: file,
                    previewUrl: URL.createObjectURL(file),
                    status: 'pending',
                    backend: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$contracts$2f$src$2f$storage$2f$virtual$2d$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pickBackend"])(file.type)
                }));
            return [
                ...prev,
                ...next
            ];
        });
    };
    const { getRootProps, getInputProps, isDragActive } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$dropzone$40$14$2e$4$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$dropzone$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useDropzone"])({
        onDrop,
        accept: ACCEPTED_MIME_TYPES
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!fileInputRef.current) return;
        const dt = new DataTransfer();
        items.forEach((it)=>dt.items.add(it.file));
        fileInputRef.current.files = dt.files;
    }, [
        items
    ]);
    // -------------------------------
    // Cropper (images uniquement)
    // -------------------------------
    const handleCrop = ({ pictureId, croppedFile })=>{
        setItems((prev)=>prev.map((it)=>{
                if (it.id !== pictureId) return it;
                return {
                    ...it,
                    file: croppedFile,
                    previewUrl: URL.createObjectURL(croppedFile),
                    status: 'pending',
                    errorMessage: undefined
                };
            }));
        setItemToCrop(null);
    };
    const handleResetItem = (id)=>{
        setItems((prev)=>prev.map((it)=>it.id === id ? {
                    ...it,
                    file: it.originalFile,
                    previewUrl: URL.createObjectURL(it.originalFile),
                    status: 'pending',
                    errorMessage: undefined
                } : it));
    };
    const handleRemoveItem = (id)=>{
        setItems((prev)=>prev.filter((it)=>it.id !== id));
        setSelectedIds((prev)=>{
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    const toggleSelect = (id)=>{
        setSelectedIds((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const removeSelected = ()=>{
        setItems((prev)=>prev.filter((it)=>!selectedIds.has(it.id)));
        setSelectedIds(new Set());
    };
    // -------------------------------
    // Helpers — path R2
    // -------------------------------
    const buildR2Path = (destination, fileName)=>{
        const category = categories.find((c)=>c.id === destination.categoryId);
        const categorySlug = slugify(category?.type ?? `cat-${destination.categoryId}`);
        let disciplineSlug;
        if (destination.kind === 'existing-discipline') {
            const discipline = disciplines.find((d)=>d.id === destination.disciplineId);
            disciplineSlug = slugify(discipline?.name ?? `disc-${destination.disciplineId}`);
        } else {
            disciplineSlug = slugify(destination.proposedDisciplineName);
        }
        const dotIdx = fileName.lastIndexOf('.');
        const baseName = dotIdx === -1 ? fileName : fileName.slice(0, dotIdx);
        const ext = dotIdx === -1 ? '' : fileName.slice(dotIdx);
        const safeFileName = `${slugify(baseName)}${ext.toLowerCase()}`;
        return `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/pending/${categorySlug}/${disciplineSlug}/${safeFileName}`;
    };
    async function uploadCloudinaryBatch(cloudinaryItems, destination) {
        if (cloudinaryItems.length === 0) {
            return {
                outcomes: [],
                registeredCount: 0,
                skippedItemIds: []
            };
        }
        const assetsPayload = cloudinaryItems.map((it)=>({
                fileName: it.file.name,
                mimeType: it.file.type,
                mediaType: it.file.type.startsWith('video/') ? 'video' : 'image'
            }));
        // Phase 1 — autorisation SANS overwrite (binaire protégé par défaut)
        const signatures = await createUploadAuthMutation.mutateAsync({
            provider: 'cloudinary',
            destination,
            allowOverwrite: false,
            assets: assetsPayload
        });
        const conflictingIdx = signatures.map((sig, idx)=>sig.alreadyExists ? idx : -1).filter((idx)=>idx !== -1);
        let effectiveSignatures = signatures;
        const skippedItemIds = [];
        if (conflictingIdx.length > 0) {
            const choice = await askOverwrite(conflictingIdx.map((i)=>cloudinaryItems[i].file.name));
            if (choice === 'cancel') {
                conflictingIdx.forEach((i)=>skippedItemIds.push(cloudinaryItems[i].id));
            } else {
                // Écraser : re-signer UNIQUEMENT les conflictuels avec overwrite:true
                const overwriteSigs = await createUploadAuthMutation.mutateAsync({
                    provider: 'cloudinary',
                    destination,
                    allowOverwrite: true,
                    assets: conflictingIdx.map((i)=>assetsPayload[i])
                });
                effectiveSignatures = [
                    ...signatures
                ];
                conflictingIdx.forEach((idx, k)=>{
                    effectiveSignatures[idx] = overwriteSigs[k];
                });
            }
        }
        const skippedSet = new Set(skippedItemIds);
        const sigByItemId = new Map(cloudinaryItems.map((it, idx)=>[
                it.id,
                effectiveSignatures[idx]
            ]));
        const toUpload = cloudinaryItems.filter((it)=>!skippedSet.has(it.id));
        // Phase 2 — POST en parallèle (on saute les ignorés)
        const outcomes = await Promise.all(toUpload.map(async (item)=>{
            const sig = sigByItemId.get(item.id);
            try {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('api_key', sig.apiKey);
                formData.append('timestamp', String(sig.timestamp));
                formData.append('signature', sig.signature);
                formData.append('folder', sig.folder);
                formData.append('public_id', sig.publicId);
                formData.append('type', sig.type);
                formData.append('overwrite', String(sig.overwrite)); // ← signé → doit être envoyé
                const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;
                const res = await fetch(url, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Cloudinary HTTP ${res.status}: ${text}`);
                }
                const data = await res.json();
                return {
                    ok: true,
                    itemId: item.id,
                    cloudinaryAsset: {
                        publicId: data.public_id,
                        secureUrl: data.secure_url,
                        resourceType: sig.resourceType,
                        format: data.format,
                        bytes: data.bytes,
                        width: data.width,
                        height: data.height,
                        duration: data.duration
                    }
                };
            } catch (err) {
                return {
                    ok: false,
                    itemId: item.id,
                    error: err instanceof Error ? err.message : 'Upload failed'
                };
            }
        }));
        // Phase 3 — register (upsert côté serveur)
        const successes = outcomes.filter((r)=>r.ok);
        let registeredCount = 0;
        if (successes.length > 0) {
            const itemById = new Map(cloudinaryItems.map((it)=>[
                    it.id,
                    it
                ]));
            const registered = await registerUploadedAssetMutation.mutateAsync({
                provider: 'cloudinary',
                destination,
                assets: successes.map((s)=>{
                    const it = itemById.get(s.itemId);
                    const sig = sigByItemId.get(s.itemId);
                    return {
                        ...s.cloudinaryAsset,
                        originalFileName: it.file.name,
                        mimeType: it.file.type,
                        folder: sig.folder
                    };
                })
            });
            registeredCount = registered.assets.length;
        }
        return {
            outcomes,
            registeredCount,
            skippedItemIds
        };
    }
    async function uploadR2Single(item, destination) {
        const path = buildR2Path(destination, item.file.name);
        try {
            const auth = await createR2UploadMutation.mutateAsync({
                path,
                mimeType: item.file.type,
                maxBytes: item.file.size
            });
            const res = await fetch(auth.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': item.file.type
                },
                body: item.file
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`R2 HTTP ${res.status}: ${text.slice(0, 200)}`);
            }
            const result = await registerR2UploadMutation.mutateAsync({
                path,
                expectedBytes: item.file.size,
                expectedMimeType: item.file.type,
                destination,
                originalFileName: item.file.name
            });
            return {
                ok: true,
                itemId: item.id,
                path: result.path,
                bytes: result.bytes
            };
        } catch (err) {
            return {
                ok: false,
                itemId: item.id,
                error: err instanceof Error ? err.message : 'Upload R2 failed'
            };
        }
    }
    // -------------------------------
    // Soumission
    // -------------------------------
    const onSubmit = async (values)=>{
        setSubmitError(null);
        setSubmitSuccess(null);
        setSkippedCount(null);
        setFilesError(null);
        if (!user?.id) {
            setSubmitError('Tu dois être connecté pour envoyer des fichiers.');
            return;
        }
        const toUpload = items.filter((it)=>it.status === 'pending' || it.status === 'error');
        if (toUpload.length === 0) {
            setFilesError('Ajoute au moins un fichier à envoyer.');
            return;
        }
        setIsSubmitting(true);
        setItems((prev)=>prev.map((it)=>toUpload.find((t)=>t.id === it.id) ? {
                    ...it,
                    status: 'uploading',
                    errorMessage: undefined
                } : it));
        const destination = values.destinationKind === 'existing-discipline' ? {
            kind: 'existing-discipline',
            categoryId: values.categoryId,
            disciplineId: values.disciplineId
        } : {
            kind: 'new-discipline',
            categoryId: values.categoryId,
            proposedDisciplineName: values.proposedDisciplineName.trim()
        };
        const cloudinaryItems = toUpload.filter((it)=>it.backend === 'cloudinary');
        const r2Items = toUpload.filter((it)=>it.backend === 'r2');
        try {
            const [cloudinaryRes, r2Res] = await Promise.all([
                uploadCloudinaryBatch(cloudinaryItems, destination),
                Promise.all(r2Items.map((it)=>uploadR2Single(it, destination)))
            ]);
            const cloudinaryOutcomes = cloudinaryRes.outcomes;
            const r2Outcomes = r2Res;
            // Items ignorés (conflit Cloudinary, choix « Annuler ») → on les
            // remet en `pending` (jamais uploadés, restent dans la liste).
            const skippedSet = new Set(cloudinaryRes.skippedItemIds);
            const successIds = new Set([
                ...cloudinaryOutcomes.filter((o)=>o.ok).map((o)=>o.itemId),
                ...r2Outcomes.filter((o)=>o.ok).map((o)=>o.itemId)
            ]);
            const failures = new Map([
                ...cloudinaryOutcomes.filter((o)=>!o.ok).map((o)=>[
                        o.itemId,
                        o.error
                    ]),
                ...r2Outcomes.filter((o)=>!o.ok).map((o)=>[
                        o.itemId,
                        o.error
                    ])
            ]);
            setItems((prev)=>prev.map((it)=>{
                    if (skippedSet.has(it.id)) {
                        return {
                            ...it,
                            status: 'pending',
                            errorMessage: undefined
                        };
                    }
                    if (successIds.has(it.id)) {
                        return {
                            ...it,
                            status: 'done'
                        };
                    }
                    if (failures.has(it.id)) {
                        return {
                            ...it,
                            status: 'error',
                            errorMessage: failures.get(it.id)
                        };
                    }
                    return it;
                }));
            const totalSuccess = successIds.size;
            if (totalSuccess > 0) {
                setSubmitSuccess(totalSuccess);
                reloadFolderContent();
            }
            if (skippedSet.size > 0) {
                setSkippedCount(skippedSet.size);
            }
            if (failures.size > 0) {
                setSubmitError(`${failures.size} fichier(s) en erreur — voir détail sur chaque vignette. Tu peux re-soumettre pour réessayer.`);
            }
        } catch (err) {
            setItems((prev)=>prev.map((it)=>it.status === 'uploading' ? {
                        ...it,
                        status: 'error',
                        errorMessage: 'Submission failed'
                    } : it));
            setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally{
            setIsSubmitting(false);
            // Filet de sécurité : si un dialogue de conflit était resté ouvert
            // (cas anormal), on le referme pour ne pas bloquer l'UI.
            setOverwritePrompt(null);
        }
    };
    // -------------------------------
    // Render
    // -------------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit(onSubmit),
        className: "space-y-4 w-80",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: fileInputRef,
                type: "file",
                multiple: true,
                hidden: true
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 781,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block font-semibold mb-1",
                        children: "Catégorie"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 785,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        ...register('categoryId', {
                            valueAsNumber: true
                        }),
                        className: "border rounded p-2 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "— Choisir une catégorie —"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 790,
                                columnNumber: 11
                            }, this),
                            categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: cat.id,
                                    children: cat.type
                                }, cat.id, false, {
                                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                    lineNumber: 792,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 786,
                        columnNumber: 9
                    }, this),
                    errors.categoryId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-600 mt-1",
                        children: errors.categoryId.message
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 798,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 784,
                columnNumber: 7
            }, this),
            typeof categoryId === 'number' && categoryId > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "radio",
                                        value: "existing-discipline",
                                        ...register('destinationKind')
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 809,
                                        columnNumber: 15
                                    }, this),
                                    "Discipline existante"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 808,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "radio",
                                        value: "new-discipline",
                                        ...register('destinationKind')
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 817,
                                        columnNumber: 15
                                    }, this),
                                    "Nouvelle (à valider)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 816,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 807,
                        columnNumber: 11
                    }, this),
                    destinationKind === 'existing-discipline' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block font-semibold mb-1",
                                children: "Discipline"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 828,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$hook$2d$form$40$7$2e$76$2e$1_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Controller"], {
                                name: "disciplineId",
                                control: control,
                                render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: field.value ?? '',
                                        onChange: (e)=>field.onChange(e.target.value === '' ? undefined : Number(e.target.value)),
                                        onBlur: field.onBlur,
                                        className: "border rounded p-2 w-full",
                                        disabled: disciplinesQuery.isLoading,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "— Choisir une discipline —"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                                lineNumber: 844,
                                                columnNumber: 21
                                            }, void 0),
                                            disciplines.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: d.id,
                                                    children: d.name
                                                }, d.id, false, {
                                                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                                    lineNumber: 846,
                                                    columnNumber: 23
                                                }, void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 833,
                                        columnNumber: 19
                                    }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 829,
                                columnNumber: 15
                            }, this),
                            disciplinesQuery.isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 mt-1",
                                children: "Chargement…"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 854,
                                columnNumber: 17
                            }, this),
                            'disciplineId' in errors && errors.disciplineId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-red-600 mt-1",
                                children: errors.disciplineId.message
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 857,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 827,
                        columnNumber: 13
                    }, this),
                    destinationKind === 'new-discipline' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block font-semibold mb-1",
                                children: "Nom de la nouvelle discipline"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 866,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                ...register('proposedDisciplineName'),
                                className: "border rounded p-2 w-full",
                                placeholder: "Ex : Stage été 2026 — Kali"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 869,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-500 mt-1",
                                children: "Cette discipline sera proposée à un admin pour validation."
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 875,
                                columnNumber: 15
                            }, this),
                            'proposedDisciplineName' in errors && errors.proposedDisciplineName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-red-600 mt-1",
                                children: errors.proposedDisciplineName.message
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 880,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 865,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ...getRootProps(),
                className: `border-2 border-dashed p-6 rounded-md text-center mt-4 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ...getInputProps()
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 896,
                        columnNumber: 9
                    }, this),
                    isDragActive ? 'Dépose ici' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Glisse des fichiers ou clique (max ",
                                    MAX_FILES_PER_BATCH,
                                    " fichiers par envoi)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 901,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-500 mt-1",
                                children: [
                                    "Images/vidéos jusqu'à ",
                                    MAX_FILE_SIZE_CLOUDINARY_MB,
                                    " Mo · audios/docs/zip jusqu'à ",
                                    MAX_FILE_SIZE_R2_MB,
                                    " Mo"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 905,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 890,
                columnNumber: 7
            }, this),
            filesError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-600",
                children: filesError
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 913,
                columnNumber: 22
            }, this),
            items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-3 gap-4 mt-4",
                children: items.map((it)=>{
                    const showsImagePreview = isImageOrVideo(it.file);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-32 h-32 border rounded overflow-hidden group bg-gray-50",
                        children: [
                            showsImagePreview ? // eslint-disable-next-line @next/next/no-img-element
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: it.previewUrl,
                                alt: "",
                                className: "w-full h-full object-contain cursor-pointer",
                                onClick: ()=>{
                                    if (it.file.type.startsWith('image/')) {
                                        setItemToCrop(it);
                                    }
                                }
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 927,
                                columnNumber: 19
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-full flex flex-col items-center justify-center p-2 text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xl mb-1",
                                        children: iconForMime(it.file.type)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 939,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-700 truncate w-full",
                                        title: it.file.name,
                                        children: it.file.name
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 942,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 938,
                                columnNumber: 19
                            }, this),
                            it.status !== 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `absolute bottom-0 left-0 right-0 text-xs text-white text-center py-0.5 ${it.status === 'uploading' ? 'bg-blue-600/80' : it.status === 'done' ? 'bg-green-600/80' : 'bg-red-600/80'}`,
                                title: it.errorMessage,
                                children: [
                                    it.status === 'uploading' && '⏳ Upload…',
                                    it.status === 'done' && '✅ OK',
                                    it.status === 'error' && '⚠️ Erreur'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 952,
                                columnNumber: 19
                            }, this),
                            it.status === 'error' && it.errorMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -bottom-12 left-0 right-0 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded p-1 break-words leading-tight z-20",
                                children: it.errorMessage
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 969,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-1 left-1 right-1 flex justify-between items-start z-10 pointer-events-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        className: "scale-125 z-10",
                                        checked: selectedIds.has(it.id),
                                        onChange: (e)=>{
                                            e.stopPropagation();
                                            toggleSelect(it.id);
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 975,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1 z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "bg-red-500 text-white text-xs px-1 rounded",
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    handleRemoveItem(it.id);
                                                },
                                                children: "🗑"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                                lineNumber: 985,
                                                columnNumber: 21
                                            }, this),
                                            it.file.type.startsWith('image/') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "bg-yellow-500 text-white text-xs px-1 rounded",
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    handleResetItem(it.id);
                                                },
                                                children: "Reset"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                                lineNumber: 996,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                        lineNumber: 984,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                lineNumber: 974,
                                columnNumber: 17
                            }, this)
                        ]
                    }, it.id, true, {
                        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                        lineNumber: 921,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 917,
                columnNumber: 9
            }, this),
            selectedIds.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "px-3 py-1 bg-red-600 text-white rounded mt-2",
                onClick: removeSelected,
                children: [
                    "Supprimer sélection (",
                    selectedIds.size,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1016,
                columnNumber: 9
            }, this),
            itemToCrop && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$gallery$2d$crop$2f$components$2f$Cropper$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                picture: itemToCrop,
                onCancel: ()=>setItemToCrop(null),
                onCrop: handleCrop
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1026,
                columnNumber: 9
            }, this),
            overwritePrompt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-80 rounded-lg bg-white p-4 shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "mb-2 font-semibold",
                            children: "Fichiers déjà présents"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                            lineNumber: 1037,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2 text-sm text-gray-600",
                            children: [
                                overwritePrompt.names.length,
                                " fichier(s) existent déjà dans la bibliothèque :"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                            lineNumber: 1038,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "mb-3 max-h-32 overflow-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs",
                            children: overwritePrompt.names.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "truncate",
                                    title: n,
                                    children: n
                                }, n, false, {
                                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                    lineNumber: 1044,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                            lineNumber: 1042,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "rounded border px-3 py-1.5 text-sm hover:bg-gray-50",
                                    onClick: ()=>{
                                        overwritePrompt.resolve('cancel');
                                        setOverwritePrompt(null);
                                    },
                                    children: "Annuler (ignorer)"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                    lineNumber: 1050,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700",
                                    onClick: ()=>{
                                        overwritePrompt.resolve('overwrite');
                                        setOverwritePrompt(null);
                                    },
                                    children: "Écraser"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                                    lineNumber: 1060,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                            lineNumber: 1049,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                    lineNumber: 1036,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1035,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                disabled: isSubmitting,
                className: "px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed w-full mt-4",
                children: isSubmitting ? 'Envoi…' : 'Envoyer'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1075,
                columnNumber: 7
            }, this),
            submitSuccess !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-green-700",
                children: [
                    "✅ ",
                    submitSuccess,
                    " fichier(s) enregistré(s) avec succès."
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1084,
                columnNumber: 9
            }, this),
            skippedCount !== null && skippedCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-600",
                children: [
                    "⏭️ ",
                    skippedCount,
                    " fichier(s) déjà présent(s) ont été ignorés."
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1089,
                columnNumber: 9
            }, this),
            submitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-red-700",
                children: [
                    "⚠️ ",
                    submitError
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
                lineNumber: 1093,
                columnNumber: 23
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/admin/library/forms/DragNDropForm.tsx",
        lineNumber: 780,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_d73162a2._.js.map