// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/base91/base91lib.wasm";
import type { MainModule, CBasE91 } from "../../../build/packages/base91/base91lib.js";
import { MainModuleEx } from "@hpcc-js/wasm-util";

//  Ref:  http://base91.sourceforge.net/#a5

let g_base91: Promise<Base91>;

/**
 * Base 91 WASM library, similar to Base 64 but uses more characters resulting in smaller strings.
 * 
 * See [Base91](https://base91.sourceforge.net/) for more details.
 *
 * ```ts
 * import { Base91 } from "@hpcc-js/wasm-base91";
 * 
 * const base91 = await Base91.load();
 * 
 * const encoded_data = await base91.encode(data);
 * const decoded_data = await base91.decode(encoded_data);
 * ```
 */
export class Base91 extends MainModuleEx<MainModule> {

    private _base91: CBasE91;

    private constructor(_module: MainModule) {
        super(_module);
        this._base91 = new this._module.CBasE91();
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Base91 class.
     */
    static load(): Promise<Base91> {
        if (!g_base91) {
            g_base91 = (load() as Promise<MainModule>).then((module) => new Base91(module));
        }
        return g_base91;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        reset();
    }

    /**
     * @returns The Base91 c++ version
     */
    version(): string {
        return this._base91.version();
    }

    /**
     * Resets the internal encoder/decoder state.
     */
    reset(): void {
        this._base91.reset();
    }

    /**
     * @param data Data to encode.
     * @returns string containing the Base 91 encoded data
     */
    encode(data: Uint8Array): string {
        this._base91.reset();

        const unencoded = this.dataToHeap(data);
        const encoded = this.malloc(unencoded.size + Math.ceil(unencoded.size / 4));

        encoded.size = this._base91.encode(unencoded.ptr, unencoded.size, encoded.ptr);
        let retVal = this.heapToString(encoded);
        encoded.size = this._base91.encode_end(encoded.ptr);
        retVal += this.heapToString(encoded);

        this.free(encoded);
        this.free(unencoded);
        return retVal;
    }

    /**
     * @param data Data to encode. Call {@link encodeChunkEnd} after the final chunk.
     * @returns string containing the Base 91 encoded data
     */
    encodeChunk(data: Uint8Array): string {
        const unencoded = this.dataToHeap(data);
        const encoded = this.malloc(unencoded.size + Math.ceil(unencoded.size / 4));

        encoded.size = this._base91.encode(unencoded.ptr, unencoded.size, encoded.ptr);
        const retVal = this.heapToString(encoded);
        this.free(encoded);
        this.free(unencoded);
        return retVal;
    }


    /**
     * @param data Data to encode.
     * @returns string containing the Base 91 encoded data
     */
    encodeChunkEnd(): string {
        const encoded = this.malloc(2);

        encoded.size = this._base91.encode_end(encoded.ptr);
        const retVal = this.heapToString(encoded);

        this.free(encoded);
        return retVal;
    }

    /**
     * @param base91Str encoded string
     * @returns original data
     */
    decode(base91Str: string): Uint8Array {
        this._base91.reset();

        const encoded = this.stringToHeap(base91Str);
        const unencoded = this.malloc(encoded.size);

        unencoded.size = this._base91.decode(encoded.ptr, encoded.size, unencoded.ptr);
        let retVal = this.heapView(unencoded);
        unencoded.size = this._base91.decode_end(unencoded.ptr);
        retVal = new Uint8Array([...retVal, ...this.heapView(unencoded)]);

        this.free(unencoded);
        this.free(encoded);
        return retVal;
    }

    /**
     * Streaming decode for a chunk of data. Call {@link decodeChunkEnd} after the final chunk.
     * @param base91Str Encoded chunk
     * @returns decoded bytes for the chunk
     */
    decodeChunk(base91Str: string): Uint8Array {
        const encoded = this.stringToHeap(base91Str);
        const unencoded = this.malloc(encoded.size);

        unencoded.size = this._base91.decode(encoded.ptr, encoded.size, unencoded.ptr);
        const retVal = this.heapToUint8Array(unencoded);

        this.free(unencoded);
        this.free(encoded);
        return retVal;
    }

    /**
     * Finalizes a streaming decode started with {@link decodeChunk}.
     * @returns remaining decoded bytes
     */
    decodeChunkEnd(): Uint8Array {
        const unencoded = this.malloc(1);

        unencoded.size = this._base91.decode_end(unencoded.ptr);
        const retVal = this.heapToUint8Array(unencoded);

        this.free(unencoded);
        return retVal;
    }
}
