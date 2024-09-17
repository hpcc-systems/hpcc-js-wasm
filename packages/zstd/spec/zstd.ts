import { expect } from "chai";
import { Zstd } from "@hpcc-js/wasm-zstd";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe("zstd", function () {
    it("version", async function () {
        let zstd = await Zstd.load();
        let v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("1.5.6");
        console.log("zstd version: " + v);

        zstd = await Zstd.load();
        v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Zstd.unload();

        zstd = await Zstd.load();
        v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Zstd.unload();
    });

    it("compress", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));
        const compressed_data = zstd.compress(data);
        const data2 = zstd.decompress(compressed_data);
        expect(data).to.deep.equal(data2);
    });

    it("c-level", async function () {
        const zstd = await Zstd.load();
        const min = zstd.minCLevel();
        expect(min).to.be.lessThan(0);
        const def = zstd.defaultCLevel();
        expect(def).to.be.greaterThan(0);
        const max = zstd.maxCLevel();
        expect(max).to.be.greaterThan(0);
        expect(def).to.be.lessThan(max);
    });

    it("compress-levels", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 10000 }, (_, i) => i % 256 > 128 ? Math.random() * 256 : i % 256));
        for (let c = 0; c <= zstd.maxCLevel(); ++c) {
            const compressed_data = zstd.compress(data, c);
            const data2 = zstd.decompress(compressed_data);
            expect(data).to.deep.equal(data2);
        }
    });

});
