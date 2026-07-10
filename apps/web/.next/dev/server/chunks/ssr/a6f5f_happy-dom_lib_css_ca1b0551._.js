module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/utilities/CSSEscaper.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CSS escaper.
 */ __turbopack_context__.s([
    "default",
    ()=>CSSEscaper
]);
class CSSEscaper {
    /**
     * Escapes CSS.
     *
     * Based on:
     * https://github.com/mathiasbynens/CSS.escape
     *
     * @param cssText CSS.
     * @returns Escaped CSS.
     */ static escape(cssText) {
        if (arguments.length == 0) {
            throw new TypeError('`CSS.escape` requires an argument.');
        }
        const returnValue = String(cssText);
        const length = returnValue.length;
        let index = -1;
        let codeUnit;
        let result = '';
        const firstCodeUnit = returnValue.charCodeAt(0);
        if (// If the character is the first character and is a `-` (U+002D), and
        // There is no second character, […]
        length == 1 && firstCodeUnit == 0x002d) {
            return '\\' + returnValue;
        }
        while(++index < length){
            codeUnit = returnValue.charCodeAt(index);
            // Note: there’s no need to special-case astral symbols, surrogate
            // Pairs, or lone surrogates.
            // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
            // (U+FFFD).
            if (codeUnit == 0x0000) {
                result += '\uFFFD';
                continue;
            }
            if (// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
            // U+007F, […]
            codeUnit >= 0x0001 && codeUnit <= 0x001f || codeUnit == 0x007f || index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 || index == 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit == 0x002d) {
                // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
                result += '\\' + codeUnit.toString(16) + ' ';
                continue;
            }
            // If the character is not handled by one of the above rules and is
            // Greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
            // Is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
            // U+005A), or [a-z] (U+0061 to U+007A), […]
            if (codeUnit >= 0x0080 || codeUnit == 0x002d || codeUnit == 0x005f || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005a || codeUnit >= 0x0061 && codeUnit <= 0x007a) {
                // The character itself
                result += returnValue.charAt(index);
                continue;
            }
            // Otherwise, the escaped character.
            // https://drafts.csswg.org/cssom/#escape-a-character
            result += '\\' + returnValue.charAt(index);
        }
        return result;
    }
} //# sourceMappingURL=CSSEscaper.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSUnits.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = [
    'Hz',
    'Q',
    'ch',
    'cm',
    'deg',
    'dpcm',
    'dpi',
    'dppx',
    'em',
    'ex',
    'fr',
    'grad',
    'in',
    'kHz',
    'mm',
    'ms',
    'number',
    'pc',
    'percent',
    'pt',
    'px',
    'rad',
    'rem',
    's',
    'turn',
    'vh',
    'vmax',
    'vmin',
    'vw'
];
 //# sourceMappingURL=CSSUnits.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSUnitValue.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSUnitValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnits$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSUnits.js [app-ssr] (ecmascript)");
