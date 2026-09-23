import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("base91 without optional browser globals", () => {
    it("loads and encodes data", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { Base91 } = await import(${JSON.stringify(distUrl)});
            const base91 = await Base91.load();
            const input = new Uint8Array([1, 2, 3]);
            const decoded = base91.decode(base91.encode(input));
            Base91.unload();
            parentPort.postMessage({ globalsAbsent, decoded: Array.from(decoded) });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, decoded: number[] }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.decoded).toEqual([1, 2, 3]);
    });
});