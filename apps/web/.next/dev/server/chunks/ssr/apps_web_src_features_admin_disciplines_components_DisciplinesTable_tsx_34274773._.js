module.exports = [
"[project]/apps/web/src/features/admin/disciplines/components/DisciplinesTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DisciplinesTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$ts$2d$tab$2d$lib$40$1$2e$9$2e$4_$40$heroui$2b$system$40$2$2e$4$2e$28_$40$heroui$2b$theme$40$2$2e$4$2e$26_tailwindcss$40$4$2e$3$2e$0_$5f40$r_a46a51a4e3f1bca126230c96431dc07f$2f$node_modules$2f$react$2d$ts$2d$tab$2d$lib$2f$dist$2f$index$2d$BV6rn10c$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__Table$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-ts-tab-lib@1.9.4_@heroui+system@2.4.28_@heroui+theme@2.4.26_tailwindcss@4.3.0__@r_a46a51a4e3f1bca126230c96431dc07f/node_modules/react-ts-tab-lib/dist/index-BV6rn10c.js [app-ssr] (ecmascript) <export T as Table>");
'use client';
;
;
;
;
;
/**
 * DisciplinesTable
 *
 * Liste les disciplines via `trpc.discipline.getAll.useQuery()`. `getAll`
 * renvoie les disciplines brutes (categoryId/familyId, pas les noms) ; on
 * construit des lignes dérivées : catégorie et famille résolues par leur nom,
 * type en libellé FR. Clic sur une ligne → `/(admin)/dashboard/disciplines/[id]`.
 */ const TYPE_LABELS = {
    MARTIAL_ART: 'Art martial',
    CALLIGRAPHY: 'Calligraphie'
};
function DisciplinesTable() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { data: disciplines, isLoading, isError } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].discipline.getAll.useQuery();
    const { data: categories } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].category.getAll.useQuery();
    const { data: families } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["trpc"].disciplineFamily.getAll.useQuery();
    const categoryById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        (categories ?? []).forEach((c)=>map.set(c.id, c.type));
        return map;
    }, [
        categories
    ]);
    const familyById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        (families ?? []).forEach((f)=>map.set(f.id, f.name));
        return map;
    }, [
        families
    ]);
    if (isLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Chargement…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/admin/disciplines/components/DisciplinesTable.tsx",
        lineNumber: 49,
        columnNumber: 25
    }, this);
    if (isError) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Erreur lors du chargement des disciplines."
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/admin/disciplines/components/DisciplinesTable.tsx",
        lineNumber: 50,
        columnNumber: 23
    }, this);
    const rows = (disciplines ?? []).map((d)=>({
            id: d.id,
            name: d.name,
            slug: d.slug ?? '—',
            type: TYPE_LABELS[d.type] ?? d.type,
            categorie: categoryById.get(d.categoryId) ?? `#${d.categoryId}`,
            famille: d.familyId != null ? familyById.get(d.familyId) ?? `#${d.familyId}` : '—'
        }));
    const columns = [
        {
            property: 'id',
            displayName: 'ID',
            type: 'number'
        },
        {
            property: 'name',
            displayName: 'Nom',
            type: 'string'
        },
        {
            property: 'slug',
            displayName: 'Slug',
            type: 'string'
        },
        {
            property: 'type',
            displayName: 'Type',
            type: 'string'
        },
        {
            property: 'categorie',
            displayName: 'Catégorie',
            type: 'string'
        },
        {
            property: 'famille',
            displayName: 'Famille',
            type: 'string'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$ts$2d$tab$2d$lib$40$1$2e$9$2e$4_$40$heroui$2b$system$40$2$2e$4$2e$28_$40$heroui$2b$theme$40$2$2e$4$2e$26_tailwindcss$40$4$2e$3$2e$0_$5f40$r_a46a51a4e3f1bca126230c96431dc07f$2f$node_modules$2f$react$2d$ts$2d$tab$2d$lib$2f$dist$2f$index$2d$BV6rn10c$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__T__as__Table$3e$__["Table"], {
        columns: columns,
        rows: rows,
        onRowClick: (row)=>{
            if (row) router.push(`/dashboard/disciplines/${row.id}`);
        }
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/admin/disciplines/components/DisciplinesTable.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_features_admin_disciplines_components_DisciplinesTable_tsx_34274773._.js.map