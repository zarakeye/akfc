module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGStringList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGStringList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
const ATTRIBUTE_SPLIT_REGEXP = /[\t\f\n\r ,]+/;
class SVGStringList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]] = {
        items: [],
        attributeValue: ''
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param [options.readOnly] Read only.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            SVGStringList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length' || property === 'numberOfItems') {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
                }
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
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                if (typeof property === 'symbol') {
                    return false;
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
     * Returns length.
     *
     * @returns Length.
     */ get numberOfItems() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().values();
    }
    /**
     * Clears all items from the list.
     */ clear() {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = '';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]('');
    }
    /**
     * Replace Token.
     *
     * @param newItem New item.
     * @returns The item being replaced.
     */ initialize(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGStringList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGStringList': 1 arguments required, but only ${arguments.length} present.`);
        }
        newItem = String(newItem);
        if (!newItem) {
            this.clear();
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newItem);
        return newItem;
    }
    /**
     * Returns item at index.
     *
     * @param index Index.
     * @returns The item at the index.
     **/ getItem(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (typeof index === 'number') {
            return items[index] ? items[index] : null;
        }
        index = Number(index);
        index = isNaN(index) ? 0 : index;
        return items[index] ? items[index] : null;
    }
    /**
     * Inserts a new item into the list at the specified position. The first item is number 0. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to insert before is before the removal of the item. If the index is equal to 0, then the new item is inserted at the front of the list. If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being inserted.
     */ insertItemBefore(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGStringList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGStringList': 2 arguments required, but only ${arguments.length} present.`);
        }
        newItem = String(newItem);
        if (!newItem) {
            return newItem;
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index > items.length) {
            index = items.length;
        }
        items.splice(index, 0, newItem);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.join(' '));
        return newItem;
    }
    /**
     * Replaces an existing item in the list with a new item. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to replace is before the removal of the item.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being replaced.
     */ replaceItem(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGStringList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGStringList': 2 arguments required, but only ${arguments.length} present.`);
        }
        newItem = String(newItem);
        if (!newItem) {
            return this.removeItem(index);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (index < 0) {
            index = 0;
        } else if (index >= items.length) {
            index = items.length - 1;
        }
        const replacedItem = items[index];
        items[index] = newItem;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.join(' '));
        return replacedItem;
    }
    /**
     * Removes an existing item from the list.
     *
     * @param index Index.
     * @returns The removed item.
     */ removeItem(index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGStringList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGStringList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        index = Number(index);
        if (isNaN(index)) {
            index = 0;
        }
        if (index >= items.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGStringList':  The index provided (${index}) is greater than the maximum bound.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        if (index < 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGStringList':  The index provided (${index}) is negative.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        const removedItem = items[index];
        items.splice(index, 1);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.join(' '));
        return removedItem;
    }
    /**
     * Appends an item to the end of the list.
     *
     * @param newItem The item to add to the list.
     * @returns The item being appended.
     */ appendItem(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGStringList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGStringList': 1 argument required, but only ${arguments.length} present.`);
        }
        newItem = String(newItem);
        if (!newItem) {
            return newItem;
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        items.push(newItem);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.join(' '));
        return newItem;
    }
    /**
     * Returns item list from attribute value.
     *
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() ?? '';
        const cache = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]];
        if (cache.attributeValue === attributeValue) {
            return cache.items;
        }
        // It is possible to make this statement shorter by using Array.from() and Set, but this is faster when comparing using a bench test.
        const items = [];
        const trimmed = attributeValue.trim();
        if (trimmed) {
            for (const item of trimmed.split(ATTRIBUTE_SPLIT_REGEXP)){
                if (!items.includes(item)) {
                    items.push(item);
                }
            }
        }
        cache.attributeValue = attributeValue;
        cache.items = items;
        return items;
    }
} //# sourceMappingURL=SVGStringList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGMatrix.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGMatrix
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/dom/dom-matrix/DOMMatrix.js [app-ssr] (ecmascript)");
;
;
const TRANSFORM_REGEXP = /([a-zA-Z0-9]+)\(([^)]+)\)/;
const TRANSFORM_PARAMETER_SPLIT_REGEXP = /[\s,]+/;
class SVGMatrix {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns the `a` value of the matrix.
     */ get a() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().a;
    }
    /**
     * Sets the `a` value of the matrix.
     */ set a(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.a = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns the `b` value of the matrix.
     */ get b() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().b;
    }
    /**
     * Sets the `b` value of the matrix.
     */ set b(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.b = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns the `c` value of the matrix.
     */ get c() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().c;
    }
    /**
     * Sets the `c` value of the matrix.
     */ set c(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.c = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns the `d` value of the matrix.
     */ get d() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().d;
    }
    /**
     * Sets the `d` value of the matrix.
     */ set d(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.d = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns the `e` value of the matrix.
     */ get e() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().e;
    }
    /**
     * Sets the `e` value of the matrix.
     */ set e(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.e = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns the `f` value of the matrix.
     */ get f() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]().f;
    }
    /**
     * Sets the `f` value of the matrix.
     */ set f(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        domMatrix.f = value;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
    }
    /**
     * Returns a new SVGMatrix instance which is the result of this matrix multiplied by the passed matrix.
     *
     * @param secondMatrix Matrix object.
     * @returns A new SVGMatrix object.
     */ multiply(secondMatrix) {
        if (!(secondMatrix instanceof SVGMatrix)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError("Failed to execute 'multiply' on 'SVGMatrix': parameter 1 is not of type 'SVGMatrix'.");
        }
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.multiplySelf(secondMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]());
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix post multiplied by a translation matrix containing the passed values.
     *
     * @param [x=0] X component of the translation value.
     * @param [y=0] Y component of the translation value.
     * @returns The resulted matrix
     */ translate(x = 0, y = 0) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.translateSelf(x, y);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix post multiplied by a scale 2D matrix containing the passed values.
     *
     * @param scale The scale factor.
     * @returns The resulted matrix
     */ scale(scale) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.scaleSelf(scale);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix post multiplied by a scale 3D matrix containing the passed values.
     *
     * @param [scaleX] X-Axis scale.
     * @param [scaleY] Y-Axis scale.
     * @returns The resulted matrix
     */ scaleNonUniform(scaleX = 1, scaleY = 1) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.scaleNonUniformSelf(scaleX, scaleY);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix post multiplied by each of 3 rotation matrices about the major axes, first X, then Y, then Z.
     *
     * @param angle Angle of rotation in degrees.
     * @returns The resulted matrix
     */ rotate(angle) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.rotateSelf(angle);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix post multiplied by a skew matrix along the X axis by the given angle.
     *
     * Not implemented in Happy DOM yet.
     *
     * @param [x] X-Axis skew.
     * @param [y] Y-Axis skew.
     */ rotateFromVector(x = 0, y = 0) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.rotateFromVectorSelf(x, y);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance that specifies a skew transformation along X-Axis by the given angle.
     *
     * @param angle Angle amount in degrees to skew.
     * @returns The resulted matrix
     */ skewX(angle) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.skewXSelf(angle);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance that specifies a skew transformation along Y-Axis by the given angle.
     *
     * @param angle Angle amount in degrees to skew.
     * @returns The resulted matrix
     */ skewY(angle) {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.skewYSelf(angle);
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix flipped on X-axis.
     */ flipX() {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.flipXSelf();
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix flipped on Y-axis.
     */ flipY() {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.flipYSelf();
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns a new SVGMatrix instance which is this matrix inverted.
     */ inverse() {
        const domMatrix = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]();
        const svgMatrix = new SVGMatrix(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]);
        domMatrix.invertSelf();
        svgMatrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix);
        return svgMatrix;
    }
    /**
     * Returns DOM matrix.
     *
     * @returns DOM matrix.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDOMMatrix"]]() {
        const attribute = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attribute) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        }
        const match = attribute.match(TRANSFORM_REGEXP);
        if (!match) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        }
        const parameters = [];
        for (const parameter of match[2].trim().split(TRANSFORM_PARAMETER_SPLIT_REGEXP)){
            const value = Number(parameter);
            if (isNaN(value)) {
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Expected number, but got "${parameter}" in "${attribute}".`);
            }
            parameters.push(value);
        }
        switch(match[1]){
            case 'matrix':
                if (parameters.length !== 6) {
                    throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Expected 6 parameters in "${attribute}".`);
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"]](attribute);
            case 'scale':
            case 'translate':
                if (parameters.length !== 1 && parameters.length !== 2) {
                    throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Expected 1 or 2 parameters in "${attribute}".`);
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"]](attribute);
            case 'skewY':
            case 'skewX':
                if (parameters.length !== 1) {
                    throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Expected 1 parameter in "${attribute}".`);
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromString"]](attribute);
            case 'rotate':
                const domMatrix = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
                if (parameters.length !== 1 && parameters.length !== 3) {
                    throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Expected 1 or 3 parameters in "${attribute}".`);
                }
                const [angle, x, y] = parameters;
                if (x || y) {
                    domMatrix.translateSelf(x, y);
                }
                const radian = angle * Math.PI / 180;
                /**
                 * @see https://www.w3.org/TR/SVG11/coords.html#TransformAttribute
                 **/ domMatrix.multiplySelf(// prettier-ignore
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$dom$2f$dom$2d$matrix$2f$DOMMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]([
                    Math.cos(radian),
                    Math.sin(radian),
                    -Math.sin(radian),
                    Math.cos(radian),
                    0,
                    0
                ]));
                if (x || y) {
                    domMatrix.translateSelf(-x, -y);
                }
                return domMatrix;
            default:
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to parse transform attribute: Unknown transformation "${attribute}".`);
        }
    }
    /**
     * Sets DOM matrix.
     *
     * @param domMatrix DOM matrix.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDOMMatrix"]](domMatrix) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = domMatrix.toString().replace(/, /g, ' ');
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGMatrix.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransformTypeEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var SVGTransformTypeEnum;
(function(SVGTransformTypeEnum) {
    SVGTransformTypeEnum[SVGTransformTypeEnum["unknown"] = 0] = "unknown";
    SVGTransformTypeEnum[SVGTransformTypeEnum["matrix"] = 1] = "matrix";
    SVGTransformTypeEnum[SVGTransformTypeEnum["translate"] = 2] = "translate";
    SVGTransformTypeEnum[SVGTransformTypeEnum["scale"] = 3] = "scale";
    SVGTransformTypeEnum[SVGTransformTypeEnum["rotate"] = 4] = "rotate";
    SVGTransformTypeEnum[SVGTransformTypeEnum["skewX"] = 5] = "skewX";
    SVGTransformTypeEnum[SVGTransformTypeEnum["skewY"] = 6] = "skewY";
})(SVGTransformTypeEnum || (SVGTransformTypeEnum = {}));
const __TURBOPACK__default__export__ = SVGTransformTypeEnum;
 //# sourceMappingURL=SVGTransformTypeEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransform.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGTransform
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGMatrix.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransformTypeEnum.js [app-ssr] (ecmascript)");
;
;
;
const TRANSFORM_REGEXP = /([a-zA-Z0-9]+)\(([^)]+)\)/;
const TRANSFORM_PARAMETER_SPLIT_REGEXP = /[\s,]+/;
class SVGTransform {
    static SVG_TRANSFORM_UNKNOWN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
    static SVG_TRANSFORM_MATRIX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matrix;
    static SVG_TRANSFORM_TRANSLATE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].translate;
    static SVG_TRANSFORM_SCALE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].scale;
    static SVG_TRANSFORM_ROTATE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rotate;
    static SVG_TRANSFORM_SKEWX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].skewX;
    static SVG_TRANSFORM_SKEWY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].skewY;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns type.
     *
     * @returns Type.
     */ get type() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const match = attributeValue?.match(TRANSFORM_REGEXP);
        if (!match) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
        switch(match[1]){
            case 'matrix':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].matrix;
            case 'translate':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].translate;
            case 'rotate':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rotate;
            case 'scale':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].scale;
            case 'skewX':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].skewX;
            case 'skewY':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].skewY;
        }
        return 0;
    }
    /**
     * Returns angle.
     *
     * @returns Angle.
     */ get angle() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const match = attributeValue?.match(TRANSFORM_REGEXP);
        if (!match) {
            return 0;
        }
        const angle = parseFloat(match[2].trim().split(TRANSFORM_PARAMETER_SPLIT_REGEXP)[0]);
        if (isNaN(angle)) {
            return 0;
        }
        switch(match[1]){
            case 'rotate':
            case 'skewX':
            case 'skewY':
                return angle;
        }
        return 0;
    }
    /**
     * Returns matrix.
     *
     * @returns Matrix.
     */ get matrix() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]],
                getAttribute: ()=>{
                    if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]) {
                        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
                    }
                    return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
                },
                setAttribute: (value)=>{
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = value;
                    if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](value);
                        return;
                    }
                }
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]];
    }
    /**
     * Set matrix.
     *
     * @param matrix Matrix.
     */ setMatrix(matrix) {
        if (!(matrix instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGMatrix$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new TypeError('Failed to set the "matrix" property on "SVGTransform": The provided value is not of type "SVGMatrix".');
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        matrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>{
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]) {
                return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
            }
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        };
        matrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = (value)=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = value;
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](value);
                return;
            }
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["matrix"]] = matrix;
        if (matrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] !== this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = matrix[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
            }
        }
    }
    /**
     * Set translate.
     *
     * @param x X.
     * @param y Y.
     */ setTranslate(x, y) {
        if (arguments.length < 2) {
            throw new TypeError(`Failed to execute 'setTranslate' on 'SVGTransform': 2 arguments required, but only ${arguments.length} present.`);
        }
        x = Number(x);
        y = Number(y);
        if (isNaN(x) || isNaN(y)) {
            throw new TypeError(`Failed to execute 'setTranslate' on 'SVGTransform':  The provided float value is non-finite.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `translate(${x} ${y})`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Set scale.
     *
     * @param x X.
     * @param y Y.
     */ setScale(x, y) {
        if (arguments.length < 2) {
            throw new TypeError(`Failed to execute 'setScale' on 'SVGTransform': 2 arguments required, but only ${arguments.length} present.`);
        }
        x = Number(x);
        y = Number(y);
        if (isNaN(x) || isNaN(y)) {
            throw new TypeError(`Failed to execute 'setScale' on 'SVGTransform':  The provided float value is non-finite.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `scale(${x} ${y})`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Set rotate.
     *
     * @param angle Angle.
     * @param x X.
     * @param y Y.
     */ setRotate(angle, x, y) {
        if (arguments.length < 3) {
            throw new TypeError(`Failed to execute 'setRotate' on 'SVGTransform': 3 arguments required, but only ${arguments.length} present.`);
        }
        angle = Number(angle);
        x = Number(x);
        y = Number(y);
        if (isNaN(angle) || isNaN(x) || isNaN(y)) {
            throw new TypeError(`Failed to execute 'setRotate' on 'SVGTransform':  The provided float value is non-finite.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `rotate(${angle} ${x} ${y})`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Set skew x.
     *
     * @param angle Angle.
     */ setSkewX(angle) {
        if (arguments.length < 1) {
            throw new TypeError(`Failed to execute 'setSkewX' on 'SVGTransform': 1 arguments required, but only ${arguments.length} present.`);
        }
        angle = Number(angle);
        if (isNaN(angle)) {
            throw new TypeError(`Failed to execute 'setSkewX' on 'SVGTransform':  The provided float value is non-finite.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `skewX(${angle})`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Set skew y.
     *
     * @param angle Angle.
     */ setSkewY(angle) {
        if (arguments.length < 1) {
            throw new TypeError(`Failed to execute 'setSkewY' on 'SVGTransform': 1 arguments required, but only ${arguments.length} present.`);
        }
        angle = Number(angle);
        if (isNaN(angle)) {
            throw new TypeError(`Failed to execute 'setSkewY' on 'SVGTransform':  The provided float value is non-finite.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `skewY(${angle})`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGTransform.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransformList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGTransformList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransform.js [app-ssr] (ecmascript)");
;
;
;
;
const TRANSFORM_REGEXP = /([a-zA-Z0-9]+)\(([^)]+)\)/gm;
const EMPTY_MATRIX = 'matrix(1 0 0 1 0 0)';
class SVGTransformList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]] = {
        items: [],
        attributeValue: ''
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     * @param [options.readOnly] Read only.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            SVGTransformList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length' || property === 'numberOfItems') {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
                }
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
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                if (typeof property === 'symbol') {
                    return false;
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
     * Returns length.
     *
     * @returns Length.
     */ get numberOfItems() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().values();
    }
    /**
     * Clears all items from the list.
     */ clear() {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'clear' on 'SVGTransformList': The object is read-only.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = '';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]('');
    }
    /**
     * Replace Token.
     *
     * @param newItem New item.
     * @returns The item being replaced.
     */ initialize(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGTransformList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGTransformList': 1 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGTransformList': parameter 1 is not of type 'SVGTransform'.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [
            newItem
        ];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
        return newItem;
    }
    /**
     * Returns item at index.
     *
     * @param index Index.
     * @returns The item at the index.
     **/ getItem(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (typeof index === 'number') {
            return items[index] ? items[index] : null;
        }
        index = Number(index);
        index = isNaN(index) ? 0 : index;
        return items[index] ? items[index] : null;
    }
    /**
     * Inserts a new item into the list at the specified position. The first item is number 0. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to insert before is before the removal of the item. If the index is equal to 0, then the new item is inserted at the front of the list. If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being inserted.
     */ insertItemBefore(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGTransformList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGTransformList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGTransformList': parameter 1 is not of type 'SVGTransform'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index > items.length) {
            index = items.length;
        }
        items.splice(index, 0, newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Replaces an existing item in the list with a new item. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to replace is before the removal of the item.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being replaced.
     */ replaceItem(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGTransformList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGTransformList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGTransformList': parameter 1 is not of type 'SVGTransform'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex === index) {
            return newItem;
        }
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index >= items.length) {
            index = items.length - 1;
        }
        if (items[index]) {
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        const replacedItem = items[index];
        items[index] = newItem;
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return replacedItem;
    }
    /**
     * Removes an existing item from the list.
     *
     * @param index Index.
     * @returns The removed item.
     */ removeItem(index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGTransformList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGTransformList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        index = Number(index);
        if (isNaN(index)) {
            index = 0;
        }
        if (index >= items.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGTransformList':  The index provided (${index}) is greater than the maximum bound.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        if (index < 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGTransformList':  The index provided (${index}) is negative.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        const removedItem = items[index];
        if (removedItem) {
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        items.splice(index, 1);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return removedItem;
    }
    /**
     * Appends an item to the end of the list.
     *
     * @param newItem The item to add to the list.
     * @returns The item being appended.
     */ appendItem(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGTransformList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGTransformList': 1 argument required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGTransformList': parameter 1 is not of type 'SVGTransform'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        items.push(newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Returns item list from attribute value.
     *
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() ?? '';
        const cache = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]];
        if (cache.attributeValue === attributeValue) {
            return cache.items;
        }
        if (cache.items.length) {
            for (const item of cache.items){
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
            }
        }
        // It is possible to make this statement shorter by using Array.from() and Set, but this is faster when comparing using a bench test.
        const items = [];
        const trimmed = attributeValue.trim();
        if (trimmed) {
            const regexp = new RegExp(TRANSFORM_REGEXP);
            let match;
            while(match = regexp.exec(trimmed)){
                const item = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                    readOnly: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]],
                    getAttribute: ()=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]],
                    setAttribute: ()=>{
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || EMPTY_MATRIX).join(' ');
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
                    }
                });
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${match[1]}(${match[2]})`;
                items.push(item);
            }
        }
        cache.attributeValue = attributeValue;
        cache.items = items;
        return items;
    }
} //# sourceMappingURL=SVGTransformList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedTransformList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedTransformList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGTransformList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedTransformList {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: ()=>{}
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGTransformList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Returns base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedTransformList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGRect.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGRect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGRect {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns x value.
     *
     * @returns X value.
     */ get x() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return 0;
        }
        const parts = attributeValue.split(/\s+/);
        const value = Number(parts[0]);
        return isNaN(value) ? 0 : value;
    }
    /**
     * Sets x value.
     *
     * @param value X value.
     */ set x(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'x' property on 'SVGRect': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${String(typeof value === 'number' ? value : parseFloat(value))} ${this.y} ${this.width} ${this.height}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns y value.
     *
     * @returns Y value.
     */ get y() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return 0;
        }
        const parts = attributeValue.split(/\s+/);
        const value = Number(parts[1]);
        return isNaN(value) ? 0 : value;
    }
    /**
     * Sets y value.
     *
     * @param value Y value.
     */ set y(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'y' property on 'SVGRect': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${this.x} ${String(typeof value === 'number' ? value : parseFloat(value))} ${this.width} ${this.height}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns width value.
     *
     * @returns Width value.
     */ get width() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return 0;
        }
        const parts = attributeValue.split(/\s+/);
        const value = Number(parts[2]);
        return isNaN(value) ? 0 : value;
    }
    /**
     * Sets width value.
     *
     * @param value Width value.
     */ set width(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'width' property on 'SVGRect': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${this.x} ${this.y} ${String(typeof value === 'number' ? value : parseFloat(value))} ${this.height}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns height value.
     *
     * @returns Height value.
     */ get height() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return 0;
        }
        const parts = attributeValue.split(/\s+/);
        const value = Number(parts[3]);
        return isNaN(value) ? 0 : value;
    }
    /**
     * Sets height value.
     *
     * @param value Height value.
     */ set height(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'height' property on 'SVGRect': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${this.x} ${this.y} ${this.width} ${String(typeof value === 'number' ? value : parseFloat(value))}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGRect.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPoint.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGPoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
const ATTRIBUTE_SEPARATOR_REGEXP = /[\t\f\n\r, ]+/;
class SVGPoint {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns x.
     *
     * @returns X.
     */ get x() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const parts = (attributeValue || '').split(ATTRIBUTE_SEPARATOR_REGEXP);
        return !!parts[0] ? parseFloat(parts[0]) : 0;
    }
    /**
     * Sets x.
     *
     * @param value X.
     */ set x(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'x' property on 'SVGPoint': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${value} ${this.y}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns y.
     *
     * @returns Y.
     */ get y() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const parts = (attributeValue || '').split(ATTRIBUTE_SEPARATOR_REGEXP);
        return !!parts[1] ? parseFloat(parts[1]) : 0;
    }
    /**
     * Sets y.
     *
     * @param value Y.
     */ set y(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'y' property on 'SVGPoint': The object is read-only.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${this.x} ${value}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGPoint.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLengthTypeEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var SVGLengthTypeEnum;
(function(SVGLengthTypeEnum) {
    SVGLengthTypeEnum[SVGLengthTypeEnum["unknown"] = 0] = "unknown";
    SVGLengthTypeEnum[SVGLengthTypeEnum["number"] = 1] = "number";
    SVGLengthTypeEnum[SVGLengthTypeEnum["percentage"] = 2] = "percentage";
    SVGLengthTypeEnum[SVGLengthTypeEnum["ems"] = 3] = "ems";
    SVGLengthTypeEnum[SVGLengthTypeEnum["exs"] = 4] = "exs";
    SVGLengthTypeEnum[SVGLengthTypeEnum["px"] = 5] = "px";
    SVGLengthTypeEnum[SVGLengthTypeEnum["cm"] = 6] = "cm";
    SVGLengthTypeEnum[SVGLengthTypeEnum["mm"] = 7] = "mm";
    SVGLengthTypeEnum[SVGLengthTypeEnum["in"] = 8] = "in";
    SVGLengthTypeEnum[SVGLengthTypeEnum["pt"] = 9] = "pt";
    SVGLengthTypeEnum[SVGLengthTypeEnum["pc"] = 10] = "pc";
})(SVGLengthTypeEnum || (SVGLengthTypeEnum = {}));
const __TURBOPACK__default__export__ = SVGLengthTypeEnum;
 //# sourceMappingURL=SVGLengthTypeEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLength.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGLength
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLengthTypeEnum.js [app-ssr] (ecmascript)");
;
;
const ATTRIBUTE_REGEXP = /^(\d+|\d+\.\d+)(px|em|ex|cm|mm|in|pt|pc|%|)$/;
class SVGLength {
    // Static properties
    static SVG_LENGTHTYPE_UNKNOWN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
    static SVG_LENGTHTYPE_NUMBER = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number;
    static SVG_LENGTHTYPE_PERCENTAGE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].percentage;
    static SVG_LENGTHTYPE_EMS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].ems;
    static SVG_LENGTHTYPE_EXS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].exs;
    static SVG_LENGTHTYPE_PX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].px;
    static SVG_LENGTHTYPE_CM = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cm;
    static SVG_LENGTHTYPE_MM = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mm;
    static SVG_LENGTHTYPE_IN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].in;
    static SVG_LENGTHTYPE_PT = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pt;
    static SVG_LENGTHTYPE_PC = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pc;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns unit type.
     *
     * @returns Unit type.
     */ get unitType() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() || '' : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '';
        const match = attributeValue.match(ATTRIBUTE_REGEXP);
        if (!match) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
        if (isNaN(parseFloat(match[1]))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
        switch(match[2]){
            case '':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number;
            case 'px':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].px;
            case 'cm':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cm;
            case 'mm':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mm;
            case 'in':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].in;
            case 'pt':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pt;
            case 'pc':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pc;
            case 'em':
            case 'ex':
            case '%':
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'value' on 'SVGLength': Could not resolve relative length.`);
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
    }
    /**
     * Returns value.
     *
     * @returns Value.
     */ get value() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() || '' : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '';
        const match = attributeValue.match(ATTRIBUTE_REGEXP);
        if (!match) {
            return 0;
        }
        const parsedValue = parseFloat(match[1]);
        if (isNaN(parsedValue)) {
            return 0;
        }
        switch(match[2]){
            case '':
                return parsedValue;
            case 'px':
                return parsedValue;
            case 'cm':
                return parsedValue / 2.54 * 96;
            case 'mm':
                return parsedValue / 25.4 * 96;
            case 'in':
                return parsedValue * 96;
            case 'pt':
                return parsedValue * 72;
            case 'pc':
                return parsedValue * 6;
            case 'em':
            case 'ex':
            case '%':
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'value' on 'SVGLength': Could not resolve relative length.`);
            default:
                return 0;
        }
    }
    /**
     * Sets value.
     *
     * @param value Value in pixels.
     */ set value(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'value' property on 'SVGLength': The object is read-only.`);
        }
        // Value in pixels
        value = typeof value !== 'number' ? parseFloat(String(value)) : value;
        if (isNaN(value)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'value' property on 'SVGLength': The provided float value is non-finite.`);
        }
        let unitType = '';
        let valueInSpecifiedUnits = value;
        switch(this.unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number:
                valueInSpecifiedUnits = value;
                unitType = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].px:
                valueInSpecifiedUnits = value;
                unitType = 'px';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cm:
                valueInSpecifiedUnits = value / 96 * 2.54;
                unitType = 'cm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mm:
                valueInSpecifiedUnits = value / 96 * 25.4;
                unitType = 'mm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].in:
                valueInSpecifiedUnits = value / 96;
                unitType = 'in';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pt:
                valueInSpecifiedUnits = value / 72;
                unitType = 'pt';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pc:
                valueInSpecifiedUnits = value / 6;
                unitType = 'pc';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].percentage:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].ems:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].exs:
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'value' property on 'SVGLength': Could not resolve relative length.`);
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(valueInSpecifiedUnits) + unitType;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns value as string.
     *
     * @returns Value as string.
     */ get valueAsString() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() || '0' : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0';
    }
    /**
     * Returns value in specified units.
     *
     * @returns Value in specified units.
     */ get valueInSpecifiedUnits() {
        const attributeValue = this.valueAsString;
        return parseFloat(attributeValue) || 0;
    }
    /**
     * New value specific units.
     *
     * @param unitType
     * @param value
     */ newValueSpecifiedUnits(unitType, value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGLength': The object is read-only.`);
        }
        if (typeof unitType !== 'number') {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGLength': parameter 1 ('unitType') is not of type 'number'.`);
        }
        value = typeof value !== 'number' ? parseFloat(String(value)) : value;
        if (isNaN(value)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGLength': The provided float value is non-finite.`);
        }
        let unit = '';
        switch(unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number:
                unit = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].px:
                unit = 'px';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cm:
                unit = 'cm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mm:
                unit = 'mm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].in:
                unit = 'in';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pt:
                unit = 'pt';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pc:
                unit = 'pc';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].ems:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].exs:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].percentage:
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGLength': Could not resolve relative length.`);
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(value) + unit;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Convert to specific units.
     * @param unitType
     */ convertToSpecifiedUnits(unitType) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'convertToSpecifiedUnits' on 'SVGLength': The object is read-only.`);
        }
        if (typeof unitType !== 'number') {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'convertToSpecifiedUnits' on 'SVGLength': parameter 1 ('unitType') is not of type 'number'.`);
        }
        let value = this.value;
        let unit = '';
        switch(unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].number:
                unit = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].px:
                unit = 'px';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cm:
                value = value / 96 * 2.54;
                unit = 'cm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].mm:
                value = value / 96 * 25.4;
                unit = 'mm';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].in:
                value = value / 96;
                unit = 'in';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pt:
                value = value / 72;
                unit = 'pt';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].pc:
                value = value / 6;
                unit = 'pc';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].percentage:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].ems:
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].exs:
                throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'convertToSpecifiedUnits' on 'SVGLength': Could not resolve relative length.`);
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(value) + unit;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGLength.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAngleTypeEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var SVGAngleTypeEnum;
(function(SVGAngleTypeEnum) {
    SVGAngleTypeEnum[SVGAngleTypeEnum["unknown"] = 0] = "unknown";
    SVGAngleTypeEnum[SVGAngleTypeEnum["unspecified"] = 1] = "unspecified";
    SVGAngleTypeEnum[SVGAngleTypeEnum["deg"] = 2] = "deg";
    SVGAngleTypeEnum[SVGAngleTypeEnum["rad"] = 3] = "rad";
    SVGAngleTypeEnum[SVGAngleTypeEnum["grad"] = 4] = "grad";
})(SVGAngleTypeEnum || (SVGAngleTypeEnum = {}));
const __TURBOPACK__default__export__ = SVGAngleTypeEnum;
 //# sourceMappingURL=SVGAngleTypeEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAngle.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAngle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAngleTypeEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
const ATTRIBUTE_REGEXP = /^(\d+|\d+\.\d+)(deg|rad|grad|turn|)$/;
class SVGAngle {
    // Static properties
    static SVG_ANGLETYPE_UNKNOWN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
    static SVG_ANGLETYPE_UNSPECIFIED = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified;
    static SVG_ANGLETYPE_DEG = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].deg;
    static SVG_ANGLETYPE_RAD = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rad;
    static SVG_ANGLETYPE_GRAD = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].grad;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = '';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns unit type.
     *
     * @returns Unit type.
     */ get unitType() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const match = attributeValue?.match(ATTRIBUTE_REGEXP);
        if (!match) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
        if (isNaN(parseFloat(match[1]))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
        }
        switch(match[2]){
            case '':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified;
            case 'deg':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].deg;
            case 'rad':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rad;
            case 'grad':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].grad;
            case 'turn':
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified;
        }
    }
    /**
     * Returns value.
     *
     * @returns Value.
     */ get value() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        const match = attributeValue?.match(ATTRIBUTE_REGEXP);
        if (!match) {
            return 0;
        }
        const parsedValue = parseFloat(match[1]);
        if (isNaN(parsedValue)) {
            return 0;
        }
        switch(match[2]){
            case '':
                return parsedValue;
            case 'deg':
                return parsedValue;
            case 'rad':
                return parsedValue * (180 / Math.PI);
            case 'grad':
                return parsedValue * (180 / 200);
            case 'turn':
                return parsedValue * 360;
            default:
                return parsedValue;
        }
    }
    /**
     * Sets value.
     *
     * @param value Value in pixels.
     */ set value(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'value' property on 'SVGAngle': The object is read-only.`);
        }
        // Value in pixels
        value = typeof value !== 'number' ? parseFloat(String(value)) : value;
        if (isNaN(value)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'value' property on 'SVGAngle': The provided float value is non-finite.`);
        }
        let unitType = '';
        let valueInSpecifiedUnits = value;
        switch(this.unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified:
                valueInSpecifiedUnits = value;
                unitType = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].deg:
                valueInSpecifiedUnits = value;
                unitType = 'deg';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rad:
                valueInSpecifiedUnits = value / (180 / Math.PI);
                unitType = 'rad';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].grad:
                valueInSpecifiedUnits = value / (180 / 200);
                unitType = 'grad';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown:
                valueInSpecifiedUnits = value / 360;
                unitType = 'turn';
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(valueInSpecifiedUnits) + unitType;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns value as string.
     *
     * @returns Value as string.
     */ get valueAsString() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() || '0' : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0';
    }
    /**
     * Returns value in specified units.
     *
     * @returns Value in specified units.
     */ get valueInSpecifiedUnits() {
        const attributeValue = this.valueAsString;
        return parseFloat(attributeValue) || 0;
    }
    /**
     * New value specific units.
     * @param unitType
     * @param value
     */ newValueSpecifiedUnits(unitType, value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGAngle': The object is read-only.`);
        }
        if (typeof unitType !== 'number') {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGAngle': parameter 1 ('unitType') is not of type 'number'.`);
        }
        value = typeof value !== 'number' ? parseFloat(value) : value;
        if (isNaN(value)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'newValueSpecifiedUnits' on 'SVGAngle': The provided float value is non-finite.`);
        }
        let unit = '';
        switch(unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified:
                unit = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].deg:
                unit = 'deg';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rad:
                unit = 'rad';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].grad:
                unit = 'grad';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown:
                unit = 'turn';
                break;
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(value) + unit;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Convert to specific units.
     * @param unitType
     */ convertToSpecifiedUnits(unitType) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'convertToSpecifiedUnits' on 'SVGAngle': The object is read-only.`);
        }
        if (typeof unitType !== 'number') {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'convertToSpecifiedUnits' on 'SVGAngle': parameter 1 ('unitType') is not of type 'number'.`);
        }
        let value = this.value;
        let unit = '';
        switch(unitType){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unspecified:
                unit = '';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].deg:
                unit = 'deg';
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].rad:
                unit = 'rad';
                value = value / (180 / Math.PI);
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].grad:
                unit = 'grad';
                value = value / (180 / 200);
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngleTypeEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown:
                unit = 'turn';
                value = value / 360;
                break;
            default:
                break;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(value) + unit;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGAngle.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumber.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGNumber
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGNumber {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns value.
     *
     * @returns Value.
     */ get value() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        return parseFloat(attributeValue || '0');
    }
    /**
     * Sets value.
     *
     * @param value Value.
     */ set value(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new TypeError(`Failed to set the 'value' property on 'SVGNumber': The object is read-only.`);
        }
        const parsedValue = typeof value !== 'number' ? parseFloat(String(value)) : value;
        if (isNaN(parsedValue)) {
            throw new TypeError(`Failed to set the 'value' property on 'SVGNumber': The provided value is not a number.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(value);
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
        }
    }
} //# sourceMappingURL=SVGNumber.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedRect.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedRect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGRect$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGRect.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedRect {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGRect$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGRect$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Returns base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedRect.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatioMeetOrSliceEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var SVGPreserveAspectRatioMeetOrSliceEnum;
(function(SVGPreserveAspectRatioMeetOrSliceEnum) {
    SVGPreserveAspectRatioMeetOrSliceEnum[SVGPreserveAspectRatioMeetOrSliceEnum["unknown"] = 0] = "unknown";
    SVGPreserveAspectRatioMeetOrSliceEnum[SVGPreserveAspectRatioMeetOrSliceEnum["meet"] = 1] = "meet";
    SVGPreserveAspectRatioMeetOrSliceEnum[SVGPreserveAspectRatioMeetOrSliceEnum["slice"] = 2] = "slice";
})(SVGPreserveAspectRatioMeetOrSliceEnum || (SVGPreserveAspectRatioMeetOrSliceEnum = {}));
const __TURBOPACK__default__export__ = SVGPreserveAspectRatioMeetOrSliceEnum;
 //# sourceMappingURL=SVGPreserveAspectRatioMeetOrSliceEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatioAlignEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var SVGPreserveAspectRatioAlignEnum;
