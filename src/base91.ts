// @ts-ignore
import * as base91lib from "../build/cpp/base91/base91lib";
import { Options, WasmLibrary } from "./wasm-library";
import { loadWasm } from "./util";

//  Ref:  http://base91.sourceforge.net/#a5

let g_base91: Promise<Base91>;
export class Base91 extends WasmLibrary {

    private constructor(_module: base91lib) {
        super(_module, new _module.CBasE91());
    }

    static load(options?: Options): Promise<Base91> {
        if (!g_base91) {
            g_base91 = loadWasm(base91lib, "base91lib", options?.wasmFolder, options?.wasmBinary).then(module => {
                return new Base91(module)
            });
        }
        return g_base91;
    }

    version(): string {
        return this._exports.version();
    }

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
