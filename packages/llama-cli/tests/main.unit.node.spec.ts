import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";
import { HELP_TEXT } from "../src/cliArgs.ts";
import { main } from "../src/main.ts";

describe("llama CLI main", () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    let llama: Llama;
    let mainResult: { exitCode: number; stdout: string; stderr: string };

    beforeEach(() => {
        process.argv = ["node", "llama-cli"];
        process.exitCode = 0;
        mainResult = { exitCode: 0, stdout: "", stderr: "" };
        llama = Object.create(Llama.prototype);
        Object.assign(llama, {
            main: vi.fn(() => mainResult),
            version: vi.fn(() => "test-version"),
        });
        vi.spyOn(Llama, "load").mockResolvedValue(llama);
        vi.spyOn(Llama, "unload").mockImplementation(() => { });
        vi.spyOn(process.stdout, "write").mockImplementation(() => true);
        vi.spyOn(process.stderr, "write").mockImplementation(() => true);
        vi.spyOn(console, "log").mockImplementation(() => { });
        vi.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        process.argv = originalArgv;
        process.exitCode = originalExitCode ?? 0;
    });

    it("prints help without loading the WASM module", async () => {
        process.argv.push("--help");

        await main();

        expect(console.log).toHaveBeenCalledWith(HELP_TEXT);
        expect(Llama.load).not.toHaveBeenCalled();
        expect(Llama.unload).not.toHaveBeenCalled();
    });

    it("loads the module and prints its version", async () => {
        process.argv.push("--version");

        await main();

        expect(console.log).toHaveBeenCalledWith("llama.cpp version:  test-version");
        expect(Llama.unload).toHaveBeenCalledOnce();
    });

    it("runs llama.cpp help and propagates its exit code", async () => {
        process.argv.push("--llama-help");
        mainResult = { exitCode: 1, stdout: "usage", stderr: "bad option" };

        await main();

        expect(llama.main).toHaveBeenCalledWith(["--help"]);
        expect(process.stdout.write).toHaveBeenCalledWith("usage");
        expect(process.stdout.write).toHaveBeenCalledWith("\n");
        expect(process.stderr.write).toHaveBeenCalledWith("bad option");
        expect(process.stderr.write).toHaveBeenCalledWith("\n");
        expect(process.exitCode).toBe(1);
        expect(Llama.unload).toHaveBeenCalledOnce();
    });

    it("keeps a successful llama.cpp help exit code", async () => {
        process.argv.push("--llama-help");
        mainResult = { exitCode: 0, stdout: "usage\n", stderr: "" };

        await main();

        expect(process.stdout.write).toHaveBeenCalledWith("usage\n");
        expect(process.exitCode).toBe(0);
    });

    it("passes ordinary arguments without a model and preserves existing newlines", async () => {
        process.argv.push("--", "--help");
        mainResult = { exitCode: 0, stdout: "result\n", stderr: "" };

        await main();

        expect(llama.main).toHaveBeenCalledWith(["--help"], undefined);
        expect(process.stdout.write).toHaveBeenCalledWith("result\n");
        expect(process.stderr.write).not.toHaveBeenCalled();
    });

    it("loads local model bytes and normalizes prompt arguments", async () => {
        const modelPath = new URL("../package.json", import.meta.url).pathname;
        process.argv.push("--model", modelPath, "--prompt", "hello");

        await main();

        const [args, model] = vi.mocked(llama.main).mock.calls[0]!;
        expect(args).toContain("--single-turn");
        expect(args).toContain("--prompt");
        expect(model).toBeInstanceOf(Uint8Array);
        expect(Llama.unload).toHaveBeenCalledOnce();
    });

    it("normalizes Hugging Face model URLs and loads the response bytes", async () => {
        const blobSpy = vi.spyOn(WebBlob, "create").mockResolvedValue(new Blob(["model"]));
        process.argv.push("--model", "https://huggingface.co/user/repo/blob/main/model.gguf");

        await main();

        expect(blobSpy).toHaveBeenCalledWith(new URL("https://huggingface.co/user/repo/resolve/main/model.gguf"));
        expect(vi.mocked(llama.main).mock.calls[0]![1]).toEqual(new Uint8Array(new TextEncoder().encode("model")));
    });

    it("loads other HTTP model URLs without rewriting them", async () => {
        const url = "https://example.com/models/model.gguf";
        const blobSpy = vi.spyOn(WebBlob, "create").mockResolvedValue(new Blob(["model"]));
        process.argv.push("--model", url);

        await main();

        expect(blobSpy).toHaveBeenCalledWith(new URL(url));
    });

    it("reports a missing local model and sets a failing exit code", async () => {
        process.argv.push("--model", "missing-model.gguf");

        await main();

        expect(console.error).toHaveBeenCalledWith("Error:  Model file does not exist: missing-model.gguf\n");
        expect(console.error).toHaveBeenCalledWith(HELP_TEXT);
        expect(process.exitCode).toBe(1);
    });

    it("falls back to local-file handling for non-HTTP and invalid URLs", async () => {
        process.argv.push("--model", "ftp://example.com/model.gguf");

        await main();

        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Model file does not exist"));
        expect(process.exitCode).toBe(1);

        process.argv = ["node", "llama-cli", "--model", "not a URL"];
        await main();

        expect(console.error).toHaveBeenCalledTimes(4);
    });

    it("reports load failures without attempting to unload an instance", async () => {
        vi.mocked(Llama.load).mockRejectedValueOnce(new Error("load failed"));
        process.argv.push("--version");

        await main();

        expect(console.error).toHaveBeenCalledWith("Error:  load failed\n");
        expect(process.exitCode).toBe(1);
        expect(Llama.unload).not.toHaveBeenCalled();
    });

    it("installs the worker global when it is absent", async () => {
        vi.stubGlobal("Worker", undefined);
        process.argv.push("--version");

        await main();

        expect(globalThis.Worker).toBeDefined();
    });
});
