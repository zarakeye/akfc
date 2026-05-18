(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/config/app.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APP_ROOT",
    ()=>APP_ROOT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const APP_ROOT = ("TURBOPACK compile-time value", "AKFC") || 'my_app';
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFinderStore",
    ()=>useFinderStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.8_@types+react@19.2.2_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
;
;
const VIEW_MODE_STORAGE_KEY = 'akfc:finder:view-mode';
function loadViewMode() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (saved === 'grid' || saved === 'table' || saved === 'compact') {
            return saved;
        }
    } catch  {
    /* mode privé / quota — fallback silencieux sur grid */ }
    return 'grid';
}
function saveViewMode(mode) {
    try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch  {
    /* idem */ }
}
const useFinderStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        /* -------------------------------- NAV -------------------------------- */ currentPath: `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"]}`,
        // setPath remplace le path actuel et reset la sélection (ex: lors d'une navigation).
        // Naviguer fait également sortir du mode multi-select : c'est un choix produit
        // pour éviter de se retrouver avec des checkboxes vides dans un nouveau dossier.
        //
        // ─── Reset folders/files au changement de path ────────────────────────────
        //
        // Sans ça, on observe un "flash" du contenu précédent pendant la phase de
        // chargement du nouveau path : `useFinderData` lance un fetch async qui
        // ne setContent() qu'à la fin, donc entre le clic et le retour de la
        // requête, la grille rend les `folders`/`files` du path PRÉCÉDENT.
        //
        // Cas concret : si l'utilisateur passe de `AKFC/bin` (où folders contient
        // `.trash` côté store, même si on rend FinderBinRootView) à
        // `AKFC/pending/Cours`, la grille montre brièvement `.trash` avant
        // d'afficher le contenu de `Cours`.
        //
        // Le reset immédiat à `[]` rend la grille temporairement vide pendant le
        // chargement — c'est le comportement attendu (l'overlay de loading prend
        // le relais visuel).
        setPath: (path)=>set((state)=>{
                // Cache hit : on applique directement le contenu mémorisé.
                // Cache miss : on reset à [] (l'overlay de loading prend le relais
                // pendant que `useFinderData` lance le fetch).
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
                    multiSelectActive: false
                };
            }),
        /* ------------------------------ CONTENT -------------------------------- */ folders: [],
        files: [],
        contentCache: new Map(),
        // setContent remplace le contenu actuel ET mémorise dans le cache pour
        // le path courant. Sans cette mise en cache, la nav vers un parent déjà
        // visité re-déclencherait un fetch.
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
        // Met dans le cache les children d'un path arbitraire (utilisé par
        // FinderTree / FinderTreeFolder pour mutualiser avec la GridView).
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
        // Incrémente reloadKey ET purge tout le cache, pour que le re-fetch
        // soit garanti frais. Conservateur (purge globale) mais simple — pour
        // l'instant les mutations sont rares dans le finder, donc OK.
        reloadFolderContent: ()=>set((state)=>({
                    reloadKey: state.reloadKey + 1,
                    contentCache: new Map()
                })),
        /* ----------------------------- SELECTION -------------------------------- */ /**
   * La sélection est gérée via un système de "tri-state" avec :
   * - roots : les items explicitement sélectionnés
   * - excluded : les items explicitement exclus (dans le cas d'une sélection de masse)
   * - anchorId : pour gérer les sélections en range avec shift+click
   * 
   * Ce système permet de gérer efficacement les sélections de masse (ex: "select all") sans avoir à stocker tous les ids sélectionnés, en utilisant les "roots" pour les items explicitement sélectionnés et les "excluded" pour les items explicitement exclus dans le cas d'une sélection de masse.
   * L'anchorId permet de gérer les sélections en range avec shift+click en gardant une référence à l'item de départ de la sélection.
   * 
   * Les méthodes exposées permettent de mettre à jour cette sélection de manière cohérente en fonction des interactions de l'utilisateur (clic simple, clic avec metaKey pour multi-sélection, clic avec shiftKey pour sélection en range).
   * La méthode clearSelection permet de réinitialiser la sélection, par exemple après une action de déplacement ou suppression pour éviter que des items sélectionnés soient dans un état incohérent.
   */ selection: {
            roots: new Set(),
            excluded: new Set(),
            anchorId: null
        },
        /**
   * Définit la sélection avec une liste d'ids et un anchorId optionnel pour les sélections en range.
   * Les ids fournis sont ajoutés aux "roots" de la sélection, et l'anchorId est mis à jour pour permettre les sélections en range avec shift+click.
   * Si aucun anchorId n'est fourni, il reste inchangé.
   * @param ids 
   * @param anchorId 
   * @returns 
   * @description Cette méthode est utilisée pour définir la sélection de manière explicite, par exemple lors d'une action de sélection en masse ou pour réinitialiser la sélection à un ensemble spécifique d'ids.
   */ setSelection: (ids, anchorId = null)=>set(()=>({
                    selection: {
                        roots: new Set(ids),
                        excluded: new Set(),
                        anchorId
                    }
                })),
        /**
   * Toggle la sélection d'un item. Si l'item est déjà sélectionné, il sera désélectionné, et inversement.
   * Si l'item est sélectionné, il est ajouté aux "roots" et retiré des "excluded". 
   * Si l'item est désélectionné, il est retiré des "roots".
   * L'anchorId est mis à jour avec l'id de l'item cliqué pour permettre les sélections en range avec shift+click.
   * @param id 
   * @returns 
   * @description Cette méthode est utilisée pour les clics avec metaKey (cmd/ctrl) pour permettre de sélectionner ou désélectionner des items de manière individuelle sans affecter les autres sélections.
   */ toggleSelect: (id)=>set((state)=>{
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
        /**
   * Sélectionne uniquement l'item spécifié, en désélectionnant tous les autres.
   * @param id 
   * @returns 
   * @description Cette méthode est utilisée pour les clics simples sur un item, où l'on veut que seul cet item soit sélectionné.
   */ selectOnly: (id)=>set(()=>({
                    selection: {
                        roots: new Set([
                            id
                        ]),
                        excluded: new Set(),
                        anchorId: id
                    }
                })),
        /**
   * Sélectionne une plage d'items
   * @param ids 
   * @returns void
   * @description Cette méthode est utilisée pour les sélections en range avec shift+click. 
   * Elle ajoute tous les ids de la plage à la sélection (roots) et met à jour l'anchorId avec le dernier id de la plage.
   */ selectRange: (ids)=>set((state)=>{
                if (!ids.length) return state;
                const nextRoots = new Set(state.selection.roots);
                for (const id of ids){
                    nextRoots.add(id);
                }
                return {
                    selection: {
                        ...state.selection,
                        roots: nextRoots,
                        anchorId: ids[ids.length - 1] ?? state.selection.anchorId
                    }
                };
            }),
        /**
   * Exclut un item de la sélection (utilisé pour les sélections en range avec shift+click pour exclure certains items du range)
   * @param id 
   * @returns void
   */ excludeItem: (id)=>set((state)=>{
                const nextExcluded = new Set(state.selection.excluded);
                nextExcluded.add(id);
                return {
                    selection: {
                        ...state.selection,
                        excluded: nextExcluded
                    }
                };
            }),
        /**
   * Clear la sélection (utilisé par exemple après une action de déplacement ou suppression pour éviter que des items sélectionnés soient dans un état incohérent)
   * @returns void
   */ clearSelection: ()=>set(()=>({
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    }
                })),
        /* ----------------------------- MULTI-SELECT ----------------------------- */ multiSelectActive: false,
        /**
   * Entre en mode multi-select et amorce la sélection avec `firstId`.
   *
   * On sélectionne immédiatement l'item à l'origine du long-press : c'est
   * conforme à l'attente de l'utilisateur ("j'ai appuyé sur cet item, il
   * doit être sélectionné") et ça donne aussi un anchor pour shift+click
   * dans la foulée.
   */ enterMultiSelect: (firstId)=>set(()=>({
                    multiSelectActive: true,
                    selection: {
                        roots: new Set([
                            firstId
                        ]),
                        excluded: new Set(),
                        anchorId: firstId
                    }
                })),
        /**
   * Sort du mode multi-select et vide la sélection.
   *
   * Câblé sur le bouton "Tout désélectionner" de la toolbar. On a fait le
   * choix de ne pas garder le mode actif avec une sélection vide : ça évite
   * un état "checkboxes partout, rien de coché" qu'on jugerait désorientant.
   */ exitMultiSelect: ()=>set(()=>({
                    multiSelectActive: false,
                    selection: {
                        roots: new Set(),
                        excluded: new Set(),
                        anchorId: null
                    }
                })),
        /* ------------------------------ VIEW MODE ------------------------------- */ viewMode: loadViewMode(),
        setViewMode: (mode)=>{
            saveViewMode(mode);
            set({
                viewMode: mode
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/state/useTrashStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTrashStore",
    ()=>useTrashStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.8_@types+react@19.2.2_react@19.2.0_use-sync-external-store@1.6.0_react@19.2.0_/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const VIEW_MODE_STORAGE_KEY = 'akfc:trash:view-mode';
function loadViewMode() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (saved === 'grid' || saved === 'table' || saved === 'compact') {
            return saved;
        }
    } catch  {
    // mode privé / quota — on ignore
    }
    return 'grid';
}
function saveViewMode(mode) {
    try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch  {
    // idem
    }
}
const useTrashStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$8_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0_use$2d$sync$2d$external$2d$store$40$1$2e$6$2e$0_react$40$19$2e$2$2e$0_$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        selectedIds: new Set(),
        viewMode: loadViewMode(),
        drilldown: null,
        search: '',
        toggleSelected: (id)=>set((state)=>{
                const next = new Set(state.selectedIds);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return {
                    selectedIds: next
                };
            }),
        selectOnly: (id)=>set({
                selectedIds: new Set([
                    id
                ])
            }),
        selectAll: (ids)=>set({
                selectedIds: new Set(ids)
            }),
        clearSelection: ()=>set({
                selectedIds: new Set()
            }),
        setViewMode: (mode)=>{
            saveViewMode(mode);
            set({
                viewMode: mode
            });
        },
        enterDrilldown: (trashId, displayName)=>// À l'entrée d'un drill-down on clear la sélection — la sélection s'applique
            // à la vue plate racine et n'a pas de sens à l'intérieur d'une entrée.
            set({
                drilldown: {
                    trashId,
                    displayName,
                    relativePath: ''
                },
                selectedIds: new Set()
            }),
        navigateInsideDrilldown: (relativePath)=>set((state)=>state.drilldown ? {
                    drilldown: {
                        ...state.drilldown,
                        relativePath
                    }
                } : state),
        exitDrilldown: ()=>set({
                drilldown: null
            }),
        setSearch: (search)=>set({
                search,
                selectedIds: new Set()
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrashEntryGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
'use client';
;
;
function TrashEntryGrid({ entry, selected, onClick, onDoubleClick }) {
    const isFolder = entry.kind === 'folder';
    const Icon = isFolder ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        className: `
        relative aspect-square rounded-lg border bg-white overflow-hidden
        cursor-pointer select-none p-2
        flex flex-col items-center justify-center gap-2
        transition-shadow
        ${selected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'hover:shadow-md hover:border-gray-300'}
      `,
        title: entry.previousPath,
        role: "button",
        "aria-pressed": selected,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: `h-12 w-12 ${isFolder ? 'text-blue-400' : 'text-gray-400'}`,
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-center truncate w-full px-1",
                title: entry.displayName,
                children: entry.displayName
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[10px] text-gray-400 truncate w-full text-center px-1",
                children: entry.previousPathShort
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = TrashEntryGrid;
var _c;
__turbopack_context__.k.register(_c, "TrashEntryGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrashEntryTableRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
'use client';
;
;
function TrashEntryTableRow({ entry, selected, onClick, onDoubleClick }) {
    const isFolder = entry.kind === 'folder';
    const Icon = isFolder ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        className: `
        cursor-pointer
        ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "checkbox",
                    checked: selected,
                    onChange: onClick,
                    onClick: (e)=>e.stopPropagation(),
                    className: "h-4 w-4",
                    "aria-label": `Sélectionner ${entry.displayName}`
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: `h-4 w-4 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
                    strokeWidth: 1.5
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm font-medium text-gray-900",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "truncate max-w-[200px]",
                    title: entry.displayName,
                    children: entry.displayName
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "truncate max-w-[300px]",
                    title: entry.previousPath,
                    children: entry.previousPathShort
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500 whitespace-nowrap",
                children: formatDate(entry.trashedAt)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap",
                children: entry.sizeBytes !== undefined ? formatBytes(entry.sizeBytes) : '—'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_c = TrashEntryTableRow;
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch  {
        return iso;
    }
}
var _c;
__turbopack_context__.k.register(_c, "TrashEntryTableRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrashEntryCompactRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
'use client';
;
;
function TrashEntryCompactRow({ entry, selected, onClick, onDoubleClick }) {
    const isFolder = entry.kind === 'folder';
    const Icon = isFolder ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onClick,
        onDoubleClick: onDoubleClick,
        className: `
        cursor-pointer select-none
        flex items-center gap-3 px-3 py-1.5
        border-b border-gray-100 last:border-b-0
        ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `,
        role: "button",
        "aria-pressed": selected,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: `h-4 w-4 shrink-0 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium text-gray-900 truncate min-w-0 max-w-[40%]",
                title: entry.displayName,
                children: entry.displayName
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-gray-400 truncate flex-1 min-w-0",
                title: entry.previousPath,
                children: entry.previousPathShort
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-gray-400 shrink-0 whitespace-nowrap",
                children: formatRelativeDate(entry.trashedAt)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = TrashEntryCompactRow;
function formatRelativeDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short'
        });
    } catch  {
        return iso;
    }
}
var _c;
__turbopack_context__.k.register(_c, "TrashEntryCompactRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ViewModeSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rows-3.js [app-client] (ecmascript) <export default as Rows3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/state/useTrashStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const OPTIONS = [
    {
        mode: 'grid',
        label: 'Grille',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"]
    },
    {
        mode: 'table',
        label: 'Tableau',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__["Rows3"]
    },
    {
        mode: 'compact',
        label: 'Liste compacte',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"]
    }
];
function ViewModeSwitcher() {
    _s();
    const viewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "ViewModeSwitcher.useTrashStore[viewMode]": (s)=>s.viewMode
    }["ViewModeSwitcher.useTrashStore[viewMode]"]);
    const setViewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "ViewModeSwitcher.useTrashStore[setViewMode]": (s)=>s.setViewMode
    }["ViewModeSwitcher.useTrashStore[setViewMode]"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inline-flex items-center gap-0.5 border rounded p-0.5",
        children: OPTIONS.map(({ mode, label, Icon })=>{
            const active = mode === viewMode;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx",
                    lineNumber: 52,
                    columnNumber: 13
                }, this)
            }, mode, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx",
                lineNumber: 36,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(ViewModeSwitcher, "EKSZOVn36qpEUzB9DOH+mX8Kxwo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"]
    ];
});
_c = ViewModeSwitcher;
var _c;
__turbopack_context__.k.register(_c, "ViewModeSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/hooks/useTrashActions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTrashActions",
    ()=>useTrashActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useTrashActions() {
    _s();
    const utils = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].useUtils();
    const restoreMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].trash.restoreFromBin.useMutation({
        onSuccess: {
            "useTrashActions.useMutation[restoreMutation]": ()=>{
                utils.trash.listBin.invalidate();
            }
        }["useTrashActions.useMutation[restoreMutation]"]
    });
    const deleteMutation = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].trash.deleteForever.useMutation({
        onSuccess: {
            "useTrashActions.useMutation[deleteMutation]": ()=>{
                utils.trash.listBin.invalidate();
            }
        }["useTrashActions.useMutation[deleteMutation]"]
    });
    // Note : on n'a pas vu de procédure trash.emptyBin explicite dans le router.
    // On l'implémente côté front comme un deleteForever sur tous les ids visibles
    // — le backend acceptera la liste complète. Si une vraie procédure emptyBin
    // est ajoutée plus tard, on basculera dessus.
    return {
        restore: async (ids)=>{
            if (ids.length === 0) return;
            await restoreMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
                ids
            });
        },
        deleteForever: async (ids)=>{
            if (ids.length === 0) return;
            await deleteMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
                ids
            });
        },
        emptyBin: async ()=>{
            // On lit tous les ids actuellement en corbeille via la query courante.
            // Si la query n'est pas en cache, on la force.
            const data = await utils.trash.listBin.fetch({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
                limit: 1000
            });
            const allIds = data.items.map((entry)=>entry.id);
            if (allIds.length === 0) return;
            await deleteMutation.mutateAsync({
                appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
                ids: allIds
            });
        },
        isRestoring: restoreMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isEmptying: deleteMutation.isPending
    };
}
_s(useTrashActions, "ug6zl8QQsMeRIiSbNX7MVTpeZ+0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].useUtils
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', destructive = false, requireTypedConfirmation, onConfirm, onCancel }) {
    _s();
    const [typedValue, setTypedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Reset l'input à chaque ouverture
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConfirmDialog.useEffect": ()=>{
            if (open) setTypedValue('');
        }
    }["ConfirmDialog.useEffect"], [
        open
    ]);
    // Échap pour annuler
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConfirmDialog.useEffect": ()=>{
            if (!open) return;
            const onKeyDown = {
                "ConfirmDialog.useEffect.onKeyDown": (e)=>{
                    if (e.key === 'Escape') onCancel();
                }
            }["ConfirmDialog.useEffect.onKeyDown"];
            window.addEventListener('keydown', onKeyDown);
            return ({
                "ConfirmDialog.useEffect": ()=>window.removeEventListener('keydown', onKeyDown)
            })["ConfirmDialog.useEffect"];
        }
    }["ConfirmDialog.useEffect"], [
        open,
        onCancel
    ]);
    if (!open) return null;
    const canConfirm = requireTypedConfirmation ? typedValue.trim() === requireTypedConfirmation : true;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
        onClick: onCancel,
        role: "presentation",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4",
            onClick: (e)=>e.stopPropagation(),
            role: "dialog",
            "aria-labelledby": "confirm-title",
            "aria-describedby": "confirm-desc",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                destructive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "h-5 w-5 text-red-600 shrink-0 mt-0.5",
                                    "aria-hidden": true
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                                    lineNumber: 89,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: "confirm-title",
                                    className: "text-lg font-semibold",
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onCancel,
                            className: "text-gray-400 hover:text-gray-600 transition-colors",
                            "aria-label": "Fermer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    id: "confirm-desc",
                    className: "text-sm text-gray-600",
                    children: description
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                requireTypedConfirmation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-sm text-gray-700",
                            children: [
                                "Tape ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                    className: "bg-gray-100 px-1.5 py-0.5 rounded text-red-700 font-mono",
                                    children: requireTypedConfirmation
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                                    lineNumber: 112,
                                    columnNumber: 20
                                }, this),
                                " pour confirmer :"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: typedValue,
                            onChange: (e)=>setTypedValue(e.target.value),
                            className: "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400",
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                    lineNumber: 110,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onCancel,
                            className: "px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors",
                            children: cancelLabel
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onConfirm,
                            disabled: !canConfirm,
                            className: `px-4 py-2 text-sm rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`,
                            children: confirmLabel
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
                    lineNumber: 124,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
            lineNumber: 79,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(ConfirmDialog, "6UCbLMK+Zgo+tlIvDrJ5KuoqRpA=");
_c = ConfirmDialog;
var _c;
__turbopack_context__.k.register(_c, "ConfirmDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrashToolbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/state/useTrashStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/hooks/useTrashActions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function TrashToolbar() {
    _s();
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "TrashToolbar.useTrashStore[selectedIds]": (s)=>s.selectedIds
    }["TrashToolbar.useTrashStore[selectedIds]"]);
    const clearSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "TrashToolbar.useTrashStore[clearSelection]": (s)=>s.clearSelection
    }["TrashToolbar.useTrashStore[clearSelection]"]);
    const { restore, deleteForever, isRestoring, isDeleting } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashActions"])();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (selectedIds.size === 0) return null;
    const ids = Array.from(selectedIds);
    const count = ids.length;
    async function handleRestore() {
        await restore(ids);
        clearSelection();
    }
    async function handleDeleteConfirmed() {
        setConfirmDeleteOpen(false);
        await deleteForever(ids);
        clearSelection();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: " flex items-center gap-3 px-3 py-2 bg-blue-50 border-b border-blue-200 text-sm ",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: clearSelection,
                        className: "text-blue-600 hover:text-blue-800 transition-colors",
                        "aria-label": "Effacer la sélection",
                        title: "Effacer la sélection",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium text-blue-900",
                        children: [
                            count,
                            " ",
                            count > 1 ? 'éléments sélectionnés' : 'élément sélectionné'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleRestore,
                        disabled: isRestoring,
                        className: " flex items-center gap-1.5 px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            isRestoring ? 'Restauration...' : 'Restaurer'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setConfirmDeleteOpen(true),
                        disabled: isDeleting,
                        className: " flex items-center gap-1.5 px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            isDeleting ? 'Suppression...' : 'Supprimer définitivement'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: confirmDeleteOpen,
                title: "Suppression définitive",
                description: `Voulez-vous vraiment supprimer définitivement ${count} élément${count > 1 ? 's' : ''} ? Cette action est irréversible.`,
                confirmLabel: "Supprimer définitivement",
                destructive: true,
                onConfirm: handleDeleteConfirmed,
                onCancel: ()=>setConfirmDeleteOpen(false)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(TrashToolbar, "+rZc3JTYI6LWy/V+U3wkq3RiQ/w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashActions"]
    ];
});
_c = TrashToolbar;
var _c;
__turbopack_context__.k.register(_c, "TrashToolbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmptyBinButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/hooks/useTrashActions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/ConfirmDialog.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function EmptyBinButton({ totalCount }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { emptyBin, isEmptying } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashActions"])();
    async function handleConfirmed() {
        setOpen(false);
        await emptyBin();
    }
    const disabled = totalCount === 0 || isEmptying;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen(true),
                disabled: disabled,
                className: " flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-white border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ",
                title: totalCount === 0 ? 'La corbeille est déjà vide' : 'Supprimer définitivement tout le contenu de la corbeille',
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    "Vider la corbeille"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ConfirmDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: open,
                title: "Vider la corbeille",
                description: `Cette action va supprimer définitivement les ${totalCount} éléments de la corbeille. Cette opération est irréversible.`,
                confirmLabel: "Vider définitivement",
                destructive: true,
                requireTypedConfirmation: "supprimer",
                onConfirm: handleConfirmed,
                onCancel: ()=>setOpen(false)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(EmptyBinButton, "Q0NmZI20Xo5lh1bL7+meHqY18Bo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$hooks$2f$useTrashActions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashActions"]
    ];
});
_c = EmptyBinButton;
var _c;
__turbopack_context__.k.register(_c, "EmptyBinButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderBinRootView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/state/useTrashStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryTableRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryTableRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryCompactRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashEntryCompactRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ViewModeSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/ViewModeSwitcher.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/TrashToolbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$EmptyBinButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/trash-view/components/EmptyBinButton.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
function FinderBinRootView() {
    _s();
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderBinRootView.useFinderStore[setPath]": (s)=>s.setPath
    }["FinderBinRootView.useFinderStore[setPath]"]);
    const viewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "FinderBinRootView.useTrashStore[viewMode]": (s)=>s.viewMode
    }["FinderBinRootView.useTrashStore[viewMode]"]);
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "FinderBinRootView.useTrashStore[selectedIds]": (s)=>s.selectedIds
    }["FinderBinRootView.useTrashStore[selectedIds]"]);
    const toggleSelected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"])({
        "FinderBinRootView.useTrashStore[toggleSelected]": (s)=>s.toggleSelected
    }["FinderBinRootView.useTrashStore[toggleSelected]"]);
    const { data, isLoading, isError } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].trash.listBin.useQuery({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
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
            setPath(`${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin/.trash/${entry.id}`);
        }
    // Pour les files : pas de navigation. Sélection seule (déjà faite via onClick).
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full min-h-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-b flex items-center gap-3 flex-wrap text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$ViewModeSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$EmptyBinButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center text-gray-400 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "h-5 w-5 animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex items-center justify-center text-red-600 text-sm",
                children: "Erreur lors du chargement de la corbeille."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                lineNumber: 129,
                columnNumber: 9
            }, this);
        }
        if (entries.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full flex flex-col items-center justify-center text-gray-400 gap-2 text-center px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "h-10 w-10 opacity-50",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))] p-4",
                children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm border-collapse",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left w-8"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left w-8"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 167,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Nom"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Chemin d'origine"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 169,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left",
                                        children: "Supprimé le"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx",
                                        lineNumber: 170,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-gray-100",
                            children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryTableRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white",
            children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$components$2f$TrashEntryCompactRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_s(FinderBinRootView, "Av4byaIjpRNy43FVOSsbr1dJXdc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$trash$2d$view$2f$state$2f$useTrashStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashStore"]
    ];
});
_c = FinderBinRootView;
var _c;
__turbopack_context__.k.register(_c, "FinderBinRootView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderViewModeSwitcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/rows-3.js [app-client] (ecmascript) <export default as Rows3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const OPTIONS = [
    {
        mode: 'grid',
        label: 'Grille',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"]
    },
    {
        mode: 'table',
        label: 'Tableau',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rows$2d$3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rows3$3e$__["Rows3"]
    },
    {
        mode: 'compact',
        label: 'Liste compacte',
        Icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"]
    }
];
function FinderViewModeSwitcher() {
    _s();
    const viewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderViewModeSwitcher.useFinderStore[viewMode]": (s)=>s.viewMode
    }["FinderViewModeSwitcher.useFinderStore[viewMode]"]);
    const setViewMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderViewModeSwitcher.useFinderStore[setViewMode]": (s)=>s.setViewMode
    }["FinderViewModeSwitcher.useFinderStore[setViewMode]"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inline-flex items-center gap-0.5 border rounded p-0.5",
        children: OPTIONS.map(({ mode, label, Icon })=>{
            const active = mode === viewMode;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
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
_s(FinderViewModeSwitcher, "v+DcjKGzYm/Q9F1WvOGu+JZkgdM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
_c = FinderViewModeSwitcher;
var _c;
__turbopack_context__.k.register(_c, "FinderViewModeSwitcher");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLongPress",
    ()=>useLongPress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useLongPress(onLongPress, delay = 1500) {
    _s();
    // Référence au timer en cours (null si aucun timer actif).
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Référence à la fonction qui détache les listeners window. On garde
    // cette indirection pour pouvoir annuler proprement depuis n'importe
    // quel chemin (cancel direct, déclenchement du callback, etc.).
    const cleanupWindowListenersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
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
        timerRef.current = window.setTimeout(()=>{
            // Le callback est sur le point d'être déclenché : on nettoie les
            // listeners window avant, pour éviter d'annuler le mode qu'on
            // vient juste d'activer (ex: le mouseup qui suit immédiatement).
            timerRef.current = null;
            if (cleanupWindowListenersRef.current) {
                cleanupWindowListenersRef.current();
                cleanupWindowListenersRef.current = null;
            }
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
        onDragStart: cancel
    };
}
_s(useLongPress, "ezWZ6XBJin7hgp9iMLHweuGsUrY=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTableRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-play.js [app-client] (ecmascript) <export default as FileVideo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-headphone.js [app-client] (ecmascript) <export default as FileAudio>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-type.js [app-client] (ecmascript) <export default as FileType>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function FinderTableRow({ node, isSelected, multiSelectActive, onClick, onDoubleClick, onLongPress, onDragStart }) {
    _s();
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"])(onLongPress);
    const isFolder = node.type === 'folder';
    const Icon = pickIcon(node);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
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
            multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-2 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-2 py-2 w-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm font-medium text-gray-900",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "px-3 py-2 text-sm text-gray-500 whitespace-nowrap",
                children: isFolder ? 'Dossier' : node.mimeType || node.meta?.format || 'Fichier'
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
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
_s(FinderTableRow, "/V6f1oaorov9bX3NsCGF8yc/U84=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"]
    ];
});
_c = FinderTableRow;
function pickIcon(node) {
    if (node.type === 'folder') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"];
    const kind = node.meta?.kind;
    if (kind === 'image') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"];
    if (kind === 'video') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__["FileVideo"];
    if (kind === 'document') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    if (node.mimeType?.startsWith('audio/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__["FileAudio"];
    if (node.mimeType?.startsWith('text/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__["FileType"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
}
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
var _c;
__turbopack_context__.k.register(_c, "FinderTableRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderCompactRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-play.js [app-client] (ecmascript) <export default as FileVideo>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-headphone.js [app-client] (ecmascript) <export default as FileAudio>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-type.js [app-client] (ecmascript) <export default as FileType>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function FinderCompactRow({ node, isSelected, multiSelectActive, onClick, onDoubleClick, onLongPress, onDragStart }) {
    _s();
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"])(onLongPress);
    const isFolder = node.type === 'folder';
    const Icon = pickIcon(node);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: `h-4 w-4 shrink-0 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm font-medium text-gray-900 truncate min-w-0 flex-1",
                title: node.name,
                children: node.name
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_s(FinderCompactRow, "/V6f1oaorov9bX3NsCGF8yc/U84=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"]
    ];
});
_c = FinderCompactRow;
function pickIcon(node) {
    if (node.type === 'folder') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"];
    const kind = node.meta?.kind;
    if (kind === 'image') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"];
    if (kind === 'video') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileVideo$3e$__["FileVideo"];
    if (kind === 'document') return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    if (node.mimeType?.startsWith('audio/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$headphone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileAudio$3e$__["FileAudio"];
    if (node.mimeType?.startsWith('text/')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileType$3e$__["FileType"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
}
function formatBytes(bytes) {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}
var _c;
__turbopack_context__.k.register(_c, "FinderCompactRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useFinderData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFinderData",
    ()=>useFinderData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useFinderData(adapter) {
    _s();
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "useFinderData.useFinderStore[currentPath]": (state)=>state.currentPath
    }["useFinderData.useFinderStore[currentPath]"]);
    const setContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "useFinderData.useFinderStore[setContent]": (state)=>state.setContent
    }["useFinderData.useFinderStore[setContent]"]);
    const reloadKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "useFinderData.useFinderStore[reloadKey]": (state)=>state.reloadKey
    }["useFinderData.useFinderStore[reloadKey]"]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useFinderData.useEffect": ()=>{
            let cancelled = false;
            // Lecture imperative du cache : on évite de subscribe à `contentCache`
            // pour ne pas re-déclencher cet effect à chaque mutation du cache (qui
            // créerait des boucles infinies). On lit l'état actuel à T0 et c'est
            // suffisant — un nouveau changement de `currentPath` re-évaluera.
            const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(currentPath);
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
            ({
                "useFinderData.useEffect": async ()=>{
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
                }
            })["useFinderData.useEffect"]();
            return ({
                "useFinderData.useEffect": ()=>{
                    cancelled = true;
                }
            })["useFinderData.useEffect"];
        }
    }["useFinderData.useEffect"], [
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
_s(useFinderData, "/+GJFX4dTxMReO+qHbw30dsTw9E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/utils/path.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Breadcrumb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/path.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Breadcrumb() {
    _s();
    const { currentPath, setPath } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])();
    const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPathSegments"])(currentPath);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "flex items-center gap-1 text-sm flex-wrap",
        "aria-label": "Fil d'Ariane",
        children: segments.map((segment, index)=>{
            const isLast = index === segments.length - 1;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1",
                children: [
                    isLast ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium text-gray-900 truncate max-w-[200px]",
                        title: segment.name,
                        "aria-current": "page",
                        children: segment.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 38,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setPath(segment.path),
                        className: " text-gray-600 hover:text-gray-900 hover:underline truncate max-w-[200px] rounded-sm px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                        title: segment.name,
                        children: segment.name
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 46,
                        columnNumber: 15
                    }, this),
                    !isLast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                        className: "h-3.5 w-3.5 text-gray-400 shrink-0",
                        "aria-hidden": true
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                        lineNumber: 63,
                        columnNumber: 15
                    }, this)
                ]
            }, segment.path, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
                lineNumber: 36,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(Breadcrumb, "RDZczJJgnsZYwEU1+l82mCEKaqM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
_c = Breadcrumb;
var _c;
__turbopack_context__.k.register(_c, "Breadcrumb");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useNodeMetadata.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNodeMetadata",
    ()=>useNodeMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useNodeMetadata(adapter, path) {
    _s();
    const [metadata, setMetadata] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNodeMetadata.useEffect": ()=>{
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
            return ({
                "useNodeMetadata.useEffect": ()=>{
                    cancelled = true;
                }
            })["useNodeMetadata.useEffect"];
        }
    }["useNodeMetadata.useEffect"], [
        adapter,
        path
    ]);
    return {
        metadata,
        loading,
        error
    };
}
_s(useNodeMetadata, "5JXiYJkoorIuWk0wwL4nzS4xPOk=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/hooks/useNodeTextContent.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNodeTextContent",
    ()=>useNodeTextContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const DEFAULT_MAX_BYTES = 200_000;
function useNodeTextContent(url, options) {
    _s();
    const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [truncated, setTruncated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNodeTextContent.useEffect": ()=>{
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
            return ({
                "useNodeTextContent.useEffect": ()=>{
                    cancelled = true;
                    controller.abort();
                }
            })["useNodeTextContent.useEffect"];
        }
    }["useNodeTextContent.useEffect"], [
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
_s(useNodeTextContent, "cPIcD4Z3N7MKxL3PgYu+S87AkCM=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/utils/formatBytes.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/utils/formatDate.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PreviewPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-markdown@10.1.0_@types+react@19.2.2_react@19.2.0/node_modules/react-markdown/lib/index.js [app-client] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-search.js [app-client] (ecmascript) <export default as FileSearch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/files.js [app-client] (ecmascript) <export default as Files>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file-exclamation-point.js [app-client] (ecmascript) <export default as FileWarning>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeMetadata$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeMetadata.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useNodeTextContent.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/resolveSelection.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatBytes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/formatBytes.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/formatDate.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
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
    'm4a',
    'flac'
]);
const TEXT_FORMATS = new Set([
    'txt'
]);
const MARKDOWN_FORMATS = new Set([
    'md',
    'markdown'
]);
/**
 * Détermine quel renderer utiliser pour un fichier donné.
 *
 * On combine deux sources d'information :
 *   - `file.meta.kind` : posé par l'adapter, fiable pour image/video.
 *   - `file.meta.format` ou `metadata.format` : extension/format technique,
 *     nécessaire pour distinguer pdf/audio/txt/md à l'intérieur du kind
 *     'document' (que le contrat ne subdivise pas).
 *
 * Priorité au `kind` quand il est explicite (image/video), puis au `format`.
 */ function getPreviewKind(file, metadata) {
    if (file.meta?.kind === 'image') return 'image';
    if (file.meta?.kind === 'video') return 'video';
    const format = (file.meta?.format ?? metadata?.format ?? '').toLowerCase();
    if (format === 'pdf') return 'pdf';
    if (AUDIO_FORMATS.has(format)) return 'audio';
    if (MARKDOWN_FORMATS.has(format)) return 'markdown';
    if (TEXT_FORMATS.has(format)) return 'text';
    return 'unsupported';
}
function PreviewPanel({ adapter }) {
    _s();
    const { selection, files } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])();
    const allItems = files.map((f)=>({
            id: f.id,
            path: f.path
        }));
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$resolveSelection$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveSelection"])({
        items: allItems,
        roots: selection.roots,
        excluded: selection.excluded
    });
    const ids = Array.from(resolved);
    const file = ids.length === 1 ? files.find((f)=>f.id === ids[0]) ?? null : null;
    // Hook metadata : appelé inconditionnellement (rules of hooks).
    // Le `path: null` quand pas de single-selection court-circuite le fetch.
    const { metadata, loading: metadataLoading, error: metadataError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeMetadata$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeMetadata"])(adapter, file?.path ?? null);
    /* ------------------------------ EMPTY STATE ----------------------------- */ if (ids.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSearch$3e$__["FileSearch"], {
                    className: "h-10 w-10 opacity-50",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm",
                    children: [
                        "Sélectionnez un fichier",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 109,
                            columnNumber: 34
                        }, this),
                        "pour le prévisualiser"
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 106,
            columnNumber: 7
        }, this);
    }
    /* ---------------------------- MULTI-SELECTION --------------------------- */ if (ids.length > 1) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$files$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Files$3e$__["Files"], {
                    className: "h-10 w-10 opacity-60 text-gray-400",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-base font-medium text-gray-700",
                    children: [
                        ids.length,
                        " éléments sélectionnés"
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm text-gray-400",
                    children: "Aperçu multiple non disponible"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 119,
            columnNumber: 7
        }, this);
    }
    /* -------------------------- SINGLE BUT NOT FOUND ------------------------ */ // Cas marginal : la sélection référence un id qui n'est plus dans `files`
    // (ex: race entre un drop qui rafraîchit et le store de sélection).
    if (!file) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex flex-col items-center justify-center text-red-400 gap-3 p-6 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$exclamation$2d$point$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileWarning$3e$__["FileWarning"], {
                    className: "h-10 w-10 opacity-60",
                    "aria-hidden": true
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm",
                    children: "Aperçu indisponible"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 135,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 133,
            columnNumber: 7
        }, this);
    }
    /* -------------------------- SINGLE FILE PREVIEW ------------------------- */ const kind = getPreviewKind(file, metadata);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 h-full flex flex-col gap-4 overflow-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm font-medium truncate",
                title: file.name,
                children: file.name
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewRenderer, {
                file: file,
                kind: kind
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            adapter.getMetadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetadataBlock, {
                metadata: metadata,
                loading: metadataLoading,
                error: metadataError
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 156,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400 break-all select-text",
                children: file.path
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 145,
        columnNumber: 5
    }, this);
}
_s(PreviewPanel, "yOiMOxbkg/NljG4t+g9TCXeWu+A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeMetadata$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeMetadata"]
    ];
});
_c = PreviewPanel;
/* -------------------------------------------------------------------------- */ /*                            PREVIEW RENDERER                                */ /* -------------------------------------------------------------------------- */ /**
 * Dispatcher du renderer principal selon le kind détecté.
 *
 * Chaque branche est minimale et autonome. Les renderers async (text,
 * markdown) ont besoin de leur propre cycle de fetch et sont donc
 * extraits en sous-composants pour bénéficier de leur propre `useEffect`.
 */ function PreviewRenderer({ file, kind }) {
    const url = file.meta?.url;
    if (!url) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
            message: "Pas de preview disponible"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 192,
            columnNumber: 12
        }, this);
    }
    switch(kind){
        case 'image':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: url,
                alt: file.name,
                className: "max-h-[300px] object-contain rounded border"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 198,
                columnNumber: 9
            }, this);
        case 'video':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                src: url,
                controls: true,
                className: "max-h-[300px] rounded border w-full"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 207,
                columnNumber: 9
            }, this);
        case 'audio':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                src: url,
                controls: true,
                className: "w-full"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 216,
                columnNumber: 9
            }, this);
        case 'pdf':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: url,
                title: file.name,
                // Hauteur fixe : la sidebar n'a pas une hauteur garantie suffisante
                // pour un PDF, on impose une fenêtre confortable avec scroll interne.
                className: "w-full h-[400px] rounded border"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 225,
                columnNumber: 9
            }, this);
        case 'text':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TextPreview, {
                url: url
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 235,
                columnNumber: 14
            }, this);
        case 'markdown':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkdownPreview, {
                url: url
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 238,
                columnNumber: 14
            }, this);
        case 'unsupported':
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
                message: "Aperçu non supporté pour ce format"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 242,
                columnNumber: 14
            }, this);
    }
}
_c1 = PreviewRenderer;
function PreviewEmpty({ message }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-gray-400 text-sm italic",
        children: message
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 247,
        columnNumber: 10
    }, this);
}
_c2 = PreviewEmpty;
/* -------------------------------------------------------------------------- */ /*                         TEXT / MARKDOWN PREVIEWS                           */ /* -------------------------------------------------------------------------- */ /**
 * Preview de fichier texte brut (.txt).
 *
 * Le contenu est fetché via `useNodeTextContent`, tronqué si trop gros,
 * et affiché dans un `<pre>` avec scroll interne (pour ne pas exploser
 * la hauteur de la sidebar).
 */ function TextPreview({ url }) {
    _s1();
    const { content, loading, error, truncated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeTextContent"])(url);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Chargement…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 264,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Impossible de charger le fichier"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 265,
        columnNumber: 21
    }, this);
    if (content === null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Fichier vide"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 266,
        columnNumber: 32
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-xs whitespace-pre-wrap break-words",
                children: content
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this),
            truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-gray-400 italic",
                children: "Aperçu tronqué — fichier trop volumineux pour un affichage complet."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 274,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 269,
        columnNumber: 5
    }, this);
}
_s1(TextPreview, "w2oyQFugjLkWEA2cbm2xDO5o27g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeTextContent"]
    ];
});
_c3 = TextPreview;
/**
 * Preview markdown rendu en HTML via `react-markdown`.
 *
 * Sécurité : `react-markdown` ne passe PAS le HTML inline du markdown
 * par défaut (`skipHtml` est false mais `rehype-raw` n'est pas activé).
 * On est donc protégé contre l'injection de balises arbitraires depuis
 * un .md hostile — pas besoin de DOMPurify.
 *
 * Les classes `prose` de Tailwind Typography ne sont pas activées dans
 * le projet ; on stylise minimalement à la main pour rester sobre.
 */ function MarkdownPreview({ url }) {
    _s2();
    const { content, loading, error, truncated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeTextContent"])(url);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Chargement…"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 296,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Impossible de charger le fichier"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 297,
        columnNumber: 21
    }, this);
    if (content === null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PreviewEmpty, {
        message: "Fichier vide"
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 298,
        columnNumber: 32
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-sm markdown-preview",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$markdown$40$10$2e$1$2e$0_$40$types$2b$react$40$19$2e$2$2e$2_react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
                    children: content
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            truncated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-gray-400 italic",
                children: "Aperçu tronqué — fichier trop volumineux pour un affichage complet."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                lineNumber: 306,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 301,
        columnNumber: 5
    }, this);
}
_s2(MarkdownPreview, "w2oyQFugjLkWEA2cbm2xDO5o27g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useNodeTextContent$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNodeTextContent"]
    ];
});
_c4 = MarkdownPreview;
/* -------------------------------------------------------------------------- */ /*                              METADATA BLOCK                                */ /* -------------------------------------------------------------------------- */ /**
 * Affiche les métadonnées riches en grid 2 colonnes (label : valeur).
 *
 * Comportement par état :
 *   - loading        → "Chargement…" muted
 *   - error          → "Métadonnées indisponibles" muted (silencieux)
 *   - metadata null  → "Métadonnées indisponibles" muted
 *   - metadata vide  → on n'affiche pas le bloc (toutes les valeurs absentes)
 *   - metadata présentes → tableau des champs renseignés uniquement
 */ function MetadataBlock({ metadata, loading, error }) {
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-gray-100 pt-3 text-xs text-gray-400",
            children: "Chargement…"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 339,
            columnNumber: 7
        }, this);
    }
    if (error || metadata === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border-t border-gray-100 pt-3 text-xs text-gray-400 italic",
            children: "Métadonnées indisponibles"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 347,
            columnNumber: 7
        }, this);
    }
    // Construction de la liste des paires (label, value), en filtrant
    // celles qui n'ont pas de valeur. Si tout est vide, on n'affiche rien.
    const rows = [];
    if (metadata.format) rows.push({
        label: 'Format',
        value: metadata.format
    });
    if (metadata.mimeType) rows.push({
        label: 'Type MIME',
        value: metadata.mimeType
    });
    const size = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatBytes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatBytes"])(metadata.bytes);
    if (size) rows.push({
        label: 'Taille',
        value: size
    });
    const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(metadata.createdAt);
    if (created) rows.push({
        label: 'Créé le',
        value: created
    });
    const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$formatDate$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(metadata.updatedAt);
    if (updated) rows.push({
        label: 'Modifié le',
        value: updated
    });
    if (rows.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-t border-gray-100 pt-3",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs",
            children: rows.map((row)=>// On utilise un Fragment avec key sur le label : les couples
                // (label, value) sont stables et non interchangeables.
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "contents",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-500",
                            children: row.label
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 378,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-800 break-all",
                            children: row.value
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this)
                    ]
                }, row.label, true, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
                    lineNumber: 377,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
            lineNumber: 373,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx",
        lineNumber: 372,
        columnNumber: 5
    }, this);
}
_c5 = MetadataBlock;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "PreviewPanel");
__turbopack_context__.k.register(_c1, "PreviewRenderer");
__turbopack_context__.k.register(_c2, "PreviewEmpty");
__turbopack_context__.k.register(_c3, "TextPreview");
__turbopack_context__.k.register(_c4, "MarkdownPreview");
__turbopack_context__.k.register(_c5, "MetadataBlock");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrashMapProvider",
    ()=>TrashMapProvider,
    "useTrashMap",
    ()=>useTrashMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const TrashMapContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(new Map());
