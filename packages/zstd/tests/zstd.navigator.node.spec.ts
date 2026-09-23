import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("zstd without optional browser globals", () => {
    it("loads and compresses data", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { Zstd } = await import(${JSON.stringify(distUrl)});
            const zstd = await Zstd.load();
            const input = new Uint8Array([1, 2, 3]);
            const decompressed = zstd.decompress(zstd.compress(input));
            Zstd.unload();
            parentPort.postMessage({ globalsAbsent, decompressed: Array.from(decompressed) });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, decompressed: number[] }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.decompressed).toEqual([1, 2, 3]);
    });
});