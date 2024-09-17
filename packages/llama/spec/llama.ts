import { expect } from "chai";
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe("llama", function () {
    it("version", async function () {
        let llama = await Llama.load();
        let v = llama.version();
        const v1 = v;
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).to.equal("b3718");    //  Update README.md with the new version!!!

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).equals(v1);
        Llama.unload();

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).equals(v1);
        Llama.unload();
    });

    it("test", async function () {

        let llama = await Llama.load();
        const model = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";
        const webBlob: Blob = await WebBlob.create(new URL(model));
        expect(webBlob.type).to.be.a.string;
        expect(webBlob.type).equals("binary/octet-stream");
        const data: ArrayBuffer = await webBlob.arrayBuffer();
        expect(data).to.be.instanceOf(ArrayBuffer);
        expect(data.byteLength).to.be.greaterThan(0);

        const embeddings = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings).to.be.instanceOf(Array);
        expect(embeddings.length).equals(1);
        expect(embeddings[0]).to.be.a.instanceOf(Array);
        expect(embeddings[0].length).to.be.greaterThan(0);
        expect(embeddings[0][0]).to.be.a("number");

        const embeddings2 = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings2).to.be.instanceOf(Array);
        expect(embeddings2.length).equals(1);
        expect(embeddings2[0]).to.be.a.instanceOf(Array);
        expect(embeddings2[0].length).to.be.greaterThan(0);
        expect(embeddings2[0][0]).to.be.a("number");

        expect(embeddings).to.deep.equal(embeddings2);

        Llama.unload();
        llama = await Llama.load();

        const embeddings3 = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings3).to.be.instanceOf(Array);
        expect(embeddings3.length).equals(1);
        expect(embeddings3[0]).to.be.a.instanceOf(Array);
        expect(embeddings3[0].length).to.be.greaterThan(0);
        expect(embeddings3[0][0]).to.be.a("number");

        expect(embeddings).to.deep.equal(embeddings3);
    });
});
