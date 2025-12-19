import type { MainModule } from "../../../build/packages/util/utillib.js";

interface RuntimeFSExports {
    FS_createPath: (parent: any, path: any, canRead: any, canWrite: any) => void;
    FS_createDataFile: (parent: any, name: any, fileData: any, canRead: any, canWrite: any, canOwn: any) => void;
    FS_preloadFile: (parent: any, name: any, url: any, canRead: any, canWrite: any, dontCreateFile: any, canOwn: any, preFinish: any) => Promise<void>;
    FS_unlink: (path: any) => any;
    addRunDependency: (id: any) => void;
    removeRunDependency: (id: any) => void;
}

export type PTR = number;

export interface HeapU8 {
    ptr: PTR;
    size: number;
    dispose(): void;
}

export class MainModuleEx<T extends MainModule> {

    protected _module: T & RuntimeFSExports;

    constructor(mainModule: T) {
        this._module = mainModule as T & RuntimeFSExports;
    }

    malloc(size: number): HeapU8 {
        const ptr: PTR = this._module._malloc(size) as PTR;
        return {
            ptr,
            size,
            dispose: () => this.free({ ptr, size, dispose: () => { } })
        };
    }

    free(data: HeapU8) {
        this._module._free(data.ptr);
    }

    dataToHeap(data: Uint8Array): HeapU8 {
        const retVal = this.malloc(data.byteLength);
        (this._module.HEAPU8 as Uint8Array).set(data, retVal.ptr);
        return retVal;
    }

    heapView(data: HeapU8): Uint8Array {
        return (this._module.HEAPU8 as Uint8Array).subarray(data.ptr, data.ptr + data.size);
    }

    heapToUint8Array(data: HeapU8): Uint8Array {
        return new Uint8Array([...this.heapView(data)]);
    }

    lengthBytes(str: string): number {
        return this._module.lengthBytesUTF8(str);
    }

    stringToHeap(str: string): HeapU8 {
        const size = this.lengthBytes(str) + 1;
        const ptr = this._module._malloc(size);
        this._module.stringToUTF8(str, ptr, size);
        return {
            ptr,
            size,
            dispose: () => this.free({ ptr, size, dispose: () => { } })
        };
    }

    heapToString(data: HeapU8): string {
        return this._module.UTF8ToString(data.ptr, data.size);
    }

    hasFilesystem(): boolean {
        const moduleAny = this._module as any;
        return moduleAny.FS_createPath !== undefined &&
            moduleAny.FS_createDataFile !== undefined &&
            moduleAny.FS_preloadFile !== undefined &&
            moduleAny.FS_unlink !== undefined;
    }

    createPath(path: string, canRead = true, canWrite = true) {
        return this._module.FS_createPath("/", path, canRead, canWrite);
    }

    createDataFile(path: string, data: Uint8Array, canRead = true, canWrite = true, canOwn = true) {
        return this._module.FS_createDataFile("/", path, data, canRead, canWrite, canOwn);
    }

    preloadFile(path: string, data: Uint8Array, canRead = true, canWrite = true, dontCreateFile = false, canOwn = true, preFinish = false) {
        return this._module.FS_preloadFile("/", path, data, canRead, canWrite, dontCreateFile, canOwn, preFinish);
    }

    unlink(path: string) {
        return this._module.FS_unlink(path);
    }

}
