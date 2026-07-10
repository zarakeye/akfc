module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/HTMLCollection.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HTMLCollection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class HTMLCollection {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param query Query function.
     */ constructor(illegalConstructorSymbol, query){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]] = query;
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, this.constructor !== HTMLCollection ? [
            this.constructor,
            HTMLCollection
        ] : [
            HTMLCollection
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length') {
                    return query().length;
                }
                if (property in target || typeof property === 'symbol') {
                    methodBinder.bind(property);
                    return target[property];
                }
                const index = Number(property);
                if (!isNaN(index)) {
                    return query()[index];
                }
                return target.namedItem(property) || undefined;
            },
            set (target, property, newValue) {
                methodBinder.bind(property);
                if (typeof property === 'symbol') {
                    target[property] = newValue;
                    return true;
                }
                const index = Number(property);
                if (isNaN(index)) {
                    target[property] = newValue;
                }
                return true;
            },
            deleteProperty (target, property) {
                if (typeof property === 'symbol') {
                    delete target[property];
                    return true;
                }
                const index = Number(property);
                if (isNaN(index)) {
                    delete target[property];
                }
                return true;
            },
            ownKeys () {
                const keys = [];
                const items = query();
                for(let i = 0; i < items.length; i++){
                    const item = items[i];
                    const name = item.getAttribute('id') || item.getAttribute('name');
                    keys.push(String(i));
                    if (name) {
                        keys.push(name);
                    }
                }
                return keys;
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                const items = query();
                const index = Number(property);
                if (!isNaN(index) && index >= 0 && index < items.length) {
                    return true;
                }
                property = String(property);
                for(let i = 0; i < items.length; i++){
                    const item = items[i];
                    const name = item.getAttribute('id') || item.getAttribute('name');
                    if (name && name === property) {
                        return true;
                    }
                }
                return false;
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
                const items = query();
                const index = Number(property);
                if (!isNaN(index) && index >= 0 && index < items.length) {
                    return {
                        value: items[index],
                        writable: false,
                        enumerable: true,
                        configurable: true
                    };
                }
                for(let i = 0; i < items.length; i++){
                    const item = items[i];
                    const name = item.getAttribute('id') || item.getAttribute('name');
                    if (name && name === property) {
                        return {
                            value: item,
                            writable: false,
                            enumerable: true,
                            configurable: true
                        };
                    }
                }
            }
        });
    }
    /**
     * Returns length.
     *
     * @returns Length.
     */ get length() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]]().length;
    }
    /**
     * Returns `Symbol.toStringTag`.
     *
     * @returns `Symbol.toStringTag`.
     */ get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
    /**
     * Returns `[object HTMLCollection]`.
     *
     * @returns `[object HTMLCollection]`.
     */ toLocaleString() {
        return `[object ${this.constructor.name}]`;
    }
    /**
     * Returns `[object HTMLCollection]`.
     *
     * @returns `[object HTMLCollection]`.
     */ toString() {
        return `[object ${this.constructor.name}]`;
    }
    /**
     * Returns item by index.
     *
     * @param index Index.
     */ item(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]]();
        return index >= 0 && items[index] ? items[index] : null;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     *
     * @returns Iterator.
     */ [Symbol.iterator]() {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]]();
        return items[Symbol.iterator]();
    }
    /**
     * Returns named item.
     *
     * @param name Name.
     * @returns Node.
     */ namedItem(name) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"]]();
        name = String(name);
        for (const item of items){
            if (item.getAttribute('id') === name || item.getAttribute('name') === name) {
                return item;
            }
        }
        return null;
    }
} //# sourceMappingURL=HTMLCollection.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMap.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NamedNodeMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$attr$2f$Attr$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/attr/Attr.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/config/NamespaceURI.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$StringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/StringUtility.js [app-ssr] (ecmascript)");
;
;
;
;
;
class NamedNodeMap {
    // Items by attribute namespaceURI
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByNamespaceURI"]] = new Map();
    // Items by attribute name
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]] = new Map();
    // All items
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]] = new Map();
    /**
     * Constructor.
     *
     * @param ownerElement Owner element.
     */ constructor(ownerElement){
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] = ownerElement;
    }
    /**
     * Returns length.
     *
     * @returns Length.
     */ get length() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].size;
    }
    /**
     * Returns string.
     *
     * @returns string.
     */ get [Symbol.toStringTag]() {
        return 'NamedNodeMap';
    }
    /**
     * Returns string.
     *
     * @returns string.
     */ toString() {
        return '[object NamedNodeMap]';
    }
    /**
     * Iterator.
     *
     * @returns Iterator.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].values();
    }
    /**
     * Returns item by index.
     *
     * @param index Index.
     */ item(index) {
        const items = Array.from(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].values());
        return index >= 0 && items[index] ? items[index] : null;
    }
    /**
     * Returns named item.
     *
     * @param name Name.
     * @returns Item.
     */ getNamedItem(name) {
        name = String(name);
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].html && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] === 'text/html') {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].get(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$StringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].asciiLowerCase(name))?.[0] || null;
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].get(name)?.[0] || null;
    }
    /**
     * Returns item by name and namespace.
     *
     * @param namespace Namespace.
     * @param localName Local name of the attribute.
     * @returns Item.
     */ getNamedItemNS(namespace, localName) {
        const item = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByNamespaceURI"]].get(`${namespace || ''}:${localName}`);
        // It seems like an item cant have a prefix without a namespaceURI
        // E.g. element.setAttribute('ns1:key', 'value1');
        // expect(element.attributes.getNamedItemNS(null, 'key')).toBeNull();
        if (item && (!item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefix"]] || item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]])) {
            return item;
        }
        return null;
    }
    /**
     * Sets named item.
     *
     * @param item Item.
     * @returns Replaced item.
     */ setNamedItem(item) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setNamedItem"]](item);
    }
    /**
     * Adds a new namespaced item.
     *
     * @alias setNamedItem()
     * @param item Item.
     * @returns Replaced item.
     */ setNamedItemNS(item) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setNamedItem"]](item);
    }
    /**
     * Removes an item.
     *
     * @throws DOMException
     * @param name Name of item.
     * @returns Removed item.
     */ removeNamedItem(name) {
        const item = this.getNamedItem(name);
        if (!item) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeNamedItem' on 'NamedNodeMap': No item with name '${name}' was found.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notFoundError);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](item);
        return item;
    }
    /**
     * Removes a namespaced item.
     *
     * @param namespace Namespace.
     * @param localName Local name of the item.
     * @returns Removed item.
     */ removeNamedItemNS(namespace, localName) {
        const item = this.getNamedItemNS(namespace, localName);
        if (!item) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeNamedItemNS' on 'NamedNodeMap': No item with name '${localName}' in namespace '${namespace}' was found.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notFoundError);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](item);
        return item;
    }
    /**
     * Sets named item.
     *
     * @param item Item.
     * @param [ignoreListeners] Ignore listeners.
     * @returns Replaced item.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setNamedItem"]](item, ignoreListeners = false) {
        if (item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] !== null && item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] !== this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException('The attribute is in use.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].inUseAttributeError);
        }
        item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]];
        const replacedItem = this.getNamedItemNS(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]], item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]]) || null;
        const itemsByName = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].get(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]);
        if (replacedItem === item) {
            return item;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByNamespaceURI"]].set(`${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] || ''}:${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]]}`, item);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].set(`${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] || ''}:${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]}`, item);
        if (!itemsByName?.length) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].set(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]], [
                item
            ]);
        } else {
            const index = itemsByName.indexOf(replacedItem);
            if (index !== -1) {
                itemsByName.splice(index, 1);
            }
            itemsByName.push(item);
        }
        if (!ignoreListeners) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSetAttribute"]](item, replacedItem);
        }
        return replacedItem;
    }
    /**
     * Removes named item.
     *
     * @param item Item.
     * @param ignoreListeners
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](item, ignoreListeners = false) {
        item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByNamespaceURI"]].delete(`${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] || ''}:${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]]}`);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].delete(`${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] || ''}:${item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]}`);
        const itemsByName = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].get(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]);
        if (itemsByName?.length) {
            const index = itemsByName.indexOf(item);
            if (index !== -1) {
                itemsByName.splice(index, 1);
            }
            if (!itemsByName.length) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].delete(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]);
            }
        }
        if (!ignoreListeners) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onRemoveAttribute"]](item);
        }
    }
} //# sourceMappingURL=NamedNodeMap.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMapProxyFactory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* eslint-disable filenames/match-exported */ __turbopack_context__.s([
    "default",
    ()=>NamedNodeMapProxyFactory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMap.js [app-ssr] (ecmascript)");
;
;
;
class NamedNodeMapProxyFactory {
    /**
     * Constructor.
     *
     * @param namedNodeMap
     */ static createProxy(namedNodeMap) {
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        ]);
        return new Proxy(namedNodeMap, {
            get: (target, property)=>{
                if (property === 'length') {
                    return namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].size;
                }
                if (property in target || typeof property === 'symbol') {
                    methodBinder.bind(property);
                    return target[property];
                }
                const index = Number(property);
                if (!isNaN(index)) {
                    return target.item(index);
                }
                return target.getNamedItem(property) || undefined;
            },
            set (target, property, newValue) {
                methodBinder.bind(property);
                if (typeof property === 'symbol') {
                    target[property] = newValue;
                    return true;
                }
                const index = Number(property);
                if (isNaN(index)) {
                    target[property] = newValue;
                }
                return true;
            },
            deleteProperty (target, property) {
                if (typeof property === 'symbol') {
                    delete target[property];
                    return true;
                }
                const index = Number(property);
                if (isNaN(index)) {
                    delete target[property];
                }
                return true;
            },
            ownKeys () {
                const keys = Array.from(namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].keys());
                for(let i = 0, max = namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].size; i < max; i++){
                    keys.push(String(i));
                }
                return keys;
            },
            has (target, property) {
                if (typeof property === 'symbol') {
                    return false;
                }
                if (property in target || namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].has(property)) {
                    return true;
                }
                const index = Number(property);
                if (!isNaN(index) && index >= 0 && index < namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].size) {
                    return true;
                }
                return false;
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
                if (!isNaN(index)) {
                    if (index >= 0) {
                        const itemByIndex = target.item(index);
                        if (itemByIndex) {
                            return {
                                value: itemByIndex,
                                writable: false,
                                enumerable: true,
                                configurable: true
                            };
                        }
                    }
                    return;
                }
                const items = namedNodeMap[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].get(property);
                if (items) {
                    return {
                        value: items,
                        writable: false,
                        enumerable: true,
                        configurable: true
                    };
                }
            }
        });
    }
} //# sourceMappingURL=NamedNodeMapProxyFactory.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/ElementEventAttributeUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ElementEventAttributeUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/browser/enums/BrowserErrorCaptureEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
class ElementEventAttributeUtility {
    /**
     * Evaluates code in attribute and returns event listener.
     *
     * @param element
     * @param property Property.
     * @returns Result.
     */ static getEventListener(element, property) {
        const cached = element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].get(property);
        if (cached) {
            return cached;
        }
        const window = element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultView"]];
        if (!window) {
            return null;
        }
        const browserSettings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getSettings();
        if (!browserSettings || !browserSettings.enableJavaScriptEvaluation) {
            return null;
        }
        const code = element.getAttribute(property);
        if (!code) {
            return null;
        }
        let newCode = `(function anonymous($happy_dom, event) {`;
        if (browserSettings && !browserSettings.disableErrorCapturing && browserSettings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tryAndCatch) {
            newCode += 'try {\n';
        }
        newCode += code;
        if (browserSettings && !browserSettings.disableErrorCapturing && browserSettings.errorCapture === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tryAndCatch) {
            newCode += '} catch(e) { $happy_dom.dispatchError(e); }';
        }
        newCode += '})';
        let listener = null;
        try {
            listener = window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["evaluateScript"]](newCode, {
                filename: window.location.href
            }).bind(element, {
                dispatchError: window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dispatchError"]].bind(window)
            });
        } catch (e) {
            const error = new window.SyntaxError(`Failed to read the '${property}' property from '${element.constructor.name}': ${e.message}`);
            if (browserSettings.disableErrorCapturing || browserSettings.errorCapture !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$browser$2f$enums$2f$BrowserErrorCaptureEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].tryAndCatch) {
                throw error;
            } else {
                window[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dispatchError"]](error);
                return null;
            }
        }
        if (listener) {
            element[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set(property, listener);
        }
        return listener;
    }
} //# sourceMappingURL=ElementEventAttributeUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/Element.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Element
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$Node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/node/Node.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRect$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMRect.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMTokenList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMTokenList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/query-selector/QuerySelector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$ChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/child-node/ChildNodeUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/parent-node/ParentNodeUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$NonDocumentChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/child-node/NonDocumentChildNodeUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$HTMLCollection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/HTMLCollection.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRectList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/DOMRectList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMap.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Event.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/node/NodeTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationRecord$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/mutation-observer/MutationRecord.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/mutation-observer/MutationTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/config/NamespaceURI.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMapProxyFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/NamedNodeMapProxyFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$NodeFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/NodeFactory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$serializer$2f$HTMLSerializer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/html-serializer/HTMLSerializer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$parser$2f$HTMLParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/html-parser/HTMLParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$AttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/AttributeUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/nodes/element/ElementEventAttributeUtility.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
class Element extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$Node$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    static [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]] = null;
    static [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]] = null;
    static [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] = null;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classList"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].elementNode;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefix"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollHeight"]] = 0;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollWidth"]] = 0;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollTop"]] = 0;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollLeft"]] = 0;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this);
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributesProxy"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["children"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computedStyle"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointerCaptures"]] = new Set();
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]] = new Map();
    /**
     * Constructor.
     */ constructor(){
        super();
        // CustomElementRegistry will populate the properties upon calling "CustomElementRegistry.define()".
        // Elements that can be constructed with the "new" keyword (without using "Document.createElement()") will also populate the properties.
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]] = null;
        }
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]] = null;
        }
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] = null;
        }
    }
    // Events
    /* eslint-disable jsdoc/require-jsdoc */ get onfullscreenerror() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onfullscreenerror');
    }
    set onfullscreenerror(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onfullscreenerror', value);
    }
    get onfullscreenchange() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onfullscreenchange');
    }
    set onfullscreenchange(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onfullscreenchange', value);
    }
    get onbeforecopy() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onbeforecopy');
    }
    set onbeforecopy(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforecopy', value);
    }
    get onbeforecut() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onbeforecut');
    }
    set onbeforecut(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforecut', value);
    }
    get onbeforepaste() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onbeforepaste');
    }
    set onbeforepaste(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onbeforepaste', value);
    }
    get onsearch() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$ElementEventAttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getEventListener(this, 'onsearch');
    }
    set onsearch(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].set('onsearch', value);
    }
    /* eslint-enable jsdoc/require-jsdoc */ /**
     * Returns tag name.
     *
     * @returns Tag name.
     */ get tagName() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]];
    }
    /**
     * Returns prefix.
     *
     * @returns Prefix.
     */ get prefix() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefix"]];
    }
    /**
     * Returns shadow root.
     *
     * @returns Shadow root.
     */ get shadowRoot() {
        const shadowRoot = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]];
        return shadowRoot && shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]] === 'open' ? shadowRoot : null;
    }
    /**
     * Returns scroll height.
     *
     * @returns Scroll height.
     */ get scrollHeight() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollHeight"]];
    }
    /**
     * Returns scroll width.
     *
     * @returns Scroll width.
     */ get scrollWidth() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollWidth"]];
    }
    /**
     * Returns scroll top.
     *
     * @returns Scroll top.
     */ get scrollTop() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollTop"]];
    }
    /**
     * Sets scroll top.
     *
     * @param value Scroll top.
     */ set scrollTop(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollTop"]] = value;
    }
    /**
     * Returns scroll left.
     *
     * @returns Scroll left.
     */ get scrollLeft() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollLeft"]];
    }
    /**
     * Sets scroll left.
     *
     * @param value Scroll left.
     */ set scrollLeft(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["scrollLeft"]] = value;
    }
    /**
     * Returns attributes.
     *
     * @returns Attributes.
     */ get attributes() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributesProxy"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributesProxy"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMapProxyFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createProxy(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]]);
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributesProxy"]];
    }
    /**
     * Returns namespace URI.
     *
     * @returns Namespace URI.
     */ get namespaceURI() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]];
    }
    /**
     * Returns element children.
     */ get children() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["children"]]) {
            const elements = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementArray"]];
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["children"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$HTMLCollection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], ()=>elements);
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["children"]];
    }
    /**
     * Returns class list.
     *
     * @returns Class list.
     */ get classList() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classList"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classList"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMTokenList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this, 'class');
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classList"]];
    }
    /**
     * Sets class list.
     *
     * @param value Class list.
     */ set classList(value) {
        this.setAttribute('class', value);
    }
    /**
     * Returns ID.
     *
     * @returns ID.
     */ get id() {
        return this.getAttribute('id') || '';
    }
    /**
     * Sets ID.
     *
     * @param id ID.
     */ set id(id) {
        this.setAttribute('id', id);
    }
    /**
     * Returns class name.
     *
     * @returns Class name.
     */ get className() {
        return this.getAttribute('class') || '';
    }
    /**
     * Sets class name.
     *
     * @param className Class name.
     */ set className(className) {
        this.setAttribute('class', className);
    }
    /**
     * Node name.
     *
     * @returns Node name.
     */ get nodeName() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]];
    }
    /**
     * Local name.
     *
     * @returns Local name.
     */ get localName() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]];
    }
    /**
     * Returns role.
     *
     * @returns Role.
     */ get role() {
        return this.getAttribute('role') || '';
    }
    /**
     * Sets role.
     *
     * @param role Role.
     */ set role(role) {
        this.setAttribute('role', role);
    }
    /**
     * Previous element sibling.
     *
     * @returns Element.
     */ get previousElementSibling() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$NonDocumentChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].previousElementSibling(this);
    }
    /**
     * Next element sibling.
     *
     * @returns Element.
     */ get nextElementSibling() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$NonDocumentChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nextElementSibling(this);
    }
    /**
     * Get text value of children.
     *
     * @returns Text content.
     */ get textContent() {
        let result = '';
        for (const childNode of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]]){
            if (childNode[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].elementNode || childNode[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].textNode) {
                result += childNode.textContent;
            }
        }
        return result;
    }
    /**
     * Sets text content.
     *
     * @param textContent Text content.
     */ set textContent(textContent) {
        const childNodes = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]];
        while(childNodes.length){
            this.removeChild(childNodes[0]);
        }
        if (textContent) {
            this.appendChild(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]].createTextNode(textContent));
        }
    }
    /**
     * Returns inner HTML.
     *
     * @returns HTML.
     */ get innerHTML() {
        return this.getHTML();
    }
    /**
     * Sets inner HTML.
     *
     * @param html HTML.
     */ set innerHTML(html) {
        const childNodes = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]];
        while(childNodes.length){
            this.removeChild(childNodes[0]);
        }
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$parser$2f$HTMLParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]).parse(html, this);
    }
    /**
     * Returns outer HTML.
     *
     * @returns HTML.
     */ get outerHTML() {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$serializer$2f$HTMLSerializer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]().serializeToString(this);
    }
    /**
     * Returns outer HTML.
     *
     * @param html HTML.
     */ set outerHTML(html) {
        const childNodes = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$parser$2f$HTMLParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]).parse(html)[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]];
        this.replaceWith(...childNodes);
    }
    /**
     * Last element child.
     *
     * @returns Element.
     */ get childElementCount() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementArray"]].length;
    }
    /**
     * First element child.
     *
     * @returns Element.
     */ get firstElementChild() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementArray"]][0] ?? null;
    }
    /**
     * Last element child.
     *
     * @returns Element.
     */ get lastElementChild() {
        const children = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementArray"]];
        return children[children.length - 1] ?? null;
    }
    /**
     * Returns slot.
     *
     * @returns Slot.
     */ get slot() {
        return this.getAttributeNS(null, 'slot') || '';
    }
    /**
     * Returns slot.
     *
     * @param slot Slot.
     */ set slot(title) {
        this.setAttribute('slot', title);
    }
    /**
     * Returns inner HTML and optionally the content of shadow roots.
     *
     * @deprecated
     * @param [options] Options.
     * @param [options.includeShadowRoots] Set to "true" to include shadow roots.
     * @returns HTML.
     */ getInnerHTML(options) {
        const serializer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$serializer$2f$HTMLSerializer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            allShadowRoots: !!options?.includeShadowRoots
        });
        let html = '';
        for (const node of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]]){
            html += serializer.serializeToString(node);
        }
        return html;
    }
    /**
     * Returns inner HTML and optionally the content of shadow roots.
     *
     * @param [options] Options.
     * @param [options.serializableShadowRoots] A boolean value that specifies whether to include serializable shadow roots. The default value is false.
     * @param [options.shadowRoots] An array of ShadowRoot objects to serialize. These are included regardless of whether they are marked as serializable, or if they are open or closed. The default value is an empty array.
     * @returns HTML.
     */ getHTML(options) {
        const serializer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$serializer$2f$HTMLSerializer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            serializableShadowRoots: !!options?.serializableShadowRoots,
            shadowRoots: options?.shadowRoots ?? null
        });
        let html = '';
        for (const node of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]]){
            html += serializer.serializeToString(node);
        }
        return html;
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneNode"]](deep = false) {
        const clone = super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneNode"]](deep);
        clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tagName"]];
        clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]];
        clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]];
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clonable"]]) {
            clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]].cloneNode(deep);
            clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["host"]] = clone;
        }
        clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$NamedNodeMap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](clone);
        for (const attr of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].values()){
            clone[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].setNamedItem(attr.cloneNode(deep));
        }
        return clone;
    }
    /**
     * Removes the node from its parent.
     */ remove() {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$ChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].remove(this);
    }
    /**
     * The Node.replaceWith() method replaces this Node in the children list of its parent with a set of Node or DOMString objects.
     *
     * @param nodes List of Node or DOMString.
     */ replaceWith(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$ChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].replaceWith(this, ...nodes);
    }
    /**
     * Inserts a set of Node or DOMString objects in the children list of this ChildNode's parent, just before this ChildNode. DOMString objects are inserted as equivalent Text nodes.
     *
     * @param nodes List of Node or DOMString.
     */ before(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$ChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].before(this, ...nodes);
    }
    /**
     * Inserts a set of Node or DOMString objects in the children list of this ChildNode's parent, just after this ChildNode. DOMString objects are inserted as equivalent Text nodes.
     *
     * @param nodes List of Node or DOMString.
     */ after(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$child$2d$node$2f$ChildNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].after(this, ...nodes);
    }
    /**
     * Inserts a set of Node objects or DOMString objects after the last child of the ParentNode. DOMString objects are inserted as equivalent Text nodes.
     *
     * @param nodes List of Node or DOMString.
     */ append(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].append(this, ...nodes);
    }
    /**
     * Inserts a set of Node objects or DOMString objects before the first child of the ParentNode. DOMString objects are inserted as equivalent Text nodes.
     *
     * @param nodes List of Node or DOMString.
     */ prepend(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].prepend(this, ...nodes);
    }
    /**
     * Replaces the existing children of a node with a specified new set of children.
     *
     * @param nodes List of Node or DOMString.
     */ replaceChildren(...nodes) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].replaceChildren(this, ...nodes);
    }
    /**
     * Inserts a node to the given position.
     *
     * @param position Position to insert element.
     * @param element Node to insert.
     * @returns Inserted node or null if couldn't insert.
     */ insertAdjacentElement(position, element) {
        if (position === 'beforebegin') {
            if (!this.parentElement) {
                return null;
            }
            this.parentElement.insertBefore(element, this);
        } else if (position === 'afterbegin') {
            this.insertBefore(element, this.firstChild);
        } else if (position === 'beforeend') {
            this.appendChild(element);
        } else if (position === 'afterend') {
            if (!this.parentElement) {
                return null;
            }
            this.parentElement.insertBefore(element, this.nextSibling);
        }
        return element;
    }
    /**
     * Inserts an HTML string to the given position.
     *
     * @param position Position to insert text.
     * @param text HTML string to insert.
     */ insertAdjacentHTML(position, text) {
        const childNodes = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$html$2d$parser$2f$HTMLParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]).parse(text)[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]];
        while(childNodes.length){
            this.insertAdjacentElement(position, childNodes[0]);
        }
    }
    /**
     * Inserts text to the given position.
     *
     * @param position Position to insert text.
     * @param text String to insert.
     */ insertAdjacentText(position, text) {
        if (!text) {
            return;
        }
        const textNode = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]].createTextNode(text);
        this.insertAdjacentElement(position, textNode);
    }
    /**
     * Sets an attribute.
     *
     * @param name Name.
     * @param value Value.
     */ setAttribute(name, value) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$AttributeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AttributeUtility"].validateAttributeName(name, this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]], {
            method: 'setAttribute',
            instance: 'Element'
        });
        name = String(name);
        const namespaceURI = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]];
        if (namespaceURI === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].html) {
            const attribute = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]].createAttribute(name);
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]] = String(value);
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setNamedItem"]](attribute);
        } else {
            const nameParts = name.split(':');
            let attributeNamespaceURI = null;
            // In the XML namespace, the attribute "xmlns" should be set to the "http://www.w3.org/2000/xmlns/" namespace and "xlink" to the "http://www.w3.org/1999/xlink" namespace.
            switch(nameParts[0]){
                case 'xmlns':
                    attributeNamespaceURI = !nameParts[1] || nameParts[1] === 'xlink' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xmlns : null;
                    break;
                case 'xlink':
                    attributeNamespaceURI = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$config$2f$NamespaceURI$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xlink;
                    break;
            }
            const attribute = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$NodeFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createNode(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].Attr);
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["namespaceURI"]] = attributeNamespaceURI;
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] = name;
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["localName"]] = attributeNamespaceURI && nameParts[1] ? nameParts[1] : name;
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefix"]] = attributeNamespaceURI && nameParts[1] ? nameParts[0] : null;
            attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]] = String(value);
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setNamedItem"]](attribute);
        }
    }
    /**
     * Sets a namespace attribute.
     *
     * @param namespaceURI Namespace URI.
     * @param name Name.
     * @param value Value.
     */ setAttributeNS(namespaceURI, name, value) {
        const attribute = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]].createAttributeNS(namespaceURI, name);
        if (!namespaceURI && attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["prefix"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'setAttributeNS' on 'Element': '' is an invalid namespace for attributes.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].namespaceError);
        }
        attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]] = String(value);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].setNamedItemNS(attribute);
    }
    /**
     * Returns attribute names.
     *
     * @returns Attribute names.
     */ getAttributeNames() {
        const names = [];
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].values()){
            names.push(item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]);
        }
        return names;
    }
    /**
     * Returns attribute value.
     *
     * @param name Name.
     */ getAttribute(name) {
        const attribute = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItem(name);
        if (attribute) {
            return attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]];
        }
        return null;
    }
    /**
     * Toggle an attribute.
     * Returns `true` if attribute name is eventually present, and `false` otherwise.
     *
     * @param name A DOMString specifying the name of the attribute to be toggled.
     * @param force A boolean value to determine whether the attribute should be added or removed, no matter whether the attribute is present or not at the moment.
     */ toggleAttribute(name, force) {
        name = name.toLowerCase();
        const attribute = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItem(name);
        if (attribute) {
            if (force === true) {
                return true;
            }
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](attribute);
            return false;
        }
        if (force === false) {
            return false;
        }
        this.setAttribute(name, '');
        return true;
    }
    /**
     * Returns namespace attribute value.
     *
     * @param namespace Namespace URI.
     * @param localName Local name.
     */ getAttributeNS(namespace, localName) {
        const attribute = this.getAttributeNodeNS(namespace, localName);
        if (attribute) {
            return attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]];
        }
        return null;
    }
    /**
     * Returns a boolean value indicating whether the specified element has the attribute or not.
     *
     * @param name Attribute name.
     * @returns True if attribute exists, false otherwise.
     */ hasAttribute(name) {
        return !!this.getAttributeNode(name);
    }
    /**
     * Returns a boolean value indicating whether the specified element has the namespace attribute or not.
     *
     * @param namespace Namespace URI.
     * @param localName Local name.
     * @returns True if attribute exists, false otherwise.
     */ hasAttributeNS(namespace, localName) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItemNS(namespace, localName) !== null;
    }
    /**
     * Returns "true" if the element has attributes.
     *
     * @returns "true" if the element has attributes.
     */ hasAttributes() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].size > 0;
    }
    /**
     * Removes an attribute.
     *
     * @param name Name.
     */ removeAttribute(name) {
        const item = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItem(name);
        if (item) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](item);
        }
    }
    /**
     * Removes a namespace attribute.
     *
     * @param namespace Namespace URI.
     * @param localName Local name.
     */ removeAttributeNS(namespace, localName) {
        const item = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItemNS(namespace, localName);
        if (item) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](item);
        }
    }
    /**
     * Attaches a shadow root.
     *
     * @param init Shadow root init.
     * @param init.mode Shadow root mode.
     * @param [init.clonable] Clonable.
     * @param [init.delegateFocus] Delegate focus.
     * @param [init.serializable] Serializable.
     * @param [init.slotAssignment] Slot assignment.
     * @returns Shadow root.
     */ attachShadow(init) {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (!init) {
            throw new window.TypeError("Failed to execute 'attachShadow' on 'Element': 1 argument required, but only 0 present.");
        }
        if (!init.mode) {
            throw new window.TypeError("Failed to execute 'attachShadow' on 'Element': Failed to read the 'mode' property from 'ShadowRootInit': Required member is undefined.");
        }
        if (init.mode !== 'open' && init.mode !== 'closed') {
            throw new window.TypeError(`Failed to execute 'attachShadow' on 'Element': Failed to read the 'mode' property from 'ShadowRootInit': The provided value '${init.mode}' is not a valid enum value of type ShadowRootMode.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]) {
            throw new window.DOMException("Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.");
        }
        const shadowRoot = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$NodeFactory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].createNode(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].ShadowRoot);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]] = shadowRoot;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["host"]] = this;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]] = init.mode;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clonable"]] = !!init.clonable;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["delegatesFocus"]] = !!init.delegateFocus;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serializable"]] = !!init.serializable;
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slotAssignment"]] = init.slotAssignment === 'manual' ? 'manual' : 'named';
        shadowRoot[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedToNode"]]();
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]];
    }
    /**
     * Converts to string.
     *
     * @returns String.
     */ toString() {
        return this.outerHTML;
    }
    /**
     * Returns the size of an element and its position relative to the viewport.
     *
     * @returns DOM rect.
     */ getBoundingClientRect() {
        // TODO: Not full implementation
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRect$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    }
    /**
     * Returns a collection of DOMRect objects that indicate the bounding rectangles for each CSS border box in a client.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
     * @returns DOM rect list.
     */ getClientRects() {
        // TODO: Not full implementation
        const domRectList = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$DOMRectList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]);
        domRectList.push(this.getBoundingClientRect());
        return domRectList;
    }
    /**
     * Designates a specific element as the capture target of future pointer events.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
     * @param pointerId Pointer ID.
     */ setPointerCapture(pointerId) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointerCaptures"]].add(pointerId);
    }
    /**
     * Returns whether the element on which it is invoked has pointer capture for the pointer identified by the given pointer ID.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/hasPointerCapture
     * @param pointerId Pointer ID.
     * @returns Whether the element has pointer capture.
     */ hasPointerCapture(pointerId) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointerCaptures"]].has(pointerId);
    }
    /**
     * Releases pointer capture that was previously set for a specific pointer.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/releasePointerCapture
     * @param pointerId Pointer ID.
     */ releasePointerCapture(pointerId) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["pointerCaptures"]].delete(pointerId);
    }
    /**
     * The matches() method checks to see if the Element would be selected by the provided selectorString.
     *
     * @param selector Selector.
     * @returns "true" if matching.
     */ matches(selector) {
        return !!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(this, selector);
    }
    /**
     * Traverses the Element and its parents (heading toward the document root) until it finds a node that matches the provided selector string.
     *
     * @param selector Selector.
     * @returns Closest matching element.
     */ closest(selector) {
        // eslint-disable-next-line
        let parent = this;
        while(parent){
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matches(parent, selector)) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }
    /**
     * Query CSS selector to find matching elements.
     *
     * @param selector CSS selector.
     * @returns Matching elements.
     */ querySelectorAll(selector) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].querySelectorAll(this, selector);
    }
    /**
     * Query CSS Selector to find matching node.
     *
     * @param selector CSS selector.
     * @returns Matching element.
     */ querySelector(selector) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$query$2d$selector$2f$QuerySelector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].querySelector(this, selector);
    }
    /**
     * Returns an elements by class name.
     *
     * @param className Tag name.
     * @returns Matching element.
     */ getElementsByClassName(className) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getElementsByClassName(this, className);
    }
    /**
     * Returns an elements by tag name.
     *
     * @param tagName Tag name.
     * @returns Matching element.
     */ getElementsByTagName(tagName) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getElementsByTagName(this, tagName);
    }
    /**
     * Returns an elements by tag name and namespace.
     *
     * @param namespaceURI Namespace URI.
     * @param tagName Tag name.
     * @returns Matching element.
     */ getElementsByTagNameNS(namespaceURI, tagName) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$parent$2d$node$2f$ParentNodeUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getElementsByTagNameNS(this, namespaceURI, tagName);
    }
    /**
     * The setAttributeNode() method adds a new Attr node to the specified element.
     *
     * @param attribute Attribute.
     * @returns Replaced attribute.
     */ setAttributeNode(attribute) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].setNamedItem(attribute);
    }
    /**
     * The setAttributeNodeNS() method adds a new Attr node to the specified element.
     *
     * @param attribute Attribute.
     * @returns Replaced attribute.
     */ setAttributeNodeNS(attribute) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].setNamedItemNS(attribute);
    }
    /**
     * Returns an Attr node.
     *
     * @param name Name.
     * @returns Replaced attribute.
     */ getAttributeNode(name) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItem(name);
    }
    /**
     * Returns a namespaced Attr node.
     *
     * @param namespace Namespace.
     * @param localName Name.
     * @returns Replaced attribute.
     */ getAttributeNodeNS(namespace, localName) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]].getNamedItemNS(namespace, localName);
    }
    /**
     * Removes an Attr node.
     *
     * @param attribute Attribute.
     * @returns Removed attribute.
     */ removeAttributeNode(attribute) {
        if (attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerElement"]] !== this) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException("Failed to execute 'removeAttributeNode' on 'Element': The node provided is owned by another element.");
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeNamedItem"]](attribute);
        return attribute;
    }
    /**
     * Scrolls to a particular set of coordinates.
     *
     * @param x X position or options object.
     * @param y Y position.
     */ scroll(x, y) {
        if (typeof x !== 'object' && arguments.length === 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError("Failed to execute 'scroll' on 'Element': The provided value is not of type 'ScrollToOptions'.");
        }
        const options = typeof x === 'object' ? x : {
            left: x,
            top: y
        };
        if (options.behavior === 'smooth') {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].setTimeout(()=>{
                if (options.top !== undefined) {
                    const top = Number(options.top);
                    this.scrollTop = isNaN(top) ? 0 : top;
                }
                if (options.left !== undefined) {
                    const left = Number(options.left);
                    this.scrollLeft = isNaN(left) ? 0 : left;
                }
            });
        } else {
            if (options.top !== undefined) {
                const top = Number(options.top);
                this.scrollTop = isNaN(top) ? 0 : top;
            }
            if (options.left !== undefined) {
                const left = Number(options.left);
                this.scrollLeft = isNaN(left) ? 0 : left;
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
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError("Failed to execute 'scrollTo' on 'Element': The provided value is not of type 'ScrollToOptions'.");
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
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError("Failed to execute 'scrollBy' on 'Element': The provided value is not of type 'ScrollToOptions'.");
        }
        const options = typeof x === 'object' ? x : {
            left: x,
            top: y
        };
        this.scroll({
            left: this.scrollLeft + (options.left ?? 0),
            top: this.scrollTop + (options.top ?? 0),
            behavior: options.behavior
        });
    }
    /**
     * Scrolls the element's ancestor containers such that the element on which scrollIntoView() is called is visible to the user.
     *
     * @param [_options] Options.
     */ scrollIntoView(_options) {
    // Do nothing
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appendChild"]](node, disableValidations = false) {
        const returnValue = super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appendChild"]](node, disableValidations);
        this.#onSlotChange(node);
        return returnValue;
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeChild"]](node) {
        const returnValue = super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeChild"]](node);
        this.#onSlotChange(node);
        return returnValue;
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertBefore"]](newNode, referenceNode, disableValidations = false) {
        const returnValue = super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["insertBefore"]](newNode, referenceNode, disableValidations);
        this.#onSlotChange(newNode);
        return returnValue;
    }
    /**
     * Triggered when an attribute is set.
     *
     * @param attribute Attribute.
     * @param replacedAttribute Replaced attribute.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onSetAttribute"]](attribute, replacedAttribute) {
        if (!attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]) {
            return;
        }
        const oldValue = replacedAttribute ? replacedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]] : null;
        if (attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] === 'slot' && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]] && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]) {
            const shadowRoot = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]];
            if (shadowRoot && attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]] !== oldValue) {
                // Previous slot
                if (oldValue !== null && replacedAttribute) {
                    const slot = shadowRoot.querySelector(`slot[name="${replacedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]}"]`);
                    if (slot) {
                        slot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                            bubbles: true
                        }));
                    }
                } else {
                    const slot = shadowRoot.querySelector('slot:not([name])');
                    if (slot) {
                        slot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                            bubbles: true
                        }));
                    }
                }
                // New slot
                const slot = shadowRoot.querySelector(`slot[name="${attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]}"]`);
                if (slot) {
                    slot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                        bubbles: true
                    }));
                }
            }
        }
        if (this[attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]] !== undefined && attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]][0] === 'o' && attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]][1] === 'n') {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].delete(attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]]);
        }
        if (attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] === 'id' && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isConnected"]]) {
            if (replacedAttribute?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]) {
                this.#removeIdentifierFromWindow(replacedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]);
            }
            this.#addIdentifierToWindow(attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reportMutation"]](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationRecord$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].attributes,
            target: this,
            attributeName: attribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]],
            oldValue
        }));
    }
    /**
     * Triggered when an attribute is set.
     *
     * @param removedAttribute Attribute.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onRemoveAttribute"]](removedAttribute) {
        if (removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] === 'slot' && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]] && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]) {
            const shadowRoot = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parentNode"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]];
            const namedSlot = shadowRoot.querySelector(`slot[name="${removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]}"]`);
            const defaultSlot = shadowRoot.querySelector('slot:not([name])');
            if (namedSlot) {
                namedSlot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                    bubbles: true
                }));
            }
            if (defaultSlot) {
                defaultSlot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                    bubbles: true
                }));
            }
        }
        if (removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]] === 'id' && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isConnected"]]) {
            this.#removeIdentifierFromWindow(removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reportMutation"]](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationRecord$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$mutation$2d$observer$2f$MutationTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].attributes,
            target: this,
            attributeName: removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["name"]],
            oldValue: removedAttribute[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["value"]]
        }));
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedToDocument"]]() {
        const id = this.getAttribute('id');
        if (id) {
            this.#addIdentifierToWindow(id);
        }
        super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectedToDocument"]]();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customElementReactionStack"]].enqueueReaction(this, 'connectedCallback');
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]) {
            for (const childNode of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeArray"]]){
                this.#onSlotChange(childNode);
            }
        }
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["disconnectedFromDocument"]]() {
        super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["disconnectedFromDocument"]]();
        const id = this.getAttribute('id');
        if (id) {
            this.#removeIdentifierFromWindow(id);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customElementReactionStack"]].enqueueReaction(this, 'disconnectedCallback');
    }
    /**
     * @override
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]() {
        const id = this.getAttribute('id');
        if (id) {
            this.#removeIdentifierFromWindow(id);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customElementReactionStack"]].enqueueReaction(this, 'disconnectedCallback');
        super[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]();
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["destroy"]]();
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["classList"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributesProxy"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["children"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computedStyle"]] = null;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["propertyEventListeners"]].clear();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByNamespaceURI"]].clear();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["itemsByName"]].clear();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributes"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["items"]].clear();
    }
    /**
     * Adds identifier to the window object.
     *
     * @param id Identifier.
     */ #addIdentifierToWindow(id) {
        if (!id) {
            return;
        }
        const document = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]];
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        // We should not add the identifier when inside a shadow root
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rootNode"]] && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rootNode"]] !== document) {
            return;
        }
        if (!document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementIdMap"]].has(id)) {
            document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementIdMap"]].set(id, {
                elements: [],
                htmlCollection: null
            });
        }
        const entry = document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementIdMap"]].get(id);
        if (!entry) {
            return;
        }
        // HTMLFormElement and HTMLSelectElement can be a proxy, but the scope can be the target and not the actual proxy
        // To make sure we use the proxy we can check for the proxy property
        const element = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["proxy"]] || this;
        entry.elements.push(element);
        if (entry.elements.length > 1) {
            if (!entry.htmlCollection) {
                entry.htmlCollection = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$element$2f$HTMLCollection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], ()=>entry.elements);
            }
            if (!(id in window) || window[id] === entry.elements[0]) {
                window[id] = entry.htmlCollection;
            }
        } else if (!(id in window) || entry.htmlCollection !== null && window[id] === entry.htmlCollection) {
            window[id] = element;
        }
    }
    /**
     * Removes identifier from the window object.
     *
     * @param id Identifier.
     */ #removeIdentifierFromWindow(id) {
        if (!id) {
            return;
        }
        const document = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDocument"]];
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        // We should not add the identifier when inside a shadow root
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rootNode"]] && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rootNode"]] !== document) {
            return;
        }
        const entry = document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementIdMap"]].get(id);
        if (!entry) {
            return;
        }
        // HTMLFormElement and HTMLSelectElement can be a proxy, but the scope can be the target and not the actual proxy
        // To make sure we use the proxy we can check for the proxy property
        const element = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["proxy"]] || this;
        const index = entry.elements.indexOf(element);
        if (index !== -1) {
            entry.elements.splice(index, 1);
        }
        if (entry.elements.length === 1) {
            if (window[id] === entry.htmlCollection) {
                window[id] = entry.elements[0];
            }
            entry.htmlCollection = null;
        } else if (!entry.elements.length) {
            document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["elementIdMap"]].delete(id);
            if (window[id] === element || window[id] === entry.htmlCollection) {
                delete window[id];
            }
        }
    }
    /**
     * Triggered when child nodes are changed.
     *
     * @param addedOrRemovedNode Changed node.
     */ #onSlotChange(addedOrRemovedNode) {
        const shadowRoot = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shadowRoot"]];
        if (!shadowRoot || !this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isConnected"]]) {
            return;
        }
        const slotName = addedOrRemovedNode['getAttribute'] ? addedOrRemovedNode.getAttribute('slot') : null;
        if (slotName) {
            const slot = shadowRoot.querySelector(`slot[name="${slotName}"]`);
            if (slot) {
                slot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                    bubbles: true
                }));
            }
        } else if (addedOrRemovedNode[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeType"]] !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$nodes$2f$node$2f$NodeTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].commentNode) {
            const slot = shadowRoot.querySelector('slot:not([name])');
            if (slot) {
                slot.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('slotchange', {
                    bubbles: true
                }));
            }
        }
    }
} //# sourceMappingURL=Element.js.map
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_nodes_element_a320ad09._.js.map