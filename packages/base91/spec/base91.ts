import { expect } from "chai";
import { Base91 } from "@hpcc-js/wasm-base91";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe("base91", function () {

    it("version", async function () {
        let base91 = await Base91.load();
        expect(await Base91.load()).to.equal(base91);
        let v = base91.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("0.6.0");
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
});
