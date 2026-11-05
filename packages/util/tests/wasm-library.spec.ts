import { beforeAll, describe, expect, it, vi } from "vitest";
import type { MainModule } from "../../../build/packages/util/utillib.js";
import MainModuleFactory from "../../../build/packages/util/utillib.js";
import { MainModuleEx } from "../src/wasm-library.ts";

describe("MainModuleEx", () => {
    let mainModule: MainModule;
    let mainModuleEx: MainModuleEx<MainModule>;

    beforeAll(async () => {
        mainModule = await MainModuleFactory();
        mainModuleEx = new MainModuleEx(mainModule);
    });

    it("malloc/free", () => {
        const heapU8 = mainModuleEx.malloc(10);
        expect(heapU8.size).toBe(10);
        expect(heapU8.ptr).toBeGreaterThan(0);

        mainModuleEx.free(heapU8);
    });

    it("dispose calls free", () => {
        const freeSpy = vi.spyOn(mainModule, "_free");

        const heapU8 = mainModuleEx.malloc(4);
        heapU8.dispose();

        expect(freeSpy).toHaveBeenCalledWith(heapU8.ptr);
        freeSpy.mockRestore();
    });

    it("dataToHeap + heapView round-trip", () => {
        const input = Uint8Array.from([1, 2, 3, 4]);

        const heapU8 = mainModuleEx.dataToHeap(input);
        const view = mainModuleEx.heapView(heapU8);

        expect(Array.from(view)).toEqual([1, 2, 3, 4]);

        view[0] = 9;
        expect(mainModule.HEAPU8[heapU8.ptr]).toBe(9);

        mainModuleEx.free(heapU8);
    });

    it("lengthBytes handles utf8", () => {
        expect(mainModuleEx.lengthBytes("a😀")).toBe(5);
    });

    it("stringToHeap/heapToString round-trip", () => {
        const str = "hé😀llo";

        const heapStr = mainModuleEx.stringToHeap(str);

        // Ensure trailing null terminator is present
        expect(mainModule.HEAPU8[heapStr.ptr + heapStr.size - 1]).toBe(0);

        const back = mainModuleEx.heapToString(heapStr);
        expect(back).toBe(str);

        heapStr.dispose();
    });

    it("dataToHeap supports empty buffers", () => {
        const data = new Uint8Array([]);
        const heapU8 = mainModuleEx.dataToHeap(data);

        expect(heapU8.size).toBe(0);
        expect(mainModuleEx.heapView(heapU8).length).toBe(0);

        mainModuleEx.free(heapU8);
    });

    it("checks filesystem support and wraps filesystem helpers", async () => {
        expect(mainModuleEx.hasFilesystem()).toBe(false);

        const createPath = vi.fn();
        const createDataFile = vi.fn();
        const preloadFile = vi.fn(async () => { });
        const unlink = vi.fn();
        Object.assign(mainModule, {
            FS_createPath: createPath,
            FS_createDataFile: createDataFile,
            FS_preloadFile: preloadFile,
        });

        try {
            expect(mainModuleEx.hasFilesystem()).toBe(false);
            Object.assign(mainModule, { FS_unlink: unlink });
            expect(mainModuleEx.hasFilesystem()).toBe(true);

            mainModuleEx.createPath("folder", false, true);
            expect(createPath).toHaveBeenCalledWith("/", "folder", false, true);

            const content = Uint8Array.from([1, 2, 3]);
            mainModuleEx.createDataFile("file.bin", content);
            expect(createDataFile).toHaveBeenCalledWith("/", "file.bin", content, true, true, true);

            await mainModuleEx.preloadFile("remote.bin", content, false, false, true, false, true);
            expect(preloadFile).toHaveBeenCalledWith("/", "remote.bin", content, false, false, true, false, true);

            mainModuleEx.unlink("/file.bin");
            expect(unlink).toHaveBeenCalledWith("/file.bin");

            const heap = mainModuleEx.dataToHeap(content);
            expect(mainModuleEx.heapToUint8Array(heap)).toEqual(content);
            mainModuleEx.free(heap);
        } finally {
            for (const key of ["FS_createPath", "FS_createDataFile", "FS_preloadFile", "FS_unlink"]) {
                Reflect.deleteProperty(mainModule, key);
            }
        }
    });

});
