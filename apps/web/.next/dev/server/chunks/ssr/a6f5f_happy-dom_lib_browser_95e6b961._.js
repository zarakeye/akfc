module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var BrowserErrorCaptureEnum;
(function(BrowserErrorCaptureEnum) {
    /** Happy DOM use try and catch when evaluating code, but will not be able to catch all errors and Promise rejections. This will decrease performance as using try and catch makes the execution significally slower. This is the default setting. */ BrowserErrorCaptureEnum["tryAndCatch"] = "tryAndCatch";
    /** Happy DOM will add an event listener to the Node.js process to catch all errors and Promise rejections. This will not work in Jest and Vitest as it conflicts with their error listeners. */ BrowserErrorCaptureEnum["processLevel"] = "processLevel";
    /** Error capturing is disabled. Errors and Promise rejections will be thrown. */ BrowserErrorCaptureEnum["disabled"] = "disabled";
})(BrowserErrorCaptureEnum || (BrowserErrorCaptureEnum = {}));
const __TURBOPACK__default__export__ = BrowserErrorCaptureEnum;
 //# sourceMappingURL=BrowserErrorCaptureEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameURL.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrameURL
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class BrowserFrameURL {
    /**
     * Returns relative URL.
     *
     * @param frame Frame.
     * @param url URL.
     * @returns Relative URL.
     */ static getRelativeURL(frame, url) {
        url = url ? String(url) : 'about:blank';
        if (url.startsWith('about:') || url.startsWith('javascript:')) {
            return new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](url);
        }
        try {
            // Use internal PropertySymbol.location to avoid being affected by mocks on window.location
            return new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](url, frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["location"]].href);
        } catch (e) {
            return new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"]('about:blank');
        }
    }
} //# sourceMappingURL=BrowserFrameURL.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameFactory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrameFactory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class BrowserFrameFactory {
    /**
     * Creates a new frame.
     *
     * @param parentFrame Parent frame.
     * @returns Frame.
     */ static createChildFrame(parentFrame) {
        const frame = new parentFrame.constructor(parentFrame.page);
        frame.parentFrame = parentFrame;
        parentFrame.childFrames.push(frame);
        return frame;
    }
    /**
     * Aborts all ongoing operations and destroys the frame.
     *
     * @param frame Frame.
     */ static destroyFrame(frame) {
        const exceptionObserver = frame.page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]];
        if (frame.closed) {
            return Promise.resolve();
        }
        frame.closed = true;
        // Using Promise instead of async/await to prevent usage of a microtask
        return new Promise((resolve, reject)=>{
            if (!frame.window) {
                resolve();
                return;
            }
            if (frame.parentFrame) {
                const index = frame.parentFrame.childFrames.indexOf(frame);
                if (index !== -1) {
                    frame.parentFrame.childFrames.splice(index, 1);
                }
            }
            if (!frame.childFrames.length) {
                frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].destroy().then(()=>{
                    if (exceptionObserver && frame.window) {
                        exceptionObserver.disconnect(frame.window);
                    }
                    frame.window = {
                        closed: true
                    };
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]] = null;
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerWindow"]] = null;
                    // Clear navigation listeners
                    if (frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]]) {
                        frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
                    }
                    resolve();
                }).catch((error)=>reject(error));
                if (frame.window) {
                    frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]();
                }
                return;
            }
            Promise.all(frame.childFrames.slice().map((childFrame)=>this.destroyFrame(childFrame))).then(()=>{
                frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].destroy().then(()=>{
                    if (exceptionObserver && frame.window) {
                        exceptionObserver.disconnect(frame.window);
                    }
                    frame.window = {
                        closed: true
                    };
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]] = null;
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerWindow"]] = null;
                    // Clear navigation listeners
                    if (frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]]) {
                        frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
                    }
                    resolve();
                }).catch((error)=>reject(error));
                if (frame.window) {
                    frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]();
                }
            }).catch((error)=>reject(error));
        });
    }
} //# sourceMappingURL=BrowserFrameFactory.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserNavigationCrossOriginPolicyEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var BrowserNavigationCrossOriginPolicyEnum;
(function(BrowserNavigationCrossOriginPolicyEnum) {
    /** The browser can navigate to any origin. */ BrowserNavigationCrossOriginPolicyEnum["anyOrigin"] = "anyOrigin";
    /** The browser can only navigate to the same origin as the current page or its parent. */ BrowserNavigationCrossOriginPolicyEnum["sameOrigin"] = "sameOrigin";
    /** The browser can never navigate from a secure protocol (https) to an unsecure protocol (http), but it can always navigate to a secure (https). */ BrowserNavigationCrossOriginPolicyEnum["strictOrigin"] = "strictOrigin";
})(BrowserNavigationCrossOriginPolicyEnum || (BrowserNavigationCrossOriginPolicyEnum = {}));
const __TURBOPACK__default__export__ = BrowserNavigationCrossOriginPolicyEnum;
 //# sourceMappingURL=BrowserNavigationCrossOriginPolicyEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameValidator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrameValidator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserNavigationCrossOriginPolicyEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserNavigationCrossOriginPolicyEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class BrowserFrameValidator {
    /**
     * Returns true if the frame navigation complies with the cross origin policy.
     *
     * @param frame Frame.
     * @param toURL URL.
     * @returns True if the frame navigation complies with the cross origin policy.
     */ static validateCrossOriginPolicy(frame, toURL) {
        const settings = frame.page.context.browser.settings;
        let fromURL = frame.page.mainFrame.window.location;
        if (frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]]) {
            fromURL = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]].window.location;
        } else if (frame.parentFrame) {
            fromURL = frame.parentFrame.window.location;
        }
        if (settings.navigation.crossOriginPolicy === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserNavigationCrossOriginPolicyEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].sameOrigin && fromURL.protocol !== 'about:' && toURL.protocol !== 'about:' && toURL.protocol !== 'javascript:' && fromURL.origin !== toURL.origin) {
            return false;
        }
        if (settings.navigation.crossOriginPolicy === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserNavigationCrossOriginPolicyEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].strictOrigin && fromURL.protocol === 'https:' && toURL.protocol === 'http:') {
            return false;
        }
        return true;
    }
    /**
     * Returns true if navigation is allowed for the frame.
     *
     * @param frame Frame.
     * @returns True if navigation is allowed for the frame.
     */ static validateFrameNavigation(frame) {
        const settings = frame.page.context.browser.settings;
        // When using the Window instance directly and not via the Browser API we should not navigate the browser frame.
        // Only a detached browser has a windowClass property and we want to avoid a circular dependency.
        if (frame.page.context.browser.windowClass && frame.page.context === frame.page.context.browser.defaultContext && frame.page.context.pages[0] === frame.page && frame.page.mainFrame === frame) {
            return false;
        }
        if (settings.navigation.disableMainFrameNavigation && frame.page.mainFrame === frame) {
            return false;
        }
        if (settings.navigation.disableChildFrameNavigation && frame.page.mainFrame !== frame) {
            return false;
        }
        if (settings.navigation.disableChildPageNavigation && !!frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]]) {
            return false;
        }
        return true;
    }
} //# sourceMappingURL=BrowserFrameValidator.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameNavigator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrameNavigator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameURL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameValidator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameValidator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/async-task-manager/AsyncTaskManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryScrollRestorationEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/history/HistoryScrollRestorationEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Fetch.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
class BrowserFrameNavigator {
    /**
     * Navigates to a page.
     *
     * @throws Error if the request can't be resolved (because of SSL error or similar). It will not throw if the response is not ok.
     * @param options Options.
     * @param options.windowClass Window class.
     * @param options.frame Frame.
     * @param options.url URL.
     * @param [options.goToOptions] Go to options.
     * @param [options.method] Method.
     * @param [options.formData] Form data.
     * @param [options.disableHistory] Disables adding the navigation to the history.
     * @returns Response.
     */ static async navigate(options) {
        const { windowClass, frame, url, formData, method, goToOptions, disableHistory } = options;
        const exceptionObserver = frame.page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]];
        const referrer = goToOptions?.referrer || frame.window.location.origin;
        const targetURL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRelativeURL(frame, url);
        const targetURLWithoutHash = new URL(targetURL.href.split('#')[0]);
        const currentURLWithoutHash = new URL(frame.url.split('#')[0]);
        const resolveNavigationListeners = ()=>{
            const listeners = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation;
            frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
            for (const listener of listeners){
                listener();
            }
        };
        if (!frame.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        // Hash navigation
        if (targetURLWithoutHash.href === currentURLWithoutHash.href && targetURL.hash && targetURL.hash !== frame.window?.location.hash) {
            const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
            if (!disableHistory) {
                history.currentItem.popState = true;
                history.push({
                    title: '',
                    href: targetURL.href,
                    state: null,
                    popState: true,
                    scrollRestoration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryScrollRestorationEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].manual,
                    method: method || (formData ? 'POST' : 'GET'),
                    formData: formData || null
                });
            }
            frame.window.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, targetURL.href);
            return null;
        }
        // Javascript protocol
        if (targetURL.protocol === 'javascript:') {
            if (frame && frame.page.context.browser.settings.enableJavaScriptEvaluation) {
                const readyStateManager = frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readyStateManager"]];
                const asyncTaskManager = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
                const taskID = readyStateManager.startTask();
                const code = targetURL.href.replace('javascript:', '');
                // The browser will wait for the next tick before executing the script.
                // Fixes issue where evaluating the response can throw an error.
                // By using requestAnimationFrame() the error will not reject the promise.
                // The error will be caught by process error level listener or a try and catch in the requestAnimationFrame().
                await new Promise((resolve)=>{
                    frame.window.requestAnimationFrame(()=>{
                        const immediate = setImmediate(()=>{
                            asyncTaskManager.endTask(taskID);
                            resolve(null);
                        });
                        const taskID = asyncTaskManager.startTask(()=>()=>{
                                clearImmediate(immediate);
                                resolve(null);
                            });
                        frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScript"]](code, {
                            filename: frame.url
                        });
                    });
                });
                readyStateManager.endTask(taskID);
                resolveNavigationListeners();
            }
            return null;
        }
        // Validate navigation
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameValidator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateCrossOriginPolicy(frame, targetURL)) {
            return null;
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameValidator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateFrameNavigation(frame)) {
            if (!frame.page.context.browser.settings.navigation.disableFallbackToSetURL) {
                frame.window.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, targetURL.href);
            }
            return null;
        }
        // History management.
        if (!disableHistory) {
            const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
            history.push({
                title: '',
                href: targetURL.href,
                state: null,
                popState: false,
                scrollRestoration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryScrollRestorationEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].auto,
                method: method || (formData ? 'POST' : 'GET'),
                formData: formData || null
            });
        }
        // Store current Window state
        const previousWindow = frame.window;
        const previousAsyncTaskManager = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        const width = previousWindow.innerWidth;
        const height = previousWindow.innerHeight;
        const devicePixelRatio = previousWindow.devicePixelRatio;
        const parentWindow = frame.parentFrame ? frame.parentFrame.window : frame.page.mainFrame.window;
        const topWindow = frame.page.mainFrame.window;
        // Create new Window
        frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](frame);
        frame.window = new windowClass(frame, {
            url: targetURL.href,
            width,
            height
        });
        frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parent"]] = parentWindow;
        frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["top"]] = topWindow;
        frame.window.devicePixelRatio = devicePixelRatio;
        if (exceptionObserver) {
            exceptionObserver.observe(frame.window);
        }
        if (referrer) {
            frame.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] = referrer;
        }
        // Destroy child frames and Window
        const destroyTaskID = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask();
        const destroyWindowAndAsyncTaskManager = ()=>{
            previousAsyncTaskManager.destroy().then(()=>{
                if (exceptionObserver) {
                    exceptionObserver.disconnect(previousWindow);
                }
                frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(destroyTaskID);
            });
            previousWindow[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]();
        };
        if (frame.childFrames.length) {
            Promise.all(frame.childFrames.map((childFrame)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].destroyFrame(childFrame))).then(destroyWindowAndAsyncTaskManager);
        } else {
            destroyWindowAndAsyncTaskManager();
        }
        // About protocol
        if (targetURL.protocol === 'about:') {
            if (goToOptions?.beforeContentCallback) {
                goToOptions.beforeContentCallback(frame.window);
            }
            if (frame.page.context.browser.settings.navigation.beforeContentCallback) {
                frame.page.context.browser.settings.navigation.beforeContentCallback(frame.window);
            }
            await new Promise((resolve)=>frame.page.mainFrame.window.requestAnimationFrame(resolve));
            resolveNavigationListeners();
            return null;
        }
        // Start navigation
        const readyStateManager = frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readyStateManager"]];
        const asyncTaskManager = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        const abortController = new frame.window.AbortController();
        const timeout = setTimeout(()=>{
            asyncTaskManager.endTimer(timeout);
            abortController.abort(new frame.window.DOMException('The operation was aborted. Request timed out.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].timeoutError));
        }, goToOptions?.timeout ?? 30000);
        asyncTaskManager.startTimer(timeout);
        const taskID = readyStateManager.startTask();
        const finalize = ()=>{
            clearTimeout(timeout);
            asyncTaskManager.endTimer(timeout);
            readyStateManager.endTask(taskID);
            resolveNavigationListeners();
        };
        const headers = new frame.window.Headers(goToOptions?.headers);
        let response;
        let responseText;
        if (goToOptions?.hard) {
            headers.set('Cache-Control', 'no-cache');
        }
        const fetch = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            browserFrame: frame,
            window: frame.window,
            url: targetURL.href,
            disableSameOriginPolicy: true,
            init: {
                referrer,
                referrerPolicy: goToOptions?.referrerPolicy || 'origin',
                signal: abortController.signal,
                method: method || (formData ? 'POST' : 'GET'),
                headers,
                body: formData
            }
        });
        try {
            response = await fetch.send();
            // Handles the "X-Frame-Options" header for child frames.
            if (frame.parentFrame) {
                const originURL = frame.parentFrame.window.location;
                const xFrameOptions = response.headers?.get('X-Frame-Options')?.toLowerCase();
                const isSameOrigin = originURL.origin === targetURL.origin || targetURL.origin === 'null';
                if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin' && !isSameOrigin) {
                    throw new Error(`Refused to display '${url}' in a frame because it set 'X-Frame-Options' to '${xFrameOptions}'.`);
                }
            }
            responseText = await response.text();
        } catch (error) {
            finalize();
            throw error;
        }
        // The frame may be destroyed during teardown.
        if (!frame.window) {
            return null;
        }
        if (response.url) {
            frame.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["location"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, response.url);
        }
        if (!response.ok) {
            frame.page.console.error(`GET ${targetURL.href} ${response.status} (${response.statusText})`);
        }
        if (goToOptions?.beforeContentCallback) {
            goToOptions.beforeContentCallback(frame.window);
        }
        if (frame.page.context.browser.settings.navigation.beforeContentCallback) {
            frame.page.context.browser.settings.navigation.beforeContentCallback(frame.window);
        }
        // Fixes issue where evaluating the response can throw an error.
        // By using requestAnimationFrame() the error will not reject the promise.
        // The error will be caught by process error level listener or a try and catch in the requestAnimationFrame().
        await new Promise((resolve)=>{
            frame.window.requestAnimationFrame(()=>{
                // "immediate" needs to be assigned before initialization in Node v20
                // eslint-disable-next-line prefer-const
                let immediate;
                const taskID = asyncTaskManager.startTask(()=>()=>{
                        clearImmediate(immediate);
                        resolve(null);
                    });
                immediate = setImmediate(()=>{
                    asyncTaskManager.endTask(taskID);
                    resolve(null);
                });
                frame.content = responseText;
            });
        });
        finalize();
        return response;
    }
    /**
     * Navigates back in history.
     *
     * @param options Options.
     * @param options.windowClass Window class.
     * @param options.frame Frame.
     * @param [options.goToOptions] Go to options.
     */ static navigateBack(options) {
        const { windowClass, frame, goToOptions } = options;
        const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
        const historyItem = history.items[history.items.indexOf(history.currentItem) - 1];
        if (!historyItem) {
            return new Promise((resolve)=>{
                frame.window.requestAnimationFrame(()=>{
                    const listeners = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation;
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
                    for (const listener of listeners){
                        listener();
                    }
                    resolve(null);
                });
            });
        }
        const fromOrigin = new URL(history.currentItem.href).origin;
        const toOrigin = new URL(historyItem.href).origin;
        history.currentItem = historyItem;
        if (!historyItem.popState || fromOrigin !== toOrigin) {
            return BrowserFrameNavigator.navigate({
                windowClass,
                frame,
                goToOptions: {
                    ...goToOptions,
                    referrer: frame.url
                },
                url: historyItem.href,
                method: historyItem.method,
                formData: historyItem.formData,
                disableHistory: true
            });
        }
        frame.window.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, historyItem.href);
        frame.window.dispatchEvent(new frame.window.PopStateEvent('popstate', {
            state: historyItem.state,
            hasUAVisualTransition: false
        }));
        return Promise.resolve(null);
    }
    /**
     * Navigates forward in history.
     *
     * @param options Options.
     * @param options.windowClass Window class.
     * @param options.frame Frame.
     * @param [options.goToOptions] Go to options.
     */ static navigateForward(options) {
        const { windowClass, frame, goToOptions } = options;
        const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
        const historyItem = history.items[history.items.indexOf(history.currentItem) + 1];
        if (!historyItem) {
            return new Promise((resolve)=>{
                frame.window.requestAnimationFrame(()=>{
                    const listeners = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation;
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
                    for (const listener of listeners){
                        listener();
                    }
                    resolve(null);
                });
            });
        }
        const fromOrigin = new URL(history.currentItem.href).origin;
        const toOrigin = new URL(historyItem.href).origin;
        history.currentItem = historyItem;
        if (!historyItem.popState || fromOrigin !== toOrigin) {
            return BrowserFrameNavigator.navigate({
                windowClass,
                frame,
                goToOptions: {
                    ...goToOptions,
                    referrer: frame.url
                },
                url: historyItem.href,
                method: historyItem.method,
                formData: historyItem.formData,
                disableHistory: true
            });
        }
        frame.window.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, historyItem.href);
        frame.window.dispatchEvent(new frame.window.PopStateEvent('popstate', {
            state: historyItem.state,
            hasUAVisualTransition: false
        }));
        return Promise.resolve(null);
    }
    /**
     * Navigates steps in history.
     *
     * @param options Options.
     * @param options.windowClass Window class.
     * @param options.frame Frame.
     * @param options.goToOptions Go to options.
     * @param options.steps Steps.
     */ static navigateSteps(options) {
        if (!options.steps) {
            return this.reload(options);
        }
        const { windowClass, frame, goToOptions, steps } = options;
        const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
        const fromIndex = history.items.indexOf(history.currentItem);
        const toIndex = fromIndex + steps;
        const historyItem = history.items[toIndex];
        if (!historyItem) {
            return new Promise((resolve)=>{
                frame.window.requestAnimationFrame(()=>{
                    const listeners = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation;
                    frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation = [];
                    for (const listener of listeners){
                        listener();
                    }
                    resolve(null);
                });
            });
        }
        const fromOrigin = new URL(history.currentItem.href).origin;
        let isPopState = true;
        if (steps < 0) {
            for(let i = fromIndex; i > toIndex; i--){
                if (!history.items[i].popState || fromOrigin !== new URL(history.items[i].href).origin) {
                    isPopState = false;
                    break;
                }
            }
        } else {
            for(let i = fromIndex; i < toIndex; i++){
                if (!history.items[i].popState || fromOrigin !== new URL(history.items[i].href).origin) {
                    isPopState = false;
                    break;
                }
            }
        }
        history.currentItem = historyItem;
        if (!isPopState) {
            return BrowserFrameNavigator.navigate({
                windowClass,
                frame,
                goToOptions: {
                    ...goToOptions,
                    referrer: frame.url
                },
                url: historyItem.href,
                method: historyItem.method,
                formData: historyItem.formData,
                disableHistory: true
            });
        }
        frame.window.location[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](frame, historyItem.href);
        frame.window.dispatchEvent(new frame.window.PopStateEvent('popstate', {
            state: historyItem.state,
            hasUAVisualTransition: false
        }));
        return Promise.resolve(null);
    }
    /**
     * Reloads the current history item.
     *
     * @param options Options.
     * @param options.windowClass Window class.
     * @param options.frame Frame.
     * @param options.goToOptions Go to options.
     */ static reload(options) {
        const { windowClass, frame, goToOptions } = options;
        const history = frame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]];
        return BrowserFrameNavigator.navigate({
            windowClass,
            frame,
            goToOptions: {
                ...goToOptions,
                referrer: frame.url
            },
            url: history.currentItem.href,
            method: history.currentItem.method,
            formData: history.currentItem.formData,
            disableHistory: true
        });
    }
} //# sourceMappingURL=BrowserFrameNavigator.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameScriptEvaluator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrameScriptEvaluator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$CSSModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/module/CSSModule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$ECMAScriptModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/module/ECMAScriptModule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$JSONModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/module/JSONModule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$ModuleFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/module/ModuleFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/vm [external] (vm, cjs)");
;
;
;
;
;
class BrowserFrameScriptEvaluator {
    /**
     * Evaluates code or a VM Script in the frame's context.
     *
     * @param frame Frame.
     * @param script Script.
     * @returns Result.
     */ static evaluate(frame, script) {
        if (!frame.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        script = typeof script === 'string' ? new __TURBOPACK__imported__module__$5b$externals$5d2f$vm__$5b$external$5d$__$28$vm$2c$__cjs$29$__["Script"](script) : script;
        return script.runInContext(frame.window);
    }
    /**
     * Evaluates a module in the frame's context.
     *
     * @param frame Frame.
     * @param options Options.
     * @param options.url URL.
     * @param options.type Module type.
     * @param options.code Code.
     * @returns Exports.
     */ static async evaluateModule(frame, options) {
        if (!frame.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        const window = frame.window;
        if (options?.code) {
            const url = options.url ? new URL(options.url, window.location.href) : window.location;
            const source = options.code;
            switch(options?.type || 'esm'){
                case 'esm':
                    const factory = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$ModuleFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window, url);
                    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$ECMAScriptModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                        window,
                        url,
                        source,
                        factory
                    }).evaluate();
                case 'json':
                    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$JSONModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                        window,
                        url,
                        source
                    }).evaluate();
                case 'css':
                    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$CSSModule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                        window,
                        url,
                        source
                    }).evaluate();
            }
        }
        if (options?.url) {
            const module = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$module$2f$ModuleFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window, window.location).getModule(options.url, {
                with: {
                    type: options.type || 'esm'
                }
            });
            return await module.evaluate();
        }
        return {};
    }
} //# sourceMappingURL=BrowserFrameScriptEvaluator.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserFrame.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserFrame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/async-task-manager/AsyncTaskManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/BrowserWindow.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameURL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameScriptEvaluator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameNavigator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryItemList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/history/HistoryItemList.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
class BrowserFrame {
    childFrames = [];
    parentFrame = null;
    page;
    window;
    closed = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]] = {
        navigation: []
    };
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerWindow"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["popup"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryItemList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    /**
     * Constructor.
     *
     * @param page Page.
     */ constructor(page){
        this.page = page;
        this.window = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        // Attach process level error capturing.
        if (page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]]) {
            page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]].observe(this.window);
        }
    }
    /**
     * Returns the content.
     *
     * @returns Content.
     */ get content() {
        return this.window.document.documentElement.outerHTML;
    }
    /**
     * Sets the content.
     *
     * @param content Content.
     */ set content(content) {
        this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFirstWrite"]] = true;
        this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFirstWriteAfterOpen"]] = false;
        this.window.document.open();
        this.window.document.write(content);
    }
    /**
     * Returns the URL.
     *
     * @returns URL.
     */ get url() {
        return this.window.location.href;
    }
    /**
     * Sets the content.
     *
     * @param url URL.
     */ set url(url) {
        this.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["location"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](this, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRelativeURL(this, url).href);
    }
    /**
     * Returns document.
     *
     * @returns Document.
     */ get document() {
        return this.window?.document ?? null;
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     */ async waitUntilComplete() {
        await Promise.all([
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].waitUntilComplete(),
            ...this.childFrames.map((frame)=>frame.waitUntilComplete())
        ]);
    }
    /**
     * Returns a promise that is resolved when the frame has navigated and the response HTML has been written to the document.
     */ waitForNavigation() {
        return new Promise((resolve)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation.push(resolve));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        if (!this.childFrames.length) {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].abort();
        }
        return new Promise((resolve, reject)=>{
            // Using Promise instead of async/await to prevent microtask
            Promise.all(this.childFrames.map((frame)=>frame.abort()).concat([
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].abort()
            ])).then(()=>resolve()).catch(reject);
        });
    }
    /**
     * Evaluates code or a VM Script in the page's context.
     *
     * @param script Script.
     * @returns Result.
     */ evaluate(script) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].evaluate(this, script);
    }
    /**
     * Evaluates a module in the page's context.
     *
     * @param options Options.
     * @param options.url URL.
     * @param options.type Module type.
     * @param options.code Code.
     * @returns Module exports.
     */ evaluateModule(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].evaluateModule(this, options);
    }
    /**
     * Go to a page.
     *
     * @param url URL.
     * @param [options] Options.
     * @returns Response.
     */ goto(url, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigate({
            windowClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            frame: this,
            url: url,
            goToOptions: options
        });
    }
    /**
     * Navigates back in history.
     *
     * @param [options] Options.
     */ goBack(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateBack({
            windowClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            frame: this,
            goToOptions: options
        });
    }
    /**
     * Navigates forward in history.
     *
     * @param [options] Options.
     */ goForward(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateForward({
            windowClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            frame: this,
            goToOptions: options
        });
    }
    /**
     * Navigates a delta in history.
     *
     * @param steps Steps.
     * @param [options] Options.
     */ goSteps(steps, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateSteps({
            windowClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            frame: this,
            steps: steps,
            goToOptions: options
        });
    }
    /**
     * Reloads the current frame.
     *
     * @param [options] Options.
     * @returns Response.
     */ reload(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].reload({
            windowClass: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$BrowserWindow$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            frame: this,
            goToOptions: options
        });
    }
} //# sourceMappingURL=BrowserFrame.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserPageUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserPageUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameFactory.js [app-ssr] (ecmascript)");
;
class BrowserPageUtility {
    /**
     * Returns frames for a page.
     *
     * @param page Page.
     * @returns Frames.
     */ static getFrames(page) {
        return this.findFrames(page.mainFrame);
    }
    /**
     * Aborts all ongoing operations and destroys the page.
     *
     * @param page Page.
     */ static closePage(page) {
        if (page.closed) {
            return Promise.resolve();
        }
        page.closed = true;
        const index = page.context.pages.indexOf(page);
        if (index !== -1) {
            page.context.pages.splice(index, 1);
        }
        page.virtualConsolePrinter.close();
        // Using Promise instead of async/await to prevent microtask
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].destroyFrame(page.mainFrame);
    }
    /**
     * Returns all frames.
     *
     * @param parentFrame Parent frame.
     * @returns Frames, including the parent.
     */ static findFrames(parentFrame) {
        let frames = [
            parentFrame
        ];
        for (const frame of parentFrame.childFrames){
            frames = frames.concat(this.findFrames(frame));
        }
        return frames;
    }
} //# sourceMappingURL=BrowserPageUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserPage.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsolePrinter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/console/VirtualConsolePrinter.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserFrame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserFrame.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsole$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/console/VirtualConsole.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserPageUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Event.js [app-ssr] (ecmascript)");
;
;
;
;
;
class BrowserPage {
    virtualConsolePrinter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsolePrinter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    mainFrame;
    context;
    console;
    viewport;
    closed = false;
    /**
     * Constructor.
     *
     * @param context Browser context.
     */ constructor(context){
        this.context = context;
        this.console = context.browser.console ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsole$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.virtualConsolePrinter);
        this.mainFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserFrame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        this.viewport = {
            width: context.browser.settings.viewport.width,
            height: context.browser.settings.viewport.height,
            devicePixelRatio: context.browser.settings.viewport.devicePixelRatio
        };
    }
    /**
     * Returns frames.
     */ get frames() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFrames(this);
    }
    /**
     * Returns the viewport.
     */ get content() {
        return this.mainFrame.content;
    }
    /**
     * Sets the content.
     *
     * @param content Content.
     */ set content(content) {
        this.mainFrame.content = content;
    }
    /**
     * Returns the URL.
     *
     * @returns URL.
     */ get url() {
        return this.mainFrame.url;
    }
    /**
     * Sets the content.
     *
     * @param url URL.
     */ set url(url) {
        this.mainFrame.url = url;
    }
    /**
     * Aborts all ongoing operations and destroys the page.
     */ close() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].closePage(this);
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     */ waitUntilComplete() {
        return this.mainFrame.waitUntilComplete();
    }
    /**
     * Returns a promise that is resolved when the page has navigated and the response HTML has been written to the document.
     */ waitForNavigation() {
        return this.mainFrame.waitForNavigation();
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        return this.mainFrame.abort();
    }
    /**
     * Evaluates code or a VM Script in the page's context.
     *
     * @param script Script.
     * @returns Result.
     */ evaluate(script) {
        return this.mainFrame.evaluate(script);
    }
    /**
     * Evaluates a module in the page's context.
     *
     * @param options Options.
     * @param options.url URL.
     * @param options.type Module type.
     * @param options.code Code.
     * @returns Module exports.
     */ evaluateModule(options) {
        return this.mainFrame.evaluateModule(options);
    }
    /**
     * Sets the viewport.
     *
     * @param viewport Viewport.
     */ setViewport(viewport) {
        const previousViewport = Object.assign({}, this.viewport);
        Object.assign(this.viewport, viewport);
        if (previousViewport.width !== this.viewport.width || previousViewport.height !== this.viewport.height || previousViewport.devicePixelRatio !== this.viewport.devicePixelRatio) {
            this.mainFrame.window.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('resize'));
        }
    }
    /**
     * Go to a page.
     *
     * @param url URL.
     * @param [options] Options.
     * @returns Response.
     */ goto(url, options) {
        return this.mainFrame.goto(url, options);
    }
    /**
     * Navigates back in history.
     *
     * @param [options] Options.
     */ goBack(options) {
        return this.mainFrame.goBack(options);
    }
    /**
     * Navigates forward in history.
     *
     * @param [options] Options.
     */ goForward(options) {
        return this.mainFrame.goForward(options);
    }
    /**
     * Navigates a delta in history.
     *
     * @param delta Delta.
     * @param steps
     * @param [options] Options.
     */ goSteps(steps, options) {
        return this.mainFrame.goSteps(steps, options);
    }
    /**
     * Reloads the current page.
     *
     * @param [options] Options.
     * @returns Response.
     */ reload(options) {
        return this.mainFrame.reload(options);
    }
} //# sourceMappingURL=BrowserPage.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserContext.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$CookieContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/cookie/CookieContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/ResponseCache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserPage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserPage.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$preflight$2f$PreflightResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/preflight/PreflightResponseCache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
;
;
class BrowserContext {
    pages = [];
    browser;
    cookieContainer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$CookieContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    responseCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    preflightResponseCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$preflight$2f$PreflightResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    closed = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moduleCache"]] = new Map();
    /**
     * Constructor.
     *
     * @param browser
     */ constructor(browser){
        this.browser = browser;
    }
    /**
     * Aborts all ongoing operations and destroys the context.
     */ async close() {
        if (this.closed) {
            return;
        }
        if (this.browser.contexts[0] === this) {
            throw new Error('Cannot close the default context. Use `browser.close()` to close the browser instead.');
        }
        this.closed = true;
        await Promise.all(this.pages.slice().map((page)=>page.close()));
        const browser = this.browser;
        const index = browser.contexts.indexOf(this);
        if (index !== -1) {
            browser.contexts.splice(index, 1);
        }
        this.pages = [];
        this.cookieContainer.clearCookies();
        this.responseCache.clear();
        this.preflightResponseCache.clear();
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     *
     * @returns Promise.
     */ async waitUntilComplete() {
        await Promise.all(this.pages.map((page)=>page.waitUntilComplete()));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        return new Promise((resolve, reject)=>{
            if (!this.pages.length) {
                resolve();
                return;
            }
            Promise.all(this.pages.slice().map((page)=>page.abort())).then(()=>resolve()).catch((error)=>reject(error));
        });
    }
    /**
     * Creates a new page.
     *
     * @returns Page.
     */ newPage() {
        const page = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserPage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        this.pages.push(page);
        return page;
    }
} //# sourceMappingURL=BrowserContext.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/DefaultBrowserSettings.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/version.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserNavigationCrossOriginPolicyEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserNavigationCrossOriginPolicyEnum.js [app-ssr] (ecmascript)");
;
;
;
const __TURBOPACK__default__export__ = {
    disableJavaScriptEvaluation: false,
    enableJavaScriptEvaluation: false,
    disableJavaScriptFileLoading: false,
    disableCSSFileLoading: false,
    disableIframePageLoading: false,
    disableComputedStyleRendering: false,
    handleDisabledFileLoadingAsSuccess: false,
    disableErrorCapturing: false,
    errorCapture: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tryAndCatch,
    enableFileSystemHttpRequests: false,
    suppressCodeGenerationFromStringsWarning: false,
    suppressInsecureJavaScriptEnvironmentWarning: false,
    timer: {
        maxTimeout: -1,
        maxIntervalTime: -1,
        maxIntervalIterations: -1,
        preventTimerLoops: false
    },
    fetch: {
        disableSameOriginPolicy: false,
        disableStrictSSL: false,
        interceptor: null,
        requestHeaders: null,
        virtualServers: null
    },
    module: {
        resolveNodeModules: null,
        urlResolver: null,
        disableCache: false
    },
    navigation: {
        disableMainFrameNavigation: false,
        disableChildFrameNavigation: false,
        disableChildPageNavigation: false,
        disableFallbackToSetURL: false,
        crossOriginPolicy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserNavigationCrossOriginPolicyEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].anyOrigin,
        beforeContentCallback: null
    },
    navigator: {
        userAgent: `Mozilla/5.0 (X11; ${process.platform.charAt(0).toUpperCase() + process.platform.slice(1) + ' ' + process.arch}) AppleWebKit/537.36 (KHTML, like Gecko) HappyDOM/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$version$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].version}`,
        maxTouchPoints: 0
    },
    device: {
        prefersColorScheme: 'light',
        prefersReducedMotion: 'no-preference',
        mediaType: 'screen',
        forcedColors: 'none'
    },
    debug: {
        traceWaitUntilComplete: -1
    },
    viewport: {
        width: 1024,
        height: 768,
        devicePixelRatio: 1
    }
};
 //# sourceMappingURL=DefaultBrowserSettings.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserSettingsFactory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BrowserSettingsFactory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/DefaultBrowserSettings.js [app-ssr] (ecmascript)");
