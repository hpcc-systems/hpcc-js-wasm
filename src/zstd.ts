// @ts-ignore
import { loadWasm, unloadWasm } from "./zstdlib.wasm.js";
import { WasmLibrary } from "./wasm-library.js";

//  Ref:  http://facebook.github.io/zstd/zstd_manual.html
//  Ref:  https://github.com/facebook/zstd

let g_zstd: Promise<Zstd>;

/**
 * The Zstandard WASM library, provides a simplified wrapper around the Zstandard c++ library.
 * 
 * See [Zstandard](https://facebook.github.io/zstd/) for more details.
 * 
 * ```ts
 * import { Zstd } from "@hpcc-js/wasm/zstd";
 * 
 * const zstd = await Zstd.load();
 * 
 * //  Generate some "data"
 * const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));
 * 
 * const compressed_data = zstd.compress(data);
 * const decompressed_data = zstd.decompress(compressed_data);
 * ```
 */
export class Zstd extends WasmLibrary {

    private constructor(_module: any) {
        super(_module, _module.zstd.prototype);
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Zstd class.
     */
    static load(): Promise<Zstd> {
        if (!g_zstd) {
            g_zstd = loadWasm().then((module: any) => {
                return new Zstd(module)
            });
        }
        return g_zstd;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        unloadWasm();
    }

    /**
     * @returns The Zstd c++ version
     */
    version(): string {
        return this._exports.version();
    }

    /**
     * @param data Data to be compressed
     * @param compressionLevel Compression v Speed tradeoff, when omitted it will default to `zstd.defaultCLevel()` which is currently 3.
     * @returns Compressed data.
     * 
     * :::tip
     * A note on compressionLevel:  The library supports regular compression levels from 1 up o 22. Levels >= 20, should be used with caution, as they require more memory. The library also offers negative compression levels, which extend the range of speed vs. ratio preferences.  The lower the level, the faster the speed (at the cost of compression).
     * :::
     */
    compress(data: Uint8Array, compressionLevel: number = this.defaultCLevel()): Uint8Array {
        const uncompressed = this.uint8_heapu8(data);

        const compressedSize = this._exports.compressBound(data.length);
        const compressed = this.malloc_heapu8(compressedSize);
        compressed.size = this._exports.compress(compressed.ptr, compressedSize, uncompressed.ptr, uncompressed.size, compressionLevel);
        /* istanbul ignore if  */
        if (this._exports.isError(compressed.size)) {
            console.error(this._exports.getErrorName(compressed.size));
        }
        const retVal = this.heapu8_uint8(compressed);

        this.free_heapu8(compressed);
        this.free_heapu8(uncompressed);
        return retVal;
    }

    /**
     * @param compressedData Data to be compressed
     * @returns Uncompressed data.
     */
    decompress(compressedData: Uint8Array): Uint8Array {
        const compressed = this.uint8_heapu8(compressedData);
        const uncompressedSize = this._exports.getFrameContentSize(compressed.ptr, compressed.size);
        /* istanbul ignore if  */
        if (this._exports.isError(uncompressedSize)) {
            console.error(this._exports.getErrorName(uncompressedSize));
        }
        const uncompressed = this.malloc_heapu8(uncompressedSize);

        uncompressed.size = this._exports.decompress(uncompressed.ptr, uncompressedSize, compressed.ptr, compressed.size);
        /* istanbul ignore if  */
        if (this._exports.isError(uncompressed.size)) {
            console.error(this._exports.getErrorName(uncompressed.size));
        }
        const retVal = this.heapu8_uint8(uncompressed);

        this.free_heapu8(uncompressed);
        this.free_heapu8(compressed);
        return retVal;
    }

    /**
     * @returns Default compression level (see notes above above).
     */
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
