import { expect } from "chai";
import { Base91 } from "@hpcc-js/wasm/base91";
import { Zstd } from "@hpcc-js/wasm/zstd";
import { Console } from "node:console";

describe("base91", function () {

    it("version", async function () {
        let base91 = await Base91.load();
        expect(await Base91.load()).to.equal(base91);
        let v = base91.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        console.log("base91 version: " + v);
        Base91.unload();

        base91 = await Base91.load();
        expect(await Base91.load()).to.equal(base91);
        v = base91.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Base91.unload();
    });

    it("simple", async function () {
        const base91 = await Base91.load();

        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));
        const base91Str = base91.encode(data);
        const data2 = await base91.decode(base91Str);
        expect(data).to.deep.equal(data2);
    });

    it("encoded", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 1000000 }, (_, i) => i % 256));
        const compressed_data = zstd.compress(data);

        const base91 = await Base91.load();
        const base91Str = base91.encode(compressed_data);
        const compressed_data2 = base91.decode(base91Str);
        expect(compressed_data).to.deep.equal(compressed_data2);

        const data2 = zstd.decompress(compressed_data2);
        expect(data).to.deep.equal(data2);
    });
});
