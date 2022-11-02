// @ts-ignore
import * as zstdlib from "../build/cpp/zstd/zstdlib";
import { Options, WasmLibrary } from "./wasm-library";
import { loadWasm } from "./util";

//  Ref:  http://facebook.github.io/zstd/zstd_manual.html
//  Ref:  https://github.com/facebook/zstd

let g_zstd: Promise<Zstd>;
export class Zstd extends WasmLibrary {

    private constructor(_module: zstdlib) {
        super(_module, _module.zstd.prototype);
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

    decompress(array: Uint8Array): Uint8Array {
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
