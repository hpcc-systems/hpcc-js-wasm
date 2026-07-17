import { describe, expect, it } from "vitest";
import { Worker } from "node:worker_threads";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

describe("llama worker", () => {
    it("loads and runs inside a worker thread", async () => {
        const distUrl = pathToFileURL(resolve(process.cwd(), "dist/index.js")).href;
        const workerCode = `
            import { parentPort } from "node:worker_threads";
            const { Llama } = await import(${JSON.stringify(distUrl)});
            const llama = await Llama.load();
            const version = llama.version();
            Llama.unload();
            parentPort.postMessage({ version });
        `;

        const result = await new Promise<{ version: string }>((resolveResult, rejectResult) => {
            const worker = new Worker(workerCode, { eval: true, type: "module" });
            let settled = false;

            const resolveOnce = (value: { version: string }) => {
                if (settled) return;
                settled = true;
                worker.terminate().catch(() => undefined);
                resolveResult(value);
            };
            const rejectOnce = (err: unknown) => {
                if (settled) return;
                settled = true;
                worker.terminate().catch(() => undefined);
                rejectResult(err);
            };

            worker.once("message", (value) => resolveOnce(value as { version: string }));
            worker.once("error", rejectOnce);
            worker.once("exit", (code) => {
                if (!settled && code !== 0) {
                    rejectOnce(new Error(`worker exited with code ${code}`));
                }
            });
        });

        expect(result.version).to.be.a("string");
        expect(result.version.length).to.be.greaterThan(0);
    }, 60_000);
});
