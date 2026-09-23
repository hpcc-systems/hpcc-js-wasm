import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("nam core without optional browser globals", () => {
    it("loads and reports its version", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { NeuralAmpModelerCore } = await import(${JSON.stringify(distUrl)});
            const nam = await NeuralAmpModelerCore.load();
            const version = nam.version();
            NeuralAmpModelerCore.unload();
            parentPort.postMessage({ globalsAbsent, version });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, version: string }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.version.length).toBeGreaterThan(0);
    }, 60_000);
});