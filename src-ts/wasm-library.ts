export type PTR = number;
export interface HeapU8 {
    ptr: PTR;
    size: number;
}

/**
 * Base class to simplify moving data into and out of Wasm memory.
 */
export class WasmLibrary {

    protected _module: any;
    protected _exports: any;

    protected constructor(_module: any, _export: any) {
        this._module = _module;
        this._exports = _export;
    }

    protected malloc_heapu8(size: number): HeapU8 {
        const ptr: PTR = this._exports.malloc(size);
        return {
            ptr,
            size
        };
    }

    protected free_heapu8(data: HeapU8) {
        this._exports.free(data.ptr);
    }

    protected uint8_heapu8(data: Uint8Array): HeapU8 {
        const retVal = this.malloc_heapu8(data.byteLength);
        this._module.HEAPU8.set(data, retVal.ptr);
        return retVal;
    }

    protected heapu8_view(data: HeapU8): Uint8Array {
        return this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
    }

    protected heapu8_uint8(data: HeapU8): Uint8Array {
        return new Uint8Array([...this.heapu8_view(data)]);
    }

    protected string_heapu8(str: string): HeapU8 {
        const data = Uint8Array.from(str, x => x.charCodeAt(0));
        return this.uint8_heapu8(data);
    }

    protected heapu8_string(data: HeapU8): string {
        const retVal = Array.from({ length: data.size });
        const submodule = this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
        submodule.forEach((c: number, i: number) => {
            retVal[i] = String.fromCharCode(c);
        });
        return retVal.join("");
    }
}
