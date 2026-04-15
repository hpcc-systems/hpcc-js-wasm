import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadMock, resetMock } = vi.hoisted(() => ({
    loadMock: vi.fn(),
    resetMock: vi.fn(),
}));

vi.mock("../../../build/packages/llama/llamalib.wasm", () => ({
    default: loadMock,
    reset: resetMock,
}));

import { Llama } from "../src/llama.ts";

class FakeVectorString {
    values: string[] = [];

    push_back(value: string) {
        this.values.push(value);
    }

    get(index: number) {
        return this.values[index];
    }

    delete() {
    }
}

describe("Llama unit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads and unloads through the wasm module hooks", async () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
        };
        loadMock.mockResolvedValueOnce(fakeModule);

        const llama = await Llama.load();

        expect(llama).toBeInstanceOf(Llama);
        expect(loadMock).toHaveBeenCalledTimes(1);

        Llama.unload();
        expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it("logs file creation and embedding failures, then reads redirected output", () => {
        const createFileError = new Error("create failed");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const readFile = vi.fn((fileName: string) => {
            if (fileName === "error.txt") {
                return "redirected stderr";
            }
            throw new Error("missing output");
        });
        const fakeModule = {
            FS_createDataFile: vi.fn(() => {
                throw createFileError;
            }),
            FS_unlink: vi.fn(),
            FS: {
                readFile,
            },
            VectorString: FakeVectorString,
            embedding: vi.fn((_args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["", "embedding stderr"];
                return 1;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const embeddings = llama.embedding("hello", Uint8Array.from([1, 2, 3]));

        expect(embeddings).toEqual([]);
        expect(fakeModule.embedding).toHaveBeenCalledTimes(1);
        expect(fakeModule.FS_unlink).toHaveBeenCalledWith("/embeddingModel.gguf");
        expect(readFile).toHaveBeenCalledWith("error.txt", { encoding: "utf8" });
        expect(readFile).toHaveBeenCalledWith("output.txt", { encoding: "utf8" });
        expect(consoleError).toHaveBeenCalledWith(createFileError);
        expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
        expect(consoleError).toHaveBeenCalledWith("redirected stderr");

        consoleError.mockRestore();
    });
});