module.exports = [
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
"[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderBinRootView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/state/useTrashStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryTableRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryCompactRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ViewModeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$EmptyBinButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx [app-ssr] (ecmascript)");
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
function FinderBinRootView() {
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setPath);
    const viewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTrashStore"])((s)=>s.viewMode);
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTrashStore"])((s)=>s.selectedIds);
    const toggleSelected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTrashStore"])((s)=>s.toggleSelected);
    const { data, isLoading, isError } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.listBin.useQuery({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
        limit: 100
    }, {
        refetchOnWindowFocus: false,
        staleTime: 5_000
    });
    const entries = data?.items ?? [];
    function handleEntryClick(entry) {
        toggleSelected(entry.id);
    }
    function handleEntryDoubleClick(entry) {
        if (entry.kind === 'folder') {
            // Navigation finder vers le path Cloudinary réel — le finder prend
            // le relais comme pour n'importe quel dossier (lazy load, etc.).
            setPath(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin/.trash/${entry.id}`);
        }
    // Pour les files : pas de navigation. Sélection seule (déjà faite via onClick).
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full min-h-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-b flex items-center gap-3 flex-wrap text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                className: "h-4 w-4 text-gray-500"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            "Corbeille"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ViewModeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$EmptyBinButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        totalCount: entries.length
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashToolbar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto min-h-0",
                children: renderContent()
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
    //TURBOPACK unreachable
    ;
    /* ----------------------------- helpers render --------------------------- */ function renderContent() {
        if (isLoading && entries.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center text-gray-400 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "h-5 w-5 animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: "Chargement de la corbeille..."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 120,
                columnNumber: 9
            }, this);
        }
        if (isError) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center text-red-600 text-sm",
                children: "Erreur lors du chargement de la corbeille."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 129,
                columnNumber: 9
            }, this);
        }
        if (entries.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex flex-col items-center justify-center text-gray-400 gap-2 text-center px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "h-10 w-10 opacity-50",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm",
                        children: "La corbeille est vide."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this);
        }
        if (viewMode === 'grid') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] p-4",
                children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryGrid$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        entry: entry,
                        selected: selectedIds.has(entry.id),
                        onClick: ()=>handleEntryClick(entry),
                        onDoubleClick: ()=>handleEntryDoubleClick(entry)
                    }, entry.id, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 148,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 146,
                columnNumber: 9
            }, this);
        }
        if (viewMode === 'table') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm border-collapse",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left w-8"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left w-8"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 167,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Nom"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Chemin d'origine"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 169,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Supprimé le"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 170,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-right",
                                        children: "Taille"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 171,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                lineNumber: 165,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                            lineNumber: 164,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-gray-100",
                            children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryTableRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    entry: entry,
                                    selected: selectedIds.has(entry.id),
                                    onClick: ()=>handleEntryClick(entry),
                                    onDoubleClick: ()=>handleEntryDoubleClick(entry)
                                }, entry.id, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                    lineNumber: 176,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                            lineNumber: 174,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                    lineNumber: 163,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this);
        }
        // compact
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white",
            children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryCompactRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    entry: entry,
                    selected: selectedIds.has(entry.id),
                    onClick: ()=>handleEntryClick(entry),
                    onDoubleClick: ()=>handleEntryDoubleClick(entry)
                }, entry.id, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                    lineNumber: 194,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
            lineNumber: 192,
            columnNumber: 7
        }, this);
    }
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderViewModeSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-ssr] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rows-3.js [app-ssr] (ecmascript) <export default as Rows3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.js [app-ssr] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const OPTIONS = [
    {
        mode: 'grid',
        label: 'Grille',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"]
    },
    {
        mode: 'table',
        label: 'Tableau',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__["Rows3"]
    },
    {
        mode: 'compact',
        label: 'Liste compacte',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"]
    }
];
function FinderViewModeSwitcher() {
    const viewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.viewMode);
    const setViewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setViewMode);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inline-flex items-center gap-0.5 border rounded p-0.5",
        children: OPTIONS.map(({ mode, label, Icon })=>{
            const active = mode === viewMode;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setViewMode(mode),
                className: `
              p-1.5 rounded
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
              ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
            `,
                title: label,
                "aria-label": label,
                "aria-pressed": active,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx",
                    lineNumber: 54,
                    columnNumber: 13
                }, this)
            }, mode, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx",
                lineNumber: 38,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLongPress",
    ()=>useLongPress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useLongPress(onLongPress, delay = 1500) {
    // Référence au timer en cours (null si aucun timer actif).
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Référence à la fonction qui détache les listeners window. On garde
    // cette indirection pour pouvoir annuler proprement depuis n'importe
    // quel chemin (cancel direct, déclenchement du callback, etc.).
    const cleanupWindowListenersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Flag "le callback a tiré juste à l'instant". Consommé par le handler
    // de click du composant parent pour avaler le click parasite qui suit
    // le mouseup d'un longpress. Cf. doc dans le type de retour.
    const didJustFireRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    /**
   * Annule le timer en cours et détache les listeners window.
   * Idempotent : on peut l'appeler plusieurs fois sans danger.
   */ const cancel = ()=>{
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (cleanupWindowListenersRef.current) {
            cleanupWindowListenersRef.current();
            cleanupWindowListenersRef.current = null;
        }
    };
    /**
   * Démarre le timer du long press.
   *
   * On commence par appeler `cancel()` pour invalider un éventuel timer
   * précédent (cas où l'utilisateur clique très vite plusieurs fois).
   *
   * Ensuite on installe des listeners globaux qui annuleront le timer
   * dès qu'un évènement de fin se produit, où qu'il soit dans la page.
   */ const start = ()=>{
        cancel();
        // Reset le flag : un nouveau cycle commence, les anciens "justFired"
        // qui n'auraient pas été consommés sont obsolètes.
        didJustFireRef.current = false;
        timerRef.current = window.setTimeout(()=>{
            // Le callback est sur le point d'être déclenché : on nettoie les
            // listeners window avant, pour éviter d'annuler le mode qu'on
            // vient juste d'activer (ex: le mouseup qui suit immédiatement).
            timerRef.current = null;
            if (cleanupWindowListenersRef.current) {
                cleanupWindowListenersRef.current();
                cleanupWindowListenersRef.current = null;
            }
            // Marqueur pour que le click parasite qui suit immédiatement le
            // mouseup soit avalé par le composant parent via consumeJustFired().
            didJustFireRef.current = true;
            onLongPress();
        }, delay);
        // ✅ Annulation robuste : tout évènement de fin globale annule le timer.
        const onAnyEnd = ()=>cancel();
        window.addEventListener('mouseup', onAnyEnd, true);
        window.addEventListener('blur', onAnyEnd, true);
        window.addEventListener('dragstart', onAnyEnd, true);
        window.addEventListener('touchend', onAnyEnd, true);
        cleanupWindowListenersRef.current = ()=>{
            window.removeEventListener('mouseup', onAnyEnd, true);
            window.removeEventListener('blur', onAnyEnd, true);
            window.removeEventListener('dragstart', onAnyEnd, true);
            window.removeEventListener('touchend', onAnyEnd, true);
        };
    };
    return {
        onMouseDown: start,
        onMouseUp: cancel,
        onMouseLeave: cancel,
        onTouchStart: start,
        onTouchEnd: cancel,
        onDragStart: cancel,
        consumeJustFired: ()=>{
            const v = didJustFireRef.current;
            didJustFireRef.current = false;
            return v;
        }
    };
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTableRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-play.js [app-ssr] (ecmascript) <export default as FileVideo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-headphone.js [app-ssr] (ecmascript) <export default as FileAudio>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-type.js [app-ssr] (ecmascript) <export default as FileType>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function FinderTableRow({ node, isSelected, multiSelectActive, onClick, onDoubleClick, onLongPress, onDragStart }) {
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLongPress"])(onLongPress);
    const isFolder = node.type === 'folder';
    const Icon = pickIcon(node);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        draggable: true,
        onDragStart: onDragStart,
        onMouseDown: longPress.onMouseDown,
        onMouseUp: longPress.onMouseUp,
        onMouseLeave: longPress.onMouseLeave,
        onTouchStart: longPress.onTouchStart,
        onTouchEnd: longPress.onTouchEnd,
        className: `
        cursor-pointer select-none
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `,
        children: [
            multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-2 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "checkbox",
                    checked: isSelected,
                    readOnly: true,
                    className: "h-4 w-4",
                    "aria-label": `Sélectionner ${node.name}`
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-2 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: `h-4 w-4 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
                    strokeWidth: 1.5
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm font-medium text-gray-900",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "truncate max-w-[260px]",
                    title: node.name,
                    children: node.name
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500 whitespace-nowrap",
                children: isFolder ? 'Dossier' : node.mimeType || node.meta?.format || 'Fichier'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap",
                children: isFolder ? '—' : formatBytes(node.size)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
function pickIcon(node) {
    if (node.type === 'folder') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"];
    const kind = node.meta?.kind;
    if (kind === 'image') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"];
    if (kind === 'video') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__["FileVideo"];
    if (kind === 'document') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    if (node.mimeType?.startsWith('audio/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__["FileAudio"];
    if (node.mimeType?.startsWith('text/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__["FileType"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
}
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderCompactRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/image.js [app-ssr] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-play.js [app-ssr] (ecmascript) <export default as FileVideo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-headphone.js [app-ssr] (ecmascript) <export default as FileAudio>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-type.js [app-ssr] (ecmascript) <export default as FileType>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function FinderCompactRow({ node, isSelected, multiSelectActive, onClick, onDoubleClick, onLongPress, onDragStart }) {
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLongPress"])(onLongPress);
    const isFolder = node.type === 'folder';
    const Icon = pickIcon(node);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        draggable: true,
        onDragStart: onDragStart,
        onMouseDown: longPress.onMouseDown,
        onMouseUp: longPress.onMouseUp,
        onMouseLeave: longPress.onMouseLeave,
        onTouchStart: longPress.onTouchStart,
        onTouchEnd: longPress.onTouchEnd,
        className: `
        cursor-pointer select-none
        flex items-center gap-3 px-3 py-1.5
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `,
        role: "button",
        "aria-pressed": isSelected,
        children: [
            multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "checkbox",
                checked: isSelected,
                readOnly: true,
                className: "h-4 w-4 shrink-0",
                "aria-label": `Sélectionner ${node.name}`
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: `h-4 w-4 shrink-0 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium text-gray-900 truncate min-w-0 flex-1",
                title: node.name,
                children: node.name
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-gray-400 shrink-0 whitespace-nowrap",
                children: isFolder ? '—' : formatBytes(node.size)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
function pickIcon(node) {
    if (node.type === 'folder') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"];
    const kind = node.meta?.kind;
    if (kind === 'image') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"];
    if (kind === 'video') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__["FileVideo"];
    if (kind === 'document') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    if (node.mimeType?.startsWith('audio/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__["FileAudio"];
    if (node.mimeType?.startsWith('text/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__["FileType"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
}
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useFinderData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFinderData",
    ()=>useFinderData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
;
;
function useFinderData(adapter) {
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((state)=>state.currentPath);
    const setContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((state)=>state.setContent);
    const reloadKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((state)=>state.reloadKey);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        // Lecture imperative du cache : on évite de subscribe à `contentCache`
        // pour ne pas re-déclencher cet effect à chaque mutation du cache (qui
        // créerait des boucles infinies). On lit l'état actuel à T0 et c'est
        // suffisant — un nouveau changement de `currentPath` re-évaluera.
        const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(currentPath);
        if (cached) {
            // Cache HIT : le contenu a déjà été appliqué via `setPath`.
            // Pas de fetch, pas de loading. L'utilisateur voit instantanément
            // le contenu mémorisé.
            setLoading(false);
            setError(null);
            return;
        }
        // Cache MISS : fetch normal
        setLoading(true);
        setError(null);
        (async ()=>{
            try {
                const result = await adapter.list({
                    path: currentPath
                });
                if (cancelled) return;
                setContent({
                    folders: result.folders,
                    files: result.files
                });
            } catch (err) {
                if (cancelled) return;
                console.error("[useFinderData]", err);
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally{
                if (!cancelled) setLoading(false);
            }
        })();
        return ()=>{
            cancelled = true;
        };
    }, [
        currentPath,
        adapter,
        setContent,
        reloadKey
    ]);
    return {
        loading,
        error
    };
}
}),
"[project]/apps/web/src/features/finder-core/utils/path.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPathSegments",
    ()=>buildPathSegments,
    "parentPath",
    ()=>parentPath,
    "splitPath",
    ()=>splitPath
]);
function splitPath(path) {
    return path.split('/').filter(Boolean);
}
function buildPathSegments(path) {
    const parts = splitPath(path);
    return parts.map((_, index)=>{
        const fullPath = parts.slice(0, index + 1).join('/');
        return {
            name: parts[index],
            path: fullPath
        };
    });
}
function parentPath(path) {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? '' : path.slice(0, idx);
}
}),
"[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 📦 Schéma du payload de drag-and-drop du finder.
 *
 * Ce module définit le contrat éphémère qui transite via `DataTransfer`
 * pendant un drag : la liste des items déplacés, leur identifiant, leur
 * path logique et leur type (folder|file).
 *
 * 🔑 Pourquoi un MIME custom (`application/x-finder-drag`) plutôt que
 * `application/json` ?
 *
 * Pour distinguer **nos** drags des drags génériques (fichier glissé
 * depuis l'OS, image glissée depuis un autre onglet, etc.). Un drop
 * handler du finder qui voit un payload non-finder peut l'ignorer
 * proprement plutôt que d'essayer de le parser et planter.
 */ __turbopack_context__.s([
    "FINDER_DRAG_MIME",
    ()=>FINDER_DRAG_MIME,
    "dragItemFromNode",
    ()=>dragItemFromNode,
    "isDropAllowed",
    ()=>isDropAllowed,
    "isDropEffective",
    ()=>isDropEffective,
    "serializePayload",
    ()=>serializePayload,
    "tryParsePayload",
    ()=>tryParsePayload
]);
const FINDER_DRAG_MIME = 'application/x-finder-drag';
function serializePayload(payload) {
    return JSON.stringify(payload);
}
function tryParsePayload(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const candidate = parsed;
        if (!Array.isArray(candidate.items)) return null;
        for (const item of candidate.items){
            if (!item || typeof item !== 'object') return null;
            const i = item;
            if (typeof i.id !== 'string') return null;
            if (typeof i.path !== 'string') return null;
            if (i.type !== 'folder' && i.type !== 'file') return null;
        }
        return candidate;
    } catch  {
        return null;
    }
}
function dragItemFromNode(node) {
    return {
        id: node.id,
        path: node.path,
        type: node.type
    };
}
function isDropAllowed(targetPath, items) {
    for (const item of items){
        // Pas de drop sur soi-même
        if (targetPath === item.path) return false;
        // Pas de drop dans un descendant de soi-même
        if (targetPath.startsWith(item.path + '/')) return false;
    }
    return true;
}
function isDropEffective(targetPath, items) {
    return items.some((item)=>parentPath(item.path) !== targetPath);
}
function parentPath(p) {
    const idx = p.lastIndexOf('/');
    return idx === -1 ? '' : p.slice(0, idx);
}
}),
"[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Breadcrumb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/path.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-ssr] (ecmascript)");
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
function Breadcrumb({ adapter }) {
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.currentPath);
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setPath);
    const reloadFolderContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.reloadFolderContent);
    const exitMultiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.exitMultiSelect);
    // Mutation tRPC pour les drops vers le bin (cf. FinderTreeFolder).
    const trashToBinMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.trashToBin.useMutation();
    // Index du segment actuellement survolé en drag — pour le highlight.
    // -1 si rien.
    const [dragOverIndex, setDragOverIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(-1);
    const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildPathSegments"])(currentPath);
    /**
   * Filtre les events DnD : seuls ceux qui portent notre MIME passent.
   * Évite de capter les drags d'images depuis le bureau, les fichiers OS,
   * etc. Strictement identique à la fonction locale de `FinderTreeFolder`
   * (la définition n'est pas exportée de `payload.ts`, on duplique).
   */ function isFinderDrag(e) {
        return e.dataTransfer.types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
    }
    /**
   * Construit les handlers DnD pour un segment précis. On ferme sur
   * `targetPath` et `index` plutôt que de tout poser dans la JSX —
   * facilité de lecture et pas de closures parasites.
   */ function makeDropHandlers(index, targetPath) {
        function handleDragEnter(e) {
            if (!isFinderDrag(e)) return;
            e.preventDefault();
            e.stopPropagation();
            setDragOverIndex(index);
        }
        function handleDragOver(e) {
            if (!isFinderDrag(e)) return;
            // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            if (dragOverIndex !== index) setDragOverIndex(index);
        }
        function handleDragLeave(e) {
            // dragleave émis à chaque traversée d'un enfant : on l'ignore
            // tant qu'on est encore dans le sous-arbre de currentTarget.
            const related = e.relatedTarget;
            if (related && e.currentTarget.contains(related)) return;
            setDragOverIndex((current)=>current === index ? -1 : current);
        }
        async function handleDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            setDragOverIndex(-1);
            const raw = e.dataTransfer.getData(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
            const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tryParsePayload"])(raw);
            if (!payload) return;
            const items = payload.items;
            // Garde-fous standards du DnD (cf. payload.ts).
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDropAllowed"])(targetPath, items)) return;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDropEffective"])(targetPath, items)) return;
            // ─── Cas spécial : drop sur la racine du bin ─────────────────────
            // Strictement parallèle à FinderTreeFolder.handleDrop.
            const BIN_ROOT_PATH = `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin`;
            if (targetPath === BIN_ROOT_PATH) {
                try {
                    await trashToBinMutation.mutateAsync({
                        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                        sources: items.map((it)=>({
                                kind: it.type === 'folder' ? 'folder' : 'file',
                                fullPath: it.path
                            }))
                    });
                    reloadFolderContent();
                    exitMultiSelect();
                } catch (err) {
                    console.error('[Breadcrumb] trashToBin failed', err);
                }
                return;
            }
            // ─── Cas normal : move agnostique via l'adapter ──────────────────
            if (!adapter.moveItems) {
                console.warn('[Breadcrumb] adapter.moveItems unavailable, drop ignoré');
                return;
            }
            try {
                await adapter.moveItems({
                    items,
                    target: {
                        type: 'folder',
                        path: targetPath
                    }
                });
                reloadFolderContent();
                exitMultiSelect();
            } catch (err) {
                console.error('[Breadcrumb] drop failed', err);
            }
        }
        return {
            handleDragEnter,
            handleDragOver,
            handleDragLeave,
            handleDrop
        };
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "flex items-center gap-1 text-sm flex-wrap",
        "aria-label": "Fil d'Ariane",
        children: segments.map((segment, index)=>{
            const isLast = index === segments.length - 1;
            // Tous les segments — y compris la feuille — sont drop-targets.
            //
            // Pourquoi la feuille aussi : la feuille est le `currentPath`, c-à-d
            // le dossier que la GridView affiche. Quand l'utilisateur drag un
            // item depuis la TreeView (un autre folder de l'arbo), drop sur la
            // feuille du breadcrumb est l'endroit naturel pour dire "mets-le
            // dans le dossier que je vois actuellement".
            //
            // Risque "no-op" (drag d'un item déjà dans currentPath puis drop
            // sur la feuille) : déjà géré par `isDropEffective` dans handleDrop.
            // L'event est avalé silencieusement, pas de mutation backend.
            const isCurrentDragOver = dragOverIndex === index;
            const handlers = makeDropHandlers(index, segment.path);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1",
                children: [
                    isLast ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        onDragEnter: handlers.handleDragEnter,
                        onDragOver: handlers.handleDragOver,
                        onDragLeave: handlers.handleDragLeave,
                        onDrop: handlers.handleDrop,
                        // Attribut lu par le ghost manager (cf. dnd/dragGhost.ts) via
                        // document.elementFromPoint pendant le tracking du drag, pour
                        // calculer le badge allowed/forbidden. Sans cet attribut, le
                        // ghost affiche systématiquement la croix rouge "interdit"
                        // alors que le drop fonctionne effectivement.
                        "data-finder-drop-path": segment.path,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('font-medium text-gray-900 truncate max-w-[200px]', 'rounded px-1 py-0.5', // Highlight au dragover (sur la feuille aussi)
                        isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'),
                        title: segment.name,
                        "aria-current": "page",
                        children: segment.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 195,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setPath(segment.path),
                        onDragEnter: handlers.handleDragEnter,
                        onDragOver: handlers.handleDragOver,
                        onDragLeave: handlers.handleDragLeave,
                        onDrop: handlers.handleDrop,
                        // Cf. note sur la feuille — l'attribut est requis pour le
                        // calcul du badge ghost allowed/forbidden.
                        "data-finder-drop-path": segment.path,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('text-gray-600 hover:text-gray-900 hover:underline', 'truncate max-w-[200px]', 'rounded px-1 py-0.5', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400', 'transition-colors', isCurrentDragOver && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'),
                        title: segment.name,
                        children: segment.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 218,
                        columnNumber: 15
                    }, this),
                    !isLast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                        className: "h-3.5 w-3.5 text-gray-400 shrink-0",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 243,
                        columnNumber: 15
                    }, this)
                ]
            }, segment.path, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                lineNumber: 193,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
        lineNumber: 172,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useNodeMetadata.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNodeMetadata",
    ()=>useNodeMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useNodeMetadata(adapter, path) {
    const [metadata, setMetadata] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Pas de cible ou adapter sans support → reset propre, pas de fetch.
        if (!path || !adapter.getMetadata) {
            setMetadata(null);
            setLoading(false);
            setError(null);
            return;
        }
        let cancelled = false;
        async function fetchMetadata() {
            setLoading(true);
            setError(null);
            try {
                // On a vérifié plus haut que getMetadata existe — TS le sait pas
                // dans cette closure async, donc petit non-null.
                const result = await adapter.getMetadata(path);
                if (cancelled) return;
                setMetadata(result);
            } catch (err) {
                if (cancelled) return;
                console.error('[useNodeMetadata]', err);
                setError(err instanceof Error ? err.message : 'Failed to load metadata');
                setMetadata(null);
            } finally{
                if (!cancelled) setLoading(false);
            }
        }
        fetchMetadata();
        return ()=>{
            cancelled = true;
        };
    }, [
        adapter,
        path
    ]);
    return {
        metadata,
        loading,
        error
    };
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useNodeTextContent.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNodeTextContent",
    ()=>useNodeTextContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const DEFAULT_MAX_BYTES = 200_000;
function useNodeTextContent(url, options) {
    const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [truncated, setTruncated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!url) {
            setContent(null);
            setLoading(false);
            setError(null);
            setTruncated(false);
            return;
        }
        const controller = new AbortController();
        let cancelled = false;
        async function fetchText() {
            setLoading(true);
            setError(null);
            setTruncated(false);
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const raw = await response.text();
                if (cancelled) return;
                if (raw.length > maxBytes) {
                    setContent(raw.slice(0, maxBytes));
                    setTruncated(true);
                } else {
                    setContent(raw);
                    setTruncated(false);
                }
            } catch (err) {
                if (cancelled) return;
                // L'AbortError n'est pas une vraie erreur — c'est nous qui avons annulé.
                if (err instanceof Error && err.name === 'AbortError') return;
                console.error('[useNodeTextContent]', err);
                setError(err instanceof Error ? err.message : 'Failed to load content');
                setContent(null);
            } finally{
                if (!cancelled) setLoading(false);
            }
        }
        fetchText();
        return ()=>{
            cancelled = true;
            controller.abort();
        };
    }, [
        url,
        maxBytes
    ]);
    return {
        content,
        loading,
        error,
        truncated
    };
}
}),
"[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveSelection",
    ()=>resolveSelection
]);
function resolveSelection(params) {
    const { items, roots, excluded } = params;
    const result = new Set();
    for (const item of items){
        // sélection directe
        if (roots.has(item.id)) {
            result.add(item.id);
            continue;
        }
        // sélection via parent
        const isChildOfRoot = Array.from(roots).some((rootId)=>{
            const root = items.find((i)=>i.id === rootId);
            if (!root) return false;
            return item.path.startsWith(root.path + '/');
        });
        if (isChildOfRoot && !excluded.has(item.id)) {
            result.add(item.id);
        }
    }
    return result;
}
}),
"[project]/apps/web/src/features/finder-core/utils/formatBytes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Humanise un nombre d'octets en chaîne lisible.
 *
 * Choix de la base : 1024 (binaire) plutôt que 1000 (décimal). C'est la
 * convention historique des systèmes de fichiers (et ce que retournent
 * la plupart des explorateurs de fichiers natifs). Cohérent avec
 * l'attente d'un utilisateur qui regarde la taille d'un asset.
 *
 * @param bytes nombre d'octets, ou undefined/null si inconnu
 * @returns chaîne formatée (ex: '1.2 MB'), ou null si l'entrée est invalide
 */ __turbopack_context__.s([
    "formatBytes",
    ()=>formatBytes
]);
function formatBytes(bytes) {
    if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;
    if (bytes === 0) return '0 B';
    const units = [
        'B',
        'KB',
        'MB',
        'GB',
        'TB'
    ];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    // 0 décimale pour les octets purs, 1 décimale au-dessus.
    // Garde un affichage compact tout en restant lisible.
    const formatted = exponent === 0 ? value.toFixed(0) : value.toFixed(1);
    return `${formatted} ${units[exponent]}`;
}
}),
"[project]/apps/web/src/features/finder-core/utils/formatDate.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Formate une date ISO 8601 en chaîne lisible française.
 *
 * Exemple : `'2024-01-12T14:32:00Z'` → `'12 janv. 2024 à 14:32'`
 *
 * On utilise `Intl.DateTimeFormat` plutôt qu'une lib externe (date-fns,
 * dayjs) pour rester sans dépendance — `Intl` est disponible dans tous
 * les navigateurs modernes ciblés par Next.js 16.
 *
 * Le formateur est instancié à l'extérieur de la fonction pour éviter
 * de recréer un objet `Intl` à chaque appel (coût non négligeable).
 *
 * @param iso chaîne ISO 8601 (UTC ou avec offset), ou undefined/null
 * @returns chaîne formatée, ou null si la date est invalide ou absente
 */ __turbopack_context__.s([
    "formatDate",
    ()=>formatDate
]);
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});
function formatDate(iso) {
    if (!iso) return null;
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return null;
    const date = new Date(ts);
    // Intl.DateTimeFormat retourne par défaut "12 janv. 2024, 14:32"
    // On remplace la virgule par " à " pour un rendu plus naturel en français.
    return dateFormatter.format(date).replace(', ', ' à ');
}
}),
"[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PreviewModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function PreviewModal({ file, kind, isOpen, onClose }) {
    // ─── Listener Escape ───────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        function handleKey(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }
        window.addEventListener('keydown', handleKey);
        return ()=>window.removeEventListener('keydown', handleKey);
    }, [
        isOpen,
        onClose
    ]);
    // ─── Scroll lock du body ───────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return ()=>{
            document.body.style.overflow = previousOverflow;
        };
    }, [
        isOpen
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        // Backdrop : fixed plein écran, semi-opaque, blur léger
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": `Aperçu de ${file.name}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full max-w-350 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm font-medium truncate text-gray-900 flex-1",
                            title: file.name,
                            children: file.name
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "shrink-0 inline-flex items-center justify-center h-8 w-8 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                            title: "Fermer (Échap)",
                            "aria-label": "Fermer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-5 w-5",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                                lineNumber: 121,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-h-0 overflow-hidden bg-gray-50",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PreviewRenderer"], {
                        file: file,
                        kind: kind,
                        variant: "fullscreen"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DescriptionField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const MAX_LENGTH = 2000;
const SAVED_DISPLAY_MS = 2000;
const DEBOUNCE_MS = 1500;
function DescriptionField({ file }) {
    // Valeur courante du textarea (source de vérité pendant la frappe)
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(file.meta?.description ?? '');
    // Dernière valeur effectivement sauvegardée en DB. Sert à savoir s'il y
    // a une diff à sauvegarder (et évite les saves no-op).
    const [savedValue, setSavedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(file.meta?.description ?? '');
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('idle');
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const trpcUtils = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].useUtils();
    const updateMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].media.updateDescription.useMutation();
    // Ref pour pouvoir cancel le timer de debounce + le timer du "saved" badge
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const savedTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ─── Resync sur changement de fichier ──────────────────────────────
    // file.id change → on bascule sur un nouveau fichier, sync le textarea.
    // On utilise file.id et PAS file.meta?.description : ça nous laisse écraser
    // localement avec ce que l'user tape sans être écrasé par un setContent
    // du store (qui pourrait arriver pour des raisons d'enrichissement).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const newValue = file.meta?.description ?? '';
        setValue(newValue);
        setSavedValue(newValue);
        setStatus('idle');
        setErrorMessage(null);
        // Cleanup des timers en cas de changement de fichier en pleine frappe
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (savedTimerRef.current) {
            window.clearTimeout(savedTimerRef.current);
            savedTimerRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        file.id
    ]);
    // ─── Save logic (extrait pour réuse entre blur et debounce) ─────────
    async function save(toSave) {
        // Pas de save si rien n'a changé depuis la dernière save
        if (toSave === savedValue) return;
        setStatus('saving');
        setErrorMessage(null);
        try {
            await updateMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                path: file.path,
                description: toSave
            });
            setSavedValue(toSave);
            setStatus('saved');
            // Invalide le cache des metadata → useMediaAssetEnrichment va
            // re-fetch et propager la nouvelle description partout (searchbar,
            // grid, autres consommateurs).
            await trpcUtils.media.getByPaths.invalidate();
            // Reset visuel après 2s
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
            savedTimerRef.current = window.setTimeout(()=>{
                setStatus('idle');
                savedTimerRef.current = null;
            }, SAVED_DISPLAY_MS);
        } catch (err) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Échec de sauvegarde');
        }
    }
    // ─── Auto-save debounced (1.5s après dernière frappe) ───────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (value === savedValue) return;
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(()=>{
            void save(value);
            debounceRef.current = null;
        }, DEBOUNCE_MS);
        return ()=>{
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        value
    ]);
    // ─── Save on blur (immediate, court-circuite le debounce) ──────────
    function handleBlur() {
        // Si un debounce est en attente, on l'annule et on save tout de suite.
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        if (value !== savedValue) {
            void save(value);
        }
    }
    // ─── Cleanup au démontage ──────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
        };
    }, []);
    const charCount = value.length;
    // Affiche le compteur seulement si on s'approche de la limite — sinon
    // ça pollue inutilement l'UI pour de petites descriptions.
    const showCounter = charCount > MAX_LENGTH * 0.8;
    const overLimit = charCount > MAX_LENGTH;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-t border-gray-100 pt-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: `desc-${file.id}`,
                        className: "text-xs text-gray-500 font-medium",
                        children: "Description"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusIndicator, {
                        status: status,
                        errorMessage: errorMessage
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                id: `desc-${file.id}`,
                value: value,
                onChange: (e)=>setValue(e.target.value),
                onBlur: handleBlur,
                placeholder: "Aucune description — ajoute-en une…",
                rows: 3,
                maxLength: MAX_LENGTH + 100 /* léger margin pour permettre delete depuis état surchargé */ ,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('w-full text-xs p-2 rounded border resize-y min-h-[60px] max-h-[200px]', 'focus:outline-none focus:ring-1 transition-colors', overLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500')
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            showCounter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('text-[10px] text-right mt-0.5', overLimit ? 'text-red-600 font-medium' : 'text-gray-400'),
                children: [
                    charCount,
                    " / ",
                    MAX_LENGTH,
                    overLimit && ' — trop long, raccourcis pour sauvegarder'
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                lineNumber: 204,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
/* -------------------------------------------------------------------------- */ /*                              STATUS INDICATOR                              */ /* -------------------------------------------------------------------------- */ /**
 * Petit indicateur visuel à droite du label "Description".
 * Discret, non bloquant — le user voit du coin de l'œil ce qui se passe
 * sans avoir besoin de cliquer.
 */ function StatusIndicator({ status, errorMessage }) {
    if (status === 'idle') return null;
    if (status === 'saving') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[10px] text-gray-400 flex items-center gap-1",
            "aria-live": "polite",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "w-3 h-3 animate-spin",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this),
                "Enregistrement…"
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
            lineNumber: 238,
            columnNumber: 7
        }, this);
    }
    if (status === 'saved') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-[10px] text-green-600 flex items-center gap-1",
            "aria-live": "polite",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                    className: "w-3 h-3",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this),
                "Enregistré"
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
            lineNumber: 247,
            columnNumber: 7
        }, this);
    }
    // status === 'error'
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "text-[10px] text-red-600 flex items-center gap-1",
        title: errorMessage ?? 'Erreur inconnue',
        "aria-live": "polite",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                className: "w-3 h-3",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this),
            "Erreur — réessayer ?"
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx",
        lineNumber: 259,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarkdownPreview",
    ()=>MarkdownPreview,
    "PreviewRenderer",
    ()=>PreviewRenderer,
    "TextPreview",
    ()=>TextPreview,
    "default",
    ()=>PreviewPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-markdown@10.1.0_@types+react@19.2.15_react@19.2.0/node_modules/react-markdown/lib/index.js [app-ssr] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-search.js [app-ssr] (ecmascript) <export default as FileSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/files.js [app-ssr] (ecmascript) <export default as Files>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-exclamation-point.js [app-ssr] (ecmascript) <export default as FileWarning>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeMetadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeMetadata.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeTextContent.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatBytes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/formatBytes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/formatDate.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/PreviewModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$DescriptionField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/DescriptionField.tsx [app-ssr] (ecmascript)");
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
const AUDIO_FORMATS = new Set([
    'mp3',
    'wav',
    'ogg',
    'oga',
    'm4a',
    'opus',
    'flac'
]);
const TEXT_FORMATS = new Set([
    'txt'
]);
const MARKDOWN_FORMATS = new Set([
    'md',
    'markdown'
]);
const DOCX_FORMATS = new Set([
    'docx'
]);
function getPreviewKind(file, metadata) {
    if (file.meta?.kind === 'image') return 'image';
    if (file.meta?.kind === 'video') return 'video';
    const format = (file.meta?.format ?? metadata?.format ?? '').toLowerCase();
    if (format === 'pdf') return 'pdf';
    if (AUDIO_FORMATS.has(format)) return 'audio';
    if (MARKDOWN_FORMATS.has(format)) return 'markdown';
    if (TEXT_FORMATS.has(format)) return 'text';
    if (DOCX_FORMATS.has(format)) return 'docx';
    return 'unsupported';
}
function PreviewPanel({ adapter }) {
    const { selection, files } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])();
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const allItems = files.map((f)=>({
            id: f.id,
            path: f.path
        }));
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveSelection"])({
        items: allItems,
        roots: selection.roots,
        excluded: selection.excluded
    });
    const ids = Array.from(resolved);
    const file = ids.length === 1 ? files.find((f)=>f.id === ids[0]) ?? null : null;
    const { metadata, loading: metadataLoading, error: metadataError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeMetadata$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeMetadata"])(adapter, file?.path ?? null);
    /* ------------------------------ EMPTY STATE ----------------------------- */ if (ids.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__["FileSearch"], {
                    className: "h-10 w-10 opacity-50",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm",
                    children: [
                        "Sélectionnez un fichier",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 97,
                            columnNumber: 34
                        }, this),
                        "pour le prévisualiser"
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 94,
            columnNumber: 7
        }, this);
    }
    /* ---------------------------- MULTI-SELECTION --------------------------- */ if (ids.length > 1) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__["Files"], {
                    className: "h-10 w-10 opacity-60 text-gray-400",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-base font-medium text-gray-700",
                    children: [
                        ids.length,
                        " éléments sélectionnés"
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm text-gray-400",
                    children: "Aperçu multiple non disponible"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 107,
            columnNumber: 7
        }, this);
    }
    /* -------------------------- SINGLE BUT NOT FOUND ------------------------ */ if (!file) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-red-400 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__["FileWarning"], {
                    className: "h-10 w-10 opacity-60",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm",
                    children: "Aperçu indisponible"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 119,
            columnNumber: 7
        }, this);
    }
    /* -------------------------- SINGLE FILE PREVIEW ------------------------- */ const kind = getPreviewKind(file, metadata);
    const canExpand = kind !== 'unsupported' && Boolean(file.meta?.url);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 h-full flex flex-col gap-4 overflow-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm font-medium truncate flex-1",
                        title: file.name,
                        children: file.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    canExpand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setModalOpen(true),
                        className: "shrink-0 inline-flex items-center justify-center h-7 w-7 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
                        title: "Ouvrir en grand",
                        "aria-label": "Ouvrir en grand",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                            className: "h-3.5 w-3.5",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewRenderer, {
                file: file,
                kind: kind,
                variant: "inline"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            adapter.getMetadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MetadataBlock, {
                metadata: metadata,
                loading: metadataLoading,
                error: metadataError
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$DescriptionField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                file: file
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400 break-all select-text",
                children: file.path
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                file: file,
                kind: kind,
                isOpen: modalOpen,
                onClose: ()=>setModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
function PreviewRenderer({ file, kind, variant = 'inline' }) {
    const url = file.meta?.url;
    if (!url) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
            message: "Pas de preview disponible"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 201,
            columnNumber: 12
        }, this);
    }
    const isFullscreen = variant === 'fullscreen';
    switch(kind){
        case 'image':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: url,
                alt: file.name,
                className: isFullscreen ? 'max-w-full max-h-full object-contain mx-auto' : 'max-h-[300px] object-contain rounded border'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 209,
                columnNumber: 9
            }, this);
        case 'video':
            return isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full w-full flex items-center justify-center bg-black",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                    src: url,
                    controls: true,
                    autoPlay: true,
                    className: "w-full h-full object-contain"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 223,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                src: url,
                controls: true,
                className: "max-h-[300px] rounded border w-full"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 231,
                columnNumber: 9
            }, this);
        case 'audio':
            return isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full w-full flex items-center justify-center p-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                    src: url,
                    controls: true,
                    autoPlay: true,
                    className: "w-full max-w-2xl"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 241,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 240,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                src: url,
                controls: true,
                className: "w-full"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 244,
                columnNumber: 9
            }, this);
        case 'pdf':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: url,
                title: file.name,
                className: isFullscreen ? 'w-full h-full border-0' : 'w-full h-[400px] rounded border'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 249,
                columnNumber: 9
            }, this);
        case 'text':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TextPreview, {
                url: url,
                variant: variant
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 261,
                columnNumber: 14
            }, this);
        case 'markdown':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkdownPreview, {
                url: url,
                variant: variant
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 264,
                columnNumber: 14
            }, this);
        case 'docx':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DocxPreview, {
                url: url,
                variant: variant
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 267,
                columnNumber: 14
            }, this);
        case 'unsupported':
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
                message: "Aperçu non supporté pour ce format"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 271,
                columnNumber: 14
            }, this);
    }
}
function PreviewEmpty({ message }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-gray-400 text-sm italic",
        children: message
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 276,
        columnNumber: 10
    }, this);
}
function TextPreview({ url, variant = 'inline' }) {
    const { content, loading, error, truncated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeTextContent"])(url);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Chargement…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 292,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Impossible de charger le fichier"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 293,
        columnNumber: 21
    }, this);
    if (content === null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Fichier vide"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 294,
        columnNumber: 32
    }, this);
    const containerClass = variant === 'fullscreen' ? 'h-full overflow-auto p-6 bg-gray-50 text-sm whitespace-pre-wrap break-words font-mono' : 'max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-xs whitespace-pre-wrap break-words';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1',
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: containerClass,
                children: content
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-gray-400 italic px-3 py-1",
                children: "Aperçu tronqué — fichier trop volumineux pour un affichage complet."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 305,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 302,
        columnNumber: 5
    }, this);
}
function MarkdownPreview({ url, variant = 'inline' }) {
    const { content, loading, error, truncated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeTextContent"])(url);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Chargement…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 322,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Impossible de charger le fichier"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 323,
        columnNumber: 21
    }, this);
    if (content === null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Fichier vide"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 324,
        columnNumber: 32
    }, this);
    const containerClass = variant === 'fullscreen' ? 'h-full overflow-auto p-8 bg-white text-base markdown-preview max-w-4xl mx-auto' : 'max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-sm markdown-preview';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1',
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: containerClass,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
                    children: content
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-gray-400 italic px-3 py-1",
                children: "Aperçu tronqué — fichier trop volumineux pour un affichage complet."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 337,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 332,
        columnNumber: 5
    }, this);
}
/* -------------------------------------------------------------------------- */ /*                              DOCX PREVIEW                                  */ /* -------------------------------------------------------------------------- */ function DocxPreview({ url, variant = 'inline' }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        html: null,
        loading: true,
        error: null
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function run() {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const mammoth = await __turbopack_context__.A("[project]/node_modules/.pnpm/mammoth@1.12.0/node_modules/mammoth/lib/index.js [app-ssr] (ecmascript, async loader)");
                const result = await mammoth.convertToHtml({
                    arrayBuffer
                });
                if (!cancelled) {
                    setState({
                        html: result.value,
                        loading: false,
                        error: null
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setState({
                        html: null,
                        loading: false,
                        error: err instanceof Error ? err.message : 'Conversion failed'
                    });
                }
            }
        }
        setState({
            html: null,
            loading: true,
            error: null
        });
        void run();
        return ()=>{
            cancelled = true;
        };
    }, [
        url
    ]);
    if (state.loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Conversion DOCX en cours…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 397,
        columnNumber: 29
    }, this);
    if (state.error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Impossible d'afficher le document"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 398,
        columnNumber: 27
    }, this);
    if (!state.html) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Document vide"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 399,
        columnNumber: 27
    }, this);
    const containerClass = variant === 'fullscreen' ? 'h-full overflow-auto p-8 bg-white text-base docx-preview max-w-4xl mx-auto' : 'max-h-[400px] overflow-auto p-3 rounded border bg-gray-50 text-sm docx-preview';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1',
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: containerClass,
            dangerouslySetInnerHTML: {
                __html: state.html
            }
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 408,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 407,
        columnNumber: 5
    }, this);
}
/* -------------------------------------------------------------------------- */ /*                              METADATA BLOCK                                */ /* -------------------------------------------------------------------------- */ function MetadataBlock({ metadata, loading, error }) {
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-gray-100 pt-3 text-xs text-gray-400",
            children: "Chargement…"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 428,
            columnNumber: 7
        }, this);
    }
    if (error || metadata === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-gray-100 pt-3 text-xs text-gray-400 italic",
            children: "Métadonnées indisponibles"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 436,
            columnNumber: 7
        }, this);
    }
    const rows = [];
    if (metadata.format) rows.push({
        label: 'Format',
        value: metadata.format
    });
    if (metadata.mimeType) rows.push({
        label: 'Type MIME',
        value: metadata.mimeType
    });
    const size = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatBytes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatBytes"])(metadata.bytes);
    if (size) rows.push({
        label: 'Taille',
        value: size
    });
    const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(metadata.createdAt);
    if (created) rows.push({
        label: 'Créé le',
        value: created
    });
    const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(metadata.updatedAt);
    if (updated) rows.push({
        label: 'Modifié le',
        value: updated
    });
    if (rows.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-t border-gray-100 pt-3",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs",
            children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "contents",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-500",
                            children: row.label
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 463,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-800 break-all",
                            children: row.value
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 464,
                            columnNumber: 13
                        }, this)
                    ]
                }, row.label, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 462,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 460,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 459,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useNodeActions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNodeActions",
    ()=>useNodeActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const BIN_PATH = `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin`;
