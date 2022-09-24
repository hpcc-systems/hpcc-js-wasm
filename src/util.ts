function getGlobal() {
    if (typeof self !== "undefined") { return self; }
    if (typeof window !== "undefined") { return window; }
    if (typeof global !== "undefined") { return global; }
    throw new Error("unable to locate global object");
}

const globalNS: any = getGlobal();

let _wasmFolder: string | undefined = globalNS.__hpcc_wasmFolder || undefined;
export function wasmFolder(_?: string): string | undefined {
    if (!arguments.length) return _wasmFolder;
    const retVal: string | undefined = _wasmFolder;
    _wasmFolder = _;
    return retVal;
}

function trimEnd(str: string, charToRemove: string) {
    while (str.charAt(str.length - 1) === charToRemove) {
        str = str.substring(0, str.length - 1);
    }
    return str;
}

function trimStart(str: string, charToRemove: string) {
    while (str.charAt(0) === charToRemove) {
        str = str.substring(1);
    }
    return str;
}

let scriptDir = (globalThis?.document?.currentScript as HTMLScriptElement)?.src ?? globalThis?.__filename ?? "./dummy.js";
scriptDir = scriptDir.substring(0, scriptDir.replace(/[?#].*/, "").lastIndexOf('/') + 1);

async function browserFetch(wasmUrl: string): Promise<ArrayBuffer> {
    return fetch(wasmUrl, { credentials: 'same-origin' }).then(response => {
        if (!response.ok) {
            throw "failed to load wasm binary file at '" + wasmUrl + "'";
        }
        return response.arrayBuffer();
    }).catch(e => {
        throw e;
    });
}

//  Do not delete:  Rollup uses this function for NodeJS builds  ---
async function nodeFetch(wasmUrl: string): Promise<ArrayBuffer> {
    const fs = require("fs/promises");
    return fs.readFile(wasmUrl, undefined);
}

const g_wasmCache = {} as { [key: string]: Promise<any> };

async function _loadWasm(_wasmLib: any, wasmUrl: string, wasmBinary?: ArrayBuffer): Promise<any> {
    const wasmLib = _wasmLib.default || _wasmLib;
    if (!wasmBinary) {
        wasmBinary = await browserFetch(wasmUrl);
    }
    return await wasmLib({
        "wasmBinary": wasmBinary
    });
}

export async function loadWasm(_wasmLib: any, filename: string, wf?: string, wasmBinary?: ArrayBuffer): Promise<any> {
    let wasmUrl = `${trimEnd(wf || wasmFolder() || scriptDir, "/")}/${trimStart(`${filename}.wasm`, "/")}`;
    wasmUrl = URL && globalThis.document ? new URL(wasmUrl, document.baseURI).href : wasmUrl;

    if (!g_wasmCache[wasmUrl]) {
        g_wasmCache[wasmUrl] = _loadWasm(_wasmLib, wasmUrl, wasmBinary);
    }
    return g_wasmCache[wasmUrl];
}

export function loadWasmOld(_wasmLib: any, filename: string, wf?: string, wasmBinary?: Uint8Array): Promise<any> {
    const wasmLib = _wasmLib.default || _wasmLib;
    //  Prevent double load ---
    if (!wasmLib.__hpcc_promise) {
        wasmLib.__hpcc_promise = wasmLib({
            wasmBinary,
            locateFile: (path: string, prefix: string) => {
                return `${trimEnd(wf || wasmFolder() || prefix || ".", "/")}/${trimStart(path, "/")}`;
            }
        });
    }
    return wasmLib.__hpcc_promise;
}