(function(SVGPreserveAspectRatioAlignEnum) {
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["unknown"] = 0] = "unknown";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["none"] = 1] = "none";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMinYMin"] = 2] = "xMinYMin";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMidYMin"] = 3] = "xMidYMin";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMaxYMin"] = 4] = "xMaxYMin";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMinYMid"] = 5] = "xMinYMid";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMidYMid"] = 6] = "xMidYMid";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMaxYMid"] = 7] = "xMaxYMid";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMinYMax"] = 8] = "xMinYMax";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMidYMax"] = 9] = "xMidYMax";
    SVGPreserveAspectRatioAlignEnum[SVGPreserveAspectRatioAlignEnum["xMaxYMax"] = 10] = "xMaxYMax";
})(SVGPreserveAspectRatioAlignEnum || (SVGPreserveAspectRatioAlignEnum = {}));
const __TURBOPACK__default__export__ = SVGPreserveAspectRatioAlignEnum;
 //# sourceMappingURL=SVGPreserveAspectRatioAlignEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatio.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGPreserveAspectRatio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatioMeetOrSliceEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatioAlignEnum.js [app-ssr] (ecmascript)");
;
;
;
const ALIGN_KEYS = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
ALIGN_KEYS.length = ALIGN_KEYS.indexOf(0);
const MEET_OR_SLICE_KEYS = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
MEET_OR_SLICE_KEYS.length = MEET_OR_SLICE_KEYS.indexOf(0);
class SVGPreserveAspectRatio {
    // Static properties
    static SVG_MEETORSLICE_UNKNOWN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
    static SVG_MEETORSLICE_MEET = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].meet;
    static SVG_MEETORSLICE_SLICE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].slice;
    static SVG_PRESERVEASPECTRATIO_UNKNOWN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].unknown;
    static SVG_PRESERVEASPECTRATIO_NONE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].none;
    static SVG_PRESERVEASPECTRATIO_XMINYMIN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMinYMin;
    static SVG_PRESERVEASPECTRATIO_XMIDYMIN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMidYMin;
    static SVG_PRESERVEASPECTRATIO_XMAXYMIN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMaxYMin;
    static SVG_PRESERVEASPECTRATIO_XMINYMID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMinYMid;
    static SVG_PRESERVEASPECTRATIO_XMIDYMID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMidYMid;
    static SVG_PRESERVEASPECTRATIO_XMAXYMID = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMaxYMid;
    static SVG_PRESERVEASPECTRATIO_XMINYMAX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMinYMax;
    static SVG_PRESERVEASPECTRATIO_XMIDYMAX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMidYMax;
    static SVG_PRESERVEASPECTRATIO_XMAXYMAX = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMaxYMax;
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param [options] Options.
     * @param [options.readOnly] Read only.
     * @param [options.getAttribute] Get attribute.
     * @param [options.setAttribute] Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        if (options) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute || null;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute || null;
        }
    }
    /**
     * Returns align.
     *
     * @returns Align.
     */ get align() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMidYMid;
        }
        const align = attributeValue.split(/\s+/)[0];
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][align] === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].xMidYMid;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioAlignEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][align];
    }
    /**
     * Sets align.
     *
     * @param value Align.
     */ set align(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'align' property on 'SVGPreserveAspectRatio': The object is read-only.`);
        }
        const parsedValue = Number(value);
        if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > ALIGN_KEYS.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'align' property on 'SVGPreserveAspectRatio': The alignment provided is invalid.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${ALIGN_KEYS[parsedValue]} ${MEET_OR_SLICE_KEYS[this.meetOrSlice]}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
    /**
     * Returns meet or slice.
     *
     * @returns Meet or slice.
     */ get meetOrSlice() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] ? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        if (!attributeValue) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].meet;
        }
        const meetOrSlice = attributeValue.split(/\s+/)[1];
        if (!meetOrSlice || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][meetOrSlice] === undefined) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].meet;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatioMeetOrSliceEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"][meetOrSlice];
    }
    /**
     * Sets meet or slice.
     *
     * @param value Meet or slice.
     */ set meetOrSlice(value) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'meetOrSlice' property on 'SVGPreserveAspectRatio': The object is read-only.`);
        }
        const parsedValue = Number(value);
        if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to set the 'meetOrSlice' property on 'SVGPreserveAspectRatio': The meetOrSlice provided is invalid.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${ALIGN_KEYS[this.align]} ${MEET_OR_SLICE_KEYS[parsedValue]}`;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]]);
        }
    }
} //# sourceMappingURL=SVGPreserveAspectRatio.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedPreserveAspectRatio.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedPreserveAspectRatio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatio$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPreserveAspectRatio.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedPreserveAspectRatio {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatio$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPreserveAspectRatio$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Returns base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedPreserveAspectRatio.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedLength.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedLength
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLength.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedLength {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Returns base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedLength.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedNumber.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedNumber
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGAnimatedNumber {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]] = 0;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     * @param options.defaultValue
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]] = options.defaultValue || 0;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        return this.baseVal;
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        if (!attributeValue) {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]];
        }
        const value = parseFloat(attributeValue);
        if (isNaN(value)) {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]];
        }
        return value;
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(value) {
        const parsedValue = typeof value !== 'number' ? parseFloat(value) : value;
        if (isNaN(parsedValue)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`TypeError: Failed to set the 'baseVal' property on 'SVGAnimatedNumber': The provided float value is non-finite.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](String(parsedValue));
    }
} //# sourceMappingURL=SVGAnimatedNumber.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedEnumeration.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedEnumeration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGAnimatedEnumeration {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     * @param options.values Values.
     * @param options.defaultValue Default value.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]] = options.values;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]] = options.defaultValue;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        return this.baseVal;
    }
    /**
     * Returns animated value.
     *
     * @param _value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        const value = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        if (!value) {
            return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].indexOf(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultValue"]]) + 1;
        }
        const index = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].indexOf(value);
        if (index === -1) {
            const anyValueIndex = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].indexOf(null);
            return anyValueIndex !== -1 ? anyValueIndex + 1 : 0;
        }
        return index + 1;
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(value) {
        let parsedValue = Number(value);
        if (isNaN(parsedValue)) {
            parsedValue = 0;
        }
        if (parsedValue < 1) {
            throw new TypeError(`Failed to set the 'baseVal' property on 'SVGAnimatedEnumeration': The enumeration value provided is ${parsedValue}, which is not settable.`);
        }
        if (parsedValue > this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].length) {
            throw new TypeError(`Failed to set the 'baseVal' property on 'SVGAnimatedEnumeration': The enumeration value provided (${parsedValue}) is larger than the largest allowed value (${this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].length}).`);
        }
        const currentValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        const isAnyValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]][parsedValue - 1] === null;
        const newValue = isAnyValue ? '0' : this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]][parsedValue - 1];
        if (!currentValue || isAnyValue && this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["values"]].includes(currentValue) || !isAnyValue && currentValue !== newValue) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newValue || '');
        }
    }
} //# sourceMappingURL=SVGAnimatedEnumeration.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedString.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGAnimatedString {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        return this.baseVal;
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        if (!attributeValue) {
            return '';
        }
        return attributeValue;
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](String(value));
    }
} //# sourceMappingURL=SVGAnimatedString.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumberList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGNumberList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumber.js [app-ssr] (ecmascript)");
;
;
;
;
const ATTRIBUTE_SEPARATOR_REGEXP = /[\t\f\n\r, ]+/;
class SVGNumberList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]] = {
        items: [],
        attributeValue: ''
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param [options.readOnly] Read only.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            SVGNumberList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length' || property === 'numberOfItems') {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
                }
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
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                if (typeof property === 'symbol') {
                    return false;
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
     * Returns length.
     *
     * @returns Length.
     */ get numberOfItems() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().values();
    }
    /**
     * Clears all items from the list.
     */ clear() {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'clear' on 'SVGNumberList': The object is read-only.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = '';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]('');
    }
    /**
     * Replace Token.
     *
     * @param newItem New item.
     * @returns The item being replaced.
     */ initialize(newItem) {
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGNumberList': 1 arguments required, but only ${arguments.length} present.`);
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGNumberList': The object is read-only.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [
            newItem
        ];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
        return newItem;
    }
    /**
     * Returns item at index.
     *
     * @param index Index.
     * @returns The item at the index.
     **/ getItem(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (typeof index === 'number') {
            return items[index] ? items[index] : null;
        }
        index = Number(index);
        index = isNaN(index) ? 0 : index;
        return items[index] ? items[index] : null;
    }
    /**
     * Inserts a new item into the list at the specified position. The first item is number 0. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to insert before is before the removal of the item. If the index is equal to 0, then the new item is inserted at the front of the list. If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being inserted.
     */ insertItemBefore(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGNumberList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGNumberList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGNumberList': parameter 1 is not of type 'SVGNumber'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index > items.length) {
            index = items.length;
        }
        items.splice(index, 0, newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Replaces an existing item in the list with a new item. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to replace is before the removal of the item.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being replaced.
     */ replaceItem(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGNumberList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGNumberList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGNumberList': parameter 1 is not of type 'SVGNumber'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex === index) {
            return newItem;
        }
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index >= items.length) {
            index = items.length - 1;
        }
        if (items[index]) {
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        const replacedItem = items[index];
        items[index] = newItem;
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return replacedItem;
    }
    /**
     * Removes an existing item from the list.
     *
     * @param index Index.
     * @returns The removed item.
     */ removeItem(index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGNumberList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGNumberList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        index = Number(index);
        if (isNaN(index)) {
            index = 0;
        }
        if (index >= items.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGNumberList':  The index provided (${index}) is greater than the maximum bound.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        if (index < 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGNumberList':  The index provided (${index}) is negative.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        const removedItem = items[index];
        if (removedItem) {
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        items.splice(index, 1);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' '));
        return removedItem;
    }
    /**
     * Appends an item to the end of the list.
     *
     * @param newItem The item to add to the list.
     * @returns The item being appended.
     */ appendItem(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGNumberList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGNumberList': 1 argument required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGNumberList': parameter 1 is not of type 'SVGNumber'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        items.push(newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Returns item list from attribute value.
     *
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() ?? '';
        const cache = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]];
        if (cache.attributeValue === attributeValue) {
            return cache.items;
        }
        if (cache.items.length) {
            for (const item of cache.items){
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
            }
        }
        // It is possible to make this statement shorter by using Array.from() and Set, but this is faster when comparing using a bench test.
        const items = [];
        const trimmed = attributeValue.trim();
        if (trimmed) {
            const parts = trimmed.split(ATTRIBUTE_SEPARATOR_REGEXP);
            for(let i = 0, max = parts.length; i < max; i++){
                const item = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                    readOnly: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]],
                    getAttribute: ()=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]],
                    setAttribute: ()=>{
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0').join(' ');
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
                    }
                });
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = String(parseFloat(parts[i]));
                items.push(item);
            }
        }
        cache.attributeValue = attributeValue;
        cache.items = items;
        return items;
    }
} //# sourceMappingURL=SVGNumberList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedNumberList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedNumberList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumberList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGNumberList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedNumberList {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumberList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: ()=>{}
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGNumberList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedNumberList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedBoolean.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedBoolean
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGAnimatedBoolean {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        return this.baseVal;
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        return attributeValue === 'true';
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](typeof value !== 'boolean' ? String(Boolean(value)) : String(value));
    }
} //# sourceMappingURL=SVGAnimatedBoolean.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedInteger.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedInteger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGAnimatedInteger {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        return this.baseVal;
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]();
        if (!attributeValue) {
            return 0;
        }
        const value = parseInt(attributeValue);
        if (isNaN(value)) {
            return 0;
        }
        return value;
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(value) {
        const parsedValue = parseInt(String(value));
        if (isNaN(parsedValue)) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`TypeError: Failed to set the 'baseVal' property on 'SVGAnimatedInteger': The provided float value is non-finite.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](String(parsedValue));
    }
} //# sourceMappingURL=SVGAnimatedInteger.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedAngle.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedAngle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAngle.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedAngle {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Sets animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGAngle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Sets base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedAngle.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPointList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGPointList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGPoint.js [app-ssr] (ecmascript)");
;
;
;
;
const ATTRIBUTE_SEPARATOR_REGEXP = /[\t\f\n\r, ]+/;
class SVGPointList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]] = {
        items: [],
        attributeValue: ''
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     * @param [options.readOnly] Read only.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            SVGPointList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length' || property === 'numberOfItems') {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
                }
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
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                if (typeof property === 'symbol') {
                    return false;
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
     * Returns length.
     *
     * @returns Length.
     */ get numberOfItems() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().values();
    }
    /**
     * Clears all items from the list.
     */ clear() {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'clear' on 'SVGPointList': The object is read-only.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = '';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]('');
    }
    /**
     * Replace Token.
     *
     * @param newItem New item.
     * @returns The item being replaced.
     */ initialize(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGPointList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGPointList': 1 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGPointList': parameter 1 is not of type 'SVGPoint'.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [
            newItem
        ];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
        return newItem;
    }
    /**
     * Returns item at index.
     *
     * @param index Index.
     * @returns The item at the index.
     **/ getItem(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (typeof index === 'number') {
            return items[index] ? items[index] : null;
        }
        index = Number(index);
        index = isNaN(index) ? 0 : index;
        return items[index] ? items[index] : null;
    }
    /**
     * Inserts a new item into the list at the specified position. The first item is number 0. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to insert before is before the removal of the item. If the index is equal to 0, then the new item is inserted at the front of the list. If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being inserted.
     */ insertItemBefore(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGPointList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGPointList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGPointList': parameter 1 is not of type 'SVGPoint'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index > items.length) {
            index = items.length;
        }
        items.splice(index, 0, newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Replaces an existing item in the list with a new item. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to replace is before the removal of the item.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being replaced.
     */ replaceItem(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGPointList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGPointList': 2 arguments required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGPointList': parameter 1 is not of type 'SVGPoint'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex === index) {
            return newItem;
        }
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index >= items.length) {
            index = items.length - 1;
        }
        if (items[index]) {
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        const replacedItem = items[index];
        items[index] = newItem;
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return replacedItem;
    }
    /**
     * Removes an existing item from the list.
     *
     * @param index Index.
     * @returns The removed item.
     */ removeItem(index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGPointList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGPointList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        index = Number(index);
        if (isNaN(index)) {
            index = 0;
        }
        if (index >= items.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGPointList':  The index provided (${index}) is greater than the maximum bound.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        if (index < 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGPointList':  The index provided (${index}) is negative.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        const removedItem = items[index];
        if (removedItem) {
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        items.splice(index, 1);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' '));
        return removedItem;
    }
    /**
     * Appends an item to the end of the list.
     *
     * @param newItem The item to add to the list.
     * @returns The item being appended.
     */ appendItem(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGPointList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGPointList': 1 argument required, but only ${arguments.length} present.`);
        }
        if (!(newItem instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGPointList': parameter 1 is not of type 'SVGPoint'.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        items.push(newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Returns item list from attribute value.
     *
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() ?? '';
        const cache = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]];
        if (cache.attributeValue === attributeValue) {
            return cache.items;
        }
        if (cache.items.length) {
            for (const item of cache.items){
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
            }
        }
        // It is possible to make this statement shorter by using Array.from() and Set, but this is faster when comparing using a bench test.
        const items = [];
        const trimmed = attributeValue.trim();
        if (trimmed) {
            const parts = trimmed.split(ATTRIBUTE_SEPARATOR_REGEXP);
            for(let i = 0, max = parts.length; i < max; i += 2){
                const x = parseFloat(parts[i]);
                const y = parts[i + 1] !== undefined ? ' ' + parseFloat(parts[i + 1]) : '';
                const item = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGPoint$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                    readOnly: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]],
                    getAttribute: ()=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]],
                    setAttribute: ()=>{
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '0 0').join(' ');
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
                    }
                });
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = `${x}${y}`;
                items.push(item);
            }
        }
        cache.attributeValue = attributeValue;
        cache.items = items;
        return items;
    }
} //# sourceMappingURL=SVGPointList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLengthList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGLengthList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/utilities/ClassMethodBinder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLength.js [app-ssr] (ecmascript)");
;
;
;
;
const ATTRIBUTE_SEPARATOR_REGEXP = /[\t\f\n\r, ]+/;
class SVGLengthList {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]] = {
        items: [],
        attributeValue: ''
    };
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     * @param [options.readOnly] Read only.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]] = !!options.readOnly;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
        const methodBinder = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$utilities$2f$ClassMethodBinder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this, [
            SVGLengthList
        ]);
        return new Proxy(this, {
            get: (target, property)=>{
                if (property === 'length' || property === 'numberOfItems') {
                    return target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
                }
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
            ownKeys (target) {
                return Object.keys(target[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]());
            },
            has (target, property) {
                if (property in target) {
                    return true;
                }
                if (typeof property === 'symbol') {
                    return false;
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
     * Returns length.
     *
     * @returns Length.
     */ get numberOfItems() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().length;
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     */ [Symbol.iterator]() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().values();
    }
    /**
     * Clears all items from the list.
     */ clear() {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]('');
    }
    /**
     * Replace Token.
     *
     * @param newItem New item.
     * @returns The item being replaced.
     */ initialize(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGLengthList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'initialize' on 'SVGLengthList': 1 arguments required, but only ${arguments.length} present.`);
        }
        for (const item of this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items){
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].items = [
            newItem
        ];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] || '');
        return newItem;
    }
    /**
     * Returns item at index.
     *
     * @param index Index.
     * @returns The item at the index.
     **/ getItem(index) {
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        if (typeof index === 'number') {
            return items[index] ? items[index] : null;
        }
        index = Number(index);
        index = isNaN(index) ? 0 : index;
        return items[index] ? items[index] : null;
    }
    /**
     * Inserts a new item into the list at the specified position. The first item is number 0. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to insert before is before the removal of the item. If the index is equal to 0, then the new item is inserted at the front of the list. If the index is greater than or equal to numberOfItems, then the new item is appended to the end of the list.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being inserted.
     */ insertItemBefore(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGLengthList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'insertItemBefore' on 'SVGLengthList': 2 arguments required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index > items.length) {
            index = items.length;
        }
        items.splice(index, 0, newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Replaces an existing item in the list with a new item. If newItem is already in a list, it is removed from its previous list before it is inserted into this list. The inserted item is the item itself and not a copy. If the item is already in this list, note that the index of the item to replace is before the removal of the item.
     *
     * @param newItem The item to insert into the list.
     * @param index Index.
     * @returns The item being replaced.
     */ replaceItem(newItem, index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGLengthList': The object is read-only.`);
        }
        if (arguments.length < 2) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'replaceItem' on 'SVGLengthList': 2 arguments required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex === index) {
            return newItem;
        }
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        if (index < 0) {
            index = 0;
        } else if (index >= items.length) {
            index = items.length - 1;
        }
        if (items[index]) {
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            items[index][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        const replacedItem = items[index];
        items[index] = newItem;
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return replacedItem;
    }
    /**
     * Removes an existing item from the list.
     *
     * @param index Index.
     * @returns The removed item.
     */ removeItem(index) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGLengthList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'removeItem' on 'SVGLengthList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        index = Number(index);
        if (isNaN(index)) {
            index = 0;
        }
        if (index >= items.length) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGLengthList':  The index provided (${index}) is greater than the maximum bound.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        if (index < 0) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException(`Failed to execute 'removeItem' on 'SVGLengthList':  The index provided (${index}) is negative.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].indexSizeError);
        }
        const removedItem = items[index];
        if (removedItem) {
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
            removedItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
        }
        items.splice(index, 1);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' '));
        return removedItem;
    }
    /**
     * Appends an item to the end of the list.
     *
     * @param newItem The item to add to the list.
     * @returns The item being appended.
     */ appendItem(newItem) {
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]]) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGLengthList': The object is read-only.`);
        }
        if (arguments.length < 1) {
            throw new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].TypeError(`Failed to execute 'appendItem' on 'SVGLengthList': 1 argument required, but only ${arguments.length} present.`);
        }
        const items = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]();
        const existingIndex = items.indexOf(newItem);
        if (existingIndex !== -1) {
            items.splice(existingIndex, 1);
        }
        items.push(newItem);
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = ()=>newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]];
        newItem[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = ()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]().map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        };
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]].attributeValue);
        return newItem;
    }
    /**
     * Returns item list from attribute value.
     *
     * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getItemList"]]() {
        const attributeValue = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]]() ?? '';
        const cache = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cache"]];
        if (cache.attributeValue === attributeValue) {
            return cache.items;
        }
        if (cache.items.length) {
            for (const item of cache.items){
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = null;
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = null;
            }
        }
        // It is possible to make this statement shorter by using Array.from() and Set, but this is faster when comparing using a bench test.
        const items = [];
        const trimmed = attributeValue.trim();
        if (trimmed) {
            const parts = trimmed.split(ATTRIBUTE_SEPARATOR_REGEXP);
            for(let i = 0, max = parts.length; i < max; i++){
                const item = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLength$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                    readOnly: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readOnly"]],
                    getAttribute: ()=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]],
                    setAttribute: (value)=>{
                        item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = value;
                        const newAttributeValue = items.map((item)=>item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] ?? '0').join(' ');
                        cache.attributeValue = newAttributeValue;
                        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]](newAttributeValue);
                    }
                });
                item[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["attributeValue"]] = parts[i];
                items.push(item);
            }
        }
        cache.attributeValue = attributeValue;
        cache.items = items;
        return items;
    }
} //# sourceMappingURL=SVGLengthList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGAnimatedLengthList.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGAnimatedLengthList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGLengthList.js [app-ssr] (ecmascript)");
;
;
class SVGAnimatedLengthList {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = null;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     * @param window Window.
     * @param options Options.
     * @param options.getAttribute Get attribute.
     * @param options.setAttribute Set attribute.
     */ constructor(illegalConstructorSymbol, window, options){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]] = window;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]] = options.getAttribute;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]] = options.setAttribute;
    }
    /**
     * Returns animated value.
     *
     * @returns Animated value.
     */ get animVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                readOnly: true,
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["animVal"]];
    }
    /**
     * Returns animated value.
     *
     * @param value Animated value.
     */ set animVal(_value) {
    // Do nothing
    }
    /**
     * Returns base value.
     *
     * @returns Base value.
     */ get baseVal() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$svg$2f$SVGLengthList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"], this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]], {
                getAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAttribute"]],
                setAttribute: this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAttribute"]]
            });
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["baseVal"]];
    }
    /**
     * Returns base value.
     *
     * @param value Base value.
     */ set baseVal(_value) {
    // Do nothing
    }
} //# sourceMappingURL=SVGAnimatedLengthList.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/svg/SVGUnitTypes.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SVGUnitTypes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class SVGUnitTypes {
    static SVG_UNIT_TYPE_UNKNOWN = 0;
    static SVG_UNIT_TYPE_USERSPACEONUSE = 1;
    static SVG_UNIT_TYPE_OBJECTBOUNDINGBOX = 2;
    SVG_UNIT_TYPE_UNKNOWN = 0;
    SVG_UNIT_TYPE_USERSPACEONUSE = 1;
    SVG_UNIT_TYPE_OBJECTBOUNDINGBOX = 2;
    /**
     * Constructor.
     *
     * @param illegalConstructorSymbol Illegal constructor symbol.
     */ constructor(illegalConstructorSymbol){
        if (illegalConstructorSymbol !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["illegalConstructor"]) {
            throw new TypeError('Illegal constructor');
        }
    }
} //# sourceMappingURL=SVGUnitTypes.js.map
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_svg_623f8bab._.js.map