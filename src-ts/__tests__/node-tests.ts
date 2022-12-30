import { expect } from "chai";
import { Worker } from "node:worker_threads";

describe("worker-node", function () {
    it("worker-cjs", async function () {
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

        const value = await new Promise(resolve => {
            const myWorker = new Worker("./dist-test/worker.node.cjs");
            myWorker.postMessage(data);
            myWorker.on("message", function (data) {
                resolve(data);
            });
        });
        expect(value).to.deep.equal(data);
    });

    it("worker-esm", async function () {
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

        const value = await new Promise(resolve => {
            const myWorker = new Worker("./dist-test/worker.node.js");
            myWorker.postMessage(data);
            myWorker.on("message", function (data) {
                resolve(data);
            });
        });
        expect(value).to.deep.equal(data);
    });
});
