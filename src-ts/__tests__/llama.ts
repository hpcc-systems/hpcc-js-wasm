import { expect } from "chai";
import { Llama } from "../llama";

describe.only("llama", function () {
    it("version", async function () {
        let llama = await Llama.load();
        let v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Llama.unload();

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Llama.unload();
    });

    it("test", async function () {
        let llama = await Llama.load();
        llama.test();
    });
});
