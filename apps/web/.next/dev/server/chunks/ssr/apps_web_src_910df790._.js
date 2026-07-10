module.exports = [
"[project]/apps/web/src/lib/tiptap-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAC_SYMBOLS",
    ()=>MAC_SYMBOLS,
    "MAX_FILE_SIZE",
    ()=>MAX_FILE_SIZE,
    "SR_ONLY",
    ()=>SR_ONLY,
    "cn",
    ()=>cn,
    "findNodeAtPosition",
    ()=>findNodeAtPosition,
    "findNodePosition",
    ()=>findNodePosition,
    "focusNextNode",
    ()=>focusNextNode,
    "formatShortcutKey",
    ()=>formatShortcutKey,
    "handleImageUpload",
    ()=>handleImageUpload,
    "isAllowedUri",
    ()=>isAllowedUri,
    "isExtensionAvailable",
    ()=>isExtensionAvailable,
    "isMac",
    ()=>isMac,
    "isMarkInSchema",
    ()=>isMarkInSchema,
    "isNodeInSchema",
    ()=>isNodeInSchema,
    "isNodeTypeSelected",
    ()=>isNodeTypeSelected,
    "isValidPosition",
    ()=>isValidPosition,
    "parseShortcutKeys",
    ()=>parseShortcutKeys,
    "sanitizeUrl",
    ()=>sanitizeUrl,
    "selectCurrentBlockContent",
    ()=>selectCurrentBlockContent,
    "selectionWithinConvertibleTypes",
    ()=>selectionWithinConvertibleTypes,
    "updateNodesAttr",
    ()=>updateNodesAttr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tiptap$2b$pm$40$3$2e$23$2e$6$2f$node_modules$2f40$tiptap$2f$pm$2f$dist$2f$state$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tiptap+pm@3.23.6/node_modules/@tiptap/pm/dist/state/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/prosemirror-state@1.4.4/node_modules/prosemirror-state/dist/index.js [app-ssr] (ecmascript)");
;
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
;
const MAC_SYMBOLS = {
    mod: "⌘",
    command: "⌘",
    meta: "⌘",
    ctrl: "⌃",
    control: "⌃",
    alt: "⌥",
    option: "⌥",
    shift: "⇧",
    backspace: "Del",
    delete: "⌦",
    enter: "⏎",
    escape: "⎋",
    capslock: "⇪"
};
const SR_ONLY = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0
};
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
function isMac() {
    return typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
}
const formatShortcutKey = (key, isMac, capitalize = true)=>{
    if (isMac) {
        const lowerKey = key.toLowerCase();
        return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key);
    }
    return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};
