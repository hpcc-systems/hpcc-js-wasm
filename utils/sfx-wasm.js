import { readFile } from "fs/promises";
import fs from "fs";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
import zstdlib from "../build/cpp/zstd/zstdlib.js";
import base91lib from "../build/cpp/base91/base91lib.js";

export async function doFetch(wasmUrl) {
    return readFile(wasmUrl);
}


export async function loadWasm(wrapper, wasmUrl) {
    return wrapper({
        wasmBinary: await readFile(wasmUrl)
    });
}

export class WasmLibrary {

    _module;
    _exports;

    constructor(_module, _export) {
        this._module = _module;
        this._exports = _export;
    }

    malloc_heapu8(size) {
        const ptr = this._exports.malloc(size);
        return {
            ptr,
            size
        };
    }

    free_heapu8(data) {
        this._exports.free(data.ptr);
    }

    uint8_heapu8(data) {
        const retVal = this.malloc_heapu8(data.byteLength);
        this._module.HEAPU8.set(data, retVal.ptr);
        return retVal;
    }

    heapu8_view(data) {
        return this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
    }

    heapu8_uint8(data) {
        return new Uint8Array([...this.heapu8_view(data)]);
    }

    string_heapu8(str) {
        const data = Uint8Array.from(str, x => x.charCodeAt(0));
        return this.uint8_heapu8(data);
    }

    heapu8_string(data) {
        const retVal = Array.from({ length: data.size });
        const submodule = this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
        submodule.forEach((c, i) => {
            retVal[i] = String.fromCharCode(c);
        });
        return retVal.join("");
    }
}

let g_base91;
export class Base91 extends WasmLibrary {

    constructor(_module) {
        super(_module, new _module.CBasE91());
    }

    static load() {
        if (!g_base91) {
            g_base91 = loadWasm(base91lib, "./build/cpp/base91/base91lib.wasm").then(module => {
                return new Base91(module)
            });
        }
        return g_base91;
    }

    version() {
        return this._exports.version();
    }

    encode(data) {
        this._exports.reset();

        const unencoded = this.uint8_heapu8(data);
        const encoded = this.malloc_heapu8(unencoded.size + Math.ceil(unencoded.size / 4));

        encoded.size = this._exports.encode(unencoded.ptr, unencoded.size, encoded.ptr);
        let retVal = this.heapu8_string(encoded);
        encoded.size = this._exports.encode_end(encoded.ptr);
        retVal += this.heapu8_string(encoded);

        this.free_heapu8(encoded);
        this.free_heapu8(unencoded);
        return retVal;
    }

    decode(base91Str) {
        this._exports.reset();

        const encoded = this.string_heapu8(base91Str);
        const unencoded = this.malloc_heapu8(encoded.size);

        unencoded.size = this._exports.decode(encoded.ptr, encoded.size, unencoded.ptr);
        let retVal = this.heapu8_uint8(unencoded);
        unencoded.size = this._exports.decode_end(unencoded.ptr);
        retVal = new Uint8Array([...retVal, ...this.heapu8_view(unencoded)]);

        this.free_heapu8(unencoded);
        this.free_heapu8(encoded);
        return retVal;
    }
}

let g_zstd;
export class Zstd extends WasmLibrary {

    constructor(_module) {
        super(_module, _module.zstd.prototype);
    }

    static load() {
        if (!g_zstd) {
            g_zstd = loadWasm(zstdlib, "./build/cpp/zstd/zstdlib.wasm").then(module => {
                return new Zstd(module)
            });
        }
        return g_zstd;
    }

    version() {
        return this._exports.version();
    }

    compress(data, compressionLevel = this.defaultCLevel()) {
        const uncompressed = this.uint8_heapu8(data);

        const compressedSize = this._exports.compressBound(data.length);
        const compressed = this.malloc_heapu8(compressedSize);
        compressed.size = this._exports.compress(compressed.ptr, compressedSize, uncompressed.ptr, uncompressed.size, compressionLevel);
        if (this._exports.isError(compressed.size)) {
            console.error(this._exports.getErrorName(compressed.size));
        }
        const retVal = this.heapu8_uint8(compressed);

        this.free_heapu8(compressed);
        this.free_heapu8(uncompressed);
        return retVal;
    }

    decompress(array) {
        const compressed = this.uint8_heapu8(array);
        const uncompressedSize = this._exports.getFrameContentSize(compressed.ptr, compressed.size);
        if (this._exports.isError(uncompressedSize)) {
            console.error(this._exports.getErrorName(uncompressedSize));
        }
        const uncompressed = this.malloc_heapu8(uncompressedSize);

        uncompressed.size = this._exports.decompress(uncompressed.ptr, uncompressedSize, compressed.ptr, compressed.size);
        if (this._exports.isError(uncompressed.size)) {
            console.error(this._exports.getErrorName(uncompressed.size));
        }
        const retVal = this.heapu8_uint8(uncompressed);

        this.free_heapu8(uncompressed);
        this.free_heapu8(compressed);
        return retVal;
    }

    defaultCLevel() {
        return this._exports.defaultCLevel();
    }

    minCLevel() {
        return this._exports.minCLevel();
    }

    maxCLevel() {
        return this._exports.maxCLevel();
    }
}

const myYargs = yargs(hideBin(process.argv));
myYargs
    .usage("Usage: sfx-wasm [options] filePath")
    .demandCommand(0, 1)
    .example("sfx-wasm ./input.wasm", "Wrap file in a self extracting JavaScript file.")
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/hpcc-js-wasm")
    ;

const argv = await myYargs.argv;

try {
    const wasmPath = argv._[0];
    let wasmContent;
    if (fs.existsSync(wasmPath)) {
        wasmContent = fs.readFileSync(wasmPath);
    }
    if (wasmContent) {
        const zstd = await Zstd.load();
        const compressed = zstd.compress(new Uint8Array(wasmContent))
        const base91 = await Base91.load();
        const str = base91.encode(compressed);
        console.log(`\
import { extract } from "./extract.js";
import wrapper from "../${wasmPath.replace(".wasm", ".js")}";

const blobStr = '${str}';

let g_module;
export function loadWasm() {
    if (!g_module) {
        g_module = wrapper({
            wasmBinary: extract(blobStr)
        });
    }
    return g_module;
}
`);
    } else {
        throw new Error("'filePath' is required.")
    }
} catch (e) {
    console.error(`Error:  ${e?.message}\n`);
    myYargs.showHelp();
}


