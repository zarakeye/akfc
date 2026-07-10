module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WindowBrowserContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
;
class WindowBrowserContext {
    static [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["browserFrames"]] = new Map();
    static [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["windowInternalId"]] = 0;
    #window;
    /**
     * Browser window.
     *
     * @param window Window.
     */ constructor(window){
        this.#window = window;
    }
    /**
     * Returns the browser settings of the window.
     *
     * @returns Browser settings.
     */ getSettings() {
        return this.getBrowserFrame()?.page.context.browser.settings || null;
    }
    /**
     * Returns the browser.
     *
     * @returns Browser.
     */ getBrowser() {
        return this.getBrowserFrame()?.page.context.browser || null;
    }
    /**
     * Returns the browser page.
     *
     * @returns Browser page.
     */ getBrowserPage() {
        return this.getBrowserFrame()?.page || null;
    }
    /**
     * Returns the browser context.
     *
     * @returns Browser context.
     */ getBrowserContext() {
        return this.getBrowserFrame()?.page.context || null;
    }
    /**
     * Returns the browser frame of the window.
     *
     * @returns Browser frame.
     */ getBrowserFrame() {
        if (!this.#window) {
            return null;
        }
        return this.constructor[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["browserFrames"]].get(this.#window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]]) || null;
    }
    /**
     * Returns the async task manager of the window.
     *
     * @returns Async task manager.
     */ getAsyncTaskManager() {
        return this.getBrowserFrame()?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]] || null;
    }
    /**
     * Assigns the window to a browser frame.
     *
     * @param window Window.
     * @param browserFrame Browser frame.
     */ static setWindowBrowserFrameRelation(window, browserFrame) {
        const browserFrames = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["browserFrames"]];
        if (window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]] === -1) {
            window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["windowInternalId"]];
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["windowInternalId"]]++;
        }
        browserFrames.set(window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]], browserFrame);
    }
    /**
     * Assigns the window to a browser frame.
     *
     * @param window Window.
     * @param browserFrame Browser frame.
     */ static removeWindowBrowserFrameRelation(window) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["browserFrames"]].delete(window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]]);
    }
} //# sourceMappingURL=WindowBrowserContext.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/CrossOriginBrowserWindow.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CrossOriginBrowserWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/EventTarget.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMException.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
;
;
;
;
class CrossOriginBrowserWindow extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
    window = this;
    location;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]] = this;
    // Private properties
    #targetWindow;
    /**
     * Constructor.
     *
     * @param target Target window.
     * @param [parent] Parent window.
     */ constructor(target, parent){
        super();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = parent ?? this;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["top"]] = parent ?? this;
        this.location = new Proxy({}, {
            get: ()=>{
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](`Blocked a frame with origin "${this.parent.location.origin}" from accessing a cross-origin frame.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].securityError);
            },
            set: ()=>{
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](`Blocked a frame with origin "${this.parent.location.origin}" from accessing a cross-origin frame.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].securityError);
            }
        });
        this.#targetWindow = target;
    }
    /**
     * Returns self.
     *
     * @returns Self.
     */ get self() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]];
    }
    /**
     * Returns self.
     *
     * @param self Self.
     */ set self(self) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]] = self;
    }
    /**
     * Returns top.
     *
     * @returns Top.
     */ get top() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["top"]];
    }
    /**
     * Returns parent.
     *
     * @returns Parent.
     */ get parent() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]];
    }
    /**
     * Returns parent.
     *
     * @param parent Parent.
     */ set parent(parent) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = parent;
    }
    /**
     * Returns the opener.
     *
     * @returns Opener.
     */ get opener() {
        return this.#targetWindow.opener;
    }
    /**
     * Returns the closed state.
     *
     * @returns Closed state.
     */ get closed() {
        return this.#targetWindow.closed;
    }
    /**
     * Shifts focus away from the window.
     */ blur() {
        this.#targetWindow.blur();
    }
    /**
     * Gives focus to the window.
     */ focus() {
        this.#targetWindow.focus();
    }
    /**
     * Closes the window.
     */ close() {
        this.#targetWindow.close();
    }
    /**
     * Safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.
     *
     * @param message Message.
     * @param [targetOrigin=*] Target origin.
     * @param transfer Transfer. Not implemented.
     */ postMessage(message, targetOrigin = '*', transfer) {
        this.#targetWindow.postMessage(message, targetOrigin, transfer);
    }
} //# sourceMappingURL=CrossOriginBrowserWindow.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/VMGlobalPropertyScript.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/vm [external] (vm, cjs)");
;
const __TURBOPACK__default__export__ = new __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["Script"](`
this.ArrayBuffer = globalThis.ArrayBuffer;
this.Boolean = globalThis.Boolean;
this.DataView = globalThis.DataView;
this.Date = globalThis.Date;
this.Error = globalThis.Error;
this.EvalError = globalThis.EvalError;
this.Float32Array = globalThis.Float32Array;
this.Float64Array = globalThis.Float64Array;
this.GLOBAL = globalThis.GLOBAL;
this.Infinity = globalThis.Infinity;
this.Int16Array = globalThis.Int16Array;
this.Int32Array = globalThis.Int32Array;
this.Int8Array = globalThis.Int8Array;
this.Intl = globalThis.Intl;
this.JSON = globalThis.JSON;
this.Map = globalThis.Map;
this.Math = globalThis.Math;
this.NaN = globalThis.NaN;
this.Number = globalThis.Number;
this.Promise = globalThis.Promise;
this.RangeError = globalThis.RangeError;
this.ReferenceError = globalThis.ReferenceError;
this.RegExp = globalThis.RegExp;
this.Reflect = globalThis.Reflect;
this.Set = globalThis.Set;
this.Symbol = globalThis.Symbol;
this.SyntaxError = globalThis.SyntaxError;
this.String = globalThis.String;
this.TypeError = globalThis.TypeError;
this.URIError = globalThis.URIError;
this.Uint16Array = globalThis.Uint16Array;
this.Uint32Array = globalThis.Uint32Array;
this.Uint8Array = globalThis.Uint8Array;
this.Uint8ClampedArray = globalThis.Uint8ClampedArray;
this.WeakMap = globalThis.WeakMap;
this.WeakSet = globalThis.WeakSet;
this.decodeURI = globalThis.decodeURI;
this.decodeURIComponent = globalThis.decodeURIComponent;
this.encodeURI = globalThis.encodeURI;
this.encodeURIComponent = globalThis.encodeURIComponent;
this.eval = globalThis.eval;
this.escape = globalThis.escape;
this.global = globalThis.global;
this.isFinite = globalThis.isFinite;
this.isNaN = globalThis.isNaN;
this.parseFloat = globalThis.parseFloat;
this.parseInt = globalThis.parseInt;
this.root = globalThis.root;
this.undefined = globalThis.undefined;
this.unescape = globalThis.unescape;
this.AbortController = globalThis.AbortController;
this.AbortSignal = globalThis.AbortSignal;
this.Array = globalThis.Array;
this.Object = globalThis.Object;
this.Function = globalThis.Function;
`);
 //# sourceMappingURL=VMGlobalPropertyScript.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowPageOpenUtility.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WindowPageOpenUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$CrossOriginBrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/CrossOriginBrowserWindow.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchCORSUtility.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameURL.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
