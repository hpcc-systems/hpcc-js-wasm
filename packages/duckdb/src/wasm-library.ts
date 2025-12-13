export type PTR = number;
export interface HeapU8 {
    ptr: PTR;
    size: number;
}

interface WasmLibraryModule<U> {
    _malloc(size: number): PTR;
    _free(ptr: PTR): void;
    destroy?: (instance: U) => void;
    HEAPU8: Uint8Array;
}

/**
 * Base class to simplify moving data into and out of Wasm memory.
 */
export class WasmLibrary<T, U> {

    protected _module: T & WasmLibraryModule<U>;
    protected _exports: U;

    protected constructor(_module: T, _exports: U) {
        this._module = _module as any;
        this._exports = _exports as any;
    }

    dispose() {
        const exportsAny = this._exports as any;
        if (exportsAny && typeof exportsAny.delete === "function") {
            exportsAny.delete();
            return;
        }
        const moduleAny = this._module as any;
        if (moduleAny && typeof moduleAny.destroy === "function") {
            moduleAny.destroy(this._exports);
        }
    }

    protected malloc_heapu8(size: number): HeapU8 {
        const ptr: PTR = this._module._malloc(size) as PTR;
        return {
            ptr,
            size
        };
    }

    protected free_heapu8(data: HeapU8) {
        this._module._free(data.ptr);
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

    protected string_uint8array(str: string): Uint8Array {
        return Uint8Array.from(str, x => x.charCodeAt(0));
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