const parseShortcutKeys = (props)=>{
    const { shortcutKeys, delimiter = "+", capitalize = true } = props;
    if (!shortcutKeys) return [];
    return shortcutKeys.split(delimiter).map((key)=>key.trim()).map((key)=>formatShortcutKey(key, isMac(), capitalize));
};
const isMarkInSchema = (markName, editor)=>{
    if (!editor?.schema) return false;
    return editor.schema.spec.marks.get(markName) !== undefined;
};
const isNodeInSchema = (nodeName, editor)=>{
    if (!editor?.schema) return false;
    return editor.schema.spec.nodes.get(nodeName) !== undefined;
};
function focusNextNode(editor) {
    const { state, view } = editor;
    const { doc, selection } = state;
    const nextSel = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Selection"].findFrom(selection.$to, 1, true);
    if (nextSel) {
        view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
        return true;
    }
    const paragraphType = state.schema.nodes.paragraph;
    if (!paragraphType) {
        console.warn("No paragraph node type found in schema.");
        return false;
    }
    const end = doc.content.size;
    const para = paragraphType.create();
    let tr = state.tr.insert(end, para);
    // Place the selection inside the new paragraph
    const $inside = tr.doc.resolve(end + 1);
    tr = tr.setSelection(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextSelection"].near($inside)).scrollIntoView();
    view.dispatch(tr);
    return true;
}
function isValidPosition(pos) {
    return typeof pos === "number" && pos >= 0;
}
function isExtensionAvailable(editor, extensionNames) {
    if (!editor) return false;
    const names = Array.isArray(extensionNames) ? extensionNames : [
        extensionNames
    ];
    const found = names.some((name)=>editor.extensionManager.extensions.some((ext)=>ext.name === name));
    if (!found) {
        console.warn(`None of the extensions [${names.join(", ")}] were found in the editor schema. Ensure they are included in the editor configuration.`);
    }
    return found;
}
function findNodeAtPosition(editor, position) {
    try {
        const node = editor.state.doc.nodeAt(position);
        if (!node) {
            console.warn(`No node found at position ${position}`);
            return null;
        }
        return node;
    } catch (error) {
        console.error(`Error getting node at position ${position}:`, error);
        return null;
    }
}
function findNodePosition(props) {
    const { editor, node, nodePos } = props;
    if (!editor || !editor.state?.doc) return null;
    // Zero is valid position
    const hasValidNode = node !== undefined && node !== null;
    const hasValidPos = isValidPosition(nodePos);
    if (!hasValidNode && !hasValidPos) {
        return null;
    }
    // First search for the node in the document if we have a node
    if (hasValidNode) {
        let foundPos = -1;
        let foundNode = null;
        editor.state.doc.descendants((currentNode, pos)=>{
            // TODO: Needed?
            // if (currentNode.type && currentNode.type.name === node!.type.name) {
            if (currentNode === node) {
                foundPos = pos;
                foundNode = currentNode;
                return false;
            }
            return true;
        });
        if (foundPos !== -1 && foundNode !== null) {
            return {
                pos: foundPos,
                node: foundNode
            };
        }
    }
    // If we have a valid position, use findNodeAtPosition
    if (hasValidPos) {
        const nodeAtPos = findNodeAtPosition(editor, nodePos);
        if (nodeAtPos) {
            return {
                pos: nodePos,
                node: nodeAtPos
            };
        }
    }
    return null;
}
function isNodeTypeSelected(editor, nodeTypeNames = [], checkAncestorNodes = false) {
    if (!editor || !editor.state.selection) return false;
    const { selection } = editor.state;
    if (selection.empty) return false;
    // Direct node selection check
    if (selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NodeSelection"]) {
        const selectedNode = selection.node;
        return selectedNode ? nodeTypeNames.includes(selectedNode.type.name) : false;
    }
    // Depth-based ancestor node check
    if (checkAncestorNodes) {
        const { $from } = selection;
        for(let depth = $from.depth; depth > 0; depth--){
            const ancestorNode = $from.node(depth);
            if (nodeTypeNames.includes(ancestorNode.type.name)) {
                return true;
            }
        }
    }
    return false;
}
function selectionWithinConvertibleTypes(editor, types = []) {
    if (!editor || types.length === 0) return false;
    const { state } = editor;
    const { selection } = state;
    const allowed = new Set(types);
    if (selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NodeSelection"]) {
        const nodeType = selection.node?.type?.name;
        return !!nodeType && allowed.has(nodeType);
    }
    if (selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextSelection"] || selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AllSelection"]) {
        let valid = true;
        state.doc.nodesBetween(selection.from, selection.to, (node)=>{
            if (node.isTextblock && !allowed.has(node.type.name)) {
                valid = false;
                return false // stop early
                ;
            }
            return valid;
        });
        return valid;
    }
    return false;
}
const handleImageUpload = async (file, onProgress, abortSignal)=>{
    // Validate file
    if (!file) {
        throw new Error("No file provided");
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
    }
    // For demo/testing: Simulate upload progress. In production, replace the following code
    // with your own upload implementation.
    for(let progress = 0; progress <= 100; progress += 10){
        if (abortSignal?.aborted) {
            throw new Error("Upload cancelled");
        }
        await new Promise((resolve)=>setTimeout(resolve, 500));
        onProgress?.({
            progress
        });
    }
    return "/images/tiptap-ui-placeholder-image.jpg";
};
const ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;
function isAllowedUri(uri, protocols) {
    const allowedProtocols = [
        "http",
        "https",
        "ftp",
        "ftps",
        "mailto",
        "tel",
        "callto",
        "sms",
        "cid",
        "xmpp"
    ];
    if (protocols) {
        protocols.forEach((protocol)=>{
            const nextProtocol = typeof protocol === "string" ? protocol : protocol.scheme;
            if (nextProtocol) {
                allowedProtocols.push(nextProtocol);
            }
        });
    }
    return !uri || uri.replace(ATTR_WHITESPACE, "").match(new RegExp(`^(?:(?:${allowedProtocols.join("|")}):|[^a-z]|[a-z0-9+.\-]+(?:[^a-z+.\-:]|$))`, "i"));
}
function sanitizeUrl(inputUrl, baseUrl, protocols) {
    try {
        const url = new URL(inputUrl, baseUrl);
        if (isAllowedUri(url.href, protocols)) {
            return url.href;
        }
    } catch  {
    // If URL creation fails, it's considered invalid
    }
    return "#";
}
function updateNodesAttr(tr, targets, attrName, next) {
    if (!targets.length) return false;
    let changed = false;
    for (const { pos } of targets){
        // Always re-read from the transaction's current doc
        const currentNode = tr.doc.nodeAt(pos);
        if (!currentNode) continue;
        const prevValue = currentNode.attrs[attrName];
        const resolvedNext = typeof next === "function" ? next(prevValue) : next;
        if (prevValue === resolvedNext) continue;
        const nextAttrs = {
            ...currentNode.attrs
        };
        if (resolvedNext === undefined) {
            // Remove the key entirely instead of setting null
            delete nextAttrs[attrName];
        } else {
            nextAttrs[attrName] = resolvedNext;
        }
        tr.setNodeMarkup(pos, undefined, nextAttrs);
        changed = true;
    }
    return changed;
}
function selectCurrentBlockContent(editor) {
    const { selection, doc } = editor.state;
    if (!selection.empty) return;
    const $pos = selection.$from;
    let blockNode = null;
    let blockPos = -1;
    for(let depth = $pos.depth; depth >= 0; depth--){
        const node = $pos.node(depth);
        const pos = $pos.start(depth);
        if (node.isBlock && node.textContent.trim()) {
            blockNode = node;
            blockPos = pos;
            break;
        }
    }
    if (blockNode && blockPos >= 0) {
        const from = blockPos;
        const to = blockPos + blockNode.nodeSize - 2 // -2 to exclude the closing tag
        ;
        if (from < to) {
            const $from = doc.resolve(from);
            const $to = doc.resolve(to);
            const newSelection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$prosemirror$2d$state$40$1$2e$4$2e$4$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TextSelection"].between($from, $to, 1);
            if (newSelection && !selection.eq(newSelection)) {
                editor.view.dispatch(editor.state.tr.setSelection(newSelection));
            }
        }
    }
}
}),
"[project]/apps/web/src/hooks/use-composed-ref.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useComposedRef",
    ()=>useComposedRef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const updateRef = (ref, value)=>{
    if (typeof ref === "function") {
        ref(value);
    } else if (ref && typeof ref === "object" && "current" in ref) {
        ;
        ref.current = value;
    }
};
const useComposedRef = (internalRef, userRef)=>{
    const prevUserRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((instance)=>{
        internalRef.current = instance;
        if (prevUserRef.current) {
            updateRef(prevUserRef.current, null);
        }
        prevUserRef.current = userRef;
        if (userRef) {
            updateRef(userRef, instance);
        }
    }, [
        internalRef,
        userRef
    ]);
};
const __TURBOPACK__default__export__ = useComposedRef;
}),
"[project]/apps/web/src/hooks/use-is-breakpoint.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsBreakpoint",
    ()=>useIsBreakpoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const isClient = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined";
