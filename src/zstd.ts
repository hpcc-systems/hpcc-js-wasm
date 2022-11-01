// @ts-ignore
import * as zstdlib from "../build/cpp/zstd/zstdlib";
import { loadWasm } from "./util";

//  Ref:  http://facebook.github.io/zstd/zstd_manual.html

export interface Options {
    wasmFolder?: string;
    wasmBinary?: ArrayBuffer;
}

let g_zstd: Promise<Zstd>;
export class Zstd {
    protected _module;
    protected _exports;

    private constructor(_module: any) {
        this._module = _module;
        this._exports = _module.zstd.prototype;
    }

    static load(options?: Options): Promise<Zstd> {
        if (!g_zstd) {
            g_zstd = loadWasm(zstdlib, "zstdlib", options?.wasmFolder, options?.wasmBinary).then(module => {
                return new Zstd(module)
            });
        }
        return g_zstd;
    }

    version(): string {
        return this._exports.version();
    }

    compress(data: Uint8Array, compressionLevel: number = this.defaultCLevel()): Uint8Array {
        const uncompressedSize = data.byteLength;
        const uncompressedPtr = this._exports.malloc(uncompressedSize);
        this._module.HEAPU8.set(data, uncompressedPtr);

        const compressedSize = this._exports.compressBound(data.length);
        const compressedPtr = this._exports.malloc(compressedSize);

        const actualSize = this._exports.compress(compressedPtr, compressedSize, uncompressedPtr, uncompressedSize, compressionLevel);
        if (this._exports.isError(actualSize)) {
            console.error(this._exports.getErrorName(actualSize));
        }

        const retVal: Uint8Array = new Uint8Array(this._module.HEAPU8.buffer, compressedPtr, actualSize);
        this._exports.free(compressedPtr);
        this._exports.free(uncompressedPtr);
        return retVal;
    }

    decompress(array: Uint8Array): Uint8Array {
        const compressedSize = array.byteLength;
        const compressedPtr = this._exports.malloc(compressedSize);
        this._module.HEAPU8.set(array, compressedPtr);

        const uncompressedSize = this._exports.getFrameContentSize(compressedPtr, compressedSize);
        if (this._exports.isError(uncompressedSize)) {
            console.error(this._exports.getErrorName(uncompressedSize));
        }
        const uncompressedPtr = this._exports.malloc(uncompressedSize);
        const actualSize = this._exports.decompress(uncompressedPtr, uncompressedSize, compressedPtr, compressedSize);
        if (this._exports.isError(actualSize)) {
            console.error(this._exports.getErrorName(actualSize));
        }

        const retVal = new Uint8Array(this._module.HEAPU8.buffer, uncompressedPtr, actualSize);
        this._exports.free(uncompressedPtr);
        this._exports.free(compressedPtr);

        return retVal;
    }

    defaultCLevel(): number {
        return this._exports.defaultCLevel();
    }

    minCLevel(): number {
        return this._exports.minCLevel();
    }

    maxCLevel(): number {
        return this._exports.maxCLevel();
    }
}
