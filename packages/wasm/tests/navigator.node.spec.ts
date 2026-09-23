import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("wasm package without optional browser globals", () => {
    it("loads each library", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { Base91, DuckDB, Expat, Graphviz, Zstd } = await import(${JSON.stringify(distUrl)});
            const versions = await Promise.all([
                Base91.load().then(instance => instance.version()),
                DuckDB.load().then(instance => instance.version()),
                Expat.load().then(instance => instance.version()),
                Graphviz.load().then(instance => instance.version()),
                Zstd.load().then(instance => instance.version())
            ]);
            parentPort.postMessage({ globalsAbsent, versions });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, versions: string[] }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.versions).toHaveLength(5);
        expect(result.versions.every(version => version.length > 0)).toBe(true);
    });
});