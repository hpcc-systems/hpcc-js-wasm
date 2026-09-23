import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("llama CLI without optional browser globals", () => {
    it("shows help", async () => {
        const binUrl = pathToFileURL(resolve(process.cwd(), "bin/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            process.argv = [process.execPath, ${JSON.stringify(binUrl)}, "--help"];
            await import(${JSON.stringify(binUrl)});
            parentPort.postMessage({ globalsAbsent });
        `;

        const result = await new Promise<{ globalsAbsent: boolean }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
    });
});