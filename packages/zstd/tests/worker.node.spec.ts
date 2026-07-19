import { describe, it, expect } from "vitest";
import { Worker } from "node:worker_threads";
import { Zstd } from "@hpcc-js/wasm-zstd";

type WorkerResponse = {
    compressedLength: number;
    restored: Uint8Array;
    streamingCompressedLength: number;
    streamingRestored: Uint8Array;
    version: string;
    error?: string;
};

function runWorker(data: Uint8Array): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./worker.node.js", import.meta.url));

        worker.on("message", function (data: WorkerResponse) {
            worker.terminate();
            if (data.error) {
                reject(new Error(data.error));
                return;
            }
            resolve(data);
        });
        worker.on("error", reject);
        worker.postMessage(data);
    });
}

describe("worker-node", function () {
    it("loads zstd and roundtrips data in a Node.js worker", async function () {
        const zstd = await Zstd.load();
        const version = zstd.version();
        await Zstd.unload();
        const data = new Uint8Array(Array.from({ length: 4096 }, (_, i) => i % 251));

        const result = await runWorker(data);

        expect(result.version).to.equal(version);
        expect(result.compressedLength).to.be.greaterThan(0);
        expect(result.streamingCompressedLength).to.be.greaterThan(0);
        expect(result.restored).to.deep.equal(data);
        expect(result.streamingRestored).to.deep.equal(data);
    });
});
