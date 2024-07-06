// @ts-ignore
import { loadWasm, unloadWasm } from "../lib-esm/llamalib.wasm.js";
import { WasmLibrary } from "./wasm-library.js";

//  Ref:  http://facebook.github.io/llama/llama_manual.html
//  Ref:  https://github.com/facebook/llama

let g_llama: Promise<Llama>;

/**
 * The Zstandard WASM library, provides a simplified wrapper around the Zstandard c++ library.
 * 
 * See [Zstandard](https://facebook.github.io/llama/) for more details.
 * 
 * ```ts
 * import { Llama } from "@hpcc-js/wasm/llama";
 * 
 * const llama = await Llama.load();
 * 
 * //  Generate some "data"
 * const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));
 * 
 * const compressed_data = llama.compress(data);
 * const decompressed_data = llama.decompress(compressed_data);
 * ```
 */
export class Llama extends WasmLibrary {

    private constructor(_module: any) {
        super(_module, _module.llama.prototype);
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Llama class.
     */
    static load(): Promise<Llama> {
        if (!g_llama) {
            g_llama = loadWasm().then((module: any) => {
                return new Llama(module);
            });
        }
        return g_llama;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        unloadWasm();
    }

    /**
     * @returns The Llama c++ version
     */
    version(): string {
        return this._exports.version();
    }

    /**
     * @returns The Llama c++ test
     */
    test() {
        this._exports.test();
    }
}