function useNodeActions() {
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.currentPath);
    const folders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.folders);
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.files);
    const selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.selection);
    const multiSelectActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.multiSelectActive);
    const reloadFolderContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.reloadFolderContent);
    const exitMultiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.exitMultiSelect);
    const utils = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].useUtils();
    const trashToBinMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.trashToBin.useMutation();
    // ─── purge (path-based) au lieu de deleteForever (id-based) ──────────
    //
    // `trash.deleteForever` exige des TrashEntry.id et plante si une id
    // n'existe pas en DB. Or l'UI finder n'a accès qu'aux **paths** des
    // nodes (extraire un uuid via regex ne garantit pas qu'il y ait une
    // TrashEntry derrière — cas typique : vestiges Cloudinary post-rollback).
    //
    // `trash.purge` accepte directement des paths et gère les deux cas
    // (TrashEntry existante → flow standard ; vestige → suppression physique).
    // Cf. purge.service.ts pour le détail des garde-fous.
    const purgeMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.purge.useMutation();
    // Détection du contexte global : on est "dans le bin" si le path courant
    // est exactement la racine du bin OU un descendant (drilldown). Utilisé
    // pour les composants de **toolbar** (MultiSelectToolbar, etc.) qui n'ont
    // pas de node de référence et qui veulent décorer leur bouton selon le
    // contexte global de la GridView.
    //
    // ⚠️ Pour les composants qui ont un node sous la main (ContextMenu sur un
    // GridItem ou un node TreeView), préférer passer les nodes à `deleteLabel`
    // pour avoir la cohérence label ↔ action — `deleteNodes` détecte aussi
    // par node.path, pas par currentPath.
    const inBin = currentPath === BIN_PATH || currentPath.startsWith(`${BIN_PATH}/`);
    const deleteLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((count, nodes)=>{
        // Si on a des nodes en référence, on détecte par leur path (cohérent
        // avec ce que deleteNodes fait). Sinon on retombe sur inBin global.
        const targetInBin = nodes && nodes.length > 0 ? nodes[0].path === BIN_PATH || nodes[0].path.startsWith(`${BIN_PATH}/`) : inBin;
        if (targetInBin) {
            if (count <= 1) return 'Supprimer définitivement';
            return `Supprimer la sélection (${count})`;
        }
        // Hors bin : on "supprime" en mettant à la corbeille
        if (count <= 1) return 'Mettre à la corbeille';
        return `Mettre la sélection à la corbeille (${count})`;
    }, [
        inBin
    ]);
    const deleteNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (nodes)=>{
        if (nodes.length === 0) return;
        // ─── Détection contextuelle par les paths des nodes ───────────────
        //
        // ⚠️ NE PAS utiliser `inBin` ici (qui est calculé sur `currentPath`,
        // c-à-d où se trouve la GridView principale). Un right-click sur un
        // node TreeView du bin alors que la GridView est sur `pending/` doit
        // dispatcher vers `purge`, pas vers `trashToBin`.
        //
        // Convention : on détecte par le **premier node** de la sélection.
        // En pratique, une sélection est toujours homogène (tous dans le bin
        // ou tous hors bin) parce qu'on sélectionne dans une même vue. Le cas
        // mixed est une sélection cross-context construite manuellement, rare
        // et probablement déjà brisée par d'autres invariants UI.
        const firstNodeInBin = nodes[0].path === BIN_PATH || nodes[0].path.startsWith(`${BIN_PATH}/`);
        if (firstNodeInBin) {
            // ─── Bin → trash.purge (path-based, tolérant) ────────────────
            //
            // On envoie les **paths complets** des nodes (pas d'extraction
            // d'uuid). Le backend dérive lui-même les wrapper paths et
            // dédoublonne. Couvre :
            //   - Les TrashEntry connues (flow standard, deleteForever logic)
            //   - Les vestiges Cloudinary sans TrashEntry (suppression physique)
            //
            // Plus aucune erreur "missing TrashEntry ids" même avec un mix de
            // TrashEntry valides et de vestiges dans la sélection.
            const paths = nodes.map((n)=>n.path);
            await purgeMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                paths
            });
            // Invalidation supplémentaire pour la vue plate du bin (qui utilise
            // une React Query séparée du contentCache du finder).
            utils.trash.listBin.invalidate();
        } else {
            // ─── Hors bin → trashToBin ──────────────────────────────────────
            const sources = nodes.map((n)=>({
                    kind: n.type === 'folder' ? 'folder' : 'file',
                    fullPath: n.path
                }));
            await trashToBinMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                sources
            });
        }
        reloadFolderContent();
        exitMultiSelect();
    }, [
        // `inBin` n'est plus listé : on lit `nodes[0].path` qui n'est pas
        // une dépendance React (vient de l'argument runtime).
        trashToBinMutation,
        purgeMutation,
        utils.trash.listBin,
        reloadFolderContent,
        exitMultiSelect
    ]);
    const effectiveNodesFor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((focusedNode)=>{
        if (multiSelectActive && selection.roots.has(focusedNode.id)) {
            // Multi-select avec focusedNode dedans → toute la sélection.
            // On reconstitue les nodes depuis les collections du path courant.
            const all = [
                ...folders,
                ...files
            ];
            return all.filter((n)=>selection.roots.has(n.id));
        }
        return [
            focusedNode
        ];
    }, [
        multiSelectActive,
        selection.roots,
        folders,
        files
    ]);
    return {
        deleteNodes,
        effectiveNodesFor,
        deleteLabel,
        inBin,
        isPending: trashToBinMutation.isPending || purgeMutation.isPending
    };
}
}),
"[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrashMapProvider",
    ()=>TrashMapProvider,
    "useTrashMap",
    ()=>useTrashMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
const TrashMapContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(new Map());
const TrashMapProvider = TrashMapContext.Provider;
function useTrashMap() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(TrashMapContext);
}
}),
"[project]/apps/web/src/features/finder-core/utils/statusFolders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STATUS_FOLDER_PATHS",
    ()=>STATUS_FOLDER_PATHS,
    "isStatusFolder",
    ()=>isStatusFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
;
/**
 * 🛡️ Status folders : les 3 dossiers racines intouchables.
 *
 * Ce sont les dossiers qui structurent l'app au niveau du workflow :
 *   - `${APP_ROOT}/pending`    — contenu en attente de publication
 *   - `${APP_ROOT}/published`  — contenu publié, visible côté front public
 *   - `${APP_ROOT}/bin`        — corbeille (poubelle des items trashed)
 *
 * Règles métier portées par cette détection (et appliquées dans tous les
 * composants UI qui s'en servent) :
 *
 *   1. **Pas drag-source** : on ne peut pas déplacer un status folder
 *      ailleurs (sinon on casse l'invariant de structure).
 *   2. **Pas supprimables** : ni via la corbeille (trashToBin), ni via
 *      delete forever — ce sont des points d'ancrage permanents.
 *   3. **Pas renommables** : leur nom est sémantique côté code (path
 *      hard-codé pour le router, les services, etc.).
 *   4. **Pas sélectionnables** : pas de checkbox au niveau du status
 *      folder lui-même ; seuls leurs **descendants** peuvent être
 *      sélectionnés (cohérent avec la sémantique "on agit SUR le
 *      contenu, pas SUR la classification").
 *
 * Les guards backend existent déjà (les services trashToBin/restore/delete
 * refusent ces paths). Ce helper sert à anticiper côté UI pour ne pas
 * proposer d'actions qui échoueront — meilleur UX et moins de bruit
 * dans les logs serveur.
 */ const STATUS_FOLDER_NAMES = [
    'pending',
    'published',
    'bin'
];
const STATUS_FOLDER_PATHS = STATUS_FOLDER_NAMES.map((name)=>`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/${name}`);
function isStatusFolder(path) {
    return STATUS_FOLDER_PATHS.includes(path);
}
}),
"[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ContextMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function ContextMenu({ x, y, items, onClose }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [adjustedPos, setAdjustedPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x,
        y
    });
    // ─── Ajustement de la position pour ne pas déborder du viewport ─────────
    //
    // useLayoutEffect plutôt que useEffect pour que l'ajustement se fasse
    // AVANT que le navigateur peigne le premier rendu — évite le flash.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const padding = 8;
        let newX = x;
        let newY = y;
        // Déborde à droite ? On colle à droite moins la largeur.
        if (rect.right > window.innerWidth - padding) {
            newX = Math.max(padding, window.innerWidth - rect.width - padding);
        }
        // Déborde en bas ? On colle en bas moins la hauteur.
        if (rect.bottom > window.innerHeight - padding) {
            newY = Math.max(padding, window.innerHeight - rect.height - padding);
        }
        if (newX !== x || newY !== y) {
            setAdjustedPos({
                x: newX,
                y: newY
            });
        }
    }, [
        x,
        y
    ]);
    // ─── Click outside + Escape ──────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        }
        function handleEscape(e) {
            if (e.key === 'Escape') onClose();
        }
        // mousedown plutôt que click pour fermer le menu AVANT que le click
        // ne déclenche d'autres handlers (sélection, ouverture, etc.).
        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEscape);
        return ()=>{
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        role: "menu",
        style: {
            position: 'fixed',
            top: adjustedPos.y,
            left: adjustedPos.x,
            zIndex: 1000
        },
        className: "bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[200px]",
        // Empêche le mousedown DANS le menu de remonter à l'écouteur global
        // qui fermerait le menu avant que le onClick de l'item ne soit lu.
        onMouseDown: (e)=>e.stopPropagation(),
        children: items.map((item, idx)=>{
            if (item.type === 'separator') {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "my-1 border-t border-gray-200",
                    role: "separator"
                }, idx, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
                    lineNumber: 143,
                    columnNumber: 13
                }, this);
            }
            if (item.type === 'header') {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider",
                    children: item.label
                }, idx, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
                    lineNumber: 153,
                    columnNumber: 13
                }, this);
            }
            // item normal (type undefined ou 'item')
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                role: "menuitem",
                disabled: item.disabled,
                onClick: ()=>{
                    if (item.disabled) return;
                    item.onClick();
                    onClose();
                },
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('w-full text-left px-3 py-1.5 text-sm transition-colors', 'flex items-center gap-2', item.disabled && 'text-gray-400 cursor-not-allowed', !item.disabled && !item.destructive && 'text-gray-700 hover:bg-gray-100', !item.disabled && item.destructive && 'text-red-600 hover:bg-red-50'),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-block w-3 shrink-0 text-blue-600",
                        children: item.checked ? '✓' : ''
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
                        lineNumber: 184,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex-1 truncate",
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
                        lineNumber: 187,
                        columnNumber: 13
                    }, this)
                ]
            }, idx, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
                lineNumber: 164,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTreeFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file.js [app-ssr] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeActions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/path.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx [app-ssr] (ecmascript)");
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
function FinderTreeFile({ node, onDragStart, onLongPress }) {
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setPath);
    const selectOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.selectOnly);
    const toggleSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.toggleSelect);
    const multiSelectActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.multiSelectActive);
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.currentPath);
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.selection.roots);
    // Le hook est instancié inconditionnellement (rules of hooks). Si le
    // parent n'a pas fourni `onLongPress`, on no-op silencieusement.
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLongPress"])(()=>{
        if (onLongPress) onLongPress(node);
    });
    // ─── Context menu (right-click) ─────────────────────────────────────────
    const [menuPos, setMenuPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { effectiveNodesFor, deleteNodes, deleteLabel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeActions"])();
    const isActive = currentPath === (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentPath"])(node.path) && selectedIds.has(node.id);
    const isDraggable = Boolean(onDragStart);
    /**
   * Comportement du clic sur un fichier de la TreeView.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Naviguer dans le dossier parent + sélection unique (cf. la doc en
   * tête de fichier).
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS et on ne reset PAS la sélection — on toggle juste
   * l'appartenance du node à la sélection. Sans ce branchement, le longpress
   * dans la TreeView (qui active multiSelectActive via `onLongPress`) serait
   * immédiatement écrasé par le `mouseup` qui suit : ce dernier déclenche
   * un click → `setPath` → reset multiSelectActive → mode multi sorti
   * instantanément. C'était le bug "longpress sans effet dans la tree view
   * du bin" (et en réalité partout dans la tree view).
   */ function handleClick() {
        // Avalage du click parasite qui suit un longpress (cf. doc dans
        // useLongPress.ts). Sans ce skip, le node qui vient d'être ajouté à
        // la sélection par le longpress serait toggle-off par ce click.
        if (longPress.consumeJustFired()) return;
        if (multiSelectActive) {
            toggleSelect(node.id);
            return;
        }
        setPath((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentPath"])(node.path));
        selectOnly(node.id);
    }
    function buildMenuItems() {
        const targetNodes = effectiveNodesFor(node);
        return [
            {
                label: deleteLabel(targetNodes.length, targetNodes),
                destructive: true,
                onClick: ()=>{
                    void deleteNodes(targetNodes);
                }
            }
        ];
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleClick,
                onContextMenu: (e)=>{
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuPos({
                        x: e.clientX,
                        y: e.clientY
                    });
                },
                onMouseDown: longPress.onMouseDown,
                onMouseUp: longPress.onMouseUp,
                onMouseLeave: longPress.onMouseLeave,
                onTouchStart: longPress.onTouchStart,
                onTouchEnd: longPress.onTouchEnd,
                draggable: isDraggable,
                onDragStart: onDragStart ? (e)=>{
                    longPress.onDragStart();
                    onDragStart(e, node);
                } : undefined,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm', // Indenté de la même quantité que les sous-dossiers — on aligne
                // visuellement folders et files au même niveau hiérarchique.
                // L'absence de chevron est compensée par un padding gauche
                // équivalent à sa largeur quand on n'est PAS en multi-select.
                // En multi-select, l'espace est récupéré par la checkbox.
                !multiSelectActive && 'pl-[1.625rem]', isActive && 'bg-accent text-accent-foreground font-medium', !isActive && 'hover:bg-accent/40'),
                title: node.path,
                children: [
                    multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: selectedIds.has(node.id),
                        readOnly: true,
                        className: "shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                        className: "h-4 w-4 shrink-0 text-gray-400",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate",
                        children: node.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            menuPos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                x: menuPos.x,
                y: menuPos.y,
                items: buildMenuItems(),
                onClose: ()=>setMenuPos(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTreeFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeActions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$statusFolders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/statusFolders.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-ssr] (ecmascript)");
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
;
;
function FinderTreeFolder({ node, adapter, currentPath, onOpen, openPaths, onToggleOpen, onDragStart, onLongPress }) {
    const isOpen = openPaths.has(node.path);
    const isActive = node.path === currentPath;
    // Détection : ce node est-il un dossier de statut (pending/published/bin) ?
    // Si oui, il est exclu des actions destructives ET des actions de sélection
    // (cf. doc dans utils/statusFolders.ts).
    const isStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$statusFolders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isStatusFolder"])(node.path);
    // Hook longpress : instancié inconditionnellement (rules of hooks).
    // Le callback no-op silencieusement si c'est un status folder OU si le
    // parent n'a pas fourni `onLongPress`.
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLongPress"])(()=>{
        if (isStatus) return;
        if (onLongPress) onLongPress(node);
    });
    // Drag-source désactivé sur les status folders (intouchables).
    const isDraggable = Boolean(onDragStart) && !isStatus;
    // ─── Context menu (right-click) ─────────────────────────────────────────
    const [menuPos, setMenuPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { effectiveNodesFor, deleteNodes, deleteLabel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeActions"])();
    function buildMenuItems() {
        const targetNodes = effectiveNodesFor(node);
        return [
            {
                label: deleteLabel(targetNodes.length, targetNodes),
                destructive: true,
                onClick: ()=>{
                    void deleteNodes(targetNodes);
                }
            }
        ];
    }
    // Mutation tRPC pour envoyer du contenu vers la corbeille.
    //
    // ─── Pourquoi cette mutation est définie ici ─────────────────────────
    //
    // Quand l'utilisateur drop un fichier sur le node `bin`, le comportement
    // attendu n'est PAS un move "normal" (qui placerait juste le fichier
    // dans `bin/`), mais le mécanisme **trashToBin** complet :
    //   - Génère un uuid
    //   - Move le fichier vers `bin/.trash/<uuid>/<filename>`
    //   - Crée une `TrashEntry` en DB avec `previousPath`, `displayName`,
    //     `sizeBytes`, `cloudinaryCreatedAt`, etc.
    //
    // Sans cette procédure dédiée, la TrashEntry n'est pas créée → la vue
    // bin (FinderBinRootView) reste vide ou affiche des "dossiers uuids"
    // sans displayName. Et la restauration depuis le bin devient impossible
    // (pas de previousPath stocké).
    //
    // C'est exactement le pattern de la version legacy `cloudinary-finder`,
    // qu'on récupère ici en câblant le UI au router trash.
    const trashToBinMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.trashToBin.useMutation();
    // ─── Trash UI : skip `.trash` + rename uuids ──────────────────────────────
    //
    // Le storage Cloudinary réel a la structure :
    //   AKFC/bin/.trash/<uuid>/<contenu_original>
    //
    // L'arbre retourné par le backend EXPOSE cette structure telle quelle.
    // Le frontend masque le segment `.trash` et substitue chaque uuid par
    // son `displayName` pour donner à l'utilisateur l'impression d'une
    // hiérarchie naturelle :
    //   bin > "Mon dossier supprimé" > <contenu>
    //
    // Référence : le legacy Cloudinary-specific (depuis supprimé) faisait
    // exactement la même chose. On reproduit ici en profitant du Context
    // `TrashMapContext` provisionné par `FinderTree`.
    //
    // Détection :
    //   - inTrashStorage : le path du node passe par `bin/.trash/`
    //   - isTrashRootSkipNode : le name du node est `.trash` — détection
    //     volontairement SIMPLE pour éviter tout glitch lié à des variations
    //     de format du path (trailing slash, normalisation, etc.). En pratique
    //     un seul `.trash` existe par projet (sous `bin`), donc pas de risque
    //     de faux positif.
    //   - trashEntryForName : si le name est connu dans trashMap, on a une
    //     trashEntry → on substitue le label
    const trashMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTrashMap"])();
    const inTrashStorage = node.path.includes('/.trash/') || node.path.endsWith('/.trash');
    const isTrashRootSkipNode = node.name === '.trash';
    // ─── 🪟 Wrapper de TrashEntry : à skip aussi visuellement ────────────────
    //
    // Le storage Cloudinary structure la corbeille en `bin/.trash/<uuid>/...`.
    // Le segment `<uuid>` est un **wrapper technique** : il existe seulement
    // pour gérer les collisions de noms (2× `photo.jpg` trashés à des
    // moments différents peuvent coexister sous deux uuids distincts).
    //
    // Côté UX, ce wrapper n'a aucune valeur : pour l'utilisateur, "un fichier
    // est un fichier, un dossier est un dossier". Voir un dossier intermédiaire
    // "Mon-fichier.jpg/" qui contient juste "Mon-fichier.jpg" est aberrant.
    //
    // La règle : tout node directement sous `.trash/` est un wrapper et doit
    // être skip — on rend directement son contenu au niveau parent (= bin
    // dans la TreeView, après skip du `.trash` lui-même).
    //
    // Détection : le path matche `<...>/bin/.trash/<uuid>` (rien après le uuid).
    // Cette regex existe déjà ligne ~473 pour le fallback displayName, on la
    // promote au niveau de la décision de skip.
    const isTrashWrapperNode = Boolean(node.path.match(/\/bin\/\.trash\/[^/]+$/));
    const trashEntryForName = trashMap.get(node.name);
    /**
   * Enfants chargés à la demande lors de la première expansion.
   * - `null` : pas encore chargé
   * - tableau (même vide) : chargement terminé
   *
   * Cet état n'est utilisé QUE quand `node.children === undefined`
   * (frontière de depth de l'appel initial). Si `node.children` est
   * déjà rempli au montage, on l'utilise tel quel.
   */ const [loadedChildren, setLoadedChildren] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ─── Auto-load des enfants des nodes skippés ─────────────────────────────
   *
   * Le node `.trash` ET les wrappers uuid sont rendus invisibles (skip pur),
   * donc l'utilisateur ne peut pas cliquer dessus pour déclencher l'expansion.
   * Or au chargement initial avec `getTree({ depth: 2 })`, on a uniquement
   * `bin > .trash` (et avec un coup de chance les uuids juste en dessous),
   * mais pas le contenu des wrappers (depth 4+).
   *
   * Sans cet auto-load, les enfants du wrapper (le vrai fichier qu'on a
   * mis à la corbeille) ne sont jamais chargés tant que personne ne clique
   * sur le wrapper — sauf qu'on ne le rend même pas comme cible cliquable.
   * Le bin apparaîtrait visuellement vide alors qu'il contient des items.
   *
   * Solution : dès qu'on monte un node skip (`.trash` OU wrapper uuid),
   * on déclenche automatiquement le chargement de ses enfants via
   * `adapter.getTree`. L'utilisateur ne voit pas de spinner (puisque le
   * node skip lui-même n'est pas rendu), seulement le résultat final :
   * le contenu du bin apparaît directement sous `bin/`.
   *
   * Guard `triggeredRef` pour éviter le re-trigger en boucle au cas où le
   * `node` change de référence (mais pas son path) après un re-render.
   */ /* ─── Invalidation TreeView au reloadKey ──────────────────────────────────
   *
   * Le store `useFinderStore` expose un `reloadKey` qui est incrémenté à
   * chaque mutation (move, trashToBin, restore…) via `reloadFolderContent()`.
   *
   * Sans observation explicite, la TreeView garde son `loadedChildren`
   * local et n'affiche pas les changements (un fichier déplacé reste
   * visible à son ancien emplacement jusqu'au reload manuel de la page).
   *
   * Cet effet vide `loadedChildren` + reset le flag d'auto-load chaque
   * fois que `reloadKey` change. Le useEffect d'auto-load (plus haut) se
   * redéclenche alors si on est sur un node skip (`.trash` ou wrapper),
   * et pour les autres folders ouverts, leur prochain rendu provoque
   * un re-fetch via `loadChildrenLazy` au prochain toggle/expand.
   *
   * Note : on skip volontairement le PREMIER run du useEffect (au mount),
   * pour ne pas casser le chargement initial. Le premier `reloadKey` n'est
   * pas un signal d'invalidation, c'est juste la valeur de départ.
   */ const reloadKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.reloadKey);
    const isFirstReloadKeyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const autoLoadTriggeredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isFirstReloadKeyRef.current) {
            isFirstReloadKeyRef.current = false;
            return;
        }
        setLoadedChildren(null);
        autoLoadTriggeredRef.current = false;
    }, [
        reloadKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isTrashRootSkipNode && !isTrashWrapperNode) return;
        if (autoLoadTriggeredRef.current) return;
        if (node.children && node.children.length > 0) return; // déjà chargé
        if (loadedChildren !== null) return; // déjà chargé/en cours
        if (!adapter.getTree) return;
        // Check le cache partagé : peut-être que la GridView l'a déjà chargé
        const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(node.path);
        if (cached) {
            autoLoadTriggeredRef.current = true;
            setLoadedChildren([
                ...cached.folders,
                ...cached.files
            ]);
            return;
        }
        autoLoadTriggeredRef.current = true;
        setIsLoading(true);
        adapter.getTree({
            path: node.path,
            depth: 1
        }).then(({ root })=>{
            const children = root.children ?? [];
            setLoadedChildren(children);
            // Partage avec la GridView
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt(node.path, children);
        }).catch((err)=>{
            console.error('[FinderTreeFolder] auto-load skip-node failed', err);
            setLoadError('Erreur chargement contenu corbeille');
        }).finally(()=>{
            setIsLoading(false);
        });
    }, [
        isTrashRootSkipNode,
        isTrashWrapperNode,
        node.path,
        node.children,
        loadedChildren,
        adapter
    ]);
    /**
   * Surbrillance "drop target hover".
   *
   * Le DnD natif HTML5 émet `dragenter`/`dragleave` sur chaque enfant
   * traversé : on évite le clignotement avec une vérification
   * `currentTarget.contains(relatedTarget)` dans `onDragLeave`.
   */ const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Pour rafraîchir la grille principale après un drop réussi.
    const reloadFolderContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.reloadFolderContent);
    // Pour clear la sélection après un drop : les items déplacés ne sont
    // plus dans le dossier courant, garder leurs ids dans roots est incohérent
    // (et fausserait le compteur de la MultiSelectToolbar).
    const exitMultiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.exitMultiSelect);
    // Sélecteurs pour le comportement multi-select au click (cf. handleRowClick) :
    // sans `multiSelectActive` qui branche sur `toggleSelect` plutôt que sur
    // `onOpen`, le longpress dans la tree view serait écrasé instantanément
    // par le click qui suit le mouseup (setPath → reset multiSelectActive).
    const toggleSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.toggleSelect);
    const multiSelectActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.multiSelectActive);
    // Pour afficher la checkbox en feedback visuel quand multiSelectActive.
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.selection.roots);
    /**
   * Source effective des enfants à afficher : priorité aux enfants
   * pré-chargés par l'appel initial, puis au lazy chargé localement.
   */ const effectiveChildren = node.children !== undefined ? node.children : loadedChildren ?? undefined;
    const hasChildren = node.hasChildren ?? (effectiveChildren?.length ?? 0) > 0;
    async function ensureChildrenLoaded() {
        // Déjà chargés (par l'appel initial ou par un lazy précédent) : rien à faire.
        if (effectiveChildren !== undefined) return;
        // ─── Check du cache partagé store ────────────────────────────────────
        //
        // Si la GridView (`useFinderData`) a déjà chargé le contenu de ce path,
        // on le réutilise plutôt que de relancer une requête réseau. Inversement,
        // une fois qu'on aura chargé via getTree, on populera le cache pour que
        // la GridView puisse l'utiliser quand on navigue vers ce path.
        //
        // C'est ce qui réunit les deux vues : un seul fetch fait gagne pour
        // les deux côtés.
        const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(node.path);
        if (cached) {
            setLoadedChildren([
                ...cached.folders,
                ...cached.files
            ]);
            return;
        }
        if (!adapter.getTree) {
            setLoadError('Adapter sans getTree — impossible de déplier');
            return;
        }
        setIsLoading(true);
        setLoadError(null);
        try {
            const { root } = await adapter.getTree({
                path: node.path,
                depth: 1
            });
            const children = root.children ?? [];
            setLoadedChildren(children);
            // Partage avec la GridView : si l'utilisateur clique ensuite sur ce
            // path pour naviguer dedans, useFinderData verra le cache et skip le fetch.
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt(node.path, children);
        } catch (err) {
            console.error('[FinderTreeFolder] getTree failed', err);
            setLoadError('Erreur de chargement');
        } finally{
            setIsLoading(false);
        }
    }
    async function handleToggleOpen(e) {
        e.stopPropagation();
        // Si on s'apprête à ouvrir et que les enfants ne sont pas chargés,
        // on lance le fetch AVANT d'enregistrer l'état "ouvert" — comme ça,
        // le rendu "ouvert mais en chargement" est cohérent.
        if (!isOpen) {
            await ensureChildrenLoaded();
        }
        onToggleOpen(node.path);
    }
    /**
   * Clic sur le LIBELLÉ du dossier — comportement dépendant du mode.
   *
   * ─── Avalage du click parasite post-longpress ────────────────────────
   * `longPress.consumeJustFired()` retourne true UNE FOIS si le callback
   * longpress vient juste de tirer. Dans ce cas on return immédiatement
   * pour ne pas que ce click "fantôme" désélectionne le node qui vient
   * tout juste d'être ajouté à la sélection par le longpress.
   *
   * ─── Mode normal ─────────────────────────────────────────────────────
   * Navigation : on demande au parent d'ouvrir ce dossier dans la grille
   * principale (`onOpen` = `setPath` du store).
   *
   * ─── Mode multi-select ───────────────────────────────────────────────
   * On NE NAVIGUE PAS, on toggle juste l'appartenance du dossier à la
   * sélection. **Sauf** pour les status folders (pending/published/bin)
   * qui sont définitivement non-sélectionnables — on garde le click
   * "no-op" plutôt que de naviguer pour rester cohérent avec le fait
   * que les status folders n'ont pas de checkbox affichée.
   */ function handleRowClick() {
        if (longPress.consumeJustFired()) return;
        if (multiSelectActive) {
            if (isStatus) return; // status folders non-sélectionnables
            toggleSelect(node.id);
            return;
        }
        onOpen(node.path);
    }
    /* -------------------------------------------------------------------------- */ /*                                  DnD TARGET                                */ /* -------------------------------------------------------------------------- */ /**
   * Filtre : seuls les drags qui portent notre MIME sont acceptés.
   * Pendant `dragover`, `dataTransfer.getData()` retourne `""` pour des
   * raisons de sécurité — on ne peut tester que la présence du MIME via
   * `dataTransfer.types`. C'est suffisant pour décider d'activer ou non
   * le visuel et de `preventDefault` (nécessaire pour autoriser le drop).
   */ function isFinderDrag(e) {
        return e.dataTransfer.types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
    }
    function handleDragEnter(e) {
        if (!isFinderDrag(e)) return;
        e.preventDefault();
        // stopPropagation pour éviter que l'event bubble vers un FinderTreeFolder
        // parent (qui aurait alors aussi marqué `isDragOver=true` à tort).
        // Indispensable depuis l'extension de la drop zone au wrapper englobant.
        e.stopPropagation();
        setIsDragOver(true);
    }
    function handleDragOver(e) {
        if (!isFinderDrag(e)) return;
        // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
        // Sans cet appel, onDrop ne se déclenchera jamais.
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
    }
    function handleDragLeave(e) {
        // Le DOM émet dragleave à chaque traversée d'un enfant : on l'ignore
        // tant qu'on est encore dans le sous-arbre de currentTarget.
        const related = e.relatedTarget;
        if (related && e.currentTarget.contains(related)) return;
        setIsDragOver(false);
    }
    async function handleDrop(e) {
        e.preventDefault();
        // stopPropagation : indispensable depuis l'extension de la drop zone
        // au wrapper englobant. Sans cela, un drop sur un sous-folder serait
        // catché par le sous-folder ET par son parent → double mutation.
        e.stopPropagation();
        setIsDragOver(false);
        const raw = e.dataTransfer.getData(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tryParsePayload"])(raw);
        if (!payload) return;
        const items = payload.items;
        const targetPath = node.path;
        // Garde-fous (cf. payload.ts pour les règles précises) :
        //   - pas de drop sur soi-même ou dans un descendant → drop invalide
        //   - drop dans le parent direct → no-op silencieux, on évite le réseau
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDropAllowed"])(targetPath, items)) return;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDropEffective"])(targetPath, items)) return;
        // ─── Cas spécial : drop sur la racine du bin ─────────────────────────
        //
        // Quand l'utilisateur drop des items sur le node `bin` (la racine de
        // la corbeille), on ne fait PAS un move normal — on appelle la
        // procédure dédiée `trash.trashToBin` qui :
        //   1. Génère un uuid par item
        //   2. Move chaque item vers `bin/.trash/<uuid>/...` côté Cloudinary
        //   3. Crée une TrashEntry en DB avec previousPath + displayName,
        //      indispensable pour la vue corbeille (FinderBinRootView) ET
        //      pour la restauration ultérieure.
        //
        // Note : seul le path EXACT `${APP_ROOT}/bin` déclenche ce mode.
        // Si l'utilisateur drop dans un sous-dossier de la corbeille (un
        // `.trash/<uuid>/`), on tombe sur le `moveItems` standard — c'est
        // un cas edge qu'on traite comme un move ordinaire, faute de
        // sémantique métier claire pour "déplacer dans une entry existante".
        const BIN_ROOT_PATH = `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin`;
        if (targetPath === BIN_ROOT_PATH) {
            try {
                await trashToBinMutation.mutateAsync({
                    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                    // Mapping DragItem → source attendu par trashToBinInputSchema.
                    // On utilise toujours kind 'folder' ou 'file' selon le type du
                    // DragItem ; pas de mode 'selection' ici puisque le payload du
                    // drag transporte déjà la liste explicite des items.
                    sources: items.map((it)=>({
                            kind: it.type === 'folder' ? 'folder' : 'file',
                            fullPath: it.path
                        }))
                });
                reloadFolderContent();
                exitMultiSelect();
            } catch (err) {
                console.error('[FinderTreeFolder] trashToBin failed', err);
            }
            return;
        }
        // ─── Cas normal : move agnostique via l'adapter ──────────────────────
        if (!adapter.moveItems) {
            console.warn('[FinderTreeFolder] adapter.moveItems unavailable, drop ignoré');
            return;
        }
        try {
            await adapter.moveItems({
                items,
                target: {
                    type: 'folder',
                    path: targetPath
                }
            });
            // Refresh de la grille principale : les items déplacés ne sont plus
            // dans le dossier courant. La TreeView, elle, ne se recharge pas
            // automatiquement (sera revu en 4.5 si besoin).
            reloadFolderContent();
            // Sort du mode multi-select et vide la sélection. Idempotent en mode
            // normal (set false → false). Évite des ids orphelins dans roots.
            exitMultiSelect();
        } catch (err) {
            console.error('[FinderTreeFolder] drop failed', err);
        }
    }
    // Chevron : caché si le dossier n'a aucun enfant (cas hasChildren explicite à false)
    // ou si on a chargé et trouvé un tableau vide.
    const showChevron = hasChildren && (effectiveChildren?.length ?? 1) > 0;
    // ─── Skip visuel du node `.trash` ─────────────────────────────────────────
    //
    // Le node `.trash` lui-même n'est PAS rendu (ni sa ligne ni son container
    // indenté). À la place, on rend uniquement ses enfants au niveau du parent
    // — comme si `.trash` n'existait pas dans la hiérarchie côté UI.
    //
    // Note technique : les enfants de `.trash` (les uuids) ont déjà été
    // chargés par le `getTree({ depth: 2 })` initial puisqu'ils sont à 2
    // niveaux sous le rootPath (`AKFC > bin > .trash > <uuid>`). Donc
    // `effectiveChildren` est généralement disponible sans lazy load.
    //
    // L'indentation visuelle est PRÉSERVÉE : les uuids apparaîtront indentés
    // d'un niveau (celui de `bin`), pas deux. C'est exactement ce qu'on veut.
    // ─── Skip visuel du `.trash` ET des wrappers uuid ────────────────────────
    //
    // Le node `.trash` lui-même est rendu invisible (skip pur) — voir détection
    // `isTrashRootSkipNode`. À la place, on rend ses enfants au niveau parent.
    //
    // ➕ Depuis ce sous-chantier, on skip aussi les **wrappers uuid** (les
    // dossiers techniques `bin/.trash/<uuid>/`). Comme `.trash`, ils sont
    // techniques et sans valeur UX : leur contenu doit apparaître directement
    // au niveau de `bin` dans la TreeView, pour respecter la sémantique
    // "un fichier est un fichier, un dossier est un dossier".
    //
    // Les deux cas ont exactement le même traitement : on rend le contenu
    // (`effectiveChildren`) tel quel, en propageant les handlers DnD/longpress
    // pour qu'ils restent fonctionnels sur les enfants exposés.
    //
    // ⚠️ Côté GridView, le comportement est différent :
    //   - À `${APP_ROOT}/bin` (root du bin), on affiche `FinderBinRootView`
    //     (vue plate des TrashEntry, indépendante de la structure storage).
    //   - À `${APP_ROOT}/bin/.trash/<uuid>` (drilldown), on affiche le
    //     contenu réel du wrapper — utile si l'entry est un dossier avec
    //     plusieurs fichiers (ex: dossier "Photos/" entier mis à la corbeille).
    if (isTrashRootSkipNode || isTrashWrapperNode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: effectiveChildren?.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FinderTreeFolder, {
                    node: child,
                    adapter: adapter,
                    currentPath: currentPath,
                    onOpen: onOpen,
                    openPaths: openPaths,
                    onToggleOpen: onToggleOpen,
                    onDragStart: onDragStart,
                    onLongPress: onLongPress
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 600,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    node: child,
                    onDragStart: onDragStart,
                    onLongPress: onLongPress
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 612,
                    columnNumber: 13
                }, this))
        }, void 0, false);
    }
    // ─── Substitution du label uuid → displayName ─────────────────────────────
    //
    // Si on est dans le storage trash ET que le name du node est connu dans le
    // trashMap, on remplace l'uuid affiché par le `displayName` plus lisible.
    // Sinon (cas hors trash, ou trashId pas encore chargé), on garde le nom
    // brut. La fallback `'Élément supprimé'` apparaît si on est dans `.trash`
    // sans match dans trashMap (cas rare : le listing en cours de chargement,
    // ou un orphelin DB).
    let displayLabel = node.name;
    if (inTrashStorage && trashEntryForName) {
        displayLabel = trashEntryForName.displayName;
    } else if (inTrashStorage && !trashEntryForName && node.path.match(/\/bin\/\.trash\/[^/]+$/)) {
        // Le node est un dossier-uuid mais pas (encore) dans trashMap.
        // Affichage de secours : `'Élément supprimé'` au lieu de l'uuid technique.
        displayLabel = 'Élément supprimé';
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "select-none",
        // ─── Drop zone étendue ──────────────────────────────────────────────
        //
        // Les handlers sont posés sur ce wrapper englobant — qui couvre à la
        // fois la ligne du folder (chevron + nom) ET le conteneur des enfants
        // (sous-folders et fichiers). Ainsi un drop n'importe où dans ce
        // sous-arbre est interprété comme un drop dans CE folder.
        //
        // Le bubble vers un FinderTreeFolder parent est bloqué via
        // `e.stopPropagation()` dans chaque handler — sinon un drop sur un
        // sous-folder serait catché par le sous-folder ET par son parent.
        //
        // ⚠️ Cette zone ne couvre PAS les fichiers de la GridView centrale
        // (qui ont leurs propres drop zones via `data-finder-drop-path`).
        // Ici on ne parle que de la TreeView.
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleRowClick,
                onContextMenu: isStatus ? undefined : (e)=>{
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuPos({
                        x: e.clientX,
                        y: e.clientY
                    });
                },
                // Drag-source (nouveau) : ce dossier peut être déplacé par DnD.
                // Le folder reste drop-target pour les drops entrants — un même
                // élément peut être à la fois source et cible (HTML5 DnD le permet).
                draggable: isDraggable,
                onDragStart: onDragStart ? (e)=>{
                    longPress.onDragStart();
                    onDragStart(e, node);
                } : undefined,
                // Long-press → multi-select (nouveau, parité avec GridItem)
                onMouseDown: longPress.onMouseDown,
                onMouseUp: longPress.onMouseUp,
                onMouseLeave: longPress.onMouseLeave,
                onTouchStart: longPress.onTouchStart,
                onTouchEnd: longPress.onTouchEnd,
                // Attribut lu par le ghost manager pour calculer le badge allowed/forbidden
                // via document.elementFromPoint pendant le tracking du drag.
                "data-finder-drop-path": node.path,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm', isActive && !isDragOver && 'bg-accent text-accent-foreground font-medium', !isActive && !isDragOver && 'hover:bg-accent/40', // Surbrillance drop-target : prend le pas sur isActive pour bien signaler la cible
                isDragOver && 'bg-blue-100 ring-1 ring-blue-300'),
                title: node.path,
                children: [
                    showChevron ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleToggleOpen,
                        className: "flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground",
                        "aria-label": isOpen ? 'Replier' : 'Déplier',
                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-3.5 w-3.5 animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 714,
                            columnNumber: 15
                        }, this) : isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 716,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 718,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 707,
                        columnNumber: 11
                    }, this) : // Espacement constant pour aligner les noms quand pas de chevron
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-block h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 723,
                        columnNumber: 11
                    }, this),
                    multiSelectActive && !isStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        checked: selectedIds.has(node.id),
                        readOnly: true,
                        className: "shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 741,
                        columnNumber: 11
                    }, this),
                    isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                        className: "h-4 w-4 text-muted-foreground shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 751,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                        className: "h-4 w-4 text-muted-foreground shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 753,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate capitalize",
                        children: displayLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 757,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 664,
                columnNumber: 7
            }, this),
            loadError && isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-3 pl-3 border-l border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-2 py-1 text-xs text-destructive",
                    children: loadError
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 763,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 762,
                columnNumber: 9
            }, this),
            isOpen && effectiveChildren && effectiveChildren.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-3 pl-3 border-l border-border",
                children: effectiveChildren.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FinderTreeFolder, {
                        node: child,
                        adapter: adapter,
                        currentPath: currentPath,
                        onOpen: onOpen,
                        openPaths: openPaths,
                        onToggleOpen: onToggleOpen,
                        onDragStart: onDragStart,
                        onLongPress: onLongPress
                    }, child.path, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 772,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        node: child,
                        onDragStart: onDragStart,
                        onLongPress: onLongPress
                    }, child.path, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 784,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 769,
                columnNumber: 9
            }, this),
            menuPos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                x: menuPos.x,
                y: menuPos.y,
                items: buildMenuItems(),
                onClose: ()=>setMenuPos(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 796,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
        lineNumber: 642,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTree.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFolder$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-ssr] (ecmascript)");
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
function FinderTree({ adapter, rootPath, currentPath, onOpen, onItemDragStart, onItemLongPress }) {
    const [rootNode, setRootNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [openPaths, setOpenPaths] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Set());
    function toggleOpen(path) {
        setOpenPaths((prev)=>{
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }
    // ─── Chargement du trashMap (uuid → displayName) ─────────────────────────
    //
    // On charge `trash.listBin` côté front pour pouvoir, dans la TreeView,
    // substituer les noms d'uuid par leur `displayName`. Cette query est
    // toujours active (pas d'enabled conditionnel) parce que :
    //   - elle est légère (juste la liste plate, pas le contenu de chaque entry)
    //   - on ne sait pas a priori dans quelle branche l'utilisateur va naviguer
    //   - le cache React Query évite les re-fetch
    //
    // Si la query échoue (admin manquant, network), on tombe sur une Map vide :
    // le rendu reste cohérent (les uuids apparaîtront tels quels), sans crasher.
    const { data: trashListData } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].trash.listBin.useQuery({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
        limit: 100
    }, {
        refetchOnWindowFocus: false,
        staleTime: 10_000
    });
    const trashMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        const items = trashListData?.items ?? [];
        for (const entry of items){
            map.set(entry.id, {
                displayName: entry.displayName,
                kind: entry.kind
            });
        }
        return map;
    }, [
        trashListData
    ]);
    // Détection du changement de deps fetch — on reset le state SYNCHRONIQUEMENT
    // dans le render path (pas dans le useEffect), ce qui évite le warning
    // React 19 "react-hooks/set-state-in-effect" et donne un comportement plus
    // prévisible : le reset du loading est visible au MÊME render que le
    // déclenchement du nouveau fetch.
    //
    // Pattern officiellement documenté par React :
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    const prevRootPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(rootPath);
    const prevAdapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(adapter);
    if (prevRootPath.current !== rootPath || prevAdapter.current !== adapter) {
        prevRootPath.current = rootPath;
        prevAdapter.current = adapter;
        setIsLoading(true);
        setLoadError(null);
    }
    // Chargement initial : 2 niveaux d'avance.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        if (!adapter.getTree) {
            setLoadError('Adapter sans getTree — la TreeView ne peut pas s\'afficher');
            setIsLoading(false);
            return;
        }
        adapter.getTree({
            path: rootPath,
            depth: 2
        }).then(({ root })=>{
            if (cancelled) return;
            setRootNode(root);
            // ─── Préchauffage du cache partagé store ─────────────────────────
            //
            // L'arbre initial contient les children de plusieurs niveaux
            // (rootPath, ses enfants, et les petits-enfants pour depth=2).
            // On parcourt récursivement et on cache les children de chaque
            // node folder.
            //
            // Bénéfice : si l'utilisateur clique sur `bin` ou `pending/Cours`
            // dans la TreeView, la GridView a déjà la donnée en cache et
            // affiche le contenu instantanément sans spinner.
            const cacheChildrenAt = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt;
            function walk(node) {
                if (node.type === 'folder' && node.children !== undefined) {
                    cacheChildrenAt(node.path, node.children);
                    for (const child of node.children){
                        walk(child);
                    }
                }
            }
            walk(root);
        }).catch((err)=>{
            console.error('[FinderTree] getTree initial failed', err);
            if (cancelled) return;
            setLoadError('Erreur de chargement de l\'arborescence');
        }).finally(()=>{
            if (cancelled) return;
            setIsLoading(false);
        });
        return ()=>{
            cancelled = true;
        };
    }, [
        adapter,
        rootPath
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-3.5 w-3.5 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Chargement de l'arborescence..."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 194,
            columnNumber: 7
        }, this);
    }
    if (loadError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-2 py-2 text-sm text-destructive",
            role: "alert",
            children: loadError
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 203,
            columnNumber: 7
        }, this);
    }
    if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-2 py-2 text-sm text-muted-foreground italic",
            children: "Aucun élément"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 211,
            columnNumber: 7
        }, this);
    }
    // Choix B2 validé : on affiche les ENFANTS du rootPath directement (et
    // non le rootPath lui-même comme un nœud cliquable). Pour AKFC, ces
    // enfants sont les status-folders pending / published / bin, mais on
    // affiche aussi les éventuels fichiers présents directement à la racine.
    const topLevelChildren = rootNode.children;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TrashMapProvider"], {
        value: trashMap,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-0.5",
            children: topLevelChildren.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFolder$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    node: child,
                    adapter: adapter,
                    currentPath: currentPath,
                    onOpen: onOpen,
                    openPaths: openPaths,
                    onToggleOpen: toggleOpen,
                    onDragStart: onItemDragStart,
                    onLongPress: onItemLongPress
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 228,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    node: child,
                    onDragStart: onItemDragStart,
                    onLongPress: onItemLongPress
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 240,
                    columnNumber: 13
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 225,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
        lineNumber: 224,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/components/GridItem.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GridItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/music.js [app-ssr] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeActions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$statusFolders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/statusFolders.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
