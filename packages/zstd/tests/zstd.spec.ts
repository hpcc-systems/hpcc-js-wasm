import { describe, it, expect } from "vitest";
import { Zstd } from "@hpcc-js/wasm-zstd";

describe("zstd", function () {

    it("unload resets singleton and is idempotent", async function () {
        await Zstd.unload();

        const zstda = await Zstd.load();
        expect(await Zstd.load()).to.equal(zstda);

        await Zstd.unload();

        const zstdb = await Zstd.load();
        expect(zstdb).to.not.equal(zstda);
        expect(await Zstd.load()).to.equal(zstdb);

        await Zstd.unload();
        await Zstd.unload();
    });

    it("version", async function () {
        let zstd = await Zstd.load();
        let v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("1.5.7");
        console.log("zstd version: " + v);

        zstd = await Zstd.load();
        v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        await Zstd.unload();

        zstd = await Zstd.load();
        v = zstd.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        await Zstd.unload();
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

    it("compress-chunk", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 10000 }, (_, i) => i % 256));

        // Compress using chunks
        const CHUNK_SIZE = 3000;
        const compressedChunks: Uint8Array[] = [];
        zstd.reset();
        for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
            const chunk = data.subarray(offset, Math.min(offset + CHUNK_SIZE, data.length));
            compressedChunks.push(zstd.compressChunk(chunk));
        }
        compressedChunks.push(zstd.compressEnd());

        // Combine chunks
        const totalLength = compressedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const compressedData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of compressedChunks) {
            compressedData.set(chunk, offset);
            offset += chunk.length;
        }

        // Decompress and verify
        const decompressedData = zstd.decompress(compressedData);
        expect(data).to.deep.equal(decompressedData);
    });

    it("compress-chunk-vs-compress", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));

        // Compress using single call
        const compressedSingle = zstd.compress(data);

        // Compress using chunks
        const CHUNK_SIZE = 64 * 1024;
        const compressedChunks: Uint8Array[] = [];
        zstd.reset();
        for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
            const chunk = data.subarray(offset, Math.min(offset + CHUNK_SIZE, data.length));
            compressedChunks.push(zstd.compressChunk(chunk));
        }
        compressedChunks.push(zstd.compressEnd());

        const totalLength = compressedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const compressedChunked = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of compressedChunks) {
            compressedChunked.set(chunk, offset);
            offset += chunk.length;
        }

        // Both should decompress to the same data
        const decompressedSingle = zstd.decompress(compressedSingle);
        const decompressedChunked = zstd.decompress(compressedChunked);
        expect(data).to.deep.equal(decompressedSingle);
        expect(data).to.deep.equal(decompressedChunked);
    });

});