/**
 * Subscribe to media query changes.
 *
 * @param {string} query - The media query string.
 * @param {() => void} onStoreChange - The callback function to be called when the media query matches.
 * @returns {() => void} - A function to unsubscribe from the media query changes.
 */ function subscribeMediaQuery(query, onStoreChange) {
    if (!isClient()) return ()=>{};
    //TURBOPACK unreachable
    ;
    const mql = undefined;
    const handler = undefined;
}
/**
 * Returns a snapshot of the media query's match status.
 *
 * @param {string} query - The media query string.
 * @returns {boolean} - True if the media query matches, false otherwise.
 * @note This function only works on the client-side.
 */ function getMediaQuerySnapshot(query) {
    if (!isClient()) return false;
    //TURBOPACK unreachable
    ;
}
function useIsBreakpoint(mode = "max", breakpoint = 768) {
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return mode === "min" ? `(min-width: ${breakpoint}px)` : `(max-width: ${breakpoint - 1}px)`;
    }, [
        mode,
        breakpoint
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])((onStoreChange)=>subscribeMediaQuery(query, onStoreChange), ()=>getMediaQuerySnapshot(query), ()=>false);
}
}),
"[project]/apps/web/src/components/ui/Modal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.29.7_react-dom@19.2.0_react@19.2.0__react@19.2.0_sass@1.100.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Modal.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$29$2e$7_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0_sass$40$1$2e$100$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-white rounded-lg shadow-lg w-200 max-h-[80vh] flex flex-col",
                children: children
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/ui/Modal.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/ui/Modal.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_910df790._.js.map