import { expect } from "chai";
import { Graphviz } from "@hpcc-js/wasm-graphviz";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe("worker-browser", function () {
    console.log("worker-esm-0");

    let v;
    it("fetch version", async function () {
        const graphviz = await Graphviz.load();
        v = graphviz.version();
        expect(v).to.be.a.string;
        Graphviz.unload();
    });

    let data;
    it("generate-data", function () {
        data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));
        expect(data).to.be.instanceOf(Uint8Array);
    });

    it("worker-esm", function (done) {

        new Promise(() => {
            console.log("worker-esm-2");
            const myWorker = new Worker("__spec__/worker.browser.js");
            expect(myWorker).to.be.instanceOf(Worker);
            myWorker.onmessage = function (e) {
                expect(e.data).to.deep.equal(data + v);
                done();
            };
            myWorker.onerror = function (e) {
                console.log(e);
                done.fail(e?.error?.message ?? e.message);
            };
            myWorker.postMessage(data);
        });
    });
});