/* -------------------------------------------------------------------------- */ /*                              FORMAT HELPERS                                */ /* -------------------------------------------------------------------------- */ /**
 * Extensions reconnues comme "audio" pour affiner l'affichage GridItem.
 *
 * Le contrat `FinderNodeMeta.kind` ne distingue pas audio de document
 * (les deux sont 'document'). Pour afficher une icône note de musique
 * sur les fichiers audio, on fait la détection ici via l'extension du
 * nom de fichier — c'est l'information dont on dispose toujours en UI.
 *
 * Doit rester aligné avec `AUDIO_FORMATS` dans PreviewPanel.tsx et la
 * liste ACCEPTED_MIME_TYPES côté DragNDropForm.
 */ const AUDIO_EXTENSIONS = new Set([
    'mp3',
    'wav',
    'ogg',
    'oga',
    'm4a',
    'opus',
    'flac'
]);
/**
 * Extensions vidéo pour lesquelles on tente de générer une thumbnail
 * Cloudinary. Les autres formats vidéos (rares) fallback sur l'emoji.
 */ const VIDEO_EXTENSIONS_FOR_THUMB = new Set([
    'mp4',
    'webm',
    'mov',
    'avi',
    'mkv',
    'm4v',
    'ogv'
]);
function getFileExtension(name) {
    const idx = name.lastIndexOf('.');
    if (idx === -1 || idx === name.length - 1) return null;
    return name.slice(idx + 1).toLowerCase();
}
function isAudioFile(extension) {
    return extension !== null && AUDIO_EXTENSIONS.has(extension);
}
/**
 * Transforme une URL Cloudinary de vidéo en URL de thumbnail JPG.
 *
 * Pattern Cloudinary :
 *   - URL vidéo :     https://res.cloudinary.com/<cloud>/video/upload/v123/path/foo.mp4
 *   - URL thumbnail : https://res.cloudinary.com/<cloud>/video/upload/so_auto/v123/path/foo.jpg
 *
 * Le transformation `so_auto` (start_offset auto) demande à Cloudinary de
 * sélectionner le frame le plus représentatif de la vidéo (algorithme
 * "auto" qui évite les frames noirs en début/fin). Cloudinary calcule
 * cette thumbnail à la volée et la cache sur son CDN.
 *
 * Retourne `null` si l'URL n'est pas une URL Cloudinary vidéo
 * reconnaissable — dans ce cas, le caller fallback sur l'emoji vidéo.
 */ function getCloudinaryVideoThumbnail(url) {
    if (!url.includes('/video/upload/')) return null;
    // Ne pas double-injecter so_auto si déjà présent (cas du re-render).
    const withSoAuto = url.includes('/upload/so_auto/') ? url : url.replace('/upload/', '/upload/so_auto/');
    // Replace extension par .jpg pour demander le format image à Cloudinary.
    return withSoAuto.replace(/\.(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv)$/i, '.jpg');
}
function GridItem({ node, isSelected, multiSelectActive, triState, onClick, onDoubleClick, onLongPress, onDragStart }) {
    // Détection : ce node est-il un dossier de statut (pending/published/bin) ?
    // Si oui, il est exclu du DnD, du longpress, de la checkbox et du menu
    // contextuel — cf. doc dans utils/statusFolders.ts.
    const isStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$statusFolders$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isStatusFolder"])(node.path);
    // Wrapper du callback longpress pour no-op silencieusement sur les
    // status folders. Le hook est instancié inconditionnellement (rules of hooks).
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLongPress"])(()=>{
        if (isStatus) return;
        onLongPress();
    });
    // État local pour détecter si la vignette image/thumbnail a échoué.
    // Fallback sur l'icône typée plutôt que le placeholder broken-image natif.
    const [imgFailed, setImgFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // État de hover pour activer le preview vidéo au survol.
    // Le <video> n'est monté qu'au hover pour économiser bande passante :
    // chaque <video> mounté télécharge ses premiers KB pour préparer la
    // lecture. À 50 items dans la grille, ça représenterait plusieurs MB
    // de transfert inutile au mount.
    const [isHovering, setIsHovering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ─── Context menu (right-click) ─────────────────────────────────────────
    //
    // Position du menu en coords viewport, ou null si menu fermé. La
    // sémantique de l'action varie selon le contexte :
    //   - Hors bin : "Mettre à la corbeille" (trashToBin)
    //   - Dans bin : "Supprimer définitivement" (deleteForever)
    //   - Si multi-select actif et le node est sélectionné : action sur
    //     TOUTE la sélection (cohérent avec le DnD multi)
    const [menuPos, setMenuPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { effectiveNodesFor, deleteNodes, deleteLabel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeActions"])();
    const isFolder = node.type === 'folder';
    const kind = node.meta?.kind;
    const url = node.meta?.url;
    // L'extension affichée comme badge et utilisée pour les heuristiques
    // (détection audio…) peut venir de deux endroits :
    //   - `node.meta.format` : présent quand le backend a stocké le format
    //     séparément (cas Cloudinary, qui n'inclut pas l'extension dans le
    //     publicId/name).
    //   - L'extension du `node.name` : présent pour R2 où le nom contient
    //     le fichier complet (ex: "foo.md", "bar.mp3").
    //
    // Ordre de préférence : `format` d'abord (plus fiable), `name` ensuite.
    // Sans cela, les fichiers Cloudinary récents (sans ext dans name)
    // n'auraient ni badge ni détection audio.
    const extension = !isFolder ? node.meta?.format?.toLowerCase() ?? getFileExtension(node.name) : null;
    const isAudio = isAudioFile(extension);
    // Vignette image : kind explicite + url + pas d'erreur de chargement
    const hasImageThumb = !isFolder && kind === 'image' && url && !imgFailed;
    // Vignette vidéo : kind explicite + url Cloudinary transformable
    const videoThumbnailUrl = !isFolder && kind === 'video' && url ? getCloudinaryVideoThumbnail(url) : null;
    const hasVideoThumb = Boolean(videoThumbnailUrl) && !imgFailed;
    // "Visual thumb" générique pour ajuster le style du nom et du badge.
    const hasVisualThumb = hasImageThumb || hasVideoThumb;
    // Construit les items du menu contextuel pour ce node.
    // L'action `Supprimer` agit soit sur le node seul, soit sur toute la
    // sélection si on est en multi-select avec ce node dedans.
    function buildMenuItems() {
        const targetNodes = effectiveNodesFor(node);
        return [
            {
                label: deleteLabel(targetNodes.length, targetNodes),
                destructive: true,
                onClick: ()=>{
                    void deleteNodes(targetNodes);
                }
            }
        ];
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                draggable: !isStatus,
                onClick: (e)=>{
                    // Avale le click parasite qui suit immédiatement un longpress
                    // (cf. doc dans useLongPress.ts). Sans ce skip, le toggle dans
                    // le handler `onClick` du parent défait la sélection que le
                    // longpress vient juste d'ajouter.
                    if (longPress.consumeJustFired()) return;
                    e.stopPropagation();
                    onClick(e);
                },
                onDoubleClick: onDoubleClick,
                onContextMenu: isStatus ? undefined : (e)=>{
                    // Bloque le menu contextuel natif ; affiche le nôtre.
                    // Désactivé pour les status folders (pending/published/bin) :
                    // ils n'ont pas d'action "Supprimer" / "Mettre à la corbeille"
                    // donc le menu serait vide.
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuPos({
                        x: e.clientX,
                        y: e.clientY
                    });
                },
                onMouseDown: longPress.onMouseDown,
                onMouseUp: longPress.onMouseUp,
                onMouseEnter: ()=>setIsHovering(true),
                onMouseLeave: ()=>{
                    setIsHovering(false);
                    longPress.onMouseLeave();
                },
                onTouchStart: longPress.onTouchStart,
                onTouchEnd: longPress.onTouchEnd,
                onDragStart: (e)=>{
                    longPress.onDragStart();
                    onDragStart(e);
                },
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('relative aspect-square rounded-lg border bg-white overflow-hidden cursor-pointer select-none', 'transition-shadow hover:shadow-md', isSelected ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200'),
                title: node.name,
                children: [
                    hasImageThumb ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: url,
                        alt: node.name,
                        className: "w-full h-full object-cover",
                        onError: ()=>setImgFailed(true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                        lineNumber: 268,
                        columnNumber: 9
                    }, this) : hasVideoThumb ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: videoThumbnailUrl ?? undefined,
                                alt: node.name,
                                className: "w-full h-full object-cover",
                                onError: ()=>setImgFailed(true)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                                lineNumber: 278,
                                columnNumber: 11
                            }, this),
                            isHovering && url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                src: url,
                                autoPlay: true,
                                muted: true,
                                loop: true,
                                playsInline: true,
                                className: "absolute inset-0 w-full h-full object-cover",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                                lineNumber: 290,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CardIcon, {
                        node: node,
                        isAudio: isAudio
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                        lineNumber: 302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('absolute bottom-0 left-0 right-0 px-2 py-1.5 text-xs truncate', hasVisualThumb ? 'bg-gradient-to-t from-black/70 to-black/0 text-white' : 'bg-white border-t border-gray-100 text-gray-700'),
                        children: node.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                        lineNumber: 308,
                        columnNumber: 7
                    }, this),
                    !isFolder && extension && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wide', hasVisualThumb ? 'bg-white/85 backdrop-blur-sm text-gray-700 shadow-sm' : 'bg-gray-100 text-gray-600 border border-gray-200'),
                        children: extension
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                        lineNumber: 328,
                        columnNumber: 9
                    }, this),
                    multiSelectActive && !isStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1.5 left-1.5 bg-white/80 backdrop-blur-sm rounded p-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "checkbox",
                            checked: triState === 'checked',
                            ref: (el)=>{
                                if (el) el.indeterminate = triState === 'indeterminate';
                            },
                            readOnly: true,
                            className: "block"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                            lineNumber: 346,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                        lineNumber: 345,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this),
            menuPos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                x: menuPos.x,
                y: menuPos.y,
                items: buildMenuItems(),
                onClose: ()=>setMenuPos(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 363,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
/* -------------------------------------------------------------------------- */ /*                                CARD ICON                                   */ /* -------------------------------------------------------------------------- */ /**
 * Affiche l'icône centrale d'une card sans vignette image/vidéo.
 *
 * - **Dossier** : icône Lucide `Folder`.
 * - **Audio** : icône Lucide `Music` (détectée par extension côté caller).
 * - **Vidéo non-Cloudinary** (sans thumbnail générable) : emoji 🎬
 * - **Autres** : emoji 📄
 *
 * Mix icônes Lucide / emojis : on garde les emojis pour les fallback
 * génériques (déjà en place dans la version précédente), et on adopte
 * Lucide pour les cas où on veut un look design plus précis (audio).
 */ function CardIcon({ node, isAudio }) {
    if (node.type === 'folder') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full flex items-center justify-center pb-6 text-blue-400",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                className: "w-16 h-16",
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 400,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
            lineNumber: 399,
            columnNumber: 7
        }, this);
    }
    if (isAudio) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full flex items-center justify-center pb-6 text-purple-400",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                className: "w-14 h-14",
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 408,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
            lineNumber: 407,
            columnNumber: 7
        }, this);
    }
    const kind = node.meta?.kind;
    const emoji = kind === 'video' ? '🎬' : '📄';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full flex items-center justify-center pb-6 text-5xl",
        children: emoji
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
        lineNumber: 417,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useMediaAssetEnrichment.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMediaAssetEnrichment",
    ()=>useMediaAssetEnrichment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function useMediaAssetEnrichment() {
    const folders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.folders);
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.files);
    const setContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setContent);
    // Les paths des FILES uniquement — les folders n'ont pas de MediaAsset
    // associée (le model ne track que les assets fichiers).
    // Stringifier pour stabilité de la dépendance React (sinon ré-render
    // à chaque ref change même quand contenu identique).
    const filePaths = files.map((f)=>f.path);
    const filePathsKey = filePaths.join('|');
    // tRPC query. `enabled: filePaths.length > 0` évite un fetch inutile
    // quand le dossier courant ne contient que des sous-dossiers.
    const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].media.getByPaths.useQuery({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
        paths: filePaths
    }, {
        enabled: filePaths.length > 0,
        // Cache court (60s) : les meta changent rarement après l'upload,
        // mais on veut les voir vite sur une description fraîchement éditée.
        staleTime: 60_000
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!data) return;
        // Si aucune des metas n'a apporté de nouveauté, on ne setContent pas
        // (éviterait un ré-render gratuit). On compare les paths qui ont reçu
        // de la metadata vs ceux qui ont déjà la metadata posée.
        const hasNewData = files.some((f)=>{
            const meta = data[f.path];
            if (!meta) return false;
            // Si on a déjà appliqué cette createdAt, pas la peine de refaire.
            return f.meta?.createdAt !== meta.createdAt;
        });
        if (!hasNewData) return;
        // Merge : pour chaque file, si on a des meta DB, on les fusionne au
        // meta existant (qui contient déjà url/format/kind depuis l'adapter).
        const enrichedFiles = files.map((f)=>{
            const meta = data[f.path];
            if (!meta) return f;
            return {
                ...f,
                meta: {
                    ...f.meta,
                    createdAt: meta.createdAt,
                    uploadedBy: meta.uploadedBy,
                    uploaderId: meta.uploaderId,
                    mimeType: meta.mimeType,
                    width: meta.width ?? undefined,
                    height: meta.height ?? undefined,
                    duration: meta.duration ?? undefined,
                    description: meta.description ?? undefined,
                    bytes: meta.bytes
                }
            };
        });
        setContent({
            folders,
            files: enrichedFiles
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data,
        filePathsKey
    ]);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useFinderSearch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFinderSearch",
    ()=>useFinderSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function useFinderSearch() {
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.currentPath);
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.query);
    const flags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.flags);
    const setSearchResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setSearchResults);
    const setSearchLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setSearchLoading);
    const trpcUtils = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].useUtils();
    // Ref vers le timer de debounce pour pouvoir le cancel.
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Query vide → reset results, pas de fetch.
        if (query.trim().length === 0) {
            setSearchResults([], false);
            return;
        }
        // Marqueur de loading immédiat (spinner UI dès la frappe, pas après 300ms)
        setSearchLoading(true);
        // Debounce 300ms
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(async ()=>{
            try {
                // Le prefix de recherche est le currentPath. Pour les fichiers
                // Cloudinary, on a besoin du publicId stripped of extension côté
                // backend — mais comme `currentPath` est toujours un dossier (jamais
                // un fichier), il n'a pas d'extension à stripper. On passe tel quel.
                const data = await trpcUtils.media.searchRecursive.fetch({
                    appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"],
                    prefix: currentPath,
                    query: query.trim(),
                    caseSensitive: flags.caseSensitive,
                    wholeWord: flags.wholeWord,
                    useRegex: flags.useRegex
                });
                // Map vers SearchResultNode (FinderNode + parentPath).
                // Discriminant `kind` côté serveur ('folder' | 'file') → mappé vers
                // `type` côté FinderNode pour rester cohérent avec le reste du finder.
                const results = data.results.map((r)=>{
                    if (r.kind === 'folder') {
                        return {
                            id: r.id,
                            path: r.path,
                            parentPath: r.parentPath,
                            name: r.name,
                            type: 'folder',
                            meta: {}
                        };
                    }
                    // r.kind === 'file' — tous les fields sont présents
                    return {
                        id: r.id,
                        path: r.path,
                        parentPath: r.parentPath,
                        name: r.name,
                        type: 'file',
                        size: r.bytes ?? undefined,
                        meta: {
                            format: r.format ?? undefined,
                            kind: deriveKind(r.mimeType ?? ''),
                            createdAt: r.createdAt ?? undefined,
                            uploadedBy: r.uploadedBy ?? undefined,
                            uploaderId: r.uploaderId ?? undefined,
                            mimeType: r.mimeType ?? undefined,
                            width: r.width ?? undefined,
                            height: r.height ?? undefined,
                            duration: r.duration ?? undefined,
                            description: r.description ?? undefined,
                            bytes: r.bytes ?? undefined
                        }
                    };
                });
                setSearchResults(results, data.truncated);
            } catch (err) {
                // Si le fetch fail (réseau ou regex invalide côté serveur retournant
                // []), on pose juste des résultats vides — le loading est reset.
                console.error('[useFinderSearch] fetch failed', err);
                setSearchResults([], false);
            }
        }, 300);
        // Cleanup : cancel le timeout si query/flags/currentPath changent avant la fin
        return ()=>{
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        query,
        flags.caseSensitive,
        flags.wholeWord,
        flags.useRegex,
        currentPath
    ]);
}
/**
 * Helper local : déduit le `kind` ('image' | 'video' | 'document') depuis
 * un MIME type. Aligné avec ce que les adapters font côté list().
 */ function deriveKind(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'video'; // convention Cloudinary
    // PDF, docx, etc. → document
    if (mimeType === 'application/pdf' || mimeType.includes('word') || mimeType === 'text/plain' || mimeType === 'text/markdown') return 'document';
    return undefined;
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderSearchBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function FinderSearchBar() {
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.query);
    const flags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.flags);
    const loading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.loading);
    const setSearchQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setSearchQuery);
    const toggleSearchFlag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.toggleSearchFlag);
    const clearSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.clearSearch);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Raccourci Ctrl+F / Cmd+F pour focus la searchbar.
    // Empêche le find natif du navigateur — c'est l'expérience attendue dans
    // une app type file explorer (Finder macOS, Explorer Windows).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function onKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                // Pas de preventDefault si on est déjà dans un input ailleurs
                // (ex: le user veut chercher dans un PreviewPanel texte)
                const activeTag = document.activeElement?.tagName.toLowerCase();
                if (activeTag === 'textarea') return;
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return ()=>window.removeEventListener('keydown', onKeyDown);
    }, []);
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            clearSearch();
            inputRef.current?.blur();
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: " relative flex items-center gap-1 shrink-0 w-[280px] h-7 px-2 bg-white border border-gray-300 rounded focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors ",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 w-3.5 h-3.5 flex items-center justify-center text-gray-400",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "w-3.5 h-3.5 animate-spin",
                    "aria-label": "Recherche en cours"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                    lineNumber: 87,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                    className: "w-3.5 h-3.5",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                    lineNumber: 89,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: inputRef,
                type: "text",
                value: query,
                onChange: (e)=>setSearchQuery(e.target.value),
                onKeyDown: handleKeyDown,
                placeholder: "Rechercher dans ce dossier…",
                className: " flex-1 min-w-0 bg-transparent border-none outline-none text-xs placeholder:text-gray-400 ",
                "aria-label": "Rechercher des fichiers"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            query.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: clearSearch,
                className: "shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700",
                title: "Effacer la recherche",
                "aria-label": "Effacer la recherche",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "w-3 h-3",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 flex items-center gap-0.5 border-l border-gray-200 pl-1 ml-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlagToggle, {
                        flag: "caseSensitive",
                        active: flags.caseSensitive,
                        onToggle: toggleSearchFlag,
                        label: "Aa",
                        title: "Respecter la casse"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlagToggle, {
                        flag: "wholeWord",
                        active: flags.wholeWord,
                        onToggle: toggleSearchFlag,
                        label: "ab|",
                        title: "Mot entier"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlagToggle, {
                        flag: "useRegex",
                        active: flags.useRegex,
                        onToggle: toggleSearchFlag,
                        label: ".*",
                        title: "Expression régulière"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
/**
 * Sous-composant : un toggle individuel de filtre.
 * Style mono-bouton compact, état actif = fond bleu pâle.
 */ function FlagToggle({ flag, active, onToggle, label, title }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>onToggle(flag),
        title: title,
        "aria-label": title,
        "aria-pressed": active,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])('shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold rounded', 'transition-colors', active ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'),
        children: label
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/finder-core/utils/highlightMatches.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "highlightMatches",
    ()=>highlightMatches
]);
function highlightMatches(text, query, flags) {
    if (!query) return [
        {
            text,
            isMatch: false
        }
    ];
    let re;
    try {
        if (flags.useRegex) {
            // Force le flag global pour pouvoir itérer avec exec
            const regexFlags = flags.caseSensitive ? 'g' : 'gi';
            re = new RegExp(query, regexFlags);
        } else {
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = flags.wholeWord ? `\\b${escaped}\\b` : escaped;
            const regexFlags = flags.caseSensitive ? 'g' : 'gi';
            re = new RegExp(pattern, regexFlags);
        }
    } catch  {
        // Regex invalide → on retourne le texte intact, pas de surlignement
        return [
            {
                text,
                isMatch: false
            }
        ];
    }
    const segments = [];
    let lastIndex = 0;
    let match;
    while((match = re.exec(text)) !== null){
        // Protection contre une regex qui match l'empty string et boucle indéfiniment
        if (match.index === re.lastIndex) {
            re.lastIndex++;
            continue;
        }
        if (match.index > lastIndex) {
            segments.push({
                text: text.slice(lastIndex, match.index),
                isMatch: false
            });
        }
        segments.push({
            text: match[0],
            isMatch: true
        });
        lastIndex = re.lastIndex;
    }
    // Reste après le dernier match
    if (lastIndex < text.length) {
        segments.push({
            text: text.slice(lastIndex),
            isMatch: false
        });
    }
    // Cas pas de match du tout
    if (segments.length === 0) {
        return [
            {
                text,
                isMatch: false
            }
        ];
    }
    return segments;
}
}),
"[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchResultsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-ssr] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$highlightMatches$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/highlightMatches.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function SearchResultsView() {
    const search = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search);
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.currentPath);
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.setPath);
    const selectOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.selectOnly);
    if (search.query.trim().length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {}, void 0, false);
    if (search.loading && search.results.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Recherche en cours…"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this);
    }
    if (!search.loading && search.results.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Aucun fichier trouvé sous",
                        ' ',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "bg-gray-100 px-1 py-0.5 rounded text-xs",
                            children: displayRelativePath(currentPath)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs",
                    children: "Essaie avec moins de caractères, ou ajuste les filtres (Aa / ab| / .*)."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
            lineNumber: 57,
            columnNumber: 7
        }, this);
    }
    // Handler unifié : selon le type du résultat, on navigue vers le path
    // (folder) ou vers le parent + sélection (file).
    function handleClick(result) {
        if (result.type === 'folder') {
            // Click sur un dossier → naviguer dedans. Le setPath reset
            // automatiquement search.query (logique du store).
            setPath(result.path);
        } else {
            // Click sur un fichier → naviguer vers son parent, sélectionner le fichier
            setPath(result.parentPath);
            selectOnly(result.id);
        }
    }
    // Compteurs typés pour le bandeau header
    const folderCount = search.results.filter((r)=>r.type === 'folder').length;
    const fileCount = search.results.length - folderCount;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 py-2 border-b text-xs text-gray-600 bg-gray-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                className: "text-gray-900",
                                children: search.results.length
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            ' ',
                            "résultat",
                            search.results.length > 1 ? 's' : '',
                            folderCount > 0 && fileCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-500 ml-1",
                                children: [
                                    "(",
                                    folderCount,
                                    " dossier",
                                    folderCount > 1 ? 's' : '',
                                    ", ",
                                    fileCount,
                                    " fichier",
                                    fileCount > 1 ? 's' : '',
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    search.truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-3 text-amber-700",
                        children: "⚠️ Liste tronquée — affine la recherche pour voir tous les résultats"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto divide-y divide-gray-100",
                children: search.results.map((result)=>{
                    const isFolder = result.type === 'folder';
                    const nameSegments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$highlightMatches$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["highlightMatches"])(result.name, search.query, search.flags);
                    const descSegments = result.meta?.description ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$highlightMatches$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["highlightMatches"])(result.meta.description, search.query, search.flags) : null;
                    const senderSegments = result.meta?.uploadedBy ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$highlightMatches$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["highlightMatches"])(result.meta.uploadedBy, search.query, search.flags) : null;
                    const hasDescMatch = descSegments?.some((s)=>s.isMatch);
                    const hasSenderMatch = senderSegments?.some((s)=>s.isMatch);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>handleClick(result),
                        className: " w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-start gap-3 group ",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: isFolder ? 'shrink-0 mt-0.5 text-blue-500 group-hover:text-blue-600' : 'shrink-0 mt-0.5 text-gray-400 group-hover:text-blue-500',
                                children: isFolder ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                                    className: "w-4 h-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                    lineNumber: 149,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    className: "w-4 h-4",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                    lineNumber: 151,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                lineNumber: 141,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-900 truncate",
                                        children: nameSegments.map((seg, i)=>seg.isMatch ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mark", {
                                                className: "bg-yellow-200 text-gray-900 rounded px-0.5",
                                                children: seg.text
                                            }, i, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 161,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: seg.text
                                            }, i, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 168,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                className: "w-3 h-3 inline shrink-0",
                                                "aria-hidden": true
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 175,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: displayRelativePath(result.parentPath)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 176,
                                                columnNumber: 19
                                            }, this),
                                            !isFolder && hasDescMatch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-2 text-[10px] text-gray-400 italic",
                                                title: result.meta?.description ?? '',
                                                children: "· match dans la description"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 179,
                                                columnNumber: 21
                                            }, this),
                                            !isFolder && hasSenderMatch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-2 text-[10px] text-gray-400 italic",
                                                title: `Uploadé par ${result.meta?.uploadedBy}`,
                                                children: "· match dans l'expéditeur"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                                lineNumber: 187,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                        lineNumber: 174,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                lineNumber: 156,
                                columnNumber: 15
                            }, this),
                            !isFolder && result.size !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "shrink-0 text-xs text-gray-400 mt-0.5",
                                children: formatBytes(result.size)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                                lineNumber: 199,
                                columnNumber: 17
                            }, this)
                        ]
                    }, result.id, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                        lineNumber: 131,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
