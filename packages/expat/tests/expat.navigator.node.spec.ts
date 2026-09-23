import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("expat without optional browser globals", () => {
    it("loads and parses XML", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { Expat } = await import(${JSON.stringify(distUrl)});
            const expat = await Expat.load();
            const parsed = expat.parse("<root>content</root>", {
                startElement() {},
                endElement() {},
                characterData() {}
            });
            Expat.unload();
            parentPort.postMessage({ globalsAbsent, parsed });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, parsed: boolean }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.parsed).toBe(true);
    });
});