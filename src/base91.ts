// @ts-ignore
import { loadWasm } from "./base91lib.wasm.js";
import { WasmLibrary } from "./wasm-library.js";

//  Ref:  http://base91.sourceforge.net/#a5

let g_base91: Promise<Base91>;

/**
 * Base 91 WASM library, similar to Base 64 but uses more characters resulting in smaller strings.
 * 
 * See [Base91](https://base91.sourceforge.net/) for more details.
 *
 * ```ts
 * import { Base91 } from "@hpcc-js/wasm/base91";
 * 
 * const base91 = await Base91.load();
 * 
 * const encoded_data = await base91.encode(data);
 * const decoded_data = await base91.decode(encoded_data);
 * ```
 */
export class Base91 extends WasmLibrary {

    private constructor(_module: any) {
        super(_module, new _module.CBasE91());
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
            g_base91 = loadWasm().then((module: any) => {
                return new Base91(module)
            });
        }
        return g_base91;
    }

    /**
     * @returns The Base91 c++ version
     */
    version(): string {
        return this._exports.version();
    }

    /**
     * @param data Data to encode.
     * @returns string containing the Base 91 encoded data
     */
    encode(data: Uint8Array): string {
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

    /**
     * 
     * @param base91Str encoded string
     * @returns origonal data
     */
    decode(base91Str: string): Uint8Array {
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
