import { describe, it, expect } from "vitest";
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";

const MODEL_URL = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";

async function loadModel(): Promise<ArrayBuffer> {
    // In Node.js, use a local disk cache to avoid re-downloading on every test run.
    if (typeof process !== "undefined" && process.versions?.node) {
        const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import("fs");
        const { resolve, dirname } = await import("path");
        const { fileURLToPath } = await import("url");
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const modelCache = resolve(__dirname, "../.vitest-attachments/bge-base-en-v1.5-q4_k_m.gguf");
        if (existsSync(modelCache)) {
            const buf = readFileSync(modelCache);
            return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        }
        const webBlob = await WebBlob.create(new URL(MODEL_URL));
        const data = await webBlob.arrayBuffer();
        mkdirSync(dirname(modelCache), { recursive: true });
        writeFileSync(modelCache, Buffer.from(data));
        return data;
    }
    // Browser: always fetch directly.
    const webBlob = await WebBlob.create(new URL(MODEL_URL));
    return webBlob.arrayBuffer();
}

describe("llama", () => {
    it("version", async () => {
        let llama = await Llama.load();
        let v = llama.version();
        const v1 = v;
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).to.equal("9860");    //  Update README.md with the new version!!!

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

    it("test", async () => {
        let llama = await Llama.load();
        const data: ArrayBuffer = await loadModel();
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
}, 60000);
