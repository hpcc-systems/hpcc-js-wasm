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
        Zstd.unload();

        const zstda = await Zstd.load();
        expect(await Zstd.load()).to.equal(zstda);

        Zstd.unload();

        const zstdb = await Zstd.load();
        expect(zstdb).to.not.equal(zstda);
        expect(await Zstd.load()).to.equal(zstdb);

        Zstd.unload();
        Zstd.unload();
    });

    it("dispose unloads the current instance and supports using", async function () {
        Zstd.unload();

        let disposed: Zstd;
        {
            using zstd = await Zstd.load();
            disposed = zstd;
            expect(zstd.version()).to.equal("1.5.7");
        }
        const reloaded = await Zstd.load();
        expect(reloaded).to.not.equal(disposed);

        disposed.dispose();
        expect(await Zstd.load()).to.equal(reloaded);

        reloaded[Symbol.dispose]();
        expect(await Zstd.load()).to.not.equal(reloaded);
        Zstd.unload();
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

    it("validates runtime input lengths before accessing buffers", async function () {
        const zstd = await Zstd.load();
        const negativeLength = new Uint8Array(0);
        const oversizedLength = new Uint8Array(0);
        Object.defineProperty(negativeLength, "length", { value: -1 });
        Object.defineProperty(oversizedLength, "length", { value: 0x1_0000_0000 });

        expect(() => zstd.compress(negativeLength)).to.throw(/compress input length -1/);
        expect(() => zstd.decompress(oversizedLength)).to.throw(/decompress input length/);
        expect(() => zstd.compressChunk(negativeLength)).to.throw(/compressChunk input length -1/);
        expect(() => zstd.decompressChunk(oversizedLength)).to.throw(/decompressChunk input length/);
    });

    it("returns empty output for empty streaming chunks", async function () {
        const zstd = await Zstd.load();
        expect(zstd.compressChunk(new Uint8Array(0))).to.deep.equal(new Uint8Array(0));
        expect(zstd.decompressChunk(new Uint8Array(0))).to.deep.equal(new Uint8Array(0));
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

    it("legacy reset clears both streaming contexts", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 4096 }, (_, i) => i % 97));
        const compressed = streamCompress(zstd, data, 512, 5);

        zstd.resetDecompression();
        zstd.decompressChunk(compressed.subarray(0, 10));
        zstd.resetCompression(5);
        zstd.compressChunk(data.subarray(0, 100));

        zstd.reset();
        expect(() => zstd.decompressEnd()).to.throw(/empty compressed input/i);
        expect(streamDecompress(zstd, compressed, 33)).to.deep.equal(data);
        expect(zstd.decompress(streamCompress(zstd, data, 1000))).to.deep.equal(data);
    });

    it("streaming decompress flushes pending output with tiny input chunks", async function () {
        const zstd = await Zstd.load();
        // Feeding a high-ratio frame in tiny chunks leaves the decoder with pending output once a
        // chunk is fully consumed, exercising the empty-input flush and "need more input" paths.
        const data = new Uint8Array(1_000_000);
        const compressed = zstd.compress(data);
        expect(streamDecompress(zstd, compressed, 7)).to.deep.equal(data);
        expect(streamDecompress(zstd, compressed, 1)).to.deep.equal(data);
    });

    it("one-shot decompress rejects input without a Zstandard frame header", async function () {
        const zstd = await Zstd.load();
        expect(() => zstd.decompress(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))).to.throw("Failed to get frame content size: ZSTD_CONTENTSIZE_ERROR");
    });

    it("one-shot decompress rejects frame content sizes beyond the WASM32 range", async function () {
        const zstd = await Zstd.load();
        // Magic, single-segment header with an 8-byte content size of 2^33, then an empty last raw block.
        const frame = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD, 0xE0, 0, 0, 0, 0, 2, 0, 0, 0, 0x01, 0x00, 0x00]);
        expect(() => zstd.decompress(frame)).to.throw(/frame content size exceeds WASM addressable range/);
    });

    it("one-shot decompress rejects a truncated known-size frame", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array(Array.from({ length: 5000 }, (_, i) => (i * 31) % 256));
        const compressed = zstd.compress(data);
        expect(() => zstd.decompress(compressed.subarray(0, compressed.length - 1))).to.throw(/Failed to find frame compressed size/);
    });

    it("one-shot decompress rejects a frame whose content does not match its declared size", async function () {
        const zstd = await Zstd.load();
        // Single-segment frame declaring 10 bytes of content but carrying a single 5-byte raw block.
        const frame = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD, 0x20, 10, 0x29, 0x00, 0x00, 1, 2, 3, 4, 5]);
        expect(() => zstd.decompress(frame)).to.throw(/^decompress failed: /);
    });
});

