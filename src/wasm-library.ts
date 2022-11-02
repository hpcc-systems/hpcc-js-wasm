export interface Options {
    wasmFolder?: string;
    wasmBinary?: ArrayBuffer;
}

export type PTR = number;
export interface HeapU8 {
    ptr: PTR;
    size: number;
}

export class WasmLibrary {

    protected _module: any;
    protected _exports: any;

    protected constructor(_module: any, _export: any) {
        this._module = _module;
        this._exports = _export;
    }

    malloc_heapu8(size: number): HeapU8 {
        const ptr: PTR = this._exports.malloc(size);
        return {
            ptr,
            size
        };
    }

    free_heapu8(data: HeapU8) {
        this._exports.free(data.ptr);
    }

    uint8_heapu8(data: Uint8Array): HeapU8 {
        const retVal = this.malloc_heapu8(data.byteLength);
        this._module.HEAPU8.set(data, retVal.ptr);
        return retVal;
    }

    heapu8_view(data: HeapU8): Uint8Array {
        return this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
    }

    heapu8_uint8(data: HeapU8): Uint8Array {
        return new Uint8Array([...this.heapu8_view(data)]);
    }

    string_heapu8(str: string): HeapU8 {
        const data = Uint8Array.from(str, x => x.charCodeAt(0));
        return this.uint8_heapu8(data);
    }

    heapu8_string(data: HeapU8): string {
        const retVal = Array.from({ length: data.size });
        const submodule = this._module.HEAPU8.subarray(data.ptr, data.ptr + data.size);
        submodule.forEach((c: number, i: number) => {
            retVal[i] = String.fromCharCode(c);
        });
        return retVal.join("");
    }
}
