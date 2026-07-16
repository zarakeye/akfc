module.exports = [
"[project]/packages/config/app.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
}),
"[project]/packages/finder-core/src/cart/usePickerCartStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePickerCartStore",
    ()=>usePickerCartStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.15_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const usePickerCartStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$14_$40$types$2b$react$40$19$2e$2$2e$15_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
}),
];

//# sourceMappingURL=packages_d1d2a8ba._.js.map