/* -------------------------------------------------------------------------- */ /*                                  HELPERS                                   */ /* -------------------------------------------------------------------------- */ function displayRelativePath(path) {
    if (path === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]) return '/';
    if (path.startsWith(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/`)) return path.slice(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"].length + 1);
    return path;
}
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
}),
"[project]/apps/web/src/features/finder-core/utils/sortNodes.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGroupInfo",
    ()=>getGroupInfo,
    "groupNodes",
    ()=>groupNodes,
    "sortNodes",
    ()=>sortNodes
]);
/**
 * Trie un tableau de FinderNodes selon un critère primaire et un critère
 * secondaire optionnel (départage des items égaux sur le primaire).
 *
 * Pattern explorateurs OS (macOS Finder, Windows Explorer, Nautilus).
 *
 * ─── Champs supportés ──────────────────────────────────────────────────
 *
 *   - `name`   : comparaison locale (Intl.Collator FR par défaut, gère
 *                les accents, la casse, les nombres dans les noms).
 *   - `type`   : folders avant files (convention universelle des explorateurs).
 *                Pour les files, départage par `meta.kind` puis par `meta.format`.
 *   - `size`   : taille en octets. `undefined` traité comme 0 (folders
 *                n'ont typiquement pas de size — ils restent groupés en
 *                tête grâce au compareByType implicite si on ajoute un
 *                tie-break par name).
 *   - `date`   : ⚠️ placeholder — MediaMeta n'expose pas encore de date.
 *                Tombe sur stabilité d'Array.sort en attendant.
 *   - `sender` : ⚠️ idem placeholder.
 *
 * ─── Direction ─────────────────────────────────────────────────────────
 *
 * `asc` : alphanumérique croissant, taille croissante, dates anciennes
 * en premier. `desc` inverse.
 *
 * ─── Stabilité ─────────────────────────────────────────────────────────
 *
 * `Array.prototype.sort` est stable depuis ES2019 — l'ordre relatif des
 * items égaux sur (primary, secondary) est préservé depuis l'ordre du
 * tableau source (typiquement l'ordre d'insertion backend).
 */ // Collator unique : créer une instance par sort est inutile et coûteux.
// `numeric: true` trie correctement "photo2.jpg" < "photo10.jpg".
const COLLATOR = new Intl.Collator('fr', {
    numeric: true,
    sensitivity: 'base'
});
function compareNames(a, b) {
    return COLLATOR.compare(a.name, b.name);
}
function compareSizes(a, b) {
    // Folders n'ont pas de size — fallback à 0 pour qu'ils se groupent en tête.
    return (a.size ?? 0) - (b.size ?? 0);
}
function compareTypes(a, b) {
    // Folders d'abord — convention universelle (KIND_ORDER.folder = 0).
    if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
    }
    if (a.type === 'folder' && b.type === 'folder') {
        return compareNames(a, b);
    }
    // À type égal pour deux fichiers : compare par kind effectif, puis format,
    // puis nom. L'ordre des kinds est défini par KIND_ORDER (Q1=B).
    const kindA = deriveEffectiveKind(a);
    const kindB = deriveEffectiveKind(b);
    const orderA = KIND_ORDER[kindA] ?? 99;
    const orderB = KIND_ORDER[kindB] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    const aFormat = (a.meta?.format ?? '').toUpperCase();
    const bFormat = (b.meta?.format ?? '').toUpperCase();
    if (aFormat !== bFormat) return COLLATOR.compare(aFormat, bFormat);
    // Tie-break par nom
    return compareNames(a, b);
}
/**
 * Compare par date d'upload (`meta.createdAt`, ISO 8601).
 *
 * Folders : toujours considérés sans date → comparés entre eux par nom,
 * et placés en tête (folder.type → -1 dans `compareTypes`-like logic).
 * Sauf qu'ici on ne trie pas par type, on trie par date — donc les
 * folders tombent en tête comme "sans date" (= chaîne vide qui se trie
 * avant n'importe quelle date ISO).
 *
 * Files sans `createdAt` (MediaAsset DB absente — fichier orphelin) :
 * comparés entre eux par nom, et placés à la fin (after les dated files
 * en mode asc, before en mode desc — la logique est juste "missing data
 * → poussé en bout").
 */ function compareDates(a, b) {
    // Folders en tête peu importe la direction — pas de date applicable.
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    if (a.type === 'folder' && b.type === 'folder') {
        return compareNames(a, b);
    }
    const aDate = a.meta?.createdAt;
    const bDate = b.meta?.createdAt;
    // Les deux sans date → tie-break par nom
    if (!aDate && !bDate) return compareNames(a, b);
    // L'un sans date → poussé en queue (always negative comparator val
    // = "a first"; on veut "missing last" donc on retourne +1 pour `a` missing)
    if (!aDate) return 1;
    if (!bDate) return -1;
    // ISO 8601 se compare correctement comme string (l'ordre lexico est
    // identique à l'ordre chronologique). On reste sur string compare pour
    // éviter de parser N Dates.
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    return compareNames(a, b); // tie-break
}
/**
 * Compare par expéditeur (`meta.uploadedBy`).
 *
 * Pareil que dates : folders en tête, files sans uploader en queue.
 */ function compareSenders(a, b) {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    if (a.type === 'folder' && b.type === 'folder') {
        return compareNames(a, b);
    }
    const aSender = a.meta?.uploadedBy;
    const bSender = b.meta?.uploadedBy;
    if (!aSender && !bSender) return compareNames(a, b);
    if (!aSender) return 1;
    if (!bSender) return -1;
    const senderCmp = COLLATOR.compare(aSender, bSender);
    if (senderCmp !== 0) return senderCmp;
    return compareNames(a, b);
}
/**
 * Dispatch sur le bon comparateur pour un field donné.
 * Retourne 0 si le field n'est pas exploitable (genre `date` quand le
 * meta n'a pas encore ce champ) — le tri secondaire ou la stabilité
 * native d'`Array.sort` prendront le relais.
 */ function compareByField(a, b, field) {
    switch(field){
        case 'name':
            return compareNames(a, b);
        case 'size':
            return compareSizes(a, b);
        case 'type':
            return compareTypes(a, b);
        case 'date':
            return compareDates(a, b);
        case 'sender':
            return compareSenders(a, b);
        default:
            {
                // exhaustive check — TS attrape si un nouveau SortField est ajouté
                // sans branche correspondante.
                const _exhaustive = field;
                void _exhaustive;
                return 0;
            }
    }
}
/**
 * Applique un comparateur avec une direction.
 * `desc` inverse simplement le résultat — pas besoin d'un comparateur
 * spécifique par sens.
 */ function applyDirection(cmp, direction) {
    return direction === 'asc' ? cmp : -cmp;
}
function sortNodes(nodes, sort) {
    const sorted = [
        ...nodes
    ];
    sorted.sort((a, b)=>{
        const primary = applyDirection(compareByField(a, b, sort.primary), sort.primaryDirection);
        if (primary !== 0) return primary;
        if (sort.secondary !== null) {
            const secondary = applyDirection(compareByField(a, b, sort.secondary), sort.secondaryDirection);
            if (secondary !== 0) return secondary;
        }
        return 0; // stable sort prend le relais
    });
    return sorted;
}
// Libellés des types fichier en français.
//
// Ordre logique (utilisé par compareTypes) : folder → document → image → video → audio
// L'ordre alphabétique (préférence Stéphane Q1=B) est respecté en remplaçant
// le tableau KIND_ORDER plus bas.
const TYPE_LABELS = {
    folder: 'Dossiers',
    image: 'Images',
    video: 'Vidéos',
    audio: 'Audios',
    document: 'Documents'
};
/**
 * Ordre des kinds dans le tri (Q1=B — alphabétique sur les labels FR).
 *
 *   folder → Documents → Images → Vidéos → Audios
 *
 * Cet ordre détermine l'index de chaque kind dans compareTypes (folders en
 * tête puis ordre alphabétique des autres). Modifier ici si tu veux changer
 * la séquence visuelle.
 */ const KIND_ORDER = {
    folder: 0,
    document: 1,
    image: 2,
    video: 3,
    audio: 4
};
/**
 * 🧭 Dérive le `kind` effectif d'un node en consultant plusieurs sources.
 *
 * ─── Pourquoi cette fonction ───────────────────────────────────────────
 *
 * Le champ `meta.kind` est posé par l'adapter de stockage au moment du list().
 * Mais sa fiabilité varie selon le backend :
 *   - Cloudinary : pose 'image' ou 'video' selon resource_type. Or les audios
 *     Cloudinary sont stockés en resource_type='video' (convention Cloudinary),
 *     ce qui donne un kind 'video' incorrect pour de l'audio.
 *   - R2 : ne pose PAS du tout `meta.kind` (juste `mimeType` et `format`).
 *
 * Plutôt que de toucher à 2 adapters pour aligner leur output, on dérive
 * ici depuis `meta.mimeType` (plus fiable, posé partout) avec fallback
 * sur `meta.kind` legacy.
 */ function deriveEffectiveKind(node) {
    const mime = node.meta?.mimeType ?? '';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    // Fallback sur meta.kind si pas de mimeType
    const k = node.meta?.kind;
    if (k === 'image' || k === 'video') return k;
    // Tout le reste (PDF, docx, txt, md, zip, etc.) → document
    return 'document';
}
function getGroupInfo(node, field) {
    switch(field){
        case 'name':
            {
                const firstChar = node.name.trim().charAt(0).toUpperCase();
                // Normalisation NFD pour décomposer les accents puis on les supprime.
                // Ainsi "Émile" → "E" → groupe "E" (et pas "É" tout seul).
                const normalized = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const key = /[A-Z]/.test(normalized) ? normalized : '#';
                return {
                    key,
                    label: key
                };
            }
        case 'type':
            {
                if (node.type === 'folder') {
                    // Folders : "Dossiers" en macro-catégorie, pas de sous-groupe par format.
                    // Le parentLabel/parentKey identique au key signale "pas de subdivision".
                    return {
                        key: 'folder',
                        label: TYPE_LABELS.folder,
                        parentKey: 'folder',
                        parentLabel: TYPE_LABELS.folder
                    };
                }
                // Files : kind effectif (parent) + format (enfant).
                const kind = deriveEffectiveKind(node);
                const parentLabel = TYPE_LABELS[kind] ?? 'Autres';
                const format = node.meta?.format;
                if (format) {
                    const upperFormat = format.toUpperCase();
                    return {
                        key: `${kind}:${upperFormat}`,
                        label: upperFormat,
                        parentKey: kind,
                        parentLabel
                    };
                }
                // Fichier sans extension reconnue : un seul niveau "Autres" sous le kind.
                return {
                    key: `${kind}:unknown`,
                    label: 'Sans extension',
                    parentKey: kind,
                    parentLabel
                };
            }
        case 'size':
            {
                const size = node.size ?? 0;
                // Folders (size === 0) tombent dans le bucket "< 1 MB" — discutable
                // mais cohérent : ils n'ont pas de poids propre.
                if (size < 1024 * 1024) return {
                    key: 'small',
                    label: '< 1 MB'
                };
                if (size < 10 * 1024 * 1024) return {
                    key: 'medium',
                    label: '1 – 10 MB'
                };
                if (size < 100 * 1024 * 1024) return {
                    key: 'large',
                    label: '10 – 100 MB'
                };
                return {
                    key: 'huge',
                    label: '> 100 MB'
                };
            }
        case 'date':
            {
                // Folders : pas de date pertinente → groupe "Dossiers" en tête (cohérent
                // avec compareDates qui les place en premier).
                if (node.type === 'folder') {
                    return {
                        key: 'folder',
                        label: 'Dossiers'
                    };
                }
                const iso = node.meta?.createdAt;
                if (!iso) return {
                    key: 'date-unknown',
                    label: 'Date inconnue'
                };
                // Buckets temporels relatifs à aujourd'hui — pattern macOS Finder.
                // On compare en ms depuis epoch (rapide, pas de parsing complexe).
                const d = new Date(iso).getTime();
                if (isNaN(d)) return {
                    key: 'date-unknown',
                    label: 'Date inconnue'
                };
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                const startOfYesterday = startOfToday - 86_400_000;
                // "Cette semaine" : lundi 00h00 (semaine FR). Calculé à partir d'aujourd'hui.
                const dayOfWeek = (now.getDay() + 6) % 7; // 0=lundi, 6=dimanche
                const startOfThisWeek = startOfToday - dayOfWeek * 86_400_000;
                const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                const startOfThisYear = new Date(now.getFullYear(), 0, 1).getTime();
                if (d >= startOfToday) return {
                    key: 'date-today',
                    label: "Aujourd'hui"
                };
                if (d >= startOfYesterday) return {
                    key: 'date-yesterday',
                    label: 'Hier'
                };
                if (d >= startOfThisWeek) return {
                    key: 'date-this-week',
                    label: 'Cette semaine'
                };
                if (d >= startOfThisMonth) return {
                    key: 'date-this-month',
                    label: 'Ce mois-ci'
                };
                if (d >= startOfThisYear) return {
                    key: 'date-this-year',
                    label: 'Cette année'
                };
                // Avant l'année courante → par année (genre "2025", "2024").
                const year = new Date(iso).getFullYear();
                return {
                    key: `date-y${year}`,
                    label: String(year)
                };
            }
        case 'sender':
            {
                if (node.type === 'folder') {
                    return {
                        key: 'folder',
                        label: 'Dossiers'
                    };
                }
                const sender = node.meta?.uploadedBy;
                if (!sender) return {
                    key: 'sender-unknown',
                    label: 'Expéditeur inconnu'
                };
                return {
                    key: `sender-${sender}`,
                    label: sender
                };
            }
        default:
            {
                const _exhaustive = field;
                void _exhaustive;
                return {
                    key: 'all',
                    label: ''
                };
            }
    }
}
function groupNodes(sortedNodes, field) {
    const groups = [];
    let current = null;
    for (const node of sortedNodes){
        const info = getGroupInfo(node, field);
        if (!current || current.key !== info.key) {
            current = {
                key: info.key,
                label: info.label,
                parentKey: info.parentKey,
                parentLabel: info.parentLabel,
                nodes: []
            };
            groups.push(current);
        }
        current.nodes.push(node);
    }
    return groups;
}
}),
"[project]/apps/web/src/features/finder-core/utils/triState.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTriState",
    ()=>getTriState
]);
function getTriState(params) {
    const { item, allItems, roots, excluded } = params;
    // 🔹 sélection directe
    if (roots.has(item.id)) {
        // si on a des exclusions dedans → indeterminate
        const hasExcludedDescendant = allItems.some((i)=>i.path.startsWith(item.path + '/') && excluded.has(i.id));
        return hasExcludedDescendant ? 'indeterminate' : 'checked';
    }
    // 🔹 descendants sélectionnés ?
    const descendants = allItems.filter((i)=>i.path.startsWith(item.path + '/'));
    if (descendants.length === 0) {
        return 'unchecked';
    }
    const someSelected = descendants.some((i)=>roots.has(i.id));
    const someExcluded = descendants.some((i)=>excluded.has(i.id));
    if (someSelected) return 'indeterminate';
    if (someExcluded) return 'indeterminate';
    return 'unchecked';
}
}),
"[project]/apps/web/src/features/finder-core/dnd/dragGhost.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 👻 dragGhost — Manager impératif du visuel "ghost" pendant un DnD.
 *
 * Ce module gère un seul élément flottant (`<div>` en `position: fixed`)
 * qui suit le curseur pendant un drag, affiche jusqu'à 3 vignettes des
 * items déplacés (avec un compteur "+N" si plus), et un badge de statut
 * "allowed" (vert) ou "forbidden" (rouge) selon la cible survolée.
 *
 * 🎯 Pourquoi un module impératif et pas un composant React ?
 *
 * Le ghost doit suivre la souris en temps réel pendant un événement de
 * drag global, à travers n'importe quel sous-arbre React. Le faire en
 * React imposerait un portail + un setState par mousemove (saturation
 * de re-renders). Un module impératif avec un singleton DOM est ici
 * plus simple et plus performant — c'est aussi l'approche du legacy
 * de l'ancienne implémentation Cloudinary-specific (depuis supprimée).
 *
 * 🔍 Détection du drop target
 *
 * À chaque `dragover` global, on récupère l'élément sous le curseur via
 * `document.elementFromPoint`, puis on remonte chercher un attribut
 * `data-finder-drop-path` (posé par le composant target). Le path lu
 * est passé à `isDropAllowed` pour calculer le badge.
 *
 * 🧹 Cleanup
 *
 * On enregistre des listeners globaux sur `drop` et `dragend` (les deux,
 * car un drag annulé par Esc déclenche `dragend` mais pas `drop`). À la
 * première occurrence, on retire le ghost et tous les listeners.
 */ __turbopack_context__.s([
    "startDragGhost",
    ()=>startDragGhost
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-ssr] (ecmascript)");
;
const FINDER_DROP_PATH_ATTR = 'data-finder-drop-path';
/* -------------------------------------------------------------------------- */ /*                                 SINGLETONS                                 */ /* -------------------------------------------------------------------------- */ let ghostEl = null;
let badgeEl = null;
let dragImageEl = null;
let itemsRef = [];
/* -------------------------------------------------------------------------- */ /*                              POSITION / BADGE                              */ /* -------------------------------------------------------------------------- */ function moveGhost(x, y) {
    if (!ghostEl) return;
    ghostEl.style.left = `${x + 14}px`;
    ghostEl.style.top = `${y + 14}px`;
}
function setBadgeState(state) {
    if (!badgeEl) return;
    const base = 'absolute -top-3 -right-3 z-[99999] w-8 h-8 rounded-full flex items-center justify-center shadow-md';
    badgeEl.className = state === 'allowed' ? `${base} bg-emerald-400/90` : `${base} bg-rose-400/90`;
    // Pas d'innerHTML pour les SVG : ils sont statiques et inoffensifs.
    badgeEl.innerHTML = state === 'allowed' ? svgPlus() : svgX();
}
function svgPlus() {
    return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function svgX() {
    return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7l10 10M17 7L7 17" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
/* -------------------------------------------------------------------------- */ /*                                RENDER GHOST                                */ /* -------------------------------------------------------------------------- */ /**
 * Construit la pile de vignettes (max 3) + compteur "+N" si plus.
 *
 * On utilise `createElement` + `textContent` pour les noms d'items
 * (XSS-safe — un asset Cloudinary nommé `<script>...</script>` ne
 * pourra rien injecter). Les SVG inlinés via innerHTML sont statiques
 * et donc sans risque.
 */ function renderGhost(previews) {
    if (!ghostEl) return;
    ghostEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    // Badge — état initial "allowed" (sera mis à jour au premier dragover)
    const badge = document.createElement('div');
    badgeEl = badge;
    setBadgeState('allowed');
    wrapper.appendChild(badge);
    // Pile de vignettes
    const stack = document.createElement('div');
    stack.className = 'relative w-24 h-24 opacity-70';
    const top = previews.slice(0, 3);
    top.forEach((preview, idx)=>{
        const card = document.createElement('div');
        card.className = 'absolute w-24 h-24 rounded border border-gray-200 bg-white/80 overflow-hidden flex flex-col items-center justify-center';
        const dx = idx * 6;
        const dy = idx * 6;
        card.style.transform = `translate(${dx}px, ${dy}px)`;
        appendPreviewContent(card, preview);
        stack.appendChild(card);
    });
    wrapper.appendChild(stack);
    // Compteur "+N" si plus de 3 items
    if (previews.length > 3) {
        const count = document.createElement('div');
        count.className = 'absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full';
        count.textContent = `+${previews.length - 3}`;
        wrapper.appendChild(count);
    }
    ghostEl.appendChild(wrapper);
}
/**
 * Pose le contenu typé d'une vignette dans son container.
 *
 * Pour les images : `<img>` avec `meta.url`. Si l'URL casse au chargement,
 * le navigateur affiche le placeholder broken-image standard — on accepte
 * ce comportement, qui reste plus utile qu'une icône générique.
 *
 * Pour les autres kinds : icône emoji + nom tronqué. Choix d'emojis :
 *   - 📁 folder
 *   - 🎬 video
 *   - 📄 document
 *   - 🖼️ image (fallback si meta.url manquante)
 */ function appendPreviewContent(card, preview) {
    if (preview.kind === 'image') {
        const img = document.createElement('img');
        img.src = preview.url;
        img.alt = preview.name;
        img.className = 'w-full h-full object-cover bg-gray-50/60';
        card.appendChild(img);
        return;
    }
    const inner = document.createElement('div');
    inner.className = 'flex flex-col items-center justify-center text-center px-2 gap-1';
    const icon = document.createElement('div');
    icon.className = 'text-3xl';
    icon.textContent = iconFor(preview.kind);
    inner.appendChild(icon);
    const name = document.createElement('div');
    name.className = 'text-xs truncate w-full';
    name.textContent = preview.name; // ⚠️ textContent (pas innerHTML) — XSS-safe
    inner.appendChild(name);
    card.appendChild(inner);
}
function iconFor(kind) {
    switch(kind){
        case 'folder':
            return '📁';
        case 'video':
            return '🎬';
        case 'document':
            return '📄';
    }
}
/* -------------------------------------------------------------------------- */ /*                          DOCUMENT-WIDE DRAG TRACKING                       */ /* -------------------------------------------------------------------------- */ function handleDocumentDragOver(e) {
    if (!ghostEl) return;
    moveGhost(e.clientX, e.clientY);
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = el?.closest?.(`[${FINDER_DROP_PATH_ATTR}]`) ?? null;
    if (!dropZone) {
        setBadgeState('forbidden');
        return;
    }
    const targetPath = dropZone.getAttribute(FINDER_DROP_PATH_ATTR);
    if (!targetPath) {
        setBadgeState('forbidden');
        return;
    }
    setBadgeState((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDropAllowed"])(targetPath, itemsRef) ? 'allowed' : 'forbidden');
}
/* -------------------------------------------------------------------------- */ /*                                  CLEANUP                                   */ /* -------------------------------------------------------------------------- */ function cleanup() {
    document.removeEventListener('dragover', handleDocumentDragOver);
    window.removeEventListener('drop', cleanup, true);
    window.removeEventListener('dragend', cleanup, true);
    if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
    }
    if (dragImageEl) {
        dragImageEl.remove();
        dragImageEl = null;
    }
    badgeEl = null;
    itemsRef = [];
}
function startDragGhost(args) {
    const { e, items, previews } = args;
    // Nettoyage défensif d'un ghost précédent qui n'aurait pas été cleanup.
    cleanup();
    itemsRef = items;
    // Neutralise le ghost natif HTML5 en passant un élément invisible
    // comme dragImage. C'est plus fiable qu'un canvas vide ou un image
    // inexistant qui peuvent laisser des artefacts selon les navigateurs.
    dragImageEl = createTransparentDragImageEl();
    e.dataTransfer.setDragImage(dragImageEl, 0, 0);
    const ghost = document.createElement('div');
    ghost.className = 'fixed z-[9999] pointer-events-none select-none';
    ghost.style.left = '0px';
    ghost.style.top = '0px';
    document.body.appendChild(ghost);
    ghostEl = ghost;
    renderGhost(previews);
    moveGhost(e.clientX, e.clientY);
    document.addEventListener('dragover', handleDocumentDragOver);
    window.addEventListener('drop', cleanup, true);
    window.addEventListener('dragend', cleanup, true);
}
function createTransparentDragImageEl() {
    const el = document.createElement('div');
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.opacity = '0';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    return el;
}
}),
"[project]/apps/web/src/features/finder-core/components/Finder.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Finder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-resizable-panels@4.11.2_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/react-resizable-panels/dist/react-resizable-panels.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/panel-right-close.js [app-ssr] (ecmascript) <export default as PanelRightClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/panel-right-open.js [app-ssr] (ecmascript) <export default as PanelRightOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderBinRootView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderViewModeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTableRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderCompactRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useFinderData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Breadcrumb$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTree$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTree.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$GridItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/GridItem.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/ContextMenu.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeActions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useMediaAssetEnrichment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useMediaAssetEnrichment.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderSearch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useFinderSearch.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderSearchBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderSearchBar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$SearchResultsView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/SearchResultsView.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$sortNodes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/sortNodes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/triState.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$dragGhost$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/dragGhost.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-ssr] (ecmascript)");
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
/**
 * Clé localStorage utilisée pour persister la disposition (largeur) des 3
 * panneaux du finder. Centralisée ici pour qu'on puisse facilement clear
 * via devtools : `localStorage.removeItem('akfc:finder:layout')`.
 */ const LAYOUT_STORAGE_KEY = 'akfc:finder:layout';
function Finder({ adapter, rootPath }) {
    const { folders, files, currentPath, setPath, selection, toggleSelect, selectOnly, selectRange, multiSelectActive, enterMultiSelect, exitMultiSelect, viewMode, sort, setSortPrimary, setSortSecondary, toggleSortDirection, resetSort } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])();
    const { loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderData"])(adapter);
    // Enrichissement silencieux des FinderNodes avec les metadata DB
    // (createdAt, uploadedBy, dimensions, etc.) — cf. doc dans le hook.
    // Le fetch se déclenche à chaque changement de contenu et merge les
    // metas dans le store dès qu'elles arrivent.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useMediaAssetEnrichment$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMediaAssetEnrichment"])();
    // Recherche récursive : observe `search.query` + flags + currentPath et
    // déclenche un fetch tRPC debouncé qui peuple `search.results` du store.
    // Le hook est silencieux quand la query est vide.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderSearch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderSearch"])();
    // Mode recherche actif : on switch la vue centrale en SearchResultsView
    // dès que l'user a tapé quelque chose (loading ou non, résultats ou non).
    const searchActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])((s)=>s.search.query.trim().length > 0);
    // Actions delete/trashToBin adaptatives selon contexte (cf. useNodeActions.ts).
    // Utilisé par les boutons du header en mode multi-select.
    const { deleteNodes, deleteLabel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNodeActions"])();
    // ─── Tri + groupage des items ─────────────────────────────────────────
    //
    // On fusionne folders et files dans une seule liste triée pour pouvoir
    // grouper de façon cohérente selon le critère primaire. Exemples :
    //
    //   - Tri par `name` : items mélangés alphabétiquement avec un header
    //     par lettre initiale (A, B, C…), folders et files entremêlés.
    //   - Tri par `type` : header "Dossiers" en premier (folders d'abord
    //     car le comparateur le garantit), puis "Images", "Vidéos", etc.
    //   - Tri par `size` : buckets fixes (< 1 MB, 1–10 MB, etc.).
    //
    // Pattern macOS Finder en mode "Groupé par".
    //
    // useMemo : on évite de re-trier et re-grouper à chaque render. Les clés
    // couvrent tous les cas où le résultat peut changer.
    const sortedAllItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$sortNodes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sortNodes"])([
            ...folders,
            ...files
        ], sort), [
        folders,
        files,
        sort
    ]);
    const groups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$sortNodes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["groupNodes"])(sortedAllItems, sort.primary), [
        sortedAllItems,
        sort.primary
    ]);
    // Ref impératif sur le Panel preview pour le toggle collapse/expand depuis
    // le bouton du header. `usePanelRef` est exporté en v4 et donne un ref
    // déjà correctement typé pour l'API impérative du Panel.
    const previewPanelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePanelRef"])();
    const [isPreviewCollapsed, setIsPreviewCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    function togglePreviewPanel() {
        const panel = previewPanelRef.current;
        if (!panel) return;
        if (panel.isCollapsed()) {
            panel.expand();
        } else {
            panel.collapse();
        }
    }
    /* -------------------------- Persistance du layout ----------------------- */ /**
   * Sauvegarde et restauration des tailles des 3 panneaux dans localStorage.
   *
   * ─── Pourquoi pas `useDefaultLayout` (le hook v4 prévu pour ça) ? ─────────
   *
   * Le hook officiel accède à `localStorage` pendant l'exécution du hook,
   * y compris pendant le rendu serveur (SSR) — ce qui crashe en Next 16
   * avec `ReferenceError: localStorage is not defined`. Bug connu.
   *
   * ─── Stratégie alternative ────────────────────────────────────────────────
   *
   * On gère la persistance manuellement avec deux mécanismes simples :
   *   - **Au mount** (côté client uniquement, dans un `useEffect`), on lit
   *     localStorage et on applique le layout via l'API impérative
   *     `groupRef.current.setLayout()`. Pas de risque SSR car le useEffect
   *     ne s'exécute que côté client après hydration.
   *   - **À chaque resize** (via `onLayoutChange`), on sauvegarde le layout
   *     dans localStorage. Le callback ne s'exécute qu'en réponse à une
   *     interaction utilisateur, donc toujours côté client.
   *
   * Le layout est stocké en JSON. Le format `Layout` de la lib est un objet
   * indexé par panel `id` (d'où l'`id` qu'on a posé sur chaque Panel).
   */ const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useGroupRef"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (saved && groupRef.current) {
                const layout = JSON.parse(saved);
                groupRef.current.setLayout(layout);
            }
        } catch  {
        // Si JSON corrompu ou localStorage indisponible (mode privé strict),
        // on garde silencieusement le layout par défaut. Pas d'effet visible.
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleLayoutChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((layout)=>{
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
        } catch  {
        // Mode privé / quota dépassé — on laisse passer. Le layout fonctionne
        // toujours pendant la session, juste pas persisté.
        }
    }, []);
    const allNodes = [
        ...folders,
        ...files
    ];
    /**
   * 🔹 Flat list pour calcul tri-state + range
   */ const allItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...folders.map((f)=>({
                    id: f.id,
                    path: f.path
                })),
            ...files.map((f)=>({
                    id: f.id,
                    path: f.path
                }))
        ], [
        folders,
        files
    ]);
    /**
   * 🔹 Gestion du clic — comportement dépendant du mode.
   *
   * **Mode normal** :
   *   - folder → on navigue dedans (setPath)
   *   - file   → on sélectionne pour le PreviewPanel (selectOnly)
   *
   * **Mode multi-select** :
   *   - shift+click → range selection
   *   - simple-clic → toggle de l'item
   *   (cmd/ctrl est redondant avec un simple-clic dans ce mode, on n'en
   *    fait pas un cas séparé pour éviter une logique inutile)
   */ function handleClick(node, e) {
        if (multiSelectActive) {
            // SHIFT → range
            if (e.shiftKey && selection.anchorId) {
                const ids = allItems.map((i)=>i.id);
                const start = ids.indexOf(selection.anchorId);
                const end = ids.indexOf(node.id);
                if (start !== -1 && end !== -1) {
                    const [from, to] = start < end ? [
                        start,
                        end
                    ] : [
                        end,
                        start
                    ];
                    selectRange(ids.slice(from, to + 1));
                    return;
                }
            }
            toggleSelect(node.id);
            return;
        }
        // Mode normal
        if (node.type === 'folder') {
            setPath(node.path);
        } else {
            selectOnly(node.id);
        }
    }
    /**
   * 🔹 Double-clic — utile uniquement en mode multi-select sur un dossier
   * pour permettre de naviguer dedans sans avoir à sortir du mode au préalable.
   */ function handleDoubleClick(node) {
        if (!multiSelectActive) return;
        if (node.type !== 'folder') return;
        setPath(node.path);
    }
    /**
   * 🔹 LongPress — entre en mode multi-select avec l'item comme amorce.
   */ function handleLongPress(node) {
        if (multiSelectActive) return;
        enterMultiSelect(node.id);
    }
    /**
   * 🔹 DnD — démarrage du drag depuis un item de la grille.
   */ function handleDragStart(e, node) {
        let items;
        if (multiSelectActive && selection.roots.has(node.id)) {
            const selectedNodes = allNodes.filter((n)=>selection.roots.has(n.id));
            items = selectedNodes.map(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dragItemFromNode"]);
        } else {
            items = [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dragItemFromNode"])(node)
            ];
        }
        if (items.length === 0) return;
        e.dataTransfer.setData(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializePayload"])({
            items
        }));
        e.dataTransfer.effectAllowed = 'move';
        const previews = items.map((it)=>{
            const fullNode = allNodes.find((n)=>n.id === it.id);
            return buildPreview(fullNode ?? null, it);
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$dragGhost$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["startDragGhost"])({
            e,
            items,
            previews
        });
    }
    // Le 1er chargement = on est en train de charger ET on n'a encore rien
    // à montrer. Dans ce cas on affiche un overlay centré sur la grille
    // pour éviter le panneau central vide qui paraît "cassé".
    const showInitialLoadingOverlay = loading && allNodes.length === 0;
    // ─── Menu contextuel de tri ─────────────────────────────────────────────
    //
    // Position du menu : `null` = menu fermé. Ouvert via `onContextMenu`
    // sur le container de la grid view (cf. `<div className="p-4 overflow-auto …"`).
    //
    // Les right-clicks sur les GridItem ne bubblent PAS jusqu'à ce container
    // (les items appellent `e.stopPropagation()` dans leur handler), donc
    // pas de conflit entre les 2 menus.
    const [sortMenuPos, setSortMenuPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /**
   * Construit les items du menu de tri. Sections séparées par des `header`/
   * `separator` (cf. ContextMenu.tsx : type discriminant).
   *
   * Pattern utilisé :
   *   - Le tri primaire affiche un ✓ devant la field active
   *   - Click sur une field déjà primary → toggle direction (asc ↔ desc)
   *   - Click sur une autre field → devient primary, garde la direction
   *   - Tri secondaire identique, avec "Aucun" pour le désactiver
   *   - Date et Expéditeur grisés (disabled) car MediaMeta ne porte pas
   *     encore ces champs ; l'infra est prête, l'enrichissement contract
   *     activera ces options sans changer ce code.
   */ function buildSortMenuItems() {
        // Définitions centralisées des fields visibles, dans l'ordre du menu.
        // Tous activés : depuis la Phase 1 metadata, Date et Expéditeur sont
        // exploitables (via useMediaAssetEnrichment qui peuple meta.createdAt
        // et meta.uploadedBy). Pour les fichiers sans MediaAsset DB (orphelins),
        // ils retombent dans les groupes "Date inconnue" / "Expéditeur inconnu".
        const fields = [
            {
                field: 'name',
                label: 'Nom'
            },
            {
                field: 'type',
                label: 'Type'
            },
            {
                field: 'size',
                label: 'Taille'
            },
            {
                field: 'date',
                label: 'Date'
            },
            {
                field: 'sender',
                label: 'Expéditeur'
            }
        ];
        const arrow = (dir)=>dir === 'asc' ? ' ↑' : ' ↓';
        return [
            {
                type: 'header',
                label: 'Tri principal'
            },
            ...fields.map((f)=>({
                    label: f.label + (sort.primary === f.field ? arrow(sort.primaryDirection) : ''),
                    checked: sort.primary === f.field,
                    disabled: f.disabled,
                    onClick: ()=>setSortPrimary(f.field)
                })),
            {
                type: 'separator'
            },
            {
                type: 'header',
                label: 'Tri secondaire'
            },
            {
                label: 'Aucun',
                checked: sort.secondary === null,
                onClick: ()=>setSortSecondary(null)
            },
            ...fields.map((f)=>({
                    label: f.label + (sort.secondary === f.field ? arrow(sort.secondaryDirection) : ''),
                    checked: sort.secondary === f.field,
                    disabled: f.disabled,
                    onClick: ()=>setSortSecondary(f.field)
                })),
            {
                type: 'separator'
            },
            {
                type: 'header',
                label: 'Ordre'
            },
            {
                label: `Inverser l'ordre principal`,
                onClick: ()=>toggleSortDirection('primary')
            },
            ...sort.secondary !== null ? [
                {
                    label: `Inverser l'ordre secondaire`,
                    onClick: ()=>toggleSortDirection('secondary')
                }
            ] : [],
            {
                type: 'separator'
            },
            {
                label: 'Réinitialiser le tri',
                onClick: ()=>resetSort()
            }
        ];
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full border rounded overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-b text-sm flex items-center gap-2 min-h-[40px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Breadcrumb$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            adapter: adapter
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 435,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 434,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-4 h-4 flex items-center justify-center shrink-0",
                        children: loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-4 w-4 animate-spin text-gray-400",
                            "aria-label": "Chargement"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 441,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 439,
                        columnNumber: 9
                    }, this),
                    multiSelectActive && (()=>{
                        const selectedCount = selection.roots.size;
                        const selectedNodes = [
                            ...folders,
                            ...files
                        ].filter((n)=>selection.roots.has(n.id));
                        // On utilise les selectedNodes pour le label : `deleteLabel` détecte
                        // le contexte par le path du premier node (cf. useNodeActions.ts),
                        // pas par le currentPath global — ça garantit la cohérence
                        // label ↔ action même si la sélection est dans un sous-dossier.
                        const label = deleteLabel(selectedCount, selectedNodes);
                        const isBinAction = selectedNodes.length > 0 && (selectedNodes[0].path === `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` || selectedNodes[0].path.startsWith(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin/`));
                        async function handleMultiDelete() {
                            await deleteNodes(selectedNodes);
                        }
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-gray-600 shrink-0",
                                    children: [
                                        selectedCount,
                                        " sélectionné",
                                        selectedCount > 1 ? 's' : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 480,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleMultiDelete,
                                    disabled: selectedCount === 0,
                                    title: label,
                                    className: isBinAction ? 'shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs' : 'shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                            className: "h-3.5 w-3.5",
                                            "aria-hidden": true
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                            lineNumber: 495,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                            lineNumber: 496,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 484,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: exitMultiSelect,
                                    title: "Quitter le mode sélection",
                                    "aria-label": "Quitter le mode sélection",
                                    className: " shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-4 w-4",
                                        "aria-hidden": true
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 511,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 499,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true);
                    })(),
                    currentPath !== `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` && !multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderSearchBar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 522,
                        columnNumber: 11
                    }, this),
                    currentPath !== `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderViewModeSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 528,
                        columnNumber: 47
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/test-finder/corbeille",
                        className: " shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                        "aria-label": "Ouvrir la corbeille",
                        title: "Corbeille",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 542,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 531,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: togglePreviewPanel,
                        className: " shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                        "aria-label": isPreviewCollapsed ? 'Afficher le panneau de prévisualisation' : 'Masquer le panneau de prévisualisation',
                        title: isPreviewCollapsed ? 'Afficher la prévisualisation' : 'Masquer la prévisualisation',
                        children: isPreviewCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__["PanelRightOpen"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 559,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__["PanelRightClose"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 561,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 546,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 433,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 text-sm bg-red-50 text-red-700 border-b flex items-center gap-2",
                role: "alert",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "h-4 w-4 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 572,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Erreur : ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 573,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 568,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
                groupRef: groupRef,
                orientation: "horizontal",
                onLayoutChange: handleLayoutChange,
                className: "flex-1 min-h-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Panel"], {
                        id: "tree",
                        defaultSize: "320px",
                        minSize: "240px",
                        maxSize: "500px",
                        className: "overflow-auto p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTree$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            adapter: adapter,
                            rootPath: rootPath,
                            currentPath: currentPath,
                            onOpen: setPath,
                            onItemDragStart: handleDragStart,
                            onItemLongPress: handleLongPress
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 605,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 604,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Separator"], {
                        className: " w-px bg-gray-200 hover:bg-blue-400 hover:w-[3px] transition-all focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px] "
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 615,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Panel"], {
                        id: "grid",
                        minSize: 20,
                        className: "flex flex-col min-h-0 relative",
                        children: currentPath === `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderBinRootView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 650,
                            columnNumber: 13
                        }, this) : searchActive ? /* Mode recherche actif → vue plate des résultats, sans
               groupage par tri ni navigation folder-by-folder. La barre
               searchbar reste visible dans le header pour permettre la
               modification de la query ou son effacement. */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$SearchResultsView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 656,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                showInitialLoadingOverlay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-2 text-gray-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "h-6 w-6 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 664,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                children: "Chargement…"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 665,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 663,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 662,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 overflow-auto flex-1",
                                    onContextMenu: (e)=>{
                                        // Le right-click sur un GridItem stopPropagation, donc on
                                        // n'arrive ici que pour la zone vide / les zones inter-items.
                                        // C'est exactement la sémantique souhaitée — l'utilisateur
                                        // veut le menu de tri quand il clique "ailleurs que sur un item".
                                        e.preventDefault();
                                        setSortMenuPos({
                                            x: e.clientX,
                                            y: e.clientY
                                        });
                                    },
                                    children: folders.length === 0 && files.length === 0 && !loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Ce dossier est vide"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                            lineNumber: 683,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 682,
                                        columnNumber: 19
                                    }, this) : viewMode === 'grid' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]",
                                        children: groups.map((group, groupIndex)=>{
                                            // Détecte les transitions de catégorie parent : si le
                                            // groupe actuel a un parentKey différent du précédent
                                            // (ou s'il est le premier), on rend un header parent
                                            // prominent au-dessus.
                                            const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                                            const showParentHeader = !!group.parentKey && (!prevGroup || prevGroup.parentKey !== group.parentKey);
                                            // Si key === parentKey (cas folder où il n'y a pas de
                                            // subdivision par format), on ne rend que le parent header.
                                            const showChildHeader = !!group.label && group.key !== group.parentKey;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                children: [
                                                    showParentHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "col-span-full mt-4 mb-1 pt-2 pb-2 px-2 border-b-2 border-gray-300 first:mt-0",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-bold text-gray-800",
                                                            children: group.parentLabel
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 708,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                        lineNumber: 707,
                                                        columnNumber: 25
                                                    }, this),
                                                    showChildHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "col-span-full mt-2 mb-1 pb-1 px-1 pl-4 border-b border-gray-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-semibold uppercase tracking-wider text-gray-500",
                                                                children: group.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 717,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-2 text-xs text-gray-400",
                                                                children: [
                                                                    "(",
                                                                    group.nodes.length,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 720,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                        lineNumber: 716,
                                                        columnNumber: 25
                                                    }, this),
                                                    group.nodes.map((node)=>{
                                                        // Le tri-state n'a de sens que pour les folders (qui
                                                        // peuvent être en `indeterminate` si une partie de leur
                                                        // contenu est sélectionnée). Les files sont juste
                                                        // checked/unchecked d'après leur appartenance aux roots.
                                                        const isFolder = node.type === 'folder';
                                                        const triState = isFolder ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTriState"])({
                                                            item: node,
                                                            allItems,
                                                            roots: selection.roots,
                                                            excluded: selection.excluded
                                                        }) : selection.roots.has(node.id) ? 'checked' : 'unchecked';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$GridItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            node: node,
                                                            isSelected: selection.roots.has(node.id),
                                                            multiSelectActive: multiSelectActive,
                                                            triState: triState,
                                                            onClick: (e)=>handleClick(node, e),
                                                            onDoubleClick: isFolder ? ()=>handleDoubleClick(node) : undefined,
                                                            onLongPress: ()=>handleLongPress(node),
                                                            onDragStart: (e)=>handleDragStart(e, node)
                                                        }, node.id, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 743,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                ]
                                            }, group.key, true, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 702,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 686,
                                        columnNumber: 15
                                    }, this) : viewMode === 'table' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-sm border-collapse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-2 py-2 text-left w-8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 764,
                                                            columnNumber: 43
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-2 py-2 text-left w-8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 765,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-left",
                                                            children: "Nom"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 766,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-left",
                                                            children: "Type"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 767,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-right",
                                                            children: "Taille"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 768,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 762,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "divide-y divide-gray-100",
                                                children: groups.map((group, groupIndex)=>{
                                                    const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                                                    const showParentHeader = !!group.parentKey && (!prevGroup || prevGroup.parentKey !== group.parentKey);
                                                    const showChildHeader = !!group.label && group.key !== group.parentKey;
                                                    const span = multiSelectActive ? 5 : 4;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                        children: [
                                                            showParentHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "bg-gray-100",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    colSpan: span,
                                                                    className: "px-3 py-2.5 border-t-2 border-gray-300",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm font-bold text-gray-800",
                                                                        children: group.parentLabel
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                        lineNumber: 792,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                    lineNumber: 788,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 787,
                                                                columnNumber: 27
                                                            }, this),
                                                            showChildHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "bg-gray-50",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    colSpan: span,
                                                                    className: "px-3 py-1.5 pl-6 border-y border-gray-200",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs font-semibold uppercase tracking-wider text-gray-500",
                                                                            children: group.label
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                            lineNumber: 805,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "ml-2 text-xs text-gray-400",
                                                                            children: [
                                                                                "(",
                                                                                group.nodes.length,
                                                                                ")"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                            lineNumber: 808,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                    lineNumber: 801,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 800,
                                                                columnNumber: 27
                                                            }, this),
                                                            group.nodes.map((node)=>{
                                                                const isFolder = node.type === 'folder';
                                                                const triState = isFolder ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTriState"])({
                                                                    item: node,
                                                                    allItems,
                                                                    roots: selection.roots,
                                                                    excluded: selection.excluded
                                                                }) : selection.roots.has(node.id) ? 'checked' : 'unchecked';
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTableRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    node: node,
                                                                    isSelected: selection.roots.has(node.id),
                                                                    multiSelectActive: multiSelectActive,
                                                                    triState: triState,
                                                                    onClick: (e)=>handleClick(node, e),
                                                                    onDoubleClick: isFolder ? ()=>handleDoubleClick(node) : undefined,
                                                                    onLongPress: ()=>handleLongPress(node),
                                                                    onDragStart: (e)=>handleDragStart(e, node)
                                                                }, node.id, false, {
                                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                    lineNumber: 828,
                                                                    columnNumber: 27
                                                                }, this);
                                                            })
                                                        ]
                                                    }, group.key, true, {
                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                        lineNumber: 782,
                                                        columnNumber: 23
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 771,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 761,
                                        columnNumber: 15
                                    }, this) : /* compact */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "divide-y divide-gray-100",
                                        children: groups.map((group, groupIndex)=>{
                                            const prevGroup = groupIndex > 0 ? groups[groupIndex - 1] : null;
                                            const showParentHeader = !!group.parentKey && (!prevGroup || prevGroup.parentKey !== group.parentKey);
                                            const showChildHeader = !!group.label && group.key !== group.parentKey;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                children: [
                                                    showParentHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "px-3 py-2 bg-gray-100 border-t-2 border-gray-300 first:border-t-0",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-bold text-gray-800",
                                                            children: group.parentLabel
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 862,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 25
                                                    }, this),
                                                    showChildHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "px-3 pl-6 py-1.5 bg-gray-50",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-semibold uppercase tracking-wider text-gray-500",
                                                                children: group.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 870,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-2 text-xs text-gray-400",
                                                                children: [
                                                                    "(",
                                                                    group.nodes.length,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                                lineNumber: 873,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                        lineNumber: 869,
                                                        columnNumber: 25
                                                    }, this),
                                                    group.nodes.map((node)=>{
                                                        const isFolder = node.type === 'folder';
                                                        const triState = isFolder ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTriState"])({
                                                            item: node,
                                                            allItems,
                                                            roots: selection.roots,
                                                            excluded: selection.excluded
                                                        }) : selection.roots.has(node.id) ? 'checked' : 'unchecked';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderCompactRow$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            node: node,
                                                            isSelected: selection.roots.has(node.id),
                                                            multiSelectActive: multiSelectActive,
                                                            triState: triState,
                                                            onClick: (e)=>handleClick(node, e),
                                                            onDoubleClick: isFolder ? ()=>handleDoubleClick(node) : undefined,
                                                            onLongPress: ()=>handleLongPress(node),
                                                            onDragStart: (e)=>handleDragStart(e, node)
                                                        }, node.id, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 892,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                ]
                                            }, group.key, true, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 858,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 848,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 670,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 630,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Separator"], {
                        className: " w-px bg-gray-200 hover:bg-blue-400 hover:w-[3px] transition-all focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px] "
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 915,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$2_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Panel"], {
                        id: "preview",
                        panelRef: previewPanelRef,
                        defaultSize: "420px",
                        minSize: "300px",
                        maxSize: "600px",
                        collapsible: true,
                        collapsedSize: 0,
                        onResize: ()=>{
                            setIsPreviewCollapsed(previewPanelRef.current?.isCollapsed() ?? false);
                        },
                        className: "overflow-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            adapter: adapter
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 951,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 938,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 590,
                columnNumber: 7
            }, this),
            sortMenuPos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$ContextMenu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                x: sortMenuPos.x,
                y: sortMenuPos.y,
                items: buildSortMenuItems(),
                onClose: ()=>setSortMenuPos(null)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 960,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
        lineNumber: 430,
        columnNumber: 5
    }, this);
}
/* -------------------------------------------------------------------------- */ /*                              GHOST PREVIEW BUILDER                         */ /* -------------------------------------------------------------------------- */ /**
 * Construit la `GhostPreview` d'un item à partir de son `FinderNode`.
 */ function buildPreview(node, fallback) {
    if (!node) {
        const name = fallback.path.split('/').pop() ?? fallback.id;
        return fallback.type === 'folder' ? {
            kind: 'folder',
            name
        } : {
            kind: 'document',
            name
        };
    }
    if (node.type === 'folder') {
        return {
            kind: 'folder',
            name: node.name
        };
    }
    const kind = node.meta?.kind;
    const url = node.meta?.url;
    if (kind === 'image' && url) {
        return {
            kind: 'image',
            name: node.name,
            url
        };
    }
    if (kind === 'video') {
        return {
            kind: 'video',
            name: node.name
        };
    }
    return {
        kind: 'document',
        name: node.name
    };
}
}),
"[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MediaPicker",
    ()=>MediaPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Finder$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/Finder.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/Modal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
;
;
;
;
;
function MediaPicker({ open, onClose, onSubmit, adapter, rootPath }) {
    const { selection, folders, files } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFinderStore"])();
    function handleSubmit() {
        const allItems = [
            ...folders.map((f)=>({
                    id: f.id,
                    path: f.path
                })),
            ...files.map((f)=>({
                    id: f.id,
                    path: f.path
                }))
        ];
        const selected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveSelection"])({
            items: allItems,
            roots: selection.roots,
            excluded: selection.excluded
        });
        onSubmit(Array.from(selected));
        onClose();
    }
    const count = selection.roots.size;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$Modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Modal"], {
        open: open,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b font-medium",
                children: "Sélectionner des médias"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Finder$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    adapter: adapter,
                    rootPath: rootPath
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500",
                        children: [
                            count,
                            " sélection(s) racine"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "px-3 py-1 border rounded",
                                children: "Annuler"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSubmit,
                                disabled: count === 0,
                                className: "px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50",
                                children: "Valider"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_finder-core_6cbd6b37._.js.map