const TrashMapProvider = TrashMapContext.Provider;
function useTrashMap() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TrashMapContext);
}
_s(useTrashMap, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTreeFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/path.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function FinderTreeFile({ node }) {
    _s();
    const setPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFile.useFinderStore[setPath]": (s)=>s.setPath
    }["FinderTreeFile.useFinderStore[setPath]"]);
    const selectOnly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFile.useFinderStore[selectOnly]": (s)=>s.selectOnly
    }["FinderTreeFile.useFinderStore[selectOnly]"]);
    const currentPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFile.useFinderStore[currentPath]": (s)=>s.currentPath
    }["FinderTreeFile.useFinderStore[currentPath]"]);
    const selectedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFile.useFinderStore[selectedIds]": (s)=>s.selection.roots
    }["FinderTreeFile.useFinderStore[selectedIds]"]);
    const isActive = currentPath === (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parentPath"])(node.path) && selectedIds.has(node.id);
    function handleClick() {
        setPath((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parentPath"])(node.path));
        selectOnly(node.id);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: handleClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm', // Indenté de la même quantité que les sous-dossiers — on aligne
        // visuellement folders et files au même niveau hiérarchique.
        // L'absence de chevron est compensée par un padding gauche
        // équivalent à sa largeur.
        'pl-[1.625rem]', isActive && 'bg-accent text-accent-foreground font-medium', !isActive && 'hover:bg-accent/40'),
        title: node.path,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                className: "h-4 w-4 shrink-0 text-gray-400",
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "truncate",
                children: node.name
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(FinderTreeFile, "i3Jtjnhqupn4EvnTAbWMiLEfjMA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
_c = FinderTreeFile;
var _c;
__turbopack_context__.k.register(_c, "FinderTreeFile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTreeFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function FinderTreeFolder({ node, adapter, currentPath, onOpen, openPaths, onToggleOpen }) {
    _s();
    const isOpen = openPaths.has(node.path);
    const isActive = node.path === currentPath;
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
    const trashMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashMap"])();
    const inTrashStorage = node.path.includes('/.trash/') || node.path.endsWith('/.trash');
    const isTrashRootSkipNode = node.name === '.trash';
    const trashEntryForName = trashMap.get(node.name);
    /**
   * Enfants chargés à la demande lors de la première expansion.
   * - `null` : pas encore chargé
   * - tableau (même vide) : chargement terminé
   *
   * Cet état n'est utilisé QUE quand `node.children === undefined`
   * (frontière de depth de l'appel initial). Si `node.children` est
   * déjà rempli au montage, on l'utilise tel quel.
   */ const [loadedChildren, setLoadedChildren] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ─── Auto-load des enfants du `.trash` ───────────────────────────────────
   *
   * Le node `.trash` est rendu invisible (skip pur), donc l'utilisateur ne
   * peut pas cliquer dessus pour déclencher l'expansion. Or au chargement
   * initial avec `getTree({ depth: 2 })`, on a `bin > .trash` mais PAS
   * encore `bin > .trash > <uuids>` (depth 3).
   *
   * Sans ce useEffect, déplier `bin` rend les enfants de `.trash` (qui
   * deviennent les enfants visuels de `bin`) MAIS ce tableau est vide
   * tant qu'on n'a pas chargé. Donc `bin` apparaît vide même s'il y a
   * du contenu dans la corbeille.
   *
   * Solution : dès qu'on monte un `.trash` skip node, on déclenche
   * automatiquement le chargement de ses enfants via `adapter.getTree`.
   * L'utilisateur ne voit pas de spinner (puisque le node `.trash` lui-
   * même n'est pas rendu), seulement le résultat final : les uuids
   * (renommés via trashMap) apparaissent sous `bin`.
   *
   * Guard `triggeredRef` pour éviter le re-trigger en boucle au cas où le
   * `node` change de référence (mais pas son path) après un re-render.
   */ const autoLoadTriggeredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FinderTreeFolder.useEffect": ()=>{
            if (!isTrashRootSkipNode) return;
            if (autoLoadTriggeredRef.current) return;
            if (node.children && node.children.length > 0) return; // déjà chargé
            if (loadedChildren !== null) return; // déjà chargé/en cours
            if (!adapter.getTree) return;
            // Check le cache partagé : peut-être que la GridView l'a déjà chargé
            const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(node.path);
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
            }).then({
                "FinderTreeFolder.useEffect": ({ root })=>{
                    const children = root.children ?? [];
                    setLoadedChildren(children);
                    // Partage avec la GridView
                    __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt(node.path, children);
                }
            }["FinderTreeFolder.useEffect"]).catch({
                "FinderTreeFolder.useEffect": (err)=>{
                    console.error('[FinderTreeFolder] auto-load .trash failed', err);
                    setLoadError('Erreur chargement contenu corbeille');
                }
            }["FinderTreeFolder.useEffect"]).finally({
                "FinderTreeFolder.useEffect": ()=>{
                    setIsLoading(false);
                }
            }["FinderTreeFolder.useEffect"]);
        }
    }["FinderTreeFolder.useEffect"], [
        isTrashRootSkipNode,
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
   */ const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Pour rafraîchir la grille principale après un drop réussi.
    const reloadFolderContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFolder.useFinderStore[reloadFolderContent]": (s)=>s.reloadFolderContent
    }["FinderTreeFolder.useFinderStore[reloadFolderContent]"]);
    // Pour clear la sélection après un drop : les items déplacés ne sont
    // plus dans le dossier courant, garder leurs ids dans roots est incohérent
    // (et fausserait le compteur de la MultiSelectToolbar).
    const exitMultiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "FinderTreeFolder.useFinderStore[exitMultiSelect]": (s)=>s.exitMultiSelect
    }["FinderTreeFolder.useFinderStore[exitMultiSelect]"]);
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
        const cached = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().contentCache.get(node.path);
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
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt(node.path, children);
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
    function handleRowClick() {
        onOpen(node.path);
    }
    /* -------------------------------------------------------------------------- */ /*                                  DnD TARGET                                */ /* -------------------------------------------------------------------------- */ /**
   * Filtre : seuls les drags qui portent notre MIME sont acceptés.
   * Pendant `dragover`, `dataTransfer.getData()` retourne `""` pour des
   * raisons de sécurité — on ne peut tester que la présence du MIME via
   * `dataTransfer.types`. C'est suffisant pour décider d'activer ou non
   * le visuel et de `preventDefault` (nécessaire pour autoriser le drop).
   */ function isFinderDrag(e) {
        return e.dataTransfer.types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
    }
    function handleDragEnter(e) {
        if (!isFinderDrag(e)) return;
        e.preventDefault();
        setIsDragOver(true);
    }
    function handleDragOver(e) {
        if (!isFinderDrag(e)) return;
        // ⚠️ preventDefault est requis pour autoriser le drop sur cet élément.
        // Sans cet appel, onDrop ne se déclenchera jamais.
        e.preventDefault();
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
        setIsDragOver(false);
        const raw = e.dataTransfer.getData(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"]);
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tryParsePayload"])(raw);
        if (!payload) return;
        const items = payload.items;
        const targetPath = node.path;
        // Garde-fous (cf. payload.ts pour les règles précises) :
        //   - pas de drop sur soi-même ou dans un descendant → drop invalide
        //   - drop dans le parent direct → no-op silencieux, on évite le réseau
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDropAllowed"])(targetPath, items)) return;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDropEffective"])(targetPath, items)) return;
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
    if (isTrashRootSkipNode) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: effectiveChildren?.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FinderTreeFolder, {
                    node: child,
                    adapter: adapter,
                    currentPath: currentPath,
                    onOpen: onOpen,
                    openPaths: openPaths,
                    onToggleOpen: onToggleOpen
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 359,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    node: child
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 369,
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleRowClick,
                onDragEnter: handleDragEnter,
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
                // Attribut lu par le ghost manager pour calculer le badge allowed/forbidden
                // via document.elementFromPoint pendant le tracking du drag.
                "data-finder-drop-path": node.path,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer text-sm', isActive && !isDragOver && 'bg-accent text-accent-foreground font-medium', !isActive && !isDragOver && 'hover:bg-accent/40', // Surbrillance drop-target : prend le pas sur isActive pour bien signaler la cible
                isDragOver && 'bg-blue-100 ring-1 ring-blue-300'),
                title: node.path,
                children: [
                    showChevron ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleToggleOpen,
                        className: "flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground",
                        "aria-label": isOpen ? 'Replier' : 'Déplier',
                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-3.5 w-3.5 animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 423,
                            columnNumber: 15
                        }, this) : isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 425,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                            lineNumber: 427,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 416,
                        columnNumber: 11
                    }, this) : // Espacement constant pour aligner les noms quand pas de chevron
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-block h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 432,
                        columnNumber: 11
                    }, this),
                    isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                        className: "h-4 w-4 text-muted-foreground shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 437,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                        className: "h-4 w-4 text-muted-foreground shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 439,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate capitalize",
                        children: displayLabel
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 443,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 396,
                columnNumber: 7
            }, this),
            loadError && isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-3 pl-3 border-l border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-2 py-1 text-xs text-destructive",
                    children: loadError
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                    lineNumber: 449,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 448,
                columnNumber: 9
            }, this),
            isOpen && effectiveChildren && effectiveChildren.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-3 pl-3 border-l border-border",
                children: effectiveChildren.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FinderTreeFolder, {
                        node: child,
                        adapter: adapter,
                        currentPath: currentPath,
                        onOpen: onOpen,
                        openPaths: openPaths,
                        onToggleOpen: onToggleOpen
                    }, child.path, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 458,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        node: child
                    }, child.path, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                        lineNumber: 468,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
                lineNumber: 455,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx",
        lineNumber: 394,
        columnNumber: 5
    }, this);
}
_s(FinderTreeFolder, "eHMVJ8qiGhLzuiJeznLfgQnnu68=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTrashMap"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
_c = FinderTreeFolder;
var _c;
__turbopack_context__.k.register(_c, "FinderTreeFolder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/FinderTree.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinderTree
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFolder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFolder.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTreeFile.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/TrashMapContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function FinderTree({ adapter, rootPath, currentPath, onOpen }) {
    _s();
    const [rootNode, setRootNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loadError, setLoadError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [openPaths, setOpenPaths] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "FinderTree.useState": ()=>new Set()
    }["FinderTree.useState"]);
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
    const { data: trashListData } = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].trash.listBin.useQuery({
        appRoot: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"],
        limit: 100
    }, {
        refetchOnWindowFocus: false,
        staleTime: 10_000
    });
    const trashMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FinderTree.useMemo[trashMap]": ()=>{
            const map = new Map();
            const items = trashListData?.items ?? [];
            for (const entry of items){
                map.set(entry.id, {
                    displayName: entry.displayName,
                    kind: entry.kind
                });
            }
            return map;
        }
    }["FinderTree.useMemo[trashMap]"], [
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
    const prevRootPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(rootPath);
    const prevAdapter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(adapter);
    if (prevRootPath.current !== rootPath || prevAdapter.current !== adapter) {
        prevRootPath.current = rootPath;
        prevAdapter.current = adapter;
        setIsLoading(true);
        setLoadError(null);
    }
    // Chargement initial : 2 niveaux d'avance.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FinderTree.useEffect": ()=>{
            let cancelled = false;
            if (!adapter.getTree) {
                setLoadError('Adapter sans getTree — la TreeView ne peut pas s\'afficher');
                setIsLoading(false);
                return;
            }
            adapter.getTree({
                path: rootPath,
                depth: 2
            }).then({
                "FinderTree.useEffect": ({ root })=>{
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
                    const cacheChildrenAt = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"].getState().cacheChildrenAt;
                    function walk(node) {
                        if (node.type === 'folder' && node.children !== undefined) {
                            cacheChildrenAt(node.path, node.children);
                            for (const child of node.children){
                                walk(child);
                            }
                        }
                    }
                    walk(root);
                }
            }["FinderTree.useEffect"]).catch({
                "FinderTree.useEffect": (err)=>{
                    console.error('[FinderTree] getTree initial failed', err);
                    if (cancelled) return;
                    setLoadError('Erreur de chargement de l\'arborescence');
                }
            }["FinderTree.useEffect"]).finally({
                "FinderTree.useEffect": ()=>{
                    if (cancelled) return;
                    setIsLoading(false);
                }
            }["FinderTree.useEffect"]);
            return ({
                "FinderTree.useEffect": ()=>{
                    cancelled = true;
                }
            })["FinderTree.useEffect"];
        }
    }["FinderTree.useEffect"], [
        adapter,
        rootPath
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "h-3.5 w-3.5 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 181,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Chargement de l'arborescence..."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 182,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 180,
            columnNumber: 7
        }, this);
    }
    if (loadError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-2 py-2 text-sm text-destructive",
            role: "alert",
            children: loadError
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this);
    }
    if (!rootNode || !rootNode.children || rootNode.children.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-2 py-2 text-sm text-muted-foreground italic",
            children: "Aucun élément"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this);
    }
    // Choix B2 validé : on affiche les ENFANTS du rootPath directement (et
    // non le rootPath lui-même comme un nœud cliquable). Pour AKFC, ces
    // enfants sont les status-folders pending / published / bin, mais on
    // affiche aussi les éventuels fichiers présents directement à la racine.
    const topLevelChildren = rootNode.children;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$TrashMapContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TrashMapProvider"], {
        value: trashMap,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-0.5",
            children: topLevelChildren.map((child)=>child.type === 'folder' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFolder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    node: child,
                    adapter: adapter,
                    currentPath: currentPath,
                    onOpen: onOpen,
                    openPaths: openPaths,
                    onToggleOpen: toggleOpen
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 214,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTreeFile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    node: child
                }, child.path, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
                    lineNumber: 224,
                    columnNumber: 13
                }, this))
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
            lineNumber: 211,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/FinderTree.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, this);
}
_s(FinderTree, "S4qZxqCDsUQcQzub9YwpJcHONzc=");
_c = FinderTree;
var _c;
__turbopack_context__.k.register(_c, "FinderTree");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/MultiSelectToolbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MultiSelectToolbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function MultiSelectToolbar() {
    _s();
    // On souscrit champ par champ pour limiter les re-renders : seul le
    // changement du compteur ou du flag re-rend la toolbar.
    const multiSelectActive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "MultiSelectToolbar.useFinderStore[multiSelectActive]": (s)=>s.multiSelectActive
    }["MultiSelectToolbar.useFinderStore[multiSelectActive]"]);
    const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "MultiSelectToolbar.useFinderStore[count]": (s)=>s.selection.roots.size
    }["MultiSelectToolbar.useFinderStore[count]"]);
    const exitMultiSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])({
        "MultiSelectToolbar.useFinderStore[exitMultiSelect]": (s)=>s.exitMultiSelect
    }["MultiSelectToolbar.useFinderStore[exitMultiSelect]"]);
    if (!multiSelectActive) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between gap-3 px-3 py-2 bg-blue-50 border-b text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium",
                children: [
                    count,
                    " élément",
                    count > 1 ? 's' : '',
                    " sélectionné",
                    count > 1 ? 's' : ''
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MultiSelectToolbar.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: exitMultiSelect,
                className: "px-2 py-1 rounded border bg-white hover:bg-gray-50",
                children: "Tout désélectionner"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/MultiSelectToolbar.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/MultiSelectToolbar.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(MultiSelectToolbar, "RI3uiIWcE3c/Joo1v6zFZ6BnUsA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"]
    ];
});
_c = MultiSelectToolbar;
var _c;
__turbopack_context__.k.register(_c, "MultiSelectToolbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/GridItem.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GridItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/folder.js [app-client] (ecmascript) <export default as Folder>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useLongPress.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function GridItem({ node, isSelected, multiSelectActive, triState, onClick, onDoubleClick, onLongPress, onDragStart }) {
    _s();
    const longPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"])(onLongPress);
    // État local pour détecter si la vignette image a échoué à charger.
    // Si oui, on fallback sur l'icône typée — meilleur que de laisser le
    // placeholder broken-image natif du navigateur.
    const [imgFailed, setImgFailed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isFolder = node.type === 'folder';
    const kind = node.meta?.kind;
    const url = node.meta?.url;
    const hasImageThumb = !isFolder && kind === 'image' && url && !imgFailed;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        draggable: true,
        onClick: (e)=>{
            e.stopPropagation();
            onClick(e);
        },
        onDoubleClick: onDoubleClick,
        onMouseDown: longPress.onMouseDown,
        onMouseUp: longPress.onMouseUp,
        onMouseLeave: longPress.onMouseLeave,
        onTouchStart: longPress.onTouchStart,
        onTouchEnd: longPress.onTouchEnd,
        onDragStart: (e)=>{
            longPress.onDragStart();
            onDragStart(e);
        },
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('relative aspect-square rounded-lg border bg-white overflow-hidden cursor-pointer select-none', 'transition-shadow hover:shadow-md', isSelected ? 'ring-2 ring-blue-400 border-blue-300' : 'border-gray-200'),
        title: node.name,
        children: [
            hasImageThumb ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: url,
                alt: node.name,
                className: "w-full h-full object-cover",
                onError: ()=>setImgFailed(true)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CardIcon, {
                node: node
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 112,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('absolute bottom-0 left-0 right-0 px-2 py-1.5 text-xs truncate', hasImageThumb ? 'bg-gradient-to-t from-black/70 to-black/0 text-white' : 'bg-white border-t border-gray-100 text-gray-700'),
                children: node.name
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1.5 left-1.5 bg-white/80 backdrop-blur-sm rounded p-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "checkbox",
                    checked: triState === 'checked',
                    ref: (el)=>{
                        if (el) el.indeterminate = triState === 'indeterminate';
                    },
                    readOnly: true,
                    className: "block"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                    lineNumber: 135,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_s(GridItem, "W60UQVfdOK/Mg3gGPQ+LnLKHUEk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useLongPress$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLongPress"]
    ];
});
_c = GridItem;
/* -------------------------------------------------------------------------- */ /*                                CARD ICON                                   */ /* -------------------------------------------------------------------------- */ /**
 * Affiche l'icône centrale d'une card sans vignette image.
 *
 * Pour les dossiers : icône Lucide `Folder` (cohérent avec la TreeView
 * qui utilise déjà Lucide). Pour les fichiers : emoji typé selon
 * `meta.kind` (vidéo / audio implicite / document). Les emojis sont
 * lisibles, accessibles, et n'ajoutent pas de dépendance.
 */ function CardIcon({ node }) {
    if (node.type === 'folder') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full flex items-center justify-center pb-6 text-blue-400",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Folder$3e$__["Folder"], {
                className: "w-16 h-16",
                strokeWidth: 1.5
            }, void 0, false, {
                fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
            lineNumber: 165,
            columnNumber: 7
        }, this);
    }
    const kind = node.meta?.kind;
    const emoji = kind === 'video' ? '🎬' : '📄';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full flex items-center justify-center pb-6 text-5xl",
        children: emoji
    }, void 0, false, {
        fileName: "[project]/apps/web/src/features/finder-core/components/GridItem.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
_c1 = CardIcon;
var _c, _c1;
__turbopack_context__.k.register(_c, "GridItem");
__turbopack_context__.k.register(_c1, "CardIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/utils/triState.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/dnd/dragGhost.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-client] (ecmascript)");
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
    setBadgeState((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDropAllowed"])(targetPath, itemsRef) ? 'allowed' : 'forbidden');
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-core/components/Finder.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Finder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/react-resizable-panels@4.11.1_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/react-resizable-panels/dist/react-resizable-panels.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/panel-right-close.js [app-client] (ecmascript) <export default as PanelRightClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/panel-right-open.js [app-client] (ecmascript) <export default as PanelRightOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@0.553.0_react@19.2.0/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderBinRootView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderBinRootView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderViewModeSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderViewModeSwitcher.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTableRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTableRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderCompactRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderCompactRow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/hooks/useFinderData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/state/useFinderStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/Breadcrumb.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/PreviewPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTree$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/FinderTree.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$MultiSelectToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/MultiSelectToolbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$GridItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/GridItem.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/utils/triState.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$dragGhost$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/dragGhost.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/dnd/payload.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
/**
 * Clé localStorage utilisée pour persister la disposition (largeur) des 3
 * panneaux du finder. Centralisée ici pour qu'on puisse facilement clear
 * via devtools : `localStorage.removeItem('akfc:finder:layout')`.
 */ const LAYOUT_STORAGE_KEY = 'akfc:finder:layout';
function Finder({ adapter, rootPath }) {
    _s();
    const { folders, files, currentPath, setPath, selection, toggleSelect, selectOnly, selectRange, multiSelectActive, enterMultiSelect, viewMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"])();
    const { loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderData"])(adapter);
    // Ref impératif sur le Panel preview pour le toggle collapse/expand depuis
    // le bouton du header. `usePanelRef` est exporté en v4 et donne un ref
    // déjà correctement typé pour l'API impérative du Panel.
    const previewPanelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePanelRef"])();
    const [isPreviewCollapsed, setIsPreviewCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
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
   */ const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupRef"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Finder.useEffect": ()=>{
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
        }
    }["Finder.useEffect"], []);
    const handleLayoutChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Finder.useCallback[handleLayoutChange]": (layout)=>{
            try {
                localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
            } catch  {
            // Mode privé / quota dépassé — on laisse passer. Le layout fonctionne
            // toujours pendant la session, juste pas persisté.
            }
        }
    }["Finder.useCallback[handleLayoutChange]"], []);
    const allNodes = [
        ...folders,
        ...files
    ];
    /**
   * 🔹 Flat list pour calcul tri-state + range
   */ const allItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Finder.useMemo[allItems]": ()=>[
                ...folders.map({
                    "Finder.useMemo[allItems]": (f)=>({
                            id: f.id,
                            path: f.path
                        })
                }["Finder.useMemo[allItems]"]),
                ...files.map({
                    "Finder.useMemo[allItems]": (f)=>({
                            id: f.id,
                            path: f.path
                        })
                }["Finder.useMemo[allItems]"])
            ]
    }["Finder.useMemo[allItems]"], [
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
            items = selectedNodes.map(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dragItemFromNode"]);
        } else {
            items = [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dragItemFromNode"])(node)
            ];
        }
        if (items.length === 0) return;
        e.dataTransfer.setData(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FINDER_DRAG_MIME"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$payload$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializePayload"])({
            items
        }));
        e.dataTransfer.effectAllowed = 'move';
        const previews = items.map((it)=>{
            const fullNode = allNodes.find((n)=>n.id === it.id);
            return buildPreview(fullNode ?? null, it);
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$dnd$2f$dragGhost$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startDragGhost"])({
            e,
            items,
            previews
        });
    }
    // Le 1er chargement = on est en train de charger ET on n'a encore rien
    // à montrer. Dans ce cas on affiche un overlay centré sur la grille
    // pour éviter le panneau central vide qui paraît "cassé".
    const showInitialLoadingOverlay = loading && allNodes.length === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full border rounded overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 border-b text-sm flex items-center gap-2 min-h-[40px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 287,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 286,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-4 h-4 flex items-center justify-center shrink-0",
                        children: loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-4 w-4 animate-spin text-gray-400",
                            "aria-label": "Chargement"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 293,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 291,
                        columnNumber: 9
                    }, this),
                    currentPath !== `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderViewModeSwitcher$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 303,
                        columnNumber: 47
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/test-finder/corbeille",
                        className: " shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                        "aria-label": "Ouvrir la corbeille",
                        title: "Corbeille",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 317,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 306,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: togglePreviewPanel,
                        className: " shrink-0 rounded p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors ",
                        "aria-label": isPreviewCollapsed ? 'Afficher le panneau de prévisualisation' : 'Masquer le panneau de prévisualisation',
                        title: isPreviewCollapsed ? 'Afficher la prévisualisation' : 'Masquer la prévisualisation',
                        children: isPreviewCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightOpen$3e$__["PanelRightOpen"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 334,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$right$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelRightClose$3e$__["PanelRightClose"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 336,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 285,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-3 py-2 text-sm bg-red-50 text-red-700 border-b flex items-center gap-2",
                role: "alert",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        className: "h-4 w-4 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 347,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Erreur : ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 343,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
                groupRef: groupRef,
                orientation: "horizontal",
                onLayoutChange: handleLayoutChange,
                className: "flex-1 min-h-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                        id: "tree",
                        defaultSize: "320px",
                        minSize: "240px",
                        maxSize: "500px",
                        className: "overflow-auto p-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTree$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            adapter: adapter,
                            rootPath: rootPath,
                            currentPath: currentPath,
                            onOpen: setPath
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 380,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 379,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
                        className: " w-px bg-gray-200 hover:bg-blue-400 hover:w-[3px] transition-all focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px] "
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 388,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                        id: "grid",
                        minSize: 20,
                        className: "flex flex-col min-h-0 relative",
                        children: currentPath === `${__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"]}/bin` ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderBinRootView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 423,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$MultiSelectToolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 427,
                                    columnNumber: 15
                                }, this),
                                showInitialLoadingOverlay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-2 text-gray-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$553$2e$0_react$40$19$2e$2$2e$0$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "h-6 w-6 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 434,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                children: "Chargement…"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 435,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 433,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 432,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 overflow-auto flex-1",
                                    children: folders.length === 0 && files.length === 0 && !loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Ce dossier est vide"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                            lineNumber: 443,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 442,
                                        columnNumber: 19
                                    }, this) : viewMode === 'grid' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]",
                                        children: [
                                            folders.map((folder)=>{
                                                const triState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriState"])({
                                                    item: folder,
                                                    allItems,
                                                    roots: selection.roots,
                                                    excluded: selection.excluded
                                                });
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$GridItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    node: folder,
                                                    isSelected: selection.roots.has(folder.id),
                                                    multiSelectActive: multiSelectActive,
                                                    triState: triState,
                                                    onClick: (e)=>handleClick(folder, e),
                                                    onDoubleClick: ()=>handleDoubleClick(folder),
                                                    onLongPress: ()=>handleLongPress(folder),
                                                    onDragStart: (e)=>handleDragStart(e, folder)
                                                }, folder.id, false, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 21
                                                }, this);
                                            }),
                                            files.map((file)=>{
                                                const triState = selection.roots.has(file.id) ? 'checked' : 'unchecked';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$GridItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    node: file,
                                                    isSelected: selection.roots.has(file.id),
                                                    multiSelectActive: multiSelectActive,
                                                    triState: triState,
                                                    onClick: (e)=>handleClick(file, e),
                                                    onLongPress: ()=>handleLongPress(file),
                                                    onDragStart: (e)=>handleDragStart(e, file)
                                                }, file.id, false, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 446,
                                        columnNumber: 15
                                    }, this) : viewMode === 'table' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "w-full text-sm border-collapse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                className: "bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        multiSelectActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-2 py-2 text-left w-8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 493,
                                                            columnNumber: 43
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-2 py-2 text-left w-8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 494,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-left",
                                                            children: "Nom"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 495,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-left",
                                                            children: "Type"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 496,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "px-3 py-2 text-right",
                                                            children: "Taille"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 497,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 492,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 491,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                className: "divide-y divide-gray-100",
                                                children: [
                                                    folders.map((folder)=>{
                                                        const triState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriState"])({
                                                            item: folder,
                                                            allItems,
                                                            roots: selection.roots,
                                                            excluded: selection.excluded
                                                        });
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTableRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            node: folder,
                                                            isSelected: selection.roots.has(folder.id),
                                                            multiSelectActive: multiSelectActive,
                                                            triState: triState,
                                                            onClick: (e)=>handleClick(folder, e),
                                                            onDoubleClick: ()=>handleDoubleClick(folder),
                                                            onLongPress: ()=>handleLongPress(folder),
                                                            onDragStart: (e)=>handleDragStart(e, folder)
                                                        }, folder.id, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 509,
                                                            columnNumber: 23
                                                        }, this);
                                                    }),
                                                    files.map((file)=>{
                                                        const triState = selection.roots.has(file.id) ? 'checked' : 'unchecked';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderTableRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            node: file,
                                                            isSelected: selection.roots.has(file.id),
                                                            multiSelectActive: multiSelectActive,
                                                            triState: triState,
                                                            onClick: (e)=>handleClick(file, e),
                                                            onLongPress: ()=>handleLongPress(file),
                                                            onDragStart: (e)=>handleDragStart(e, file)
                                                        }, file.id, false, {
                                                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                            lineNumber: 525,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                lineNumber: 500,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 490,
                                        columnNumber: 15
                                    }, this) : /* compact */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "divide-y divide-gray-100",
                                        children: [
                                            folders.map((folder)=>{
                                                const triState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$utils$2f$triState$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTriState"])({
                                                    item: folder,
                                                    allItems,
                                                    roots: selection.roots,
                                                    excluded: selection.excluded
                                                });
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderCompactRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    node: folder,
                                                    isSelected: selection.roots.has(folder.id),
                                                    multiSelectActive: multiSelectActive,
                                                    triState: triState,
                                                    onClick: (e)=>handleClick(folder, e),
                                                    onDoubleClick: ()=>handleDoubleClick(folder),
                                                    onLongPress: ()=>handleLongPress(folder),
                                                    onDragStart: (e)=>handleDragStart(e, folder)
                                                }, folder.id, false, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 550,
                                                    columnNumber: 21
                                                }, this);
                                            }),
                                            files.map((file)=>{
                                                const triState = selection.roots.has(file.id) ? 'checked' : 'unchecked';
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$FinderCompactRow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    node: file,
                                                    isSelected: selection.roots.has(file.id),
                                                    multiSelectActive: multiSelectActive,
                                                    triState: triState,
                                                    onClick: (e)=>handleClick(file, e),
                                                    onLongPress: ()=>handleLongPress(file),
                                                    onDragStart: (e)=>handleDragStart(e, file)
                                                }, file.id, false, {
                                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                                    lineNumber: 566,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                        lineNumber: 541,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                                    lineNumber: 440,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 403,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
                        className: " w-px bg-gray-200 hover:bg-blue-400 hover:w-[3px] transition-all focus-visible:outline-none focus-visible:bg-blue-400 focus-visible:w-[3px] "
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 585,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
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
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$PreviewPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            adapter: adapter
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                            lineNumber: 621,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                        lineNumber: 608,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
                lineNumber: 365,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/features/finder-core/components/Finder.tsx",
        lineNumber: 282,
        columnNumber: 5
    }, this);
}
_s(Finder, "ce4qz6TiXewHJM2yXmi67mFgnNc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$state$2f$useFinderStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$hooks$2f$useFinderData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFinderData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePanelRef"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$react$2d$resizable$2d$panels$40$4$2e$11$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupRef"]
    ];
});
_c = Finder;
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
var _c;
__turbopack_context__.k.register(_c, "Finder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-adapters/cloudinary/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilitaires Cloudinary spécifiques à l'adapter du finder agnostique.
 *
 * Ces helpers servent à reconstituer côté UI ce que le contrat
 * `StorageNode` (agnostique) ne transporte volontairement pas :
 *   - `getMediaUrl(publicId)` : reconstruction de l'URL d'affichage à
 *     partir du publicId reçu via `path`.
 *   - `kindFromFormat(format)` : déduction du kind 'image'|'video'|'document'
 *     à partir du format technique transporté en `metadata.format`.
 *
 * Ces deux opérations sont Cloudinary-spécifiques par nature et ont donc
 * leur place dans l'adapter Cloudinary, pas dans le contrat agnostique.
 */ __turbopack_context__.s([
    "getMediaUrl",
    ()=>getMediaUrl,
    "kindFromFormat",
    ()=>kindFromFormat
]);
function getMediaUrl(source, variant = 'thumb') {
    const encoded = source.publicId.split('/').map(encodeURIComponent).join('/');
    return `/api/media/by-public-id/${encoded}?variant=${variant}`;
}
function kindFromFormat(format, name) {
    // Source primaire : le format technique transporté par metadata.
    const fromFormat = matchKind(format);
    if (fromFormat) return fromFormat;
    // Fallback : extension du nom de fichier (ex: 'foo.jpg' → 'jpg').
    // Utile quand le backend ne pose pas de `format` dans le metadata du tree.
    if (name) {
        const ext = name.includes('.') ? name.split('.').pop() : undefined;
        const fromName = matchKind(ext);
        if (fromName) return fromName;
    }
    return 'document';
}
function matchKind(token) {
    if (!token) return null;
    if (/^(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(token)) return 'image';
    if (/^(mp4|webm|mov|avi|mkv)$/i.test(token)) return 'video';
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/features/finder-adapters/cloudinary/cloudinary.adapter.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cloudinaryAdapter",
    ()=>cloudinaryAdapter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/core/trpc/trpcClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$adapters$2f$cloudinary$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-adapters/cloudinary/utils.ts [app-client] (ecmascript)");
;
;
/* -------------------------------------------------------------------------- */ /*  Mappers : StorageNode (agnostique) → FinderNode (UI)                      */ /* -------------------------------------------------------------------------- */ /**
 * Mappe la racine d'un `storage.getTree` vers les listes plates `folders`
 * et `files` que `list` retourne.
 *
 * Volontairement non récursif : `list` ne s'intéresse qu'aux enfants
 * directs. Pour un retour récursif structuré en arbre, utiliser
 * `mapStorageNodeToFinderNode` ci-dessous.
 */ function mapStorageTreeToFinderNodes(tree) {
    const folders = [];
    const files = [];
    for (const child of tree.children ?? []){
        if (child.type === 'folder') {
            folders.push(mapFolderShallowToFinderNode(child));
            continue;
        }
        if (child.type === 'file') {
            files.push(mapFileToFinderNode(child));
        }
    }
    return {
        folders,
        files
    };
}
/**
 * Version "plate" : ne descend pas dans les children, mais préserve
 * l'information `hasChildren` pour que la UI sache qu'il y a quelque
 * chose en dessous sans avoir à charger.
 */ function mapFolderShallowToFinderNode(folder) {
    return {
        id: folder.path,
        name: folder.name,
        path: folder.path,
        type: 'folder',
        hasChildren: folder.hasChildren ?? (folder.children?.length ?? 0) > 0
    };
}
/**
 * Mappe un node agnostique vers un `FinderNode`, en RÉCURSANT dans les
 * children s'ils sont présents. C'est le mapping utilisé par `getTree`.
 *
 * Logique de profondeur :
 *   - Si `node.children` est `undefined` : on est à la frontière de depth
 *     côté backend, on retourne le node sans children chargés (la TreeView
 *     saura qu'il faut un appel supplémentaire pour descendre).
 *   - Si `node.children` est `[]` : le folder est vide pour de vrai.
 *   - Si `node.children` est rempli : on récurse.
 */ function mapStorageNodeToFinderNode(node) {
    if (node.type === 'file') {
        return mapFileToFinderNode(node);
    }
    // node.type === 'folder'
    const childrenLoaded = node.children !== undefined;
    const mappedChildren = childrenLoaded ? node.children.map(mapStorageNodeToFinderNode) : undefined;
    return {
        id: node.path,
        name: node.name,
        path: node.path,
        type: 'folder',
        hasChildren: node.hasChildren ?? (mappedChildren?.length ?? 0) > 0,
        children: mappedChildren
    };
}
function mapFileToFinderNode(file) {
    const fallbackName = file.path.split('/').pop() ?? 'file';
    return {
        id: file.path,
        name: file.name ?? fallbackName,
        path: file.path,
        type: 'file',
        meta: {
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$adapters$2f$cloudinary$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMediaUrl"])({
                publicId: file.path
            }),
            format: file.metadata?.format,
            kind: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$adapters$2f$cloudinary$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["kindFromFormat"])(file.metadata?.format, file.name ?? fallbackName)
        }
    };
}
/* -------------------------------------------------------------------------- */ /*  Traduction MoveOptions (UI) → StorageMoveIntent (agnostique)              */ /* -------------------------------------------------------------------------- */ /**
 * Construit le `source` de l'intent de move à partir des items UI.
 *
 * Stratégie en deux cas :
 *
 *   1. UN SEUL item (cas dominant : DnD d'un fichier ou d'un dossier).
 *      On envoie une source `file` ou `folder` directe. Pour un dossier,
 *      l'adapter Cloudinary backend pourra alors utiliser un rename
 *      récursif natif (un seul appel API), au lieu d'expanser en N
 *      fichiers individuels.
 *
 *   2. PLUSIEURS items (multi-sélection).
 *      On utilise `selection` avec tous les paths comme `roots`. Le
 *      backend `resolveMoveIntent` expansera chaque root selon son type
 *      (file pris tel quel, folder listé récursivement). On perd
 *      l'optimisation folder-rename pour les sous-folders contenus dans
 *      la sélection, mais c'est inhérent à la sémantique multi-items.
 */ function moveOptionsToSource(items) {
    if (items.length === 1) {
        const only = items[0];
        return {
            type: only.type,
            path: only.path
        };
    }
    return {
        type: 'selection',
        roots: items.map((it)=>it.path)
    };
}
/**
 * Traduit la `MoveTarget` UI (discriminée par `type`) vers la
 * `StorageMoveTarget` agnostique. Le parallélisme structurel des deux
 * unions rend la traduction triviale — un simple narrowing par
 * discriminant.
 */ function moveOptionsToTarget(target) {
    if (target.type === 'folder') {
        return {
            type: 'folder',
            path: target.path
        };
    }
    // target.type === 'status-folder'
    return {
        type: 'status-folder',
        status: target.status
    };
}
const cloudinaryAdapter = {
    async list (options) {
        const { root } = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpcClient"].storage.getTree.query({
            provider: 'cloudinary',
            path: options.path,
            depth: 1
        });
        const { folders, files } = mapStorageTreeToFinderNodes(root);
        return {
            folders,
            files,
            nextCursor: null
        };
    },
    async getTree (options) {
        const { root } = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpcClient"].storage.getTree.query({
            provider: 'cloudinary',
            path: options.path,
            depth: options.depth ?? 1
        });
        return {
            root: mapStorageNodeToFinderNode(root)
        };
    },
    async getMetadata (path) {
        const metadata = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpcClient"].storage.getMetadata.query({
            provider: 'cloudinary',
            path
        });
        // Le contrat agnostique `StorageMetadata` et `FinderNodeMetadata` ont
        // exactement la même forme — on peut renvoyer tel quel, c'est un
        // passe-plat assumé. Si un jour les deux divergent, c'est ici qu'on
        // ajoutera le mapping explicite.
        return metadata;
    },
    async moveItems (options) {
        const source = moveOptionsToSource(options.items);
        const target = moveOptionsToTarget(options.target);
        await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$core$2f$trpc$2f$trpcClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpcClient"].storage.move.mutate({
            provider: 'cloudinary',
            intent: {
                source,
                target
            }
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/app/admin/dashboard/pictures/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GalleryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.94.2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Finder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-core/components/Finder.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$adapters$2f$cloudinary$2f$cloudinary$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/features/finder-adapters/cloudinary/cloudinary.adapter.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/config/app.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function GalleryPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-semibold mb-6",
                children: "Gestionnaire de galerie"
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/admin/dashboard/pictures/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$94$2e$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$core$2f$components$2f$Finder$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                adapter: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$features$2f$finder$2d$adapters$2f$cloudinary$2f$cloudinary$2e$adapter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloudinaryAdapter"],
                rootPath: __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$config$2f$app$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APP_ROOT"]
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/admin/dashboard/pictures/page.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/admin/dashboard/pictures/page.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = GalleryPage;
var _c;
__turbopack_context__.k.register(_c, "GalleryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_35e97cad._.js.map