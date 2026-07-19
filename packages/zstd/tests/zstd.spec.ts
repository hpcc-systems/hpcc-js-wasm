import { describe, it, expect } from "vitest";
import { Zstd } from "@hpcc-js/wasm-zstd";

function concat(chunks: Uint8Array[]): Uint8Array {
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out;
}

function streamCompress(zstd: Zstd, data: Uint8Array, chunkSize: number, level?: number): Uint8Array {
    zstd.resetCompression(level);
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < data.length; offset += chunkSize) {
        chunks.push(zstd.compressChunk(data.subarray(offset, Math.min(offset + chunkSize, data.length))));
    }
    chunks.push(zstd.compressEnd());
    return concat(chunks);
}

function streamDecompress(zstd: Zstd, data: Uint8Array, chunkSize: number): Uint8Array {
    zstd.resetDecompression();
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < data.length; offset += chunkSize) {
        chunks.push(zstd.decompressChunk(data.subarray(offset, Math.min(offset + chunkSize, data.length))));
    }
    zstd.decompressEnd();
    return concat(chunks);
}

function mulberry32(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function deterministicSplits(length: number, seed: number): number[] {
    const rand = mulberry32(seed);
    const sizes: number[] = [];
    let remaining = length;
    while (remaining > 0) {
        const size = Math.max(1, Math.min(remaining, Math.floor(rand() * 17) + 1));
        sizes.push(size);
        remaining -= size;
    }
    return sizes;
}

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

    it("rejecting a streaming compression level does not poison the next reset", async function () {
        const zstd = await Zstd.load();
        const native = (zstd as any)._zstd;
        const originalSetCompressionLevel = native.setCompressionLevel.bind(native);

        native.setCompressionLevel = () => ({
            consumed: 0,
            produced: 0,
            remaining: 0,
            error: true,
            errorName: "stubbed compression failure"
        });

        expect(() => zstd.setCompressionLevel(zstd.maxCLevel())).to.throw("setCompressionLevel failed: stubbed compression failure");
        expect((zstd as any)._compressionLevel).to.equal(zstd.defaultCLevel());

        native.setCompressionLevel = originalSetCompressionLevel;
        expect(() => zstd.resetCompression()).not.to.throw();

        const data = new Uint8Array(Array.from({ length: 1024 }, (_, i) => i % 256));
        const compressed = streamCompress(zstd, data, 128);
        expect(zstd.decompress(compressed)).to.deep.equal(data);
    });

    it("compress-levels", async function () {
        const zstd = await Zstd.load();
        const rand = mulberry32(7);
        const data = new Uint8Array(Array.from({ length: 10000 }, (_, i) => i % 256 > 128 ? Math.floor(rand() * 256) : i % 256));
        for (let c = 0; c <= zstd.maxCLevel(); ++c) {
            const compressed_data = zstd.compress(data, c);
            const data2 = zstd.decompress(compressed_data);
            expect(data).to.deep.equal(data2);
        }
    });

    it("compress empty input produces a valid empty frame", async function () {
        const zstd = await Zstd.load();
        const compressed = zstd.compress(new Uint8Array(0));
        expect(compressed.length).to.be.greaterThan(0);
        expect(zstd.decompress(compressed)).to.deep.equal(new Uint8Array(0));
    });

    it("compress-chunk", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 10000 }, (_, i) => i % 256));
        const compressedData = streamCompress(zstd, data, 3000);
        const decompressedData = zstd.decompress(compressedData);
        expect(data).to.deep.equal(decompressedData);
    });

    it("compress-chunk-vs-compress", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));
        const compressedSingle = zstd.compress(data);
        const compressedChunked = streamCompress(zstd, data, 64 * 1024);
        expect(data).to.deep.equal(zstd.decompress(compressedSingle));
        expect(data).to.deep.equal(zstd.decompress(compressedChunked));
    });

    it("streaming compress empty stream finalization", async function () {
        const zstd = await Zstd.load();
        zstd.resetCompression();
        const compressed = zstd.compressEnd();
        expect(zstd.decompress(compressed)).to.deep.equal(new Uint8Array(0));
    });

    it("streaming compress over many chunk sizes and levels", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 120000 }, (_, i) => (i * 17) % 256));
        const chunkSizes = [1, 3, 64 * 1024, 7777];
        const levels = [1, 3, 10, 19, 22];
        for (const level of levels) {
            for (const chunkSize of chunkSizes) {
                const compressed = streamCompress(zstd, data, chunkSize, level);
                expect(zstd.decompress(compressed)).to.deep.equal(data);
            }
        }
    });

    it("streaming compress with continue does not pathologically expand chunked input", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 256 * 1024 }, () => 0));
        const oneShot = zstd.compress(data, 3);
        const chunked = streamCompress(zstd, data, 1024, 3);
        // Continue-based streaming should stay in the same ballpark as one-shot on highly compressible data.
        expect(chunked.length).to.be.lessThan(oneShot.length * 4 + 256);
        expect(zstd.decompress(chunked)).to.deep.equal(data);
    });

    it("streaming decompress across tiny and uneven boundaries", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 4096 }, (_, i) => i % 251));
        const compressed = streamCompress(zstd, data, 100);
        for (const chunkSize of [1, 3, 7, 64 * 1024]) {
            expect(streamDecompress(zstd, compressed, chunkSize)).to.deep.equal(data);
        }
        const splits = deterministicSplits(compressed.length, 42);
        zstd.resetDecompression();
        const out: Uint8Array[] = [];
        let offset = 0;
        for (const size of splits) {
            out.push(zstd.decompressChunk(compressed.subarray(offset, offset + size)));
            offset += size;
        }
        zstd.decompressEnd();
        expect(concat(out)).to.deep.equal(data);
    });

    it("streaming decompress drains large output across many DStream buffers", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(8 * 1024 * 1024);
        for (let i = 0; i < data.length; ++i) {
            data[i] = i & 0xff;
        }
        const compressed = streamCompress(zstd, data, 64 * 1024);
        expect(streamDecompress(zstd, compressed, 64 * 1024)).to.deep.equal(data);
    });

    it("one-shot decompress falls back for unknown-size high-ratio frames", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(5 * 1024 * 1024);
        const compressed = streamCompress(zstd, data, 64 * 1024);
        expect(compressed.length).to.be.lessThan(1024 * 1024);
        const restored = zstd.decompress(compressed);
        expect(restored.length).to.equal(data.length);
        expect(restored).to.deep.equal(data);
    });

    it("one-shot decompress unknown-size incompressible data larger than 4MiB", async function () {
        const zstd = await Zstd.load();
        const rand = mulberry32(99);
        const data = new Uint8Array(4 * 1024 * 1024 + 123);
        for (let i = 0; i < data.length; ++i) {
            data[i] = Math.floor(rand() * 256);
        }
        const compressed = streamCompress(zstd, data, 50 * 1024);
        expect(zstd.decompress(compressed)).to.deep.equal(data);
    });

    it("decodes concatenated frames including mid-header chunk boundaries", async function () {
        const zstd = await Zstd.load();
        const a = new Uint8Array([1, 2, 3, 4, 5]);
        const b = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 200));
        const c = new Uint8Array([9, 8, 7]);
        const fa = streamCompress(zstd, a, 2);
        const fb = streamCompress(zstd, b, 50);
        const fc = streamCompress(zstd, c, 1);
        const concatenated = concat([fa, fb, fc]);
        expect(streamDecompress(zstd, concatenated, 1)).to.deep.equal(concat([a, b, c]));
        expect(zstd.decompress(concatenated)).to.deep.equal(concat([a, b, c]));
    });

    it("one-shot decompress handles concatenated known-size frames", async function () {
        const zstd = await Zstd.load();
        const a = new Uint8Array([1, 2, 3]);
        const b = new Uint8Array([4, 5, 6, 7]);
        const concatenated = concat([zstd.compress(a), zstd.compress(b)]);
        expect(zstd.decompress(concatenated)).to.deep.equal(concat([a, b]));
    });

    it("streaming decompress drains when output exactly fills DStream buffers", async function () {
        const zstd = await Zstd.load();
        // Highly compressible payload sized to exercise multiple full output buffers,
        // including a final step that can fill the destination exactly.
        const data = new Uint8Array(1024 * 1024);
        const compressed = streamCompress(zstd, data, 64 * 1024);
        // Single supplied chunk forces internal flush/drain across DStreamOutSize boundaries.
        expect(streamDecompress(zstd, compressed, compressed.length)).to.deep.equal(data);
    });

    it("decodes a valid empty frame via streaming", async function () {
        const zstd = await Zstd.load();
        zstd.resetCompression();
        const emptyFrame = zstd.compressEnd();
        zstd.resetDecompression();
        expect(zstd.decompressChunk(emptyFrame)).to.deep.equal(new Uint8Array(0));
        zstd.decompressEnd();
    });

    it("rejects entirely empty compressed input", async function () {
        const zstd = await Zstd.load();
        zstd.resetDecompression();
        expect(() => zstd.decompressEnd()).to.throw(/empty compressed input/i);
        expect(() => zstd.decompress(new Uint8Array(0))).to.throw();
    });

    it("rejects corrupt and truncated streams", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 2000 }, (_, i) => i % 256));
        const compressed = streamCompress(zstd, data, 100);

        expect(() => {
            zstd.resetDecompression();
            zstd.decompressChunk(new Uint8Array([0x50, 0x00, 0x00]));
            zstd.decompressEnd();
        }).to.throw(/decompressChunk failed/i);

        const truncatedPoints = [1, 8, Math.floor(compressed.length / 2), compressed.length - 1];
        for (const n of truncatedPoints) {
            expect(() => {
                zstd.resetDecompression();
                zstd.decompressChunk(compressed.subarray(0, n));
                zstd.decompressEnd();
            }).to.throw(/truncated/i);
        }

        // Invalid frame: magic + clearly broken descriptor/payload
        const broken = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD, 0x20, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]);
        expect(() => {
            zstd.resetDecompression();
            zstd.decompressChunk(broken);
            zstd.decompressEnd();
        }).to.throw(/decompressChunk failed|truncated/i);
    });

    it("does not return partial success after a terminal codec error", async function () {
        const zstd = await Zstd.load();
        const broken = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD, 0x00, 0x58, 0x00, 0x00, 0x00, 0xff, 0xff]);
        zstd.resetDecompression();
        let threw = false;
        try {
            zstd.decompressChunk(broken);
            zstd.decompressEnd();
        } catch {
            threw = true;
        }
        expect(threw).to.equal(true);
    });
});