;
class BrowserSettingsFactory {
    /**
     * Returns browser settings.
     *
     * @param [settings] Browser settings.
     * @returns Settings.
     */ static createSettings(settings) {
        if (settings) {
            this.validate(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], settings);
        }
        return {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
            ...settings,
            navigation: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigation,
                ...settings?.navigation
            },
            navigator: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigator,
                ...settings?.navigator
            },
            timer: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].timer,
                ...settings?.timer
            },
            fetch: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fetch,
                ...settings?.fetch
            },
            module: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].module,
                ...settings?.module
            },
            device: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].device,
                ...settings?.device
            },
            debug: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].debug,
                ...settings?.debug
            },
            viewport: {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$DefaultBrowserSettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].viewport,
                ...settings?.viewport
            }
        };
    }
    /**
     * Validates settings.
     *
     * @param target Target.
     * @param source Source.
     * @param [parentNamespace] Parent namespace.
     */ static validate(target, source, parentNamespace) {
        for (const key of Object.keys(source)){
            if (target[key] === undefined) {
                const namespace = parentNamespace ? parentNamespace + '.' + key : key;
                throw new Error(`Unknown browser setting "${namespace}"`);
            }
            if (typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== null) {
                const namespace = parentNamespace ? parentNamespace + '.' + key : key;
                if (typeof source[key] !== 'object' || Array.isArray(source[key]) || source[key] === null) {
                    throw new Error(`Browser setting "${namespace}" cannot be null`);
                }
                this.validate(target[key], source[key], namespace);
            } else {
                if ((typeof target[key] === 'boolean' || typeof target[key] === 'number' || typeof target[key] === 'string') && typeof source[key] !== typeof target[key]) {
                    const isValidPreventTimerLoops = key === 'preventTimerLoops' && typeof source[key] === 'object' && source[key] !== null;
                    if (!isValidPreventTimerLoops) {
                        const namespace = parentNamespace ? parentNamespace + '.' + key : key;
                        throw new Error(`Browser setting "${namespace}" must be of type "${typeof target[key]}"`);
                    }
                }
            }
        }
    }
} //# sourceMappingURL=BrowserSettingsFactory.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserExceptionObserver.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Listens for uncaught exceptions coming from Happy DOM on the running Node process and dispatches error events on the Window instance.
 */ __turbopack_context__.s([
    "default",
    ()=>BrowserExceptionObserver
]);
class BrowserExceptionObserver {
    static listenerCount = 0;
    observedWindows = [];
    uncaughtExceptionListener = null;
    uncaughtRejectionListener = null;
    /**
     * Observes the Node process for uncaught exceptions.
     *
     * @param window Browser window.
     */ observe(window) {
        if (this.observedWindows.includes(window)) {
            throw new Error('Browser window is already being observed.');
        }
        this.observedWindows.push(window);
        if (this.uncaughtExceptionListener) {
            return;
        }
        this.uncaughtExceptionListener = (error, origin)=>{
            if (origin === 'unhandledRejection') {
                return;
            }
            let targetWindow = null;
            for (const window of this.observedWindows){
                if (error instanceof window.Error || error instanceof window.DOMException) {
                    targetWindow = window;
                    break;
                }
            }
            if (targetWindow) {
                targetWindow.console.error(error);
                targetWindow.dispatchEvent(new targetWindow.ErrorEvent('error', {
                    error: error,
                    message: error.message
                }));
            } else if (process.listenerCount('uncaughtException') === this.constructor.listenerCount) {
                // eslint-disable-next-line no-console
                console.error(error);
                // Exit if there are no other listeners handling the error.
                process.exit(1);
            }
        };
        // The "uncaughtException" event is not always triggered for unhandled rejections.
        // Therefore we want to use the "unhandledRejection" event as well.
        this.uncaughtRejectionListener = (error)=>{
            let targetWindow = null;
            for (const window of this.observedWindows){
                if (error instanceof window.Error || error instanceof window.DOMException) {
                    targetWindow = window;
                    break;
                }
            }
            if (targetWindow) {
                targetWindow.console.error(error);
                targetWindow.dispatchEvent(new targetWindow.ErrorEvent('error', {
                    error: error,
                    message: error.message
                }));
            } else if (process.listenerCount('unhandledRejection') === this.constructor.listenerCount) {
                // eslint-disable-next-line no-console
                console.error(error);
                // Exit if there are no other listeners handling the error.
                process.exit(1);
            }
        };
        this.constructor.listenerCount++;
        process.on('uncaughtException', this.uncaughtExceptionListener);
        process.on('unhandledRejection', this.uncaughtRejectionListener);
    }
    /**
     * Disconnects observer.
     *
     * @param window Browser window.
     */ disconnect(window) {
        const index = this.observedWindows.indexOf(window);
        if (index === -1) {
            return;
        }
        this.observedWindows.splice(index, 1);
        if (this.observedWindows.length === 0 && this.uncaughtExceptionListener) {
            this.constructor.listenerCount--;
            process.off('uncaughtException', this.uncaughtExceptionListener);
            if (this.uncaughtRejectionListener) {
                process.off('unhandledRejection', this.uncaughtRejectionListener);
            }
            this.uncaughtExceptionListener = null;
            this.uncaughtRejectionListener = null;
        }
    }
} //# sourceMappingURL=BrowserExceptionObserver.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/Browser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Browser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserSettingsFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserSettingsFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserExceptionObserver$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserExceptionObserver.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-ssr] (ecmascript)");
;
;
;
;
;
class Browser {
    contexts;
    settings;
    console;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]] = null;
    /**
     * Constructor.
     *
     * @param [options] Options.
     * @param [options.settings] Browser settings.
     * @param [options.console] Console.
     */ constructor(options){
        this.console = options?.console || null;
        this.settings = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserSettingsFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createSettings(options?.settings);
        if (this.settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].processLevel) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserExceptionObserver$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        }
        this.contexts = [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this)
        ];
    }
    /**
     * Returns true if the browser is closed.
     *
     * @returns True if the browser is closed.
     */ get closed() {
        return this.contexts.length === 0;
    }
    /**
     * Returns the default context.
     *
     * @returns Default context.
     */ get defaultContext() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        return this.contexts[0];
    }
    /**
     * Aborts all ongoing operations and destroys the browser.
     */ async close() {
        if (this.contexts.length === 0) {
            return;
        }
        const contexts = this.contexts;
        this.contexts = [];
        await Promise.all(contexts.map((context)=>context.close()));
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     *
     * @returns Promise.
     */ async waitUntilComplete() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        await Promise.all(this.contexts.map((page)=>page.waitUntilComplete()));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        // Using Promise instead of async/await to prevent microtask
        return new Promise((resolve, reject)=>{
            if (!this.contexts.length) {
                resolve();
                return;
            }
            Promise.all(this.contexts.slice().map((context)=>context.abort())).then(()=>resolve()).catch((error)=>reject(error));
        });
    }
    /**
     * Creates a new incognito context.
     *
     * @returns Context.
     */ newIncognitoContext() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        const context = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        this.contexts.push(context);
        return context;
    }
    /**
     * Creates a new page.
     *
     * @returns Page.
     */ newPage() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        return this.contexts[0].newPage();
    }
} //# sourceMappingURL=Browser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserFrame.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetachedBrowserFrame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/async-task-manager/AsyncTaskManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameURL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameScriptEvaluator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserFrameNavigator.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryItemList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/history/HistoryItemList.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
class DetachedBrowserFrame {
    childFrames = [];
    parentFrame = null;
    page;
    closed = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$async$2d$task$2d$manager$2f$AsyncTaskManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]] = {
        navigation: []
    };
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerFrame"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openerWindow"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["popup"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["history"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$history$2f$HistoryItemList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    /**
     * Constructor.
     *
     * @param page Page.
     * @param [window] Window.
     */ constructor(page){
        this.page = page;
        if (page.context.browser.contexts[0]?.pages[0]?.mainFrame) {
            this.window = new this.page.context.browser.windowClass(this);
            // Attach process level error capturing.
            if (page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]]) {
                page.context.browser[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]].observe(this.window);
            }
        }
    }
    /**
     * Returns the content.
     *
     * @returns Content.
     */ get content() {
        if (!this.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        return this.window.document.documentElement.outerHTML;
    }
    /**
     * Sets the content.
     *
     * @param content Content.
     */ set content(content) {
        if (!this.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFirstWrite"]] = true;
        this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFirstWriteAfterOpen"]] = false;
        this.window.document.open();
        this.window.document.write(content);
    }
    /**
     * Returns the URL.
     *
     * @returns URL.
     */ get url() {
        if (!this.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        return this.window.location.href;
    }
    /**
     * Sets the content.
     *
     * @param url URL.
     */ set url(url) {
        if (!this.window) {
            throw new Error('The frame has been destroyed, the "window" property is not set.');
        }
        this.window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["location"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setURL"]](this, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameURL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRelativeURL(this, url).href);
    }
    /**
     * Returns document.
     *
     * @returns Document.
     */ get document() {
        return this.window?.document ?? null;
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     */ async waitUntilComplete() {
        await Promise.all([
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].waitUntilComplete(),
            ...this.childFrames.map((frame)=>frame.waitUntilComplete())
        ]);
    }
    /**
     * Returns a promise that is resolved when the frame has navigated and the response HTML has been written to the document.
     */ waitForNavigation() {
        return new Promise((resolve)=>this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["listeners"]].navigation.push(resolve));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        if (!this.childFrames.length) {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].abort();
        }
        return new Promise((resolve, reject)=>{
            // Using Promise instead of async/await to prevent microtask
            Promise.all(this.childFrames.map((frame)=>frame.abort()).concat([
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].abort()
            ])).then(()=>resolve()).catch(reject);
        });
    }
    /**
     * Evaluates code or a VM Script in the page's context.
     *
     * @param script Script.
     * @returns Result.
     */ evaluate(script) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].evaluate(this, script);
    }
    /**
     * Evaluates a module in the page's context.
     *
     * @param options Options.
     * @param options.url URL.
     * @param options.type Module type.
     * @param options.code Code.
     * @returns Module exports.
     */ evaluateModule(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameScriptEvaluator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].evaluateModule(this, options);
    }
    /**
     * Go to a page.
     *
     * @param url URL.
     * @param [options] Options.
     * @returns Response.
     */ goto(url, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigate({
            windowClass: this.page.context.browser.windowClass,
            frame: this,
            url: url,
            goToOptions: options
        });
    }
    /**
     * Navigates back in history.
     *
     * @param [options] Options.
     */ goBack(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateBack({
            windowClass: this.page.context.browser.windowClass,
            frame: this,
            goToOptions: options
        });
    }
    /**
     * Navigates forward in history.
     *
     * @param [options] Options.
     */ goForward(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateForward({
            windowClass: this.page.context.browser.windowClass,
            frame: this,
            goToOptions: options
        });
    }
    /**
     * Navigates a delta in history.
     *
     * @param steps Steps.
     * @param [options] Options.
     */ goSteps(steps, options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].navigateSteps({
            windowClass: this.page.context.browser.windowClass,
            frame: this,
            steps: steps,
            goToOptions: options
        });
    }
    /**
     * Reloads the current frame.
     *
     * @param [options] Options.
     * @returns Response.
     */ reload(options) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserFrameNavigator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].reload({
            windowClass: this.page.context.browser.windowClass,
            frame: this,
            goToOptions: options
        });
    }
} //# sourceMappingURL=DetachedBrowserFrame.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserPage.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetachedBrowserPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsolePrinter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/console/VirtualConsolePrinter.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserFrame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserFrame.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsole$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/console/VirtualConsole.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserPageUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Event.js [app-ssr] (ecmascript)");
;
;
;
;
;
class DetachedBrowserPage {
    virtualConsolePrinter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsolePrinter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    mainFrame;
    context;
    console;
    viewport;
    closed = false;
    /**
     * Constructor.
     *
     * @param context Browser context.
     */ constructor(context){
        this.context = context;
        this.console = context.browser.console ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$console$2f$VirtualConsole$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.virtualConsolePrinter);
        this.mainFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserFrame$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        this.viewport = {
            width: context.browser.settings.viewport.width,
            height: context.browser.settings.viewport.height,
            devicePixelRatio: context.browser.settings.viewport.devicePixelRatio
        };
    }
    /**
     * Returns frames.
     */ get frames() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFrames(this);
    }
    /**
     * Returns the viewport.
     */ get content() {
        return this.mainFrame.content;
    }
    /**
     * Sets the content.
     *
     * @param content Content.
     */ set content(content) {
        this.mainFrame.content = content;
    }
    /**
     * Returns the URL.
     *
     * @returns URL.
     */ get url() {
        return this.mainFrame.url;
    }
    /**
     * Sets the content.
     *
     * @param url URL.
     */ set url(url) {
        this.mainFrame.url = url;
    }
    /**
     * Aborts all ongoing operations and destroys the page.
     */ close() {
        // Using Promise instead of async/await to prevent microtask
        return new Promise((resolve, reject)=>{
            const context = this.context;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserPageUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].closePage(this).then(()=>{
                // As we are in a detached page, a context or browser should not exist without a page as there are no references to them.
                if (context.pages[0] === this) {
                    context.browser.close().then(resolve).catch(reject);
                } else {
                    resolve();
                }
            }).catch(reject);
        });
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     */ waitUntilComplete() {
        return this.mainFrame.waitUntilComplete();
    }
    /**
     * Returns a promise that is resolved when the page has navigated and the response HTML has been written to the document.
     */ waitForNavigation() {
        return this.mainFrame.waitForNavigation();
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        return this.mainFrame.abort();
    }
    /**
     * Evaluates code or a VM Script in the page's context.
     *
     * @param script Script.
     * @returns Result.
     */ evaluate(script) {
        return this.mainFrame.evaluate(script);
    }
    /**
     * Evaluates a module in the page's context.
     *
     * @param options Options.
     * @param options.url URL.
     * @param options.type Module type.
     * @param options.code Code.
     * @returns Module exports.
     */ evaluateModule(options) {
        return this.mainFrame.evaluateModule(options);
    }
    /**
     * Sets the viewport.
     *
     * @param viewport Viewport.
     */ setViewport(viewport) {
        const previousViewport = Object.assign({}, this.viewport);
        Object.assign(this.viewport, viewport);
        if (previousViewport.width !== this.viewport.width || previousViewport.height !== this.viewport.height || previousViewport.devicePixelRatio !== this.viewport.devicePixelRatio) {
            this.mainFrame.window.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('resize'));
        }
    }
    /**
     * Go to a page.
     *
     * @param url URL.
     * @param [options] Options.
     * @returns Response.
     */ goto(url, options) {
        return this.mainFrame.goto(url, options);
    }
    /**
     * Navigates back in history.
     *
     * @param [options] Options.
     */ goBack(options) {
        return this.mainFrame.goBack(options);
    }
    /**
     * Navigates forward in history.
     *
     * @param [options] Options.
     */ goForward(options) {
        return this.mainFrame.goForward(options);
    }
    /**
     * Navigates a delta in history.
     *
     * @param delta Delta.
     * @param steps
     * @param [options] Options.
     */ goSteps(steps, options) {
        return this.mainFrame.goSteps(steps, options);
    }
    /**
     * Reloads the current page.
     *
     * @param [options] Options.
     * @returns Response.
     */ reload(options) {
        return this.mainFrame.reload(options);
    }
} //# sourceMappingURL=DetachedBrowserPage.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserContext.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetachedBrowserContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserPage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserPage.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$CookieContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/cookie/CookieContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/ResponseCache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$preflight$2f$PreflightResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/preflight/PreflightResponseCache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
;
;
class DetachedBrowserContext {
    pages;
    browser;
    cookieContainer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$CookieContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    responseCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    preflightResponseCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$preflight$2f$PreflightResponseCache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    closed = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moduleCache"]] = new Map();
    /**
     * Constructor.
     *
     * @param browser Browser.
     */ constructor(browser){
        this.browser = browser;
        this.pages = [];
        this.pages.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserPage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this));
    }
    /**
     * Aborts all ongoing operations and destroys the context.
     */ async close() {
        if (this.closed) {
            return;
        }
        if (this.browser.contexts[0] === this) {
            throw new Error('Cannot close the default context. Use `browser.close()` to close the browser instead.');
        }
        this.closed = true;
        await Promise.all(this.pages.slice().map((page)=>page.close()));
        const browser = this.browser;
        const index = browser.contexts.indexOf(this);
        if (index !== -1) {
            browser.contexts.splice(index, 1);
        }
        this.pages = [];
        this.cookieContainer.clearCookies();
        this.responseCache.clear();
        this.preflightResponseCache.clear();
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     *
     * @returns Promise.
     */ async waitUntilComplete() {
        await Promise.all(this.pages.map((page)=>page.waitUntilComplete()));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        return new Promise((resolve, reject)=>{
            if (!this.pages.length) {
                resolve();
                return;
            }
            Promise.all(this.pages.slice().map((page)=>page.abort())).then(()=>resolve()).catch((error)=>reject(error));
        });
    }
    /**
     * Creates a new page.
     *
     * @param [opener] Opener.
     * @returns Page.
     */ newPage() {
        const page = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserPage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        this.pages.push(page);
        return page;
    }
} //# sourceMappingURL=DetachedBrowserContext.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetachedBrowser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/detached-browser/DetachedBrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserSettingsFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/BrowserSettingsFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserExceptionObserver$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/utilities/BrowserExceptionObserver.js [app-ssr] (ecmascript)");
;
;
;
;
;
class DetachedBrowser {
    contexts;
    settings;
    console;
    windowClass;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]] = null;
    /**
     * Constructor.
     *
     * @param windowClass Window class.
     * @param [options] Options.
     * @param [options.settings] Browser settings.
     * @param [options.console] Console.
     */ constructor(windowClass, options){
        this.windowClass = windowClass;
        this.console = options?.console || null;
        this.settings = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$BrowserSettingsFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createSettings(options?.settings);
        if (this.settings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].processLevel) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exceptionObserver"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$utilities$2f$BrowserExceptionObserver$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        }
        this.contexts = [];
        this.contexts.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$detached$2d$browser$2f$DetachedBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this));
    }
    /**
     * Returns true if the browser is closed.
     *
     * @returns True if the browser is closed.
     */ get closed() {
        return this.contexts.length === 0;
    }
    /**
     * Returns the default context.
     *
     * @returns Default context.
     */ get defaultContext() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        return this.contexts[0];
    }
    /**
     * Aborts all ongoing operations and destroys the browser.
     */ async close() {
        if (this.contexts.length === 0) {
            return;
        }
        const contexts = this.contexts;
        this.contexts = [];
        await Promise.all(contexts.map((context)=>context.close()));
    }
    /**
     * Returns a promise that is resolved when all resources has been loaded, fetch has completed, and all async tasks such as timers are complete.
     *
     * @returns Promise.
     */ async waitUntilComplete() {
        await Promise.all(this.contexts.map((page)=>page.waitUntilComplete()));
    }
    /**
     * Aborts all ongoing operations.
     */ abort() {
        // Using Promise instead of async/await to prevent microtask
        return new Promise((resolve, reject)=>{
            if (!this.contexts.length) {
                resolve();
                return;
            }
            Promise.all(this.contexts.slice().map((context)=>context.abort())).then(()=>resolve()).catch((error)=>reject(error));
        });
    }
    /**
     * Creates a new incognito context.
     */ newIncognitoContext() {
        throw new Error('Not possible to create a new context on a detached browser.');
    }
    /**
     * Creates a new page.
     *
     * @returns Page.
     */ newPage() {
        if (this.contexts.length === 0) {
            throw new Error('No default context. The browser has been closed.');
        }
        return this.contexts[0].newPage();
    }
} //# sourceMappingURL=DetachedBrowser.js.map
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_browser_95e6b961._.js.map