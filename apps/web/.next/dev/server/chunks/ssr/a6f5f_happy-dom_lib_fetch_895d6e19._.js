module.exports = [
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/CachedResponseStateEnum.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var CachedResponseStateEnum;
(function(CachedResponseStateEnum) {
    CachedResponseStateEnum["fresh"] = "fresh";
    CachedResponseStateEnum["stale"] = "stale";
})(CachedResponseStateEnum || (CachedResponseStateEnum = {}));
const __TURBOPACK__default__export__ = CachedResponseStateEnum;
 //# sourceMappingURL=CachedResponseStateEnum.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Headers.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Headers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMException.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
;
;
;
class Headers {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]] = {};
    /**
     * Constructor.
     *
     * @param init Headers init.
     */ constructor(init){
        if (init) {
            if (init instanceof Headers) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]] = JSON.parse(JSON.stringify(init[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]]));
            } else if (Array.isArray(init)) {
                for (const entry of init){
                    if (entry.length !== 2) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('Failed to construct "Headers": The provided init is not a valid array.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
                    }
                    this.append(entry[0], entry[1]);
                }
            } else {
                for (const name of Object.keys(init)){
                    this.set(name, init[name]);
                }
            }
        }
    }
    /**
     * Appends a new value onto an existing header inside a Headers object, or adds the header if it does not already exist.
     *
     * @param name Name.
     * @param value Value.
     */ append(name, value) {
        const lowerName = name.toLowerCase();
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][lowerName]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][lowerName].value.push(value);
        } else {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][lowerName] = {
                name,
                value: [
                    value
                ]
            };
        }
    }
    /**
     * Removes an header.
     *
     * @param name Name.
     */ delete(name) {
        delete this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][name.toLowerCase()];
    }
    /**
     * Returns header value.
     *
     * @param name Name.
     * @returns Value.
     */ get(name) {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][name.toLowerCase()]?.value.join(', ') ?? null;
    }
    /**
     * Sets a new value for an existing header inside a Headers object, or adds the header if it does not already exist.
     *
     * @param name Name.
     * @param value Value.
     */ set(name, value) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][name.toLowerCase()] = {
            name,
            value: [
                value
            ]
        };
    }
    /**
     * Returns an array containing the values of all Set-Cookie headers associated with a response.
     *
     * @returns An array of strings representing the values of all the different Set-Cookie headers.
     */ getSetCookie() {
        const entry = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]]['set-cookie'];
        if (!entry) {
            return [];
        }
        return entry.value;
    }
    /**
     * Returns whether an Headers object contains a certain key.
     *
     * @param name Name.
     * @returns "true" if the Headers object contains the key.
     */ has(name) {
        return !!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][name.toLowerCase()];
    }
    /**
     * Executes a callback function once per each key/value pair in the Headers object.
     *
     * @param callback Callback.
     * @param thisArg thisArg.
     */ forEach(callback, thisArg) {
        const thisArgValue = thisArg ?? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        for (const header of Object.values(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            callback.call(thisArgValue, header.value.join(', '), header.name, this);
        }
    }
    /**
     * Returns an iterator, allowing you to go through all keys of the key/value pairs contained in this object.
     *
     * @returns Iterator.
     */ *keys() {
        for (const header of Object.values(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            yield header.name;
        }
    }
    /**
     * Returns an iterator, allowing you to go through all values of the key/value pairs contained in this object.
     *
     * @returns Iterator.
     */ *values() {
        for (const header of Object.values(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            yield header.value.join(', ');
        }
    }
    /**
     * Returns an iterator, allowing you to go through all key/value pairs contained in this object.
     *
     * @returns Iterator.
     */ *entries() {
        for (const header of Object.values(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            yield [
                header.name,
                header.value.join(', ')
            ];
        }
    }
    /**
     * Iterator.
     *
     * @returns Iterator.
     */ *[Symbol.iterator]() {
        for (const header of Object.values(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            yield [
                header.name,
                header.value.join(', ')
            ];
        }
    }
} //# sourceMappingURL=Headers.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/ResponseCacheFileSystem.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResponseCacheFileSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Headers.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
;
;
class ResponseCacheFileSystem {
    #createdDirectories = new Set();
    #hashes = new Set();
    #entries;
    /**
     * Constructor.
     *
     * @param entries Map of URL to cached responses.
     */ constructor(entries){
        this.#entries = entries;
    }
    /**
     * Loads cache from file system.
     *
     * @param directory Directory to load from.
     */ async load(directory) {
        if (!directory) {
            throw new Error("Failed to execute 'load' on 'ResponseCacheFileSystem': Directory is not specified.");
        }
        const absoluteDirectory = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(directory);
        let files = [];
        try {
            files = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.readdir(absoluteDirectory);
        } catch (error) {
            // Ignore if the directory does not exist
            return;
        }
        const promises = [];
        const entries = this.#entries;
        for (const file of files){
            if (file.endsWith('.json')) {
                promises.push(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.readFile(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(absoluteDirectory, file), 'utf8').then((content)=>{
                    const cachedResponse = JSON.parse(content);
                    if (cachedResponse.response && cachedResponse.request && !cachedResponse.virtual) {
                        cachedResponse.response.headers = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](cachedResponse.response.headers);
                        cachedResponse.request.headers = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](cachedResponse.request.headers);
                        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.readFile(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(absoluteDirectory, file.split('.')[0] + '.data')).then((body)=>{
                            cachedResponse.response.body = body;
                            let entry = entries.get(cachedResponse.response.url);
                            if (!entry) {
                                entry = [];
                                entries.set(cachedResponse.response.url, entry);
                            }
                            entry.push(cachedResponse);
                        }).catch(()=>{
                            let entry = entries.get(cachedResponse.response.url);
                            if (!entry) {
                                entry = [];
                                entries.set(cachedResponse.response.url, entry);
                            }
                            entry.push(cachedResponse);
                        });
                    }
                }).catch(()=>{}));
            }
        }
        await Promise.all(promises);
    }
    /**
     * Saves the cache to file system.
     *
     * @param directory Directory to store to.
     */ async save(directory) {
        if (!directory) {
            throw new Error("Failed to execute 'store' on 'ResponseCacheFileSystem': Directory is not specified.");
        }
        if (!this.#entries.size) {
            return;
        }
        const absoluteDirectory = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(directory);
        const isDirectoryCreated = this.#createdDirectories.has(absoluteDirectory);
        if (!isDirectoryCreated) {
            this.#createdDirectories.add(absoluteDirectory);
            try {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.mkdir(absoluteDirectory, {
                    recursive: true
                });
            } catch (error) {
            // Ignore if the directory already exists
            }
        }
        const entries = this.#entries;
        const promises = [];
        for (const entry of entries.values()){
            for (const cachedResponse of entry){
                if (!cachedResponse.virtual) {
                    const responseHeaders = {};
                    const requestHeaders = {};
                    for (const [key, value] of cachedResponse.response.headers.entries()){
                        responseHeaders[key] = value;
                    }
                    for (const [key, value] of cachedResponse.request.headers.entries()){
                        requestHeaders[key] = value;
                    }
                    const cacheableEntry = {
                        ...cachedResponse,
                        response: {
                            ...cachedResponse.response,
                            headers: responseHeaders,
                            body: null
                        },
                        request: {
                            ...cachedResponse.request,
                            headers: requestHeaders
                        }
                    };
                    const json = JSON.stringify(cacheableEntry, null, 3);
                    const hash = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('md5').update(json).digest('hex');
                    if (!this.#hashes.has(hash)) {
                        this.#hashes.add(hash);
                        promises.push(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.writeFile(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(absoluteDirectory, `${hash}.json`), json));
                        if (cachedResponse.response.body) {
                            promises.push(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.writeFile(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(absoluteDirectory, `${hash}.data`), cachedResponse.response.body));
                        }
                    }
                }
            }
        }
        await Promise.all(promises);
    }
} //# sourceMappingURL=ResponseCacheFileSystem.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/ResponseCache.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResponseCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/CachedResponseStateEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Headers.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCacheFileSystem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/ResponseCacheFileSystem.js [app-ssr] (ecmascript)");
;
;
;
const UPDATE_RESPONSE_HEADERS = [
    'Cache-Control',
    'Last-Modified',
    'Vary',
    'ETag'
];
class ResponseCache {
    fileSystem;
    #entries = new Map();
    /**
     * Constructor.
     */ constructor(){
        this.fileSystem = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$ResponseCacheFileSystem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.#entries);
    }
    /**
     * Returns cached response.
     *
     * @param request Request.
     * @returns Cached response.
     */ get(request) {
        if (request.headers.get('Cache-Control')?.includes('no-cache')) {
            return null;
        }
        const url = request.url;
        const entries = this.#entries.get(url);
        if (entries) {
            for(let i = 0, max = entries.length; i < max; i++){
                const entry = entries[i];
                let isMatch = entry.request.method === request.method;
                if (isMatch) {
                    for (const header of Object.keys(entry.vary)){
                        const requestHeader = request.headers.get(header);
                        if (requestHeader !== null && entry.vary[header] !== requestHeader) {
                            isMatch = false;
                            break;
                        }
                    }
                }
                if (isMatch) {
                    if (entry.expires && entry.expires < Date.now()) {
                        if (entry.lastModified) {
                            entry.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].stale;
                        } else if (!entry.etag) {
                            entries.splice(i, 1);
                            return null;
                        }
                    }
                    return entry;
                }
            }
        }
        return null;
    }
    /**
     * Adds a cache entity.
     *
     * @param request Request.
     * @param response Response.
     * @returns Cached response.
     */ add(request, response) {
        // We should only cache GET and HEAD requests.
        if (request.method !== 'GET' && request.method !== 'HEAD' || request.headers.get('Cache-Control')?.includes('no-cache')) {
            return null;
        }
        const url = request.url;
        let cachedResponse = this.get(request);
        if (response.status === 304) {
            if (!cachedResponse) {
                throw new Error('ResponseCache: Cached response not found.');
            }
            for (const name of UPDATE_RESPONSE_HEADERS){
                if (response.headers.has(name)) {
                    cachedResponse.response.headers.set(name, response.headers.get(name));
                }
            }
            cachedResponse.cacheUpdateTime = Date.now();
            cachedResponse.state = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fresh;
        } else {
            if (cachedResponse) {
                const entries = this.#entries.get(url);
                if (entries) {
                    const index = entries.indexOf(cachedResponse);
                    if (index !== -1) {
                        entries.splice(index, 1);
                    }
                }
            }
            cachedResponse = {
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    headers: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Headers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](response.headers),
                    // We need to wait for the body to be consumed and then populated if set to true (e.g. by using Response.text()).
                    waitingForBody: response.waitingForBody,
                    body: response.body ?? null
                },
                request: {
                    headers: request.headers,
                    method: request.method
                },
                vary: {},
                expires: null,
                etag: null,
                cacheUpdateTime: Date.now(),
                lastModified: null,
                mustRevalidate: false,
                staleWhileRevalidate: false,
                state: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fresh,
                virtual: response.virtual ?? false
            };
            let entries = this.#entries.get(url);
            if (!entries) {
                entries = [];
                this.#entries.set(url, entries);
            }
            entries.push(cachedResponse);
        }
        if (response.headers.has('Cache-Control')) {
            const age = response.headers.get('Age');
            for (const part of response.headers.get('Cache-Control').split(',')){
                const [key, value] = part.trim().split('=');
                switch(key){
                    case 'max-age':
                        cachedResponse.expires = Date.now() + parseFloat(value) * 1000 - (age ? parseFloat(age) * 1000 : 0);
                        break;
                    case 'no-cache':
                    case 'no-store':
                        const entries = this.#entries.get(url);
                        if (entries) {
                            const index = entries.indexOf(cachedResponse);
                            if (index !== -1) {
                                entries.splice(index, 1);
                            }
                        }
                        return null;
                    case 'must-revalidate':
                        cachedResponse.mustRevalidate = true;
                        break;
                    case 'stale-while-revalidate':
                        cachedResponse.staleWhileRevalidate = true;
                        break;
                }
            }
        }
        if (response.headers.has('Last-Modified')) {
            cachedResponse.lastModified = Date.parse(response.headers.get('Last-Modified'));
        }
        if (response.headers.has('Vary')) {
            for (const header of response.headers.get('Vary').split(',')){
                const name = header.trim();
                const value = request.headers.get(name);
                if (value) {
                    cachedResponse.vary[name] = value;
                }
            }
        }
        if (response.headers.has('ETag')) {
            cachedResponse.etag = response.headers.get('ETag');
        }
        if (!cachedResponse.expires) {
            const expires = response.headers.get('Expires');
            if (expires) {
                cachedResponse.expires = Date.parse(expires);
            }
        }
        // Cache is invalid if it has expired and doesn't have an ETag.
        if (!cachedResponse.etag && (!cachedResponse.expires || cachedResponse.expires < Date.now())) {
            const entries = this.#entries.get(url);
            if (entries) {
                const index = entries.indexOf(cachedResponse);
                if (index !== -1) {
                    entries.splice(index, 1);
                }
            }
            return null;
        }
        return cachedResponse;
    }
    /**
     * Clears the cache.
     *
     * @param [options] Options.
     * @param [options.url] URL.
     * @param [options.toTime] Removes all entries that are older than this time. Time in MS.
     */ clear(options) {
        if (options) {
            if (options.toTime) {
                for (const key of options.url ? [
                    options.url
                ] : this.#entries.keys()){
                    const entry = this.#entries.get(key);
                    if (entry) {
                        for(let i = 0, max = entry.length; i < max; i++){
                            if (entry[i].cacheUpdateTime < options.toTime) {
                                entry.splice(i, 1);
                                i--;
                                max--;
                            }
                        }
                    }
                }
            } else if (options.url) {
                this.#entries.delete(options.url);
            }
        } else {
            this.#entries.clear();
        }
    }
} //# sourceMappingURL=ResponseCache.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestReferrerUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchRequestReferrerUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/url/URL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/net [external] (net, cjs)");
;
;
;
const REQUEST_REFERRER_UNSUPPORTED_PROTOCOL_REGEXP = /^(about|blob|data):$/;
const REFERRER_POLICIES = [
    '',
    'no-referrer',
    'no-referrer-when-downgrade',
    'same-origin',
    'origin',
    'strict-origin',
    'origin-when-cross-origin',
    'strict-origin-when-cross-origin',
    'unsafe-url'
];
class FetchRequestReferrerUtility {
    /**
     * Prepares the request before being sent.
     *
     * @param originURL Origin URL.
     * @param request Request.
     */ static prepareRequest(originURL, request) {
        if (!request.referrerPolicy) {
            request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrerPolicy"]] = 'strict-origin-when-cross-origin';
        }
        if (request.referrer && request.referrer !== 'no-referrer') {
            request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] = this.getSentReferrer(originURL, request);
        } else {
            request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] = 'no-referrer';
        }
    }
    /**
     * Returns initial referrer.
     *
     * @param window Window.
     * @param referrer Referrer.
     * @returns Initial referrer.
     */ static getInitialReferrer(window, referrer) {
        if (referrer === '' || referrer === 'no-referrer' || referrer === 'client') {
            return referrer;
        } else if (referrer) {
            const referrerURL = referrer instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? referrer : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](referrer, window.location.href);
            return referrerURL.origin === window.location.origin ? referrerURL : 'client';
        }
        return 'client';
    }
    /**
     * Returns referrer policy from header.
     *
     * @see https://w3c.github.io/webappsec-referrer-policy/#parse-referrer-policy-from-header
     * @param headers Response headers
     * @returns Policy.
     */ static getReferrerPolicyFromHeader(headers) {
        const referrerPolicyHeader = headers.get('Referrer-Policy');
        if (!referrerPolicyHeader) {
            return '';
        }
        const policyTokens = referrerPolicyHeader.split(/[,\s]+/);
        let policy = '';
        for (const token of policyTokens){
            if (token && REFERRER_POLICIES.includes(token)) {
                policy = token;
            }
        }
        return policy;
    }
    /**
     * Returns the request referrer to be used as the value for the "Referer" header.
     *
     * Based on:
     * https://github.com/node-fetch/node-fetch/blob/main/src/utils/referrer.js (MIT)
     *
     * @see https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer
     * @param originURL Origin URL.
     * @param request Request.
     * @returns Request referrer.
     */ static getSentReferrer(originURL, request) {
        if (request.referrer === 'about:client' && originURL.origin === 'null') {
            return 'no-referrer';
        }
        const requestURL = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](request.url);
        const referrerURL = request.referrer === 'about:client' ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](originURL.href) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](request.referrer);
        if (REQUEST_REFERRER_UNSUPPORTED_PROTOCOL_REGEXP.test(referrerURL.protocol)) {
            return 'no-referrer';
        }
        referrerURL.username = '';
        referrerURL.password = '';
        referrerURL.hash = '';
        switch(request.referrerPolicy){
            case 'no-referrer':
                return 'no-referrer';
            case 'origin':
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](referrerURL.origin);
            case 'unsafe-url':
                return referrerURL;
            case 'strict-origin':
                if (this.isURLPotentiallyTrustWorthy(referrerURL) && !this.isURLPotentiallyTrustWorthy(requestURL)) {
                    return 'no-referrer';
                }
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](referrerURL.origin);
            case 'strict-origin-when-cross-origin':
                if (referrerURL.origin === requestURL.origin) {
                    return referrerURL;
                }
                if (this.isURLPotentiallyTrustWorthy(referrerURL) && !this.isURLPotentiallyTrustWorthy(requestURL)) {
                    return 'no-referrer';
                }
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](referrerURL.origin);
            case 'same-origin':
                if (referrerURL.origin === requestURL.origin) {
                    return referrerURL;
                }
                return 'no-referrer';
            case 'origin-when-cross-origin':
                if (referrerURL.origin === requestURL.origin) {
                    return referrerURL;
                }
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](referrerURL.origin);
            case 'no-referrer-when-downgrade':
                if (this.isURLPotentiallyTrustWorthy(referrerURL) && !this.isURLPotentiallyTrustWorthy(requestURL)) {
                    return 'no-referrer';
                }
                return referrerURL;
        }
        return 'no-referrer';
    }
    /**
     * Returns "true" if the request's referrer is potentially trustworthy.
     *
     * @see https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy
     * @param url URL.
     * @returns "true" if the request's referrer is potentially trustworthy.
     */ static isURLPotentiallyTrustWorthy(url) {
        // 1. If url is "about:blank" or "about:srcdoc", return "Potentially Trustworthy".
        if (/^about:(blank|srcdoc)$/.test(url.href)) {
            return true;
        }
        // 2. If url's scheme is "data", return "Potentially Trustworthy".
        if (url.protocol === 'data:') {
            return true;
        }
        // Note: The origin of blob: and filesystem: URLs is the origin of the context in which they were
        // Created. Therefore, blobs created in a trustworthy origin will themselves be potentially
        // Trustworthy.
        if (/^(blob|filesystem):$/.test(url.protocol)) {
            return true;
        }
        // 3. Return the result of executing §3.2 Is origin potentially trustworthy? on url's origin.
        return this.isOriginPotentiallyTrustWorthy(url);
    }
    /**
     * Returns "true" if the request's referrer origin is potentially trustworthy.
     *
     * @see https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy
     * @param url URL.
     * @returns "true" if the request's referrer origin is potentially trustworthy.
     */ static isOriginPotentiallyTrustWorthy(url) {
        // 1. If origin is an opaque origin, return "Not Trustworthy".
        // Not applicable
        // 2. Assert: origin is a tuple origin.
        // Not for implementations
        // 3. If origin's scheme is either "https" or "wss", return "Potentially Trustworthy".
        if (/^(http|ws)s:$/.test(url.protocol)) {
            return true;
        }
        // 4. If origin's host component matches one of the CIDR notations 127.0.0.0/8 or ::1/128 [RFC4632], return "Potentially Trustworthy".
        const hostIp = url.host.replace(/(^\[)|(]$)/g, '');
        const hostIPVersion = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["isIP"])(hostIp);
        if (hostIPVersion === 4 && /^127\./.test(hostIp)) {
            return true;
        }
        if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) {
            return true;
        }
        // 5. If origin's host component is "localhost" or falls within ".localhost", and the user agent conforms to the name resolution rules in [let-localhost-be-localhost], return "Potentially Trustworthy".
        // We are returning FALSE here because we cannot ensure conformance to
        // Let-localhost-be-loalhost (https://tools.ietf.org/html/draft-west-let-localhost-be-localhost)
        if (url.host === 'localhost' || url.host.endsWith('.localhost')) {
            return false;
        }
        // 6. If origin's scheme component is file, return "Potentially Trustworthy".
        if (url.protocol === 'file:') {
            return true;
        }
        // 7. If origin's scheme component is one which the user agent considers to be authenticated, return "Potentially Trustworthy".
        // Not supported
        // 8. If origin has been configured as a trustworthy origin, return "Potentially Trustworthy".
        // Not supported
        // 9. Return "Not Trustworthy".
        return false;
    }
} //# sourceMappingURL=FetchRequestReferrerUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/data-uri/DataURIParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Data URI parser.
 *
 * Based on:
 * https://github.com/TooTallNate/node-data-uri-to-buffer/blob/main/src/index.ts (MIT)
 */ __turbopack_context__.s([
    "default",
    ()=>DataURIParser
]);
class DataURIParser {
    /**
     * Returns a Buffer instance from the given data URI `uri`.
     *
     * @param uri Data URI.
     * @returns Buffer.
     */ static parse(uri) {
        if (!/^data:/i.test(uri)) {
            throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
        }
        // Strip newlines
        uri = uri.replace(/\r?\n/g, '');
        // Split the URI up into the "metadata" and the "data" portions
        const firstComma = uri.indexOf(',');
        if (firstComma === -1 || firstComma <= 4) {
            throw new TypeError('malformed data: URI');
        }
        // Remove the "data:" scheme and parse the metadata
        const meta = uri.substring(5, firstComma).split(';');
        let charset = '';
        let base64 = false;
        let type = meta[0] || 'text/plain';
        for(let i = 1; i < meta.length; i++){
            if (meta[i] === 'base64') {
                base64 = true;
            } else if (meta[i]) {
                type += `;${meta[i]}`;
                if (meta[i].indexOf('charset=') === 0) {
                    charset = meta[i].substring(8);
                }
            }
        }
        // Defaults to US-ASCII only if type is not provided
        if (!meta[0] && !charset.length) {
            type += ';charset=US-ASCII';
            charset = 'US-ASCII';
        }
        // Get the encoded data portion and decode URI-encoded chars
        const encoding = base64 ? 'base64' : 'ascii';
        const data = unescape(uri.substring(firstComma + 1));
        const buffer = Buffer.from(data, encoding);
        return {
            type,
            charset,
            buffer
        };
    }
} //# sourceMappingURL=DataURIParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchCORSUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchCORSUtility
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
;
class FetchCORSUtility {
    /**
     * Validates request headers.
     *
     * @param originURL Origin URL.
     * @param targetURL Target URL.
     */ static isCORS(originURL, targetURL) {
        originURL = typeof originURL === 'string' ? new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](originURL) : originURL;
        targetURL = typeof targetURL === 'string' ? new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](targetURL) : targetURL;
        if (targetURL.protocol === 'about:' || targetURL.protocol === 'javascript:') {
            return false;
        }
        return originURL.hostname !== targetURL.hostname && !originURL.hostname.endsWith(targetURL.hostname) || originURL.protocol !== targetURL.protocol;
    }
} //# sourceMappingURL=FetchCORSUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartReader.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MultipartReader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$File$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/File.js [app-ssr] (ecmascript)");
;
var MultipartParserStateEnum;
(function(MultipartParserStateEnum) {
    MultipartParserStateEnum[MultipartParserStateEnum["boundary"] = 0] = "boundary";
    MultipartParserStateEnum[MultipartParserStateEnum["headerStart"] = 2] = "headerStart";
    MultipartParserStateEnum[MultipartParserStateEnum["header"] = 3] = "header";
    MultipartParserStateEnum[MultipartParserStateEnum["data"] = 5] = "data";
})(MultipartParserStateEnum || (MultipartParserStateEnum = {}));
const CHARACTER_CODE = {
    lf: 10,
    cr: 13
};
class MultipartReader {
    formData;
    boundary;
    boundaryIndex = 0;
    state = MultipartParserStateEnum.boundary;
    data = {
        contentDisposition: null,
        value: [],
        contentType: null,
        header: ''
    };
    /**
     * Constructor.
     *
     * @param window Window.
     * @param formData Form data.
     * @param boundary Boundary.
     */ constructor(window, boundary){
        const boundaryHeader = `--${boundary}`;
        this.boundary = new Uint8Array(boundaryHeader.length);
        this.formData = new window.FormData();
        for(let i = 0, max = boundaryHeader.length; i < max; i++){
            this.boundary[i] = boundaryHeader.charCodeAt(i);
        }
    }
    /**
     * Appends data.
     *
     * @param data Data.
     */ write(data) {
        let char;
        let nextChar;
        for(let i = 0, max = data.length; i < max; i++){
            char = data[i];
            nextChar = data[i + 1];
            switch(this.state){
                case MultipartParserStateEnum.boundary:
                    if (char === this.boundary[this.boundaryIndex]) {
                        this.boundaryIndex++;
                    } else {
                        this.boundaryIndex = 0;
                    }
                    if (this.boundaryIndex === this.boundary.length) {
                        this.state = MultipartParserStateEnum.headerStart;
                        this.boundaryIndex = 0;
                    }
                    break;
                case MultipartParserStateEnum.headerStart:
                    if (nextChar !== CHARACTER_CODE.cr && nextChar !== CHARACTER_CODE.lf) {
                        this.data.header = '';
                        this.state = data[i - 2] === CHARACTER_CODE.lf ? MultipartParserStateEnum.data : MultipartParserStateEnum.header;
                    }
                    break;
                case MultipartParserStateEnum.header:
                    if (char === CHARACTER_CODE.cr) {
                        if (this.data.header) {
                            const headerParts = this.data.header.split(':');
                            if (headerParts.length > 1) {
                                const headerName = headerParts[0].toLowerCase();
                                const headerValue = headerParts[1].trim();
                                switch(headerName){
                                    case 'content-disposition':
                                        this.data.contentDisposition = this.getContentDisposition(headerValue);
                                        break;
                                    case 'content-type':
                                        this.data.contentType = headerValue;
                                        break;
                                }
                            }
                        }
                        this.state = MultipartParserStateEnum.headerStart;
                    } else {
                        this.data.header += String.fromCharCode(char);
                    }
                    break;
                case MultipartParserStateEnum.data:
                    if (char === this.boundary[this.boundaryIndex]) {
                        this.boundaryIndex++;
                    } else {
                        this.boundaryIndex = 0;
                    }
                    if (this.boundaryIndex === this.boundary.length) {
                        this.state = MultipartParserStateEnum.headerStart;
                        if (this.data.value.length) {
                            this.appendFormData(this.data.contentDisposition.name, Buffer.from(this.data.value.slice(0, -(this.boundary.length + 1))), this.data.contentDisposition.filename, this.data.contentType);
                            this.data.value = [];
                            this.data.contentDisposition = null;
                            this.data.contentType = null;
                        }
                        this.boundaryIndex = 0;
                    } else {
                        this.data.value.push(char);
                    }
                    break;
            }
        }
    }
    /**
     * Ends the stream.
     *
     * @returns Form data.
     */ end() {
        // If we are missing an end boundary, but we have data, we should append it.
        if (this.data.contentDisposition && this.data.value.length) {
            this.appendFormData(this.data.contentDisposition.name, Buffer.from(this.data.value.slice(0, -2)), this.data.contentDisposition.filename, this.data.contentType);
        }
        return this.formData;
    }
    /**
     * Appends data.
     *
     * @param key Key.
     * @param value value.
     * @param filename Filename.
     * @param type Type.
     */ appendFormData(key, value, filename, type) {
        if (!value.length) {
            return;
        }
        if (filename) {
            this.formData.append(key, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$File$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]([
                value
            ], filename, {
                type
            }));
        } else {
            this.formData.append(key, value.toString());
        }
    }
    /**
     * Returns content disposition.
     *
     * @param headerValue Header value.
     * @returns Content disposition.
     */ getContentDisposition(headerValue) {
        const regex = /([a-z]+) *= *"([^"]+)"/g;
        const contentDisposition = {};
        let match;
        while(match = regex.exec(headerValue)){
            contentDisposition[match[1]] = match[2];
        }
        return contentDisposition;
    }
} //# sourceMappingURL=MultipartReader.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartFormDataParser.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MultipartFormDataParser
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream/web [external] (stream/web, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartReader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartReader.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
;
;
;
;
;
class MultipartFormDataParser {
    /**
     * Returns form data.
     *
     * @param window Window.
     * @param response Response object containing a body stream.
     * @param response.body Body stream.
     * @param requestOrResponse
     * @param requestOrResponse.body
     * @param contentType Content type header value.
     * @returns Form data.
     */ static async streamToFormData(window, requestOrResponse, contentType) {
        if (!/multipart/i.test(contentType)) {
            throw new window.DOMException(`Failed to build FormData object: The "content-type" header isn't of type "multipart/form-data".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const body = requestOrResponse.body;
        if (!body) {
            throw new window.DOMException('Failed to build FormData object: The response body is null.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (!match) {
            throw new window.DOMException(`Failed to build FormData object: The "content-type" header doesn't contain any multipart boundary.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const bodyReader = body.getReader();
        const reader = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartReader$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window, match[1] || match[2]);
        const chunks = [];
        let buffer;
        const bytes = 0;
        let readResult = await bodyReader.read();
        while(!readResult.done){
            if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]]) {
                throw requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]];
            }
            if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
                throw new window.DOMException('Failed to read response body: The stream was aborted.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
            }
            reader.write(readResult.value);
            readResult = await bodyReader.read();
        }
        try {
            buffer = typeof chunks[0] === 'string' ? __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(chunks.join('')) : __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].concat(chunks, bytes);
        } catch (error) {
            throw new window.DOMException(`Could not create Buffer from response body. Error: ${error.message}.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        return {
            formData: reader.end(),
            buffer
        };
    }
    /**
     * Converts a FormData object to a ReadableStream.
     *
     * @param formData FormData.
     * @returns Stream and type.
     */ static formDataToStream(formData) {
        const boundary = '----HappyDOMFormDataBoundary' + Math.random().toString(36);
        const chunks = [];
        const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="`;
        for (const [name, value] of formData){
            if (typeof value === 'string') {
                chunks.push(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(`${prefix}${this.escapeName(name)}"\r\n\r\n${value.replace(/\r(?!\n)|(?<!\r)\n/g, '\r\n')}\r\n`));
            } else {
                chunks.push(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(`${prefix}${this.escapeName(name)}"; filename="${this.escapeName(value.name, true)}"\r\nContent-Type: ${value.type || 'application/octet-stream'}\r\n\r\n`));
                chunks.push(value[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]]);
                chunks.push(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from('\r\n'));
            }
        }
        // add end boundary
        chunks.push(__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(`--${boundary}--\r\n`));
        const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].concat(chunks);
        return {
            contentType: `multipart/form-data; boundary=${boundary}`,
            contentLength: buffer.length,
            buffer,
            stream: new __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"]({
                start (controller) {
                    controller.enqueue(buffer);
                    controller.close();
                }
            })
        };
    }
    /**
     * Escapes a form data entry name.
     *
     * @param name Name.
     * @param filename Whether it is a filename.
     * @returns Escaped name.
     */ static escapeName(name, filename = false) {
        return (filename ? name : name.replace(/\r?\n|\r/g, '\r\n')).replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22');
    }
} //# sourceMappingURL=MultipartFormDataParser.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchBodyUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchBodyUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartFormDataParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream/web [external] (stream/web, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$form$2d$data$2f$FormData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/form-data/FormData.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/Blob.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMException.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
;
;
;
;
;
;
;
;
;
;
class FetchBodyUtility {
    /**
     * Parses body and returns stream and type.
     *
     * Based on:
     * https://github.com/node-fetch/node-fetch/blob/main/src/body.js (MIT)
     *
     * @param body Body.
     * @returns Stream and type.
     */ static getBodyStream(body) {
        if (body === null || body === undefined) {
            return {
                stream: null,
                buffer: null,
                contentType: null,
                contentLength: null
            };
        } else if (body instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URLSearchParams"]) {
            const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(body.toString());
            return {
                buffer,
                stream: this.toReadableStream(buffer),
                contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                contentLength: buffer.length
            };
        } else if (body instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            const buffer = body[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]];
            return {
                buffer,
                stream: this.toReadableStream(buffer),
                contentType: body.type,
                contentLength: body.size
            };
        } else if (__TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].isBuffer(body)) {
            return {
                buffer: body,
                stream: this.toReadableStream(body),
                contentType: null,
                contentLength: body.length
            };
        } else if (body instanceof ArrayBuffer) {
            const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(body);
            return {
                buffer,
                stream: this.toReadableStream(buffer),
                contentType: null,
                contentLength: body.byteLength
            };
        } else if (ArrayBuffer.isView(body)) {
            const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(body.buffer, body.byteOffset, body.byteLength);
            return {
                buffer,
                stream: this.toReadableStream(buffer),
                contentType: null,
                contentLength: body.byteLength
            };
        } else if (body instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"]) {
            return {
                buffer: null,
                stream: body,
                contentType: null,
                contentLength: null
            };
        } else if (body instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$form$2d$data$2f$FormData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].formDataToStream(body);
        }
        const buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(String(body));
        return {
            buffer,
            stream: this.toReadableStream(buffer),
            contentType: 'text/plain;charset=UTF-8',
            contentLength: buffer.length
        };
    }
    /**
     * Clones a request or body body stream.
     *
     * It is actually not cloning the stream.
     * It creates a pass through stream and pipes the original stream to it.
     *
     * @param window Window.
     * @param requestOrResponse Request or Response.
     * @param requestOrResponse.body Body.
     * @param requestOrResponse.bodyUsed Body used.
     * @returns New stream.
     */ static cloneBodyStream(window, requestOrResponse) {
        if (requestOrResponse.bodyUsed) {
            throw new window.DOMException(`Failed to clone body stream of request: Request body is already used.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        if (requestOrResponse.body === null || requestOrResponse.body === undefined) {
            return null;
        }
        // If a buffer is set, use it to create a new stream.
        if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]]) {
            return this.toReadableStream(requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]]);
        }
        // Pipe underlying node stream if it exists.
        if (requestOrResponse.body[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeStream"]]) {
            const stream1 = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].PassThrough();
            const stream2 = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].PassThrough();
            requestOrResponse.body[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeStream"]].pipe(stream1);
            requestOrResponse.body[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeStream"]].pipe(stream2);
            // Sets the body of the cloned request/response to the first pass through stream.
            // Request uses [PropertySymbol.body] with a getter, Response uses public readonly body.
            const newStream = this.nodeToWebStream(stream1);
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"] in requestOrResponse) {
                // Request object - set the symbol property (getter will return it)
                requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"]] = newStream;
            } else {
                // Response object - set the public property directly
                requestOrResponse.body = newStream;
            }
            // Returns the clone.
            return this.nodeToWebStream(stream2);
        }
        // Uses the tee() method to clone the ReadableStream
        // This requires the stream to be consumed in parallel which is not the case for the fetch API
        const [stream1, stream2] = requestOrResponse.body.tee();
        // Sets the body of the cloned request to the first pass through stream.
        // Request uses [PropertySymbol.body] with a getter, Response uses public readonly body.
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"] in requestOrResponse) {
            // Request object - set the symbol property (getter will return it)
            requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"]] = stream1;
        } else {
            // Response object - set the public property directly
            requestOrResponse.body = stream1;
        }
        // Returns the other stream as the clone
        return stream2;
    }
    /**
     * Consume and convert an entire Body to a Buffer.
     *
     * Based on:
     * https://github.com/node-fetch/node-fetch/blob/main/src/body.js (MIT)
     *
     * @see https://fetch.spec.whatwg.org/#concept-body-consume-body
     * @param window Window.
     * @param requestOrResponse
     * @param requestOrResponse.body
     * @param body Body stream.
     * @returns Promise.
     */ static async consumeBodyStream(window, requestOrResponse) {
        const body = requestOrResponse.body;
        if (body === null || !(body instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"])) {
            return __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].alloc(0);
        }
        if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]]) {
            throw requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]];
        }
        const reader = body.getReader();
        const chunks = [];
        let bytes = 0;
        try {
            let readResult = await reader.read();
            while(!readResult.done){
                if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]]) {
                    throw requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]];
                }
                if (requestOrResponse[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
                    throw new window.DOMException('Failed to read response body: The stream was aborted.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
                }
                const chunk = readResult.value;
                bytes += chunk.length;
                chunks.push(chunk);
                readResult = await reader.read();
            }
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                throw error;
            }
            throw new window.DOMException(`Failed to read response body. Error: ${error.message}.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].encodingError);
        }
        try {
            if (typeof chunks[0] === 'string') {
                return __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from(chunks.join(''));
            }
            return __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].concat(chunks, bytes);
        } catch (error) {
            throw new window.DOMException(`Could not create Buffer from response body. Error: ${error.message}.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
    }
    /**
     * Wraps a given value in a browser ReadableStream.
     *
     * This method creates a ReadableStream and immediately enqueues and closes it
     * with the provided value, useful for stream API compatibility.
     *
     * @param value The value to be wrapped in a ReadableStream.
     * @returns ReadableStream
     */ static toReadableStream(value) {
        return new __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"]({
            start (controller) {
                controller.enqueue(value);
                controller.close();
            }
        });
    }
    /**
     * Wraps a Node.js stream into a browser-compatible ReadableStream.
     *
     * Enables the use of Node.js streams where browser ReadableStreams are required.
     * Handles 'data', 'end', and 'error' events from the Node.js stream.
     *
     * @param nodeStream The Node.js stream to be converted.
     * @returns ReadableStream
     */ static nodeToWebStream(nodeStream) {
        const readableStream = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream$2f$web__$5b$external$5d$__$28$stream$2f$web$2c$__cjs$29$__["ReadableStream"]({
            start (controller) {
                nodeStream.on('data', (chunk)=>{
                    controller.enqueue(chunk);
                });
                nodeStream.on('end', ()=>{
                    controller.close();
                });
                nodeStream.on('error', (err)=>{
                    controller.error(err);
                });
            }
        });
        readableStream[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["nodeStream"]] = nodeStream;
        return readableStream;
    }
} //# sourceMappingURL=FetchBodyUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestValidationUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchRequestValidationUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMException.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
;
;
;
const VALID_REFERRER_POLICIES = [
    '',
    'no-referrer',
    'no-referrer-when-downgrade',
    'same-origin',
    'origin',
    'strict-origin',
    'origin-when-cross-origin',
    'strict-origin-when-cross-origin',
    'unsafe-url'
];
const VALID_REDIRECTS = [
    'error',
    'manual',
    'follow'
];
const SUPPORTED_SCHEMAS = [
    'data:',
    'http:',
    'https:'
];
const FORBIDDEN_REQUEST_METHODS = [
    'TRACE',
    'TRACK',
    'CONNECT'
];
const REQUEST_METHOD_REGEXP = /^[A-Z]+$/;
class FetchRequestValidationUtility {
    /**
     * Validates request method.
     *
     * @throws DOMException
     * @param request Request.
     */ static validateMethod(request) {
        if (!request.method || FORBIDDEN_REQUEST_METHODS.includes(request.method)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`'${request.method || ''}' is not a valid HTTP method.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        if (!REQUEST_METHOD_REGEXP.test(request.method)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`'${request.method}' HTTP method is unsupported.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
    }
    /**
     * Validates request body.
     *
     * @throws DOMException
     * @param request Request.
     */ static validateBody(request) {
        if (request.body && (request.method === 'GET' || request.method === 'HEAD')) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`Request with GET/HEAD method cannot have body.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
    }
    /**
     * Validates request URL.
     *
     * @throws DOMException
     * @param url URL.
     */ static validateURL(url) {
        if (url.username !== '' || url.password !== '') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`${url} is an url with embedded credentials.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notSupportedError);
        }
    }
    /**
     * Validates request referrer policy.
     *
     * @throws DOMException
     * @param referrerPolicy Referrer policy.
     */ static validateReferrerPolicy(referrerPolicy) {
        if (!VALID_REFERRER_POLICIES.includes(referrerPolicy)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`Invalid referrer policy "${referrerPolicy}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
        }
    }
    /**
     * Validates request redirect.
     *
     * @throws DOMException
     * @param redirect Redirect.
     */ static validateRedirect(redirect) {
        if (!VALID_REDIRECTS.includes(redirect)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`Invalid redirect "${redirect}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
        }
    }
    /**
     * Validates request redirect.
     *
     * @throws DOMException
     * @param request
     * @param redirect Redirect.
     */ static validateSchema(request) {
        if (!SUPPORTED_SCHEMAS.includes(request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMException$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](`Failed to fetch from "${request.url}": URL scheme "${request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol.replace(/:$/, '')}" is not supported.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notSupportedError);
        }
    }
} //# sourceMappingURL=FetchRequestValidationUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestHeaderUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchRequestHeaderUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$urilities$2f$CookieStringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/cookie/urilities/CookieStringUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchCORSUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
;
;
;
;
const FORBIDDEN_HEADER_NAMES = [
    'accept-charset',
    'accept-encoding',
    'access-control-request-headers',
    'access-control-request-method',
    'connection',
    'content-length',
    'content-transfer-encoding',
    'cookie',
    'cookie2',
    'date',
    'dnt',
    'expect',
    'host',
    'keep-alive',
    'origin',
    'referer',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'via'
];
class FetchRequestHeaderUtility {
    /**
     * Validates request headers.
     *
     * @param headers Headers.
     */ static removeForbiddenHeaders(headers) {
        for (const key of Object.keys(headers[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            if (FORBIDDEN_HEADER_NAMES.includes(key) || key.startsWith('proxy-') || key.startsWith('sec-')) {
                delete headers[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]][key];
            }
        }
    }
    /**
     * Returns "true" if the header is forbidden.
     *
     * @param name Header name.
     * @returns "true" if the header is forbidden.
     */ static isHeaderForbidden(name) {
        return FORBIDDEN_HEADER_NAMES.includes(name.toLowerCase());
    }
    /**
     * Returns request headers.
     *
     * @param options Options.
     * @param options.browserFrame Browser frame.
     * @param options.window Window.
     * @param options.request Request.
     * @param [options.baseHeaders] Any base headers (may be overwritten by browser/window headers).
     * @returns Headers.
     */ static getRequestHeaders(options) {
        const headers = new options.window.Headers(options.baseHeaders);
        options.request.headers.forEach((value, key)=>{
            headers.set(key, value);
        });
        const originURL = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](options.window.location.href);
        const isCORS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isCORS(originURL, options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]]);
        headers.set('Accept-Encoding', 'gzip, deflate, br');
        headers.set('Connection', 'close');
        if (!headers.has('User-Agent')) {
            headers.set('User-Agent', options.window.navigator.userAgent);
        }
        if (options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"]) {
            headers.set('Referer', options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]].href);
        }
        if (options.request.credentials === 'include' || options.request.credentials === 'same-origin' && !isCORS) {
            const cookies = options.browserFrame.page.context.cookieContainer.getCookies(options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]], false);
            if (cookies.length > 0) {
                headers.set('Cookie', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$urilities$2f$CookieStringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cookiesToString(cookies));
            }
        } else {
            headers.delete('Cookie');
            headers.delete('Cookie2');
        }
        if (!headers.has('Accept')) {
            headers.set('Accept', '*/*');
        }
        if (!headers.has('Content-Length') && options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentLength"]] !== null) {
            headers.set('Content-Length', String(options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentLength"]]));
        }
        if (!headers.has('Content-Type') && options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]]) {
            headers.set('Content-Type', options.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]]);
        }
        if (isCORS) {
            headers.set('Origin', originURL.origin);
        }
        // We need to convert the headers to Node request headers.
        const httpRequestHeaders = {};
        for (const header of Object.values(headers[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["entries"]])){
            httpRequestHeaders[header.name] = header.value.join(', ');
        }
        return httpRequestHeaders;
    }
} //# sourceMappingURL=FetchRequestHeaderUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Request.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Request
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchBodyUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/Blob.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestValidationUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestReferrerUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestHeaderUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartFormDataParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
class Request {
    // Public properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["method"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]] = 'cors';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["headers"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["redirect"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrerPolicy"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signal"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["credentials"]];
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentLength"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] = 'client';
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]];
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]];
    /**
     * Constructor.
     *
     * @param input Input.
     * @param [init] Init.
     */ constructor(input, init){
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (!window) {
            throw new TypeError(`Failed to construct 'Request': 'Request' was constructed outside a Window context.`);
        }
        if (typeof input !== `string` && !input) {
            throw new window.TypeError(`Failed to construct 'Request': 1 argument required, only 0 present.`);
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["method"]] = (init?.method || input.method || 'GET').toUpperCase();
        if (init?.mode) {
            switch(init.mode){
                case 'navigate':
                case 'websocket':
                    throw new window.DOMException(`Failed to construct 'Request': Cannot construct a Request with a RequestInit whose mode member is set as '${init.mode}'.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].securityError);
                case 'same-origin':
                case 'no-cors':
                case 'cors':
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]] = init.mode;
                    break;
                default:
                    throw new window.DOMException(`Failed to construct 'Request': The provided value '${init.mode}' is not a valid enum value of type RequestMode.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].syntaxError);
            }
        } else if (input instanceof Request) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]] = input.mode;
        }
        const { stream, buffer, contentType, contentLength } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBodyStream(input instanceof Request && (input[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]] || input.body) ? input[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cloneBodyStream(window, input) : init?.body ?? null);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]] = buffer;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"]] = stream;
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["credentials"]] = init?.credentials || input.credentials || 'same-origin';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["headers"]] = new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].Headers(init?.headers || input.headers || {});
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].removeForbiddenHeaders(this.headers);
        if (contentLength) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentLength"]] = contentLength;
        } else if (!this.body && (this.method === 'POST' || this.method === 'PUT')) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentLength"]] = 0;
        }
        if (contentType) {
            if (!this.headers.has('Content-Type')) {
                this.headers.set('Content-Type', contentType);
            }
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] = contentType;
        } else if (input instanceof Request && input[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] = input[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]];
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["redirect"]] = init?.redirect || input.redirect || 'follow';
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrerPolicy"]] = (init?.referrerPolicy || input.referrerPolicy || '').toLowerCase();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signal"]] = init?.signal || input.signal || new window.AbortSignal();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInitialReferrer(window, init?.referrer !== null && init?.referrer !== undefined ? init?.referrer : input.referrer);
        if (input instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"]) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]] = input;
        } else {
            try {
                if (input instanceof Request && input.url) {
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]] = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](input.url, window.location.href);
                } else {
                    this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]] = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](input, window.location.href);
                }
            } catch (error) {
                throw new window.DOMException(`Failed to construct 'Request': Invalid URL "${input}" on document location '${window.location}'.${window.location.origin === 'null' ? ' Relative URLs are not permitted on current document location.' : ''}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notSupportedError);
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateMethod(this);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateBody(this);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateURL(this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]]);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateReferrerPolicy(this.referrerPolicy);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateRedirect(this.redirect);
    }
    /**
     * Returns method.
     *
     * @returns Method.
     */ get method() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["method"]];
    }
    /**
     * Returns body.
     *
     * @returns Body.
     */ get body() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["body"]];
    }
    /**
     * Returns mode.
     *
     * @returns Mode.
     */ get mode() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mode"]];
    }
    /**
     * Returns headers.
     *
     * @returns Headers.
     */ get headers() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["headers"]];
    }
    /**
     * Returns redirect.
     *
     * @returns Redirect.
     */ get redirect() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["redirect"]];
    }
    /**
     * Returns referrer policy.
     *
     * @returns Referrer policy.
     */ get referrerPolicy() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrerPolicy"]];
    }
    /**
     * Returns signal.
     *
     * @returns Signal.
     */ get signal() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signal"]];
    }
    /**
     * Returns body used.
     *
     * @returns Body used.
     */ get bodyUsed() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]];
    }
    /**
     * Returns credentials.
     *
     * @returns Credentials.
     */ get credentials() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["credentials"]];
    }
    /**
     * Returns referrer.
     *
     * @returns Referrer.
     */ get referrer() {
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] || this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] === 'no-referrer') {
            return '';
        }
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]] === 'client') {
            return 'about:client';
        }
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["referrer"]].toString();
    }
    /**
     * Returns URL.
     *
     * @returns URL.
     */ get url() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].href;
    }
    /**
     * Returns string tag.
     *
     * @returns String tag.
     */ get [Symbol.toStringTag]() {
        return 'Request';
    }
    /**
     * Returns array buffer.
     *
     * @returns Array buffer.
     */ async arrayBuffer() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]]) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const asyncTaskManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getAsyncTaskManager();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]] = true;
        const taskID = asyncTaskManager.startTask(()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            this.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]]();
        });
        let buffer;
        try {
            buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
        } catch (error) {
            asyncTaskManager.endTask(taskID);
            throw error;
        }
        asyncTaskManager.endTask(taskID);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    /**
     * Returns blob.
     *
     * @returns Blob.
     */ async blob() {
        const type = this.headers.get('Content-Type') || '';
        const buffer = await this.arrayBuffer();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]([
            buffer
        ], {
            type
        });
    }
    /**
     * Returns buffer.
     *
     * @returns Buffer.
     */ async buffer() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]]) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const asyncTaskManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getAsyncTaskManager();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]] = true;
        const taskID = asyncTaskManager.startTask(()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            this.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]]();
        });
        let buffer;
        try {
            buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
        } catch (error) {
            asyncTaskManager.endTask(taskID);
            throw error;
        }
        asyncTaskManager.endTask(taskID);
        return buffer;
    }
    /**
     * Returns text.
     *
     * @returns Text.
     */ async text() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]]) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const asyncTaskManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getAsyncTaskManager();
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]] = true;
        const taskID = asyncTaskManager.startTask(()=>{
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            this.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]]();
        });
        let buffer;
        try {
            buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
        } catch (error) {
            asyncTaskManager.endTask(taskID);
            throw error;
        }
        asyncTaskManager.endTask(taskID);
        return new TextDecoder().decode(buffer);
    }
    /**
     * Returns json.
     *
     * @returns JSON.
     */ async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
    /**
     * Returns FormData.
     *
     * @returns FormData.
     */ async formData() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const asyncTaskManager = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getAsyncTaskManager();
        const contentType = this.headers.get('Content-Type') ?? this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]];
        if (this.body && contentType && /multipart/i.test(contentType)) {
            if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]]) {
                throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
            }
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyUsed"]] = true;
            const taskID = asyncTaskManager.startTask(()=>{
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
                this.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]]();
            });
            let formData;
            try {
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].streamToFormData(window, this, contentType);
                formData = result.formData;
            } catch (error) {
                asyncTaskManager.endTask(taskID);
                throw error;
            }
            asyncTaskManager.endTask(taskID);
            return formData;
        }
        if (contentType?.startsWith('application/x-www-form-urlencoded')) {
            const parameters = new URLSearchParams(await this.text());
            const formData = new window.FormData();
            for (const [key, value] of parameters){
                formData.append(key, value);
            }
            return formData;
        }
        throw new window.DOMException(`Failed to construct FormData object: The "content-type" header is neither "application/x-www-form-urlencoded" nor "multipart/form-data".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
    }
    /**
     * Clones request.
     *
     * @returns Clone.
     */ clone() {
        return new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].Request(this);
    }
} //# sourceMappingURL=Request.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Response.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Response
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/file/Blob.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/url/URL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchBodyUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/multipart/MultipartFormDataParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const REDIRECT_STATUS_CODES = [
    301,
    302,
    303,
    307,
    308
];
class Response {
    // Public properties
    body = null;
    bodyUsed = false;
    redirected = false;
    type = 'basic';
    url = '';
    status;
    statusText;
    ok;
    headers;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] = null;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = null;
    /**
     * Constructor.
     *
     * @param body Body.
     * @param [init] Init.
     */ constructor(body, init){
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]) {
            throw new TypeError(`Failed to construct '${this.constructor.name}': '${this.constructor.name}' was constructed outside a Window context.`);
        }
        this.status = init?.status !== undefined ? init.status : 200;
        this.statusText = init?.statusText || '';
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].Headers(init?.headers);
        // "Set-Cookie" and "Set-Cookie2" are not allowed in response headers according to spec.
        this.headers.delete('Set-Cookie');
        this.headers.delete('Set-Cookie2');
        if (body) {
            const { stream, buffer, contentType } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getBodyStream(body);
            this.body = stream;
            if (buffer) {
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] = buffer;
            }
            if (contentType && !this.headers.has('Content-Type')) {
                this.headers.set('Content-Type', contentType);
            }
        }
    }
    /**
     * Returns string tag.
     *
     * @returns String tag.
     */ get [Symbol.toStringTag]() {
        return 'Response';
    }
    /**
     * Returns array buffer.
     *
     * @returns Array buffer.
     */ async arrayBuffer() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this.bodyUsed) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getBrowserFrame();
        // No browser frame means that the browser is being teared down.
        if (!browserFrame) {
            return new ArrayBuffer(0);
        }
        const asyncTaskManager = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        this.bodyUsed = true;
        let buffer = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]];
        if (!buffer) {
            const taskID = asyncTaskManager.startTask(()=>{
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            });
            try {
                buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
            } catch (error) {
                asyncTaskManager.endTask(taskID);
                throw error;
            }
            asyncTaskManager.endTask(taskID);
        }
        this.#storeBodyInCache(buffer);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    /**
     * Returns blob.
     *
     * @returns Blob.
     */ async blob() {
        const type = this.headers.get('Content-Type') || '';
        const buffer = await this.arrayBuffer();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$file$2f$Blob$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]([
            buffer
        ], {
            type
        });
    }
    /**
     * Returns buffer.
     *
     * @returns Buffer.
     */ async buffer() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this.bodyUsed) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getBrowserFrame();
        // No browser frame means that the browser is being teared down.
        if (!browserFrame) {
            return __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].alloc(0);
        }
        const asyncTaskManager = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        this.bodyUsed = true;
        let buffer = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]];
        if (!buffer) {
            const taskID = asyncTaskManager.startTask(()=>{
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            });
            try {
                buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
            } catch (error) {
                asyncTaskManager.endTask(taskID);
                throw error;
            }
            asyncTaskManager.endTask(taskID);
        }
        this.#storeBodyInCache(buffer);
        return buffer;
    }
    /**
     * Returns text.
     *
     * @returns Text.
     */ async text() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (this.bodyUsed) {
            throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getBrowserFrame();
        // No browser frame means that the browser is being teared down.
        if (!browserFrame) {
            return '';
        }
        const asyncTaskManager = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        this.bodyUsed = true;
        let buffer = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]];
        if (!buffer) {
            const taskID = asyncTaskManager.startTask(()=>{
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            });
            try {
                buffer = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].consumeBodyStream(window, this);
            } catch (error) {
                asyncTaskManager.endTask(taskID);
                throw error;
            }
            asyncTaskManager.endTask(taskID);
        }
        this.#storeBodyInCache(buffer);
        return new TextDecoder().decode(buffer);
    }
    /**
     * Returns json.
     *
     * @returns JSON.
     */ async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
    /**
     * Returns form data.
     *
     * @returns Form data.
     */ async formData() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getBrowserFrame();
        // No browser frame means that the browser is being teared down.
        if (!browserFrame) {
            return new window.FormData();
        }
        const asyncTaskManager = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]];
        const contentType = this.headers.get('Content-Type');
        if (contentType && this.body && /multipart/i.test(contentType)) {
            if (this.bodyUsed) {
                throw new window.DOMException(`Body has already been used for "${this.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
            }
            this.bodyUsed = true;
            const taskID = browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask(()=>{
                this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            });
            let formData;
            let buffer;
            try {
                const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$multipart$2f$MultipartFormDataParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].streamToFormData(window, this, contentType);
                formData = result.formData;
                buffer = result.buffer;
            } catch (error) {
                asyncTaskManager.endTask(taskID);
                throw error;
            }
            this.#storeBodyInCache(buffer);
            asyncTaskManager.endTask(taskID);
            return formData;
        }
        if (contentType?.startsWith('application/x-www-form-urlencoded')) {
            const parameters = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URLSearchParams"](await this.text());
            const formData = new window.FormData();
            for (const [key, value] of parameters){
                formData.append(key, value);
            }
            return formData;
        }
        throw new window.DOMException(`Failed to build FormData object: The "content-type" header is neither "application/x-www-form-urlencoded" nor "multipart/form-data".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
    }
    /**
     * Clones request.
     *
     * @returns Clone.
     */ clone() {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const body = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cloneBodyStream(window, this);
        const response = new window.Response(body, {
            status: this.status,
            statusText: this.statusText,
            headers: this.headers
        });
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]];
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]];
        response.ok = this.ok;
        response.redirected = this.redirected;
        response.type = this.type;
        response.url = this.url;
        return response;
    }
    /**
     * Stores body in cache.
     *
     * @param buffer Buffer.
     */ #storeBodyInCache(buffer) {
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] = buffer;
        if (this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]]?.response?.waitingForBody) {
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]].response.body = buffer;
            this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]].response.waitingForBody = false;
        }
    }
    /**
     * Returns a redirect response.
     *
     * @param url URL.
     * @param status Status code.
     * @returns Response.
     */ static redirect(url, status = 302) {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        if (!REDIRECT_STATUS_CODES.includes(status)) {
            throw new window.DOMException('Failed to create redirect response: Invalid redirect status code.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        return new window.Response(null, {
            headers: {
                location: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](url).toString()
            },
            status
        });
    }
    /**
     * Returns an error response.
     *
     * @param url URL.
     * @param status Status code.
     * @returns Response.
     */ static error() {
        const response = new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].Response(null, {
            status: 0,
            statusText: ''
        });
        response.type = 'error';
        return response;
    }
    /**
     * Returns an JSON response.
     *
     * @param injected Injected properties.
     * @param data Data.
     * @param [init] Init.
     * @returns Response.
     */ static json(data, init) {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const body = JSON.stringify(data);
        if (body === undefined) {
            throw new window.TypeError('data is not JSON serializable');
        }
        const headers = new window.Headers(init && init.headers);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        return new window.Response(body, {
            status: 200,
            ...init,
            headers
        });
    }
} //# sourceMappingURL=Response.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseRedirectUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchResponseRedirectUtility
]);
const REDIRECT_STATUS_CODES = [
    301,
    302,
    303,
    307,
    308
];
const MAX_REDIRECT_COUNT = 20;
class FetchResponseRedirectUtility {
    /**
     * Returns "true" if redirect.
     *
     * @param statusCode Status code.
     * @returns "true" if redirect.
     */ static isRedirect(statusCode) {
        return REDIRECT_STATUS_CODES.includes(statusCode);
    }
    /**
     * Returns "true" if max redirects is reached.
     *
     * @param redirectCount Redirect count.
     * @returns "true" if max redirects is reached.
     */ static isMaxRedirectsReached(redirectCount) {
        return redirectCount >= MAX_REDIRECT_COUNT;
    }
} //# sourceMappingURL=FetchResponseRedirectUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseHeaderUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FetchResponseHeaderUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$urilities$2f$CookieStringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/cookie/urilities/CookieStringUtility.js [app-ssr] (ecmascript)");
;
class FetchResponseHeaderUtility {
    /**
     * Appends headers to response.
     *
     * @param nodeResponse HTTP request.
     * @param options
     * @param options.browserFrame
     * @param options.requestURL
     * @param options.rawHeaders
     * @returns Headers.
     */ static parseResponseHeaders(options) {
        const headers = new options.browserFrame.window.Headers();
        let key = null;
        for (const header of options.rawHeaders){
            if (!key) {
                key = header;
            } else {
                const lowerName = key.toLowerCase();
                // Handles setting cookie headers to the document.
                // "Set-Cookie" and "Set-Cookie2" are not allowed in response headers according to spec.
                if (lowerName === 'set-cookie' || lowerName === 'set-cookie2') {
                    const cookie = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$cookie$2f$urilities$2f$CookieStringUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].stringToCookie(options.requestURL, header);
                    if (cookie) {
                        options.browserFrame.page.context.cookieContainer.addCookies([
                            cookie
                        ]);
                    }
                } else {
                    headers.append(key, header);
                }
                key = null;
            }
        }
        return headers;
    }
} //# sourceMappingURL=FetchResponseHeaderUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/certificate/FetchHTTPSCertificate.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// SSL certificate generated for Happy DOM to be able to perform HTTPS requests
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = {
    cert: `-----BEGIN CERTIFICATE-----
MIIDYzCCAkugAwIBAgIUJRKB/H66hpet1VfUlm0CiXqePA4wDQYJKoZIhvcNAQEL
BQAwQTELMAkGA1UEBhMCU0UxDjAMBgNVBAgMBVNrYW5lMQ4wDAYDVQQHDAVNYWxt
bzESMBAGA1UECgwJSGFwcHkgRE9NMB4XDTIyMTAxMTIyMDM0OVoXDTMyMTAwODIy
MDM0OVowQTELMAkGA1UEBhMCU0UxDjAMBgNVBAgMBVNrYW5lMQ4wDAYDVQQHDAVN
YWxtbzESMBAGA1UECgwJSGFwcHkgRE9NMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
MIIBCgKCAQEAqerQSQEg/SxVxRiwlItithr5e5EMZo1nsqt/xOxagbmpW3IEmt0j
bpbH7iEF4DDEo7KAOwUCOwVWeFxRoag8lG2ax48wrgjlCna45XDn0Xeg1ARajL04
gs46HZ0VrzIloVGfln0zgt/Vum5BNqs9Oc5fQoBmoP3cAn3dn4ZVcP0AKthtcyPl
q2DuNRN0PV0D2RtMSiAy9l1Ko6N5x+sAeClDyOL+sTDLngZBVeZyOKt9Id15S8Zt
XtA6VMgHnnF3jChn7pag77rsd/y5iANAVNZYqRl+Eg7xaDcsvbgH46UBOrBcB39Q
tTh5Mtjoxep5e3ZDFG+kQ1HUE+iz5O5n0wIDAQABo1MwUTAdBgNVHQ4EFgQU69s9
YSobG/m2SN4L/7zTaF7iDbwwHwYDVR0jBBgwFoAU69s9YSobG/m2SN4L/7zTaF7i
DbwwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAi/WUXx2oal8L
YnPlIuKfh49n/K18wXSYG//oFYwxfVxqpYH8hUiXVm/GUcXCxS++hUkaKLqXmH9q
MKJiCrZr3vS+2nsBKopkICu/TLdROl0sAI9lByfnEbfSAzjxe1IWJdK8NdY0y5m5
9pEr/URVIAp/CxrneyASb4q0Jg5To3FR7vYc+2X6wZn0MundKMg6Dp9/A37jiF3l
Tt/EJp299YZcsUzh+LnRuggRjnoOVu1aLcLFlaUiwZfy9m8mLG6B/mdW/qNzNMh9
Oqvg1zfGdpz/4D/2UUUBn6pq1vbsoAaF3OesoA3mfDcegDf/H9woJlpT0Wql+e68
Y3FblSokcA==
-----END CERTIFICATE-----`,
    key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp6tBJASD9LFXF
GLCUi2K2Gvl7kQxmjWeyq3/E7FqBualbcgSa3SNulsfuIQXgMMSjsoA7BQI7BVZ4
XFGhqDyUbZrHjzCuCOUKdrjlcOfRd6DUBFqMvTiCzjodnRWvMiWhUZ+WfTOC39W6
bkE2qz05zl9CgGag/dwCfd2fhlVw/QAq2G1zI+WrYO41E3Q9XQPZG0xKIDL2XUqj
o3nH6wB4KUPI4v6xMMueBkFV5nI4q30h3XlLxm1e0DpUyAeecXeMKGfulqDvuux3
/LmIA0BU1lipGX4SDvFoNyy9uAfjpQE6sFwHf1C1OHky2OjF6nl7dkMUb6RDUdQT
6LPk7mfTAgMBAAECggEAKkwTkTjAt4UjzK56tl+EMQTB+ep/hb/JgoaChci4Nva6
m9LkJpDJ0yuhlTuPNOGu8XjrxsVWas7HWarRf0Zb3i7yip6wZYI9Ub+AA015x4DZ
/i0fRU2NFbK0cM67qSL4jxG8gj+kZP3HPGNZxHwX/53JxMolwgmvjMc8NgvAlSFd
NnV9h4xtbhUh1NGS5zmP3iU2rwnE8JrIEzwy6axLom7nekAgkdcbAr0UoBs8gcgH
aYNhU4Gz3tGcZZ0IXAfT/bJIH1Ko8AGv4pssWc3BXcmmNdm/+kzvHIxEIV7Qegmo
XG1ZyZCyD/0b4/3e8ySDBEDqwR+HeyTW2isWG2agAQKBgQDp44aTwr3dkIXY30xv
FPfUOipg/B49dWnffYJ9MWc1FT9ijNPAngWSk0EIiEQIazICcUBI4Yji6/KeyqLJ
GdLpDi1CkKqtyh73mjELinYp3EUQgEa77aQogGa2+nMOVfu+O5CtloUrv/A18jX3
+VEyaEASK0fWmnSI0OdlxQHIAQKBgQC5+xOls2F3MlKASvWRLlnW1wHqlDTtVoYg
5Nh8syZH4Ci2UH8tON3A5/7SWNM0t1cgV6Cw4zW8Z2spgIT/W0iYYrQ4hHL1xdCu
+CxL1km4Gy8Uwpsd+KdFahFqF/XTmLzW0HXLxWSK0fTwmdV0SFrKF3MXfTCU2AeZ
jJoMFb6P0wKBgQC3Odw6s0vkYAzLGhuZxfZkVvDOK5RRF0NKpttr0iEFL9EJFkPo
2KKK8jr3QTDy229BBJGUxsJi6u6VwS8HlehpVQbV59kd7oKV/EBBx0XMg1fDlopT
PNbmN7i/zbIG4AsoOyebJZjL7kBzMn1e9vzKHWtcEHXlw/hZGja8vjooAQKBgAeg
xK2HLfg1mCyq5meN/yFQsENu0LzrT5UJzddPgcJw7zqLEqxIKNBAs7Ls8by3yFsL
PQwERa/0jfCl1M6kb9XQNpQa2pw6ANUsWKTDpUJn2wZ+9N3F1RaDwzMWyH5lRVmK
M0qoTfdjpSg5Jwgd75taWt4bxGJWeflSSv8z5R0BAoGAWL8c527AbeBvx2tOYKkD
2TFranvANNcoMrbeviZSkkGvMNDP3p8b6juJwXOIeWNr8q4vFgCzLmq6d1/9gYm2
3XJwwyD0LKlqzkBrrKU47qrnmMosUrIRlrAzd3HbShOptxc6Iz2apSaUDKGKXkaw
gl5OpEjeliU7Mus0BVS858g=
-----END PRIVATE KEY-----`
};
 //# sourceMappingURL=FetchHTTPSCertificate.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/VirtualServerUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VirtualServerUtility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
const NOT_FOUND_HTML = '<html><head><title>Happy DOM Virtual Server - 404 Not Found</title></head><body><h1>Happy DOM Virtual Server - 404 Not Found</h1></body></html>';
class VirtualServerUtility {
    /**
     * Returns the filesystem path for a request URL if it matches a virtual server.
     *
     * @param window Window.
     * @param requestURL Request URL.
     */ static getFilepath(window, requestURL) {
        const browserSettings = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](window).getSettings();
        if (!browserSettings || !browserSettings.fetch.virtualServers && !browserSettings.module.resolveNodeModules) {
            return null;
        }
        if (browserSettings.fetch.virtualServers) {
            for (const virtualServer of browserSettings.fetch.virtualServers){
                let baseURL = null;
                if (typeof virtualServer.url === 'string') {
                    const url = new URL(virtualServer.url[virtualServer.url.length - 1] === '/' ? virtualServer.url.slice(0, -1) : virtualServer.url, window.location.origin);
                    if (requestURL.startsWith(url.href)) {
                        baseURL = url;
                    }
                } else if (virtualServer.url instanceof RegExp) {
                    const match = requestURL.match(virtualServer.url);
                    if (match) {
                        baseURL = new URL(match[0][match[0].length - 1] === '/' ? match[0].slice(0, -1) : match[0], window.location.origin);
                    }
                }
                if (baseURL) {
                    const path = requestURL.slice(baseURL.href.length).split('?')[0].split('#')[0];
                    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(virtualServer.directory), path.replaceAll('/', __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].sep));
                }
            }
        }
        if (browserSettings.module.resolveNodeModules) {
            const moduleUrl = browserSettings.module.resolveNodeModules.url;
            const url = new URL(moduleUrl[moduleUrl.length - 1] === '/' ? moduleUrl.slice(0, -1) : moduleUrl, window.location.origin);
            if (requestURL.startsWith(url.href)) {
                const path = requestURL.slice(url.href.length).split('?')[0].split('#')[0];
                return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(browserSettings.module.resolveNodeModules.directory), path.replaceAll('/', __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].sep));
            }
        }
        return null;
    }
    /**
     * Returns a 404 response.
     *
     * @param window Window.
     * @returns 404 response.
     */ static getNotFoundResponse(window) {
        return new window.Response(NOT_FOUND_HTML, {
            status: 404,
            statusText: 'Not Found',
            headers: {
                'Content-Type': 'text/html'
            }
        });
    }
    /**
     * Returns a 404 response.
     *
     * @param window Window.
     * @param requestURL Request URL.
     * @returns 404 response.
     */ static getNotFoundSyncResponse(window, requestURL) {
        return {
            status: 404,
            statusText: 'Not Found',
            ok: false,
            url: requestURL,
            redirected: false,
            headers: new window.Headers({
                'Content-Type': 'text/html'
            }),
            body: Buffer.from(NOT_FOUND_HTML),
            [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]]: null
        };
    }
} //# sourceMappingURL=VirtualServerUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/preload/PreloadUtility.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility for preloading resources.
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#link-type-preload
 */ __turbopack_context__.s([
    "default",
    ()=>PreloadUtility
]);
class PreloadUtility {
    /**
     * Returns a key for a preload entry.
     *
     * @param options Options.
     * @param options.url URL.
     * @param options.destination Destination.
     * @param options.mode Mode.
     * @param options.credentialsMode Credentials mode.
     * @returns Key.
     */ static getKey(options) {
        return JSON.stringify({
            url: options.url,
            destination: options.destination,
            mode: options.mode,
            credentialsMode: options.credentialsMode
        });
    }
} //# sourceMappingURL=PreloadUtility.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Fetch.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Fetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestReferrerUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/http [external] (http, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$https__$5b$external$5d$__$28$https$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/https [external] (https, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/zlib [external] (zlib, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/url [external] (url, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$data$2d$uri$2f$DataURIParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/data-uri/DataURIParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchCORSUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Request$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Request.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Response.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/CachedResponseStateEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestHeaderUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestValidationUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseRedirectUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseHeaderUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/certificate/FetchHTTPSCertificate.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/buffer [external] (buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchBodyUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/VirtualServerUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$preload$2f$PreloadUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/preload/PreloadUtility.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const LAST_CHUNK = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].from('0\r\n\r\n');
class Fetch {
    reject = null;
    resolve = null;
    listeners = {
        onSignalAbort: this.onSignalAbort.bind(this)
    };
    isChunkedTransfer = false;
    isProperLastChunkReceived = false;
    previousChunk = null;
    nodeRequest = null;
    nodeResponse = null;
    response = null;
    responseHeaders = null;
    interceptor;
    requestHeaders;
    request;
    redirectCount = 0;
    disableCache;
    disableSameOriginPolicy;
    disablePreload;
    #browserFrame;
    #window;
    #unfilteredHeaders = null;
    /**
     * Constructor.
     *
     * @param options Options.
     * @param options.browserFrame Browser frame.
     * @param options.window Window.
     * @param options.url URL.
     * @param [options.init] Init.
     * @param [options.redirectCount] Redirect count.
     * @param [options.contentType] Content Type.
     * @param [options.disableCache] Disables the use of cached responses. It will still store the response in the cache.
     * @param [options.disableSameOriginPolicy] Disables the Same-Origin policy.
     * @param [options.unfilteredHeaders] Unfiltered headers - necessary for preflight requests.
     * @param [options.disablePreload] Disables the use of preloaded responses.
     */ constructor(options){
        this.#browserFrame = options.browserFrame;
        this.#window = options.window;
        this.#unfilteredHeaders = options.unfilteredHeaders ?? null;
        this.request = typeof options.url === 'string' || options.url instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"] ? new options.window.Request(options.url, options.init) : options.url;
        if (options.contentType) {
            this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] = options.contentType;
        }
        this.redirectCount = options.redirectCount ?? 0;
        this.disableCache = options.disableCache ?? false;
        this.disableSameOriginPolicy = options.disableSameOriginPolicy ?? this.#browserFrame.page.context.browser.settings.fetch.disableSameOriginPolicy ?? false;
        this.interceptor = this.#browserFrame.page.context.browser.settings.fetch.interceptor;
        this.requestHeaders = this.#browserFrame.page.context.browser.settings.fetch.requestHeaders;
        this.disablePreload = options.disablePreload ?? false;
    }
    /**
     * Sends request.
     *
     * @returns Response.
     */ async send() {
        if (!(this.request instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Request$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) || !(this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]] instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"])) {
            throw new this.#window.DOMException('Unknown request object. Request object must be an instance of Request.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].invalidStateError);
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].prepareRequest(new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](this.#window.location.href), this.request);
        if (this.requestHeaders) {
            for (const header of this.requestHeaders){
                if (!header.url || (typeof header.url === 'string' ? header.url.startsWith(this.request.url) : this.request.url.match(header.url))) {
                    for (const [key, value] of Object.entries(header.headers)){
                        this.request.headers.set(key, value);
                    }
                }
            }
        }
        if (this.interceptor?.beforeAsyncRequest) {
            const taskID = this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask();
            const response = await this.interceptor.beforeAsyncRequest({
                request: this.request,
                window: this.#window
            });
            this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
            if (response instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                return response;
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateSchema(this.request);
        if (this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
            if (this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]] !== undefined) {
                throw this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]];
            }
            throw new this.#window.DOMException('signal is aborted without reason', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        }
        if (this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'data:') {
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$data$2d$uri$2f$DataURIParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(this.request.url);
            this.response = new this.#window.Response(result.buffer, {
                headers: {
                    'Content-Type': result.type
                }
            });
            const interceptedResponse = this.interceptor?.afterAsyncResponse ? await this.interceptor.afterAsyncResponse({
                window: this.#window,
                response: this.response,
                request: this.request
            }) : undefined;
            return interceptedResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? interceptedResponse : this.response;
        }
        // Security check for "https" to "http" requests.
        if (this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'http:' && this.#window.location.protocol === 'https:') {
            throw new this.#window.DOMException(`Mixed Content: The page at '${this.#window.location.href}' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint '${this.request.url}'. This request has been blocked; the content must be served over HTTPS.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].securityError);
        }
        if (!this.disableCache) {
            const cachedResponse = await this.getCachedResponse();
            if (cachedResponse) {
                return cachedResponse;
            }
        }
        if (!this.disablePreload) {
            const preloadKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$preload$2f$PreloadUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getKey({
                url: this.request.url,
                destination: 'fetch',
                mode: this.request.mode,
                credentialsMode: this.request.credentials
            });
            const preloadEntry = this.#window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].get(preloadKey);
            if (preloadEntry) {
                this.#window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].delete(preloadKey);
                if (preloadEntry.response) {
                    return preloadEntry.response;
                }
                const taskID = this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask();
                const response = await preloadEntry.onResponseAvailable();
                this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
                return response;
            }
        }
        const virtualServerResponse = await this.getVirtualServerResponse();
        if (virtualServerResponse) {
            return virtualServerResponse;
        }
        if (!this.disableSameOriginPolicy) {
            const compliesWithCrossOriginPolicy = await this.compliesWithCrossOriginPolicy();
            if (!compliesWithCrossOriginPolicy) {
                this.#browserFrame.page.console.warn(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at "${this.request.url}".`);
                throw new this.#window.DOMException(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at "${this.request.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
            }
        }
        return await this.sendRequest();
    }
    /**
     * Returns cached response.
     *
     * @returns Response.
     */ async getCachedResponse() {
        if (this.disableCache) {
            return null;
        }
        let cachedResponse = this.#browserFrame.page.context.responseCache.get(this.request);
        if (!cachedResponse || cachedResponse.response.waitingForBody) {
            return null;
        }
        if (cachedResponse.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].stale) {
            const headers = new this.#window.Headers(cachedResponse.request.headers);
            if (cachedResponse.etag) {
                headers.set('If-None-Match', cachedResponse.etag);
            } else {
                if (!cachedResponse.lastModified) {
                    return null;
                }
                headers.set('If-Modified-Since', new Date(cachedResponse.lastModified).toUTCString());
            }
            const fetch = new Fetch({
                browserFrame: this.#browserFrame,
                window: this.#window,
                url: this.request.url,
                init: {
                    headers,
                    method: cachedResponse.request.method
                },
                disableCache: true,
                disableSameOriginPolicy: true
            });
            if (cachedResponse.etag || !cachedResponse.staleWhileRevalidate) {
                const validateResponse = await fetch.send();
                const body = validateResponse.status !== 304 ? await validateResponse.buffer() : null;
                cachedResponse = this.#browserFrame.page.context.responseCache.add(this.request, {
                    ...validateResponse,
                    body,
                    waitingForBody: false
                });
                if (validateResponse.status !== 304) {
                    const response = new this.#window.Response(body, {
                        status: validateResponse.status,
                        statusText: validateResponse.statusText,
                        headers: validateResponse.headers
                    });
                    response.url = validateResponse.url;
                    response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = cachedResponse;
                    return response;
                }
            } else {
                fetch.send().then((response)=>{
                    response.buffer().then((body)=>{
                        this.#browserFrame.page.context.responseCache.add(this.request, {
                            ...response,
                            body,
                            waitingForBody: false
                        });
                    });
                });
            }
        }
        if (!cachedResponse || cachedResponse.response.waitingForBody) {
            return null;
        }
        const response = new this.#window.Response(cachedResponse.response.body, {
            status: cachedResponse.response.status,
            statusText: cachedResponse.response.statusText,
            headers: cachedResponse.response.headers
        });
        response.url = cachedResponse.response.url;
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = cachedResponse;
        return response;
    }
    /**
     * Returns virtual server response.
     *
     * @returns Response.
     */ async getVirtualServerResponse() {
        let filePath = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFilepath(this.#window, this.request.url);
        if (!filePath) {
            return null;
        }
        const taskID = this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask();
        if (this.request.method !== 'GET') {
            this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} 404 (Not Found)`);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getNotFoundResponse(this.#window);
            const interceptedResponse = this.interceptor?.afterAsyncResponse ? await this.interceptor.afterAsyncResponse({
                window: this.#window,
                response: await response,
                request: this.request
            }) : undefined;
            this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
            return interceptedResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? interceptedResponse : response;
        }
        let buffer;
        try {
            const stat = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.stat(filePath);
            filePath = stat.isDirectory() ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(filePath, 'index.html') : filePath;
            buffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].promises.readFile(filePath);
        } catch (error) {
            this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} 404 (Not Found)`);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getNotFoundResponse(this.#window);
            const interceptedResponse = this.interceptor?.afterAsyncResponse ? await this.interceptor.afterAsyncResponse({
                window: this.#window,
                response: await response,
                request: this.request
            }) : undefined;
            this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
            return interceptedResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? interceptedResponse : response;
        }
        const body = new this.#window.ReadableStream({
            start: (controller)=>{
                this.#window.queueMicrotask(()=>{
                    controller.enqueue(buffer);
                    controller.close();
                });
            }
        });
        const response = new this.#window.Response(body);
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] = buffer;
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] = filePath;
        response.url = this.request.url;
        const interceptedResponse = this.interceptor?.afterAsyncResponse ? await this.interceptor.afterAsyncResponse({
            window: this.#window,
            response: await response,
            request: this.request
        }) : undefined;
        this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
        const returnResponse = interceptedResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? interceptedResponse : response;
        const cacheableResponse = {
            ...returnResponse,
            body: buffer,
            waitingForBody: false,
            virtual: true
        };
        response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = this.#browserFrame.page.context.responseCache.add(this.request, cacheableResponse);
        return returnResponse;
    }
    /**
     * Checks if the request complies with the Cross-Origin policy.
     *
     * @returns True if it complies with the policy.
     */ async compliesWithCrossOriginPolicy() {
        if (this.disableSameOriginPolicy || !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isCORS(this.#window.location.href, this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]])) {
            return true;
        }
        const cachedPreflightResponse = this.#browserFrame.page.context.preflightResponseCache.get(this.request);
        if (cachedPreflightResponse) {
            if (cachedPreflightResponse.allowOrigin !== '*' && cachedPreflightResponse.allowOrigin !== this.#window.location.origin) {
                return false;
            }
            if (cachedPreflightResponse.allowMethods.length !== 0 && !cachedPreflightResponse.allowMethods.includes(this.request.method)) {
                return false;
            }
            return true;
        }
        const requestHeaders = [];
        for (const [header] of this.request.headers){
            requestHeaders.push(header.toLowerCase());
        }
        const corsHeaders = new this.#window.Headers({
            'Access-Control-Request-Method': this.request.method,
            Origin: this.#window.location.origin
        });
        if (requestHeaders.length > 0) {
            // This intentionally does not use "combine" (comma + space), as the spec dictates.
            // See https://fetch.spec.whatwg.org/#cors-preflight-fetch for more details.
            // Sorting the headers is not required, but can optimize cache hits.
            corsHeaders.set('Access-Control-Request-Headers', requestHeaders.slice().sort().join(','));
        }
        const fetch = new Fetch({
            browserFrame: this.#browserFrame,
            window: this.#window,
            url: this.request.url,
            init: {
                method: 'OPTIONS'
            },
            disableCache: true,
            disableSameOriginPolicy: true,
            unfilteredHeaders: corsHeaders
        });
        const response = await fetch.send();
        if (!response.ok) {
            return false;
        }
        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
        if (!allowOrigin) {
            return false;
        }
        if (allowOrigin !== '*' && allowOrigin !== this.#window.location.origin) {
            return false;
        }
        const allowMethods = [];
        if (response.headers.has('Access-Control-Allow-Methods')) {
            const allowMethodsHeader = response.headers.get('Access-Control-Allow-Methods');
            if (allowMethodsHeader !== '*') {
                for (const method of allowMethodsHeader.split(',')){
                    allowMethods.push(method.trim().toUpperCase());
                }
            }
        }
        if (allowMethods.length !== 0 && !allowMethods.includes(this.request.method)) {
            return false;
        }
        // TODO: Add support for more Access-Control-Allow-* headers.
        return true;
    }
    /**
     * Sends request.
     *
     * @returns Response.
     */ sendRequest() {
        return new Promise((resolve, reject)=>{
            const taskID = this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].startTask(()=>this.onAsyncTaskManagerAbort());
            if (this.resolve) {
                throw new this.#window.Error('Fetch already sent.');
            }
            this.resolve = async (response)=>{
                // We can end up here when closing down the browser frame and there is an ongoing request.
                // Therefore, we need to check if browserFrame.page.context is still available.
                if (!this.disableCache && response instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] && this.#browserFrame.page && this.#browserFrame.page.context) {
                    response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cachedResponse"]] = this.#browserFrame.page.context.responseCache.add(this.request, {
                        ...response,
                        headers: this.responseHeaders,
                        body: response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]],
                        waitingForBody: !response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]] && !!response.body
                    });
                }
                const interceptedResponse = this.interceptor?.afterAsyncResponse ? await this.interceptor.afterAsyncResponse({
                    window: this.#window,
                    response: await response,
                    request: this.request
                }) : undefined;
                this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
                const returnResponse = interceptedResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? interceptedResponse : response;
                // The browser outputs errors to the console when the response is not ok.
                if (returnResponse instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Response$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] && !returnResponse.ok) {
                    this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} ${returnResponse.status} (${returnResponse.statusText})`);
                }
                resolve(returnResponse);
            };
            this.reject = (error)=>{
                this.#browserFrame[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["asyncTaskManager"]].endTask(taskID);
                reject(error);
            };
            this.request.signal.addEventListener('abort', this.listeners.onSignalAbort);
            const send = (this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'https:' ? __TURBOPACK__imported__module__$5b$externals$5d2f$https__$5b$external$5d$__$28$https$2c$__cjs$29$__["default"] : __TURBOPACK__imported__module__$5b$externals$5d2f$http__$5b$external$5d$__$28$http$2c$__cjs$29$__["default"]).request;
            this.nodeRequest = send(this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].href, {
                method: this.request.method,
                headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRequestHeaders({
                    browserFrame: this.#browserFrame,
                    window: this.#window,
                    request: this.request,
                    baseHeaders: this.#unfilteredHeaders
                }),
                agent: false,
                rejectUnauthorized: !this.#browserFrame.page.context.browser.settings.fetch.disableStrictSSL,
                key: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'https:' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].key : undefined,
                cert: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'https:' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cert : undefined
            });
            this.nodeRequest.on('error', this.onError.bind(this));
            this.nodeRequest.on('socket', this.onSocket.bind(this));
            this.nodeRequest.on('response', this.onResponse.bind(this));
            if (this.request.body === null) {
                this.nodeRequest.end();
            } else {
                __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(this.request.body, this.nodeRequest, (error)=>{
                    if (error) {
                        this.onError(error);
                    }
                });
            }
        });
    }
    /**
     * Event listener for "socket" event.
     *
     * @param socket Socket.
     */ onSocket(socket) {
        const onSocketClose = ()=>{
            if (this.isChunkedTransfer && !this.isProperLastChunkReceived) {
                const error = new this.#window.DOMException('Premature close.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
                this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
                if (this.response) {
                    this.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
                    if (this.response.body && !this.response.body.locked) {
                        this.response.body.cancel(error);
                    }
                }
            }
        };
        const onData = (buffer)=>{
            this.isProperLastChunkReceived = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].compare(buffer.slice(-5), LAST_CHUNK) === 0;
            // Sometimes final 0-length chunk and end of message code are in separate packets.
            if (!this.isProperLastChunkReceived && this.previousChunk) {
                this.isProperLastChunkReceived = __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].compare(this.previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && __TURBOPACK__imported__module__$5b$externals$5d2f$buffer__$5b$external$5d$__$28$buffer$2c$__cjs$29$__["Buffer"].compare(buffer.slice(-2), LAST_CHUNK.slice(3)) === 0;
            }
            this.previousChunk = buffer;
        };
        socket.prependListener('close', onSocketClose);
        socket.on('data', onData);
        this.nodeRequest.on('close', ()=>{
            socket.removeListener('close', onSocketClose);
            socket.removeListener('data', onData);
        });
    }
    /**
     * Event listener for signal "abort" event.
     *
     * @param event Event.
     */ onSignalAbort(event) {
        this.finalizeRequest();
        this.abort(event.target?.reason);
    }
    /**
     * Event listener for request "error" event.
     *
     * @param error Error.
     */ onError(error) {
        this.finalizeRequest();
        this.#browserFrame.page.console.error(error);
        this.reject(new this.#window.DOMException(`Failed to execute "fetch()" on "Window" with URL "${this.request.url}": ${error.message}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError));
    }
    /**
     * Triggered when the async task manager aborts.
     */ onAsyncTaskManagerAbort() {
        const error = new this.#window.DOMException('The operation was aborted.', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
        this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
        if (this.response) {
            this.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            this.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
        }
        if (this.listeners.onSignalAbort) {
            this.request.signal.removeEventListener('abort', this.listeners.onSignalAbort);
        }
        if (this.nodeRequest && !this.nodeRequest.destroyed) {
            this.nodeRequest.destroy(error);
        }
        if (this.nodeResponse && !this.nodeResponse.destroyed) {
            this.nodeResponse.destroy(error);
        }
        if (this.response && this.response.body) {
            if (!this.response.body.locked) {
                this.response.body.cancel(error);
            }
        }
    }
    /**
     * Event listener for request "response" event.
     *
     * @param nodeResponse Node response.
     */ onResponse(nodeResponse) {
        // Needed for handling bad endings of chunked transfer.
        this.isChunkedTransfer = nodeResponse.headers['transfer-encoding'] === 'chunked' && !nodeResponse.headers['content-length'];
        this.nodeRequest.setTimeout(0);
        this.responseHeaders = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parseResponseHeaders({
            browserFrame: this.#browserFrame,
            requestURL: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]],
            rawHeaders: nodeResponse.rawHeaders
        });
        if (this.handleRedirectResponse(nodeResponse, this.responseHeaders)) {
            return;
        }
        nodeResponse.once('end', ()=>this.request.signal.removeEventListener('abort', this.listeners.onSignalAbort));
        let body = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(nodeResponse, new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].PassThrough(), (error)=>{
            if (error) {
            // Ignore error as it is forwarded to the response body.
            }
        });
        const responseOptions = {
            status: nodeResponse.statusCode,
            statusText: nodeResponse.statusMessage,
            headers: this.responseHeaders
        };
        const contentEncodingHeader = this.responseHeaders.get('Content-Encoding');
        if (this.request.method === 'HEAD' || contentEncodingHeader === null || nodeResponse.statusCode === 204 || nodeResponse.statusCode === 304) {
            this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
            this.response.redirected = this.redirectCount > 0;
            this.response.url = this.request.url;
            this.resolve(this.response);
            return;
        }
        // For GZip
        if (contentEncodingHeader === 'gzip' || contentEncodingHeader === 'x-gzip') {
            // Be less strict when decoding compressed responses.
            // Sometimes servers send slightly invalid responses that are still accepted by common browsers.
            // "cURL" always uses Z_SYNC_FLUSH.
            const zlibOptions = {
                flush: __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].constants.Z_SYNC_FLUSH,
                finishFlush: __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].constants.Z_SYNC_FLUSH
            };
            body = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(body, __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].createGunzip(zlibOptions), (error)=>{
                if (error) {
                // Ignore error as it is forwarded to the response body.
                }
            });
            this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
            this.response.redirected = this.redirectCount > 0;
            this.response.url = this.request.url;
            this.resolve(this.response);
            return;
        }
        // For Deflate
        if (contentEncodingHeader === 'deflate' || contentEncodingHeader === 'x-deflate') {
            // Handle the infamous raw deflate response from old servers
            // A hack for old IIS and Apache servers
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(nodeResponse, new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].PassThrough(), (error)=>{
                if (error) {
                // Ignore error as it is forwarded to the response body.
                }
            });
            raw.on('data', (chunk)=>{
                // See http://stackoverflow.com/questions/37519828
                if ((chunk[0] & 0x0f) === 0x08) {
                    body = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(body, __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].createInflate(), (error)=>{
                        if (error) {
                        // Ignore error as the fetch() promise has already been resolved.
                        }
                    });
                } else {
                    body = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(body, __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].createInflateRaw(), (error)=>{
                        if (error) {
                        // Ignore error as it is forwarded to the response body.
                        }
                    });
                }
                this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
                this.response.redirected = this.redirectCount > 0;
                this.response.url = this.request.url;
                this.resolve(this.response);
            });
            raw.on('end', ()=>{
                // Some old IIS servers return zero-length OK deflate responses, so 'data' is never emitted.
                if (!this.response) {
                    this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
                    this.response.redirected = this.redirectCount > 0;
                    this.response.url = this.request.url;
                    this.resolve(this.response);
                }
            });
            return;
        }
        // For BR
        if (contentEncodingHeader === 'br') {
            body = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].pipeline(body, __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].createBrotliDecompress(), (error)=>{
                if (error) {
                // Ignore error as it is forwarded to the response body.
                }
            });
            this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
            this.response.redirected = this.redirectCount > 0;
            this.response.url = this.request.url;
            this.resolve(this.response);
            return;
        }
        // Otherwise, use response as is
        this.response = new this.#window.Response(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchBodyUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].nodeToWebStream(body), responseOptions);
        this.response.redirected = this.redirectCount > 0;
        this.response.url = this.request.url;
        this.resolve(this.response);
    }
    /**
     * Handles redirect response.
     *
     * @param nodeResponse Node response.
     * @param responseHeaders Headers.
     * @returns True if redirect response was handled, false otherwise.
     */ handleRedirectResponse(nodeResponse, responseHeaders) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isRedirect(nodeResponse.statusCode)) {
            return false;
        }
        switch(this.request.redirect){
            case 'error':
                this.finalizeRequest();
                this.reject(new this.#window.DOMException(`URI requested responds with a redirect, redirect mode is set to "error": ${this.request.url}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError));
                return true;
            case 'manual':
                // Nothing to do
                return false;
            case 'follow':
                const locationHeader = responseHeaders.get('Location');
                const shouldBecomeGetRequest = nodeResponse.statusCode === 303 || (nodeResponse.statusCode === 301 || nodeResponse.statusCode === 302) && this.request.method === 'POST';
                let locationURL = null;
                if (locationHeader !== null) {
                    try {
                        locationURL = new __TURBOPACK__imported__module__$5b$externals$5d2f$url__$5b$external$5d$__$28$url$2c$__cjs$29$__["URL"](locationHeader, this.request.url);
                    } catch  {
                        this.finalizeRequest();
                        this.reject(new this.#window.DOMException(`URI requested responds with an invalid redirect URL: ${locationHeader}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].uriMismatchError));
                        return true;
                    }
                }
                if (locationURL === null) {
                    return false;
                }
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isMaxRedirectsReached(this.redirectCount)) {
                    this.finalizeRequest();
                    this.reject(new this.#window.DOMException(`Maximum redirects reached at: ${this.request.url}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError));
                    return true;
                }
                const headers = new this.#window.Headers(this.request.headers);
                const requestInit = {
                    method: this.request.method,
                    signal: this.request.signal,
                    referrer: this.request.referrer,
                    referrerPolicy: this.request.referrerPolicy,
                    credentials: this.request.credentials,
                    headers,
                    body: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]]
                };
                if (this.request.credentials === 'omit' || this.request.credentials === 'same-origin' && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isCORS(this.#window.location.href, locationURL)) {
                    headers.delete('cookie');
                    headers.delete('cookie2');
                }
                if (this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
                    this.abort(this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]]);
                    return true;
                }
                if (shouldBecomeGetRequest) {
                    requestInit.method = 'GET';
                    requestInit.body = undefined;
                    headers.delete('Content-Length');
                    headers.delete('Content-Type');
                }
                const responseReferrerPolicy = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getReferrerPolicyFromHeader(headers);
                if (responseReferrerPolicy) {
                    requestInit.referrerPolicy = responseReferrerPolicy;
                }
                const fetch = new Fetch({
                    browserFrame: this.#browserFrame,
                    window: this.#window,
                    url: locationURL,
                    init: requestInit,
                    redirectCount: this.redirectCount + 1,
                    disableSameOriginPolicy: this.disableSameOriginPolicy,
                    contentType: !shouldBecomeGetRequest ? this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] : null
                });
                this.finalizeRequest();
                fetch.send().then((response)=>this.resolve(response)).catch((error)=>this.reject(error));
                return true;
            default:
                this.finalizeRequest();
                this.reject(new this.#window.DOMException(`Redirect option '${this.request.redirect}' is not a valid value of TRequestRedirect`));
                return true;
        }
    }
    /**
     * Finalizes the request.
     */ finalizeRequest() {
        this.request.signal.removeEventListener('abort', this.listeners.onSignalAbort);
        this.nodeRequest?.destroy();
    }
    /**
     * Aborts the request.
     *
     * @param reason Reason.
     */ abort(reason) {
        const error = new this.#window.DOMException('The operation was aborted.' + (reason ? ' ' + reason.toString() : ''), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
        this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
        if (this.response) {
            this.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
            this.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["error"]] = error;
        }
        if (this.nodeRequest && !this.nodeRequest.destroyed) {
            this.nodeRequest.destroy(error);
        }
        if (this.nodeResponse && !this.nodeResponse.destroyed) {
            this.nodeResponse.destroy(error);
        }
        if (this.response && this.response.body) {
            if (!this.response.body.locked) {
                this.response.body.cancel(error);
            }
        }
        if (this.reject) {
            this.reject(reason !== undefined ? reason : error);
        }
    }
} //# sourceMappingURL=Fetch.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/SyncFetchScriptBuilder.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SyncFetchScriptBuilder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/certificate/FetchHTTPSCertificate.js [app-ssr] (ecmascript)");
;
class SyncFetchScriptBuilder {
    /**
     * Sends a synchronous request.
     *
     * @param request Request.
     * @param request.url
     * @param request.method
     * @param request.headers
     * @param request.body
     * @param request.disableStrictSSL
     * @returns Script.
     */ static getScript(request) {
        const sortedHeaders = {};
        const headerNames = Object.keys(request.headers).sort();
        for (const name of headerNames){
            sortedHeaders[name] = request.headers[name];
        }
        return `
                const sendRequest = require('http${request.url.protocol === 'https:' ? 's' : ''}').request;
                const options = ${JSON.stringify({
            method: request.method,
            headers: sortedHeaders,
            agent: false,
            rejectUnauthorized: !request.disableStrictSSL,
            key: request.url.protocol === 'https:' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].key : undefined,
            cert: request.url.protocol === 'https:' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$certificate$2f$FetchHTTPSCertificate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].cert : undefined
        }, null, 4)};
                const request = sendRequest(${JSON.stringify(request.url.href)}, options, (incomingMessage) => {
                    let data = Buffer.alloc(0);
                    incomingMessage.on('data', (chunk) => {
                        data = Buffer.concat([data, Buffer.from(chunk)]);
                    });
                    incomingMessage.on('end', () => {
                        console.log(JSON.stringify({
                            error: null,
                            incomingMessage: {
                                statusCode: incomingMessage.statusCode,
                                statusMessage: incomingMessage.statusMessage,
                                rawHeaders: incomingMessage.rawHeaders,
                                data: data.toString('base64')
                            }
                        }));
                    });
                    incomingMessage.on('error', (error) => {
                        console.log(JSON.stringify({ error: error.message, incomingMessage: null }));
                    });
                });
                request.write(Buffer.from('${request.body ? request.body.toString('base64') : ''}', 'base64'));
                request.end();
            `;
    }
} //# sourceMappingURL=SyncFetchScriptBuilder.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/SyncFetch.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SyncFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/url/URL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/response/CachedResponseStateEnum.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestReferrerUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestValidationUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$data$2d$uri$2f$DataURIParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/data-uri/DataURIParser.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$SyncFetchScriptBuilder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/SyncFetchScriptBuilder.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchRequestHeaderUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseHeaderUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/zlib [external] (zlib, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchResponseRedirectUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/FetchCORSUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Fetch.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/utilities/VirtualServerUtility.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
class SyncFetch {
    request;
    redirectCount = 0;
    disableCache;
    disableSameOriginPolicy;
    interceptor;
    requestHeaders;
    #browserFrame;
    #window;
    #unfilteredHeaders = null;
    /**
     * Constructor.
     *
     * @param options Options.
     * @param options.browserFrame Browser frame.
     * @param options.window Window.
     * @param options.url URL.
     * @param [options.init] Init.
     * @param [options.redirectCount] Redirect count.
     * @param [options.contentType] Content Type.
     * @param [options.disableCache] Disables the use of cached responses. It will still store the response in the cache.
     * @param [options.disableSameOriginPolicy] Disables the Same-Origin policy.
     * @param [options.unfilteredHeaders] Unfiltered headers - necessary for preflight requests.
     */ constructor(options){
        this.#browserFrame = options.browserFrame;
        this.#window = options.window;
        this.#unfilteredHeaders = options.unfilteredHeaders ?? null;
        this.request = typeof options.url === 'string' || options.url instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? new options.window.Request(options.url, options.init) : options.url;
        if (options.contentType) {
            this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] = options.contentType;
        }
        this.redirectCount = options.redirectCount ?? 0;
        this.disableCache = options.disableCache ?? false;
        this.disableSameOriginPolicy = options.disableSameOriginPolicy ?? this.#browserFrame.page.context.browser.settings.fetch.disableSameOriginPolicy ?? false;
        this.interceptor = this.#browserFrame.page.context.browser.settings.fetch.interceptor;
        this.requestHeaders = this.#browserFrame.page.context.browser.settings.fetch.requestHeaders;
    }
    /**
     * Sends request.
     *
     * @returns Response.
     */ send() {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].prepareRequest(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.#window.location.href), this.request);
        if (this.requestHeaders) {
            for (const header of this.requestHeaders){
                if (!header.url || (typeof header.url === 'string' ? header.url.startsWith(this.request.url) : this.request.url.match(header.url))) {
                    for (const [key, value] of Object.entries(header.headers)){
                        this.request.headers.set(key, value);
                    }
                }
            }
        }
        if (this.interceptor?.beforeSyncRequest) {
            const beforeRequestResponse = this.interceptor.beforeSyncRequest({
                request: this.request,
                window: this.#window
            });
            if (typeof beforeRequestResponse === 'object') {
                return beforeRequestResponse;
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestValidationUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].validateSchema(this.request);
        if (this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
            if (this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]] !== undefined) {
                throw this.request.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]];
            }
            throw new this.#window.DOMException('signal is aborted without reason', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        }
        if (this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'data:') {
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$data$2d$uri$2f$DataURIParser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(this.request.url);
            const response = {
                status: 200,
                statusText: 'OK',
                ok: true,
                url: this.request.url,
                redirected: false,
                headers: new this.#window.Headers({
                    'Content-Type': result.type
                }),
                body: result.buffer,
                [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]]: null
            };
            const interceptedResponse = this.interceptor?.afterSyncResponse ? this.interceptor.afterSyncResponse({
                window: this.#window,
                response,
                request: this.request
            }) : undefined;
            return typeof interceptedResponse === 'object' ? interceptedResponse : response;
        }
        // Security check for "https" to "http" requests.
        if (this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]].protocol === 'http:' && this.#window.location.protocol === 'https:') {
            throw new this.#window.DOMException(`Mixed Content: The page at '${this.#window.location.href}' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint '${this.request.url}'. This request has been blocked; the content must be served over HTTPS.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].securityError);
        }
        const cachedResponse = this.getCachedResponse();
        if (cachedResponse) {
            return cachedResponse;
        }
        const virtualServerResponse = this.getVirtualServerResponse();
        if (virtualServerResponse) {
            return virtualServerResponse;
        }
        if (!this.compliesWithCrossOriginPolicy()) {
            this.#window.console.warn(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at "${this.request.url}".`);
            throw new this.#window.DOMException(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at "${this.request.url}".`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
        }
        return this.sendRequest();
    }
    /**
     * Returns cached response.
     *
     * @returns Response.
     */ getCachedResponse() {
        if (this.disableCache) {
            return null;
        }
        let cachedResponse = this.#browserFrame.page.context.responseCache.get(this.request);
        if (!cachedResponse || cachedResponse.response.waitingForBody) {
            return null;
        }
        if (cachedResponse.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$cache$2f$response$2f$CachedResponseStateEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].stale) {
            const headers = new this.#window.Headers(cachedResponse.request.headers);
            if (cachedResponse.etag) {
                headers.set('If-None-Match', cachedResponse.etag);
            } else {
                if (!cachedResponse.lastModified) {
                    return null;
                }
                headers.set('If-Modified-Since', new Date(cachedResponse.lastModified).toUTCString());
            }
            if (cachedResponse.etag || !cachedResponse.staleWhileRevalidate) {
                const fetch = new SyncFetch({
                    browserFrame: this.#browserFrame,
                    window: this.#window,
                    url: this.request.url,
                    init: {
                        headers,
                        method: cachedResponse.request.method
                    },
                    disableCache: true,
                    disableSameOriginPolicy: true
                });
                const validateResponse = fetch.send();
                const body = validateResponse.status !== 304 ? validateResponse.body : null;
                cachedResponse = this.#browserFrame.page.context.responseCache.add(this.request, {
                    ...validateResponse,
                    body,
                    waitingForBody: false
                });
                if (validateResponse.status !== 304) {
                    return validateResponse;
                }
            } else {
                const fetch = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                    browserFrame: this.#browserFrame,
                    window: this.#window,
                    url: this.request.url,
                    init: {
                        headers,
                        method: cachedResponse.request.method
                    },
                    disableCache: true,
                    disableSameOriginPolicy: true
                });
                fetch.send().then((response)=>{
                    response.buffer().then((body)=>{
                        this.#browserFrame.page.context.responseCache.add(this.request, {
                            ...response,
                            body,
                            waitingForBody: false
                        });
                    });
                });
            }
        }
        if (!cachedResponse || cachedResponse.response.waitingForBody) {
            return null;
        }
        return {
            status: cachedResponse.response.status,
            statusText: cachedResponse.response.statusText,
            ok: true,
            url: cachedResponse.response.url,
            // TODO: Do we need to add support for redirected responses to the cache?
            redirected: false,
            headers: cachedResponse.response.headers,
            body: cachedResponse.response.body,
            [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]]: cachedResponse.response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] || null
        };
    }
    /**
     * Returns virtual server response.
     *
     * @returns Response.
     */ getVirtualServerResponse() {
        let filePath = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getFilepath(this.#window, this.request.url);
        if (!filePath) {
            return null;
        }
        if (this.request.method !== 'GET') {
            this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} 404 (Not Found)`);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getNotFoundSyncResponse(this.#window, this.request.url);
            const interceptedResponse = this.interceptor?.afterSyncResponse ? this.interceptor.afterSyncResponse({
                window: this.#window,
                response,
                request: this.request
            }) : undefined;
            return typeof interceptedResponse === 'object' ? interceptedResponse : response;
        }
        let buffer;
        try {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(filePath);
            filePath = stat.isDirectory() ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(filePath, 'index.html') : filePath;
            buffer = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath);
        } catch  {
            this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} 404 (Not Found)`);
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$VirtualServerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getNotFoundSyncResponse(this.#window, this.request.url);
            const interceptedResponse = this.interceptor?.afterSyncResponse ? this.interceptor.afterSyncResponse({
                window: this.#window,
                response,
                request: this.request
            }) : undefined;
            return typeof interceptedResponse === 'object' ? interceptedResponse : response;
        }
        const response = {
            status: 200,
            statusText: '',
            ok: true,
            url: this.request.url,
            redirected: false,
            headers: new this.#window.Headers(),
            body: buffer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]]: filePath
        };
        const interceptedResponse = this.interceptor?.afterSyncResponse ? this.interceptor.afterSyncResponse({
            window: this.#window,
            response,
            request: this.request
        }) : undefined;
        const returnResponse = typeof interceptedResponse === 'object' ? interceptedResponse : response;
        this.#browserFrame.page.context.responseCache.add(this.request, {
            ...returnResponse,
            waitingForBody: false,
            virtual: true
        });
        return returnResponse;
    }
    /**
     * Checks if the request complies with the Cross-Origin policy.
     *
     * @returns True if it complies with the policy.
     */ compliesWithCrossOriginPolicy() {
        if (this.disableSameOriginPolicy || !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isCORS(this.#window.location.href, this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]])) {
            return true;
        }
        const cachedPreflightResponse = this.#browserFrame.page.context.preflightResponseCache.get(this.request);
        if (cachedPreflightResponse) {
            if (cachedPreflightResponse.allowOrigin !== '*' && cachedPreflightResponse.allowOrigin !== this.#window.location.origin) {
                return false;
            }
            if (cachedPreflightResponse.allowMethods.length !== 0 && !cachedPreflightResponse.allowMethods.includes(this.request.method)) {
                return false;
            }
            return true;
        }
        const requestHeaders = [];
        for (const [header] of this.request.headers){
            requestHeaders.push(header.toLowerCase());
        }
        const corsHeaders = new this.#window.Headers({
            'Access-Control-Request-Method': this.request.method,
            Origin: this.#window.location.origin
        });
        if (requestHeaders.length > 0) {
            // This intentionally does not use "combine" (comma + space), as the spec dictates.
            // See https://fetch.spec.whatwg.org/#cors-preflight-fetch for more details.
            // Sorting the headers is not required, but can optimize cache hits.
            corsHeaders.set('Access-Control-Request-Headers', requestHeaders.slice().sort().join(','));
        }
        const fetch = new SyncFetch({
            browserFrame: this.#browserFrame,
            window: this.#window,
            url: this.request.url,
            init: {
                method: 'OPTIONS'
            },
            disableCache: true,
            disableSameOriginPolicy: true,
            unfilteredHeaders: corsHeaders
        });
        const response = fetch.send();
        if (!response.ok) {
            return false;
        }
        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
        if (!allowOrigin) {
            return false;
        }
        if (allowOrigin !== '*' && allowOrigin !== this.#window.location.origin) {
            return false;
        }
        const allowMethods = [];
        if (response.headers.has('Access-Control-Allow-Methods')) {
            const allowMethodsHeader = response.headers.get('Access-Control-Allow-Methods');
            if (allowMethodsHeader !== '*') {
                for (const method of allowMethodsHeader.split(',')){
                    allowMethods.push(method.trim().toUpperCase());
                }
            }
        }
        if (allowMethods.length !== 0 && !allowMethods.includes(this.request.method)) {
            return false;
        }
        // TODO: Add support for more Access-Control-Allow-* headers.
        return true;
    }
    /**
     * Sends request.
     *
     * @returns Response.
     */ sendRequest() {
        if (!this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]] && this.request.body) {
            throw new this.#window.DOMException(`Streams are not supported as request body for synchronous requests.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].notSupportedError);
        }
        const script = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$SyncFetchScriptBuilder$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getScript({
            url: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]],
            method: this.request.method,
            headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getRequestHeaders({
                browserFrame: this.#browserFrame,
                window: this.#window,
                request: this.request,
                baseHeaders: this.#unfilteredHeaders
            }),
            disableStrictSSL: this.#browserFrame.page.context.browser.settings.fetch.disableStrictSSL,
            body: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]]
        });
        // Start the other Node Process, executing this string
        const content = __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["default"].execFileSync(process.argv[0], [
            '-e',
            script
        ], {
            encoding: 'buffer',
            maxBuffer: 1024 * 1024 * 1024 // TODO: Consistent buffer size: 1GB.
        });
        // If content length is 0, then there was an error
        if (!content.length) {
            throw new this.#window.DOMException(`Synchronous fetch to "${this.request.url}" failed.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
        }
        const { error, incomingMessage } = JSON.parse(content.toString());
        if (error) {
            throw new this.#window.DOMException(`Synchronous fetch to "${this.request.url}" failed. Error: ${error}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
        }
        const headers = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseHeaderUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parseResponseHeaders({
            browserFrame: this.#browserFrame,
            requestURL: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["url"]],
            rawHeaders: incomingMessage.rawHeaders
        });
        const response = {
            status: incomingMessage.statusCode,
            statusText: incomingMessage.statusMessage,
            ok: incomingMessage.statusCode >= 200 && incomingMessage.statusCode < 300,
            url: this.request.url,
            redirected: this.redirectCount > 0,
            headers,
            body: this.parseIResponseBody({
                headers,
                status: incomingMessage.statusCode,
                body: Buffer.from(incomingMessage.data, 'base64')
            })
        };
        const redirectedResponse = this.handleRedirectResponse(response) || response;
        if (!this.disableCache && !redirectedResponse.redirected) {
            this.#browserFrame.page.context.responseCache.add(this.request, {
                status: redirectedResponse.status,
                statusText: redirectedResponse.statusText,
                url: redirectedResponse.url,
                headers: redirectedResponse.headers,
                body: redirectedResponse.body,
                waitingForBody: false
            });
        }
        const interceptedResponse = this.interceptor?.afterSyncResponse ? this.interceptor.afterSyncResponse({
            window: this.#window,
            response: redirectedResponse,
            request: this.request
        }) : undefined;
        const returnResponse = typeof interceptedResponse === 'object' ? interceptedResponse : redirectedResponse;
        if (!returnResponse.ok) {
            this.#browserFrame.page.console.error(`${this.request.method} ${this.request.url} ${returnResponse.status} (${returnResponse.statusText})`);
        }
        return returnResponse;
    }
    /**
     * Parses response body.
     *
     * @param options Options.
     * @param options.headers Headers.
     * @param options.status Status.
     * @param options.body Body.
     * @returns Parsed body.
     */ parseIResponseBody(options) {
        const contentEncodingHeader = options.headers.get('Content-Encoding');
        if (this.request.method === 'HEAD' || contentEncodingHeader === null || options.status === 204 || options.status === 304) {
            return options.body;
        }
        try {
            // For GZip
            if (contentEncodingHeader === 'gzip' || contentEncodingHeader === 'x-gzip') {
                // Be less strict when decoding compressed responses by using Z_SYNC_FLUSH.
                // Sometimes servers send slightly invalid responses that are still accepted by common browsers.
                // "cURL" always uses Z_SYNC_FLUSH.
                return __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].gunzipSync(options.body, {
                    flush: __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].constants.Z_SYNC_FLUSH,
                    finishFlush: __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].constants.Z_SYNC_FLUSH
                });
            }
            // For Deflate
            if (contentEncodingHeader === 'deflate' || contentEncodingHeader === 'x-deflate') {
                return __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].inflateSync(options.body);
            }
            // For BR
            if (contentEncodingHeader === 'br') {
                return __TURBOPACK__imported__module__$5b$externals$5d2f$zlib__$5b$external$5d$__$28$zlib$2c$__cjs$29$__["default"].brotliDecompressSync(options.body);
            }
        } catch (error) {
            throw new this.#window.DOMException(`Failed to read response body. Error: ${error.message}.`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].encodingError);
        }
        return options.body;
    }
    /**
     * Handles redirect response.
     *
     * @param response Response.
     * @returns Redirected response or null.
     */ handleRedirectResponse(response) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isRedirect(response.status)) {
            return null;
        }
        switch(this.request.redirect){
            case 'error':
                throw new this.#window.DOMException(`URI requested responds with a redirect, redirect mode is set to "error": ${this.request.url}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
            case 'manual':
                return null;
            case 'follow':
                const locationHeader = response.headers.get('Location');
                const shouldBecomeGetRequest = response.status === 303 || (response.status === 301 || response.status === 302) && this.request.method === 'POST';
                let locationURL = null;
                if (locationHeader !== null) {
                    try {
                        locationURL = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](locationHeader, this.request.url);
                    } catch  {
                        throw new this.#window.DOMException(`URI requested responds with an invalid redirect URL: ${locationHeader}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].uriMismatchError);
                    }
                }
                if (locationURL === null) {
                    return null;
                }
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchResponseRedirectUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isMaxRedirectsReached(this.redirectCount)) {
                    throw new this.#window.DOMException(`Maximum redirects reached at: ${this.request.url}`, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].networkError);
                }
                const headers = new this.#window.Headers(this.request.headers);
                const requestInit = {
                    method: this.request.method,
                    signal: this.request.signal,
                    referrer: this.request.referrer,
                    referrerPolicy: this.request.referrerPolicy,
                    credentials: this.request.credentials,
                    headers,
                    body: this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bodyBuffer"]]
                };
                if (this.request.credentials === 'omit' || this.request.credentials === 'same-origin' && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchCORSUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].isCORS(this.#window.location.href, locationURL)) {
                    headers.delete('cookie');
                    headers.delete('cookie2');
                }
                if (shouldBecomeGetRequest) {
                    requestInit.method = 'GET';
                    requestInit.body = undefined;
                    headers.delete('Content-Length');
                    headers.delete('Content-Type');
                }
                const responseReferrerPolicy = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$utilities$2f$FetchRequestReferrerUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getReferrerPolicyFromHeader(headers);
                if (responseReferrerPolicy) {
                    requestInit.referrerPolicy = responseReferrerPolicy;
                }
                const fetch = new SyncFetch({
                    browserFrame: this.#browserFrame,
                    window: this.#window,
                    url: locationURL,
                    init: requestInit,
                    redirectCount: this.redirectCount + 1,
                    contentType: !shouldBecomeGetRequest ? this.request[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["contentType"]] : null
                });
                return fetch.send();
            default:
                throw new this.#window.DOMException(`Redirect option '${this.request.redirect}' is not a valid value of TRequestRedirect`);
        }
    }
} //# sourceMappingURL=SyncFetch.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/ResourceFetch.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResourceFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/url/URL.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/Fetch.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$SyncFetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/SyncFetch.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/window/WindowBrowserContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$preload$2f$PreloadUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/preload/PreloadUtility.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
class ResourceFetch {
    window;
    /**
     * Constructor.
     *
     * @param window Window.
     */ constructor(window){
        this.window = window;
    }
    /**
     * Returns resource data asynchronously.
     *
     * @param url URL.
     * @param destination Destination.
     * @param [options]
     * @param [options.credentials] Credentials.
     * @param options.referrerPolicy
     * @returns Response.
     */ async fetch(url, destination, options) {
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.window).getBrowserFrame();
        if (!browserFrame) {
            return {
                content: '',
                virtualServerFile: null
            };
        }
        // Preloaded resource
        if (destination === 'script' || destination === 'style') {
            const preloadKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$preload$2f$PreloadUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getKey({
                url: String(url),
                destination,
                mode: 'cors',
                credentialsMode: options?.credentials || 'same-origin'
            });
            const preloadEntry = this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].get(preloadKey);
            if (preloadEntry) {
                this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].delete(preloadKey);
                const response = preloadEntry.response || await preloadEntry.onResponseAvailable();
                if (response && !response.ok) {
                    throw new this.window.DOMException(`Failed to perform request to "${new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](url, this.window.location.href).href}". Status ${preloadEntry.response?.status || '0'} ${preloadEntry.response?.statusText || 'Unknown'}.`);
                }
                return {
                    content: preloadEntry.response?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]]?.toString() || '',
                    virtualServerFile: preloadEntry.response?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] || null
                };
            }
        }
        const fetch = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$Fetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            browserFrame,
            window: this.window,
            url,
            disableSameOriginPolicy: destination === 'script' || destination === 'style',
            disablePreload: true,
            init: {
                credentials: options?.credentials,
                referrerPolicy: options?.referrerPolicy
            }
        });
        const response = await fetch.send();
        if (!response.ok) {
            throw new this.window.DOMException(`Failed to perform request to "${new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](url, this.window.location.href).href}". Status ${response.status} ${response.statusText}.`);
        }
        return {
            content: await response.text(),
            virtualServerFile: response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] || null
        };
    }
    /**
     * Returns resource data synchronously.
     *
     * @param url URL.
     * @param destination Destination.
     * @param [options] Options.
     * @param [options.credentials] Credentials.
     * @param [options.referrerPolicy] Referrer policy.
     * @returns Response.
     */ fetchSync(url, destination, options) {
        const browserFrame = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$window$2f$WindowBrowserContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.window).getBrowserFrame();
        if (!browserFrame) {
            return {
                content: '',
                virtualServerFile: null
            };
        }
        // Preloaded resource
        if (destination === 'script' || destination === 'style') {
            const preloadKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$preload$2f$PreloadUtility$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getKey({
                url: String(url),
                destination,
                mode: 'cors',
                credentialsMode: options?.credentials || 'same-origin'
            });
            const preloadEntry = this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].get(preloadKey);
            // We will only use this if the fetch for the resource is complete as it is async and this request is sync.
            if (preloadEntry && preloadEntry.response) {
                this.window.document[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["preloads"]].delete(preloadKey);
                const response = preloadEntry.response;
                if (!response.ok) {
                    throw new this.window.DOMException(`Failed to perform request to "${new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](url, this.window.location.href).href}". Status ${preloadEntry.response.status} ${preloadEntry.response.statusText}.`);
                }
                return {
                    content: preloadEntry.response?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"]]?.toString() || '',
                    virtualServerFile: preloadEntry.response?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] || null
                };
            }
        }
        const fetch = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$fetch$2f$SyncFetch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            browserFrame,
            window: this.window,
            url,
            disableSameOriginPolicy: true,
            init: {
                credentials: options?.credentials,
                referrerPolicy: options?.referrerPolicy
            }
        });
        const response = fetch.send();
        if (!response.ok) {
            throw new this.window.DOMException(`Failed to perform request to "${new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$url$2f$URL$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](url, this.window.location.href).href}". Status ${response.status} ${response.statusText}.`);
        }
        return {
            content: response.body?.toString() || '',
            virtualServerFile: response[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["virtualServerFile"]] || null
        };
    }
} //# sourceMappingURL=ResourceFetch.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/preload/PreloadEntry.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Preload entry.
 *
 * @see https://html.spec.whatwg.org/multipage/links.html#preload-entry
 */ __turbopack_context__.s([
    "default",
    ()=>PreloadEntry
]);
class PreloadEntry {
    integrityMetadata = null;
    response = null;
    error = null;
    #callback = null;
    /**
     * On response available.
     *
     * @returns Response.
     */ onResponseAvailable() {
        return new Promise((resolve, reject)=>{
            this.#callback = {
                resolve,
                reject
            };
        });
    }
    /**
     * Response available.
     *
     * @param error
     * @param response
     */ responseAvailable(error, response) {
        this.response = response;
        this.error = error;
        if (!this.#callback) {
            return;
        }
        if (error) {
            this.#callback.reject(error);
        } else if (!response) {
            this.#callback.reject(new Error('Response is null'));
        } else {
            this.#callback.resolve(response);
        }
    }
} //# sourceMappingURL=PreloadEntry.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/AbortController.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AbortController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
;
class AbortController {
    // Public properties
    signal = new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].AbortSignal();
    /**
     * Aborts the signal.
     *
     * @param [reason] Reason.
     */ abort(reason) {
        this.signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]](reason);
    }
} //# sourceMappingURL=AbortController.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/AbortSignal.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AbortSignal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/EventTarget.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/PropertySymbol.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/event/Event.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/exception/DOMExceptionNameEnum.js [app-ssr] (ecmascript)");
;
;
;
;
class AbortSignal extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$EventTarget$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    // Internal properties
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = false;
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]] = undefined;
    // Events
    onabort = null;
    /**
     * Constructor.
     */ constructor(){
        super();
        if (!this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]]) {
            throw new TypeError(`Failed to construct 'AbortSignal': Illegal constructor`);
        }
    }
    /**
     * Return a default description for the AbortSignal class.
     */ get [Symbol.toStringTag]() {
        return 'AbortSignal';
    }
    /**
     * Returns true if the signal has been aborted.
     *
     * @returns True if the signal has been aborted.
     */ get aborted() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]];
    }
    /**
     * Setter for aborted. Value will be ignored as the property is read-only.
     *
     * @param _value Aborted.
     */ set aborted(_value) {
    // Do nothing
    }
    /**
     * Returns the reason the signal was aborted.
     *
     * @returns Reason.
     */ get reason() {
        return this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]];
    }
    /**
     * Setter for reason. Value will be ignored as the property is read-only.
     *
     * @param _value Reason.
     */ set reason(_value) {
    // Do nothing
    }
    /**
     * Aborts the signal.
     *
     * @param [reason] Reason.
     */ [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]](reason) {
        if (this.aborted) {
            return;
        }
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]] = reason !== undefined ? reason : new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException('signal is aborted without reason', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
        this.dispatchEvent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$event$2f$Event$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]('abort'));
    }
    /**
     * Throws an "AbortError" if the signal has been aborted.
     */ throwIfAborted() {
        if (this.aborted) {
            throw this.reason;
        }
    }
    /**
     * Returns an AbortSignal instance that has been set as aborted.
     *
     * @param [reason] Reason.
     * @returns AbortSignal instance.
     */ static abort(reason) {
        const signal = new this();
        signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]] = reason !== undefined ? reason : new this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]].DOMException('signal is aborted without reason', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].abortError);
        signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]] = true;
        return signal;
    }
    /**
     * Returns an AbortSignal that will automatically abort after a specified
     * time.
     *
     * @param [time] Time in milliseconds.
     * @returns AbortSignal instance.
     */ static timeout(time) {
        const window = this[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["window"]];
        const signal = new this();
        window.setTimeout(()=>{
            signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]](new window.DOMException('signal timed out', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$exception$2f$DOMExceptionNameEnum$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].timeoutError));
        }, time);
        return signal;
    }
    /**
     * Takes an iterable of abort signals and returns an AbortSignal that is
     * aborted when any of the input iterable abort signals are aborted.
     *
     * The abort reason will be set to the reason of the first signal that is
     * aborted. If any of the given abort signals are already aborted then so will
     * be the returned AbortSignal.
     *
     * @param [signals] Iterable of abort signals.
     * @returns AbortSignal instance.
     */ static any(signals) {
        for (const signal of signals){
            if (signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aborted"]]) {
                return this.abort(signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]]);
            }
        }
        const anySignal = new this();
        const handlers = new Map();
        const stopListening = ()=>{
            for (const signal of signals){
                signal.removeEventListener('abort', handlers.get(signal));
            }
        };
        for (const signal of signals){
            const handler = ()=>{
                stopListening();
                anySignal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["abort"]](signal[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$happy$2d$dom$40$20$2e$9$2e$0$2f$node_modules$2f$happy$2d$dom$2f$lib$2f$PropertySymbol$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reason"]]);
            };
            handlers.set(signal, handler);
            signal.addEventListener('abort', handler);
        }
        return anySignal;
    }
} //# sourceMappingURL=AbortSignal.js.map
}),
"[project]/node_modules/.pnpm/happy-dom@20.9.0/node_modules/happy-dom/lib/fetch/cache/preflight/PreflightResponseCache.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fetch preflight response cache.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
 */ __turbopack_context__.s([
    "default",
    ()=>PreflightResponseCache
]);
class PreflightResponseCache {
    #entries = new Map();
    /**
     * Returns cached response.
     *
     * @param request Request.
     * @returns Cached response.
     */ get(request) {
        const cachedResponse = this.#entries.get(request.url);
        if (cachedResponse) {
            if (cachedResponse.expires < Date.now()) {
                this.#entries.delete(request.url);
                return null;
            }
            return cachedResponse;
        }
        return null;
    }
    /**
     * Adds a cache entity.
     *
     * @param request Request.
     * @param response Response.
     * @returns Cached response.
     */ add(request, response) {
        this.#entries.delete(request.url);
        if (request.headers.get('Cache-Control')?.includes('no-cache')) {
            return null;
        }
        if (response.status < 200 || response.status >= 300) {
            return null;
        }
        const maxAge = response.headers.get('Access-Control-Max-Age');
        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
        if (!maxAge || !allowOrigin) {
            return null;
        }
        const allowMethods = [];
        if (response.headers.has('Access-Control-Allow-Methods')) {
            const allowMethodsHeader = response.headers.get('Access-Control-Allow-Methods');
            if (allowMethodsHeader !== '*') {
                for (const method of response.headers.get('Access-Control-Allow-Methods').split(',')){
                    allowMethods.push(method.trim().toUpperCase());
                }
            }
        }
        const cachedResponse = {
            allowOrigin,
            allowMethods,
            expires: Date.now() + parseInt(maxAge) * 1000
        };
        if (isNaN(cachedResponse.expires) || cachedResponse.expires < Date.now()) {
            return null;
        }
        this.#entries.set(request.url, cachedResponse);
        return cachedResponse;
    }
    /**
     * Clears the cache.
     */ clear() {
        this.#entries.clear();
    }
} //# sourceMappingURL=PreflightResponseCache.js.map
}),
];

//# sourceMappingURL=a6f5f_happy-dom_lib_fetch_895d6e19._.js.map