describe("zstd native failure handling", function () {

    type Restore = () => void;

    function stub<T extends object, K extends keyof T>(target: T, key: K, value: T[K]): Restore {
        const had = Object.prototype.hasOwnProperty.call(target, key);
        const original = target[key];
        target[key] = value;
        return () => {
            if (had) {
                target[key] = original;
            } else {
                delete target[key];
            }
        };
    }

    async function withStubs(setup: (zstd: any) => Restore[], body: (zstd: Zstd) => void): Promise<void> {
        const zstd = await Zstd.load();
        const restores = setup(zstd as any);
        try {
            body(zstd);
        } finally {
            restores.reverse().forEach(restore => restore());
        }
        // The singleton must remain usable once the stubs are removed.
        const data = new Uint8Array(Array.from({ length: 2048 }, (_, i) => i % 13));
        expect(zstd.decompress(zstd.compress(data))).to.deep.equal(data);
        expect(streamDecompress(zstd, streamCompress(zstd, data, 100), 50)).to.deep.equal(data);
    }

    const streamError = (errorName: string) => () => ({ consumed: 0, produced: 0, remaining: 0, error: true, errorName });

    it("falls back to a generic message when a stream error has no name", async function () {
        await withStubs(zstd => [
            stub(zstd._zstd, "reset", streamError("")),
            stub(zstd._zstd, "resetCompression", streamError("stubbed compression reset failure")),
            stub(zstd._zstd, "resetDecompression", streamError("stubbed decompression reset failure"))
        ], zstd => {
            expect(() => zstd.reset()).to.throw("reset failed: unknown error");
            expect(() => zstd.resetCompression()).to.throw("resetCompression failed: stubbed compression reset failure");
            expect(() => zstd.resetDecompression()).to.throw("resetDecompression failed: stubbed decompression reset failure");
        });
    });

    it("reports input buffer allocation failures", async function () {
        await withStubs(zstd => [
            stub(zstd._mainModule, "dataToHeap", (data: Uint8Array) => ({ ptr: 0, size: data.length, dispose: () => { } }))
        ], zstd => {
            const data = new Uint8Array([1, 2, 3]);
            expect(() => zstd.compress(data)).to.throw("Failed to allocate compress input buffer");
            expect(() => zstd.compressChunk(data)).to.throw("Failed to allocate compressChunk input buffer");
            expect(() => zstd.decompress(data)).to.throw("Failed to allocate decompress input buffer");
            expect(() => zstd.decompressChunk(data)).to.throw("Failed to allocate decompressChunk input buffer");
            // A null pointer is acceptable for empty one-shot compression input.
            expect(zstd.compress(new Uint8Array(0)).length).to.be.greaterThan(0);
        });
    });

    it("reports output buffer allocation failures", async function () {
        const zstd = await Zstd.load();
        const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const zstdClass = (zstd as any)._zstdClass;
        const failSizes = new Set<number>([zstdClass.compressBound(data.length), zstdClass.CStreamOutSize(), zstdClass.DStreamOutSize()]);
        const compressed = zstd.compress(data);
        expect(failSizes.has(data.length)).to.equal(false);
        expect(failSizes.has(compressed.length)).to.equal(false);

        await withStubs(zstd => {
            const mainModule = zstd._mainModule;
            const malloc = mainModule.malloc.bind(mainModule);
            return [stub(mainModule, "malloc", (size: number) => failSizes.has(size) ? { ptr: 0, size, dispose: () => { } } : malloc(size))];
        }, zstd => {
            expect(() => zstd.compress(data)).to.throw(/^Failed to allocate \d+ bytes for compress output$/);
            zstd.resetCompression();
            expect(() => zstd.compressChunk(data)).to.throw(/^Failed to allocate \d+ bytes for compressChunk output$/);
            expect(() => zstd.compressEnd()).to.throw(/^Failed to allocate \d+ bytes for compressEnd output$/);
            zstd.resetDecompression();
            expect(() => zstd.decompressChunk(compressed)).to.throw(/^Failed to allocate \d+ bytes for decompressChunk output$/);
        });
    });

    it("reports one-shot compression errors from the codec", async function () {
        await withStubs(zstd => {
            const zstdClass = zstd._zstdClass;
            const failing = Object.create(zstdClass, {
                compress: { value: () => 0xFFFFFFFF }
            });
            return [stub(zstd, "_zstdClass", failing)];
        }, zstd => {
            expect(() => zstd.compress(new Uint8Array([1, 2, 3]))).to.throw(/^compress failed: /);
        });
    });

    it("guards against streaming calls that make no progress", async function () {
        await withStubs(zstd => [
            stub(zstd._zstd, "compressChunk", () => ({ consumed: 0, produced: 0, remaining: 1, error: false, errorName: "" })),
            stub(zstd._zstd, "compressEnd", () => ({ consumed: 0, produced: 0, remaining: 1, error: false, errorName: "" })),
            stub(zstd._zstd, "decompressChunk", () => ({ consumed: 0, produced: 0, remaining: 1, error: false, errorName: "" }))
        ], zstd => {
            expect(() => zstd.compressChunk(new Uint8Array([1, 2, 3]))).to.throw("compressChunk failed: no progress while consuming input");
            expect(() => zstd.compressEnd()).to.throw("compressEnd failed: no progress while finishing stream");
            expect(() => zstd.decompressChunk(new Uint8Array([1, 2, 3]))).to.throw("decompressChunk failed: no progress while consuming input");
        });
    });

    it("stops flushing when the decoder reports no pending output", async function () {
        const zstd = await Zstd.load();
        const outCapacity = (zstd as any)._zstdClass.DStreamOutSize();
        const calls: number[] = [];
        await withStubs(zstd => [
            stub(zstd._zstd, "decompressChunk", (_dst: number, _cap: number, _src: number, srcSize: number) => {
                calls.push(srcSize);
                return srcSize > 0
                    ? { consumed: srcSize, produced: outCapacity, remaining: 1, error: false, errorName: "" }
                    : { consumed: 0, produced: 0, remaining: 0, error: false, errorName: "" };
            })
        ], zstd => {
            zstd.resetDecompression();
            expect(zstd.decompressChunk(new Uint8Array([1, 2, 3])).length).to.equal(outCapacity);
            expect(calls).to.deep.equal([3, 0]);
            expect(() => zstd.decompressEnd()).to.throw(/truncated/i);
        });
    });
});
