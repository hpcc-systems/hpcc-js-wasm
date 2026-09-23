import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("graphviz without optional browser globals", () => {
    it("loads and renders a graph", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { Graphviz } = await import(${JSON.stringify(distUrl)});
            const graphviz = await Graphviz.load();
            const svg = graphviz.layout("digraph G { Hello -> World }", "svg", "dot");
            Graphviz.unload();
            parentPort.postMessage({ globalsAbsent, rendered: svg.includes("<svg") });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, rendered: boolean }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.rendered).toBe(true);
    });
});