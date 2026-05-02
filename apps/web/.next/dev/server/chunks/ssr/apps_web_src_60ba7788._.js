module.exports = [
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
"[project]/apps/web/src/config/app.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.8_@types+react@19.2.2_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/config/app.ts [app-ssr] (ecmascript)");
;
;
const useFinderStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        /* -------------------------------- NAV -------------------------------- */ currentPath: `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$config$2f$app$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APP_ROOT"]}`,
        setPath: (path)=>set(()=>({
                    currentPath: path,
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    }
                })),
        /* ------------------------------ CONTENT -------------------------------- */ folders: [],
        files: [],
        setContent: ({ folders, files })=>set(()=>({
                    folders,
                    files
                })),
        /* ----------------------------- SELECTION -------------------------------- */ selection: {
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
                const nextRoots = new Set(state.selection.roots);
                for (const id of ids){
                    nextRoots.add(id);
                }
                return {
                    selection: {
                        roots: nextRoots,
                        excluded: new Set(),
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
                }))
    }));
}),
"[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MediaPicker",
    ()=>MediaPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-ssr] (ecmascript)");
;
;
;
function MediaPicker({ open, onClose, onSubmit, adapter }) {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Modal, {
        open: open,
        onClose: onClose,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b font-medium",
                children: "Sélectionner des médias"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Finder, {
                    adapter: adapter
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-500",
                        children: [
                            count,
                            " sélection(s) racine"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "px-3 py-1 border rounded",
                                children: "Annuler"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSubmit,
                                disabled: count === 0,
                                className: "px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50",
                                children: "Valider"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/features/cloudinary-adapter/cloudinaryAdapter.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloudinaryAdapter",
    ()=>cloudinaryAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
;
/**
 * 🔁 Helper : extraire enfants directs
 */ function extractChildren(tree) {
    if (!tree) return {
        folders: [],
        files: []
    };
    const folders = [];
    const files = [];
    for (const child of tree.children ?? []){
        if (child.type === 'folder') {
            folders.push({
                id: child.fullPath,
                name: child.name,
                path: child.fullPath,
                type: 'folder',
                hasChildren: child.children && child.children.length > 0
            });
        }
        if (child.type === 'file') {
            files.push({
                id: child.publicId,
                name: child.name ?? child.publicId.split('/').pop(),
                path: child.publicId,
                type: 'file'
            });
        }
    }
    return {
        folders,
        files
    };
}
const cloudinaryAdapter = {
    async list (options) {
        const tree = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpcClient"].cloudinary.getFolderTree.query({
            path: options.path
        });
        const { folders, files } = extractChildren(tree);
        return {
            folders,
            files,
            nextCursor: null
        };
    }
};
}),
"[project]/apps/web/src/app/test-picker/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestPickerPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$MediaPicker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/MediaPicker.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$cloudinary$2d$adapter$2f$cloudinaryAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/cloudinary-adapter/cloudinaryAdapter.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function TestPickerPage() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(true),
                className: "px-4 py-2 bg-black text-white rounded",
                children: "Ouvrir Media Picker"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/test-picker/page.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$MediaPicker$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MediaPicker"], {
                open: open,
                onClose: ()=>setOpen(false),
                adapter: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$cloudinary$2d$adapter$2f$cloudinaryAdapter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloudinaryAdapter"],
                onSubmit: (ids)=>{
                    console.log('Selected:', ids);
                }
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/test-picker/page.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/test-picker/page.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_60ba7788._.js.map