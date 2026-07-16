(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/config/app.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/finder-core/src/cart/usePickerCartStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePickerCartStore",
    ()=>usePickerCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.15_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const usePickerCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=packages_aa542f10._.js.map