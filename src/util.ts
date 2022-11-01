export interface Interop {
    doFetch: (wasmUrl: string) => Promise<ArrayBuffer>,
    scriptDir: string
}
export const interop: Interop = {
    doFetch: undefined,
    scriptDir: undefined
} as any;

let _wasmFolder: string | undefined = (globalThis as any).__hpcc_wasmFolder || undefined;
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

const g_wasmCache = {} as { [key: string]: Promise<any> };

async function _loadWasm(_wasmLib: any, wasmUrl: string, wasmBinary?: ArrayBuffer): Promise<any> {
    const wasmLib = _wasmLib.default || _wasmLib;
    if (!wasmBinary) {
        wasmBinary = await interop.doFetch(wasmUrl);
    }
    return await wasmLib({
        "wasmBinary": wasmBinary,
        locateFile: (path: string, scriptDirectory: string) => {
            return wasmUrl;
        }
    });
}

export async function loadWasm(_wasmLib: any, filename: string, wf?: string, wasmBinary?: ArrayBuffer): Promise<any> {
    const wasmUrl = `${trimEnd(wf || wasmFolder() || interop.scriptDir || ".", "/")}/${trimStart(`${filename}.wasm`, "/")}`;
    if (!g_wasmCache[wasmUrl]) {
        g_wasmCache[wasmUrl] = _loadWasm(_wasmLib, wasmUrl, wasmBinary);
    }
    return g_wasmCache[wasmUrl];
}
