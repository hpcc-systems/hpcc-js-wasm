import { describe, expect, it } from "vitest";
import { Worker as NodeWorker } from "node:worker_threads";
import { Llama } from "@hpcc-js/wasm-llama";

describe("llama threading in node", () => {
    it("supports threads > 1 when Worker is available", async () => {
        const originalWorker = (globalThis as { Worker?: unknown }).Worker;
        const sawThreadLog: string[] = [];
        const originalLog = console.log;

        console.log = (...args: unknown[]) => {
            const txt = args.map(arg => String(arg)).join(" ");
            if (txt.includes("[Llama] Effective threads:")) {
                sawThreadLog.push(txt);
            }
            originalLog(...args);
        };

        try {
            (globalThis as { Worker?: unknown }).Worker = NodeWorker as unknown;

            const llama = await Llama.load();
            const result = llama.main(["--threads", "4", "--threads-batch", "4", "--help"]);
            Llama.unload();

            expect(result.exitCode).to.equal(0);
            expect(sawThreadLog.some(line => line.includes("[Llama] Effective threads: 4, batch threads: 4"))).to.equal(true);
        } finally {
            (globalThis as { Worker?: unknown }).Worker = originalWorker;
            console.log = originalLog;
        }
    });
});
