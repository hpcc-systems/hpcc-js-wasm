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

    it("heapToUint8Array returns a copy", () => {
        const input = Uint8Array.from([4, 5, 6]);
        const heapU8 = mainModuleEx.dataToHeap(input);

        const copy = mainModuleEx.heapToUint8Array(heapU8);
        copy[0] = 99;

        expect(Array.from(copy)).toEqual([99, 5, 6]);
        expect(Array.from(mainModuleEx.heapView(heapU8))).toEqual([4, 5, 6]);

        mainModuleEx.free(heapU8);
    });

    it("creates, reads, and unlinks files", () => {
        expect(mainModuleEx.hasFilesystem()).toBe(false);
    });

    it("detects filesystem support when FS helpers exist", () => {
        const fakeModule = {
            FS_createPath: vi.fn(),
            FS_createDataFile: vi.fn(),
            FS_preloadFile: vi.fn(),
            FS_unlink: vi.fn(),
        } as unknown as MainModule;

        const fakeModuleEx = new MainModuleEx(fakeModule);

        expect(fakeModuleEx.hasFilesystem()).toBe(true);
    });

    it("proxies filesystem helper calls", async () => {
        const fakeModule = {
            FS_createPath: vi.fn().mockReturnValue("created-path"),
            FS_createDataFile: vi.fn().mockReturnValue("created-file"),
            FS_preloadFile: vi.fn().mockResolvedValue("preloaded-file"),
            FS_unlink: vi.fn().mockReturnValue("unlinked-file"),
        } as unknown as MainModule;

        const fakeModuleEx = new MainModuleEx(fakeModule);
        const data = Uint8Array.from([1, 2, 3]);

        expect(fakeModuleEx.createPath("tmp", false, true)).toBe("created-path");
        expect(fakeModuleEx.createDataFile("tmp.bin", data, true, false, false)).toBe("created-file");
        await expect(fakeModuleEx.preloadFile("tmp.bin", data, false, true, true, false, true)).resolves.toBe("preloaded-file");
        expect(fakeModuleEx.unlink("tmp.bin")).toBe("unlinked-file");

        expect((fakeModule as any).FS_createPath).toHaveBeenCalledWith("/", "tmp", false, true);
        expect((fakeModule as any).FS_createDataFile).toHaveBeenCalledWith("/", "tmp.bin", data, true, false, false);
        expect((fakeModule as any).FS_preloadFile).toHaveBeenCalledWith("/", "tmp.bin", data, false, true, true, false, true);
        expect((fakeModule as any).FS_unlink).toHaveBeenCalledWith("tmp.bin");
    });

});