;
class CSSUnitValue {
    unit;
    value;
    /**
     * Constructor.
     *
     * @param value Value.
     * @param unit Unit.
     */ constructor(value, unit){
        if (typeof value !== 'number') {
            throw new TypeError('The provided double value is non-finite');
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnits$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].includes(unit)) {
            throw new TypeError('Invalid unit: ' + unit);
        }
        this.value = value;
        this.unit = unit;
    }
} //# sourceMappingURL=CSSUnitValue.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSS.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$utilities$2f$CSSEscaper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/utilities/CSSEscaper.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSUnitValue.js [app-ssr] (ecmascript)");
;
;
class CSS {
    Hz = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'Hz');
    Q = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'Q');
    ch = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'ch');
    cm = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'cm');
    deg = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'deg');
    dpcm = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'dpcm');
    dpi = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'dpi');
    dppx = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'dppx');
    em = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'em');
    ex = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'ex');
    fr = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'fr');
    grad = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'grad');
    in = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'in');
    kHz = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'kHz');
    mm = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'mm');
    ms = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'ms');
    number = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'number');
    pc = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'pc');
    percent = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'percent');
    pt = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'pt');
    px = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'px');
    rad = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'rad');
    rem = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'rem');
    s = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 's');
    turn = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'turn');
    vh = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'vh');
    vmax = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'vmax');
    vmin = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'vmin');
    vw = (value)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSUnitValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](value, 'vw');
    /**
     * Returns a Boolean indicating if the pair property-value, or the condition, given in parameter is supported.
     *
     * TODO: Always returns "true" for now, but it should probably be improved in the future.
     *
     * @param _condition Property name or condition.
     * @param [_value] Value when using property name.
     * @returns "true" if supported.
     */ supports(_condition, _value) {
        return true;
    }
    /**
     * Escapes a value.
     *
     * @param value Value to escape.
     * @returns Escaped string.
     */ escape(value) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$utilities$2f$CSSEscaper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].escape(value);
    }
} //# sourceMappingURL=CSS.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var CSSRuleTypeEnum;
(function(CSSRuleTypeEnum) {
    CSSRuleTypeEnum[CSSRuleTypeEnum["containerRule"] = 0] = "containerRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["styleRule"] = 1] = "styleRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["importRule"] = 3] = "importRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["mediaRule"] = 4] = "mediaRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["fontFaceRule"] = 5] = "fontFaceRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["pageRule"] = 6] = "pageRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["keyframesRule"] = 7] = "keyframesRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["keyframeRule"] = 8] = "keyframeRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["namespaceRule"] = 10] = "namespaceRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["counterStyleRule"] = 11] = "counterStyleRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["supportsRule"] = 12] = "supportsRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["documentRule"] = 13] = "documentRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["fontFeatureValuesRule"] = 14] = "fontFeatureValuesRule";
    CSSRuleTypeEnum[CSSRuleTypeEnum["regionStyleRule"] = 16] = "regionStyleRule";
})(CSSRuleTypeEnum || (CSSRuleTypeEnum = {}));
const __TURBOPACK__default__export__ = CSSRuleTypeEnum;
 //# sourceMappingURL=CSSRuleTypeEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class CSSRule {
    // Static properties
    static CONTAINER_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule;
    static STYLE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].styleRule;
    static IMPORT_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].importRule;
    static MEDIA_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule;
    static FONT_FACE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fontFaceRule;
    static PAGE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pageRule;
    static KEYFRAMES_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframesRule;
    static KEYFRAME_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframeRule;
    static NAMESPACE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].namespaceRule;
    static COUNTER_STYLE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].counterStyleRule;
    static SUPPORTS_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule;
    static DOCUMENT_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].documentRule;
    static FONT_FEATURE_VALUES_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fontFeatureValuesRule;
    static REGION_STYLE_RULE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].regionStyleRule;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssParser"]];
    // Public properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param cssParser CSS parser.
     */ constructor(illegalConstructorSymbol, window, cssParser){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssParser"]] = cssParser;
    }
    /**
     * Returns parent rule.
     *
     * @returns Parent rule.
     */ get parentRule() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]];
    }
    /**
     * Returns parent style sheet.
     *
     * @returns Parent style sheet.
     */ get parentStyleSheet() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]];
    }
} //# sourceMappingURL=CSSRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationValueUtility
]);
const SPLIT_BY_COMMA_REGEXP = /[,()]/gm;
const SPLIT_BY_SPACE_REGEXP = /[()]|\s+/gm;
class CSSStyleDeclarationValueUtility {
    /**
     * Splits by comma while respecting nested parentheses.
     *
     * @param value Value to split.
     * @returns Array of parts.
     */ static splitByComma(value) {
        const parts = [];
        const regexp = new RegExp(SPLIT_BY_COMMA_REGEXP);
        let match;
        let depth = 0;
        let lastIndex = 0;
        while(match = regexp.exec(value)){
            switch(match[0]){
                case '(':
                    depth++;
                    break;
                case ')':
                    depth--;
                    break;
                case ',':
                    if (depth === 0) {
                        const part = value.substring(lastIndex, match.index).trim();
                        if (part) {
                            parts.push(part);
                        }
                        lastIndex = regexp.lastIndex;
                    }
                    break;
            }
        }
        if (lastIndex < value.length) {
            parts.push(value.substring(lastIndex).trim());
        }
        return parts;
    }
    /**
     * Splits by space while respecting nested parentheses.
     *
     * @param value Value to split.
     * @returns Array of parts.
     */ static splitBySpace(value) {
        const parts = [];
        const regexp = new RegExp(SPLIT_BY_SPACE_REGEXP);
        let match;
        let depth = 0;
        let lastIndex = 0;
        while(match = regexp.exec(value)){
            switch(match[0]){
                case '(':
                    depth++;
                    break;
                case ')':
                    depth--;
                    break;
                default:
                    if (depth === 0) {
                        const part = value.substring(lastIndex, match.index).trim();
                        if (part) {
                            parts.push(part);
                        }
                        lastIndex = regexp.lastIndex;
                    }
                    break;
            }
        }
        if (lastIndex < value.length) {
            const part = value.substring(lastIndex).trim();
            if (part) {
                parts.push(part);
            }
        }
        return parts;
    }
} //# sourceMappingURL=CSSStyleDeclarationValueUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationValueParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueUtility.js [app-ssr] (ecmascript)");
;
const COLOR_REGEXP = /^#([0-9a-fA-F]{3,4}){1,2}$|^rgb\(([^)]*)\)$|^rgba\(([^)]*)\)$|^hsla?\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*(,\s*(-?\d+|-?\d*.\d+)\s*)?\)|(?:(rgba?|hsla?)\((var\(\s*(--[^)\s]+)\))\))/;
const LENGTH_REGEXP = /^(0|[-+]?[0-9]*\.?[0-9]+)(in|cm|em|mm|pt|pc|px|ex|rem|vh|vw|ch|vw|vh|vmin|vmax|Q)$/;
const PERCENTAGE_REGEXP = /^[-+]?[0-9]*\.?[0-9]+%$/;
const DEGREE_REGEXP = /^[0-9]+deg$/;
const URL_REGEXP = /^url\(\s*([^)]*)\s*\)$/;
const INTEGER_REGEXP = /^[0-9]+$/;
const FLOAT_REGEXP = /^[0-9.]+$/;
const CALC_REGEXP = /^calc\([^^)]+\)$/;
const CSS_VARIABLE_REGEXP = /^var\(\s*(--[^)\s]+)\)$/;
const FIT_CONTENT_REGEXP = /^fit-content\([^^)]+\)$/;
const GRADIENT_REGEXP = /^((repeating-linear|linear|radial|repeating-radial|conic|repeating-conic)-gradient)\(((?:[^()]|\([^()]*\))*)\)$/;
const GLOBALS = [
    'inherit',
    'initial',
    'unset',
    'revert'
];
const COLORS = [
    'none',
    'currentcolor',
    'transparent',
    'silver',
    'gray',
    'white',
    'maroon',
    'red',
    'purple',
    'fuchsia',
    'green',
    'lime',
    'olive',
    'yellow',
    'navy',
    'blue',
    'teal',
    'aliceblue',
    'aqua',
    'antiquewhite',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'limegreen',
    'linen',
    'magenta',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'oldlace',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'rebeccapurple',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'whitesmoke',
    'yellowgreen'
];
class CSSStyleDeclarationValueParser {
    /**
     * Returns length.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getLength(value) {
        if (value === '0') {
            return '0px';
        }
        const match = value.match(LENGTH_REGEXP);
        if (match) {
            const number = parseFloat(match[1]);
            if (isNaN(number)) {
                return null;
            }
            const unit = match[2];
            return `${Math.round(number * 1000000) / 1000000}${unit}`;
        }
        return null;
    }
    /**
     * Returns percentance.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getPercentage(value) {
        if (value === '0') {
            return '0%';
        }
        if (PERCENTAGE_REGEXP.test(value)) {
            return value;
        }
        return null;
    }
    /**
     * Returns degree.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getDegree(value) {
        if (value === '0') {
            return '0deg';
        }
        if (DEGREE_REGEXP.test(value)) {
            return value;
        }
        return null;
    }
    /**
     * Returns calc.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getCalc(value) {
        if (CALC_REGEXP.test(value)) {
            return value;
        }
        return null;
    }
    /**
     * Returns fit content.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getFitContent(value) {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'auto' || lowerValue === 'max-content' || lowerValue === 'min-content' || lowerValue === 'fit-content') {
            return lowerValue;
        }
        if (FIT_CONTENT_REGEXP.test(lowerValue)) {
            return lowerValue;
        }
        return null;
    }
    /**
     * Returns measurement.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getMeasurement(value) {
        return this.getLength(value) || this.getPercentage(value) || this.getCalc(value);
    }
    /**
     * Returns measurement or auto, min-content, max-content or fit-content.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getContentMeasurement(value) {
        return this.getFitContent(value) || this.getMeasurement(value);
    }
    /**
     * Returns measurement or auto, min-content, max-content or fit-content.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getAutoMeasurement(value) {
        if (value.toLocaleLowerCase() === 'auto') {
            return 'auto';
        }
        return this.getMeasurement(value);
    }
    /**
     * Returns integer.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getInteger(value) {
        if (INTEGER_REGEXP.test(value)) {
            return value;
        }
        return null;
    }
    /**
     * Returns float.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getFloat(value) {
        if (FLOAT_REGEXP.test(value)) {
            const number = parseFloat(value);
            if (isNaN(number)) {
                return null;
            }
            return String(Math.round(number * 1000000) / 1000000);
        }
        return null;
    }
    /**
     * Returns gradient.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getGradient(value) {
        const match = value.match(GRADIENT_REGEXP);
        if (match) {
            const args = match[3].trim();
            const parts = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].splitByComma(args);
            return `${match[1]}(${parts.join(', ')})`;
        }
        return null;
    }
    /**
     * Returns color.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getColor(value) {
        const lowerValue = value.toLowerCase();
        if (COLORS.includes(lowerValue)) {
            return lowerValue;
        }
        if (COLOR_REGEXP.test(value)) {
            return value.replace(/,([^ ])/g, ', $1');
        }
        return null;
    }
    /**
     * Returns URL.
     *
     * Based on:
     * https://github.com/jsdom/cssstyle/blob/master/lib/parsers.js#L222
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getURL(value) {
        if (!value) {
            return null;
        }
        if (value.toLowerCase() === 'none') {
            return 'none';
        }
        const result = URL_REGEXP.exec(value);
        if (!result) {
            return null;
        }
        let url = result[1].trim();
        if ((url[0] === '"' || url[0] === "'") && url[0] !== url[url.length - 1]) {
            return null;
        }
        if (url[0] === '"' || url[0] === "'") {
            url = url.substring(1, url.length - 1);
        }
        for(let i = 0; i < url.length; i++){
            switch(url[i]){
                case '(':
                case ')':
                case ' ':
                case '\t':
                case '\n':
                case "'":
                case '"':
                    return null;
                case '\\':
                    i++;
                    break;
            }
        }
        return `url("${url}")`;
    }
    /**
     * Returns global initial value.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getInitial(value) {
        return value.toLowerCase() === 'initial' ? 'initial' : null;
    }
    /**
     * Returns CSS variable.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getVariable(value) {
        const cssVariableMatch = value.match(CSS_VARIABLE_REGEXP);
        if (cssVariableMatch) {
            return `var(${cssVariableMatch[1]})`;
        }
        return null;
    }
    /**
     * Returns global.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getGlobal(value) {
        const lowerValue = value.toLowerCase();
        return GLOBALS.includes(lowerValue) ? lowerValue : null;
    }
    /**
     * Returns global, unless it is not set to 'initial' as it is sometimes treated different.
     *
     * @param value Value.
     * @returns Parsed value.
     */ static getGlobalExceptInitial(value) {
        const lowerValue = value.toLowerCase();
        return lowerValue !== 'initial' && GLOBALS.includes(lowerValue) ? lowerValue : null;
    }
} //# sourceMappingURL=CSSStyleDeclarationValueParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertySetParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationPropertySetParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueUtility.js [app-ssr] (ecmascript)");
;
;
const RECT_REGEXP = /^rect\((.*)\)$/i;
const SPLIT_COMMA_SEPARATED_WITH_PARANTHESES_REGEXP = /,(?=(?:(?:(?!\))[\s\S])*\()|[^\(\)]*$)/; // Split on commas that are outside of parentheses
const SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP = /\s+(?=(?:(?:(?!\))[\s\S])*\()|[^\(\)]*$)/; // Split on spaces that are outside of parentheses
const WHITE_SPACE_GLOBAL_REGEXP = /\s+/gm;
const BORDER_STYLE = [
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset'
];
const BORDER_WIDTH = [
    'thin',
    'medium',
    'thick'
];
const BORDER_COLLAPSE = [
    'separate',
    'collapse'
];
const BACKGROUND_REPEAT = [
    'repeat',
    'repeat-x',
    'repeat-y',
    'no-repeat'
];
const BACKGROUND_ORIGIN = [
    'border-box',
    'padding-box',
    'content-box'
];
const BACKGROUND_CLIP = [
    'border-box',
    'padding-box',
    'content-box'
];
const BACKGROUND_ATTACHMENT = [
    'scroll',
    'fixed'
];
const FLEX_BASIS = [
    'auto',
    'fill',
    'content'
];
const CLEAR = [
    'none',
    'left',
    'right',
    'both'
];
const FLOAT = [
    'none',
    'left',
    'right',
    'inline-start',
    'inline-end'
];
const SYSTEM_FONT = [
    'caption',
    'icon',
    'menu',
    'message-box',
    'small-caption',
    'status-bar'
];
const FONT_WEIGHT = [
    'normal',
    'bold',
    'bolder',
    'lighter'
];
const FONT_STYLE = [
    'normal',
    'italic',
    'oblique'
];
const FONT_SIZE = [
    'xx-small',
    'x-small',
    'small',
    'medium',
    'large',
    'x-large',
    'xx-large',
    'xxx-large',
    'smaller',
    'larger'
];
const FONT_STRETCH = [
    'ultra-condensed',
    'extra-condensed',
    'condensed',
    'semi-condensed',
    'normal',
    'semi-expanded',
    'expanded',
    'extra-expanded',
    'ultra-expanded'
];
const DISPLAY = [
    /* Legacy values */ 'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'flow-root',
    /* Box generation */ 'none',
    'contents',
    /* Two-value syntax */ 'block flow',
    'inline flow',
    'inline flow-root',
    'block flex',
    'inline flex',
    'block grid',
    'inline grid',
    'block flow-root',
    /* Other values */ 'table',
    'table-row',
    'list-item'
];
const BORDER_IMAGE_REPEAT = [
    'stretch',
    'repeat',
    'round',
    'space'
];
const TEXT_TRANSFORM = [
    'capitalize',
    'uppercase',
    'lowercase',
    'none',
    'full-width',
    'full-size-kana'
];
const VISIBILITY = [
    'visible',
    'hidden',
    'collapse'
];
class CSSStyleDeclarationPropertySetParser {
    /**
     * Returns border collapse.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderCollapse(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-collapse': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_COLLAPSE.includes(lowerValue)) {
            return {
                'border-collapse': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns display.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getDisplay(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                display: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || DISPLAY.includes(lowerValue)) {
            return {
                display: {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns direction.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getDirection(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                direction: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'ltr' || lowerValue === 'rtl') {
            return {
                direction: {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns letter spacing.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getLetterSpacing(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            'letter-spacing': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns word spacing.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getWordSpacing(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            'word-spacing': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns text indent.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getTextIndent(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            'text-indent': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getWidth(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            width: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns height.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getHeight(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            height: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getTop(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            top: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getRight(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            right: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBottom(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            bottom: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getLeft(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(value);
        return parsedValue ? {
            left: {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns clear.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getClear(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                clear: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || CLEAR.includes(lowerValue)) {
            return {
                clear: {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns clip
     *
     * Based on:
     * https://github.com/jsdom/cssstyle/blob/master/lib/properties/clip.js
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getClip(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                clip: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'auto') {
            return {
                clip: {
                    value: lowerValue,
                    important
                }
            };
        }
        const matches = lowerValue.match(RECT_REGEXP);
        if (!matches) {
            return null;
        }
        const parts = matches[1].split(/\s*,\s*/);
        if (parts.length !== 4) {
            return null;
        }
        for (const part of parts){
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(part)) {
                return null;
            }
        }
        return {
            clip: {
                value,
                important
            }
        };
    }
    /**
     * Returns float.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFloat(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                float: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FLOAT.includes(lowerValue)) {
            return {
                float: {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns float.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getCSSFloat(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'css-float': {
                    value: variable,
                    important
                }
            };
        }
        const float = this.getFloat(value, important);
        return float ? {
            'css-float': float['float']
        } : null;
    }
    /**
     * Returns outline.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getOutline(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                outline: {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getOutlineColor(globalValue, important),
                ...this.getOutlineStyle(globalValue, important),
                ...this.getOutlineWidth(globalValue, important)
            };
        }
        const properties = {
            ...this.getOutlineColor('initial', important),
            ...this.getOutlineStyle('initial', important),
            ...this.getOutlineWidth('initial', important)
        };
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getOutlineWidth(part, important);
            const style = this.getOutlineStyle(part, important);
            const color = this.getOutlineColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns outline color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getOutlineColor(value, important) {
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'outline-color': {
                value: color,
                important
            }
        } : null;
    }
    /**
     * Returns outline offset.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getOutlineOffset(value, important) {
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        return parsedValue ? {
            'outline-offset': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns outline style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getOutlineStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'outline-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_STYLE.includes(lowerValue)) {
            return {
                'outline-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns outline width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getOutlineWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'outline-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = BORDER_WIDTH.includes(lowerValue) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) ? lowerValue : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        if (parsedValue) {
            return {
                'outline-width': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorder(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                border: {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderWidth(globalValue, important),
                ...this.getBorderStyle(globalValue, important),
                ...this.getBorderColor(globalValue, important),
                ...this.getBorderImage(globalValue, important)
            };
        }
        const properties = {
            ...this.getBorderWidth('initial', important),
            ...this.getBorderStyle('initial', important),
            ...this.getBorderColor('initial', important),
            ...this.getBorderImage('initial', important)
        };
        const parts = value.replace(/\s*,\s*/g, ',').split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getBorderWidth(part, important);
            const style = this.getBorderStyle(part, important);
            const color = this.getBorderColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-width': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderTopWidth(globalValue, important),
                ...this.getBorderRightWidth(globalValue, important),
                ...this.getBorderBottomWidth(globalValue, important),
                ...this.getBorderLeftWidth(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const top = this.getBorderTopWidth(parts[0], important);
        const right = this.getBorderRightWidth(parts[1] || parts[0], important);
        const bottom = this.getBorderBottomWidth(parts[2] || parts[0], important);
        const left = this.getBorderLeftWidth(parts[3] || parts[1] || parts[0], important);
        if (!top || !right || !bottom || !left) {
            return null;
        }
        return {
            ...top,
            ...right,
            ...bottom,
            ...left
        };
    }
    /**
     * Returns border style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-style': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderTopStyle(globalValue, important),
                ...this.getBorderRightStyle(globalValue, important),
                ...this.getBorderBottomStyle(globalValue, important),
                ...this.getBorderLeftStyle(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const top = this.getBorderTopStyle(parts[0], important);
        const right = this.getBorderRightStyle(parts[1] || parts[0], important);
        const bottom = this.getBorderBottomStyle(parts[2] || parts[0], important);
        const left = this.getBorderLeftStyle(parts[3] || parts[1] || parts[0], important);
        if (!top || !right || !bottom || !left) {
            return null;
        }
        return {
            ...top,
            ...right,
            ...bottom,
            ...left
        };
    }
    /**
     * Returns border color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-color': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderTopColor(globalValue, important),
                ...this.getBorderRightColor(globalValue, important),
                ...this.getBorderBottomColor(globalValue, important),
                ...this.getBorderLeftColor(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const top = this.getBorderTopColor(parts[0], important);
        const right = this.getBorderRightColor(parts[1] || parts[0], important);
        const bottom = this.getBorderBottomColor(parts[2] || parts[0], important);
        const left = this.getBorderLeftColor(parts[3] || parts[1] || parts[0], important);
        if (!top || !right || !bottom || !left) {
            return null;
        }
        return {
            ...top,
            ...right,
            ...bottom,
            ...left
        };
    }
    /**
     * Returns border image.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImage(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderImageSource(globalValue, important),
                ...this.getBorderImageSlice(globalValue, important),
                ...this.getBorderImageWidth(globalValue, important),
                ...this.getBorderImageOutset(globalValue, important),
                ...this.getBorderImageRepeat(globalValue, important)
            };
        }
        let parsedValue = value.replace(/\s\/\s/g, '/');
        const sourceMatch = parsedValue.match(/\s*([a-zA-Z-]+\([^)]*\))\s*/);
        if (sourceMatch) {
            parsedValue = parsedValue.replace(sourceMatch[0], '');
        }
        const parts = parsedValue.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        if (sourceMatch) {
            parts.push(sourceMatch[1]);
        }
        const properties = {
            ...this.getBorderImageSource('none', important),
            ...this.getBorderImageSlice('100%', important),
            ...this.getBorderImageWidth('1', important),
            ...this.getBorderImageOutset('0', important),
            ...this.getBorderImageRepeat('stretch', important)
        };
        for(let i = 0, max = parts.length; i < max; i++){
            const part = parts[i];
            const previousPart = i > 0 ? parts[i - 1] : '';
            if (!part.startsWith('url') && part.includes('/')) {
                const [slice, width, outset] = part.split('/');
                const borderImageSlice = this.getBorderImageSlice(`${previousPart} ${slice}`, important) || this.getBorderImageSlice(slice, important);
                const borderImageWidth = this.getBorderImageWidth(width, important);
                const borderImageOutset = outset && this.getBorderImageOutset(outset, important);
                if (!borderImageSlice || !borderImageWidth || borderImageOutset === null) {
                    return null;
                }
                Object.assign(properties, borderImageSlice, borderImageWidth, borderImageOutset);
            } else {
                const slice = this.getBorderImageSlice(`${previousPart} ${part}`, important) || this.getBorderImageSlice(part, important);
                const source = this.getBorderImageSource(part, important);
                const repeat = this.getBorderImageRepeat(part, important);
                if (!slice && !source && !repeat) {
                    return null;
                }
                Object.assign(properties, slice, source, repeat);
            }
        }
        return properties;
    }
    /**
     * Returns border source.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImageSource(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image-source': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'none') {
            return {
                'border-image-source': {
                    important,
                    value: lowerValue
                }
            };
        }
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getURL(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGradient(value);
        if (!parsedValue) {
            return null;
        }
        return {
            'border-image-source': {
                important,
                value: parsedValue
            }
        };
    }
    /**
     * Returns border slice.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImageSlice(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image-slice': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'border-image-slice': {
                    important,
                    value: lowerValue
                }
            };
        }
        if (lowerValue !== lowerValue.trim()) {
            return null;
        }
        const regexp = /(fill)|(calc\([^^)]+\))|([0-9]+%)|([0-9]+)/g;
        const values = [];
        let match;
        while(match = regexp.exec(lowerValue)){
            const previousCharacter = lowerValue[match.index - 1];
            const nextCharacter = lowerValue[match.index + match[0].length];
            if (previousCharacter && previousCharacter !== ' ' || nextCharacter && nextCharacter !== ' ') {
                return null;
            }
            const fill = match[1] && 'fill';
            const calc = match[2] && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getCalc(match[2]);
            const percentage = match[3] && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPercentage(match[3]);
            const integer = match[4] && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInteger(match[4]);
            if (!fill && !calc && !percentage && !integer) {
                return null;
            }
            values.push(fill || calc || percentage || integer);
        }
        if (!values.length || values.length > 4) {
            return null;
        }
        return {
            'border-image-slice': {
                important,
                value: values.join(' ')
            }
        };
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImageWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'border-image-width': {
                    important,
                    value: lowerValue
                }
            };
        }
        const parts = lowerValue.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        if (parts.length > 4) {
            return null;
        }
        for (const part of parts){
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInteger(part) && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(part)) {
                return null;
            }
        }
        return {
            'border-image-width': {
                important,
                value
            }
        };
    }
    /**
     * Returns border outset.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImageOutset(value, important) {
        if (value === '0') {
            return {
                'border-image-outset': {
                    important,
                    value
                }
            };
        }
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image-outset': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'border-image-outset': {
                    important,
                    value: lowerValue
                }
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        if (parts.length > 4) {
            return null;
        }
        const newParts = [];
        for (const part of parts){
            const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(part) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloat(part);
            if (!parsedValue) {
                return null;
            }
            newParts.push(parsedValue === '0px' ? '0' : parsedValue);
        }
        return {
            'border-image-outset': {
                important,
                value: newParts.join(' ')
            }
        };
    }
    /**
     * Returns border repeat.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderImageRepeat(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-image-repeat': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'border-image-repeat': {
                    important,
                    value: lowerValue
                }
            };
        }
        const parts = lowerValue.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        if (parts.length > 2) {
            return null;
        }
        for (const part of parts){
            if (!BORDER_IMAGE_REPEAT.includes(part)) {
                return null;
            }
        }
        return {
            'border-image-repeat': {
                important,
                value
            }
        };
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderTopWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = BORDER_WIDTH.includes(lowerValue) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) ? lowerValue : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        if (parsedValue) {
            return {
                'border-top-width': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderRightWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-right-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = BORDER_WIDTH.includes(lowerValue) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) ? lowerValue : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        if (parsedValue) {
            return {
                'border-right-width': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderBottomWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = BORDER_WIDTH.includes(lowerValue) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) ? lowerValue : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        if (parsedValue) {
            return {
                'border-bottom-width': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border width.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderLeftWidth(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-left-width': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = BORDER_WIDTH.includes(lowerValue) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) ? lowerValue : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLength(value);
        if (parsedValue) {
            return {
                'border-left-width': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderTopStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_STYLE.includes(lowerValue)) {
            return {
                'border-top-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderRightStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-right-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_STYLE.includes(lowerValue)) {
            return {
                'border-right-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderBottomStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_STYLE.includes(lowerValue)) {
            return {
                'border-bottom-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderLeftStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-left-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BORDER_STYLE.includes(lowerValue)) {
            return {
                'border-left-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns border color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderTopColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'border-top-color': {
                value: color,
                important
            }
        } : null;
    }
    /**
     * Returns border color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderRightColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-right-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'border-right-color': {
                value: color,
                important
            }
        } : null;
    }
    /**
     * Returns border color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderBottomColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'border-bottom-color': {
                value: color,
                important
            }
        } : null;
    }
    /**
     * Returns border color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBorderLeftColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-left-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'border-left-color': {
                value: color,
                important
            }
        } : null;
    }
    /**
     * Returns border radius.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderRadius(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-radius': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderTopLeftRadius(globalValue, important),
                ...this.getBorderTopRightRadius(globalValue, important),
                ...this.getBorderBottomRightRadius(globalValue, important),
                ...this.getBorderBottomLeftRadius(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const topLeft = this.getBorderTopLeftRadius(parts[0], important);
        const topRight = this.getBorderTopRightRadius(parts[1] || parts[0], important);
        const bottomRight = this.getBorderBottomRightRadius(parts[2] || parts[0], important);
        const bottomLeft = this.getBorderBottomLeftRadius(parts[3] || parts[1] || parts[0], important);
        if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
            return null;
        }
        return {
            ...topLeft,
            ...topRight,
            ...bottomRight,
            ...bottomLeft
        };
    }
    /**
     * Returns border radius.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderTopLeftRadius(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top-left-radius': {
                    value: variable,
                    important
                }
            };
        }
        const radius = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return radius ? {
            'border-top-left-radius': {
                important,
                value: radius
            }
        } : null;
    }
    /**
     * Returns border radius.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderTopRightRadius(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top-right-radius': {
                    value: variable,
                    important
                }
            };
        }
        const radius = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return radius ? {
            'border-top-right-radius': {
                important,
                value: radius
            }
        } : null;
    }
    /**
     * Returns border radius.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderBottomRightRadius(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom-right-radius': {
                    value: variable,
                    important
                }
            };
        }
        const radius = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return radius ? {
            'border-bottom-right-radius': {
                important,
                value: radius
            }
        } : null;
    }
    /**
     * Returns border radius.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderBottomLeftRadius(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom-left-radius': {
                    value: variable,
                    important
                }
            };
        }
        const radius = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return radius ? {
            'border-bottom-left-radius': {
                important,
                value: radius
            }
        } : null;
    }
    /**
     * Returns border top, right, bottom or left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderTop(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-top': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderTopWidth(globalValue, important),
                ...this.getBorderTopStyle(globalValue, important),
                ...this.getBorderTopColor(globalValue, important)
            };
        }
        const properties = {
            ...this.getBorderTopWidth('initial', important),
            ...this.getBorderTopStyle('initial', important),
            ...this.getBorderTopColor('initial', important)
        };
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getBorderTopWidth(part, important);
            const style = this.getBorderTopStyle(part, important);
            const color = this.getBorderTopColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns border top, right, bottom or left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderRight(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-right': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderRightWidth(globalValue, important),
                ...this.getBorderRightStyle(globalValue, important),
                ...this.getBorderRightColor(globalValue, important)
            };
        }
        const properties = {
            ...this.getBorderRightWidth('initial', important),
            ...this.getBorderRightStyle('initial', important),
            ...this.getBorderRightColor('initial', important)
        };
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getBorderRightWidth(part, important);
            const style = this.getBorderRightStyle(part, important);
            const color = this.getBorderRightColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns border top, right, bottom or left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderBottom(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-bottom': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderBottomWidth(globalValue, important),
                ...this.getBorderBottomStyle(globalValue, important),
                ...this.getBorderBottomColor(globalValue, important)
            };
        }
        const properties = {
            ...this.getBorderBottomWidth('initial', important),
            ...this.getBorderBottomStyle('initial', important),
            ...this.getBorderBottomColor('initial', important)
        };
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getBorderBottomWidth(part, important);
            const style = this.getBorderBottomStyle(part, important);
            const color = this.getBorderBottomColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns border top, right, bottom or left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBorderLeft(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'border-left': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBorderLeftWidth(globalValue, important),
                ...this.getBorderLeftStyle(globalValue, important),
                ...this.getBorderLeftColor(globalValue, important)
            };
        }
        const properties = {
            ...this.getBorderLeftWidth('initial', important),
            ...this.getBorderLeftStyle('initial', important),
            ...this.getBorderLeftColor('initial', important)
        };
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for (const part of parts){
            const width = this.getBorderLeftWidth(part, important);
            const style = this.getBorderLeftStyle(part, important);
            const color = this.getBorderLeftColor(part, important);
            if (width === null && style === null && color === null) {
                return null;
            }
            Object.assign(properties, width, style, color);
        }
        return properties;
    }
    /**
     * Returns padding.
     *
     * @param value Value.
     * @param important Important.
     */ static getPadding(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                padding: {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getPaddingTop(globalValue, important),
                ...this.getPaddingRight(globalValue, important),
                ...this.getPaddingBottom(globalValue, important),
                ...this.getPaddingLeft(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const top = this.getPaddingTop(parts[0], important);
        const right = this.getPaddingRight(parts[1] || parts[0], important);
        const bottom = this.getPaddingBottom(parts[2] || parts[0], important);
        const left = this.getPaddingLeft(parts[3] || parts[1] || parts[0], important);
        if (!top || !right || !bottom || !left) {
            return null;
        }
        return {
            ...top,
            ...right,
            ...bottom,
            ...left
        };
    }
    /**
     * Returns padding top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getPaddingTop(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'padding-top': {
                    value: variable,
                    important
                }
            };
        }
        const padding = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return padding ? {
            'padding-top': {
                value: padding,
                important
            }
        } : null;
    }
    /**
     * Returns padding right.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getPaddingRight(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'padding-right': {
                    value: variable,
                    important
                }
            };
        }
        const padding = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return padding ? {
            'padding-right': {
                value: padding,
                important
            }
        } : null;
    }
    /**
     * Returns padding bottom.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getPaddingBottom(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'padding-bottom': {
                    value: variable,
                    important
                }
            };
        }
        const padding = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return padding ? {
            'padding-bottom': {
                value: padding,
                important
            }
        } : null;
    }
    /**
     * Returns padding left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getPaddingLeft(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'padding-left': {
                    value: variable,
                    important
                }
            };
        }
        const padding = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return padding ? {
            'padding-left': {
                value: padding,
                important
            }
        } : null;
    }
    /**
     * Returns margin.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getMargin(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                margin: {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getMarginTop(globalValue, important),
                ...this.getMarginRight(globalValue, important),
                ...this.getMarginBottom(globalValue, important),
                ...this.getMarginLeft(globalValue, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const top = this.getMarginTop(parts[0], important);
        const right = this.getMarginRight(parts[1] || parts[0], important);
        const bottom = this.getMarginBottom(parts[2] || parts[0], important);
        const left = this.getMarginLeft(parts[3] || parts[1] || parts[0], important);
        if (!top || !right || !bottom || !left) {
            return null;
        }
        return {
            ...top,
            ...right,
            ...bottom,
            ...left
        };
    }
    /**
     * Returns margin top.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getMarginTop(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'margin-top': {
                    value: variable,
                    important
                }
            };
        }
        const margin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(value);
        return margin ? {
            'margin-top': {
                value: margin,
                important
            }
        } : null;
    }
    /**
     * Returns margin right.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getMarginRight(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'margin-right': {
                    value: variable,
                    important
                }
            };
        }
        const margin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(value);
        return margin ? {
            'margin-right': {
                value: margin,
                important
            }
        } : null;
    }
    /**
     * Returns margin right.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getMarginBottom(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'margin-bottom': {
                    value: variable,
                    important
                }
            };
        }
        const margin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(value);
        return margin ? {
            'margin-bottom': {
                value: margin,
                important
            }
        } : null;
    }
    /**
     * Returns margin left.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getMarginLeft(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'margin-left': {
                    value: variable,
                    important
                }
            };
        }
        const margin = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(value);
        return margin ? {
            'margin-left': {
                value: margin,
                important
            }
        } : null;
    }
    /**
     * Returns flex.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getFlex(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                flex: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.trim().toLowerCase();
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getFlexGrow(globalValue, important),
                ...this.getFlexShrink(globalValue, important),
                ...this.getFlexBasis(globalValue, important)
            };
        }
        switch(lowerValue){
            case 'none':
                return {
                    ...this.getFlexGrow('0', important),
                    ...this.getFlexShrink('0', important),
                    ...this.getFlexBasis('auto', important)
                };
            case 'auto':
                return {
                    ...this.getFlexGrow('1', important),
                    ...this.getFlexShrink('1', important),
                    ...this.getFlexBasis('auto', important)
                };
        }
        const measurement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(lowerValue);
        if (measurement) {
            return {
                ...this.getFlexGrow('1', important),
                ...this.getFlexShrink('1', important),
                ...this.getFlexBasis(measurement, important)
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        const flexGrow = this.getFlexGrow(parts[0], important);
        const flexShrink = this.getFlexShrink(parts[1] || '1', important);
        const flexBasis = this.getFlexBasis(parts[2] || '0%', important);
        if (!flexGrow || !flexShrink || !flexBasis) {
            return null;
        }
        return {
            ...flexGrow,
            ...flexShrink,
            ...flexBasis
        };
    }
    /**
     * Returns flex basis.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFlexBasis(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'flex-basis': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FLEX_BASIS.includes(lowerValue)) {
            return {
                'flex-basis': {
                    value: lowerValue,
                    important
                }
            };
        }
        const measurement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getContentMeasurement(lowerValue);
        return measurement ? {
            'flex-basis': {
                value: measurement,
                important
            }
        } : null;
    }
    /**
     * Returns flex shrink.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFlexShrink(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'flex-shrink': {
                    value: variable,
                    important
                }
            };
        }
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloat(value);
        return parsedValue ? {
            'flex-shrink': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns flex grow.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFlexGrow(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'flex-grow': {
                    value: variable,
                    important
                }
            };
        }
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloat(value);
        return parsedValue ? {
            'flex-grow': {
                value: parsedValue,
                important
            }
        } : null;
    }
    /**
     * Returns background.
     *
     * @param name Name.
     * @param value Value.
     * @param important Important.
     * @returns Property values.
     */ static getBackground(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                background: {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBackgroundImage(globalValue, important),
                ...this.getBackgroundPosition(globalValue, important),
                ...this.getBackgroundSize(globalValue, important),
                ...this.getBackgroundRepeat(globalValue, important),
                ...this.getBackgroundAttachment(globalValue, important),
                ...this.getBackgroundOrigin(globalValue, important),
                ...this.getBackgroundClip(globalValue, important),
                ...this.getBackgroundColor(globalValue, important)
            };
        }
        const properties = {
            ...this.getBackgroundImage('initial', important),
            ...this.getBackgroundPosition('initial', important),
            ...this.getBackgroundSize('initial', important),
            ...this.getBackgroundRepeat('initial', important),
            ...this.getBackgroundAttachment('initial', important),
            ...this.getBackgroundOrigin('initial', important),
            ...this.getBackgroundClip('initial', important),
            ...this.getBackgroundColor('initial', important)
        };
        const parts = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].splitBySpace(value.replace(/\s+\/\s+/g, '/'));
        const backgroundPositions = [];
        for (const part of parts){
            if (!part.startsWith('url') && part.includes('/')) {
                const [position, size] = part.split('/');
                const backgroundPositionX = this.getBackgroundPositionX(position, important);
                const backgroundPositionY = this.getBackgroundPositionY(position, important);
                const backgroundSize = this.getBackgroundSize(size, important);
                if (!backgroundPositionX && !backgroundPositionY || !backgroundSize) {
                    return null;
                }
                if (backgroundPositionY) {
                    backgroundPositions.push(backgroundPositionY['background-position-y'].value);
                } else if (backgroundPositionX) {
                    backgroundPositions.push(backgroundPositionX['background-position-x'].value);
                }
                Object.assign(properties, backgroundSize);
            } else {
                const backgroundImage = this.getBackgroundImage(part, important);
                const backgroundRepeat = this.getBackgroundRepeat(part, important);
                const backgroundAttachment = this.getBackgroundAttachment(part, important);
                const backgroundPositionX = this.getBackgroundPositionX(part, important);
                const backgroundPositionY = this.getBackgroundPositionY(part, important);
                const backgroundColor = this.getBackgroundColor(part, important);
                const backgroundOrigin = this.getBackgroundOrigin(part, important);
                const backgroundClip = this.getBackgroundClip(part, important);
                if (!backgroundImage && !backgroundRepeat && !backgroundAttachment && !backgroundPositionX && !backgroundPositionY && !backgroundColor && !backgroundOrigin && !backgroundClip) {
                    return null;
                }
                if (backgroundPositionX) {
                    backgroundPositions.push(backgroundPositionX['background-position-x'].value);
                } else if (backgroundPositionY) {
                    backgroundPositions.push(backgroundPositionY['background-position-y'].value);
                }
                Object.assign(properties, backgroundImage, backgroundRepeat, backgroundAttachment, backgroundColor, backgroundOrigin, backgroundClip);
            }
        }
        if (backgroundPositions.length) {
            Object.assign(properties, this.getBackgroundPosition(backgroundPositions.join(' '), important));
        }
        return properties;
    }
    /**
     * Returns background size.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundSize(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-size': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'background-size': {
                    value: lowerValue,
                    important
                }
            };
        }
        const imageParts = lowerValue.split(SPLIT_COMMA_SEPARATED_WITH_PARANTHESES_REGEXP);
        const parsed = [];
        for (const imagePart of imageParts){
            const parts = imagePart.trim().split(' ');
            if (parts.length !== 1 && parts.length !== 2) {
                return null;
            }
            if (parts.length === 1) {
                if (parts[0] !== 'cover' && parts[0] !== 'contain' && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(parts[0])) {
                    return null;
                }
                parsed.push(parts[0]);
            } else {
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(parts[0]) || !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAutoMeasurement(parts[1])) {
                    return null;
                }
                parsed.push(`${parts[0]} ${parts[1]}`);
            }
        }
        if (parsed.length === 1) {
            return {
                'background-size': {
                    value: parsed.join(', '),
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns background origin.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundOrigin(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-origin': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BACKGROUND_ORIGIN.includes(lowerValue)) {
            return {
                'background-origin': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns background clip.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundClip(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-clip': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BACKGROUND_CLIP.includes(lowerValue)) {
            return {
                'background-clip': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns background repeat.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundRepeat(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-repeat': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BACKGROUND_REPEAT.includes(lowerValue)) {
            return {
                'background-repeat': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns background attachment.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundAttachment(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-attachment': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || BACKGROUND_ATTACHMENT.includes(lowerValue)) {
            return {
                'background-attachment': {
                    value: lowerValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns background position.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundPosition(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-position': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                ...this.getBackgroundPositionX(globalValue, important),
                ...this.getBackgroundPositionY(globalValue, important)
            };
        }
        const imageParts = value.split(SPLIT_COMMA_SEPARATED_WITH_PARANTHESES_REGEXP);
        let x = '';
        let y = '';
        for (const imagePart of imageParts){
            const parts = imagePart.trim().split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
            if (x) {
                x += ',';
                y += ',';
            }
            switch(parts.length){
                case 1:
                    if (parts[0] === 'top' || parts[0] === 'bottom') {
                        x += 'center';
                        y += parts[0];
                    } else if (parts[0] === 'left' || parts[0] === 'right') {
                        x += parts[0];
                        y += 'center';
                    } else if (parts[0] === 'center') {
                        x += 'center';
                        y += 'center';
                    }
                    break;
                case 2:
                    x += parts[0] === 'top' || parts[0] === 'bottom' ? parts[1] : parts[0];
                    y += parts[0] === 'top' || parts[0] === 'bottom' ? parts[0] : parts[1];
                    break;
                case 3:
                    if (parts[0] === 'top' || parts[0] === 'bottom' || parts[1] === 'left' || parts[1] === 'right' || parts[2] === 'left' || parts[2] === 'right') {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(parts[1])) {
                            x += parts[2];
                            y += `${parts[0]} ${parts[1]}`;
                        } else {
                            x += `${parts[1]} ${parts[2]}`;
                            y += parts[0];
                        }
                    } else {
                        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(parts[1])) {
                            x += `${parts[0]} ${parts[1]}`;
                            y += parts[2];
                        } else {
                            x += parts[0];
                            y += `${parts[1]} ${parts[2]}`;
                        }
                    }
                    break;
                case 4:
                    x += parts[0] === 'top' || parts[0] === 'bottom' || parts[1] === 'top' || parts[1] === 'bottom' ? `${parts[2]} ${parts[3]}` : `${parts[0]} ${parts[1]}`;
                    y += parts[0] === 'top' || parts[0] === 'bottom' || parts[1] === 'top' || parts[1] === 'bottom' ? `${parts[0]} ${parts[1]}` : `${parts[2]} ${parts[3]}`;
                    break;
                default:
                    return null;
            }
        }
        const xValue = this.getBackgroundPositionX(x, important);
        const yValue = this.getBackgroundPositionY(y, important);
        if (xValue && yValue) {
            return {
                ...xValue,
                ...yValue
            };
        }
        return null;
    }
    /**
     * Returns background position.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundPositionX(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-position-x': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'background-position-x': {
                    value: lowerValue,
                    important
                }
            };
        }
        const imageParts = lowerValue.split(SPLIT_COMMA_SEPARATED_WITH_PARANTHESES_REGEXP);
        let parsedValue = '';
        for (const imagePart of imageParts){
            const parts = imagePart.trim().split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
            if (parsedValue) {
                parsedValue += ',';
            }
            for (const part of parts){
                const measurement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(part);
                if (!measurement && part !== 'left' && part !== 'right' && part !== 'center') {
                    return null;
                }
                if (parsedValue) {
                    parsedValue += ' ';
                }
                parsedValue += measurement || part;
            }
        }
        return {
            'background-position-x': {
                value: parsedValue,
                important
            }
        };
    }
    /**
     * Returns background position.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getBackgroundPositionY(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-position-y': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'background-position-y': {
                    value: lowerValue,
                    important
                }
            };
        }
        const imageParts = lowerValue.split(SPLIT_COMMA_SEPARATED_WITH_PARANTHESES_REGEXP);
        let parsedValue = '';
        for (const imagePart of imageParts){
            const parts = imagePart.trim().split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
            if (parsedValue) {
                parsedValue += ',';
            }
            for (const part of parts){
                const measurement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(part);
                if (!measurement && part !== 'top' && part !== 'bottom' && part !== 'center') {
                    return null;
                }
                if (parsedValue) {
                    parsedValue += ' ';
                }
                parsedValue += measurement || part;
            }
        }
        return {
            'background-position-y': {
                value: parsedValue,
                important
            }
        };
    }
    /**
     * Returns background color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property value.
     */ static getBackgroundColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            ['background-color']: {
                important,
                value: color
            }
        } : null;
    }
    /**
     * Returns background image.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property value.
     */ static getBackgroundImage(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'background-image': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'none') {
            return {
                'background-image': {
                    value: lowerValue,
                    important
                }
            };
        }
        const parts = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].splitByComma(value);
        const parsed = [];
        for (const part of parts){
            const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getURL(part.trim()) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGradient(part.trim());
            if (!parsedValue) {
                return null;
            }
            parsed.push(parsedValue);
        }
        if (parsed.length) {
            return {
                'background-image': {
                    value: parsed.join(', '),
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property value.
     */ static getColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                color: {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            color: {
                important,
                value: color
            }
        } : null;
    }
    /**
     * Returns color.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property value.
     */ static getFloodColor(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'flood-color': {
                    value: variable,
                    important
                }
            };
        }
        const color = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value);
        return color ? {
            'flood-color': {
                important,
                value: color
            }
        } : null;
    }
    /**
     * Returns font.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFont(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                font: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                ...this.getFontStyle(lowerValue, important),
                ...this.getFontVariant(lowerValue, important),
                ...this.getFontWeight(lowerValue, important),
                ...this.getFontStretch(lowerValue, important),
                ...this.getFontSize(lowerValue, important),
                ...this.getLineHeight(lowerValue, important),
                ...this.getFontFamily(lowerValue, important)
            };
        }
        if (SYSTEM_FONT.includes(lowerValue)) {
            return {
                font: {
                    value: lowerValue,
                    important
                }
            };
        }
        const properties = {
            ...this.getFontStyle('normal', important),
            ...this.getFontVariant('normal', important),
            ...this.getFontWeight('normal', important),
            ...this.getFontStretch('normal', important),
            ...this.getLineHeight('normal', important)
        };
        const parts = value.replace(/\s*\/\s*/g, '/').split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        for(let i = 0, max = parts.length; i < max; i++){
            const part = parts[i];
            if (part.includes('/')) {
                const [size, height] = part.split('/');
                const fontSize = this.getFontSize(size, important);
                const lineHeight = this.getLineHeight(height, important);
                if (!fontSize || !lineHeight) {
                    return null;
                }
                Object.assign(properties, fontSize, lineHeight);
            } else {
                const fontStyle = this.getFontStyle(part, important);
                const fontVariant = this.getFontVariant(part, important);
                const fontWeight = this.getFontWeight(part, important);
                const fontSize = this.getFontSize(part, important);
                const fontStretch = this.getFontStretch(part, important);
                if (fontStyle) {
                    Object.assign(properties, fontStyle);
                } else if (fontVariant) {
                    Object.assign(properties, fontVariant);
                } else if (fontWeight) {
                    Object.assign(properties, fontWeight);
                } else if (fontSize) {
                    Object.assign(properties, fontSize);
                } else if (fontStretch) {
                    Object.assign(properties, fontStretch);
                } else {
                    const fontFamilyValue = parts.slice(i).join(' ');
                    const fontFamily = this.getFontFamily(fontFamilyValue, important);
                    if (!fontFamily) {
                        return null;
                    }
                    Object.assign(properties, fontFamily);
                    break;
                }
            }
        }
        return properties;
    }
    /**
     * Returns font style.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontStyle(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-style': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FONT_STYLE.includes(lowerValue)) {
            return {
                'font-style': {
                    value: lowerValue,
                    important
                }
            };
        }
        const parts = value.split(SPLIT_SPACE_SEPARATED_WITH_PARANTHESES_REGEXP);
        if (parts.length === 2 && parts[0] === 'oblique') {
            const degree = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getDegree(parts[1]);
            return degree ? {
                'font-style': {
                    value: lowerValue,
                    important
                }
            } : null;
        }
        return null;
    }
    /**
     * Returns font variant.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontVariant(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-variant': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'normal' || lowerValue === 'small-caps' ? {
            'font-variant': {
                value: lowerValue,
                important
            }
        } : null;
    }
    /**
     * Returns font strech.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontStretch(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-stretch': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FONT_STRETCH.includes(lowerValue)) {
            return {
                'font-stretch': {
                    value: lowerValue,
                    important
                }
            };
        }
        const percentage = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPercentage(value);
        return percentage ? {
            'font-stretch': {
                value: percentage,
                important
            }
        } : null;
    }
    /**
     * Returns font weight.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontWeight(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-weight': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FONT_WEIGHT.includes(lowerValue)) {
            return {
                'font-weight': {
                    value: lowerValue,
                    important
                }
            };
        }
        const integer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInteger(value);
        return integer ? {
            'font-weight': {
                value: integer,
                important
            }
        } : null;
    }
    /**
     * Returns font size.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontSize(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-size': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || FONT_SIZE.includes(lowerValue)) {
            return {
                'font-size': {
                    value: lowerValue,
                    important
                }
            };
        }
        const measurement = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return measurement ? {
            'font-size': {
                value: measurement,
                important
            }
        } : null;
    }
    /**
     * Returns line height.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getLineHeight(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'line-height': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || lowerValue === 'normal') {
            return {
                'line-height': {
                    value: lowerValue,
                    important
                }
            };
        }
        const lineHeight = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloat(value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMeasurement(value);
        return lineHeight ? {
            'line-height': {
                value: lineHeight,
                important
            }
        } : null;
    }
    /**
     * Returns font family.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getFontFamily(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'font-family': {
                    value: variable,
                    important
                }
            };
        }
        const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(value);
        if (globalValue) {
            return {
                'font-family': {
                    value: globalValue,
                    important
                }
            };
        }
        const parts = value.split(',');
        let parsedValue = '';
        let endWithApostroph = false;
        for(let i = 0, max = parts.length; i < max; i++){
            let trimmedPart = parts[i].trim().replace(/'/g, '"');
            if (!trimmedPart) {
                return null;
            }
            if (trimmedPart.includes(' ')) {
                const apostrophCount = (trimmedPart.match(/"/g) || []).length;
                if ((trimmedPart[0] !== '"' || i !== 0) && apostrophCount !== 2 && apostrophCount !== 0) {
                    return null;
                }
                if (trimmedPart[0] === '"' && trimmedPart[trimmedPart.length - 1] !== '"') {
                    endWithApostroph = true;
                } else if (trimmedPart[0] !== '"' && trimmedPart[trimmedPart.length - 1] !== '"') {
                    trimmedPart = `"${trimmedPart}"`;
                }
            } else {
                trimmedPart = trimmedPart.replace(/"/g, '');
            }
            if (i > 0) {
                parsedValue += ', ';
            }
            parsedValue += trimmedPart;
        }
        if (endWithApostroph) {
            parsedValue += '"';
        }
        if (!parsedValue) {
            return null;
        }
        return {
            'font-family': {
                important,
                value: parsedValue
            }
        };
    }
    /**
     * Returns font family.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property values
     */ static getTextTransform(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'text-transform': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || TEXT_TRANSFORM.includes(lowerValue) && lowerValue;
        if (parsedValue) {
            return {
                'text-transform': {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns visibility.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property
     */ static getVisibility(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                visibility: {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        const parsedValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue) || VISIBILITY.includes(lowerValue) && lowerValue;
        if (parsedValue) {
            return {
                visibility: {
                    value: parsedValue,
                    important
                }
            };
        }
        return null;
    }
    /**
     * Returns aspect ratio.
     *
     * @param value Value.
     * @param important Important.
     * @returns Property
     */ static getAspectRatio(value, important) {
        const variable = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVariable(value);
        if (variable) {
            return {
                'aspect-ratio': {
                    value: variable,
                    important
                }
            };
        }
        const lowerValue = value.toLowerCase();
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(lowerValue)) {
            return {
                'aspect-ratio': {
                    value: lowerValue,
                    important
                }
            };
        }
        let parsedValue = value;
        const hasAuto = parsedValue.includes('auto');
        if (hasAuto) {
            parsedValue = parsedValue.replace('auto', '');
        }
        parsedValue = parsedValue.replace(WHITE_SPACE_GLOBAL_REGEXP, '');
        if (!parsedValue) {
            return {
                'aspect-ratio': {
                    value: 'auto',
                    important
                }
            };
        }
        const aspectRatio = parsedValue.split('/');
        if (aspectRatio.length > 3) {
            return null;
        }
        const width = Number(aspectRatio[0]);
        const height = aspectRatio[1] ? Number(aspectRatio[1]) : 1;
        if (isNaN(width) || isNaN(height)) {
            return null;
        }
        if (hasAuto) {
            return {
                'aspect-ratio': {
                    value: `auto ${width} / ${height}`,
                    important
                }
            };
        }
        return {
            'aspect-ratio': {
                value: `${width} / ${height}`,
                important
            }
        };
    }
} //# sourceMappingURL=CSSStyleDeclarationPropertySetParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertyGetParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationPropertyGetParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueParser.js [app-ssr] (ecmascript)");
;
class CSSStyleDeclarationPropertyGetParser {
    /**
     * Returns margin.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getMargin(properties) {
        return this.getPaddingLikeProperty([
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left'
        ], properties);
    }
    /**
     * Returns padding.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getPadding(properties) {
        return this.getPaddingLikeProperty([
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left'
        ], properties);
    }
    /**
     * Returns outline.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getOutline(properties) {
        if (!properties['outline-color']?.value || !properties['outline-style']?.value || !properties['outline-width']?.value) {
            return null;
        }
        const important = properties['outline-color'].important && properties['outline-style'].important && properties['outline-width'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['outline-width'].value) && properties['outline-width'].value === properties['outline-style'].value && properties['outline-width'].value === properties['outline-color'].value) {
            return {
                important,
                value: properties['outline-width'].value
            };
        }
        const values = [];
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['outline-color']?.value)) {
            values.push(properties['outline-color'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['outline-style']?.value)) {
            values.push(properties['outline-style'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['outline-width'].value)) {
            values.push(properties['outline-width'].value);
        }
        return {
            important,
            value: values.join(' ')
        };
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorder(properties) {
        if (!properties['border-top-width']?.value || properties['border-top-width']?.value !== properties['border-right-width']?.value || properties['border-top-width']?.value !== properties['border-bottom-width']?.value || properties['border-top-width']?.value !== properties['border-left-width']?.value || !properties['border-top-style']?.value || properties['border-top-style']?.value !== properties['border-right-style']?.value || properties['border-top-style']?.value !== properties['border-bottom-style']?.value || properties['border-top-style']?.value !== properties['border-left-style']?.value || !properties['border-top-color']?.value || properties['border-top-color']?.value !== properties['border-right-color']?.value || properties['border-top-color']?.value !== properties['border-bottom-color']?.value || properties['border-top-color']?.value !== properties['border-left-color']?.value || !properties['border-image-source']?.value || !properties['border-image-slice']?.value || !properties['border-image-width']?.value || !properties['border-image-outset']?.value || !properties['border-image-repeat']?.value) {
            return null;
        }
        const important = properties['border-top-width'].important && properties['border-right-width'].important && properties['border-bottom-width'].important && properties['border-left-width'].important && properties['border-top-style'].important && properties['border-right-style'].important && properties['border-bottom-style'].important && properties['border-left-style'].important && properties['border-top-color'].important && properties['border-right-color'].important && properties['border-bottom-color'].important && properties['border-left-color'].important && properties['border-image-source'].important && properties['border-image-slice'].important && properties['border-image-width'].important && properties['border-image-outset'].important && properties['border-image-repeat'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-top-width'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-top-style'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-top-color'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-image-source'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-image-slice'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-image-width'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-image-outset'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['border-image-repeat'].value)) {
            if (properties['border-top-width'].value !== properties['border-top-style'].value || properties['border-top-width'].value !== properties['border-top-color'].value || properties['border-top-width'].value !== properties['border-image-source'].value || properties['border-top-width'].value !== properties['border-image-slice'].value || properties['border-top-width'].value !== properties['border-image-width'].value || properties['border-top-width'].value !== properties['border-image-outset'].value || properties['border-top-width'].value !== properties['border-image-repeat'].value) {
                return null;
            }
            return {
                important,
                value: properties['border-top-width'].value
            };
        }
        const values = [];
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['border-top-width'].value)) {
            values.push(properties['border-top-width'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['border-top-style'].value)) {
            values.push(properties['border-top-style'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['border-top-color'].value)) {
            values.push(properties['border-top-color'].value);
        }
        return {
            important,
            value: values.join(' ')
        };
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderTop(properties) {
        return this.getBorderTopRightBottomLeft('top', properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderRight(properties) {
        return this.getBorderTopRightBottomLeft('right', properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderBottom(properties) {
        return this.getBorderTopRightBottomLeft('bottom', properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderLeft(properties) {
        return this.getBorderTopRightBottomLeft('left', properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderColor(properties) {
        return this.getPaddingLikeProperty([
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color'
        ], properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderWidth(properties) {
        return this.getPaddingLikeProperty([
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width'
        ], properties);
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderStyle(properties) {
        return this.getPaddingLikeProperty([
            'border-top-style',
            'border-right-style',
            'border-bottom-style',
            'border-left-style'
        ], properties);
    }
    /**
     * Returns border radius.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderRadius(properties) {
        return this.getPaddingLikeProperty([
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-right-radius',
            'border-bottom-left-radius'
        ], properties);
    }
    /**
     * Returns border image.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBorderImage(properties) {
        if (!properties['border-image-source']?.value || !properties['border-image-slice']?.value || !properties['border-image-width']?.value || !properties['border-image-outset']?.value || !properties['border-image-repeat']?.value) {
            return null;
        }
        const important = properties['border-image-source'].important && properties['border-image-slice'].important && properties['border-image-width'].important && properties['border-image-outset'].important && properties['border-image-repeat'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['border-image-source'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['border-image-slice'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['border-image-width'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['border-image-outset'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['border-image-repeat'].value)) {
            if (properties['border-image-source'].value !== properties['border-image-slice'].value || properties['border-image-source'].value !== properties['border-image-width'].value || properties['border-image-source'].value !== properties['border-image-outset'].value || properties['border-image-source'].value !== properties['border-image-repeat'].value) {
                return null;
            }
            return {
                important,
                value: properties['border-image-source'].value
            };
        }
        return {
            important,
            value: `${properties['border-image-source'].value} ${properties['border-image-slice'].value} / ${properties['border-image-width'].value} / ${properties['border-image-outset'].value} ${properties['border-image-repeat'].value}`
        };
    }
    /**
     * Returns background.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBackground(properties) {
        if (!properties['background-image']?.value || !properties['background-repeat']?.value || !properties['background-attachment']?.value || !properties['background-position-x']?.value || !properties['background-position-y']?.value || !properties['background-color']?.value || !properties['background-size']?.value || !properties['background-origin']?.value || !properties['background-clip']?.value) {
            return null;
        }
        const important = properties['background-image'].important && properties['background-repeat'].important && properties['background-attachment'].important && properties['background-position-x'].important && properties['background-position-y'].important && properties['background-color'].important && properties['background-size'].important && properties['background-origin'].important && properties['background-clip'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-image'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-repeat'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-attachment'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-position-x'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-position-y'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-color'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-size'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-origin'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties['background-clip'].value)) {
            if (properties['background-image'].value !== properties['background-repeat'].value || properties['background-image'].value !== properties['background-attachment'].value || properties['background-image'].value !== properties['background-position-x'].value || properties['background-image'].value !== properties['background-position-y'].value || properties['background-image'].value !== properties['background-color'].value || properties['background-image'].value !== properties['background-size'].value || properties['background-image'].value !== properties['background-origin'].value || properties['background-image'].value !== properties['background-clip'].value) {
                return null;
            }
            return {
                important,
                value: properties['background-image'].value
            };
        }
        const values = [];
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-image'].value)) {
            values.push(properties['background-image'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-position-x'].value) && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-position-y'].value) && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-size'].value)) {
            values.push(`${properties['background-position-x'].value} ${properties['background-position-y'].value} / ${properties['background-size'].value}`);
        } else if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-position-x'].value) && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-position-y'].value)) {
            values.push(`${properties['background-position-x'].value} ${properties['background-position-y'].value}`);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-repeat'].value)) {
            values.push(properties['background-repeat'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-attachment'].value)) {
            values.push(properties['background-attachment'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-origin'].value)) {
            values.push(properties['background-origin'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-clip'].value)) {
            values.push(properties['background-clip'].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties['background-color'].value)) {
            values.push(properties['background-color'].value);
        }
        return {
            important,
            value: values.join(' ')
        };
    }
    /**
     * Returns background position.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getBackgroundPosition(properties) {
        if (!properties['background-position-x']?.value || !properties['background-position-y']?.value) {
            return null;
        }
        const important = properties['background-position-x'].important && properties['background-position-y'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['background-position-x'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['background-position-y'].value)) {
            if (properties['background-position-x'].value !== properties['background-position-y'].value) {
                return null;
            }
            return {
                important,
                value: properties['background-position-x'].value
            };
        }
        const positionX = properties['background-position-x'].value.replace(/ *, */g, ',').split(',');
        const positionY = properties['background-position-y'].value.replace(/ *, */g, ',').split(',');
        const parts = [];
        for(let i = 0; i < positionX.length; i++){
            parts.push(`${positionX[i]} ${positionY[i]}`);
        }
        return {
            important,
            value: parts.join(', ')
        };
    }
    /**
     * Returns flex.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getFlex(properties) {
        if (!properties['flex-grow']?.value || !properties['flex-shrink']?.value || !properties['flex-basis']?.value) {
            return null;
        }
        const important = properties['flex-grow'].important && properties['flex-shrink'].important && properties['flex-basis'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['flex-grow'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['flex-shrink'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['flex-basis'].value)) {
            if (properties['flex-grow'].value !== properties['flex-shrink'].value || properties['flex-grow'].value !== properties['flex-basis'].value) {
                return null;
            }
            return {
                important,
                value: properties['flex-grow'].value
            };
        }
        return {
            important,
            value: `${properties['flex-grow'].value} ${properties['flex-shrink'].value} ${properties['flex-basis'].value}`
        };
    }
    /**
     * Returns flex.
     *
     * @param properties Properties.
     * @returns Property value
     */ static getFont(properties) {
        if (!properties['font-size']?.value || !properties['font-family']?.value || !properties['font-weight']?.value || !properties['font-style']?.value || !properties['font-variant']?.value || !properties['font-stretch']?.value || !properties['line-height']?.value) {
            return null;
        }
        const important = properties['font-size'].important && properties['font-family'].important && properties['font-weight'].important && properties['font-style'].important && properties['font-variant'].important && properties['font-stretch'].important && properties['line-height'].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-size'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-family'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-weight'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-style'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-variant'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['font-stretch'].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties['line-height'].value)) {
            if (properties['font-size'].value !== properties['font-family'].value || properties['font-size'].value !== properties['font-weight'].value || properties['font-size'].value !== properties['font-style'].value || properties['font-size'].value !== properties['font-variant'].value || properties['font-size'].value !== properties['font-stretch'].value || properties['font-size'].value !== properties['line-height'].value) {
                return null;
            }
            return {
                important,
                value: properties['font-size'].value
            };
        }
        const values = [];
        if (properties['font-style'].value !== 'normal') {
            values.push(properties['font-style'].value);
        }
        if (properties['font-variant'].value !== 'normal') {
            values.push(properties['font-variant'].value);
        }
        if (properties['font-weight'].value !== 'normal') {
            values.push(properties['font-weight'].value);
        }
        if (properties['font-stretch'].value !== 'normal') {
            values.push(properties['font-stretch'].value);
        }
        if (properties['line-height'].value !== 'normal') {
            values.push(`${properties['font-size'].value} / ${properties['line-height'].value}`);
        } else {
            values.push(properties['font-size'].value);
        }
        values.push(properties['font-family'].value);
        return {
            important,
            value: values.join(' ')
        };
    }
    /**
     * Returns border.
     *
     * @param properties Properties.
     * @param position
     * @returns Property value
     */ static getBorderTopRightBottomLeft(position, properties) {
        if (!properties[`border-${position}-width`]?.value || !properties[`border-${position}-style`]?.value || !properties[`border-${position}-color`]?.value) {
            return null;
        }
        const important = properties[`border-${position}-width`].important && properties[`border-${position}-style`].important && properties[`border-${position}-color`].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobalExceptInitial(properties[`border-${position}-width`].value) && properties[`border-${position}-width`].value === properties[`border-${position}-style`].value && properties[`border-${position}-width`].value === properties[`border-${position}-color`].value) {
            return {
                important,
                value: properties[`border-${position}-width`].value
            };
        }
        const values = [];
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties[`border-${position}-width`].value)) {
            values.push(properties[`border-${position}-width`].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties[`border-${position}-style`]?.value)) {
            values.push(properties[`border-${position}-style`].value);
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitial(properties[`border-${position}-color`]?.value)) {
            values.push(properties[`border-${position}-color`].value);
        }
        return {
            important,
            value: values.join(' ')
        };
    }
    /**
     * Returns a padding like property.
     *
     * @param properties Properties.
     * @param position
     * @param propertyNames
     * @returns Property value
     */ static getPaddingLikeProperty(propertyNames, properties) {
        if (!properties[propertyNames[0]]?.value || !properties[propertyNames[1]]?.value || !properties[propertyNames[2]]?.value || !properties[propertyNames[3]]?.value) {
            return null;
        }
        const important = properties[propertyNames[0]].important && properties[propertyNames[1]].important && properties[propertyNames[2]].important && properties[propertyNames[3]].important;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties[propertyNames[0]].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties[propertyNames[1]].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties[propertyNames[2]].value) || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(properties[propertyNames[3]].value)) {
            if (properties[propertyNames[0]].value !== properties[propertyNames[1]].value || properties[propertyNames[0]].value !== properties[propertyNames[2]].value || properties[propertyNames[0]].value !== properties[propertyNames[3]].value) {
                return null;
            }
            return {
                important,
                value: properties[propertyNames[0]].value
            };
        }
        const values = [
            properties[propertyNames[0]].value
        ];
        if (properties[propertyNames[1]].value !== properties[propertyNames[0]].value || properties[propertyNames[2]].value !== properties[propertyNames[0]].value || properties[propertyNames[3]].value !== properties[propertyNames[1]].value) {
            values.push(properties[propertyNames[1]].value);
        }
        if (properties[propertyNames[2]].value !== properties[propertyNames[0]].value || properties[propertyNames[3]].value !== properties[propertyNames[1]].value) {
            values.push(properties[propertyNames[2]].value);
        }
        if (properties[propertyNames[3]].value !== properties[propertyNames[1]].value) {
            values.push(properties[propertyNames[3]].value);
        }
        return {
            important,
            value: values.join(' ')
        };
    }
} //# sourceMappingURL=CSSStyleDeclarationPropertyGetParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/css-parser/CSSStyleDeclarationCSSParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Groups:
// Property name   => \s*([^:;]+?)\s*:
// Property value  => \s*((?:[^(;]*?(?:\([^)]*\))?)*?) <- will match any non ';' char except inside (), nested parentheses are not supported
// Important ("!important") => \s*(!important)?
// End of rule  => \s*(?:$|;)
__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationCSSParser
]);
const SPLIT_RULES_REGEXP = /\s*([^:;]+?)\s*:\s*((?:[^(;]*?(?:\([^)]*\))?)*?)\s*(!important)?\s*(?:$|;)/g;
class CSSStyleDeclarationCSSParser {
    /**
     * Class construtor.
     *
     * @param cssText CSS string.
     * @param callback Callback.
     */ static parse(cssText) {
        const properties = {};
        const rules = [];
        const regexp = new RegExp(SPLIT_RULES_REGEXP);
        let match;
        while(match = regexp.exec(cssText)){
            const name = (match[1] ?? '').trim();
            const value = (match[2] ?? '').trim();
            const important = match[3] ? true : false;
            if (name && value) {
                if (name.startsWith('--')) {
                    properties[name] = value;
                }
                rules.push({
                    name,
                    value,
                    important
                });
            }
        }
        return {
            rules,
            properties
        };
    }
} //# sourceMappingURL=CSSStyleDeclarationCSSParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertyManager.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationPropertyManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertySetParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationValueParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertyGetParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$css$2d$parser$2f$CSSStyleDeclarationCSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/css-parser/CSSStyleDeclarationCSSParser.js [app-ssr] (ecmascript)");
;
;
;
;
const TO_STRING_SHORTHAND_PROPERTIES = [
    [
        'margin'
    ],
    [
        'padding'
    ],
    [
        'border',
        [
            'border-width',
            'border-style',
            'border-color',
            'border-image'
        ]
    ],
    [
        'border-radius'
    ],
    [
        'background',
        'background-position'
    ],
    [
        'font'
    ]
];
class CSSStyleDeclarationPropertyManager {
    properties = {};
    definedPropertyNames = {};
    /**
     * Class construtor.
     *
     * @param [options] Options.
     * @param [options.cssText] CSS string.
     */ constructor(options){
        if (options?.cssText) {
            const { rules } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$css$2d$parser$2f$CSSStyleDeclarationCSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(options.cssText);
            for (const rule of rules){
                if (rule.important || !this.get(rule.name)?.important) {
                    this.set(rule.name, rule.value, rule.important);
                }
            }
        }
    }
    /**
     * Returns property value.
     *
     * @param name Property name.
     * @returns Property value.
     */ get(name) {
        if (this.properties[name]) {
            return this.properties[name];
        }
        switch(name){
            case 'margin':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMargin(this.properties);
            case 'padding':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPadding(this.properties);
            case 'border':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorder(this.properties);
            case 'border-top':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTop(this.properties);
            case 'border-right':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRight(this.properties);
            case 'border-bottom':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottom(this.properties);
            case 'border-left':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderLeft(this.properties);
            case 'border-color':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderColor(this.properties);
            case 'border-style':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderStyle(this.properties);
            case 'border-width':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderWidth(this.properties);
            case 'border-radius':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRadius(this.properties);
            case 'border-image':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImage(this.properties);
            case 'outline':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getOutline(this.properties);
            case 'background':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackground(this.properties);
            case 'background-position':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundPosition(this.properties);
            case 'flex':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFlex(this.properties);
            case 'font':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyGetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFont(this.properties);
        }
        return this.properties[name] || null;
    }
    /**
     * Removes a property.
     *
     * @param name Property name.
     */ remove(name) {
        delete this.properties[name];
        delete this.definedPropertyNames[name];
        switch(name){
            case 'border':
                delete this.properties['border-top-width'];
                delete this.properties['border-right-width'];
                delete this.properties['border-bottom-width'];
                delete this.properties['border-left-width'];
                delete this.properties['border-top-style'];
                delete this.properties['border-right-style'];
                delete this.properties['border-bottom-style'];
                delete this.properties['border-left-style'];
                delete this.properties['border-top-color'];
                delete this.properties['border-right-color'];
                delete this.properties['border-bottom-color'];
                delete this.properties['border-left-color'];
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-top':
                delete this.properties['border-top-width'];
                delete this.properties['border-top-style'];
                delete this.properties['border-top-color'];
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-right':
                delete this.properties['border-right-width'];
                delete this.properties['border-right-style'];
                delete this.properties['border-right-color'];
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-bottom':
                delete this.properties['border-bottom-width'];
                delete this.properties['border-bottom-style'];
                delete this.properties['border-bottom-color'];
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-left':
                delete this.properties['border-left-width'];
                delete this.properties['border-left-style'];
                delete this.properties['border-left-color'];
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-width':
                delete this.properties['border-top-width'];
                delete this.properties['border-right-width'];
                delete this.properties['border-bottom-width'];
                delete this.properties['border-left-width'];
                break;
            case 'border-style':
                delete this.properties['border-top-style'];
                delete this.properties['border-right-style'];
                delete this.properties['border-bottom-style'];
                delete this.properties['border-left-style'];
                break;
            case 'border-color':
                delete this.properties['border-top-color'];
                delete this.properties['border-right-color'];
                delete this.properties['border-bottom-color'];
                delete this.properties['border-left-color'];
                break;
            case 'border-image':
                delete this.properties['border-image-source'];
                delete this.properties['border-image-slice'];
                delete this.properties['border-image-width'];
                delete this.properties['border-image-outset'];
                delete this.properties['border-image-repeat'];
                break;
            case 'border-radius':
                delete this.properties['border-top-left-radius'];
                delete this.properties['border-top-right-radius'];
                delete this.properties['border-bottom-right-radius'];
                delete this.properties['border-bottom-left-radius'];
                break;
            case 'outline':
                delete this.properties['outline-color'];
                delete this.properties['outline-style'];
                delete this.properties['outline-width'];
                break;
            case 'background':
                delete this.properties['background-color'];
                delete this.properties['background-image'];
                delete this.properties['background-repeat'];
                delete this.properties['background-attachment'];
                delete this.properties['background-position-x'];
                delete this.properties['background-position-y'];
                delete this.properties['background-size'];
                delete this.properties['background-origin'];
                delete this.properties['background-clip'];
                break;
            case 'background-position':
                delete this.properties['background-position-x'];
                delete this.properties['background-position-y'];
                break;
            case 'flex':
                delete this.properties['flex-grow'];
                delete this.properties['flex-shrink'];
                delete this.properties['flex-basis'];
                break;
            case 'font':
                delete this.properties['font-style'];
                delete this.properties['font-variant'];
                delete this.properties['font-weight'];
                delete this.properties['font-stretch'];
                delete this.properties['font-size'];
                delete this.properties['line-height'];
                delete this.properties['font-family'];
                break;
            case 'padding':
                delete this.properties['padding-top'];
                delete this.properties['padding-right'];
                delete this.properties['padding-bottom'];
                delete this.properties['padding-left'];
                break;
            case 'margin':
                delete this.properties['margin-top'];
                delete this.properties['margin-right'];
                delete this.properties['margin-bottom'];
                delete this.properties['margin-left'];
                break;
        }
    }
    /**
     * Sets a property
     *
     * @param name Name.
     * @param value Value.
     * @param important Important.
     */ set(name, value, important) {
        if (value === null) {
            this.remove(name);
            return;
        }
        let properties = null;
        switch(name){
            case 'border':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorder(value, important);
                break;
            case 'border-top':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTop(value, important);
                break;
            case 'border-right':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRight(value, important);
                break;
            case 'border-bottom':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottom(value, important);
                break;
            case 'border-left':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderLeft(value, important);
                break;
            case 'border-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderWidth(value, important);
                break;
            case 'border-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderStyle(value, important);
                break;
            case 'border-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderColor(value, important);
                break;
            case 'border-image':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImage(value, important);
                break;
            case 'border-image-source':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImageSource(value, important);
                break;
            case 'border-image-slice':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImageSlice(value, important);
                break;
            case 'border-image-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImageWidth(value, important);
                break;
            case 'border-image-outset':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImageOutset(value, important);
                break;
            case 'border-image-repeat':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderImageRepeat(value, important);
                break;
            case 'border-top-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTopWidth(value, important);
                break;
            case 'border-right-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRightWidth(value, important);
                break;
            case 'border-bottom-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottomWidth(value, important);
                break;
            case 'border-left-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderLeftWidth(value, important);
                break;
            case 'border-top-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTopColor(value, important);
                break;
            case 'border-right-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRightColor(value, important);
                break;
            case 'border-bottom-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottomColor(value, important);
                break;
            case 'border-left-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderLeftColor(value, important);
                break;
            case 'border-top-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTopStyle(value, important);
                break;
            case 'border-right-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRightStyle(value, important);
                break;
            case 'border-bottom-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottomStyle(value, important);
                break;
            case 'border-left-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderLeftStyle(value, important);
                break;
            case 'border-radius':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderRadius(value, important);
                break;
            case 'border-top-left-radius':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTopLeftRadius(value, important);
                break;
            case 'border-top-right-radius':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderTopRightRadius(value, important);
                break;
            case 'border-bottom-right-radius':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottomRightRadius(value, important);
                break;
            case 'border-bottom-left-radius':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderBottomLeftRadius(value, important);
                break;
            case 'border-collapse':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBorderCollapse(value, important);
                break;
            case 'outline':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getOutline(value, important);
                break;
            case 'outline-width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getOutlineWidth(value, important);
                break;
            case 'outline-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getOutlineStyle(value, important);
                break;
            case 'outline-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getOutlineColor(value, important);
                break;
            case 'letter-spacing':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLetterSpacing(value, important);
                break;
            case 'word-spacing':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getWordSpacing(value, important);
                break;
            case 'clear':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getClear(value, important);
                break;
            case 'clip':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getClip(value, important);
                break;
            case 'css-float':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getCSSFloat(value, important);
                break;
            case 'float':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloat(value, important);
                break;
            case 'display':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getDisplay(value, important);
                break;
            case 'direction':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getDirection(value, important);
                break;
            case 'flex':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFlex(value, important);
                break;
            case 'flex-shrink':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFlexShrink(value, important);
                break;
            case 'flex-grow':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFlexGrow(value, important);
                break;
            case 'flex-basis':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFlexBasis(value, important);
                break;
            case 'padding':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPadding(value, important);
                break;
            case 'padding-top':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPaddingTop(value, important);
                break;
            case 'padding-right':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPaddingRight(value, important);
                break;
            case 'padding-bottom':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPaddingBottom(value, important);
                break;
            case 'padding-left':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getPaddingLeft(value, important);
                break;
            case 'margin':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMargin(value, important);
                break;
            case 'margin-top':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMarginTop(value, important);
                break;
            case 'margin-right':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMarginRight(value, important);
                break;
            case 'margin-bottom':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMarginBottom(value, important);
                break;
            case 'margin-left':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getMarginLeft(value, important);
                break;
            case 'background':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackground(value, important);
                break;
            case 'background-image':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundImage(value, important);
                break;
            case 'background-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundColor(value, important);
                break;
            case 'background-repeat':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundRepeat(value, important);
                break;
            case 'background-attachment':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundAttachment(value, important);
                break;
            case 'background-position':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBackgroundPosition(value, important);
                break;
            case 'width':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getWidth(value, important);
                break;
            case 'height':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getHeight(value, important);
                break;
            case 'top':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getTop(value, important);
                break;
            case 'right':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRight(value, important);
                break;
            case 'bottom':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBottom(value, important);
                break;
            case 'left':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLeft(value, important);
                break;
            case 'font':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFont(value, important);
                break;
            case 'font-style':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontStyle(value, important);
                break;
            case 'font-variant':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontVariant(value, important);
                break;
            case 'font-weight':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontWeight(value, important);
                break;
            case 'font-stretch':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontStretch(value, important);
                break;
            case 'font-size':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontSize(value, important);
                break;
            case 'line-height':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getLineHeight(value, important);
                break;
            case 'text-indent':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getTextIndent(value, important);
                break;
            case 'font-family':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFontFamily(value, important);
                break;
            case 'color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getColor(value, important);
                break;
            case 'flood-color':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFloodColor(value, important);
                break;
            case 'text-transform':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getTextTransform(value, important);
                break;
            case 'visibility':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getVisibility(value, important);
                break;
            case 'aspect-ratio':
                properties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertySetParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getAspectRatio(value, important);
                break;
            default:
                const trimmedValue = value.trim();
                if (trimmedValue) {
                    const globalValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationValueParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getGlobal(trimmedValue);
                    properties = {
                        [name]: {
                            value: globalValue || trimmedValue,
                            important
                        }
                    };
                }
                break;
        }
        if (properties !== null && Object.keys(properties).length > 0) {
            this.definedPropertyNames[name] = true;
            Object.assign(this.properties, properties);
        }
    }
    /**
     * Returns a clone.
     *
     * @returns Clone.
     */ clone() {
        const _class = this.constructor;
        const clone = new _class();
        clone.properties = JSON.parse(JSON.stringify(this.properties));
        clone.definedPropertyNames = Object.assign({}, this.definedPropertyNames);
        return clone;
    }
    /**
     * Returns size.
     *
     * @returns Size.
     */ size() {
        return Object.keys(this.properties).length;
    }
    /**
     * Returns property name.
     *
     * @param index Index.
     * @returns Property name.
     */ item(index) {
        return Object.keys(this.properties)[index] || '';
    }
    /**
     * Converts properties to string.
     *
     * @returns String.
     */ toString() {
        const result = [];
        const clone = this.clone();
        const properties = {};
        for (const shorthandPropertyGroup of TO_STRING_SHORTHAND_PROPERTIES){
            for (const shorthandProperty of shorthandPropertyGroup){
                if (Array.isArray(shorthandProperty)) {
                    let isMatch = false;
                    for (const childShorthandProperty of shorthandProperty){
                        const property = clone.get(childShorthandProperty);
                        if (property) {
                            properties[childShorthandProperty] = property;
                            clone.remove(childShorthandProperty);
                            isMatch = true;
                        }
                    }
                    if (isMatch) {
                        break;
                    }
                } else {
                    const property = clone.get(shorthandProperty);
                    if (property) {
                        properties[shorthandProperty] = property;
                        clone.remove(shorthandProperty);
                        break;
                    }
                }
            }
        }
        for (const name of Object.keys(clone.properties)){
            properties[name] = clone.get(name);
        }
        for (const definedPropertyName of Object.keys(this.definedPropertyNames)){
            const property = properties[definedPropertyName];
            if (property) {
                result.push(`${definedPropertyName}: ${property.value}${property.important ? ' !important' : ''};`);
                delete properties[definedPropertyName];
            }
        }
        for (const propertyName of Object.keys(properties)){
            const property = properties[propertyName];
            if (property) {
                result.push(`${propertyName}: ${property.value}${property.important ? ' !important' : ''};`);
            }
        }
        return result.join(' ');
    }
} //# sourceMappingURL=CSSStyleDeclarationPropertyManager.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementDefaultCSS.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = {
    default: 'display: inline;',
    A: '',
    ABBR: '',
    ADDRESS: 'display: block;',
    AREA: '',
    ARTICLE: 'display: block;',
    ASIDE: 'display: block;',
    AUDIO: 'display: none;',
    B: '',
    BASE: 'display: none;',
    BDI: '',
    BDO: '',
    BLOCKQUAOTE: '',
    BODY: 'display: block;',
    TEMPLATE: 'display: none;',
    FORM: 'display: block;',
    INPUT: 'display: inline-block;',
    TEXTAREA: 'display: inline-block;',
    SCRIPT: 'display: none;',
    IMG: '',
    LINK: 'display: none;',
    STYLE: 'display: none;',
    LABEL: '',
    SLOT: 'display: contents;',
    SVG: '',
    CIRCLE: '',
    ELLIPSE: '',
    LINE: '',
    PATH: '',
    POLYGON: '',
    POLYLINE: '',
    RECT: '',
    STOP: '',
    USE: '',
    META: 'display: none;',
    BLOCKQUOTE: 'display: block;',
    BR: '',
    BUTTON: 'display: inline-block;',
    CANVAS: '',
    CAPTION: 'display: table-caption;',
    CITE: '',
    CODE: '',
    COL: 'display: table-column;',
    COLGROUP: 'display: table-column-group;',
    DATA: '',
    DATALIST: 'display: none;',
    DD: 'display: block;',
    DEL: '',
    DETAILS: 'display: block;',
    DFN: '',
    DIALOG: {
        default: 'display: none;',
        open: 'display: block;'
    },
    DIV: 'display: block;',
    DL: 'display: block;',
    DT: 'display: block;',
    EM: '',
    EMBED: '',
    FIELDSET: 'display: block;',
    FIGCAPTION: 'display: block;',
    FIGURE: 'display: block;',
    FOOTER: 'display: block;',
    H1: 'display: block;',
    H2: 'display: block;',
    H3: 'display: block;',
    H4: 'display: block;',
    H5: 'display: block;',
    H6: 'display: block;',
    HEAD: 'display: none;',
    HEADER: 'display: block;',
    HGROUP: 'display: block;',
    HR: 'display: block;',
    HTML: 'display: block;direction: ltr;font: 16px "Times New Roman";',
    I: '',
    IFRAME: '',
    INS: '',
    KBD: '',
    LEGEND: 'display: block;',
    LI: 'display: list-item;',
    MAIN: 'display: block;',
    MAP: '',
    MARK: '',
    MATH: '',
    MENU: 'display: block;',
    MENUITEM: '',
    METER: 'display: inline-block;',
    NAV: 'display: block;',
    NOSCRIPT: '',
    OBJECT: '',
    OL: 'display: block;',
    OPTGROUP: 'display: block;',
    OPTION: 'display: block;',
    OUTPUT: 'unicode-bidi: isolate;',
    P: 'display: block;',
    PARAM: 'display: none;',
    PICTURE: '',
    PRE: 'display: block;',
    PROGRESS: 'display: inline-block;',
    Q: '',
    RB: '',
    RP: 'display: none;',
    RT: '',
    RTC: '',
    RUBY: '',
    S: '',
    SAMP: '',
    SECTION: 'display: block;',
    SELECT: 'display: inline-block;',
    SMALL: '',
    SOURCE: '',
    SPAN: '',
    STRONG: '',
    SUB: '',
    SUMMARY: 'display: block;',
    SUP: '',
    TABLE: 'display: table;',
    TBODY: 'display: table-row-group;',
    TD: 'display: table-cell;',
    TFOOT: 'display: table-footer-group;',
    TH: 'display: table-cell;',
    THEAD: 'display: table-header-group;',
    TIME: '',
    TITLE: 'display: none;',
    TR: 'display: table-row;',
    TRACK: '',
    U: '',
    UL: 'display: block;',
    VAR: '',
    VIDEO: '',
    WBR: ''
};
 //# sourceMappingURL=CSSStyleDeclarationElementDefaultCSS.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementInheritedProperties.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = {
    'border-collapse': true,
    'border-spacing': true,
    'caption-side': true,
    color: true,
    cursor: true,
    direction: true,
    'empty-cells': true,
    'font-family': true,
    'font-size': true,
    'font-style': true,
    'font-variant': true,
    'font-weight': true,
    'font-size-adjust': true,
    'font-stretch': true,
    font: true,
    'letter-spacing': true,
    'line-height': true,
    'list-style-image': true,
    'list-style-position': true,
    'list-style-type': true,
    'list-style': true,
    orphans: true,
    quotes: true,
    'tab-size': true,
    'text-align': true,
    'text-align-last': true,
    'text-decoration-color': true,
    'text-indent': true,
    'text-justify': true,
    'text-shadow': true,
    'text-transform': true,
    visibility: true,
    'white-space': true,
    widows: true,
    'word-break': true,
    'word-spacing': true,
    'word-wrap': true
};
 //# sourceMappingURL=CSSStyleDeclarationElementInheritedProperties.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementMeasurementProperties.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = [
    'background-position-x',
    'background-position-y',
    'background-size',
    'border-image-outset',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'border-image-width',
    'clip',
    'font-size',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
    'top',
    'right',
    'bottom',
    'left',
    'outline-width',
    'outline-offset',
    'letter-spacing',
    'word-spacing',
    'text-indent',
    'line-height'
];
 //# sourceMappingURL=CSSStyleDeclarationElementMeasurementProperties.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/measurement-converter/CSSMeasurementConverter.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CSS Measurement Converter.
 */ __turbopack_context__.s([
    "default",
    ()=>CSSMeasurementConverter
]);
class CSSMeasurementConverter {
    /**
     * Returns measurement in pixels.
     *
     * @param options Options.
     * @param options.window Owner window.
     * @param options.value Measurement (e.g. "10px", "10rem" or "10em").
     * @param options.rootFontSize Root font size in pixels.
     * @param options.parentFontSize Parent font size in pixels.
     * @param [options.parentSize] Parent size in pixels.
     * @returns Measurement in pixels.
     */ static toPixels(options) {
        const value = parseFloat(options.value);
        const unit = options.value.replace(value.toString(), '');
        if (isNaN(value)) {
            return null;
        }
        switch(unit){
            case 'px':
                return value;
            case 'rem':
                return this.round(value * parseFloat(options.rootFontSize));
            case 'em':
                return this.round(value * parseFloat(options.parentFontSize));
            case 'vw':
                return this.round(value * options.window.innerWidth / 100);
            case 'vh':
                return this.round(value * options.window.innerHeight / 100);
            case '%':
                return options.parentSize !== undefined && options.parentSize !== null ? this.round(value * parseFloat(options.parentSize) / 100) : null;
            case 'vmin':
                return this.round(value * Math.min(options.window.innerWidth, options.window.innerHeight) / 100);
            case 'vmax':
                return value * Math.max(options.window.innerWidth, options.window.innerHeight) / 100;
            case 'cm':
                return this.round(value * 37.7812);
            case 'mm':
                return this.round(value * 3.7781);
            case 'in':
                return this.round(value * 96);
            case 'pt':
                return this.round(value * 1.3281);
            case 'pc':
                return this.round(value * 16);
            case 'Q':
                return this.round(value * 0.945);
            default:
                return null;
        }
    }
    /**
     * Rounds the number with 4 decimals.
     *
     * @param value Value.
     * @returns Rounded value.
     */ static round(value) {
        return Math.round(value * 10000) / 10000;
    }
} //# sourceMappingURL=CSSMeasurementConverter.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSGroupingRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSGroupingRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class CSSGroupingRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]] = [];
    /**
     * Returns CSS rules.
     *
     * @returns CSS rules.
     */ get cssRules() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]];
    }
    /**
     * Inserts a new rule.
     *
     * @param rule Rule.
     * @param [index] Index.
     * @returns The index of the new rule.
     */ insertRule(rule, index) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertRule' on '${this.constructor.name}': 1 argument required, but only 0 present.`);
        }
        const rules = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssParser"]].parseFromString(rule);
        if (rules.length === 0 || rules.length > 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'insertRule' on '${this.constructor.name}': Failed to parse the rule '${rule}'.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
        }
        if (index !== undefined) {
            index = Number(index);
            if (isNaN(index) || index > this.cssRules.length) {
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'insertRule' on '${this.constructor.name}': The index provided (${index}) is larger than the maximum index (${this.cssRules.length}).`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
            }
            this.cssRules.splice(index, 0, rules[0]);
            return index;
        }
        const newIndex = this.cssRules.length;
        this.cssRules.unshift(rules[0]);
        return newIndex;
    }
    /**
     * Removes a rule.
     *
     * @param index Index.
     */ deleteRule(index) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'deleteRule' on '${this.constructor.name}': 1 argument required, but only 0 present.`);
        }
        index = Number(index);
        if (isNaN(index) || index < 0 || index >= this.cssRules.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'deleteRule' on '${this.constructor.name}': the index (${index}) is greater than the length of the rule list.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        this.cssRules.splice(index, 1);
    }
} //# sourceMappingURL=CSSGroupingRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSScopeRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSScopeRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSGroupingRule.js [app-ssr] (ecmascript)");
;
;
;
class CSSScopeRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = '';
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule;
    }
    /**
     * @override
     */ get cssText() {
        let cssText = '';
        for (const cssRule of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]]){
            cssText += '\n  ' + cssRule.cssText;
        }
        cssText += '\n';
        return `@${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]]}scope${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]] ? ` (${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]]})` : ''}${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]] ? ` to (${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]]})` : ''} {${cssText}}`;
    }
    /**
     * Returns start.
     *
     * @returns Start.
     */ get start() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]];
    }
    /**
     * Returns end.
     *
     * @returns End.
     */ get end() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]];
    }
} //# sourceMappingURL=CSSScopeRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/CSSStyleDeclarationComputedStyle.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclarationComputedStyle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertyManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/node/NodeTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementDefaultCSS$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementDefaultCSS.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementInheritedProperties$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementInheritedProperties.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementMeasurementProperties$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/config/CSSStyleDeclarationElementMeasurementProperties.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$css$2d$parser$2f$CSSStyleDeclarationCSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/css-parser/CSSStyleDeclarationCSSParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/query-selector/QuerySelector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$measurement$2d$converter$2f$CSSMeasurementConverter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/measurement-converter/CSSMeasurementConverter.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$match$2d$media$2f$MediaQueryList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/match-media/MediaQueryList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSScopeRule.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
const CSS_MEASUREMENT_REGEXP = /[0-9.]+(px|rem|em|vw|vh|%|vmin|vmax|cm|mm|in|pt|pc|Q)/g;
const HOST_REGEXP = /:host\s*\(([^)]+)\)|:host-context\s*\(([^)]+)\)/;
const SINGLE_CSS_VARIABLE_REGEXP = /var\( *(--[^), ]+)\)/;
const CSS_VARIABLE_REGEXP = /var\( *(--[^), ]+), *([^), ]+)\)/;
class CSSStyleDeclarationComputedStyle {
    element;
    /**
     * Constructor.
     *
     * @param element Element.
     * @param [computed] Computed.
     */ constructor(element){
        this.element = element;
    }
    /**
     * Returns style sheets.
     *
     * @param element Element.
     * @returns Style sheets.
     */ getComputedStyle() {
        const documentElements = [];
        const parentElements = [];
        let styleAndElement = {
            element: this.element,
            cssTexts: []
        };
        let shadowRootElements = [];
        let customElements = [];
        if (!this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isConnected"]]) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        }
        const cacheResult = this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].computedStyle;
        if (cacheResult?.result) {
            const result = cacheResult.result.deref();
            if (result) {
                return result;
            }
        }
        // Walks through all parent elements and stores them in an array with element and matching CSS text.
        while(styleAndElement.element){
            if (styleAndElement.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].elementNode) {
                const rootNode = styleAndElement.element.getRootNode();
                if (rootNode[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].documentNode) {
                    documentElements.unshift(styleAndElement);
                } else {
                    shadowRootElements.unshift(styleAndElement);
                }
                if (styleAndElement.element.shadowRoot) {
                    customElements.push(styleAndElement);
                }
                parentElements.unshift(styleAndElement);
            }
            if (styleAndElement.element === this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]]) {
                const styleSheets = this.getStyleSheets(this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]]);
                for (const styleSheet of styleSheets){
                    this.parseCSSRules({
                        elements: documentElements,
                        cssRules: styleSheet.cssRules
                    });
                }
                // We need to parse ":host" and ":host-context" rules for custom elements.
                for (const customElement of customElements){
                    const styleSheets = this.getStyleSheets(customElement.element.shadowRoot);
                    for (const styleSheet of styleSheets){
                        this.parseCSSRules({
                            elements: [],
                            cssRules: styleSheet.cssRules,
                            hostElement: customElement
                        });
                    }
                }
                styleAndElement = {
                    element: null,
                    cssTexts: []
                };
            } else if (styleAndElement.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].documentFragmentNode && styleAndElement.element.host) {
                const shadowRoot = styleAndElement.element;
                const styleSheets = this.getStyleSheets(shadowRoot);
                styleAndElement = {
                    element: shadowRoot.host,
                    cssTexts: []
                };
                for (const styleSheet of styleSheets){
                    this.parseCSSRules({
                        elements: shadowRootElements,
                        cssRules: styleSheet.cssRules,
                        hostElement: styleAndElement
                    });
                }
                // We need to parse ":host" and ":host-context" rules for custom elements.
                for (const customElement of customElements){
                    const styleSheets = this.getStyleSheets(customElement.element.shadowRoot);
                    for (const styleSheet of styleSheets){
                        this.parseCSSRules({
                            elements: [],
                            cssRules: styleSheet.cssRules,
                            hostElement: customElement
                        });
                    }
                }
                customElements = [];
                shadowRootElements = [];
            } else {
                styleAndElement = {
                    element: styleAndElement.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]],
                    cssTexts: []
                };
            }
        }
        // Concatenates all parent element CSS to one string.
        const targetElement = parentElements[parentElements.length - 1];
        const propertyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        const cssProperties = {};
        let rootFontSize = 16;
        let parentFontSize = 16;
        for (const parentElement of parentElements){
            parentElement.cssTexts.sort((a, b)=>a.priorityWeight - b.priorityWeight);
            const defaultCSS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementDefaultCSS$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][parentElement.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]]];
            let elementCSSText = '';
            if (defaultCSS) {
                if (typeof defaultCSS === 'string') {
                    elementCSSText += defaultCSS;
                } else {
                    for (const key of Object.keys(defaultCSS)){
                        if (key === 'default' || !!parentElement.element[key]) {
                            elementCSSText += defaultCSS[key];
                        }
                    }
                }
            }
            for (const cssText of parentElement.cssTexts){
                elementCSSText += cssText.cssText;
            }
            const elementStyleAttribute = parentElement.element.getAttribute('style');
            if (elementStyleAttribute) {
                elementCSSText += elementStyleAttribute;
            }
            const rulesAndProperties = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$css$2d$parser$2f$CSSStyleDeclarationCSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(elementCSSText);
            const rules = rulesAndProperties.rules;
            Object.assign(cssProperties, rulesAndProperties.properties);
            for (const { name, value, important } of rules){
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementInheritedProperties$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][name] || parentElement === targetElement) {
                    const parsedValue = this.parseCSSVariablesInValue(value.trim(), cssProperties);
                    if (parsedValue && (!propertyManager.get(name)?.important || important)) {
                        propertyManager.set(name, parsedValue, important);
                        if (name === 'font' || name === 'font-size') {
                            const fontSize = propertyManager.properties['font-size'];
                            if (fontSize !== null) {
                                const parsedValue = this.parseMeasurementsInValue({
                                    value: fontSize.value,
                                    rootFontSize,
                                    parentFontSize,
                                    parentSize: parentFontSize
                                });
                                if (parentElement.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]] === 'HTML') {
                                    rootFontSize = parsedValue;
                                } else if (parentElement !== targetElement) {
                                    parentFontSize = parsedValue;
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const name of __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$config$2f$CSSStyleDeclarationElementMeasurementProperties$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]){
            const property = propertyManager.properties[name];
            if (property) {
                property.value = this.parseMeasurementsInValue({
                    value: property.value,
                    rootFontSize,
                    parentFontSize,
                    // TODO: Only "font-size" is supported when using percentage values. Add support for other properties.
                    parentSize: name === 'font-size' ? parentFontSize : null
                });
            }
        }
        const cachedResult = {
            result: new WeakRef(propertyManager)
        };
        this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].computedStyle = cachedResult;
        this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["affectsComputedStyleCache"]].push(cachedResult);
        return propertyManager;
    }
    /**
     * Returns style sheets.
     *
     * @param root Root element.
     * @returns Style sheets.
     */ getStyleSheets(root) {
        if (!root) {
            return [];
        }
        const styleElements = root.querySelectorAll('style,link[rel="stylesheet"]');
        let styleSheets = [];
        for (const styleElement of styleElements){
            const sheet = styleElement.sheet;
            if (sheet) {
                styleSheets.push(sheet);
            }
        }
        if (root.adoptedStyleSheets) {
            styleSheets = styleSheets.concat(root.adoptedStyleSheets);
        }
        return styleSheets;
    }
    /**
     * Applies CSS text to elements.
     *
     * @param options Options.
     * @param options.elements Elements.
     * @param options.cssRules CSS rules.
     * @param [options.hostElement] Host element.
     * @param [options.scopeElement] Scope element.
     */ parseCSSRules(options) {
        if (!options.hostElement && !options.elements.length) {
            return;
        }
        const window = this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        for (const rule of options.cssRules){
            if (rule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].styleRule) {
                const selectorText = rule.selectorText;
                if (selectorText) {
                    if (selectorText[0] === ':' && selectorText.startsWith(':host')) {
                        if (options.hostElement) {
                            let isTargetHost = true;
                            if (selectorText !== ':host') {
                                const selectorMatch = selectorText.match(HOST_REGEXP);
                                if (selectorMatch) {
                                    const match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(options.hostElement.element, selectorMatch[1] || selectorMatch[2], {
                                        ignoreErrors: true,
                                        scope: options.scopeElement?.element
                                    });
                                    if (match) {
                                        const hostContextSelectorText = selectorText?.replace(HOST_REGEXP, '').trim();
                                        if (hostContextSelectorText && hostContextSelectorText[0] !== ':') {
                                            isTargetHost = false;
                                            for (const element of options.elements){
                                                const match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(element.element, hostContextSelectorText, {
                                                    ignoreErrors: true,
                                                    scope: options.scopeElement?.element
                                                });
                                                if (match) {
                                                    element.cssTexts.push({
                                                        cssText: rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]],
                                                        priorityWeight: 10 + match.priorityWeight
                                                    });
                                                }
                                            }
                                        }
                                    } else {
                                        isTargetHost = false;
                                    }
                                }
                            }
                            if (isTargetHost) {
                                options.hostElement.cssTexts.push({
                                    cssText: rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]],
                                    priorityWeight: 10
                                });
                            }
                        }
                    } else {
                        for (const element of options.elements){
                            const match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(element.element, selectorText, {
                                ignoreErrors: true,
                                scope: options.scopeElement?.element
                            });
                            if (match) {
                                element.cssTexts.push({
                                    cssText: rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]],
                                    priorityWeight: match.priorityWeight
                                });
                            }
                        }
                    }
                }
            } else if (rule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule && // TODO: We need to send in a predefined root font size as it will otherwise be calculated using Window.getComputedStyle(), which will cause a never ending loop. Is there another solution?
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$match$2d$media$2f$MediaQueryList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                window,
                media: rule.conditionText,
                rootFontSize: this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]] === 'HTML' ? 16 : null
            }).matches) {
                this.parseCSSRules({
                    elements: options.elements,
                    cssRules: rule.cssRules,
                    hostElement: options.hostElement,
                    scopeElement: options.scopeElement
                });
            } else if (rule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                if (window.CSS.supports(rule.conditionText)) {
                    this.parseCSSRules({
                        elements: options.elements,
                        cssRules: rule.cssRules,
                        hostElement: options.hostElement,
                        scopeElement: options.scopeElement
                    });
                }
            } else if (rule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule) {
                if (rule instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                    const scopedElements = [];
                    let scope = null;
                    for (const element of options.elements){
                        if (scope) {
                            if (rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]]) {
                                const match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(element.element, rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]], {
                                    ignoreErrors: true,
                                    scope: scope.element
                                });
                                if (match) {
                                    break;
                                }
                            }
                            scopedElements.push(element);
                        } else {
                            const match = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(element.element, rule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]] || ':root', {
                                ignoreErrors: true
                            });
                            if (match) {
                                scope = element;
                                scopedElements.push(element);
                            }
                        }
                    }
                    if (scopedElements.length) {
                        this.parseCSSRules({
                            elements: scopedElements,
                            cssRules: rule.cssRules,
                            hostElement: options.hostElement,
                            scopeElement: scope
                        });
                    }
                }
            // TODO: Add support for CSSContainerRule, which would require element sizes to be measured.
            }
        }
    }
    /**
     * Parses CSS variables in a value.
     *
     * @param value Value.
     * @param cssVariables CSS variables.
     * @returns CSS value.
     */ parseCSSVariablesInValue(value, cssVariables) {
        let newValue = value;
        let match;
        while((match = newValue.match(SINGLE_CSS_VARIABLE_REGEXP)) != null){
            // Without fallback value - E.g. var(--my-var)
            newValue = newValue.replace(match[0], cssVariables[match[1]] || '');
        }
        while((match = newValue.match(CSS_VARIABLE_REGEXP)) !== null){
            // Fallback value - E.g. var(--my-var, #FFFFFF)
            newValue = newValue.replace(match[0], cssVariables[match[1]] || match[2]);
        }
        return newValue;
    }
    /**
     * Parses measurements in a value.
     *
     * @param options Options.
     * @param options.value Value.
     * @param options.rootFontSize Root font size.
     * @param options.parentFontSize Parent font size.
     * @param [options.parentSize] Parent width.
     * @returns CSS value.
     */ parseMeasurementsInValue(options) {
        if (new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]).getSettings()?.disableComputedStyleRendering) {
            return options.value;
        }
        const regexp = new RegExp(CSS_MEASUREMENT_REGEXP);
        let newValue = options.value;
        let match;
        while((match = regexp.exec(options.value)) !== null){
            if (match[1] !== 'px') {
                const valueInPixels = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$measurement$2d$converter$2f$CSSMeasurementConverter$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].toPixels({
                    window: this.element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]],
                    value: match[0],
                    rootFontSize: options.rootFontSize,
                    parentFontSize: options.parentFontSize,
                    parentSize: options.parentSize
                });
                if (valueInPixels !== null) {
                    newValue = newValue.replace(match[0], valueInPixels + 'px');
                }
            }
        }
        return newValue;
    }
} //# sourceMappingURL=CSSStyleDeclarationComputedStyle.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/CSSStyleDeclaration.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleDeclaration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/property-manager/CSSStyleDeclarationPropertyManager.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$CSSStyleDeclarationComputedStyle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/computed-style/CSSStyleDeclarationComputedStyle.js [app-ssr] (ecmascript)");
;
;
;
;
class CSSStyleDeclaration {
    // Public properties
    parentRule = null;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    // Private properties
    #element;
    #computed;
    #cache = {
        attributeValue: null,
        propertyManager: null
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.element] Element.
     * @param [options.computed] Computed.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this.#element = options?.element || null;
        this.#computed = options?.element ? !!options?.computed : false;
    }
    /**
     * Index properties
     */ /* eslint-disable jsdoc/require-jsdoc */ get 0() {
        return this.item(0) || undefined;
    }
    get 1() {
        return this.item(1) || undefined;
    }
    get 2() {
        return this.item(2) || undefined;
    }
    get 3() {
        return this.item(3) || undefined;
    }
    get 4() {
        return this.item(4) || undefined;
    }
    get 5() {
        return this.item(5) || undefined;
    }
    get 6() {
        return this.item(6) || undefined;
    }
    get 7() {
        return this.item(7) || undefined;
    }
    get 8() {
        return this.item(8) || undefined;
    }
    get 9() {
        return this.item(9) || undefined;
    }
    get 10() {
        return this.item(10) || undefined;
    }
    get 11() {
        return this.item(11) || undefined;
    }
    get 12() {
        return this.item(12) || undefined;
    }
    get 13() {
        return this.item(13) || undefined;
    }
    get 14() {
        return this.item(14) || undefined;
    }
    get 15() {
        return this.item(15) || undefined;
    }
    get 16() {
        return this.item(16) || undefined;
    }
    get 17() {
        return this.item(17) || undefined;
    }
    get 18() {
        return this.item(18) || undefined;
    }
    get 19() {
        return this.item(19) || undefined;
    }
    get 20() {
        return this.item(20) || undefined;
    }
    get 21() {
        return this.item(21) || undefined;
    }
    get 22() {
        return this.item(22) || undefined;
    }
    get 23() {
        return this.item(23) || undefined;
    }
    get 24() {
        return this.item(24) || undefined;
    }
    get 25() {
        return this.item(25) || undefined;
    }
    get 26() {
        return this.item(26) || undefined;
    }
    get 27() {
        return this.item(27) || undefined;
    }
    get 28() {
        return this.item(28) || undefined;
    }
    get 29() {
        return this.item(29) || undefined;
    }
    get 30() {
        return this.item(30) || undefined;
    }
    get 31() {
        return this.item(31) || undefined;
    }
    get 32() {
        return this.item(32) || undefined;
    }
    get 33() {
        return this.item(33) || undefined;
    }
    get 34() {
        return this.item(34) || undefined;
    }
    get 35() {
        return this.item(35) || undefined;
    }
    get 36() {
        return this.item(36) || undefined;
    }
    get 37() {
        return this.item(37) || undefined;
    }
    get 38() {
        return this.item(38) || undefined;
    }
    get 39() {
        return this.item(39) || undefined;
    }
    get 40() {
        return this.item(40) || undefined;
    }
    get 41() {
        return this.item(41) || undefined;
    }
    get 42() {
        return this.item(42) || undefined;
    }
    get 43() {
        return this.item(43) || undefined;
    }
    get 44() {
        return this.item(44) || undefined;
    }
    get 45() {
        return this.item(45) || undefined;
    }
    get 46() {
        return this.item(46) || undefined;
    }
    get 47() {
        return this.item(47) || undefined;
    }
    get 48() {
        return this.item(48) || undefined;
    }
    get 49() {
        return this.item(49) || undefined;
    }
    get 50() {
        return this.item(50) || undefined;
    }
    get 51() {
        return this.item(51) || undefined;
    }
    get 52() {
        return this.item(52) || undefined;
    }
    get 53() {
        return this.item(53) || undefined;
    }
    get 54() {
        return this.item(54) || undefined;
    }
    get 55() {
        return this.item(55) || undefined;
    }
    get 56() {
        return this.item(56) || undefined;
    }
    get 57() {
        return this.item(57) || undefined;
    }
    get 58() {
        return this.item(58) || undefined;
    }
    get 59() {
        return this.item(59) || undefined;
    }
    get 60() {
        return this.item(60) || undefined;
    }
    get 61() {
        return this.item(61) || undefined;
    }
    get 62() {
        return this.item(62) || undefined;
    }
    get 63() {
        return this.item(63) || undefined;
    }
    get 64() {
        return this.item(64) || undefined;
    }
    get 65() {
        return this.item(65) || undefined;
    }
    get 66() {
        return this.item(66) || undefined;
    }
    get 67() {
        return this.item(67) || undefined;
    }
    get 68() {
        return this.item(68) || undefined;
    }
    get 69() {
        return this.item(69) || undefined;
    }
    get 70() {
        return this.item(70) || undefined;
    }
    get 71() {
        return this.item(71) || undefined;
    }
    get 72() {
        return this.item(72) || undefined;
    }
    get 73() {
        return this.item(73) || undefined;
    }
    get 74() {
        return this.item(74) || undefined;
    }
    get 75() {
        return this.item(75) || undefined;
    }
    get 76() {
        return this.item(76) || undefined;
    }
    get 77() {
        return this.item(77) || undefined;
    }
    get 78() {
        return this.item(78) || undefined;
    }
    get 79() {
        return this.item(79) || undefined;
    }
    get 80() {
        return this.item(80) || undefined;
    }
    get 81() {
        return this.item(81) || undefined;
    }
    get 82() {
        return this.item(82) || undefined;
    }
    get 83() {
        return this.item(83) || undefined;
    }
    get 84() {
        return this.item(84) || undefined;
    }
    get 85() {
        return this.item(85) || undefined;
    }
    get 86() {
        return this.item(86) || undefined;
    }
    get 87() {
        return this.item(87) || undefined;
    }
    get 88() {
        return this.item(88) || undefined;
    }
    get 89() {
        return this.item(89) || undefined;
    }
    get 90() {
        return this.item(90) || undefined;
    }
    get 91() {
        return this.item(91) || undefined;
    }
    get 92() {
        return this.item(92) || undefined;
    }
    get 93() {
        return this.item(93) || undefined;
    }
    get 94() {
        return this.item(94) || undefined;
    }
    get 95() {
        return this.item(95) || undefined;
    }
    get 96() {
        return this.item(96) || undefined;
    }
    get 97() {
        return this.item(97) || undefined;
    }
    get 98() {
        return this.item(98) || undefined;
    }
    get 99() {
        return this.item(99) || undefined;
    }
    get 100() {
        return this.item(100) || undefined;
    }
    get 101() {
        return this.item(101) || undefined;
    }
    get 102() {
        return this.item(102) || undefined;
    }
    get 103() {
        return this.item(103) || undefined;
    }
    get 104() {
        return this.item(104) || undefined;
    }
    get 105() {
        return this.item(105) || undefined;
    }
    get 106() {
        return this.item(106) || undefined;
    }
    get 107() {
        return this.item(107) || undefined;
    }
    get 108() {
        return this.item(108) || undefined;
    }
    get 109() {
        return this.item(109) || undefined;
    }
    get 110() {
        return this.item(110) || undefined;
    }
    get 111() {
        return this.item(111) || undefined;
    }
    get 112() {
        return this.item(112) || undefined;
    }
    get 113() {
        return this.item(113) || undefined;
    }
    get 114() {
        return this.item(114) || undefined;
    }
    get 115() {
        return this.item(115) || undefined;
    }
    get 116() {
        return this.item(116) || undefined;
    }
    get 117() {
        return this.item(117) || undefined;
    }
    get 118() {
        return this.item(118) || undefined;
    }
    get 119() {
        return this.item(119) || undefined;
    }
    get 120() {
        return this.item(120) || undefined;
    }
    get 121() {
        return this.item(121) || undefined;
    }
    get 122() {
        return this.item(122) || undefined;
    }
    get 123() {
        return this.item(123) || undefined;
    }
    get 124() {
        return this.item(124) || undefined;
    }
    get 125() {
        return this.item(125) || undefined;
    }
    get 126() {
        return this.item(126) || undefined;
    }
    get 127() {
        return this.item(127) || undefined;
    }
    get 128() {
        return this.item(128) || undefined;
    }
    get 129() {
        return this.item(129) || undefined;
    }
    get 130() {
        return this.item(130) || undefined;
    }
    get 131() {
        return this.item(131) || undefined;
    }
    get 132() {
        return this.item(132) || undefined;
    }
    get 133() {
        return this.item(133) || undefined;
    }
    get 134() {
        return this.item(134) || undefined;
    }
    get 135() {
        return this.item(135) || undefined;
    }
    get 136() {
        return this.item(136) || undefined;
    }
    get 137() {
        return this.item(137) || undefined;
    }
    get 138() {
        return this.item(138) || undefined;
    }
    get 139() {
        return this.item(139) || undefined;
    }
    get 140() {
        return this.item(140) || undefined;
    }
    get 141() {
        return this.item(141) || undefined;
    }
    get 142() {
        return this.item(142) || undefined;
    }
    get 143() {
        return this.item(143) || undefined;
    }
    get 144() {
        return this.item(144) || undefined;
    }
    get 145() {
        return this.item(145) || undefined;
    }
    get 146() {
        return this.item(146) || undefined;
    }
    get 147() {
        return this.item(147) || undefined;
    }
    get 148() {
        return this.item(148) || undefined;
    }
    get 149() {
        return this.item(149) || undefined;
    }
    get 150() {
        return this.item(150) || undefined;
    }
    get 151() {
        return this.item(151) || undefined;
    }
    get 152() {
        return this.item(152) || undefined;
    }
    get 153() {
        return this.item(153) || undefined;
    }
    get 154() {
        return this.item(154) || undefined;
    }
    get 155() {
        return this.item(155) || undefined;
    }
    get 156() {
        return this.item(156) || undefined;
    }
    get 157() {
        return this.item(157) || undefined;
    }
    get 158() {
        return this.item(158) || undefined;
    }
    get 159() {
        return this.item(159) || undefined;
    }
    get 160() {
        return this.item(160) || undefined;
    }
    get 161() {
        return this.item(161) || undefined;
    }
    get 162() {
        return this.item(162) || undefined;
    }
    get 163() {
        return this.item(163) || undefined;
    }
    get 164() {
        return this.item(164) || undefined;
    }
    get 165() {
        return this.item(165) || undefined;
    }
    get 166() {
        return this.item(166) || undefined;
    }
    get 167() {
        return this.item(167) || undefined;
    }
    get 168() {
        return this.item(168) || undefined;
    }
    get 169() {
        return this.item(169) || undefined;
    }
    get 170() {
        return this.item(170) || undefined;
    }
    get 171() {
        return this.item(171) || undefined;
    }
    get 172() {
        return this.item(172) || undefined;
    }
    get 173() {
        return this.item(173) || undefined;
    }
    get 174() {
        return this.item(174) || undefined;
    }
    get 175() {
        return this.item(175) || undefined;
    }
    get 176() {
        return this.item(176) || undefined;
    }
    get 177() {
        return this.item(177) || undefined;
    }
    get 178() {
        return this.item(178) || undefined;
    }
    get 179() {
        return this.item(179) || undefined;
    }
    get 180() {
        return this.item(180) || undefined;
    }
    get 181() {
        return this.item(181) || undefined;
    }
    get 182() {
        return this.item(182) || undefined;
    }
    get 183() {
        return this.item(183) || undefined;
    }
    get 184() {
        return this.item(184) || undefined;
    }
    get 185() {
        return this.item(185) || undefined;
    }
    get 186() {
        return this.item(186) || undefined;
    }
    get 187() {
        return this.item(187) || undefined;
    }
    get 188() {
        return this.item(188) || undefined;
    }
    get 189() {
        return this.item(189) || undefined;
    }
    get 190() {
        return this.item(190) || undefined;
    }
    get 191() {
        return this.item(191) || undefined;
    }
    get 192() {
        return this.item(192) || undefined;
    }
    get 193() {
        return this.item(193) || undefined;
    }
    get 194() {
        return this.item(194) || undefined;
    }
    get 195() {
        return this.item(195) || undefined;
    }
    get 196() {
        return this.item(196) || undefined;
    }
    get 197() {
        return this.item(197) || undefined;
    }
    get 198() {
        return this.item(198) || undefined;
    }
    get 199() {
        return this.item(199) || undefined;
    }
    get 200() {
        return this.item(200) || undefined;
    }
    get 201() {
        return this.item(201) || undefined;
    }
    get 202() {
        return this.item(202) || undefined;
    }
    get 203() {
        return this.item(203) || undefined;
    }
    get 204() {
        return this.item(204) || undefined;
    }
    get 205() {
        return this.item(205) || undefined;
    }
    get 206() {
        return this.item(206) || undefined;
    }
    get 207() {
        return this.item(207) || undefined;
    }
    get 208() {
        return this.item(208) || undefined;
    }
    get 209() {
        return this.item(209) || undefined;
    }
    get 210() {
        return this.item(210) || undefined;
    }
    get 211() {
        return this.item(211) || undefined;
    }
    get 212() {
        return this.item(212) || undefined;
    }
    get 213() {
        return this.item(213) || undefined;
    }
    get 214() {
        return this.item(214) || undefined;
    }
    get 215() {
        return this.item(215) || undefined;
    }
    get 216() {
        return this.item(216) || undefined;
    }
    get 217() {
        return this.item(217) || undefined;
    }
    get 218() {
        return this.item(218) || undefined;
    }
    get 219() {
        return this.item(219) || undefined;
    }
    get 220() {
        return this.item(220) || undefined;
    }
    get 221() {
        return this.item(221) || undefined;
    }
    get 222() {
        return this.item(222) || undefined;
    }
    get 223() {
        return this.item(223) || undefined;
    }
    get 224() {
        return this.item(224) || undefined;
    }
    get 225() {
        return this.item(225) || undefined;
    }
    get 226() {
        return this.item(226) || undefined;
    }
    get 227() {
        return this.item(227) || undefined;
    }
    get 228() {
        return this.item(228) || undefined;
    }
    get 229() {
        return this.item(229) || undefined;
    }
    get 230() {
        return this.item(230) || undefined;
    }
    get 231() {
        return this.item(231) || undefined;
    }
    get 232() {
        return this.item(232) || undefined;
    }
    get 233() {
        return this.item(233) || undefined;
    }
    get 234() {
        return this.item(234) || undefined;
    }
    get 235() {
        return this.item(235) || undefined;
    }
    get 236() {
        return this.item(236) || undefined;
    }
    get 237() {
        return this.item(237) || undefined;
    }
    get 238() {
        return this.item(238) || undefined;
    }
    get 239() {
        return this.item(239) || undefined;
    }
    get 240() {
        return this.item(240) || undefined;
    }
    get 241() {
        return this.item(241) || undefined;
    }
    get 242() {
        return this.item(242) || undefined;
    }
    get 243() {
        return this.item(243) || undefined;
    }
    get 244() {
        return this.item(244) || undefined;
    }
    get 245() {
        return this.item(245) || undefined;
    }
    get 246() {
        return this.item(246) || undefined;
    }
    get 247() {
        return this.item(247) || undefined;
    }
    get 248() {
        return this.item(248) || undefined;
    }
    get 249() {
        return this.item(249) || undefined;
    }
    get 250() {
        return this.item(250) || undefined;
    }
    get 251() {
        return this.item(251) || undefined;
    }
    get 252() {
        return this.item(252) || undefined;
    }
    get 253() {
        return this.item(253) || undefined;
    }
    get 254() {
        return this.item(254) || undefined;
    }
    get 255() {
        return this.item(255) || undefined;
    }
    get 256() {
        return this.item(256) || undefined;
    }
    get 257() {
        return this.item(257) || undefined;
    }
    get 258() {
        return this.item(258) || undefined;
    }
    get 259() {
        return this.item(259) || undefined;
    }
    get 260() {
        return this.item(260) || undefined;
    }
    get 261() {
        return this.item(261) || undefined;
    }
    get 262() {
        return this.item(262) || undefined;
    }
    get 263() {
        return this.item(263) || undefined;
    }
    get 264() {
        return this.item(264) || undefined;
    }
    get 265() {
        return this.item(265) || undefined;
    }
    get 266() {
        return this.item(266) || undefined;
    }
    get 267() {
        return this.item(267) || undefined;
    }
    get 268() {
        return this.item(268) || undefined;
    }
    get 269() {
        return this.item(269) || undefined;
    }
    get 270() {
        return this.item(270) || undefined;
    }
    get 271() {
        return this.item(271) || undefined;
    }
    get 272() {
        return this.item(272) || undefined;
    }
    get 273() {
        return this.item(273) || undefined;
    }
    get 274() {
        return this.item(274) || undefined;
    }
    get 275() {
        return this.item(275) || undefined;
    }
    get 276() {
        return this.item(276) || undefined;
    }
    get 277() {
        return this.item(277) || undefined;
    }
    get 278() {
        return this.item(278) || undefined;
    }
    get 279() {
        return this.item(279) || undefined;
    }
    get 280() {
        return this.item(280) || undefined;
    }
    get 281() {
        return this.item(281) || undefined;
    }
    get 282() {
        return this.item(282) || undefined;
    }
    get 283() {
        return this.item(283) || undefined;
    }
    get 284() {
        return this.item(284) || undefined;
    }
    get 285() {
        return this.item(285) || undefined;
    }
    get 286() {
        return this.item(286) || undefined;
    }
    get 287() {
        return this.item(287) || undefined;
    }
    get 288() {
        return this.item(288) || undefined;
    }
    get 289() {
        return this.item(289) || undefined;
    }
    get 290() {
        return this.item(290) || undefined;
    }
    get 291() {
        return this.item(291) || undefined;
    }
    get 292() {
        return this.item(292) || undefined;
    }
    get 293() {
        return this.item(293) || undefined;
    }
    get 294() {
        return this.item(294) || undefined;
    }
    get 295() {
        return this.item(295) || undefined;
    }
    get 296() {
        return this.item(296) || undefined;
    }
    get 297() {
        return this.item(297) || undefined;
    }
    get 298() {
        return this.item(298) || undefined;
    }
    get 299() {
        return this.item(299) || undefined;
    }
    get 300() {
        return this.item(300) || undefined;
    }
    get 301() {
        return this.item(301) || undefined;
    }
    get 302() {
        return this.item(302) || undefined;
    }
    get 303() {
        return this.item(303) || undefined;
    }
    get 304() {
        return this.item(304) || undefined;
    }
    get 305() {
        return this.item(305) || undefined;
    }
    get 306() {
        return this.item(306) || undefined;
    }
    get 307() {
        return this.item(307) || undefined;
    }
    get 308() {
        return this.item(308) || undefined;
    }
    get 309() {
        return this.item(309) || undefined;
    }
    get 310() {
        return this.item(310) || undefined;
    }
    get 311() {
        return this.item(311) || undefined;
    }
    get 312() {
        return this.item(312) || undefined;
    }
    get 313() {
        return this.item(313) || undefined;
    }
    get 314() {
        return this.item(314) || undefined;
    }
    get 315() {
        return this.item(315) || undefined;
    }
    get 316() {
        return this.item(316) || undefined;
    }
    get 317() {
        return this.item(317) || undefined;
    }
    get 318() {
        return this.item(318) || undefined;
    }
    get 319() {
        return this.item(319) || undefined;
    }
    get 320() {
        return this.item(320) || undefined;
    }
    get 321() {
        return this.item(321) || undefined;
    }
    get 322() {
        return this.item(322) || undefined;
    }
    get 323() {
        return this.item(323) || undefined;
    }
    get 324() {
        return this.item(324) || undefined;
    }
    get 325() {
        return this.item(325) || undefined;
    }
    get 326() {
        return this.item(326) || undefined;
    }
    get 327() {
        return this.item(327) || undefined;
    }
    get 328() {
        return this.item(328) || undefined;
    }
    get 329() {
        return this.item(329) || undefined;
    }
    get 330() {
        return this.item(330) || undefined;
    }
    get 331() {
        return this.item(331) || undefined;
    }
    get 332() {
        return this.item(332) || undefined;
    }
    get 333() {
        return this.item(333) || undefined;
    }
    get 334() {
        return this.item(334) || undefined;
    }
    get 335() {
        return this.item(335) || undefined;
    }
    get 336() {
        return this.item(336) || undefined;
    }
    get 337() {
        return this.item(337) || undefined;
    }
    get 338() {
        return this.item(338) || undefined;
    }
    get 339() {
        return this.item(339) || undefined;
    }
    get 340() {
        return this.item(340) || undefined;
    }
    get 341() {
        return this.item(341) || undefined;
    }
    get 342() {
        return this.item(342) || undefined;
    }
    get 343() {
        return this.item(343) || undefined;
    }
    get 344() {
        return this.item(344) || undefined;
    }
    get 345() {
        return this.item(345) || undefined;
    }
    get 346() {
        return this.item(346) || undefined;
    }
    get 347() {
        return this.item(347) || undefined;
    }
    get 348() {
        return this.item(348) || undefined;
    }
    get 349() {
        return this.item(349) || undefined;
    }
    get 350() {
        return this.item(350) || undefined;
    }
    get 351() {
        return this.item(351) || undefined;
    }
    get 352() {
        return this.item(352) || undefined;
    }
    get 353() {
        return this.item(353) || undefined;
    }
    get 354() {
        return this.item(354) || undefined;
    }
    get 355() {
        return this.item(355) || undefined;
    }
    get 356() {
        return this.item(356) || undefined;
    }
    get 357() {
        return this.item(357) || undefined;
    }
    get 358() {
        return this.item(358) || undefined;
    }
    get 359() {
        return this.item(359) || undefined;
    }
    get 360() {
        return this.item(360) || undefined;
    }
    get 361() {
        return this.item(361) || undefined;
    }
    get 362() {
        return this.item(362) || undefined;
    }
    get 363() {
        return this.item(363) || undefined;
    }
    get 364() {
        return this.item(364) || undefined;
    }
    get 365() {
        return this.item(365) || undefined;
    }
    get 366() {
        return this.item(366) || undefined;
    }
    get 367() {
        return this.item(367) || undefined;
    }
    get 368() {
        return this.item(368) || undefined;
    }
    get 369() {
        return this.item(369) || undefined;
    }
    get 370() {
        return this.item(370) || undefined;
    }
    get 371() {
        return this.item(371) || undefined;
    }
    get 372() {
        return this.item(372) || undefined;
    }
    get 373() {
        return this.item(373) || undefined;
    }
    get 374() {
        return this.item(374) || undefined;
    }
    get 375() {
        return this.item(375) || undefined;
    }
    get 376() {
        return this.item(376) || undefined;
    }
    get 377() {
        return this.item(377) || undefined;
    }
    get 378() {
        return this.item(378) || undefined;
    }
    get 379() {
        return this.item(379) || undefined;
    }
    get 380() {
        return this.item(380) || undefined;
    }
    get 381() {
        return this.item(381) || undefined;
    }
    get 382() {
        return this.item(382) || undefined;
    }
    get 383() {
        return this.item(383) || undefined;
    }
    get 384() {
        return this.item(384) || undefined;
    }
    get 385() {
        return this.item(385) || undefined;
    }
    get 386() {
        return this.item(386) || undefined;
    }
    get 387() {
        return this.item(387) || undefined;
    }
    get 388() {
        return this.item(388) || undefined;
    }
    get 389() {
        return this.item(389) || undefined;
    }
    get 390() {
        return this.item(390) || undefined;
    }
    get 391() {
        return this.item(391) || undefined;
    }
    get 392() {
        return this.item(392) || undefined;
    }
    get 393() {
        return this.item(393) || undefined;
    }
    /**
     * CSS properties
     */ get accentColor() {
        return this.getPropertyValue('accent-color');
    }
    set accentColor(value) {
        this.setProperty('accent-color', value);
    }
    get appRegion() {
        return this.getPropertyValue('app-region');
    }
    set appRegion(value) {
        this.setProperty('app-region', value);
    }
    get alignContent() {
        return this.getPropertyValue('align-content');
    }
    set alignContent(value) {
        this.setProperty('align-content', value);
    }
    get alignItems() {
        return this.getPropertyValue('align-items');
    }
    set alignItems(value) {
        this.setProperty('align-items', value);
    }
    get alignSelf() {
        return this.getPropertyValue('align-self');
    }
    set alignSelf(value) {
        this.setProperty('align-self', value);
    }
    get alignmentBaseline() {
        return this.getPropertyValue('alignment-baseline');
    }
    set alignmentBaseline(value) {
        this.setProperty('alignment-baseline', value);
    }
    get all() {
        return this.getPropertyValue('all');
    }
    set all(value) {
        this.setProperty('all', value);
    }
    get animation() {
        return this.getPropertyValue('animation');
    }
    set animation(value) {
        this.setProperty('animation', value);
    }
    get animationDelay() {
        return this.getPropertyValue('animation-delay');
    }
    set animationDelay(value) {
        this.setProperty('animation-delay', value);
    }
    get animationDirection() {
        return this.getPropertyValue('animation-direction');
    }
    set animationDirection(value) {
        this.setProperty('animation-direction', value);
    }
    get animationDuration() {
        return this.getPropertyValue('animation-duration');
    }
    set animationDuration(value) {
        this.setProperty('animation-duration', value);
    }
    get animationFillMode() {
        return this.getPropertyValue('animation-fill-mode');
    }
    set animationFillMode(value) {
        this.setProperty('animation-fill-mode', value);
    }
    get animationIterationCount() {
        return this.getPropertyValue('animation-iteration-count');
    }
    set animationIterationCount(value) {
        this.setProperty('animation-iteration-count', value);
    }
    get animationName() {
        return this.getPropertyValue('animation-name');
    }
    set animationName(value) {
        this.setProperty('animation-name', value);
    }
    get animationPlayState() {
        return this.getPropertyValue('animation-play-state');
    }
    set animationPlayState(value) {
        this.setProperty('animation-play-state', value);
    }
    get animationTimingFunction() {
        return this.getPropertyValue('animation-timing-function');
    }
    set animationTimingFunction(value) {
        this.setProperty('animation-timing-function', value);
    }
    get appearance() {
        return this.getPropertyValue('appearance');
    }
    set appearance(value) {
        this.setProperty('appearance', value);
    }
    get backdropFilter() {
        return this.getPropertyValue('backdrop-filter');
    }
    set backdropFilter(value) {
        this.setProperty('backdrop-filter', value);
    }
    get backfaceVisibility() {
        return this.getPropertyValue('backface-visibility');
    }
    set backfaceVisibility(value) {
        this.setProperty('backface-visibility', value);
    }
    get background() {
        return this.getPropertyValue('background');
    }
    set background(value) {
        this.setProperty('background', value);
    }
    get backgroundAttachment() {
        return this.getPropertyValue('background-attachment');
    }
    set backgroundAttachment(value) {
        this.setProperty('background-attachment', value);
    }
    get backgroundBlendMode() {
        return this.getPropertyValue('background-blend-mode');
    }
    set backgroundBlendMode(value) {
        this.setProperty('background-blend-mode', value);
    }
    get backgroundClip() {
        return this.getPropertyValue('background-clip');
    }
    set backgroundClip(value) {
        this.setProperty('background-clip', value);
    }
    get backgroundColor() {
        return this.getPropertyValue('background-color');
    }
    set backgroundColor(value) {
        this.setProperty('background-color', value);
    }
    get backgroundImage() {
        return this.getPropertyValue('background-image');
    }
    set backgroundImage(value) {
        this.setProperty('background-image', value);
    }
    get backgroundOrigin() {
        return this.getPropertyValue('background-origin');
    }
    set backgroundOrigin(value) {
        this.setProperty('background-origin', value);
    }
    get backgroundPosition() {
        return this.getPropertyValue('background-position');
    }
    set backgroundPosition(value) {
        this.setProperty('background-position', value);
    }
    get backgroundPositionX() {
        return this.getPropertyValue('background-position-x');
    }
    set backgroundPositionX(value) {
        this.setProperty('background-position-x', value);
    }
    get backgroundPositionY() {
        return this.getPropertyValue('background-position-y');
    }
    set backgroundPositionY(value) {
        this.setProperty('background-position-y', value);
    }
    get backgroundRepeat() {
        return this.getPropertyValue('background-repeat');
    }
    set backgroundRepeat(value) {
        this.setProperty('background-repeat', value);
    }
    get backgroundRepeatX() {
        return this.getPropertyValue('background-repeat-x');
    }
    set backgroundRepeatX(value) {
        this.setProperty('background-repeat-x', value);
    }
    get backgroundRepeatY() {
        return this.getPropertyValue('background-repeat-y');
    }
    set backgroundRepeatY(value) {
        this.setProperty('background-repeat-y', value);
    }
    get backgroundSize() {
        return this.getPropertyValue('background-size');
    }
    set backgroundSize(value) {
        this.setProperty('background-size', value);
    }
    get baselineShift() {
        return this.getPropertyValue('baseline-shift');
    }
    set baselineShift(value) {
        this.setProperty('baseline-shift', value);
    }
    get blockSize() {
        return this.getPropertyValue('block-size');
    }
    set blockSize(value) {
        this.setProperty('block-size', value);
    }
    get border() {
        return this.getPropertyValue('border');
    }
    set border(value) {
        this.setProperty('border', value);
    }
    get borderBlockEnd() {
        return this.getPropertyValue('border-block-end');
    }
    set borderBlockEnd(value) {
        this.setProperty('border-block-end', value);
    }
    get borderBlockEndColor() {
        return this.getPropertyValue('border-block-end-color');
    }
    set borderBlockEndColor(value) {
        this.setProperty('border-block-end-color', value);
    }
    get borderBlockEndStyle() {
        return this.getPropertyValue('border-block-end-style');
    }
    set borderBlockEndStyle(value) {
        this.setProperty('border-block-end-style', value);
    }
    get borderBlockEndWidth() {
        return this.getPropertyValue('border-block-end-width');
    }
    set borderBlockEndWidth(value) {
        this.setProperty('border-block-end-width', value);
    }
    get borderBlockStart() {
        return this.getPropertyValue('border-block-start');
    }
    set borderBlockStart(value) {
        this.setProperty('border-block-start', value);
    }
    get borderBlockStartColor() {
        return this.getPropertyValue('border-block-start-color');
    }
    set borderBlockStartColor(value) {
        this.setProperty('border-block-start-color', value);
    }
    get borderBlockStartStyle() {
        return this.getPropertyValue('border-block-start-style');
    }
    set borderBlockStartStyle(value) {
        this.setProperty('border-block-start-style', value);
    }
    get borderBlockStartWidth() {
        return this.getPropertyValue('border-block-start-width');
    }
    set borderBlockStartWidth(value) {
        this.setProperty('border-block-start-width', value);
    }
    get borderBottom() {
        return this.getPropertyValue('border-bottom');
    }
    set borderBottom(value) {
        this.setProperty('border-bottom', value);
    }
    get borderBottomColor() {
        return this.getPropertyValue('border-bottom-color');
    }
    set borderBottomColor(value) {
        this.setProperty('border-bottom-color', value);
    }
    get borderBottomLeftRadius() {
        return this.getPropertyValue('border-bottom-left-radius');
    }
    set borderBottomLeftRadius(value) {
        this.setProperty('border-bottom-left-radius', value);
    }
    get borderBottomRightRadius() {
        return this.getPropertyValue('border-bottom-right-radius');
    }
    set borderBottomRightRadius(value) {
        this.setProperty('border-bottom-right-radius', value);
    }
    get borderBottomStyle() {
        return this.getPropertyValue('border-bottom-style');
    }
    set borderBottomStyle(value) {
        this.setProperty('border-bottom-style', value);
    }
    get borderBottomWidth() {
        return this.getPropertyValue('border-bottom-width');
    }
    set borderBottomWidth(value) {
        this.setProperty('border-bottom-width', value);
    }
    get borderCollapse() {
        return this.getPropertyValue('border-collapse');
    }
    set borderCollapse(value) {
        this.setProperty('border-collapse', value);
    }
    get borderColor() {
        return this.getPropertyValue('border-color');
    }
    set borderColor(value) {
        this.setProperty('border-color', value);
    }
    get borderImage() {
        return this.getPropertyValue('border-image');
    }
    set borderImage(value) {
        this.setProperty('border-image', value);
    }
    get borderImageOutset() {
        return this.getPropertyValue('border-image-outset');
    }
    set borderImageOutset(value) {
        this.setProperty('border-image-outset', value);
    }
    get borderImageRepeat() {
        return this.getPropertyValue('border-image-repeat');
    }
    set borderImageRepeat(value) {
        this.setProperty('border-image-repeat', value);
    }
    get borderImageSlice() {
        return this.getPropertyValue('border-image-slice');
    }
    set borderImageSlice(value) {
        this.setProperty('border-image-slice', value);
    }
    get borderImageSource() {
        return this.getPropertyValue('border-image-source');
    }
    set borderImageSource(value) {
        this.setProperty('border-image-source', value);
    }
    get borderImageWidth() {
        return this.getPropertyValue('border-image-width');
    }
    set borderImageWidth(value) {
        this.setProperty('border-image-width', value);
    }
    get borderInlineEnd() {
        return this.getPropertyValue('border-inline-end');
    }
    set borderInlineEnd(value) {
        this.setProperty('border-inline-end', value);
    }
    get borderInlineEndColor() {
        return this.getPropertyValue('border-inline-end-color');
    }
    set borderInlineEndColor(value) {
        this.setProperty('border-inline-end-color', value);
    }
    get borderInlineEndStyle() {
        return this.getPropertyValue('border-inline-end-style');
    }
    set borderInlineEndStyle(value) {
        this.setProperty('border-inline-end-style', value);
    }
    get borderInlineEndWidth() {
        return this.getPropertyValue('border-inline-end-width');
    }
    set borderInlineEndWidth(value) {
        this.setProperty('border-inline-end-width', value);
    }
    get borderInlineStart() {
        return this.getPropertyValue('border-inline-start');
    }
    set borderInlineStart(value) {
        this.setProperty('border-inline-start', value);
    }
    get borderInlineStartColor() {
        return this.getPropertyValue('border-inline-start-color');
    }
    set borderInlineStartColor(value) {
        this.setProperty('border-inline-start-color', value);
    }
    get borderInlineStartStyle() {
        return this.getPropertyValue('border-inline-start-style');
    }
    set borderInlineStartStyle(value) {
        this.setProperty('border-inline-start-style', value);
    }
    get borderInlineStartWidth() {
        return this.getPropertyValue('border-inline-start-width');
    }
    set borderInlineStartWidth(value) {
        this.setProperty('border-inline-start-width', value);
    }
    get borderLeft() {
        return this.getPropertyValue('border-left');
    }
    set borderLeft(value) {
        this.setProperty('border-left', value);
    }
    get borderLeftColor() {
        return this.getPropertyValue('border-left-color');
    }
    set borderLeftColor(value) {
        this.setProperty('border-left-color', value);
    }
    get borderLeftStyle() {
        return this.getPropertyValue('border-left-style');
    }
    set borderLeftStyle(value) {
        this.setProperty('border-left-style', value);
    }
    get borderLeftWidth() {
        return this.getPropertyValue('border-left-width');
    }
    set borderLeftWidth(value) {
        this.setProperty('border-left-width', value);
    }
    get borderRadius() {
        return this.getPropertyValue('border-radius');
    }
    set borderRadius(value) {
        this.setProperty('border-radius', value);
    }
    get borderRight() {
        return this.getPropertyValue('border-right');
    }
    set borderRight(value) {
        this.setProperty('border-right', value);
    }
    get borderRightColor() {
        return this.getPropertyValue('border-right-color');
    }
    set borderRightColor(value) {
        this.setProperty('border-right-color', value);
    }
    get borderRightStyle() {
        return this.getPropertyValue('border-right-style');
    }
    set borderRightStyle(value) {
        this.setProperty('border-right-style', value);
    }
    get borderRightWidth() {
        return this.getPropertyValue('border-right-width');
    }
    set borderRightWidth(value) {
        this.setProperty('border-right-width', value);
    }
    get borderSpacing() {
        return this.getPropertyValue('border-spacing');
    }
    set borderSpacing(value) {
        this.setProperty('border-spacing', value);
    }
    get borderStyle() {
        return this.getPropertyValue('border-style');
    }
    set borderStyle(value) {
        this.setProperty('border-style', value);
    }
    get borderTop() {
        return this.getPropertyValue('border-top');
    }
    set borderTop(value) {
        this.setProperty('border-top', value);
    }
    get borderTopColor() {
        return this.getPropertyValue('border-top-color');
    }
    set borderTopColor(value) {
        this.setProperty('border-top-color', value);
    }
    get borderTopLeftRadius() {
        return this.getPropertyValue('border-top-left-radius');
    }
    set borderTopLeftRadius(value) {
        this.setProperty('border-top-left-radius', value);
    }
    get borderTopRightRadius() {
        return this.getPropertyValue('border-top-right-radius');
    }
    set borderTopRightRadius(value) {
        this.setProperty('border-top-right-radius', value);
    }
    get borderTopStyle() {
        return this.getPropertyValue('border-top-style');
    }
    set borderTopStyle(value) {
        this.setProperty('border-top-style', value);
    }
    get borderTopWidth() {
        return this.getPropertyValue('border-top-width');
    }
    set borderTopWidth(value) {
        this.setProperty('border-top-width', value);
    }
    get borderWidth() {
        return this.getPropertyValue('border-width');
    }
    set borderWidth(value) {
        this.setProperty('border-width', value);
    }
    get borderEndEndRadius() {
        return this.getPropertyValue('border-end-end-radius');
    }
    set borderEndEndRadius(value) {
        this.setProperty('border-end-end-radius', value);
    }
    get borderEndStartRadius() {
        return this.getPropertyValue('border-end-start-radius');
    }
    set borderEndStartRadius(value) {
        this.setProperty('border-end-start-radius', value);
    }
    get borderStartEndRadius() {
        return this.getPropertyValue('border-start-end-radius');
    }
    set borderStartEndRadius(value) {
        this.setProperty('border-start-end-radius', value);
    }
    get borderStartStartRadius() {
        return this.getPropertyValue('border-start-start-radius');
    }
    set borderStartStartRadius(value) {
        this.setProperty('border-start-start-radius', value);
    }
    get bottom() {
        return this.getPropertyValue('bottom');
    }
    set bottom(value) {
        this.setProperty('bottom', value);
    }
    get boxShadow() {
        return this.getPropertyValue('box-shadow');
    }
    set boxShadow(value) {
        this.setProperty('box-shadow', value);
    }
    get boxSizing() {
        return this.getPropertyValue('box-sizing');
    }
    set boxSizing(value) {
        this.setProperty('box-sizing', value);
    }
    get breakAfter() {
        return this.getPropertyValue('break-after');
    }
    set breakAfter(value) {
        this.setProperty('break-after', value);
    }
    get breakBefore() {
        return this.getPropertyValue('break-before');
    }
    set breakBefore(value) {
        this.setProperty('break-before', value);
    }
    get breakInside() {
        return this.getPropertyValue('break-inside');
    }
    set breakInside(value) {
        this.setProperty('break-inside', value);
    }
    get bufferedRendering() {
        return this.getPropertyValue('buffered-rendering');
    }
    set bufferedRendering(value) {
        this.setProperty('buffered-rendering', value);
    }
    get captionSide() {
        return this.getPropertyValue('caption-side');
    }
    set captionSide(value) {
        this.setProperty('caption-side', value);
    }
    get caretColor() {
        return this.getPropertyValue('caret-color');
    }
    set caretColor(value) {
        this.setProperty('caret-color', value);
    }
    get clear() {
        return this.getPropertyValue('clear');
    }
    set clear(value) {
        this.setProperty('clear', value);
    }
    get clip() {
        return this.getPropertyValue('clip');
    }
    set clip(value) {
        this.setProperty('clip', value);
    }
    get clipPath() {
        return this.getPropertyValue('clip-path');
    }
    set clipPath(value) {
        this.setProperty('clip-path', value);
    }
    get clipRule() {
        return this.getPropertyValue('clip-rule');
    }
    set clipRule(value) {
        this.setProperty('clip-rule', value);
    }
    get color() {
        return this.getPropertyValue('color');
    }
    set color(value) {
        this.setProperty('color', value);
    }
    get colorInterpolation() {
        return this.getPropertyValue('color-interpolation');
    }
    set colorInterpolation(value) {
        this.setProperty('color-interpolation', value);
    }
    get colorInterpolationFilters() {
        return this.getPropertyValue('color-interpolation-filters');
    }
    set colorInterpolationFilters(value) {
        this.setProperty('color-interpolation-filters', value);
    }
    get colorRendering() {
        return this.getPropertyValue('color-rendering');
    }
    set colorRendering(value) {
        this.setProperty('color-rendering', value);
    }
    get colorScheme() {
        return this.getPropertyValue('color-scheme');
    }
    set colorScheme(value) {
        this.setProperty('color-scheme', value);
    }
    get columnCount() {
        return this.getPropertyValue('column-count');
    }
    set columnCount(value) {
        this.setProperty('column-count', value);
    }
    get columnFill() {
        return this.getPropertyValue('column-fill');
    }
    set columnFill(value) {
        this.setProperty('column-fill', value);
    }
    get columnGap() {
        return this.getPropertyValue('column-gap');
    }
    set columnGap(value) {
        this.setProperty('column-gap', value);
    }
    get columnRule() {
        return this.getPropertyValue('column-rule');
    }
    set columnRule(value) {
        this.setProperty('column-rule', value);
    }
    get columnRuleColor() {
        return this.getPropertyValue('column-rule-color');
    }
    set columnRuleColor(value) {
        this.setProperty('column-rule-color', value);
    }
    get columnRuleStyle() {
        return this.getPropertyValue('column-rule-style');
    }
    set columnRuleStyle(value) {
        this.setProperty('column-rule-style', value);
    }
    get columnRuleWidth() {
        return this.getPropertyValue('column-rule-width');
    }
    set columnRuleWidth(value) {
        this.setProperty('column-rule-width', value);
    }
    get columnSpan() {
        return this.getPropertyValue('column-span');
    }
    set columnSpan(value) {
        this.setProperty('column-span', value);
    }
    get columnWidth() {
        return this.getPropertyValue('column-width');
    }
    set columnWidth(value) {
        this.setProperty('column-width', value);
    }
    get columns() {
        return this.getPropertyValue('columns');
    }
    set columns(value) {
        this.setProperty('columns', value);
    }
    get contain() {
        return this.getPropertyValue('contain');
    }
    set contain(value) {
        this.setProperty('contain', value);
    }
    get containIntrinsicSize() {
        return this.getPropertyValue('contain-intrinsic-size');
    }
    set containIntrinsicSize(value) {
        this.setProperty('contain-intrinsic-size', value);
    }
    get content() {
        return this.getPropertyValue('content');
    }
    set content(value) {
        this.setProperty('content', value);
    }
    get contentVisibility() {
        return this.getPropertyValue('content-visibility');
    }
    set contentVisibility(value) {
        this.setProperty('content-visibility', value);
    }
    get counterIncrement() {
        return this.getPropertyValue('counter-increment');
    }
    set counterIncrement(value) {
        this.setProperty('counter-increment', value);
    }
    get counterReset() {
        return this.getPropertyValue('counter-reset');
    }
    set counterReset(value) {
        this.setProperty('counter-reset', value);
    }
    get counterSet() {
        return this.getPropertyValue('counter-set');
    }
    set counterSet(value) {
        this.setProperty('counter-set', value);
    }
    get containIntrinsicBlockSize() {
        return this.getPropertyValue('contain-intrinsic-block-size');
    }
    set containIntrinsicBlockSize(value) {
        this.setProperty('contain-intrinsic-block-size', value);
    }
    get containIntrinsicHeight() {
        return this.getPropertyValue('contain-intrinsic-height');
    }
    set containIntrinsicHeight(value) {
        this.setProperty('contain-intrinsic-height', value);
    }
    get containIntrinsicInlineSize() {
        return this.getPropertyValue('contain-intrinsic-inline-size');
    }
    set containIntrinsicInlineSize(value) {
        this.setProperty('contain-intrinsic-inline-size', value);
    }
    get containIntrinsicWidth() {
        return this.getPropertyValue('contain-intrinsic-width');
    }
    set containIntrinsicWidth(value) {
        this.setProperty('contain-intrinsic-width', value);
    }
    get cssFloat() {
        return this.getPropertyValue('css-float');
    }
    set cssFloat(value) {
        this.setProperty('css-float', value);
    }
    get cursor() {
        return this.getPropertyValue('cursor');
    }
    set cursor(value) {
        this.setProperty('cursor', value);
    }
    get cx() {
        return this.getPropertyValue('cx');
    }
    set cx(value) {
        this.setProperty('cx', value);
    }
    get cy() {
        return this.getPropertyValue('cy');
    }
    set cy(value) {
        this.setProperty('cy', value);
    }
    get d() {
        return this.getPropertyValue('d');
    }
    set d(value) {
        this.setProperty('d', value);
    }
    get direction() {
        return this.getPropertyValue('direction');
    }
    set direction(value) {
        this.setProperty('direction', value);
    }
    get display() {
        return this.getPropertyValue('display');
    }
    set display(value) {
        this.setProperty('display', value);
    }
    get dominantBaseline() {
        return this.getPropertyValue('dominant-baseline');
    }
    set dominantBaseline(value) {
        this.setProperty('dominant-baseline', value);
    }
    get emptyCells() {
        return this.getPropertyValue('empty-cells');
    }
    set emptyCells(value) {
        this.setProperty('empty-cells', value);
    }
    get fill() {
        return this.getPropertyValue('fill');
    }
    set fill(value) {
        this.setProperty('fill', value);
    }
    get fillOpacity() {
        return this.getPropertyValue('fill-opacity');
    }
    set fillOpacity(value) {
        this.setProperty('fill-opacity', value);
    }
    get fillRule() {
        return this.getPropertyValue('fill-rule');
    }
    set fillRule(value) {
        this.setProperty('fill-rule', value);
    }
    get filter() {
        return this.getPropertyValue('filter');
    }
    set filter(value) {
        this.setProperty('filter', value);
    }
    get flex() {
        return this.getPropertyValue('flex');
    }
    set flex(value) {
        this.setProperty('flex', value);
    }
    get flexBasis() {
        return this.getPropertyValue('flex-basis');
    }
    set flexBasis(value) {
        this.setProperty('flex-basis', value);
    }
    get flexDirection() {
        return this.getPropertyValue('flex-direction');
    }
    set flexDirection(value) {
        this.setProperty('flex-direction', value);
    }
    get flexFlow() {
        return this.getPropertyValue('flex-flow');
    }
    set flexFlow(value) {
        this.setProperty('flex-flow', value);
    }
    get flexGrow() {
        return this.getPropertyValue('flex-grow');
    }
    set flexGrow(value) {
        this.setProperty('flex-grow', value);
    }
    get flexShrink() {
        return this.getPropertyValue('flex-shrink');
    }
    set flexShrink(value) {
        this.setProperty('flex-shrink', value);
    }
    get flexWrap() {
        return this.getPropertyValue('flex-wrap');
    }
    set flexWrap(value) {
        this.setProperty('flex-wrap', value);
    }
    get float() {
        return this.getPropertyValue('float');
    }
    set float(value) {
        this.setProperty('float', value);
    }
    get floodColor() {
        return this.getPropertyValue('flood-color');
    }
    set floodColor(value) {
        this.setProperty('flood-color', value);
    }
    get floodOpacity() {
        return this.getPropertyValue('flood-opacity');
    }
    set floodOpacity(value) {
        this.setProperty('flood-opacity', value);
    }
    get font() {
        return this.getPropertyValue('font');
    }
    set font(value) {
        this.setProperty('font', value);
    }
    get fontDisplay() {
        return this.getPropertyValue('font-display');
    }
    set fontDisplay(value) {
        this.setProperty('font-display', value);
    }
    get fontFamily() {
        return this.getPropertyValue('font-family');
    }
    set fontFamily(value) {
        this.setProperty('font-family', value);
    }
    get fontFeatureSettings() {
        return this.getPropertyValue('font-feature-settings');
    }
    set fontFeatureSettings(value) {
        this.setProperty('font-feature-settings', value);
    }
    get fontKerning() {
        return this.getPropertyValue('font-kerning');
    }
    set fontKerning(value) {
        this.setProperty('font-kerning', value);
    }
    get fontOpticalSizing() {
        return this.getPropertyValue('font-optical-sizing');
    }
    set fontOpticalSizing(value) {
        this.setProperty('font-optical-sizing', value);
    }
    get fontSize() {
        return this.getPropertyValue('font-size');
    }
    set fontSize(value) {
        this.setProperty('font-size', value);
    }
    get fontStretch() {
        return this.getPropertyValue('font-stretch');
    }
    set fontStretch(value) {
        this.setProperty('font-stretch', value);
    }
    get fontStyle() {
        return this.getPropertyValue('font-style');
    }
    set fontStyle(value) {
        this.setProperty('font-style', value);
    }
    get fontVariant() {
        return this.getPropertyValue('font-variant');
    }
    set fontVariant(value) {
        this.setProperty('font-variant', value);
    }
    get fontVariantCaps() {
        return this.getPropertyValue('font-variant-caps');
    }
    set fontVariantCaps(value) {
        this.setProperty('font-variant-caps', value);
    }
    get fontVariantEastAsian() {
        return this.getPropertyValue('font-variant-east-asian');
    }
    set fontVariantEastAsian(value) {
        this.setProperty('font-variant-east-asian', value);
    }
    get fontVariantLigatures() {
        return this.getPropertyValue('font-variant-ligatures');
    }
    set fontVariantLigatures(value) {
        this.setProperty('font-variant-ligatures', value);
    }
    get fontVariantNumeric() {
        return this.getPropertyValue('font-variant-numeric');
    }
    set fontVariantNumeric(value) {
        this.setProperty('font-variant-numeric', value);
    }
    get fontVariationSettings() {
        return this.getPropertyValue('font-variation-settings');
    }
    set fontVariationSettings(value) {
        this.setProperty('font-variation-settings', value);
    }
    get fontPalette() {
        return this.getPropertyValue('font-palette');
    }
    set fontPalette(value) {
        this.setProperty('font-palette', value);
    }
    get fontSynthesisSmallCaps() {
        return this.getPropertyValue('font-synthesis-small-caps');
    }
    set fontSynthesisSmallCaps(value) {
        this.setProperty('font-synthesis-small-caps', value);
    }
    get fontSynthesisStyle() {
        return this.getPropertyValue('font-synthesis-style');
    }
    set fontSynthesisStyle(value) {
        this.setProperty('font-synthesis-style', value);
    }
    get fontSynthesisWeight() {
        return this.getPropertyValue('font-synthesis-weight');
    }
    set fontSynthesisWeight(value) {
        this.setProperty('font-synthesis-weight', value);
    }
    get fontWeight() {
        return this.getPropertyValue('font-weight');
    }
    set fontWeight(value) {
        this.setProperty('font-weight', value);
    }
    get gap() {
        return this.getPropertyValue('gap');
    }
    set gap(value) {
        this.setProperty('gap', value);
    }
    get grid() {
        return this.getPropertyValue('grid');
    }
    set grid(value) {
        this.setProperty('grid', value);
    }
    get gridArea() {
        return this.getPropertyValue('grid-area');
    }
    set gridArea(value) {
        this.setProperty('grid-area', value);
    }
    get gridAutoColumns() {
        return this.getPropertyValue('grid-auto-columns');
    }
    set gridAutoColumns(value) {
        this.setProperty('grid-auto-columns', value);
    }
    get gridAutoFlow() {
        return this.getPropertyValue('grid-auto-flow');
    }
    set gridAutoFlow(value) {
        this.setProperty('grid-auto-flow', value);
    }
    get gridAutoRows() {
        return this.getPropertyValue('grid-auto-rows');
    }
    set gridAutoRows(value) {
        this.setProperty('grid-auto-rows', value);
    }
    get gridColumn() {
        return this.getPropertyValue('grid-column');
    }
    set gridColumn(value) {
        this.setProperty('grid-column', value);
    }
    get gridColumnEnd() {
        return this.getPropertyValue('grid-column-end');
    }
    set gridColumnEnd(value) {
        this.setProperty('grid-column-end', value);
    }
    get gridColumnGap() {
        return this.getPropertyValue('grid-column-gap');
    }
    set gridColumnGap(value) {
        this.setProperty('grid-column-gap', value);
    }
    get gridColumnStart() {
        return this.getPropertyValue('grid-column-start');
    }
    set gridColumnStart(value) {
        this.setProperty('grid-column-start', value);
    }
    get gridGap() {
        return this.getPropertyValue('grid-gap');
    }
    set gridGap(value) {
        this.setProperty('grid-gap', value);
    }
    get gridRow() {
        return this.getPropertyValue('grid-row');
    }
    set gridRow(value) {
        this.setProperty('grid-row', value);
    }
    get gridRowEnd() {
        return this.getPropertyValue('grid-row-end');
    }
    set gridRowEnd(value) {
        this.setProperty('grid-row-end', value);
    }
    get gridRowGap() {
        return this.getPropertyValue('grid-row-gap');
    }
    set gridRowGap(value) {
        this.setProperty('grid-row-gap', value);
    }
    get gridRowStart() {
        return this.getPropertyValue('grid-row-start');
    }
    set gridRowStart(value) {
        this.setProperty('grid-row-start', value);
    }
    get gridTemplate() {
        return this.getPropertyValue('grid-template');
    }
    set gridTemplate(value) {
        this.setProperty('grid-template', value);
    }
    get gridTemplateAreas() {
        return this.getPropertyValue('grid-template-areas');
    }
    set gridTemplateAreas(value) {
        this.setProperty('grid-template-areas', value);
    }
    get gridTemplateColumns() {
        return this.getPropertyValue('grid-template-columns');
    }
    set gridTemplateColumns(value) {
        this.setProperty('grid-template-columns', value);
    }
    get gridTemplateRows() {
        return this.getPropertyValue('grid-template-rows');
    }
    set gridTemplateRows(value) {
        this.setProperty('grid-template-rows', value);
    }
    get height() {
        return this.getPropertyValue('height');
    }
    set height(value) {
        this.setProperty('height', value);
    }
    get hyphens() {
        return this.getPropertyValue('hyphens');
    }
    set hyphens(value) {
        this.setProperty('hyphens', value);
    }
    get imageOrientation() {
        return this.getPropertyValue('image-orientation');
    }
    set imageOrientation(value) {
        this.setProperty('image-orientation', value);
    }
    get imageRendering() {
        return this.getPropertyValue('image-rendering');
    }
    set imageRendering(value) {
        this.setProperty('image-rendering', value);
    }
    get inherits() {
        return this.getPropertyValue('inherits');
    }
    set inherits(value) {
        this.setProperty('inherits', value);
    }
    get initialValue() {
        return this.getPropertyValue('initial-value');
    }
    set initialValue(value) {
        this.setProperty('initial-value', value);
    }
    get inlineSize() {
        return this.getPropertyValue('inline-size');
    }
    set inlineSize(value) {
        this.setProperty('inline-size', value);
    }
    get isolation() {
        return this.getPropertyValue('isolation');
    }
    set isolation(value) {
        this.setProperty('isolation', value);
    }
    get insetBlockEnd() {
        return this.getPropertyValue('inset-block-end');
    }
    set insetBlockEnd(value) {
        this.setProperty('inset-block-end', value);
    }
    get insetBlockStart() {
        return this.getPropertyValue('inset-block-start');
    }
    set insetBlockStart(value) {
        this.setProperty('inset-block-start', value);
    }
    get insetInlineEnd() {
        return this.getPropertyValue('inset-inline-end');
    }
    set insetInlineEnd(value) {
        this.setProperty('inset-inline-end', value);
    }
    get insetInlineStart() {
        return this.getPropertyValue('inset-inline-start');
    }
    set insetInlineStart(value) {
        this.setProperty('inset-inline-start', value);
    }
    get justifyContent() {
        return this.getPropertyValue('justify-content');
    }
    set justifyContent(value) {
        this.setProperty('justify-content', value);
    }
    get justifyItems() {
        return this.getPropertyValue('justify-items');
    }
    set justifyItems(value) {
        this.setProperty('justify-items', value);
    }
    get justifySelf() {
        return this.getPropertyValue('justify-self');
    }
    set justifySelf(value) {
        this.setProperty('justify-self', value);
    }
    get left() {
        return this.getPropertyValue('left');
    }
    set left(value) {
        this.setProperty('left', value);
    }
    get letterSpacing() {
        return this.getPropertyValue('letter-spacing');
    }
    set letterSpacing(value) {
        this.setProperty('letter-spacing', value);
    }
    get lightingColor() {
        return this.getPropertyValue('lighting-color');
    }
    set lightingColor(value) {
        this.setProperty('lighting-color', value);
    }
    get lineBreak() {
        return this.getPropertyValue('line-break');
    }
    set lineBreak(value) {
        this.setProperty('line-break', value);
    }
    get lineHeight() {
        return this.getPropertyValue('line-height');
    }
    set lineHeight(value) {
        this.setProperty('line-height', value);
    }
    get listStyle() {
        return this.getPropertyValue('list-style');
    }
    set listStyle(value) {
        this.setProperty('list-style', value);
    }
    get listStyleImage() {
        return this.getPropertyValue('list-style-image');
    }
    set listStyleImage(value) {
        this.setProperty('list-style-image', value);
    }
    get listStylePosition() {
        return this.getPropertyValue('list-style-position');
    }
    set listStylePosition(value) {
        this.setProperty('list-style-position', value);
    }
    get listStyleType() {
        return this.getPropertyValue('list-style-type');
    }
    set listStyleType(value) {
        this.setProperty('list-style-type', value);
    }
    get margin() {
        return this.getPropertyValue('margin');
    }
    set margin(value) {
        this.setProperty('margin', value);
    }
    get marginBlockEnd() {
        return this.getPropertyValue('margin-block-end');
    }
    set marginBlockEnd(value) {
        this.setProperty('margin-block-end', value);
    }
    get marginBlockStart() {
        return this.getPropertyValue('margin-block-start');
    }
    set marginBlockStart(value) {
        this.setProperty('margin-block-start', value);
    }
    get marginBottom() {
        return this.getPropertyValue('margin-bottom');
    }
    set marginBottom(value) {
        this.setProperty('margin-bottom', value);
    }
    get marginInlineEnd() {
        return this.getPropertyValue('margin-inline-end');
    }
    set marginInlineEnd(value) {
        this.setProperty('margin-inline-end', value);
    }
    get marginInlineStart() {
        return this.getPropertyValue('margin-inline-start');
    }
    set marginInlineStart(value) {
        this.setProperty('margin-inline-start', value);
    }
    get marginLeft() {
        return this.getPropertyValue('margin-left');
    }
    set marginLeft(value) {
        this.setProperty('margin-left', value);
    }
    get marginRight() {
        return this.getPropertyValue('margin-right');
    }
    set marginRight(value) {
        this.setProperty('margin-right', value);
    }
    get marginTop() {
        return this.getPropertyValue('margin-top');
    }
    set marginTop(value) {
        this.setProperty('margin-top', value);
    }
    get marker() {
        return this.getPropertyValue('marker');
    }
    set marker(value) {
        this.setProperty('marker', value);
    }
    get markerEnd() {
        return this.getPropertyValue('marker-end');
    }
    set markerEnd(value) {
        this.setProperty('marker-end', value);
    }
    get markerMid() {
        return this.getPropertyValue('marker-mid');
    }
    set markerMid(value) {
        this.setProperty('marker-mid', value);
    }
    get markerStart() {
        return this.getPropertyValue('marker-start');
    }
    set markerStart(value) {
        this.setProperty('marker-start', value);
    }
    get mask() {
        return this.getPropertyValue('mask');
    }
    set mask(value) {
        this.setProperty('mask', value);
    }
    get maskType() {
        return this.getPropertyValue('mask-type');
    }
    set maskType(value) {
        this.setProperty('mask-type', value);
    }
    get maxBlockSize() {
        return this.getPropertyValue('max-block-size');
    }
    set maxBlockSize(value) {
        this.setProperty('max-block-size', value);
    }
    get maxHeight() {
        return this.getPropertyValue('max-height');
    }
    set maxHeight(value) {
        this.setProperty('max-height', value);
    }
    get maxInlineSize() {
        return this.getPropertyValue('max-inline-size');
    }
    set maxInlineSize(value) {
        this.setProperty('max-inline-size', value);
    }
    get maxWidth() {
        return this.getPropertyValue('max-width');
    }
    set maxWidth(value) {
        this.setProperty('max-width', value);
    }
    get maxZoom() {
        return this.getPropertyValue('max-zoom');
    }
    set maxZoom(value) {
        this.setProperty('max-zoom', value);
    }
    get minBlockSize() {
        return this.getPropertyValue('min-block-size');
    }
    set minBlockSize(value) {
        this.setProperty('min-block-size', value);
    }
    get minHeight() {
        return this.getPropertyValue('min-height');
    }
    set minHeight(value) {
        this.setProperty('min-height', value);
    }
    get minInlineSize() {
        return this.getPropertyValue('min-inline-size');
    }
    set minInlineSize(value) {
        this.setProperty('min-inline-size', value);
    }
    get minWidth() {
        return this.getPropertyValue('min-width');
    }
    set minWidth(value) {
        this.setProperty('min-width', value);
    }
    get minZoom() {
        return this.getPropertyValue('min-zoom');
    }
    set minZoom(value) {
        this.setProperty('min-zoom', value);
    }
    get mixBlendMode() {
        return this.getPropertyValue('mix-blend-mode');
    }
    set mixBlendMode(value) {
        this.setProperty('mix-blend-mode', value);
    }
    get objectFit() {
        return this.getPropertyValue('object-fit');
    }
    set objectFit(value) {
        this.setProperty('object-fit', value);
    }
    get objectPosition() {
        return this.getPropertyValue('object-position');
    }
    set objectPosition(value) {
        this.setProperty('object-position', value);
    }
    get offset() {
        return this.getPropertyValue('offset');
    }
    set offset(value) {
        this.setProperty('offset', value);
    }
    get offsetDistance() {
        return this.getPropertyValue('offset-distance');
    }
    set offsetDistance(value) {
        this.setProperty('offset-distance', value);
    }
    get offsetPath() {
        return this.getPropertyValue('offset-path');
    }
    set offsetPath(value) {
        this.setProperty('offset-path', value);
    }
    get offsetRotate() {
        return this.getPropertyValue('offset-rotate');
    }
    set offsetRotate(value) {
        this.setProperty('offset-rotate', value);
    }
    get opacity() {
        return this.getPropertyValue('opacity');
    }
    set opacity(value) {
        this.setProperty('opacity', value);
    }
    get order() {
        return this.getPropertyValue('order');
    }
    set order(value) {
        this.setProperty('order', value);
    }
    get orientation() {
        return this.getPropertyValue('orientation');
    }
    set orientation(value) {
        this.setProperty('orientation', value);
    }
    get orphans() {
        return this.getPropertyValue('orphans');
    }
    set orphans(value) {
        this.setProperty('orphans', value);
    }
    get outline() {
        return this.getPropertyValue('outline');
    }
    set outline(value) {
        this.setProperty('outline', value);
    }
    get outlineColor() {
        return this.getPropertyValue('outline-color');
    }
    set outlineColor(value) {
        this.setProperty('outline-color', value);
    }
    get outlineOffset() {
        return this.getPropertyValue('outline-offset');
    }
    set outlineOffset(value) {
        this.setProperty('outline-offset', value);
    }
    get outlineStyle() {
        return this.getPropertyValue('outline-style');
    }
    set outlineStyle(value) {
        this.setProperty('outline-style', value);
    }
    get outlineWidth() {
        return this.getPropertyValue('outline-width');
    }
    set outlineWidth(value) {
        this.setProperty('outline-width', value);
    }
    get overflow() {
        return this.getPropertyValue('overflow');
    }
    set overflow(value) {
        this.setProperty('overflow', value);
    }
    get overflowAnchor() {
        return this.getPropertyValue('overflow-anchor');
    }
    set overflowAnchor(value) {
        this.setProperty('overflow-anchor', value);
    }
    get overflowWrap() {
        return this.getPropertyValue('overflow-wrap');
    }
    set overflowWrap(value) {
        this.setProperty('overflow-wrap', value);
    }
    get overflowX() {
        return this.getPropertyValue('overflow-x');
    }
    set overflowX(value) {
        this.setProperty('overflow-x', value);
    }
    get overflowY() {
        return this.getPropertyValue('overflow-y');
    }
    set overflowY(value) {
        this.setProperty('overflow-y', value);
    }
    get overscrollBehavior() {
        return this.getPropertyValue('overscroll-behavior');
    }
    set overscrollBehavior(value) {
        this.setProperty('overscroll-behavior', value);
    }
    get overscrollBehaviorBlock() {
        return this.getPropertyValue('overscroll-behavior-block');
    }
    set overscrollBehaviorBlock(value) {
        this.setProperty('overscroll-behavior-block', value);
    }
    get overscrollBehaviorInline() {
        return this.getPropertyValue('overscroll-behavior-inline');
    }
    set overscrollBehaviorInline(value) {
        this.setProperty('overscroll-behavior-inline', value);
    }
    get overscrollBehaviorX() {
        return this.getPropertyValue('overscroll-behavior-x');
    }
    set overscrollBehaviorX(value) {
        this.setProperty('overscroll-behavior-x', value);
    }
    get overscrollBehaviorY() {
        return this.getPropertyValue('overscroll-behavior-y');
    }
    set overscrollBehaviorY(value) {
        this.setProperty('overscroll-behavior-y', value);
    }
    get overflowClipMargin() {
        return this.getPropertyValue('overflow-clip-margin');
    }
    set overflowClipMargin(value) {
        this.setProperty('overflow-clip-margin', value);
    }
    get padding() {
        return this.getPropertyValue('padding');
    }
    set padding(value) {
        this.setProperty('padding', value);
    }
    get paddingBlockEnd() {
        return this.getPropertyValue('padding-block-end');
    }
    set paddingBlockEnd(value) {
        this.setProperty('padding-block-end', value);
    }
    get paddingBlockStart() {
        return this.getPropertyValue('padding-block-start');
    }
    set paddingBlockStart(value) {
        this.setProperty('padding-block-start', value);
    }
    get paddingBottom() {
        return this.getPropertyValue('padding-bottom');
    }
    set paddingBottom(value) {
        this.setProperty('padding-bottom', value);
    }
    get paddingInlineEnd() {
        return this.getPropertyValue('padding-inline-end');
    }
    set paddingInlineEnd(value) {
        this.setProperty('padding-inline-end', value);
    }
    get paddingInlineStart() {
        return this.getPropertyValue('padding-inline-start');
    }
    set paddingInlineStart(value) {
        this.setProperty('padding-inline-start', value);
    }
    get paddingLeft() {
        return this.getPropertyValue('padding-left');
    }
    set paddingLeft(value) {
        this.setProperty('padding-left', value);
    }
    get paddingRight() {
        return this.getPropertyValue('padding-right');
    }
    set paddingRight(value) {
        this.setProperty('padding-right', value);
    }
    get paddingTop() {
        return this.getPropertyValue('padding-top');
    }
    set paddingTop(value) {
        this.setProperty('padding-top', value);
    }
    get page() {
        return this.getPropertyValue('page');
    }
    set page(value) {
        this.setProperty('page', value);
    }
    get pageBreakAfter() {
        return this.getPropertyValue('page-break-after');
    }
    set pageBreakAfter(value) {
        this.setProperty('page-break-after', value);
    }
    get pageBreakBefore() {
        return this.getPropertyValue('page-break-before');
    }
    set pageBreakBefore(value) {
        this.setProperty('page-break-before', value);
    }
    get pageBreakInside() {
        return this.getPropertyValue('page-break-inside');
    }
    set pageBreakInside(value) {
        this.setProperty('page-break-inside', value);
    }
    get pageOrientation() {
        return this.getPropertyValue('page-orientation');
    }
    set pageOrientation(value) {
        this.setProperty('page-orientation', value);
    }
    get paintOrder() {
        return this.getPropertyValue('paint-order');
    }
    set paintOrder(value) {
        this.setProperty('paint-order', value);
    }
    get perspective() {
        return this.getPropertyValue('perspective');
    }
    set perspective(value) {
        this.setProperty('perspective', value);
    }
    get perspectiveOrigin() {
        return this.getPropertyValue('perspective-origin');
    }
    set perspectiveOrigin(value) {
        this.setProperty('perspective-origin', value);
    }
    get placeContent() {
        return this.getPropertyValue('place-content');
    }
    set placeContent(value) {
        this.setProperty('place-content', value);
    }
    get placeItems() {
        return this.getPropertyValue('place-items');
    }
    set placeItems(value) {
        this.setProperty('place-items', value);
    }
    get placeSelf() {
        return this.getPropertyValue('place-self');
    }
    set placeSelf(value) {
        this.setProperty('place-self', value);
    }
    get pointerEvents() {
        return this.getPropertyValue('pointer-events');
    }
    set pointerEvents(value) {
        this.setProperty('pointer-events', value);
    }
    get position() {
        return this.getPropertyValue('position');
    }
    set position(value) {
        this.setProperty('position', value);
    }
    get quotes() {
        return this.getPropertyValue('quotes');
    }
    set quotes(value) {
        this.setProperty('quotes', value);
    }
    get r() {
        return this.getPropertyValue('r');
    }
    set r(value) {
        this.setProperty('r', value);
    }
    get resize() {
        return this.getPropertyValue('resize');
    }
    set resize(value) {
        this.setProperty('resize', value);
    }
    get right() {
        return this.getPropertyValue('right');
    }
    set right(value) {
        this.setProperty('right', value);
    }
    get rowGap() {
        return this.getPropertyValue('row-gap');
    }
    set rowGap(value) {
        this.setProperty('row-gap', value);
    }
    get rubyPosition() {
        return this.getPropertyValue('ruby-position');
    }
    set rubyPosition(value) {
        this.setProperty('ruby-position', value);
    }
    get rx() {
        return this.getPropertyValue('rx');
    }
    set rx(value) {
        this.setProperty('rx', value);
    }
    get ry() {
        return this.getPropertyValue('ry');
    }
    set ry(value) {
        this.setProperty('ry', value);
    }
    get scrollBehavior() {
        return this.getPropertyValue('scroll-behavior');
    }
    set scrollBehavior(value) {
        this.setProperty('scroll-behavior', value);
    }
    get scrollMargin() {
        return this.getPropertyValue('scroll-margin');
    }
    set scrollMargin(value) {
        this.setProperty('scroll-margin', value);
    }
    get scrollMarginBlock() {
        return this.getPropertyValue('scroll-margin-block');
    }
    set scrollMarginBlock(value) {
        this.setProperty('scroll-margin-block', value);
    }
    get scrollMarginBlockEnd() {
        return this.getPropertyValue('scroll-margin-block-end');
    }
    set scrollMarginBlockEnd(value) {
        this.setProperty('scroll-margin-block-end', value);
    }
    get scrollMarginBlockStart() {
        return this.getPropertyValue('scroll-margin-block-start');
    }
    set scrollMarginBlockStart(value) {
        this.setProperty('scroll-margin-block-start', value);
    }
    get scrollMarginBottom() {
        return this.getPropertyValue('scroll-margin-bottom');
    }
    set scrollMarginBottom(value) {
        this.setProperty('scroll-margin-bottom', value);
    }
    get scrollMarginInline() {
        return this.getPropertyValue('scroll-margin-inline');
    }
    set scrollMarginInline(value) {
        this.setProperty('scroll-margin-inline', value);
    }
    get scrollMarginInlineEnd() {
        return this.getPropertyValue('scroll-margin-inline-end');
    }
    set scrollMarginInlineEnd(value) {
        this.setProperty('scroll-margin-inline-end', value);
    }
    get scrollMarginInlineStart() {
        return this.getPropertyValue('scroll-margin-inline-start');
    }
    set scrollMarginInlineStart(value) {
        this.setProperty('scroll-margin-inline-start', value);
    }
    get scrollMarginLeft() {
        return this.getPropertyValue('scroll-margin-left');
    }
    set scrollMarginLeft(value) {
        this.setProperty('scroll-margin-left', value);
    }
    get scrollMarginRight() {
        return this.getPropertyValue('scroll-margin-right');
    }
    set scrollMarginRight(value) {
        this.setProperty('scroll-margin-right', value);
    }
    get scrollMarginTop() {
        return this.getPropertyValue('scroll-margin-top');
    }
    set scrollMarginTop(value) {
        this.setProperty('scroll-margin-top', value);
    }
    get scrollPadding() {
        return this.getPropertyValue('scroll-padding');
    }
    set scrollPadding(value) {
        this.setProperty('scroll-padding', value);
    }
    get scrollPaddingBlock() {
        return this.getPropertyValue('scroll-padding-block');
    }
    set scrollPaddingBlock(value) {
        this.setProperty('scroll-padding-block', value);
    }
    get scrollPaddingBlockEnd() {
        return this.getPropertyValue('scroll-padding-block-end');
    }
    set scrollPaddingBlockEnd(value) {
        this.setProperty('scroll-padding-block-end', value);
    }
    get scrollPaddingBlockStart() {
        return this.getPropertyValue('scroll-padding-block-start');
    }
    set scrollPaddingBlockStart(value) {
        this.setProperty('scroll-padding-block-start', value);
    }
    get scrollPaddingBottom() {
        return this.getPropertyValue('scroll-padding-bottom');
    }
    set scrollPaddingBottom(value) {
        this.setProperty('scroll-padding-bottom', value);
    }
    get scrollPaddingInline() {
        return this.getPropertyValue('scroll-padding-inline');
    }
    set scrollPaddingInline(value) {
        this.setProperty('scroll-padding-inline', value);
    }
    get scrollPaddingInlineEnd() {
        return this.getPropertyValue('scroll-padding-inline-end');
    }
    set scrollPaddingInlineEnd(value) {
        this.setProperty('scroll-padding-inline-end', value);
    }
    get scrollPaddingInlineStart() {
        return this.getPropertyValue('scroll-padding-inline-start');
    }
    set scrollPaddingInlineStart(value) {
        this.setProperty('scroll-padding-inline-start', value);
    }
    get scrollPaddingLeft() {
        return this.getPropertyValue('scroll-padding-left');
    }
    set scrollPaddingLeft(value) {
        this.setProperty('scroll-padding-left', value);
    }
    get scrollPaddingRight() {
        return this.getPropertyValue('scroll-padding-right');
    }
    set scrollPaddingRight(value) {
        this.setProperty('scroll-padding-right', value);
    }
    get scrollPaddingTop() {
        return this.getPropertyValue('scroll-padding-top');
    }
    set scrollPaddingTop(value) {
        this.setProperty('scroll-padding-top', value);
    }
    get scrollSnapAlign() {
        return this.getPropertyValue('scroll-snap-align');
    }
    set scrollSnapAlign(value) {
        this.setProperty('scroll-snap-align', value);
    }
    get scrollSnapStop() {
        return this.getPropertyValue('scroll-snap-stop');
    }
    set scrollSnapStop(value) {
        this.setProperty('scroll-snap-stop', value);
    }
    get scrollSnapType() {
        return this.getPropertyValue('scroll-snap-type');
    }
    set scrollSnapType(value) {
        this.setProperty('scroll-snap-type', value);
    }
    get shapeImageThreshold() {
        return this.getPropertyValue('shape-image-threshold');
    }
    set shapeImageThreshold(value) {
        this.setProperty('shape-image-threshold', value);
    }
    get shapeMargin() {
        return this.getPropertyValue('shape-margin');
    }
    set shapeMargin(value) {
        this.setProperty('shape-margin', value);
    }
    get shapeOutside() {
        return this.getPropertyValue('shape-outside');
    }
    set shapeOutside(value) {
        this.setProperty('shape-outside', value);
    }
    get shapeRendering() {
        return this.getPropertyValue('shape-rendering');
    }
    set shapeRendering(value) {
        this.setProperty('shape-rendering', value);
    }
    get size() {
        return this.getPropertyValue('size');
    }
    set size(value) {
        this.setProperty('size', value);
    }
    get speak() {
        return this.getPropertyValue('speak');
    }
    set speak(value) {
        this.setProperty('speak', value);
    }
    get src() {
        return this.getPropertyValue('src');
    }
    set src(value) {
        this.setProperty('src', value);
    }
    get stopColor() {
        return this.getPropertyValue('stop-color');
    }
    set stopColor(value) {
        this.setProperty('stop-color', value);
    }
    get stopOpacity() {
        return this.getPropertyValue('stop-opacity');
    }
    set stopOpacity(value) {
        this.setProperty('stop-opacity', value);
    }
    get stroke() {
        return this.getPropertyValue('stroke');
    }
    set stroke(value) {
        this.setProperty('stroke', value);
    }
    get strokeDasharray() {
        return this.getPropertyValue('stroke-dasharray');
    }
    set strokeDasharray(value) {
        this.setProperty('stroke-dasharray', value);
    }
    get strokeDashoffset() {
        return this.getPropertyValue('stroke-dashoffset');
    }
    set strokeDashoffset(value) {
        this.setProperty('stroke-dashoffset', value);
    }
    get strokeLinecap() {
        return this.getPropertyValue('stroke-linecap');
    }
    set strokeLinecap(value) {
        this.setProperty('stroke-linecap', value);
    }
    get strokeLinejoin() {
        return this.getPropertyValue('stroke-linejoin');
    }
    set strokeLinejoin(value) {
        this.setProperty('stroke-linejoin', value);
    }
    get strokeMiterlimit() {
        return this.getPropertyValue('stroke-miterlimit');
    }
    set strokeMiterlimit(value) {
        this.setProperty('stroke-miterlimit', value);
    }
    get strokeOpacity() {
        return this.getPropertyValue('stroke-opacity');
    }
    set strokeOpacity(value) {
        this.setProperty('stroke-opacity', value);
    }
    get strokeWidth() {
        return this.getPropertyValue('stroke-width');
    }
    set strokeWidth(value) {
        this.setProperty('stroke-width', value);
    }
    get syntax() {
        return this.getPropertyValue('syntax');
    }
    set syntax(value) {
        this.setProperty('syntax', value);
    }
    get scrollbarGutter() {
        return this.getPropertyValue('scrollbar-gutter');
    }
    set scrollbarGutter(value) {
        this.setProperty('scrollbar-gutter', value);
    }
    get tabSize() {
        return this.getPropertyValue('tab-size');
    }
    set tabSize(value) {
        this.setProperty('tab-size', value);
    }
    get tableLayout() {
        return this.getPropertyValue('table-layout');
    }
    set tableLayout(value) {
        this.setProperty('table-layout', value);
    }
    get textAlign() {
        return this.getPropertyValue('text-align');
    }
    set textAlign(value) {
        this.setProperty('text-align', value);
    }
    get textAlignLast() {
        return this.getPropertyValue('text-align-last');
    }
    set textAlignLast(value) {
        this.setProperty('text-align-last', value);
    }
    get textAnchor() {
        return this.getPropertyValue('text-anchor');
    }
    set textAnchor(value) {
        this.setProperty('text-anchor', value);
    }
    get textCombineUpright() {
        return this.getPropertyValue('text-combine-upright');
    }
    set textCombineUpright(value) {
        this.setProperty('text-combine-upright', value);
    }
    get textDecoration() {
        return this.getPropertyValue('text-decoration');
    }
    set textDecoration(value) {
        this.setProperty('text-decoration', value);
    }
    get textDecorationColor() {
        return this.getPropertyValue('text-decoration-color');
    }
    set textDecorationColor(value) {
        this.setProperty('text-decoration-color', value);
    }
    get textDecorationLine() {
        return this.getPropertyValue('text-decoration-line');
    }
    set textDecorationLine(value) {
        this.setProperty('text-decoration-line', value);
    }
    get textDecorationSkipInk() {
        return this.getPropertyValue('text-decoration-skip-ink');
    }
    set textDecorationSkipInk(value) {
        this.setProperty('text-decoration-skip-ink', value);
    }
    get textDecorationStyle() {
        return this.getPropertyValue('text-decoration-style');
    }
    set textDecorationStyle(value) {
        this.setProperty('text-decoration-style', value);
    }
    get textIndent() {
        return this.getPropertyValue('text-indent');
    }
    set textIndent(value) {
        this.setProperty('text-indent', value);
    }
    get textOrientation() {
        return this.getPropertyValue('text-orientation');
    }
    set textOrientation(value) {
        this.setProperty('text-orientation', value);
    }
    get textOverflow() {
        return this.getPropertyValue('text-overflow');
    }
    set textOverflow(value) {
        this.setProperty('text-overflow', value);
    }
    get textRendering() {
        return this.getPropertyValue('text-rendering');
    }
    set textRendering(value) {
        this.setProperty('text-rendering', value);
    }
    get textShadow() {
        return this.getPropertyValue('text-shadow');
    }
    set textShadow(value) {
        this.setProperty('text-shadow', value);
    }
    get textSizeAdjust() {
        return this.getPropertyValue('text-size-adjust');
    }
    set textSizeAdjust(value) {
        this.setProperty('text-size-adjust', value);
    }
    get textTransform() {
        return this.getPropertyValue('text-transform');
    }
    set textTransform(value) {
        this.setProperty('text-transform', value);
    }
    get textUnderlinePosition() {
        return this.getPropertyValue('text-underline-position');
    }
    set textUnderlinePosition(value) {
        this.setProperty('text-underline-position', value);
    }
    get top() {
        return this.getPropertyValue('top');
    }
    set top(value) {
        this.setProperty('top', value);
    }
    get touchAction() {
        return this.getPropertyValue('touch-action');
    }
    set touchAction(value) {
        this.setProperty('touch-action', value);
    }
    get transform() {
        return this.getPropertyValue('transform');
    }
    set transform(value) {
        this.setProperty('transform', value);
    }
    get transformBox() {
        return this.getPropertyValue('transform-box');
    }
    set transformBox(value) {
        this.setProperty('transform-box', value);
    }
    get transformOrigin() {
        return this.getPropertyValue('transform-origin');
    }
    set transformOrigin(value) {
        this.setProperty('transform-origin', value);
    }
    get transformStyle() {
        return this.getPropertyValue('transform-style');
    }
    set transformStyle(value) {
        this.setProperty('transform-style', value);
    }
    get transition() {
        return this.getPropertyValue('transition');
    }
    set transition(value) {
        this.setProperty('transition', value);
    }
    get transitionDelay() {
        return this.getPropertyValue('transition-delay');
    }
    set transitionDelay(value) {
        this.setProperty('transition-delay', value);
    }
    get transitionDuration() {
        return this.getPropertyValue('transition-duration');
    }
    set transitionDuration(value) {
        this.setProperty('transition-duration', value);
    }
    get transitionProperty() {
        return this.getPropertyValue('transition-property');
    }
    set transitionProperty(value) {
        this.setProperty('transition-property', value);
    }
    get transitionTimingFunction() {
        return this.getPropertyValue('transition-timing-function');
    }
    set transitionTimingFunction(value) {
        this.setProperty('transition-timing-function', value);
    }
    get textEmphasisColor() {
        return this.getPropertyValue('text-emphasis-color');
    }
    set textEmphasisColor(value) {
        this.setProperty('text-emphasis-color', value);
    }
    get textEmphasisPosition() {
        return this.getPropertyValue('text-emphasis-position');
    }
    set textEmphasisPosition(value) {
        this.setProperty('text-emphasis-position', value);
    }
    get textEmphasisStyle() {
        return this.getPropertyValue('text-emphasis-style');
    }
    set textEmphasisStyle(value) {
        this.setProperty('text-emphasis-style', value);
    }
    get unicodeBidi() {
        return this.getPropertyValue('unicode-bidi');
    }
    set unicodeBidi(value) {
        this.setProperty('unicode-bidi', value);
    }
    get unicodeRange() {
        return this.getPropertyValue('unicode-range');
    }
    set unicodeRange(value) {
        this.setProperty('unicode-range', value);
    }
    get userSelect() {
        return this.getPropertyValue('user-select');
    }
    set userSelect(value) {
        this.setProperty('user-select', value);
    }
    get userZoom() {
        return this.getPropertyValue('user-zoom');
    }
    set userZoom(value) {
        this.setProperty('user-zoom', value);
    }
    get vectorEffect() {
        return this.getPropertyValue('vector-effect');
    }
    set vectorEffect(value) {
        this.setProperty('vector-effect', value);
    }
    get verticalAlign() {
        return this.getPropertyValue('vertical-align');
    }
    set verticalAlign(value) {
        this.setProperty('vertical-align', value);
    }
    get visibility() {
        return this.getPropertyValue('visibility');
    }
    set visibility(value) {
        this.setProperty('visibility', value);
    }
    get whiteSpace() {
        return this.getPropertyValue('white-space');
    }
    set whiteSpace(value) {
        this.setProperty('white-space', value);
    }
    get widows() {
        return this.getPropertyValue('widows');
    }
    set widows(value) {
        this.setProperty('widows', value);
    }
    get width() {
        return this.getPropertyValue('width');
    }
    set width(value) {
        this.setProperty('width', value);
    }
    get willChange() {
        return this.getPropertyValue('will-change');
    }
    set willChange(value) {
        this.setProperty('will-change', value);
    }
    get wordBreak() {
        return this.getPropertyValue('word-break');
    }
    set wordBreak(value) {
        this.setProperty('word-break', value);
    }
    get wordSpacing() {
        return this.getPropertyValue('word-spacing');
    }
    set wordSpacing(value) {
        this.setProperty('word-spacing', value);
    }
    get wordWrap() {
        return this.getPropertyValue('word-wrap');
    }
    set wordWrap(value) {
        this.setProperty('word-wrap', value);
    }
    get writingMode() {
        return this.getPropertyValue('writing-mode');
    }
    set writingMode(value) {
        this.setProperty('writing-mode', value);
    }
    get x() {
        return this.getPropertyValue('x');
    }
    set x(value) {
        this.setProperty('x', value);
    }
    get y() {
        return this.getPropertyValue('y');
    }
    set y(value) {
        this.setProperty('y', value);
    }
    get zIndex() {
        return this.getPropertyValue('z-index');
    }
    set zIndex(value) {
        this.setProperty('z-index', value);
    }
    get zoom() {
        return this.getPropertyValue('zoom');
    }
    set zoom(value) {
        this.setProperty('zoom', value);
    }
    get containerType() {
        return this.getPropertyValue('container-type');
    }
    set containerType(value) {
        this.setProperty('container-type', value);
    }
    get containerName() {
        return this.getPropertyValue('container-name');
    }
    set containerName(value) {
        this.setProperty('container-name', value);
    }
    get aspectRatio() {
        return this.getPropertyValue('aspect-ratio');
    }
    set aspectRatio(value) {
        this.setProperty('aspect-ratio', value);
    }
    /* eslint-enable jsdoc/require-jsdoc */ /**
     * Returns length.
     *
     * @returns Length.
     */ get length() {
        return this.#getPropertyManager().size();
    }
    /**
     * Returns the style decleration as a CSS text.
     *
     * @returns CSS text.
     */ get cssText() {
        if (this.#element && this.#computed) {
            return '';
        }
        return this.#getPropertyManager().toString();
    }
    /**
     * Sets CSS text.
     *
     * @param cssText CSS text.
     */ set cssText(cssText) {
        if (this.#computed) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'cssText' on 'CSSStyleDeclaration': These styles are computed, and the properties are therefore read-only.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].domException);
        }
        if (this.#element) {
            this.#cache.propertyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                cssText
            });
            this.#cache.attributeValue = cssText;
            this.#element.setAttribute('style', this.#cache.propertyManager.toString());
        } else {
            this.#cache.propertyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                cssText
            });
        }
    }
    /**
     * Returns item.
     *
     * @param index Index.
     * @returns Item.
     */ item(index) {
        return this.#getPropertyManager().item(index);
    }
    /**
     * Set a property.
     *
     * @param name Property name.
     * @param value Value. Must not contain "!important" as that should be set using the priority parameter.
     * @param [priority] Can be "important", or an empty string.
     */ setProperty(name, value, priority) {
        if (this.#computed) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'setProperty' on 'CSSStyleDeclaration': These styles are computed, and therefore the '${name}' property is read-only.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].domException);
        }
        if (priority !== '' && priority !== undefined && priority !== 'important') {
            return;
        }
        const stringValue = String(value).trim();
        const propertyManager = this.#getPropertyManager();
        if (stringValue) {
            propertyManager.set(name, stringValue, !!priority);
        } else {
            propertyManager.remove(name);
        }
        if (this.#element) {
            this.#cache.attributeValue = propertyManager.toString();
            if (this.#cache.attributeValue) {
                this.#element.setAttribute('style', this.#cache.attributeValue);
            } else {
                this.#element.removeAttribute('style');
            }
        }
    }
    /**
     * Removes a property.
     *
     * @param name Property name in kebab case.
     * @param value Value. Must not contain "!important" as that should be set using the priority parameter.
     * @param [priority] Can be "important", or an empty string.
     */ removeProperty(name) {
        if (this.#computed) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeProperty' on 'CSSStyleDeclaration': These styles are computed, and therefore the '${name}' property is read-only.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].domException);
        }
        const propertyManager = this.#getPropertyManager();
        propertyManager.remove(name);
        if (this.#element) {
            this.#cache.attributeValue = propertyManager.toString();
            if (this.#cache.attributeValue) {
                this.#element.setAttribute('style', this.#cache.attributeValue);
            } else {
                this.#element.removeAttribute('style');
            }
        }
    }
    /**
     * Returns a property.
     *
     * @param name Property name in kebab case.
     * @returns Property value.
     */ getPropertyValue(name) {
        return this.#getPropertyManager().get(name)?.value || '';
    }
    /**
     * Returns a property.
     *
     * @param name Property name in kebab case.
     * @returns "important" if set to be important.
     */ getPropertyPriority(name) {
        return this.#getPropertyManager().get(name)?.important ? 'important' : '';
    }
    /**
     * Returns property manager.
     *
     * @returns Property manager.
     */ #getPropertyManager() {
        const element = this.#element;
        const cache = this.#cache;
        if (!element) {
            if (!cache.propertyManager) {
                cache.propertyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
            }
            return cache.propertyManager;
        }
        if (this.#computed) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$computed$2d$style$2f$CSSStyleDeclarationComputedStyle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](element).getComputedStyle();
        }
        const attributeValue = element.getAttribute('style') || '';
        if (cache.attributeValue !== attributeValue) {
            cache.propertyManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$property$2d$manager$2f$CSSStyleDeclarationPropertyManager$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                cssText: attributeValue
            });
        }
        return cache.propertyManager;
    }
} //# sourceMappingURL=CSSStyleDeclaration.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSConditionRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSConditionRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSGroupingRule.js [app-ssr] (ecmascript)");
;
;
class CSSConditionRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = '';
    /**
     * Returns condition text.
     *
     * @returns Condition text.
     */ get conditionText() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]];
    }
} //# sourceMappingURL=CSSConditionRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSContainerRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSContainerRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSConditionRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class CSSContainerRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["type"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = '';
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule;
    }
    /**
     * @override
     */ get cssText() {
        let cssText = '';
        for (const cssRule of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]]){
            cssText += '\n  ' + cssRule.cssText;
        }
        cssText += '\n';
        return `@${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]]}container ${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]]} {${cssText}}`;
    }
} //# sourceMappingURL=CSSContainerRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSFontFaceRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSFontFaceRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/CSSStyleDeclaration.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
;
;
;
;
class CSSFontFaceRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = '';
    #style = null;
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fontFaceRule;
    }
    /**
     * @override
     */ get cssText() {
        return `@font-face { ${this.style.cssText} }`;
    }
    /**
     * Returns style.
     *
     * @returns Style.
     */ get style() {
        if (!this.#style) {
            this.#style = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
            this.#style.parentRule = this;
            this.#style.cssText = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]];
        }
        return this.#style;
    }
} //# sourceMappingURL=CSSFontFaceRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframeRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSKeyframeRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/CSSStyleDeclaration.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
;
;
;
;
class CSSKeyframeRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = '';
    #style = null;
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframeRule;
    }
    /**
     * @override
     */ get cssText() {
        return `${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]]} { ${this.style.cssText} }`;
    }
    /**
     * Returns style.
     *
     * @returns Style.
     */ get style() {
        if (!this.#style) {
            this.#style = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
            this.#style.parentRule = this;
            this.#style.cssText = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]];
        }
        return this.#style;
    }
    /**
     * Returns key text.
     *
     * @returns Key text.
     */ get keyText() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]];
    }
} //# sourceMappingURL=CSSKeyframeRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframesRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSKeyframesRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframeRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
;
;
;
;
;
const CSS_RULE_REGEXP = /^(from|to|[0-9]{1,3}%)\s*{([^}]*)}$/;
class CSSKeyframesRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]] = [];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = '';
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframesRule;
    }
    /**
     * @override
     */ get cssText() {
        let cssText = '';
        for (const cssRule of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]]){
            cssText += '\n  ' + cssRule.cssText;
        }
        cssText += '\n';
        return `@${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]]}keyframes ${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]} { ${cssText}}`;
    }
    /**
     * Returns CSS rules.
     *
     * @returns CSS rules.
     */ get cssRules() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]];
    }
    /**
     * Returns name.
     *
     * @returns Name.
     */ get name() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]];
    }
    /**
     * Returns length.
     *
     * @returns Length.
     */ get length() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]].length;
    }
    /**
     * Appends a rule.
     *
     * @param rule Rule. E.g. "0% { transform: rotate(360deg); }".
     */ appendRule(rule) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendRule' on 'CSSKeyframesRule': 1 argument required, but only 0 present.`);
        }
        const match = String(rule).trim().match(CSS_RULE_REGEXP);
        if (!match) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Invalid or unexpected token`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
        }
        const cssRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssParser"]]);
        let keyText = match[1].trim();
        if (keyText === 'from') {
            keyText = '0%';
        } else if (keyText === 'to') {
            keyText = '100%';
        }
        cssRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]] = this;
        cssRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]] = keyText;
        cssRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = match[2].trim();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]].push(cssRule);
    }
    /**
     * Removes a rule.
     *
     * @param rule Rule. E.g. "0%".
     */ deleteRule(rule) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'deleteRule' on 'CSSKeyframesRule': 1 argument required, but only 0 present.`);
        }
        for(let i = 0, max = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]].length; i < max; i++){
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]][i][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]] === rule) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]].splice(i, 1);
                return;
            }
        }
    }
    /**
     * Finds a rule.
     *
     * @param rule Rule. E.g. "0%".
     * @returns Rule.
     */ findRule(rule) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'findRule' on 'CSSKeyframesRule': 1 argument required, but only 0 present.`);
        }
        for(let i = 0, max = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]].length; i < max; i++){
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]][i][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]] === rule) {
                return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]][i];
            }
        }
        return null;
    }
} //# sourceMappingURL=CSSKeyframesRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/MediaList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MediaList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
;
;
const MEDIUM_REGEXP = /\s*,\s*/;
class MediaList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]];
    /**
     *
     * @param illegalConstructorSymbol
     * @param cssRule
     */ constructor(illegalConstructorSymbol, cssRule){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]] = cssRule;
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            MediaList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property in target || typeof property === 'symbol') {
                    methodBinder.bind(property);
                    return target[property];
                }
                const index = Number(property);
                if (!isNaN(index)) {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]()[index];
                }
            },
            set (target, property, newValue) {
                methodBinder.bind(property);
                if (property in target || typeof property === 'symbol') {
                    target[property] = newValue;
                    return true;
                }
                return true;
            },
            deleteProperty (target, property) {
                if (property in target || typeof property === 'symbol') {
                    delete target[property];
                    return true;
                }
                return true;
            },
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (typeof property === 'symbol') {
                    return false;
                }
                if (property in target) {
                    return true;
                }
                const index = Number(property);
                return !isNaN(index) && index >= 0 && index < target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
            },
            defineProperty (target, property, descriptor) {
                methodBinder.preventBinding(property);
                if (property in target) {
                    Object.defineProperty(target, property, descriptor);
                    return true;
                }
                return false;
            },
            getOwnPropertyDescriptor (target, property) {
                if (property in target || typeof property === 'symbol') {
                    return;
                }
                const index = Number(property);
                const items = target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
                if (!isNaN(index) && items[index]) {
                    return {
                        value: items[index],
                        writable: false,
                        enumerable: true,
                        configurable: true
                    };
                }
            }
        });
    }
    /**
     * Returns length.
     *
     * @returns Length.
     */ get length() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns media text.
     *
     * @returns Media text.
     */ get mediaText() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]];
    }
    /**
     * Sets media text.
     *
     * @param mediaText Media text.
     */ set mediaText(mediaText) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = mediaText === null ? '' : String(mediaText).split(MEDIUM_REGEXP).join(', ');
    }
    /**
     * Returns item.
     *
     * @param index Index.
     * @returns Item.
     */ item(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        return items[Number(index)] || null;
    }
    /**
     * Appends a medium.
     *
     * @param medium Medium.
     */ appendMedium(medium) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (items.indexOf(medium) === -1) {
            items.push(medium);
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = items.join(', ');
        }
    }
    /**
     * Deletes a medium.
     *
     * @param medium Medium.
     */ deleteMedium(medium) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const index = items.indexOf(medium);
        if (index !== -1) {
            items.splice(index, 1);
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = items.join(', ');
        }
    }
    /**
     * Returns item list.
     *
     * @returns Item list.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const text = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]].trim();
        const media = text ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRule"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]].split(MEDIUM_REGEXP) : [];
        return media;
    }
} //# sourceMappingURL=MediaList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSMediaRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSMediaRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$MediaList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/MediaList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSConditionRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
;
class CSSMediaRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["media"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$MediaList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this);
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule;
    }
    /**
     * @override
     */ get cssText() {
        let cssText = '';
        for (const cssRule of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]]){
            cssText += '\n  ' + cssRule.cssText;
        }
        cssText += cssText ? '\n' : '  ';
        return `@media ${this.conditionText} {${cssText}}`;
    }
    /**
     * Returns media.
     *
     * @returns Media.
     */ get media() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["media"]];
    }
    /**
     * Returns conditional text.
     *
     * @returns Conditional text.
     */ get conditionText() {
        return this.media.mediaText;
    }
} //# sourceMappingURL=CSSMediaRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSKeywordValue.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CSSKeywordValue interface.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSKeywordValue
 */ __turbopack_context__.s([
    "default",
    ()=>CSSKeywordValue
]);
class CSSKeywordValue {
    #value;
    /**
     * Constructor.
     *
     * @param value Value..
     */ constructor(value){
        this.#value = value;
    }
    /**
     * Returns value.
     *
     * @returns Value.
     */ get value() {
        return this.#value;
    }
    /**
     * Sets value.
     *
     * @param value Value.
     */ set value(value) {
        this.#value = value;
    }
} //# sourceMappingURL=CSSKeywordValue.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSStyleValue.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class CSSStyleValue {
    #style;
    #property;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol
     * @param style Style.
     * @param property Property.
     */ constructor(illegalConstructorSymbol, style, property){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this.#style = style;
        this.#property = property;
    }
    /**
     * Returns value as string.
     *
     * @returns Value.
     */ toString() {
        return this.#style.getPropertyValue(this.#property);
    }
} //# sourceMappingURL=CSSStyleValue.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMapReadOnly.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StylePropertyMapReadOnly
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSKeywordValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSKeywordValue.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSStyleValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/CSSStyleValue.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class StylePropertyMapReadOnly {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param style Style.
     */ constructor(illegalConstructorSymbol, style){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]] = style;
    }
    /**
     * Returns size.
     *
     * @returns Size.
     */ get size() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     *
     * @returns Iterator.
     */ [Symbol.iterator]() {
        return this.entries();
    }
    /**
     * Returns an iterator, allowing you to go through all key/value pairs contained in this object.
     *
     * @returns Entries.
     */ entries() {
        const length = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].length;
        const array = new Array(length);
        for(let i = 0; i < length; i++){
            const property = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]][i];
            array[i] = [
                property,
                [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSKeywordValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].getPropertyValue(property))
                ]
            ];
        }
        return array.values();
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     *
     * @returns Values.
     */ values() {
        const length = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].length;
        const array = new Array(length);
        for(let i = 0; i < length; i++){
            const property = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]][i];
            array[i] = [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSKeywordValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].getPropertyValue(property))
            ];
        }
        return array.values();
    }
    /**
     * Returns an iterator, allowing you to go through all keys of the key/value pairs contained in this object.
     *
     * @returns Keys.
     */ keys() {
        const length = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].length;
        const array = new Array(length);
        for(let i = 0; i < length; i++){
            array[i] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]][i];
        }
        return array.values();
    }
    /**
     * Returns a property value.
     *
     * @param property Property.
     * @returns Value.
     */ get(property) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSStyleValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]], property);
    }
    /**
     * Returns array of property values.
     *
     * @param property Property.
     * @returns Values.
     */ getAll(property) {
        return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$CSSStyleValue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]], property)
        ];
    }
    /**
     * Checks if a property is present.
     *
     * @param property Property.
     * @returns True if the property is present.
     */ has(property) {
        return !!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].getPropertyValue(property);
    }
} //# sourceMappingURL=StylePropertyMapReadOnly.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMap.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StylePropertyMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMapReadOnly$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMapReadOnly.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class StylePropertyMap extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMapReadOnly$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    /**
     * Appends a property.
     *
     * @param property Property.
     * @param value Value.
     */ append(property, value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].setProperty(property, value);
    }
    /**
     * Clears all properties.
     */ clear() {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].cssText = '';
    }
    /**
     * Deletes a property.
     *
     * @param property Property.
     */ delete(property) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].removeProperty(property);
    }
    /**
     * Sets a property.
     *
     * @param property Property.
     * @param value Value.
     */ set(property, value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["style"]].setProperty(property, value);
    }
} //# sourceMappingURL=StylePropertyMap.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSStyleRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/declaration/CSSStyleDeclaration.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSGroupingRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/style-property-map/StylePropertyMap.js [app-ssr] (ecmascript)");
;
;
;
;
;
class CSSStyleRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSGroupingRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["styleMap"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectorText"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = '';
    #style = null;
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].styleRule;
    }
    /**
     * @override
     */ get cssText() {
        return `${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectorText"]]} { ${this.style.cssText} }`;
    }
    /**
     * Returns style map.
     *
     * @returns Style map.
     */ get styleMap() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["styleMap"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["styleMap"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$style$2d$property$2d$map$2f$StylePropertyMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this.style);
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["styleMap"]];
    }
    /**
     * Returns selector text.
     *
     * @returns Selector text.
     */ get selectorText() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectorText"]];
    }
    /**
     * Returns style.
     *
     * @returns Style.
     */ get style() {
        if (!this.#style) {
            this.#style = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$declaration$2f$CSSStyleDeclaration$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
            this.#style.parentRule = this;
            this.#style.cssText = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]];
        }
        return this.#style;
    }
} //# sourceMappingURL=CSSStyleRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSSupportsRule.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSSupportsRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSConditionRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class CSSSupportsRule extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSConditionRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["type"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = '';
    /**
     * @override
     */ get type() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule;
    }
    /**
     * @override
     */ get cssText() {
        let cssText = '';
        for (const cssRule of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssRules"]]){
            cssText += '\n  ' + cssRule.cssText;
        }
        cssText += '\n';
        return `@${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]]}supports ${this.conditionText} {${cssText}}`;
    }
} //# sourceMappingURL=CSSSupportsRule.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/utilities/CSSParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSStyleRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframeRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframesRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSKeyframesRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSMediaRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSMediaRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSContainerRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSContainerRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSSupportsRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSSupportsRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSFontFaceRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSFontFaceRule.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$SelectorParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/query-selector/SelectorParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSRuleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/rules/CSSScopeRule.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const COMMENT_REGEXP = /\/\*[\s\S]*?\*\//gm;
class CSSParser {
    #parentStyleSheet;
    /**
     * Constructor.
     *
     * @param parentStyleSheet Parent style sheet.
     */ constructor(parentStyleSheet){
        this.#parentStyleSheet = parentStyleSheet;
    }
    /**
     * Parses HTML and returns a root element.
     *
     * @param cssText CSS code.
     * @returns CSS rules.
     */ parseFromString(cssText) {
        const parentStyleSheet = this.#parentStyleSheet;
        const window = parentStyleSheet[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const css = cssText.replace(COMMENT_REGEXP, '');
        const cssRules = [];
        const regExp = /{|}/gm;
        const stack = [];
        let parentRule = null;
        let lastIndex = 0;
        let match;
        while(match = regExp.exec(css)){
            if (match[0] === '{') {
                const selectorText = css.substring(lastIndex, match.index).trim();
                if (selectorText[0] === '@') {
                    const ruleParts = selectorText.split(' ');
                    const ruleType = ruleParts[0];
                    const ruleParameters = ruleParts.slice(1).join(' ').trim();
                    switch(ruleType){
                        case '@keyframes':
                        case '@-webkit-keyframes':
                            const keyframesRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframesRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            keyframesRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = ruleType === '@-webkit-keyframes' ? '-webkit-' : '';
                            keyframesRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] = ruleParameters;
                            keyframesRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(keyframesRule);
                                }
                            } else {
                                cssRules.push(keyframesRule);
                            }
                            parentRule = keyframesRule;
                            break;
                        case '@media':
                            const mediums = ruleParameters.split(',');
                            const mediaRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSMediaRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            for (const medium of mediums){
                                mediaRule.media.appendMedium(medium.trim());
                            }
                            mediaRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(mediaRule);
                                }
                            } else {
                                cssRules.push(mediaRule);
                            }
                            parentRule = mediaRule;
                            break;
                        case '@container':
                        case '@-webkit-container':
                            const containerRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSContainerRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            containerRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = ruleType === '@-webkit-container' ? '-webkit-' : '';
                            containerRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = ruleParameters;
                            containerRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(containerRule);
                                }
                            } else {
                                cssRules.push(containerRule);
                            }
                            parentRule = containerRule;
                            break;
                        case '@supports':
                        case '@-webkit-supports':
                            const supportsRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSSupportsRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            supportsRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = ruleType === '@-webkit-supports' ? '-webkit-' : '';
                            supportsRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["conditionText"]] = ruleParameters;
                            supportsRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(supportsRule);
                                }
                            } else {
                                cssRules.push(supportsRule);
                            }
                            parentRule = supportsRule;
                            break;
                        case '@font-face':
                            const fontFaceRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSFontFaceRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            fontFaceRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = ruleParameters;
                            fontFaceRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(fontFaceRule);
                                }
                            } else {
                                cssRules.push(fontFaceRule);
                            }
                            parentRule = fontFaceRule;
                            break;
                        case '@scope':
                        case '@-webkit-scope':
                            const scopeRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSScopeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            scopeRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rulePrefix"]] = ruleType === '@-webkit-scope' ? '-webkit-' : '';
                            scopeRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            if (ruleParameters) {
                                const scopeRuleParts = ruleParameters.split(/\s+to\s+/);
                                if (scopeRuleParts[0] && scopeRuleParts[0][0] === '(' && scopeRuleParts[0][scopeRuleParts[0].length - 1] === ')') {
                                    scopeRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["start"]] = scopeRuleParts[0].slice(1, -1);
                                }
                                if (scopeRuleParts[1] && scopeRuleParts[1][0] === '(' && scopeRuleParts[1][scopeRuleParts[1].length - 1] === ')') {
                                    scopeRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["end"]] = scopeRuleParts[1].slice(1, -1);
                                }
                            }
                            if (parentRule) {
                                if (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule) {
                                    parentRule.cssRules.push(scopeRule);
                                }
                            } else {
                                cssRules.push(scopeRule);
                            }
                            parentRule = scopeRule;
                            break;
                        default:
                            // Unknown rule.
                            // We will create a new rule to let it grab its content, but we will not add it to the cssRules array.
                            const newRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                            newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                            parentRule = newRule;
                            break;
                    }
                } else if (parentRule && parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframesRule) {
                    const newRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSKeyframeRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                    let keyText = selectorText.trim();
                    if (keyText === 'from') {
                        keyText = '0%';
                    } else if (keyText === 'to') {
                        keyText = '100%';
                    }
                    newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["keyText"]] = keyText;
                    newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                    newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]] = parentRule;
                    parentRule.cssRules.push(newRule);
                    parentRule = newRule;
                } else if (parentRule && (parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mediaRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].containerRule || parentRule.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].supportsRule)) {
                    if (this.validateSelectorText(selectorText)) {
                        const newRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectorText"]] = selectorText;
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]] = parentRule;
                        parentRule.cssRules.push(newRule);
                        parentRule = newRule;
                    }
                } else {
                    if (this.validateSelectorText(selectorText)) {
                        const newRule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$rules$2f$CSSStyleRule$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], window, this);
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectorText"]] = selectorText;
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentStyleSheet"]] = parentStyleSheet;
                        newRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentRule"]] = parentRule;
                        if (!parentRule) {
                            cssRules.push(newRule);
                        }
                        parentRule = newRule;
                    }
                }
                if (parentRule) {
                    stack.push(parentRule);
                }
            } else {
                if (parentRule) {
                    const cssText = css.substring(lastIndex, match.index).trim().replace(/([^;])$/, '$1;'); // Ensure last semicolon
                    switch(parentRule.type){
                        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fontFaceRule:
                        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].keyframeRule:
                        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$CSSRuleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].styleRule:
                            parentRule[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cssText"]] = cssText;
                            break;
                    }
                }
                stack.pop();
                parentRule = stack[stack.length - 1] || null;
            }
            lastIndex = match.index + 1;
        }
        return cssRules;
    }
    /**
     * Validates a selector text.
     *
     * @see https://www.w3.org/TR/CSS21/syndata.html#rule-sets
     * @param selectorText Selector text.
     * @returns True if valid, false otherwise.
     */ validateSelectorText(selectorText) {
        const window = this.#parentStyleSheet[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$SelectorParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            window,
            scope: window.document,
            ignoreErrors: true
        }).getSelectorGroups(selectorText).length > 0;
    }
} //# sourceMappingURL=CSSParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/CSSStyleSheet.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CSSStyleSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$utilities$2f$CSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/css/utilities/CSSParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class CSSStyleSheet {
    cssRules = [];
    // TODO: MediaList is not fully implemented.
    media;
    title;
    alternate;
    disabled;
    #currentText = null;
    /**
     * Constructor.
     *
     * @param [options] Options.
     * @param [options.media] Media.
     * @param [options.title] Title.
     * @param [options.alternate] Alternate.
     * @param [options.disabled] Disabled.
     */ constructor(options){
        this.media = options && options.media ? options.media : '';
        this.title = options && options.title ? options.title : '';
        this.alternate = options && options.alternate ? options.alternate : false;
        this.disabled = options && options.disabled ? options.disabled : false;
    }
    /**
     * Inserts a rule.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
     * @param rule Rule.
     * @param [index] Index.
     * @returns The newly inserterted rule's index.
     */ insertRule(rule, index) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertRule' on 'CSSStyleSheet': 1 argument required, but only 0 present.`);
        }
        const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$utilities$2f$CSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
        const rules = parser.parseFromString(rule);
        if (rules.length === 0 || rules.length > 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'insertRule' on 'CSSStyleSheet': Failed to parse the rule '${rule}'.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
        }
        if (index !== undefined) {
            if (index > this.cssRules.length) {
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'insertRule' on 'CSSStyleSheet': The index provided (${index}) is larger than the maximum index (${this.cssRules.length - 1}).`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
            }
            this.cssRules.splice(index, 0, rules[0]);
            return index;
        }
        const newIndex = this.cssRules.length;
        this.cssRules.push(rules[0]);
        return newIndex;
    }
    /**
     * Removes a rule.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/deleteRule
     * @param index Index.
     */ deleteRule(index) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'deleteRule' on 'CSSStyleSheet': 1 argument required, but only 0 present.`);
        }
        this.cssRules.splice(index, 1);
    }
    /**
     * Replaces all CSS rules.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/replace
     * @param text CSS text.
     * @returns Promise.
     */ async replace(text) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replace' on 'CSSStyleSheet': 1 argument required, but only 0 present.`);
        }
        this.replaceSync(text);
    }
    /**
     * Replaces all CSS rules.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/replaceSync
     * @param text CSS text.
     */ replaceSync(text) {
        if (arguments.length === 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceSync' on 'CSSStyleSheet': 1 argument required, but only 0 present.`);
        }
        if (this.#currentText !== text) {
            this.#currentText = text;
            this.cssRules = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$css$2f$utilities$2f$CSSParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this).parseFromString(text);
        }
    }
} //# sourceMappingURL=CSSStyleSheet.js.map
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_css_ca1b0551._.js.map