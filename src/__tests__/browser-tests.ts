import { expect } from "chai";

describe("worker-browser", function () {
    it("worker-umd", async function () {
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

        const value = await new Promise(resolve => {
            const myWorker = new Worker("dist-test/worker.js");
            myWorker.postMessage(data);
            myWorker.onmessage = function (e) {
                resolve(e.data);
            };
        });
        expect(value).to.deep.equal(data);
    });

    it("worker-esm", async function () {
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

        const value = await new Promise(resolve => {
            const myWorker = new Worker("dist-test/worker.es6.js");
            myWorker.postMessage(data);
            myWorker.onmessage = function (e) {
                resolve(e.data);
            };
        });
        expect(value).to.deep.equal(data);
    });
});
