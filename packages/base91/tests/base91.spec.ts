import { describe, it, expect } from "vitest";
import { Base91 } from "@hpcc-js/wasm-base91";

describe("base91", function () {

    it("unload resets singleton and is idempotent", async function () {
        await Base91.unload();

        const base91a = await Base91.load();
        expect(await Base91.load()).to.equal(base91a);

        await Base91.unload();

        const base91b = await Base91.load();
        expect(base91b).to.not.equal(base91a);
        expect(await Base91.load()).to.equal(base91b);

        await Base91.unload();
        await Base91.unload();
    });

    it("version", async function () {
        let base91 = await Base91.load();
        expect(await Base91.load()).to.equal(base91);
        let v = base91.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("0.6.0");
        console.log("base91 version: " + v);
        await Base91.unload();

        base91 = await Base91.load();
        expect(await Base91.load()).to.equal(base91);
        v = base91.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        await Base91.unload();
    });

    it("simple", async function () {
        const base91 = await Base91.load();
        const data = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));
        const base91Str = base91.encode(data);
        const data2 = await base91.decode(base91Str);
        expect(data).to.deep.equal(data2);
    });

    it("chunked encoding matches contiguous", async function () {
        const base91 = await Base91.load();
        const data = new Uint8Array(Array.from({ length: 257 }, (_, i) => (i * 17) % 256));

        base91.reset();
        const chunks = [
            data.subarray(0, 23),
            data.subarray(23, 128),
            data.subarray(128)
        ];

        const chunked = chunks.map(chunk => base91.encodeChunk(chunk)).join("") + base91.encodeChunkEnd();
        const contiguous = base91.encode(data);

        expect(chunked).to.equal(contiguous);
        const decoded = base91.decode(chunked);
        expect(decoded).to.deep.equal(data);
    });

    it("chunked decoding matches contiguous", async function () {
        const base91 = await Base91.load();
        const data = new Uint8Array(Array.from({ length: 333 }, (_, i) => (i * 7 + 3) % 256));
        const encoded = base91.encode(data);

        base91.reset();
        const encodedChunks = [
            encoded.slice(0, 11),
            encoded.slice(11, 59),
            encoded.slice(59)
        ];

        const decodedParts = encodedChunks.map(chunk => base91.decodeChunk(chunk));
        decodedParts.push(base91.decodeChunkEnd());

        const totalLength = decodedParts.reduce((acc, part) => acc + part.length, 0);
        const decoded = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of decodedParts) {
            decoded.set(part, offset);
            offset += part.length;
        }

        expect(decoded).to.deep.equal(data);
        expect(decoded).to.deep.equal(base91.decode(encoded));
    });
});
