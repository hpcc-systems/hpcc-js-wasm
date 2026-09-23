import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("duckdb without optional browser globals", () => {
    it("loads and executes a query", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const optionalBrowserGlobals = ["navigator", "window", "document", "Worker", "XMLHttpRequest", "fetch", "Blob", "SharedArrayBuffer"];
            for (const name of optionalBrowserGlobals) delete globalThis[name];
            const globalsAbsent = optionalBrowserGlobals.every(name => typeof globalThis[name] === "undefined");
            const { DuckDB } = await import(${JSON.stringify(distUrl)});
            const duckdb = await DuckDB.load();
            const connection = duckdb.connect();
            const result = connection.query("SELECT 42 AS value");
            const value = result.getValue(0, 0);
            result.delete();
            connection.delete();
            DuckDB.unload();
            parentPort.postMessage({ globalsAbsent, value });
        `;

        const result = await new Promise<{ globalsAbsent: boolean, value: number }>((resolveResult, rejectResult) => {
            const workerUrl = new URL(`data:text/javascript,${encodeURIComponent(workerCode)}`);
            const worker = new Worker(workerUrl);

            worker.once("message", resolveResult);
            worker.once("error", rejectResult);
        });

        expect(result.globalsAbsent).toBe(true);
        expect(result.value).toBe(42);
    });
});