;
;
;
;
;
class WindowPageOpenUtility {
    /**
     * Opens a page.
     *
     * @param browserFrame Browser frame.
     * @param [options] Options.
     * @param [options.url] URL.
     * @param [options.target] Target.
     * @param [options.features] Window features.
     */ static openPage(browserFrame, options) {
        const features = this.getWindowFeatures(options?.features || '');
        const target = options?.target !== undefined ? String(options.target) : null;
        const originURL = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](browserFrame.window.location.href);
        const targetURL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].getRelativeURL(browserFrame, options?.url);
        const oldWindow = browserFrame.window;
        let targetFrame;
        if (browserFrame.window !== oldWindow) {
            return null;
        }
        switch(target){
            case '_self':
                targetFrame = browserFrame;
                break;
            case '_top':
                targetFrame = browserFrame.page.mainFrame;
                break;
            case '_parent':
                targetFrame = browserFrame.parentFrame ?? browserFrame;
                break;
            case '_blank':
            default:
                const newPage = browserFrame.page.context.newPage();
                targetFrame = newPage.mainFrame;
                targetFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openerFrame"]] = browserFrame;
                break;
        }
        targetFrame.goto(targetURL.href, {
            referrer: features.noreferrer ? undefined : browserFrame.window.location.origin,
            referrerPolicy: features.noreferrer ? 'no-referrer' : undefined
        }).catch((error)=>{
            targetFrame.page.console.error(error);
        });
        if (targetURL.protocol === 'javascript:') {
            return targetFrame.window;
        }
        // When using a detached Window instance directly and not via the Browser API we will not navigate and the window for the frame will not have changed.
        if (targetFrame === browserFrame && browserFrame.window === oldWindow) {
            return null;
        }
        if (features.popup && target !== '_self' && target !== '_top' && target !== '_parent') {
            targetFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["popup"]] = true;
            if (features?.width || features?.height) {
                targetFrame.page.setViewport({
                    width: features?.width,
                    height: features?.height
                });
            }
            if (features?.left) {
                targetFrame.window.screenLeft = features.left;
                targetFrame.window.screenX = features.left;
            }
            if (features?.top) {
                targetFrame.window.screenTop = features.top;
                targetFrame.window.screenY = features.top;
            }
        }
        if (target && target !== '_self' && target !== '_top' && target !== '_parent' && target !== '_blank') {
            targetFrame.window.name = target;
        }
        const isCORS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].isCORS(originURL, targetFrame.url);
        if (!features.noopener && !features.noreferrer && browserFrame.window && targetFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openerFrame"]] && targetFrame.window !== browserFrame.window) {
            targetFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openerWindow"]] = isCORS ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$CrossOriginBrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](browserFrame.window) : browserFrame.window;
        }
        if (features.noopener || features.noreferrer) {
            return null;
        }
        if (isCORS) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$CrossOriginBrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](targetFrame.window, browserFrame.window);
        }
        return targetFrame.window;
    }
    /**
     * Returns window features.
     *
     * @param features Window features string.
     * @returns Window features.
     */ static getWindowFeatures(features) {
        const parts = features.split(',');
        const result = {
            popup: false,
            width: 0,
            height: 0,
            left: 0,
            top: 0,
            noopener: false,
            noreferrer: false
        };
        for (const part of parts){
            const [key, value] = part.split('=');
            switch(key){
                case 'popup':
                    result.popup = !value || value === 'yes' || value === '1' || value === 'true';
                    break;
                case 'width':
                case 'innerWidth':
                    result.width = parseInt(value, 10);
                    break;
                case 'height':
                case 'innerHeight':
                    result.height = parseInt(value, 10);
                    break;
                case 'left':
                case 'screenX':
                    result.left = parseInt(value, 10);
                    break;
                case 'top':
                case 'screenY':
                    result.top = parseInt(value, 10);
                    break;
                case 'noopener':
                    result.noopener = true;
                    break;
                case 'noreferrer':
                    result.noreferrer = true;
                    break;
            }
        }
        return result;
    }
} //# sourceMappingURL=WindowPageOpenUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowContextClassExtender.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WindowContextClassExtender
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$Document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/document/Document.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$document$2f$HTMLDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-document/HTMLDocument.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$xml$2d$document$2f$XMLDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/xml-document/XMLDocument.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2d$fragment$2f$DocumentFragment$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/document-fragment/DocumentFragment.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$text$2f$Text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/text/Text.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$comment$2f$Comment$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/comment/Comment.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$image$2d$element$2f$Image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-image-element/Image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$audio$2d$element$2f$Audio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-audio-element/Audio.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/mutation-observer/MutationObserver.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$MessagePort$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/MessagePort.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSStyleSheet$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSStyleSheet.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMException.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Request$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Request.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Response.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/EventTarget.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequestUpload$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/xml-http-request/XMLHttpRequestUpload.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequestEventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/xml-http-request/XMLHttpRequestEventTarget.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$AbortController$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/AbortController.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$AbortSignal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/AbortSignal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$form$2d$data$2f$FormData$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/form-data/FormData.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$permissions$2f$PermissionStatus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/permissions/PermissionStatus.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequest$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/xml-http-request/XMLHttpRequest.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2d$parser$2f$DOMParser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom-parser/DOMParser.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$range$2f$Range$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/range/Range.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$VTTCue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/VTTCue.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/TextTrack.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/TextTrackList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackCue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/TextTrackCue.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$RemotePlayback$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/RemotePlayback.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$FileReader$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/FileReader.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$MediaStream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/MediaStream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$MediaStreamTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/MediaStreamTrack.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$canvas$2d$element$2f$CanvasCaptureMediaStreamTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-canvas-element/CanvasCaptureMediaStreamTrack.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/url/URL.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$web$2d$socket$2f$WebSocket$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/web-socket/WebSocket.js [app-rsc] (ecmascript)");
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
class WindowContextClassExtender {
    /**
     * Extends classes with a "window" property.
     *
     * @param window Window.
     */ static extendClasses(window) {
        /* eslint-disable jsdoc/require-jsdoc */ // Document
        class Document extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$Document$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Document.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Document = Document;
        // HTMLDocument
        class HTMLDocument extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$document$2f$HTMLDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        HTMLDocument.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.HTMLDocument = HTMLDocument;
        // XMLDocument
        class XMLDocument extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$xml$2d$document$2f$XMLDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        XMLDocument.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.XMLDocument = XMLDocument;
        // DocumentFragment
        class DocumentFragment extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2d$fragment$2f$DocumentFragment$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        DocumentFragment.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.DocumentFragment = DocumentFragment;
        // Text
        class Text extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$text$2f$Text$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Text.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Text = Text;
        // Comment
        class Comment extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$comment$2f$Comment$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Comment.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Comment = Comment;
        // Image
        class Image extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$image$2d$element$2f$Image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Image.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Image = Image;
        // Audio
        class Audio extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$audio$2d$element$2f$Audio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Audio.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Audio = Audio;
        // MutationObserver
        class MutationObserver extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        MutationObserver.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.MutationObserver = MutationObserver;
        // MessagePort
        class MessagePort extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$MessagePort$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        MessagePort.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.MessagePort = MessagePort;
        // CSSStyleSheet
        class CSSStyleSheet extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSStyleSheet$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        CSSStyleSheet.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.CSSStyleSheet = CSSStyleSheet;
        // DOMException
        class DOMException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        window.DOMException = DOMException;
        // Headers
        class Headers extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Headers.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Headers = Headers;
        // Request
        class Request extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Request$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Request.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Request = Request;
        // Response
        class Response extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Response.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        Response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Response = Response;
        // XMLHttpRequestEventTarget
        class EventTarget extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        EventTarget.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.EventTarget = EventTarget;
        // XMLHttpRequestUpload
        class XMLHttpRequestUpload extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequestUpload$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        XMLHttpRequestUpload.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.XMLHttpRequestUpload = XMLHttpRequestUpload;
        // XMLHttpRequestEventTarget
        class XMLHttpRequestEventTarget extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequestEventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        XMLHttpRequestEventTarget.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.XMLHttpRequestEventTarget = XMLHttpRequestEventTarget;
        // AbortController
        class AbortController extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$AbortController$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        AbortController.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.AbortController = AbortController;
        // AbortSignal
        class AbortSignal extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$AbortSignal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        AbortSignal.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        AbortSignal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.AbortSignal = AbortSignal;
        // FormData
        class FormData extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$form$2d$data$2f$FormData$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        FormData.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.FormData = FormData;
        // PermissionStatus
        class PermissionStatus extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$permissions$2f$PermissionStatus$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        PermissionStatus.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.PermissionStatus = PermissionStatus;
        // XMLHttpRequest
        class XMLHttpRequest extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$http$2d$request$2f$XMLHttpRequest$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        XMLHttpRequest.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.XMLHttpRequest = XMLHttpRequest;
        // DOMParser
        class DOMParser extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2d$parser$2f$DOMParser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        DOMParser.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.DOMParser = DOMParser;
        // Range
        class Range extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$range$2f$Range$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        Range.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.Range = Range;
        // VTTCue
        class VTTCue extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$VTTCue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        VTTCue.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.VTTCue = VTTCue;
        // TextTrack
        class TextTrack extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        TextTrack.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.TextTrack = TextTrack;
        // TextTrackList
        class TextTrackList extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        TextTrackList.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.TextTrackList = TextTrackList;
        // TextTrackCue
        class TextTrackCue extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackCue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        TextTrackCue.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.TextTrackCue = TextTrackCue;
        // RemotePlayback
        class RemotePlayback extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$RemotePlayback$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        RemotePlayback.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.RemotePlayback = RemotePlayback;
        // FileReader
        class FileReader extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$FileReader$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        FileReader.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.FileReader = FileReader;
        // MediaStream
        class MediaStream extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$MediaStream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        MediaStream.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.MediaStream = MediaStream;
        // MediaStreamTrack
        class MediaStreamTrack extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$MediaStreamTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        MediaStreamTrack.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.MediaStreamTrack = MediaStreamTrack;
        // MediaStreamTrack
        class CanvasCaptureMediaStreamTrack extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$canvas$2d$element$2f$CanvasCaptureMediaStreamTrack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        CanvasCaptureMediaStreamTrack.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.CanvasCaptureMediaStreamTrack = CanvasCaptureMediaStreamTrack;
        // URL
        class URL extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        URL.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.URL = URL;
        // WebSocket
        class WebSocket extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$web$2d$socket$2f$WebSocket$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
        }
        WebSocket.prototype[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = window;
        window.WebSocket = WebSocket;
    /* eslint-enable jsdoc/require-jsdoc */ }
} //# sourceMappingURL=WindowContextClassExtender.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/BrowserWindow.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserWindow
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream/web [external] (stream/web, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/vm [external] (vm, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$base64$2f$Base64$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/base64/Base64.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$clipboard$2f$Clipboard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/clipboard/Clipboard.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$clipboard$2f$ClipboardItem$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/clipboard/ClipboardItem.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSS$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSS.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSUnitValue.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/CSSStyleDeclaration.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSContainerRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSContainerRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSFontFaceRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSFontFaceRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframeRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframesRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframesRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSMediaRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSMediaRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSStyleRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSSupportsRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSSupportsRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$custom$2d$element$2f$CustomElementRegistry$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/custom-element/CustomElementRegistry.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransfer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/DataTransfer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransferItem$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/DataTransferItem.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransferItemList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/DataTransferItemList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Event.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/EventTarget.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Touch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Touch.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$UIEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/UIEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$AnimationEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/AnimationEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ClipboardEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/ClipboardEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$CustomEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/CustomEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ErrorEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/ErrorEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$FocusEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/FocusEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$HashChangeEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/HashChangeEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$InputEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/InputEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$KeyboardEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/KeyboardEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MediaQueryListEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/MediaQueryListEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MessageEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/MessageEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MouseEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/MouseEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$PointerEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/PointerEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ProgressEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/ProgressEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$StorageEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/StorageEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$SubmitEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/SubmitEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$TouchEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/TouchEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$WheelEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/WheelEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Fetch.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/Blob.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$File$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/File.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$History$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/history/History.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$intersection$2d$observer$2f$IntersectionObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/intersection-observer/IntersectionObserver.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$intersection$2d$observer$2f$IntersectionObserverEntry$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/intersection-observer/IntersectionObserverEntry.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$location$2f$Location$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/location/Location.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$match$2d$media$2f$MediaQueryList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/match-media/MediaQueryList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationRecord$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/mutation-observer/MutationRecord.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$MimeType$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/navigator/MimeType.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$MimeTypeArray$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/navigator/MimeTypeArray.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$Navigator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/navigator/Navigator.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$Plugin$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/navigator/Plugin.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$PluginArray$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/navigator/PluginArray.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$attr$2f$Attr$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/attr/Attr.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$character$2d$data$2f$CharacterData$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/character-data/CharacterData.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2d$type$2f$DocumentType$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/document-type/DocumentType.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$DocumentReadyStateEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/document/DocumentReadyStateEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$DocumentReadyStateManager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/document/DocumentReadyStateManager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMRect.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRectReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMRectReadOnly.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$Element$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/Element.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$HTMLCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/HTMLCollection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMap.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$anchor$2d$element$2f$HTMLAnchorElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-anchor-element/HTMLAnchorElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$area$2d$element$2f$HTMLAreaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-area-element/HTMLAreaElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$audio$2d$element$2f$HTMLAudioElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-audio-element/HTMLAudioElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$base$2d$element$2f$HTMLBaseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-base-element/HTMLBaseElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$body$2d$element$2f$HTMLBodyElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-body-element/HTMLBodyElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$br$2d$element$2f$HTMLBRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-br-element/HTMLBRElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$button$2d$element$2f$HTMLButtonElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-button-element/HTMLButtonElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$canvas$2d$element$2f$HTMLCanvasElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-canvas-element/HTMLCanvasElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$d$2d$list$2d$element$2f$HTMLDListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-d-list-element/HTMLDListElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$data$2d$element$2f$HTMLDataElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-data-element/HTMLDataElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$data$2d$list$2d$element$2f$HTMLDataListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-data-list-element/HTMLDataListElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$details$2d$element$2f$HTMLDetailsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-details-element/HTMLDetailsElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$dialog$2d$element$2f$HTMLDialogElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-dialog-element/HTMLDialogElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$div$2d$element$2f$HTMLDivElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-div-element/HTMLDivElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$element$2f$HTMLElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-element/HTMLElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$embed$2d$element$2f$HTMLEmbedElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-embed-element/HTMLEmbedElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$field$2d$set$2d$element$2f$HTMLFieldSetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-field-set-element/HTMLFieldSetElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$HTMLFormControlsCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-form-element/HTMLFormControlsCollection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$HTMLFormElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-form-element/HTMLFormElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$RadioNodeList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-form-element/RadioNodeList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$head$2d$element$2f$HTMLHeadElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-head-element/HTMLHeadElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$heading$2d$element$2f$HTMLHeadingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-heading-element/HTMLHeadingElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$hr$2d$element$2f$HTMLHRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-hr-element/HTMLHRElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$html$2d$element$2f$HTMLHtmlElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-html-element/HTMLHtmlElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$iframe$2d$element$2f$HTMLIFrameElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-iframe-element/HTMLIFrameElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$image$2d$element$2f$HTMLImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-image-element/HTMLImageElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$input$2d$element$2f$FileList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-input-element/FileList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$input$2d$element$2f$HTMLInputElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-input-element/HTMLInputElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$label$2d$element$2f$HTMLLabelElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-label-element/HTMLLabelElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$legend$2d$element$2f$HTMLLegendElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-legend-element/HTMLLegendElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$li$2d$element$2f$HTMLLIElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-li-element/HTMLLIElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$link$2d$element$2f$HTMLLinkElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-link-element/HTMLLinkElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$map$2d$element$2f$HTMLMapElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-map-element/HTMLMapElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$HTMLMediaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/HTMLMediaElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackCueList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/TextTrackCueList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TimeRanges$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-media-element/TimeRanges.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$menu$2d$element$2f$HTMLMenuElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-menu-element/HTMLMenuElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$meta$2d$element$2f$HTMLMetaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-meta-element/HTMLMetaElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$meter$2d$element$2f$HTMLMeterElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-meter-element/HTMLMeterElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$mod$2d$element$2f$HTMLModElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-mod-element/HTMLModElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$o$2d$list$2d$element$2f$HTMLOListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-o-list-element/HTMLOListElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$object$2d$element$2f$HTMLObjectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-object-element/HTMLObjectElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$opt$2d$group$2d$element$2f$HTMLOptGroupElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-opt-group-element/HTMLOptGroupElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$option$2d$element$2f$HTMLOptionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-option-element/HTMLOptionElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$output$2d$element$2f$HTMLOutputElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-output-element/HTMLOutputElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$paragraph$2d$element$2f$HTMLParagraphElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-paragraph-element/HTMLParagraphElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$param$2d$element$2f$HTMLParamElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-param-element/HTMLParamElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$picture$2d$element$2f$HTMLPictureElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-picture-element/HTMLPictureElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$pre$2d$element$2f$HTMLPreElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-pre-element/HTMLPreElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$progress$2d$element$2f$HTMLProgressElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-progress-element/HTMLProgressElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$quote$2d$element$2f$HTMLQuoteElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-quote-element/HTMLQuoteElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$script$2d$element$2f$HTMLScriptElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$select$2d$element$2f$HTMLSelectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-select-element/HTMLSelectElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$slot$2d$element$2f$HTMLSlotElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-slot-element/HTMLSlotElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$source$2d$element$2f$HTMLSourceElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-source-element/HTMLSourceElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$span$2d$element$2f$HTMLSpanElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-span-element/HTMLSpanElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$style$2d$element$2f$HTMLStyleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-style-element/HTMLStyleElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$caption$2d$element$2f$HTMLTableCaptionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-caption-element/HTMLTableCaptionElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$cell$2d$element$2f$HTMLTableCellElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-cell-element/HTMLTableCellElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$col$2d$element$2f$HTMLTableColElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-col-element/HTMLTableColElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$element$2f$HTMLTableElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-element/HTMLTableElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$row$2d$element$2f$HTMLTableRowElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-row-element/HTMLTableRowElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$section$2d$element$2f$HTMLTableSectionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-table-section-element/HTMLTableSectionElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$template$2d$element$2f$HTMLTemplateElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-template-element/HTMLTemplateElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$text$2d$area$2d$element$2f$HTMLTextAreaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-text-area-element/HTMLTextAreaElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$time$2d$element$2f$HTMLTimeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-time-element/HTMLTimeElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$title$2d$element$2f$HTMLTitleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-title-element/HTMLTitleElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$track$2d$element$2f$HTMLTrackElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-track-element/HTMLTrackElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$u$2d$list$2d$element$2f$HTMLUListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-u-list-element/HTMLUListElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$unknown$2d$element$2f$HTMLUnknownElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-unknown-element/HTMLUnknownElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$video$2d$element$2f$HTMLVideoElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-video-element/HTMLVideoElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$Node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/node/Node.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/node/NodeList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$processing$2d$instruction$2f$ProcessingInstruction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/processing-instruction/ProcessingInstruction.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$shadow$2d$root$2f$ShadowRoot$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/shadow-root/ShadowRoot.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$element$2f$SVGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-element/SVGElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$permissions$2f$Permissions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/permissions/Permissions.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$resize$2d$observer$2f$ResizeObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/resize-observer/ResizeObserver.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$Screen$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/screen/Screen.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$ScreenDetails$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/screen/ScreenDetails.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$ScreenDetailed$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/screen/ScreenDetailed.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$selection$2f$Selection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/selection/Selection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$storage$2f$Storage$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/storage/Storage.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$NodeFilter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/tree-walker/NodeFilter.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$NodeIterator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/tree-walker/NodeIterator.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$TreeWalker$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/tree-walker/TreeWalker.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$validity$2d$state$2f$ValidityState$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/validity-state/ValidityState.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$serializer$2f$XMLSerializer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/xml-serializer/XMLSerializer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$VMGlobalPropertyScript$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/VMGlobalPropertyScript.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowPageOpenUtility$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowPageOpenUtility.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$perf_hooks__$5b$external$5d$__$28$node$3a$perf_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventPhaseEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/EventPhaseEnum.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$select$2d$element$2f$HTMLOptionsCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/html-select-element/HTMLOptionsCollection.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowContextClassExtender$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowContextClassExtender.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$svg$2d$element$2f$SVGSVGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-svg-element/SVGSVGElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$graphics$2d$element$2f$SVGGraphicsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-graphics-element/SVGGraphicsElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$element$2f$SVGAnimateElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-animate-element/SVGAnimateElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$motion$2d$element$2f$SVGAnimateMotionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-animate-motion-element/SVGAnimateMotionElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$transform$2d$element$2f$SVGAnimateTransformElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-animate-transform-element/SVGAnimateTransformElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$circle$2d$element$2f$SVGCircleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-circle-element/SVGCircleElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$clip$2d$path$2d$element$2f$SVGClipPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-clip-path-element/SVGClipPathElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$defs$2d$element$2f$SVGDefsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-defs-element/SVGDefsElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$desc$2d$element$2f$SVGDescElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-desc-element/SVGDescElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$ellipse$2d$element$2f$SVGEllipseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-ellipse-element/SVGEllipseElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$blend$2d$element$2f$SVGFEBlendElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-blend-element/SVGFEBlendElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$color$2d$matrix$2d$element$2f$SVGFEColorMatrixElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-color-matrix-element/SVGFEColorMatrixElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$component$2d$transfer$2d$element$2f$SVGFEComponentTransferElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-component-transfer-element/SVGFEComponentTransferElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$composite$2d$element$2f$SVGFECompositeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-composite-element/SVGFECompositeElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$convolve$2d$matrix$2d$element$2f$SVGFEConvolveMatrixElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-convolve-matrix-element/SVGFEConvolveMatrixElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$diffuse$2d$lighting$2d$element$2f$SVGFEDiffuseLightingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-diffuse-lighting-element/SVGFEDiffuseLightingElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$displacement$2d$map$2d$element$2f$SVGFEDisplacementMapElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-displacement-map-element/SVGFEDisplacementMapElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$distant$2d$light$2d$element$2f$SVGFEDistantLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-distant-light-element/SVGFEDistantLightElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$drop$2d$shadow$2d$element$2f$SVGFEDropShadowElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-drop-shadow-element/SVGFEDropShadowElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$flood$2d$element$2f$SVGFEFloodElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-flood-element/SVGFEFloodElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$a$2d$element$2f$SVGFEFuncAElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-func-a-element/SVGFEFuncAElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$b$2d$element$2f$SVGFEFuncBElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-func-b-element/SVGFEFuncBElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$g$2d$element$2f$SVGFEFuncGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-func-g-element/SVGFEFuncGElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$r$2d$element$2f$SVGFEFuncRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-func-r-element/SVGFEFuncRElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$gaussian$2d$blur$2d$element$2f$SVGFEGaussianBlurElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-gaussian-blur-element/SVGFEGaussianBlurElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$image$2d$element$2f$SVGFEImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-image-element/SVGFEImageElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$merge$2d$element$2f$SVGFEMergeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-merge-element/SVGFEMergeElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$merge$2d$node$2d$element$2f$SVGFEMergeNodeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-merge-node-element/SVGFEMergeNodeElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$morphology$2d$element$2f$SVGFEMorphologyElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-morphology-element/SVGFEMorphologyElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$offset$2d$element$2f$SVGFEOffsetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-offset-element/SVGFEOffsetElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$point$2d$light$2d$element$2f$SVGFEPointLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-point-light-element/SVGFEPointLightElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$specular$2d$lighting$2d$element$2f$SVGFESpecularLightingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-specular-lighting-element/SVGFESpecularLightingElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$spot$2d$light$2d$element$2f$SVGFESpotLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-spot-light-element/SVGFESpotLightElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$tile$2d$element$2f$SVGFETileElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-tile-element/SVGFETileElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$turbulence$2d$element$2f$SVGFETurbulenceElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-fe-turbulence-element/SVGFETurbulenceElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$filter$2d$element$2f$SVGFilterElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-filter-element/SVGFilterElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$foreign$2d$object$2d$element$2f$SVGForeignObjectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-foreign-object-element/SVGForeignObjectElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$g$2d$element$2f$SVGGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-g-element/SVGGElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$image$2d$element$2f$SVGImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-image-element/SVGImageElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$line$2d$element$2f$SVGLineElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-line-element/SVGLineElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$linear$2d$gradient$2d$element$2f$SVGLinearGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-linear-gradient-element/SVGLinearGradientElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$marker$2d$element$2f$SVGMarkerElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-marker-element/SVGMarkerElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$mask$2d$element$2f$SVGMaskElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-mask-element/SVGMaskElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$metadata$2d$element$2f$SVGMetadataElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-metadata-element/SVGMetadataElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$m$2d$path$2d$element$2f$SVGMPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-m-path-element/SVGMPathElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$path$2d$element$2f$SVGPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-path-element/SVGPathElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$pattern$2d$element$2f$SVGPatternElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-pattern-element/SVGPatternElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$polygon$2d$element$2f$SVGPolygonElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-polygon-element/SVGPolygonElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$polyline$2d$element$2f$SVGPolylineElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-polyline-element/SVGPolylineElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$radial$2d$gradient$2d$element$2f$SVGRadialGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-radial-gradient-element/SVGRadialGradientElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$rect$2d$element$2f$SVGRectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-rect-element/SVGRectElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$script$2d$element$2f$SVGScriptElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-script-element/SVGScriptElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$set$2d$element$2f$SVGSetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-set-element/SVGSetElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$stop$2d$element$2f$SVGStopElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-stop-element/SVGStopElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$style$2d$element$2f$SVGStyleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-style-element/SVGStyleElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$switch$2d$element$2f$SVGSwitchElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-switch-element/SVGSwitchElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$symbol$2d$element$2f$SVGSymbolElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-symbol-element/SVGSymbolElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$element$2f$SVGTextElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-text-element/SVGTextElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$path$2d$element$2f$SVGTextPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-text-path-element/SVGTextPathElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$title$2d$element$2f$SVGTitleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-title-element/SVGTitleElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$t$2d$span$2d$element$2f$SVGTSpanElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-t-span-element/SVGTSpanElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$use$2d$element$2f$SVGUseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-use-element/SVGUseElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$view$2d$element$2f$SVGViewElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-view-element/SVGViewElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animation$2d$element$2f$SVGAnimationElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-animation-element/SVGAnimationElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$component$2d$transfer$2d$function$2d$element$2f$SVGComponentTransferFunctionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-component-transfer-function-element/SVGComponentTransferFunctionElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$geometry$2d$element$2f$SVGGeometryElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-geometry-element/SVGGeometryElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$gradient$2d$element$2f$SVGGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-gradient-element/SVGGradientElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$positioning$2d$element$2f$SVGTextPositioningElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/svg-text-positioning-element/SVGTextPositioningElement.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrixReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/dom-matrix/DOMMatrixReadOnly.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/dom-matrix/DOMMatrix.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngle$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAngle.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedAngle$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedAngle.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedBoolean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedBoolean.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedEnumeration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedEnumeration.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedInteger$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedInteger.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedLength$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedLength.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLength.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedNumber$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedNumber.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedNumberList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedNumberList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedPreserveAspectRatio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedPreserveAspectRatio.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedRect.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedString$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedString.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedTransformList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedTransformList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLengthList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGMatrix$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGMatrix.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumber.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumberList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumberList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPoint.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPointList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPointList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatio.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGRect.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGStringList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGStringList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransformList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGUnitTypes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGUnitTypes.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMPoint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMPoint.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedLengthList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedLengthList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$custom$2d$element$2f$CustomElementReactionStack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/custom-element/CustomElementReactionStack.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMapReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMapReadOnly.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMap.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$MediaList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/MediaList.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSKeywordValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSKeywordValue.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSStyleValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSStyleValue.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSConditionRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSGroupingRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSScopeRule.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$PopStateEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/PopStateEvent.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$CloseEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/events/CloseEvent.js [app-rsc] (ecmascript)");
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
const TIMER = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    queueMicrotask: globalThis.queueMicrotask.bind(globalThis),
    setImmediate: globalThis.setImmediate.bind(globalThis),
    clearImmediate: globalThis.clearImmediate.bind(globalThis)
};
const IS_NODE_JS_TIMEOUT_ENVIRONMENT = setTimeout.toString().includes('new Timeout');
const IS_CODE_GENERATION_FROM_STRINGS_ENVIRONMENT = (()=>{
    try {
        // eslint-disable-next-line no-new-func
        new Function('return true;')();
        return true;
    } catch  {
        return false;
    }
})();
const IS_UNFROZEN_INTRINSICS_ENVIRONMENT = (()=>{
    try {
        globalThis.Function['$UNFROZEN$'] = true;
        delete globalThis.Function['$UNFROZEN$'];
        return true;
    } catch  {
        return false;
    }
})();
/**
 * Class for PerformanceObserverEntryList as it is only available as an interface from Node.js.
 */ class PerformanceObserverEntryList {
    /**
     * Constructor.
     */ constructor(){
        throw new TypeError('Illegal constructor');
    }
}
/**
 * Zero Timeout.
 */ class Timeout {
    callback;
    /**
     * Constructor.
     * @param callback Callback.
     */ constructor(callback){
        this.callback = callback;
    }
}
class BrowserWindow extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
    // Nodes
    Node = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$Node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Attr = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$attr$2f$Attr$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ShadowRoot = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$shadow$2d$root$2f$ShadowRoot$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ProcessingInstruction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$processing$2d$instruction$2f$ProcessingInstruction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Element = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$Element$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CharacterData = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$character$2d$data$2f$CharacterData$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DocumentType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2d$type$2f$DocumentType$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // HTML Element classes
    HTMLAnchorElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$anchor$2d$element$2f$HTMLAnchorElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLButtonElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$button$2d$element$2f$HTMLButtonElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLOptGroupElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$opt$2d$group$2d$element$2f$HTMLOptGroupElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLOptionElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$option$2d$element$2f$HTMLOptionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$element$2f$HTMLElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLUnknownElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$unknown$2d$element$2f$HTMLUnknownElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTemplateElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$template$2d$element$2f$HTMLTemplateElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLInputElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$input$2d$element$2f$HTMLInputElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLSelectElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$select$2d$element$2f$HTMLSelectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTextAreaElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$text$2d$area$2d$element$2f$HTMLTextAreaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLImageElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$image$2d$element$2f$HTMLImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLStyleElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$style$2d$element$2f$HTMLStyleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLLabelElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$label$2d$element$2f$HTMLLabelElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLSlotElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$slot$2d$element$2f$HTMLSlotElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLMetaElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$meta$2d$element$2f$HTMLMetaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLMediaElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$HTMLMediaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLAudioElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$audio$2d$element$2f$HTMLAudioElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLVideoElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$video$2d$element$2f$HTMLVideoElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLBaseElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$base$2d$element$2f$HTMLBaseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDialogElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$dialog$2d$element$2f$HTMLDialogElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLScriptElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$script$2d$element$2f$HTMLScriptElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLLinkElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$link$2d$element$2f$HTMLLinkElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLIFrameElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$iframe$2d$element$2f$HTMLIFrameElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLFormElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$HTMLFormElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLUListElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$u$2d$list$2d$element$2f$HTMLUListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTrackElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$track$2d$element$2f$HTMLTrackElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableRowElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$row$2d$element$2f$HTMLTableRowElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTitleElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$title$2d$element$2f$HTMLTitleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTimeElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$time$2d$element$2f$HTMLTimeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableSectionElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$section$2d$element$2f$HTMLTableSectionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableCellElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$cell$2d$element$2f$HTMLTableCellElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$element$2f$HTMLTableElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLSpanElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$span$2d$element$2f$HTMLSpanElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLSourceElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$source$2d$element$2f$HTMLSourceElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLQuoteElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$quote$2d$element$2f$HTMLQuoteElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLProgressElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$progress$2d$element$2f$HTMLProgressElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLPreElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$pre$2d$element$2f$HTMLPreElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLPictureElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$picture$2d$element$2f$HTMLPictureElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLParamElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$param$2d$element$2f$HTMLParamElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLParagraphElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$paragraph$2d$element$2f$HTMLParagraphElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLOutputElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$output$2d$element$2f$HTMLOutputElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLOListElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$o$2d$list$2d$element$2f$HTMLOListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLObjectElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$object$2d$element$2f$HTMLObjectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLMeterElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$meter$2d$element$2f$HTMLMeterElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLMenuElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$menu$2d$element$2f$HTMLMenuElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLMapElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$map$2d$element$2f$HTMLMapElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLLIElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$li$2d$element$2f$HTMLLIElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLLegendElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$legend$2d$element$2f$HTMLLegendElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLModElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$mod$2d$element$2f$HTMLModElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLHtmlElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$html$2d$element$2f$HTMLHtmlElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLHRElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$hr$2d$element$2f$HTMLHRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLHeadElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$head$2d$element$2f$HTMLHeadElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLHeadingElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$heading$2d$element$2f$HTMLHeadingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLFieldSetElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$field$2d$set$2d$element$2f$HTMLFieldSetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLEmbedElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$embed$2d$element$2f$HTMLEmbedElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDListElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$d$2d$list$2d$element$2f$HTMLDListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDivElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$div$2d$element$2f$HTMLDivElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDetailsElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$details$2d$element$2f$HTMLDetailsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDataListElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$data$2d$list$2d$element$2f$HTMLDataListElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLDataElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$data$2d$element$2f$HTMLDataElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableColElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$col$2d$element$2f$HTMLTableColElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLTableCaptionElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$table$2d$caption$2d$element$2f$HTMLTableCaptionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLCanvasElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$canvas$2d$element$2f$HTMLCanvasElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLBRElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$br$2d$element$2f$HTMLBRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLBodyElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$body$2d$element$2f$HTMLBodyElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLAreaElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$area$2d$element$2f$HTMLAreaElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // SVG Element classes
    SVGSVGElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$svg$2d$element$2f$SVGSVGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimateElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$element$2f$SVGAnimateElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimateMotionElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$motion$2d$element$2f$SVGAnimateMotionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimateTransformElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animate$2d$transform$2d$element$2f$SVGAnimateTransformElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGCircleElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$circle$2d$element$2f$SVGCircleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGClipPathElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$clip$2d$path$2d$element$2f$SVGClipPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGDefsElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$defs$2d$element$2f$SVGDefsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGDescElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$desc$2d$element$2f$SVGDescElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGEllipseElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$ellipse$2d$element$2f$SVGEllipseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEBlendElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$blend$2d$element$2f$SVGFEBlendElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEColorMatrixElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$color$2d$matrix$2d$element$2f$SVGFEColorMatrixElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEComponentTransferElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$component$2d$transfer$2d$element$2f$SVGFEComponentTransferElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFECompositeElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$composite$2d$element$2f$SVGFECompositeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEConvolveMatrixElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$convolve$2d$matrix$2d$element$2f$SVGFEConvolveMatrixElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEDiffuseLightingElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$diffuse$2d$lighting$2d$element$2f$SVGFEDiffuseLightingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEDisplacementMapElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$displacement$2d$map$2d$element$2f$SVGFEDisplacementMapElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEDistantLightElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$distant$2d$light$2d$element$2f$SVGFEDistantLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEDropShadowElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$drop$2d$shadow$2d$element$2f$SVGFEDropShadowElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEFloodElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$flood$2d$element$2f$SVGFEFloodElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEFuncAElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$a$2d$element$2f$SVGFEFuncAElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEFuncBElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$b$2d$element$2f$SVGFEFuncBElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEFuncGElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$g$2d$element$2f$SVGFEFuncGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEFuncRElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$func$2d$r$2d$element$2f$SVGFEFuncRElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEGaussianBlurElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$gaussian$2d$blur$2d$element$2f$SVGFEGaussianBlurElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEImageElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$image$2d$element$2f$SVGFEImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEMergeElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$merge$2d$element$2f$SVGFEMergeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEMergeNodeElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$merge$2d$node$2d$element$2f$SVGFEMergeNodeElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEMorphologyElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$morphology$2d$element$2f$SVGFEMorphologyElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEOffsetElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$offset$2d$element$2f$SVGFEOffsetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFEPointLightElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$point$2d$light$2d$element$2f$SVGFEPointLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFESpecularLightingElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$specular$2d$lighting$2d$element$2f$SVGFESpecularLightingElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFESpotLightElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$spot$2d$light$2d$element$2f$SVGFESpotLightElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFETileElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$tile$2d$element$2f$SVGFETileElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFETurbulenceElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$fe$2d$turbulence$2d$element$2f$SVGFETurbulenceElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGFilterElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$filter$2d$element$2f$SVGFilterElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGForeignObjectElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$foreign$2d$object$2d$element$2f$SVGForeignObjectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGGElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$g$2d$element$2f$SVGGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGImageElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$image$2d$element$2f$SVGImageElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGLineElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$line$2d$element$2f$SVGLineElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGLinearGradientElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$linear$2d$gradient$2d$element$2f$SVGLinearGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGMarkerElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$marker$2d$element$2f$SVGMarkerElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGMaskElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$mask$2d$element$2f$SVGMaskElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGMetadataElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$metadata$2d$element$2f$SVGMetadataElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGMPathElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$m$2d$path$2d$element$2f$SVGMPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPathElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$path$2d$element$2f$SVGPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPatternElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$pattern$2d$element$2f$SVGPatternElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPolygonElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$polygon$2d$element$2f$SVGPolygonElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPolylineElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$polyline$2d$element$2f$SVGPolylineElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGRadialGradientElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$radial$2d$gradient$2d$element$2f$SVGRadialGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGRectElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$rect$2d$element$2f$SVGRectElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGScriptElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$script$2d$element$2f$SVGScriptElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGSetElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$set$2d$element$2f$SVGSetElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGStopElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$stop$2d$element$2f$SVGStopElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGStyleElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$style$2d$element$2f$SVGStyleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGSwitchElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$switch$2d$element$2f$SVGSwitchElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGSymbolElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$symbol$2d$element$2f$SVGSymbolElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTextElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$element$2f$SVGTextElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTextPathElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$path$2d$element$2f$SVGTextPathElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTitleElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$title$2d$element$2f$SVGTitleElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTSpanElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$t$2d$span$2d$element$2f$SVGTSpanElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGUseElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$use$2d$element$2f$SVGUseElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGViewElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$view$2d$element$2f$SVGViewElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // Abstract SVG Element classes
    SVGElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$element$2f$SVGElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimationElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$animation$2d$element$2f$SVGAnimationElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGComponentTransferFunctionElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$component$2d$transfer$2d$function$2d$element$2f$SVGComponentTransferFunctionElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGGeometryElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$geometry$2d$element$2f$SVGGeometryElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGGradientElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$gradient$2d$element$2f$SVGGradientElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTextPositioningElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$text$2d$positioning$2d$element$2f$SVGTextPositioningElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGGraphicsElement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$svg$2d$graphics$2d$element$2f$SVGGraphicsElement$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // Event classes
    Event = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    UIEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$UIEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CustomEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$CustomEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CloseEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$CloseEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    AnimationEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$AnimationEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    KeyboardEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$KeyboardEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MessageEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MessageEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MouseEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MouseEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    PointerEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$PointerEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    FocusEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$FocusEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    WheelEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$WheelEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    InputEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$InputEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ErrorEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ErrorEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    StorageEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$StorageEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SubmitEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$SubmitEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ProgressEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ProgressEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MediaQueryListEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MediaQueryListEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HashChangeEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$HashChangeEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ClipboardEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ClipboardEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TouchEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$TouchEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    PopStateEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$PopStateEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Touch = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Touch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // Non-implemented event classes
    AudioProcessingEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    BeforeInputEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    BeforeUnloadEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    BlobEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CompositionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSFontFaceLoadEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DeviceLightEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DeviceMotionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DeviceOrientationEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DeviceProximityEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMTransactionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DragEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    EditingBeforeInputEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    FetchEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    GamepadEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    IDBVersionChangeEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MediaStreamEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MutationEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    OfflineAudioCompletionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    OverconstrainedError = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    PageTransitionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    PaymentRequestUpdateEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RelatedEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RTCDataChannelEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RTCIdentityErrorEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RTCIdentityEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RTCPeerConnectionIceEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SensorEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGZoomEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TimeEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TrackEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TransitionEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    UserProximityEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    WebGLContextEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TextEvent = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    // Other classes that don't have to be bound to the Window context
    Permissions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$permissions$2f$Permissions$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    History = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$History$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Navigator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$Navigator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Clipboard = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$clipboard$2f$Clipboard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TimeRanges = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TimeRanges$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TextTrackCueList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$media$2d$element$2f$TextTrackCueList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ValidityState = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$validity$2d$state$2f$ValidityState$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MutationRecord = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationRecord$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    IntersectionObserver = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$intersection$2d$observer$2f$IntersectionObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    IntersectionObserverEntry = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$intersection$2d$observer$2f$IntersectionObserverEntry$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSStyleDeclaration = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSContainerRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSContainerRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSFontFaceRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSFontFaceRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSKeyframeRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSKeyframesRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframesRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSMediaRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSMediaRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSStyleRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSSupportsRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSSupportsRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSConditionRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSGroupingRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSScopeRule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMRect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMRectReadOnly = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRectReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Plugin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$Plugin$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    PluginArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$PluginArray$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Location = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$location$2f$Location$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CustomElementRegistry = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$custom$2d$element$2f$CustomElementRegistry$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ResizeObserver = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$resize$2d$observer$2f$ResizeObserver$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Blob = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    File = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$File$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Storage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$storage$2f$Storage$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MimeType = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$MimeType$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MimeTypeArray = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$MimeTypeArray$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    NodeFilter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$NodeFilter$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLCollection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$HTMLCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLFormControlCollection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$HTMLFormControlsCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    HTMLOptionsCollection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$select$2d$element$2f$HTMLOptionsCollection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    NodeList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    RadioNodeList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$form$2d$element$2f$RadioNodeList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    FileList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$html$2d$input$2d$element$2f$FileList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Screen = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$Screen$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ScreenDetails = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$ScreenDetails$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ScreenDetailed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$ScreenDetailed$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMMatrixReadOnly = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrixReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMMatrix = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    NamedNodeMap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    TreeWalker = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$TreeWalker$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    NodeIterator = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$tree$2d$walker$2f$NodeIterator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DataTransfer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransfer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DataTransferItem = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransferItem$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DataTransferItemList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$DataTransferItemList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    XMLSerializer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$xml$2d$serializer$2f$XMLSerializer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    ClipboardItem = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$clipboard$2f$ClipboardItem$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Selection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$selection$2f$Selection$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSUnitValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAngle = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngle$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedAngle = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedAngle$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedBoolean = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedBoolean$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedEnumeration = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedEnumeration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedInteger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedInteger$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedLength = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedLength$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedNumber = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedNumber$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedNumberList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedNumberList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedPreserveAspectRatio = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedPreserveAspectRatio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedRect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedString = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedString$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedTransformList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedTransformList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGLength = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGLengthList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGMatrix = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGMatrix$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGNumber = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGNumberList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumberList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPoint = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPointList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPointList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGPreserveAspectRatio = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatio$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGRect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGRect$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGStringList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGStringList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTransform = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGTransformList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGAnimatedLengthList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAnimatedLengthList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    SVGUnitTypes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGUnitTypes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    DOMPoint = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMPoint$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    StylePropertyMap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    StylePropertyMapReadOnly = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMapReadOnly$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    MediaList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$MediaList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSKeywordValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSKeywordValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    CSSStyleValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSStyleValue$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
    Window = this.constructor;
    // Node.js Classes
    URLSearchParams = __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URLSearchParams"];
    WritableStream = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Writable;
    ReadableStream = __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"];
    TransformStream = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Transform;
    PerformanceObserver = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$perf_hooks__$5b$external$5d$__$28$node$3a$perf_hooks$2c$__cjs$29$__["PerformanceObserver"];
    PerformanceEntry = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$perf_hooks__$5b$external$5d$__$28$node$3a$perf_hooks$2c$__cjs$29$__["PerformanceEntry"];
    PerformanceObserverEntryList = PerformanceObserverEntryList;
    // Public properties.
    document;
    customElements = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$custom$2d$element$2f$CustomElementRegistry$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](this);
    window = this;
    globalThis = this;
    performance = performance;
    screenLeft = 0;
    screenTop = 0;
    screenX = 0;
    screenY = 0;
    crypto = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["webcrypto"];
    TextEncoder = __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["TextEncoder"];
    TextDecoder = __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["TextDecoder"];
    closed = false;
    console;
    name = '';
    Buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"];
    // Public internal properties
    // Used for tracking capture event listeners to improve performance when they are not used.
    // See EventTarget class.
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mutationObservers"]] = [];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readyStateManager"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["location"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["history"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["navigator"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["screen"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionStorage"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["localStorage"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]] = this;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["top"]] = this;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = this;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["window"]] = this;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["frames"]] = this;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["internalId"]] = -1;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["customElementReactionStack"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$custom$2d$element$2f$CustomElementReactionStack$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](this);
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modules"]] = {
        json: new Map(),
        css: new Map(),
        esm: new Map()
    };
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["moduleImportMap"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openWebSockets"]] = [];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]] = new Map();
    /* eslint-enable jsdoc/require-jsdoc */ // Private properties
    #browserFrame;
    #innerWidth = null;
    #innerHeight = null;
    #outerWidth = null;
    #outerHeight = null;
    #devicePixelRatio = null;
    #zeroDelayTimeout = {
        timeouts: null
    };
    #timerLoopStacks = [];
    #timerLoopLimits = [];
    /**
     * Constructor.
     *
     * @param browserFrame Browser frame.
     * @param [options] Options.
     * @param [options.url] URL.
     */ constructor(browserFrame, options){
        super();
        this.#browserFrame = browserFrame;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateJavaScriptExecutionEnvironment"]]();
        this.console = browserFrame.page.console;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readyStateManager"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$DocumentReadyStateManager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](browserFrame);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["navigator"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$navigator$2f$Navigator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](this);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["screen"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$Screen$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionStorage"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$storage$2f$Storage$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["localStorage"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$storage$2f$Storage$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["location"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$location$2f$Location$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](this.#browserFrame, options?.url ?? 'about:blank');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["history"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$History$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](this.#browserFrame, this);
        browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["history"]].currentItem.href = options?.url ?? 'about:blank';
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].setWindowBrowserFrameRelation(this, this.#browserFrame);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setupVMContext"]]();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowContextClassExtender$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].extendClasses(this);
        // Document
        this.document = new this.HTMLDocument();
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultView"]] = this;
        // Ready state manager
        const taskID = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask(()=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readyStateManager"]].destroy());
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readyStateManager"]].waitUntilComplete().then(()=>{
            browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
            this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readyState"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$document$2f$DocumentReadyStateEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].complete;
            this.document.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]('readystatechange'));
            const loadEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]('load');
            // Not sure why target is set to document here, but this is how it seem to work in the browser
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["currentTarget"]] = this;
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["target"]] = this.document;
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eventPhase"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventPhaseEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].atTarget;
            this.dispatchEvent(loadEvent);
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["currentTarget"]] = null;
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["eventPhase"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventPhaseEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].none;
            loadEvent[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatching"]] = false;
        });
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bindMethods"]]();
    }
    // Events
    /* eslint-disable jsdoc/require-jsdoc */ get onsearch() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onsearch') ?? null;
    }
    set onsearch(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onsearch', value);
    }
    get onappinstalled() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onappinstalled') ?? null;
    }
    set onappinstalled(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onappinstalled', value);
    }
    get onbeforeinstallprompt() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforeinstallprompt') ?? null;
    }
    set onbeforeinstallprompt(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforeinstallprompt', value);
    }
    get onabort() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onabort') ?? null;
    }
    set onabort(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onabort', value);
    }
    get onbeforeinput() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforeinput') ?? null;
    }
    set onbeforeinput(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforeinput', value);
    }
    get onbeforematch() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforematch') ?? null;
    }
    set onbeforematch(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforematch', value);
    }
    get onbeforetoggle() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforetoggle') ?? null;
    }
    set onbeforetoggle(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforetoggle', value);
    }
    get onblur() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onblur') ?? null;
    }
    set onblur(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onblur', value);
    }
    get oncancel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncancel') ?? null;
    }
    set oncancel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncancel', value);
    }
    get oncanplay() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncanplay') ?? null;
    }
    set oncanplay(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncanplay', value);
    }
    get oncanplaythrough() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncanplaythrough') ?? null;
    }
    set oncanplaythrough(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncanplaythrough', value);
    }
    get onchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onchange') ?? null;
    }
    set onchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onchange', value);
    }
    get onclick() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onclick') ?? null;
    }
    set onclick(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onclick', value);
    }
    get onclose() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onclose') ?? null;
    }
    set onclose(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onclose', value);
    }
    get oncommand() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncommand') ?? null;
    }
    set oncommand(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncommand', value);
    }
    get oncontentvisibilityautostatechange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncontentvisibilityautostatechange') ?? null;
    }
    set oncontentvisibilityautostatechange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncontentvisibilityautostatechange', value);
    }
    get oncontextlost() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncontextlost') ?? null;
    }
    set oncontextlost(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncontextlost', value);
    }
    get oncontextmenu() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncontextmenu') ?? null;
    }
    set oncontextmenu(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncontextmenu', value);
    }
    get oncontextrestored() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncontextrestored') ?? null;
    }
    set oncontextrestored(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncontextrestored', value);
    }
    get oncuechange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oncuechange') ?? null;
    }
    set oncuechange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oncuechange', value);
    }
    get ondblclick() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondblclick') ?? null;
    }
    set ondblclick(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondblclick', value);
    }
    get ondrag() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondrag') ?? null;
    }
    set ondrag(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondrag', value);
    }
    get ondragend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondragend') ?? null;
    }
    set ondragend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondragend', value);
    }
    get ondragenter() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondragenter') ?? null;
    }
    set ondragenter(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondragenter', value);
    }
    get ondragleave() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondragleave') ?? null;
    }
    set ondragleave(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondragleave', value);
    }
    get ondragover() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondragover') ?? null;
    }
    set ondragover(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondragover', value);
    }
    get ondragstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondragstart') ?? null;
    }
    set ondragstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondragstart', value);
    }
    get ondrop() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondrop') ?? null;
    }
    set ondrop(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondrop', value);
    }
    get ondurationchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondurationchange') ?? null;
    }
    set ondurationchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondurationchange', value);
    }
    get onemptied() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onemptied') ?? null;
    }
    set onemptied(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onemptied', value);
    }
    get onended() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onended') ?? null;
    }
    set onended(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onended', value);
    }
    get onerror() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onerror') ?? null;
    }
    set onerror(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onerror', value);
    }
    get onfocus() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onfocus') ?? null;
    }
    set onfocus(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onfocus', value);
    }
    get onformdata() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onformdata') ?? null;
    }
    set onformdata(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onformdata', value);
    }
    get oninput() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oninput') ?? null;
    }
    set oninput(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oninput', value);
    }
    get oninvalid() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('oninvalid') ?? null;
    }
    set oninvalid(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('oninvalid', value);
    }
    get onkeydown() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onkeydown') ?? null;
    }
    set onkeydown(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onkeydown', value);
    }
    get onkeypress() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onkeypress') ?? null;
    }
    set onkeypress(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onkeypress', value);
    }
    get onkeyup() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onkeyup') ?? null;
    }
    set onkeyup(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onkeyup', value);
    }
    get onload() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onload') ?? null;
    }
    set onload(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onload', value);
    }
    get onloadeddata() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onloadeddata') ?? null;
    }
    set onloadeddata(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onloadeddata', value);
    }
    get onloadedmetadata() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onloadedmetadata') ?? null;
    }
    set onloadedmetadata(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onloadedmetadata', value);
    }
    get onloadstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onloadstart') ?? null;
    }
    set onloadstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onloadstart', value);
    }
    get onmousedown() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmousedown') ?? null;
    }
    set onmousedown(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmousedown', value);
    }
    get onmouseenter() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmouseenter') ?? null;
    }
    set onmouseenter(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmouseenter', value);
    }
    get onmouseleave() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmouseleave') ?? null;
    }
    set onmouseleave(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmouseleave', value);
    }
    get onmousemove() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmousemove') ?? null;
    }
    set onmousemove(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmousemove', value);
    }
    get onmouseout() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmouseout') ?? null;
    }
    set onmouseout(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmouseout', value);
    }
    get onmouseover() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmouseover') ?? null;
    }
    set onmouseover(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmouseover', value);
    }
    get onmouseup() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmouseup') ?? null;
    }
    set onmouseup(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmouseup', value);
    }
    get onmousewheel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmousewheel') ?? null;
    }
    set onmousewheel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmousewheel', value);
    }
    get onpause() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpause') ?? null;
    }
    set onpause(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpause', value);
    }
    get onplay() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onplay') ?? null;
    }
    set onplay(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onplay', value);
    }
    get onplaying() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onplaying') ?? null;
    }
    set onplaying(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onplaying', value);
    }
    get onprogress() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onprogress') ?? null;
    }
    set onprogress(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onprogress', value);
    }
    get onratechange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onratechange') ?? null;
    }
    set onratechange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onratechange', value);
    }
    get onreset() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onreset') ?? null;
    }
    set onreset(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onreset', value);
    }
    get onresize() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onresize') ?? null;
    }
    set onresize(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onresize', value);
    }
    get onscroll() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onscroll') ?? null;
    }
    set onscroll(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onscroll', value);
    }
    get onscrollend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onscrollend') ?? null;
    }
    set onscrollend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onscrollend', value);
    }
    get onsecuritypolicyviolation() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onsecuritypolicyviolation') ?? null;
    }
    set onsecuritypolicyviolation(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onsecuritypolicyviolation', value);
    }
    get onseeked() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onseeked') ?? null;
    }
    set onseeked(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onseeked', value);
    }
    get onseeking() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onseeking') ?? null;
    }
    set onseeking(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onseeking', value);
    }
    get onselect() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onselect') ?? null;
    }
    set onselect(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onselect', value);
    }
    get onslotchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onslotchange') ?? null;
    }
    set onslotchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onslotchange', value);
    }
    get onstalled() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onstalled') ?? null;
    }
    set onstalled(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onstalled', value);
    }
    get onsubmit() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onsubmit') ?? null;
    }
    set onsubmit(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onsubmit', value);
    }
    get onsuspend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onsuspend') ?? null;
    }
    set onsuspend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onsuspend', value);
    }
    get ontimeupdate() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontimeupdate') ?? null;
    }
    set ontimeupdate(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontimeupdate', value);
    }
    get ontoggle() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontoggle') ?? null;
    }
    set ontoggle(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontoggle', value);
    }
    get onvolumechange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onvolumechange') ?? null;
    }
    set onvolumechange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onvolumechange', value);
    }
    get onwaiting() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwaiting') ?? null;
    }
    set onwaiting(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwaiting', value);
    }
    get onwebkitanimationend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwebkitanimationend') ?? null;
    }
    set onwebkitanimationend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwebkitanimationend', value);
    }
    get onwebkitanimationiteration() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwebkitanimationiteration') ?? null;
    }
    set onwebkitanimationiteration(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwebkitanimationiteration', value);
    }
    get onwebkitanimationstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwebkitanimationstart') ?? null;
    }
    set onwebkitanimationstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwebkitanimationstart', value);
    }
    get onwebkittransitionend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwebkittransitionend') ?? null;
    }
    set onwebkittransitionend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwebkittransitionend', value);
    }
    get onwheel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onwheel') ?? null;
    }
    set onwheel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onwheel', value);
    }
    get onauxclick() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onauxclick') ?? null;
    }
    set onauxclick(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onauxclick', value);
    }
    get ongotpointercapture() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ongotpointercapture') ?? null;
    }
    set ongotpointercapture(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ongotpointercapture', value);
    }
    get onlostpointercapture() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onlostpointercapture') ?? null;
    }
    set onlostpointercapture(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onlostpointercapture', value);
    }
    get onpointerdown() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerdown') ?? null;
    }
    set onpointerdown(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerdown', value);
    }
    get onpointermove() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointermove') ?? null;
    }
    set onpointermove(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointermove', value);
    }
    get onpointerup() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerup') ?? null;
    }
    set onpointerup(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerup', value);
    }
    get onpointercancel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointercancel') ?? null;
    }
    set onpointercancel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointercancel', value);
    }
    get onpointerover() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerover') ?? null;
    }
    set onpointerover(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerover', value);
    }
    get onpointerout() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerout') ?? null;
    }
    set onpointerout(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerout', value);
    }
    get onpointerenter() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerenter') ?? null;
    }
    set onpointerenter(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerenter', value);
    }
    get onpointerleave() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerleave') ?? null;
    }
    set onpointerleave(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerleave', value);
    }
    get onselectstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onselectstart') ?? null;
    }
    set onselectstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onselectstart', value);
    }
    get onselectionchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onselectionchange') ?? null;
    }
    set onselectionchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onselectionchange', value);
    }
    get onanimationcancel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onanimationcancel') ?? null;
    }
    set onanimationcancel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onanimationcancel', value);
    }
    get onanimationend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onanimationend') ?? null;
    }
    set onanimationend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onanimationend', value);
    }
    get onanimationiteration() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onanimationiteration') ?? null;
    }
    set onanimationiteration(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onanimationiteration', value);
    }
    get onanimationstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onanimationstart') ?? null;
    }
    set onanimationstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onanimationstart', value);
    }
    get ontransitionrun() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontransitionrun') ?? null;
    }
    set ontransitionrun(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontransitionrun', value);
    }
    get ontransitionstart() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontransitionstart') ?? null;
    }
    set ontransitionstart(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontransitionstart', value);
    }
    get ontransitionend() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontransitionend') ?? null;
    }
    set ontransitionend(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontransitionend', value);
    }
    get ontransitioncancel() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ontransitioncancel') ?? null;
    }
    set ontransitioncancel(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ontransitioncancel', value);
    }
    get onbeforexrselect() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforexrselect') ?? null;
    }
    set onbeforexrselect(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforexrselect', value);
    }
    get onafterprint() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onafterprint') ?? null;
    }
    set onafterprint(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onafterprint', value);
    }
    get onbeforeprint() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforeprint') ?? null;
    }
    set onbeforeprint(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforeprint', value);
    }
    get onbeforeunload() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onbeforeunload') ?? null;
    }
    set onbeforeunload(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforeunload', value);
    }
    get onhashchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onhashchange') ?? null;
    }
    set onhashchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onhashchange', value);
    }
    get onlanguagechange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onlanguagechange') ?? null;
    }
    set onlanguagechange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onlanguagechange', value);
    }
    get onmessage() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmessage') ?? null;
    }
    set onmessage(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmessage', value);
    }
    get onmessageerror() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onmessageerror') ?? null;
    }
    set onmessageerror(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onmessageerror', value);
    }
    get onoffline() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onoffline') ?? null;
    }
    set onoffline(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onoffline', value);
    }
    get ononline() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ononline') ?? null;
    }
    set ononline(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ononline', value);
    }
    get onpagehide() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpagehide') ?? null;
    }
    set onpagehide(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpagehide', value);
    }
    get onpageshow() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpageshow') ?? null;
    }
    set onpageshow(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpageshow', value);
    }
    get onpopstate() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpopstate') ?? null;
    }
    set onpopstate(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpopstate', value);
    }
    get onrejectionhandled() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onrejectionhandled') ?? null;
    }
    set onrejectionhandled(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onrejectionhandled', value);
    }
    get onstorage() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onstorage') ?? null;
    }
    set onstorage(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onstorage', value);
    }
    get onunhandledrejection() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onunhandledrejection') ?? null;
    }
    set onunhandledrejection(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onunhandledrejection', value);
    }
    get onunload() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onunload') ?? null;
    }
    set onunload(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onunload', value);
    }
    get ondevicemotion() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondevicemotion') ?? null;
    }
    set ondevicemotion(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondevicemotion', value);
    }
    get ondeviceorientation() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondeviceorientation') ?? null;
    }
    set ondeviceorientation(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondeviceorientation', value);
    }
    get ondeviceorientationabsolute() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ondeviceorientationabsolute') ?? null;
    }
    set ondeviceorientationabsolute(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ondeviceorientationabsolute', value);
    }
    get onpointerrawupdate() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpointerrawupdate') ?? null;
    }
    set onpointerrawupdate(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpointerrawupdate', value);
    }
    get onpageswap() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpageswap') ?? null;
    }
    set onpageswap(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpageswap', value);
    }
    get onpagereveal() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onpagereveal') ?? null;
    }
    set onpagereveal(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onpagereveal', value);
    }
    get onscrollsnapchange() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onscrollsnapchange') ?? null;
    }
    set onscrollsnapchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onscrollsnapchange', value);
    }
    get onscrollsnapchanging() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('onscrollsnapchanging') ?? null;
    }
    set onscrollsnapchanging(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onscrollsnapchanging', value);
    }
    get ongamepadconnected() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ongamepadconnected') ?? null;
    }
    set ongamepadconnected(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ongamepadconnected', value);
    }
    get ongamepaddisconnected() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get('ongamepaddisconnected') ?? null;
    }
    set ongamepaddisconnected(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('ongamepaddisconnected', value);
    }
    /* eslint-enable jsdoc/require-jsdoc */ /**
     * Returns self.
     *
     * @returns Self.
     */ get self() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]];
    }
    /**
     * Sets self.
     *
     * @param self Self.
     */ set self(self) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["self"]] = self;
    }
    /**
     * Returns top.
     *
     * @returns Top.
     */ get top() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["top"]];
    }
    /**
     * Returns parent.
     *
     * @returns Parent.
     */ get parent() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]];
    }
    /**
     * Sets parent.
     *
     * @param parent Parent.
     */ set parent(parent) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = parent;
    }
    /**
     * Returns frames.
     *
     * @returns Frames.
     */ get frames() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["frames"]];
    }
    /**
     * Sets frames.
     *
     * @param frames Frames.
     */ set frames(frames) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = frames;
    }
    /**
     * Returns location.
     */ get location() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["location"]];
    }
    /**
     * Returns location.
     *
     * @param href Href.
     */ set location(href) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["location"]].href = href;
    }
    /**
     * Returns history.
     */ get history() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["history"]];
    }
    /**
     * Returns navigator.
     */ get navigator() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["navigator"]];
    }
    /**
     * Returns screen.
     */ get screen() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["screen"]];
    }
    /**
     * Returns session storage.
     */ get sessionStorage() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sessionStorage"]];
    }
    /**
     * Returns local storage.
     */ get localStorage() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["localStorage"]];
    }
    /**
     * Returns opener.
     *
     * @returns Opener.
     */ get opener() {
        return this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openerWindow"]];
    }
    /**
     * The number of pixels that the document is currently scrolled horizontally.
     *
     * @returns Scroll X.
     */ get scrollX() {
        return this.document?.documentElement?.scrollLeft ?? 0;
    }
    /**
     * The read-only Window property pageXOffset is an alias for scrollX.
     *
     * @returns Scroll X.
     */ get pageXOffset() {
        return this.scrollX;
    }
    /**
     * The number of pixels that the document is currently scrolled vertically.
     *
     * @returns Scroll Y.
     */ get scrollY() {
        return this.document?.documentElement?.scrollTop ?? 0;
    }
    /**
     * The read-only Window property pageYOffset is an alias for scrollY.
     *
     * @returns Scroll Y.
     */ get pageYOffset() {
        return this.scrollY;
    }
    /**
     * The CSS interface holds useful CSS-related methods.
     *
     * @returns CSS interface.
     */ get CSS() {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSS$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]();
    }
    /**
     * Returns inner width.
     *
     * @returns Inner width.
     */ get innerWidth() {
        if (this.#innerWidth === null) {
            return this.#browserFrame.page.viewport.width;
        }
        return this.#innerWidth;
    }
    /**
     * Sets inner width.
     *
     * @param value Inner width.
     */ set innerWidth(value) {
        this.#innerWidth = value;
    }
    /**
     * Returns inner height.
     *
     * @returns Inner height.
     */ get innerHeight() {
        // It seems like this value can be defined according to spec, but changing it has no effect on the actual viewport.
        if (this.#innerHeight === null) {
            return this.#browserFrame.page.viewport.height;
        }
        return this.#innerHeight;
    }
    /**
     * Sets inner height.
     *
     * @param value Inner height.
     */ set innerHeight(value) {
        this.#innerHeight = value;
    }
    /**
     * Returns outer width.
     *
     * @returns Outer width.
     */ get outerWidth() {
        // It seems like this value can be defined according to spec, but changing it has no effect on the actual viewport.
        if (this.#outerWidth === null) {
            return this.#browserFrame.page.viewport.width;
        }
        return this.#outerWidth;
    }
    /**
     * Sets outer width.
     *
     * @param value Outer width.
     */ set outerWidth(value) {
        this.#outerWidth = value;
    }
    /**
     * Returns outer height.
     *
     * @returns Outer height.
     */ get outerHeight() {
        if (this.#outerHeight === null) {
            return this.#browserFrame.page.viewport.height;
        }
        return this.#outerHeight;
    }
    /**
     * Sets outer height.
     *
     * @param value Outer height.
     */ set outerHeight(value) {
        this.#outerHeight = value;
    }
    /**
     * Returns device pixel ratio.
     *
     * @returns Device pixel ratio.
     */ get devicePixelRatio() {
        // It seems like this value can be defined according to spec, but changing it has no effect on the actual viewport.
        if (this.#devicePixelRatio === null) {
            return this.#browserFrame.page.viewport.devicePixelRatio;
        }
        return this.#devicePixelRatio;
    }
    /**
     * Sets device pixel ratio.
     *
     * @param value Device pixel ratio.
     */ set devicePixelRatio(value) {
        this.#devicePixelRatio = value;
    }
    /**
     * Returns an object containing the values of all CSS properties of an element.
     *
     * @param element Element.
     * @returns CSS style declaration.
     */ getComputedStyle(element) {
        element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["computedStyle"]] = element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["computedStyle"]] || new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["illegalConstructor"], this, {
            element,
            computed: true
        });
        return element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["computedStyle"]];
    }
    /**
     * Returns selection.
     *
     * @returns Selection.
     */ getSelection() {
        return this.document.getSelection();
    }
    /**
     * Scrolls to a particular set of coordinates.
     *
     * @param x X position or options object.
     * @param y Y position.
     */ scroll(x, y) {
        if (typeof x !== 'object' && arguments.length === 1) {
            throw new this.TypeError("Failed to execute 'scroll' on 'Window': The provided value is not of type 'ScrollToOptions'.");
        }
        const options = typeof x === 'object' ? x : {
            left: x,
            top: y
        };
        if (options.behavior === 'smooth') {
            this.setTimeout(()=>{
                if (options.top !== undefined) {
                    const top = Number(options.top);
                    this.document.documentElement.scrollTop = isNaN(top) ? 0 : top;
                }
                if (options.left !== undefined) {
                    const left = Number(options.left);
                    this.document.documentElement.scrollLeft = isNaN(left) ? 0 : left;
                }
            });
        } else {
            if (options.top !== undefined) {
                const top = Number(options.top);
                this.document.documentElement.scrollTop = isNaN(top) ? 0 : top;
            }
            if (options.left !== undefined) {
                const left = Number(options.left);
                this.document.documentElement.scrollLeft = isNaN(left) ? 0 : left;
            }
        }
    }
    /**
     * Scrolls to a particular set of coordinates.
     *
     * @param x X position or options object.
     * @param y Y position.
     */ scrollTo(x, y) {
        if (typeof x !== 'object' && arguments.length === 1) {
            throw new this.TypeError("Failed to execute 'scrollTo' on 'Window': The provided value is not of type 'ScrollToOptions'.");
        }
        this.scroll(x, y);
    }
    /**
     * Scrolls by a relative amount from the current position.
     *
     * @param x Pixels to scroll by from top or scroll options object.
     * @param y Pixels to scroll by from left.
     */ scrollBy(x, y) {
        if (typeof x !== 'object' && arguments.length === 1) {
            throw new this.TypeError("Failed to execute 'scrollBy' on 'Window': The provided value is not of type 'ScrollToOptions'.");
        }
        const options = typeof x === 'object' ? x : {
            left: x,
            top: y
        };
        this.scroll({
            left: this.document.documentElement.scrollLeft + (options.left ?? 0),
            top: this.document.documentElement.scrollTop + (options.top ?? 0),
            behavior: options.behavior
        });
    }
    /**
     * Shifts focus away from the window.
     */ blur() {
    // TODO: Implement.
    }
    /**
     * Gives focus to the window.
     */ focus() {
    // TODO: Implement.
    }
    /**
     * Loads a specified resource into a new or existing browsing context (that is, a tab, a window, or an iframe) under a specified name.
     *
     * @param [url] URL.
     * @param [target] Target.
     * @param [features] Window features.
     * @returns Window.
     */ open(url, target, features) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowPageOpenUtility$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].openPage(this.#browserFrame, {
            url,
            target,
            features
        });
    }
    /**
     * Closes the window.
     */ close() {
        // Users can only close the main frame of a page (not child frames such as iframes).
        if (this.#browserFrame.page.mainFrame === this.#browserFrame && // Scripts may close only the windows that were opened by them.
        // In this case, this means windows that have been opened by another window
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openerWindow"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
            this.#browserFrame.page.close();
        }
    }
    /**
     * Returns a new MediaQueryList object that can then be used to determine if the document matches the media query string.
     *
     * @param mediaQueryString A string specifying the media query to parse into a MediaQueryList.
     * @returns A new MediaQueryList.
     */ matchMedia(mediaQueryString) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$match$2d$media$2f$MediaQueryList$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]({
            window: this,
            media: mediaQueryString
        });
    }
    /**
     * Returns a promise that fulfills with a ScreenDetails object instance.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/getScreenDetails
     * @returns A Promise that fulfills with a ScreenDetails object instance.
     */ getScreenDetails() {
        return Promise.resolve(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$screen$2f$ScreenDetails$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]());
    }
    /**
     * Sets a timer which executes a function once the timer expires.
     *
     * @param callback Function to be executed.
     * @param [delay=0] Delay in ms.
     * @param args Arguments passed to the callback function.
     * @returns Timeout ID.
     */ setTimeout(callback, delay = 0, ...args) {
        if (this.closed) {
            return {};
        }
        const settings = this.#browserFrame.page.context.browser.settings;
        if (settings.timer.preventTimerLoops) {
            const stack = new Error().stack;
            const timerLoopStacks = this.#timerLoopStacks;
            const timerLoopLimits = this.#timerLoopLimits;
            const index = timerLoopStacks.indexOf(stack);
            if (index !== -1) {
                timerLoopLimits[index].timeout++;
                if (timerLoopLimits[index].timeout >= (settings.timer.preventTimerLoops === true ? 1 : settings.timer.preventTimerLoops.timeout ?? 1)) {
                    return {};
                }
            } else {
                timerLoopStacks.push(stack);
                timerLoopLimits.push({
                    timeout: 0,
                    requestAnimationFrame: 0
                });
            }
        }
        // We can group timeouts with a delay of 0 into one timeout to improve performance.
        // Grouping timeouts will also improve the performance of the async task manager.
        // It also makes the async task manager more stable as many timeouts may cause waitUntilComplete() to be resolved too early.
        if (!delay) {
            const zeroDelayTimeout = this.#zeroDelayTimeout;
            if (!zeroDelayTimeout.timeouts) {
                const useTryCatch = !settings || !settings.disableErrorCapturing && settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].tryAndCatch;
                const id = TIMER.setTimeout(()=>{
                    // We need to call endTimer() before the callback as the callback might throw an error.
                    this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTimer(id);
                    const timeouts = zeroDelayTimeout.timeouts;
                    zeroDelayTimeout.timeouts = null;
                    for (const timeout of timeouts){
                        if (useTryCatch) {
                            let result;
                            try {
                                result = timeout.callback();
                            } catch (error) {
                                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                            }
                            if (result instanceof Promise) {
                                result.catch((error)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error));
                            }
                        } else {
                            timeout.callback();
                        }
                    }
                }, 0);
                zeroDelayTimeout.timeouts = [];
                this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTimer(id);
            }
            const timeout = new Timeout(()=>callback(...args));
            zeroDelayTimeout.timeouts.push(timeout);
            return timeout;
        }
        const useTryCatch = !settings || !settings.disableErrorCapturing && settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].tryAndCatch;
        const id = TIMER.setTimeout(()=>{
            // We need to call endTimer() before the callback as the callback might throw an error.
            this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTimer(id);
            if (useTryCatch) {
                let result;
                try {
                    result = callback(...args);
                } catch (error) {
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                }
                if (result instanceof Promise) {
                    result.catch((error)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error));
                }
            } else {
                callback(...args);
            }
        }, settings?.timer.maxTimeout !== -1 && delay && delay > settings?.timer.maxTimeout ? settings?.timer.maxTimeout : delay);
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTimer(id);
        return id;
    }
    /**
     * Cancels a timeout previously established by calling setTimeout().
     *
     * @param id ID of the timeout.
     */ clearTimeout(id) {
        if (id && id instanceof Timeout) {
            const zeroDelayTimeout = this.#zeroDelayTimeout;
            if (!zeroDelayTimeout.timeouts) {
                return;
            }
            const index = zeroDelayTimeout.timeouts.indexOf(id);
            if (index !== -1) {
                zeroDelayTimeout.timeouts.splice(index, 1);
            }
            return;
        }
        // We need to make sure that the ID is a Timeout object, otherwise Node.js might throw an error.
        // This is only necessary if we are in a Node.js environment.
        if (IS_NODE_JS_TIMEOUT_ENVIRONMENT && (!id || id.constructor.name !== 'Timeout')) {
            return;
        }
        TIMER.clearTimeout(id);
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTimer(id);
    }
    /**
     * Calls a function with a fixed time delay between each call.
     *
     * @param callback Function to be executed.
     * @param [delay=0] Delay in ms.
     * @param args Arguments passed to the callback function.
     * @returns Interval ID.
     */ setInterval(callback, delay = 0, ...args) {
        if (this.closed) {
            return {};
        }
        const settings = this.#browserFrame.page.context.browser.settings;
        const useTryCatch = !settings || !settings.disableErrorCapturing && settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].tryAndCatch;
        let iterations = 0;
        const id = TIMER.setInterval(()=>{
            if (useTryCatch) {
                let result;
                try {
                    result = callback(...args);
                } catch (error) {
                    this.clearInterval(id);
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                }
                if (result instanceof Promise) {
                    result.catch((error)=>{
                        this.clearInterval(id);
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                    });
                }
            } else {
                callback(...args);
            }
            if (settings?.timer.maxIntervalIterations !== -1) {
                if (iterations >= settings?.timer.maxIntervalIterations) {
                    this.clearInterval(id);
                }
                iterations++;
            }
        }, settings?.timer.maxIntervalTime !== -1 && delay && delay > settings?.timer.maxIntervalTime ? settings?.timer.maxIntervalTime : delay);
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTimer(id);
        return id;
    }
    /**
     * Cancels a timed repeating action which was previously established by a call to setInterval().
     *
     * @param id ID of the interval.
     */ clearInterval(id) {
        // We need to make sure that the ID is a Timeout object, otherwise Node.js might throw an error.
        // This is only necessary if we are in a Node.js environment.
        if (IS_NODE_JS_TIMEOUT_ENVIRONMENT && (!id || id.constructor.name !== 'Timeout')) {
            return;
        }
        TIMER.clearInterval(id);
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTimer(id);
    }
    /**
     * Mock animation frames with timeouts.
     *
     * @param callback Callback.
     * @returns ID.
     */ requestAnimationFrame(callback) {
        if (this.closed) {
            return {};
        }
        const settings = this.#browserFrame.page.context.browser.settings;
        if (settings.timer.preventTimerLoops) {
            const stack = new Error().stack;
            const timerLoopStacks = this.#timerLoopStacks;
            const timerLoopLimits = this.#timerLoopLimits;
            const index = timerLoopStacks.indexOf(stack);
            if (index !== -1) {
                timerLoopLimits[index].requestAnimationFrame++;
                if (timerLoopLimits[index].requestAnimationFrame >= (settings.timer.preventTimerLoops === true ? 1 : settings.timer.preventTimerLoops.requestAnimationFrame ?? 1)) {
                    return {};
                }
            } else {
                timerLoopStacks.push(stack);
                timerLoopLimits.push({
                    timeout: 0,
                    requestAnimationFrame: 0
                });
            }
        }
        const useTryCatch = !settings || !settings.disableErrorCapturing && settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].tryAndCatch;
        const id = TIMER.setImmediate(()=>{
            // We need to call endImmediate() before the callback as the callback might throw an error.
            this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endImmediate(id);
            if (useTryCatch) {
                let result;
                try {
                    result = callback(this.performance.now());
                } catch (error) {
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                }
                if (result instanceof Promise) {
                    result.catch((error)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error));
                }
            } else {
                callback(this.performance.now());
            }
        });
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startImmediate(id);
        return id;
    }
    /**
     * Mock animation frames with timeouts.
     *
     * @param id ID.
     */ cancelAnimationFrame(id) {
        // We need to make sure that the ID is an Immediate object, otherwise Node.js might throw an error.
        // This is only necessary if we are in a Node.js environment.
        if (IS_NODE_JS_TIMEOUT_ENVIRONMENT && (!id || id.constructor.name !== 'Immediate')) {
            return;
        }
        TIMER.clearImmediate(id);
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endImmediate(id);
    }
    /**
     * Queues a microtask to be executed at a safe time prior to control returning to the browser's event loop.
     *
     * @param callback Function to be executed.
     */ queueMicrotask(callback) {
        if (this.closed) {
            return;
        }
        let isAborted = false;
        const taskId = this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask(()=>isAborted = true);
        const settings = this.#browserFrame.page.context.browser.settings;
        const useTryCatch = !settings || !settings.disableErrorCapturing && settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].tryAndCatch;
        TIMER.queueMicrotask(()=>{
            if (!isAborted) {
                // We need to call endTask() before the callback as the callback might throw an error.
                this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskId);
                if (useTryCatch) {
                    let result;
                    try {
                        result = callback();
                    } catch (error) {
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                    }
                    if (result instanceof Promise) {
                        result.catch((error)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error));
                    }
                } else {
                    callback();
                }
            }
        });
    }
    /**
     * This method provides an easy, logical way to fetch resources asynchronously across the network.
     *
     * @param url URL.
     * @param [init] Init.
     * @returns Promise.
     */ async fetch(url, init) {
        if (this.closed) {
            return Promise.reject(new this.DOMException("Failed to execute 'fetch' on 'Window': The window is closed.", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].invalidStateError));
        }
        return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]({
            browserFrame: this.#browserFrame,
            window: this,
            url,
            init
        }).send();
    }
    /**
     * Creates a Base64-encoded ASCII string from a binary string (i.e., a string in which each character in the string is treated as a byte of binary data).
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/btoa
     * @param data Binay data.
     * @returns Base64-encoded string.
     */ btoa(data) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$base64$2f$Base64$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].btoa(data);
    }
    /**
     * Decodes a string of data which has been encoded using Base64 encoding.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/atob
     * @see https://infra.spec.whatwg.org/#forgiving-base64-encode.
     * @see Https://html.spec.whatwg.org/multipage/webappapis.html#btoa.
     * @param data Binay string.
     * @returns An ASCII string containing decoded data from encodedData.
     */ atob(data) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$base64$2f$Base64$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].atob(data);
    }
    /**
     * Safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.
     *
     * @param message Message.
     * @param [targetOrigin=*] Target origin.
     * @param _transfer Transfer. Not implemented.
     */ postMessage(message, targetOrigin = '*', _transfer) {
        // TODO: Implement transfer.
        if (this.closed) {
            return;
        }
        if (targetOrigin && targetOrigin !== '*' && this.location.origin !== targetOrigin) {
            throw new this.DOMException(`Failed to execute 'postMessage' on 'Window': The target origin provided ('${targetOrigin}') does not match the recipient window\'s origin ('${this.location.origin}').`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].securityError);
        }
        try {
            JSON.stringify(message);
        } catch (error) {
            throw new this.DOMException(`Failed to execute 'postMessage' on 'Window': The provided message cannot be serialized.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        this.setTimeout(()=>this.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$MessageEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]('message', {
                data: message,
                origin: this.#browserFrame.parentFrame ? this.#browserFrame.parentFrame.window.location.origin : this.#browserFrame.window.location.origin,
                source: this.#browserFrame.parentFrame ? this.#browserFrame.parentFrame.window : this.#browserFrame.window,
                lastEventId: ''
            })));
    }
    /**
     * Resizes the window.
     *
     * @param width Width.
     * @param height Height.
     */ resizeTo(width, height) {
        if (this.closed) {
            return;
        }
        if (!width || !height) {
            throw new this.DOMException(`Failed to execute 'resizeTo' on 'Window': 2 arguments required, but only ${arguments.length} present.`);
        }
        // We can only resize the window if it is a popup.
        if (this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["popup"]]) {
            this.#browserFrame.page.setViewport({
                width,
                height
            });
        }
    }
    /**
     * Resizes the current window by a specified amount.
     *
     * @param width Width.
     * @param height Height.
     */ resizeBy(width, height) {
        if (this.closed) {
            return;
        }
        if (!width || !height) {
            throw new this.DOMException(`Failed to execute 'resizeBy' on 'Window': 2 arguments required, but only ${arguments.length} present.`);
        }
        // We can only resize the window if it is a popup.
        if (this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["popup"]]) {
            const viewport = this.#browserFrame.page.viewport;
            this.#browserFrame.page.setViewport({
                width: viewport.width + width,
                height: viewport.height + height
            });
        }
    }
    /**
     * Dispatches an error event and outputs the error to the console.
     *
     * @param error Error.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dispatchError"]](error) {
        this.#browserFrame.page.console.error(error);
        this.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$events$2f$ErrorEvent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]('error', {
            message: error.message,
            error
        }));
    }
    /**
     * Evaluates code in a VM context.
     *
     * @param code Code.
     * @param [options] Options.
     * @param [options.filename] Filename.
     * @returns any.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateScript"]](code, options) {
        return new __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["default"].Script(code, options).runInContext(this);
    }
    /**
     * Setup of VM context.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setupVMContext"]]() {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["default"].isContext(this)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["default"].createContext(this);
            // Sets global properties from the VM to the Window object.
            // Otherwise "this.Array" will be undefined for example.
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$VMGlobalPropertyScript$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].runInContext(this);
        }
    }
    /**
     * Checks if the JavaScript execution environment is secure and outputs a warning if not.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateJavaScriptExecutionEnvironment"]]() {
        const browserFrame = this.#browserFrame;
        if ((IS_CODE_GENERATION_FROM_STRINGS_ENVIRONMENT || IS_UNFROZEN_INTRINSICS_ENVIRONMENT) && browserFrame.page.context.browser.settings.enableJavaScriptEvaluation && !browserFrame.page.context.browser.settings.suppressInsecureJavaScriptEnvironmentWarning && !browserFrame.page.context.browser.settings.suppressCodeGenerationFromStringsWarning) {
            // eslint-disable-next-line no-console
            console.warn('\nWarning! Happy DOM has JavaScript evaluation enabled and is running in an insecure environment.' + '\n\nA VM Context is not an isolated environment, and if you run untrusted code you are at risk of RCE (Remote Code Execution) attacks. The attacker can escape the VM and run code at process level.' + '\n\nIt is recommended to disable code generation and freeze all builtins at process level by running node with the flags "--disallow-code-generation-from-strings" and "--frozen-intrinsics".' + ' You can suppress this warning by setting "suppressInsecureJavaScriptEnvironmentWarning" to "true" at your own risk.' + '\n\nFor more information, see https://github.com/capricorn86/happy-dom/wiki/JavaScript-Evaluation-Warning\n\n');
        }
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]() {
        if (this.closed) {
            return;
        }
        super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        this.closed = true;
        const mutationObservers = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mutationObservers"]];
        for (const mutationObserver of mutationObservers){
            if (mutationObserver[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]) {
                mutationObserver[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
            }
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mutationObservers"]] = [];
        for (const webSocket of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openWebSockets"]]){
            webSocket[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["openWebSockets"]] = [];
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        // Create some empty elements for scripts that are still running.
        const htmlElement = this.document.createElement('html');
        const headElement = this.document.createElement('head');
        const bodyElement = this.document.createElement('body');
        htmlElement.appendChild(headElement);
        htmlElement.appendChild(bodyElement);
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appendChild"]](htmlElement);
        if (this.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]) {
            this.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        }
        if (this.customElements[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]) {
            this.customElements[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        }
        if (this.history[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]) {
            this.history[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["destroy"]]();
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modules"]].json.clear();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modules"]].css.clear();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modules"]].esm.clear();
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["preloads"]].clear();
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["activeElement"]] = null;
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nextActiveElement"]] = null;
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["currentScript"]] = null;
        this.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["selection"]] = null;
        // Clear parent/top references to break circular references
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parent"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["top"]] = null;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].removeWindowBrowserFrameRelation(this);
    }
    /**
     * Binds methods to a window as scope.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["bindMethods"]]() {
        for (const _class of [
            BrowserWindow,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
        ]){
            const propertyDescriptors = Object.getOwnPropertyDescriptors(_class.prototype);
            const keys = Object.keys(propertyDescriptors);
            for (const key of keys){
                const descriptor = propertyDescriptors[key];
                if (descriptor.get || descriptor.set) {
                    Object.defineProperty(this, key, {
                        ...descriptor,
                        get: descriptor.get?.bind(this),
                        set: descriptor.set?.bind(this)
                    });
                } else if (key !== 'constructor' && typeof descriptor.value === 'function' && !descriptor.value.toString().startsWith('class ')) {
                    Object.defineProperty(this, key, {
                        ...descriptor,
                        value: descriptor.value.bind(this)
                    });
                }
            }
        }
    }
} //# sourceMappingURL=BrowserWindow.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/DetachedWindowAPI.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API for detached windows to be able to access features of the browser.
 */ __turbopack_context__.s([
    "default",
    ()=>DetachedWindowAPI
]);
class DetachedWindowAPI {
    #browserFrame;
    /**
     * Constructor.
     *
     * @param browserFrame Browser frame.
     */ constructor(browserFrame){
        this.#browserFrame = browserFrame;
    }
    /**
     * Returns settings.
     *
     * @returns Settings.
     */ get settings() {
        return this.#browserFrame.page.context.browser.settings;
    }
    /**
     * Returns virtual console printer.
     *
     * @returns Virtual console printer.
     */ get virtualConsolePrinter() {
        return this.#browserFrame.page.virtualConsolePrinter;
    }
    /**
     * Waits for all async tasks to complete.
     *
     * @returns Promise.
     */ waitUntilComplete() {
        return this.#browserFrame.waitUntilComplete();
    }
    /**
     * Waits for all async tasks to complete.
     *
     * @deprecated Use waitUntilComplete() instead.
     * @returns Promise.
     */ whenAsyncComplete() {
        return this.waitUntilComplete();
    }
    /**
     * Aborts all async tasks.
     */ abort() {
        return this.#browserFrame.abort();
    }
    /**
     * Aborts all async tasks.
     *
     * @deprecated Use abort() instead.
     */ cancelAsync() {
        return this.abort();
    }
    /**
     * Aborts all async tasks and closes the window.
     */ close() {
        return this.#browserFrame.page.close();
    }
    /**
     * Sets the URL without navigating the browser.
     *
     * @param url URL.
     */ setURL(url) {
        this.#browserFrame.url = url;
    }
    /**
     * Sets the viewport.
     *
     * @param viewport Viewport.
     */ setViewport(viewport) {
        this.#browserFrame.page.setViewport(viewport);
    }
    /**
     * Sets the window size.
     *
     * @deprecated Use setViewport() instead.
     * @param options Options.
     * @param options.width Width.
     * @param options.height Height.
     */ setWindowSize(options) {
        this.setViewport({
            width: options?.width,
            height: options?.height
        });
    }
    /**
     * Sets the window width.
     *
     * @deprecated Use setViewport() instead.
     * @param width Width.
     */ setInnerWidth(width) {
        this.setViewport({
            width
        });
    }
    /**
     * Sets the window height.
     *
     * @deprecated Use setViewport() instead.
     * @param height Height.
     */ setInnerHeight(height) {
        this.setViewport({
            height
        });
    }
} //# sourceMappingURL=DetachedWindowAPI.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/Window.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Window
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$DetachedWindowAPI$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/DetachedWindowAPI.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/BrowserWindow.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowser.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
;
;
;
;
class Window extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
    // Detached Window API.
    happyDOM;
    /**
     * Constructor.
     *
     * @param [options] Options.
     * @param [options.width] Window width. Defaults to "1024".
     * @param [options.height] Window height. Defaults to "768".
     * @param [options.innerWidth] Inner width. Deprecated. Defaults to "1024".
     * @param [options.innerHeight] Inner height. Deprecated. Defaults to "768".
     * @param [options.url] URL.
     * @param [options.console] Console.
     * @param [options.settings] Settings.
     */ constructor(options){
        const browser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowser$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            console: options?.console,
            settings: options?.settings
        });
        const browserPage = browser.defaultContext.pages[0];
        const browserFrame = browserPage.mainFrame;
        if (options && (options.width || options.height || options.innerWidth || options.innerHeight)) {
            Object.assign(browserPage.viewport, {
                width: options.width || options.innerWidth || browserPage.viewport.width,
                height: options.height || options.innerHeight || browserPage.viewport.height
            });
        }
        super(browserFrame, {
            url: options?.url
        });
        browserFrame.window = this;
        if (browserFrame.page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["exceptionObserver"]]) {
            browserFrame.page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["exceptionObserver"]].observe(this);
        }
        this.happyDOM = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$DetachedWindowAPI$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](browserFrame);
    }
} //# sourceMappingURL=Window.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/GlobalWindow.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GlobalWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$Window$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/Window.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
;
;
;
class GlobalWindow extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$Window$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"] {
    // Node.js Globals
    Array = globalThis.Array;
    ArrayBuffer = globalThis.ArrayBuffer;
    Boolean = globalThis.Boolean;
    Buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"];
    DataView = globalThis.DataView;
    Date = globalThis.Date;
    Error = globalThis.Error;
    EvalError = globalThis.EvalError;
    Float32Array = globalThis.Float32Array;
    Float64Array = globalThis.Float64Array;
    Function = globalThis.Function;
    Infinity = globalThis.Infinity;
    Int16Array = globalThis.Int16Array;
    Int32Array = globalThis.Int32Array;
    Int8Array = globalThis.Int8Array;
    Intl = globalThis.Intl;
    JSON = globalThis.JSON;
    Map = globalThis.Map;
    Math = globalThis.Math;
    NaN = globalThis.NaN;
    Number = globalThis.Number;
    Object = globalThis.Object;
    Promise = globalThis.Promise;
    RangeError = globalThis.RangeError;
    ReferenceError = globalThis.ReferenceError;
    RegExp = globalThis.RegExp;
    Set = globalThis.Set;
    String = globalThis.String;
    Symbol = globalThis.Symbol;
    SyntaxError = globalThis.SyntaxError;
    TypeError = globalThis.TypeError;
    URIError = globalThis.URIError;
    Uint16Array = globalThis.Uint16Array;
    Uint32Array = globalThis.Uint32Array;
    Uint8Array = globalThis.Uint8Array;
    Uint8ClampedArray = globalThis.Uint8ClampedArray;
    WeakMap = globalThis.WeakMap;
    WeakSet = globalThis.WeakSet;
    decodeURI = globalThis.decodeURI;
    decodeURIComponent = globalThis.decodeURIComponent;
    encodeURI = globalThis.encodeURI;
    encodeURIComponent = globalThis.encodeURIComponent;
    eval = globalThis.eval;
    /**
     * @deprecated
     */ escape = globalThis.escape;
    global = globalThis;
    isFinite = globalThis.isFinite;
    isNaN = globalThis.isNaN;
    parseFloat = globalThis.parseFloat;
    parseInt = globalThis.parseInt;
    undefined = globalThis.undefined;
    /**
     * @deprecated
     */ unescape = globalThis.unescape;
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluateScript"]](code, options) {
        if (options?.filename) {
            return this.eval(`${code}\n//# sourceURL=${options.filename}`);
        }
        return this.eval(code);
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setupVMContext"]]() {
    // Do nothing
    }
} //# sourceMappingURL=GlobalWindow.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/Window.js [app-rsc] (ecmascript) <export default as Window>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Window",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$Window$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$Window$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/Window.js [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_window_4b27f803._.js.map