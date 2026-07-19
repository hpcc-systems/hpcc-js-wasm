// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/zstd/zstdlib.wasm";
import type { MainModule, zstd, StreamResult, FrameContentSizeResult } from "../types/zstdlib.js";
import { MainModuleEx, type HeapU8 } from "@hpcc-js/wasm-util";

type ZstdExports = MainModule["zstd"];

//  Ref:  http://facebook.github.io/zstd/zstd_manual.html
//  Ref:  https://github.com/facebook/zstd

let g_zstd: Promise<Zstd> | undefined;

const WASM32_MAX = 0xffffffff;

function assertSafeLength(length: number, label: string): void {
    if (!Number.isInteger(length) || length < 0 || length > WASM32_MAX) {
        throw new Error(`${label} length ${length} is outside the WASM32-safe range`);
    }
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
    if (chunks.length === 0) {
        return new Uint8Array(0);
    }
    if (chunks.length === 1) {
        return chunks[0];
    }
    let total = 0;
    for (const chunk of chunks) {
        total += chunk.length;
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
    }
    return out;
}

/**
 * The Zstandard WASM library, provides a simplified wrapper around the Zstandard c++ library.
 * 
 * See [Zstandard](https://facebook.github.io/zstd/) for more details.
 * 
 * ```ts
 * import { Zstd } from "@hpcc-js/wasm-zstd";
 * 
 * const zstd = await Zstd.load();
 * 
 * //  Generate some "data"
 * const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));
 * 
 * const compressed_data = zstd.compress(data);
 * const decompressed_data = zstd.decompress(compressed_data);
 * ```
 *
 * ::: warning
 * `Zstd.load()` returns a process-wide singleton. Streaming compression and decompression
 * mutate shared codec state and must be serialized by the caller. Do not interleave
 * concurrent streaming operations on the same instance.
 * :::
 */
export class Zstd {

    private _mainModule: MainModuleEx<MainModule>;
    private _zstdClass: ZstdExports;
    private _zstd: zstd;
    private _compressionLevel: number;
    private _decompressFrameCompleted = false;
    private _decompressRemaining = 0;
    private _decompressSawInput = false;

    private constructor(_module: MainModule) {
        this._mainModule = new MainModuleEx(_module);
        this._zstdClass = _module.zstd;
        this._zstd = new this._zstdClass();
        this._compressionLevel = this._zstdClass.defaultCLevel();
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Zstd class.
     */
    static load(): Promise<Zstd> {
        if (!g_zstd) {
            g_zstd = (load() as Promise<MainModule>).then((module) => new Zstd(module));
        }
        return g_zstd;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static async unload() {
        try {
            const zstd = await g_zstd;
            zstd?._zstd?.delete();
        } finally {
            reset();
            g_zstd = undefined;
        }
    }

    private copyHeap(data: HeapU8): Uint8Array {
        return this._mainModule.heapView(data).slice();
    }

    private mallocChecked(size: number, label: string): HeapU8 {
        assertSafeLength(size, label);
        const heap = this._mainModule.malloc(size);
        if (!heap.ptr) {
            this._mainModule.free(heap);
            throw new Error(`Failed to allocate ${size} bytes for ${label}`);
        }
        return heap;
    }

    private throwStreamError(operation: string, result: StreamResult): never {
        throw new Error(`${operation} failed: ${result.errorName || "unknown error"}`);
    }

    private ensureStreamOk(operation: string, result: StreamResult): void {
        if (result.error) {
            this.throwStreamError(operation, result);
        }
    }

    /**
     * @returns The Zstd c++ version
     */
    version(): string {
        return this._zstdClass.version();
    }

    /**
     * Resets both compression and decompression state (legacy API).
     * Prefer {@link resetCompression} / {@link resetDecompression} so the two
     * contexts are not reset accidentally together.
     */
    reset(): void {
        const result = this._zstd.reset();
        this.ensureStreamOk("reset", result);
        this._decompressFrameCompleted = false;
        this._decompressRemaining = 0;
        this._decompressSawInput = false;
    }

    /**
     * Resets compression state and optionally sets the compression level.
     * @param compressionLevel When omitted, the current level is kept.
     */
    resetCompression(compressionLevel?: number): void {
        if (compressionLevel !== undefined) {
            this._compressionLevel = compressionLevel;
        }
        const result = this._zstd.resetCompression(this._compressionLevel);
        this.ensureStreamOk("resetCompression", result);
    }

    /**
     * Resets decompression state before a new streaming decode.
     */
    resetDecompression(): void {
        const result = this._zstd.resetDecompression();
        this.ensureStreamOk("resetDecompression", result);
        this._decompressFrameCompleted = false;
        this._decompressRemaining = 0;
        this._decompressSawInput = false;
    }

    /**
     * Sets the compression level for streaming compression.
     * @param level Compression level (use minCLevel() to maxCLevel())
     */
    setCompressionLevel(level: number): void {
        const result = this._zstd.setCompressionLevel(level);
        this.ensureStreamOk("setCompressionLevel", result);
        this._compressionLevel = level;
    }

    /**
     * @param data Data to be compressed
     * @param compressionLevel Compression v Speed tradeoff, when omitted it will default to `zstd.defaultCLevel()` which is currently 3.
     * @returns Compressed data.
     *
     * :::tip
     * A note on compressionLevel:  The library supports regular compression levels from 1 up o 22. Levels >= 20, should be used with caution, as they require more memory. The library also offers negative compression levels, which extend the range of speed vs. ratio preferences.  The lower the level, the faster the speed (at the cost of compression).
     * :::
     */
    compress(data: Uint8Array, compressionLevel: number = this.defaultCLevel()): Uint8Array {
        assertSafeLength(data.length, "compress input");
        const uncompressed = this._mainModule.dataToHeap(data);
        try {
            if (!uncompressed.ptr && data.length > 0) {
                throw new Error("Failed to allocate compress input buffer");
            }

            const compressedSize = this._zstdClass.compressBound(data.length);
            const compressed = this.mallocChecked(compressedSize, "compress output");
            try {
                compressed.size = this._zstdClass.compress(compressed.ptr, compressedSize, uncompressed.ptr, uncompressed.size, compressionLevel);
                if (this._zstdClass.isError(compressed.size)) {
                    throw new Error(`compress failed: ${this._zstdClass.getErrorName(compressed.size)}`);
                }
                return this.copyHeap(compressed);
            } finally {
                this._mainModule.free(compressed);
            }
        } finally {
            this._mainModule.free(uncompressed);
        }
    }

    /**
     * Compresses a chunk of data in streaming mode.
     * Call {@link resetCompression} before the first chunk, then {@link compressChunk} for each chunk, and finally {@link compressEnd}.
     * Intermediate calls may return an empty array when Zstandard buffers input.
     * @param data Chunk of data to be compressed
     * @returns Compressed chunk data produced for this input (may be empty)
     */
    compressChunk(data: Uint8Array): Uint8Array {
        assertSafeLength(data.length, "compressChunk input");
        if (data.length === 0) {
            return new Uint8Array(0);
        }

        const uncompressed = this._mainModule.dataToHeap(data);
        try {
            if (!uncompressed.ptr) {
                throw new Error("Failed to allocate compressChunk input buffer");
            }

            const outCapacity = this._zstdClass.CStreamOutSize();
            const chunks: Uint8Array[] = [];
            let offset = 0;

            while (offset < data.length) {
                const compressed = this.mallocChecked(outCapacity, "compressChunk output");
                try {
                    const result = this._zstd.compressChunk(
                        compressed.ptr,
                        outCapacity,
                        uncompressed.ptr + offset,
                        data.length - offset
                    );
                    this.ensureStreamOk("compressChunk", result);
                    if (result.consumed === 0 && result.produced === 0) {
                        throw new Error("compressChunk failed: no progress while consuming input");
                    }
                    offset += result.consumed;
                    if (result.produced > 0) {
                        compressed.size = result.produced;
                        chunks.push(this.copyHeap(compressed));
                    }
                } finally {
                    this._mainModule.free(compressed);
                }
            }

            return concatUint8Arrays(chunks);
        } finally {
            this._mainModule.free(uncompressed);
        }
    }

    /**
     * Finishes the streaming compression and returns any remaining compressed data.
     * @returns Final compressed data
     */
    compressEnd(): Uint8Array {
        const outCapacity = this._zstdClass.CStreamOutSize();
        const chunks: Uint8Array[] = [];
        let remaining = 1;

        while (remaining !== 0) {
            const compressed = this.mallocChecked(outCapacity, "compressEnd output");
            try {
                const result = this._zstd.compressEnd(compressed.ptr, outCapacity);
                this.ensureStreamOk("compressEnd", result);
                if (result.produced === 0 && result.remaining !== 0) {
                    throw new Error("compressEnd failed: no progress while finishing stream");
                }
                remaining = result.remaining;
                if (result.produced > 0) {
                    compressed.size = result.produced;
                    chunks.push(this.copyHeap(compressed));
                }
            } finally {
                this._mainModule.free(compressed);
            }
        }

        return concatUint8Arrays(chunks);
    }

    private frameContentSize(compressed: HeapU8): FrameContentSizeResult {
        return this._zstdClass.getFrameContentSize(compressed.ptr, compressed.size);
    }

    /**
     * @param compressedData Data to be decompressed
     * @returns Uncompressed data.
     */
    decompress(compressedData: Uint8Array): Uint8Array {
        assertSafeLength(compressedData.length, "decompress input");
        const compressed = this._mainModule.dataToHeap(compressedData);
        try {
            if (!compressed.ptr && compressedData.length > 0) {
                throw new Error("Failed to allocate decompress input buffer");
            }

            const sizeInfo = this.frameContentSize(compressed);
            if (sizeInfo.error) {
                throw new Error(`Failed to get frame content size: ${sizeInfo.errorName}`);
            }

            let useFastPath = sizeInfo.known;
            if (useFastPath) {
                // ZSTD_decompress only handles one frame. Known-size concatenated
                // frames would allocate only for the first frame and overflow.
                const frameCompressedSize = this._zstdClass.findFrameCompressedSize(compressed.ptr, compressed.size);
                if (this._zstdClass.isError(frameCompressedSize)) {
                    throw new Error(`Failed to find frame compressed size: ${this._zstdClass.getErrorName(frameCompressedSize)}`);
                }
                if (frameCompressedSize < compressed.size) {
                    useFastPath = false;
                }
            }

            if (useFastPath) {
                const uncompressed = this.mallocChecked(sizeInfo.size, "decompress output");
                try {
                    uncompressed.size = this._zstdClass.decompress(
                        uncompressed.ptr,
                        sizeInfo.size,
                        compressed.ptr,
                        compressed.size
                    );
                    if (this._zstdClass.isError(uncompressed.size)) {
                        throw new Error(`decompress failed: ${this._zstdClass.getErrorName(uncompressed.size)}`);
                    }
                    return this.copyHeap(uncompressed);
                } finally {
                    this._mainModule.free(uncompressed);
                }
            }
        } finally {
            this._mainModule.free(compressed);
        }

        return this.decompressViaStreaming(compressedData);
    }

    private decompressViaStreaming(compressedData: Uint8Array): Uint8Array {
        this.resetDecompression();
        const produced = this.decompressChunk(compressedData);
        this.decompressEnd();
        return produced;
    }

    /**
     * Decompresses a chunk of data in streaming mode.
     * Call {@link resetDecompression} before the first chunk, then {@link decompressChunk} for each chunk, and finally {@link decompressEnd}.
     * Intermediate calls may return an empty array. Callers must not guess an output size.
     * @param compressedData Chunk of compressed data
     * @returns Decompressed chunk data produced for this input (may be empty)
     */
    decompressChunk(compressedData: Uint8Array): Uint8Array {
        assertSafeLength(compressedData.length, "decompressChunk input");
        if (compressedData.length === 0) {
            return new Uint8Array(0);
        }

        this._decompressSawInput = true;
        const compressed = this._mainModule.dataToHeap(compressedData);
        try {
            if (!compressed.ptr) {
                throw new Error("Failed to allocate decompressChunk input buffer");
            }

            const outCapacity = this._zstdClass.DStreamOutSize();
            const chunks: Uint8Array[] = [];
            let offset = 0;
            let outputFilled = false;

            // Continue while input remains, or the previous step filled the output buffer
            // (pending decoder output may still need an empty-input flush).
            while (offset < compressedData.length || outputFilled) {
                const uncompressed = this.mallocChecked(outCapacity, "decompressChunk output");
                try {
                    const srcSize = offset < compressedData.length
                        ? compressedData.length - offset
                        : 0;
                    const srcPtr = srcSize > 0
                        ? compressed.ptr + offset
                        : 0;
                    const result = this._zstd.decompressChunk(
                        uncompressed.ptr,
                        outCapacity,
                        srcPtr,
                        srcSize
                    );
                    this.ensureStreamOk("decompressChunk", result);

                    if (result.consumed === 0 && result.produced === 0) {
                        if (srcSize === 0) {
                            if (result.remaining > 0) {
                                // Need more compressed input — wait for the next chunk.
                                this._decompressRemaining = result.remaining;
                            }
                            // remaining === 0: fully flushed, or waiting for input above.
                            break;
                        }
                        throw new Error("decompressChunk failed: no progress while consuming input");
                    }

                    offset += result.consumed;
                    // Only flush with empty input while the current frame still has pending output.
                    // When remaining === 0 the frame is complete (even if the buffer filled exactly);
                    // a follow-up empty call can return a non-zero hint and must not look like truncation.
                    outputFilled = result.produced === outCapacity && result.remaining !== 0;

                    if (result.produced > 0) {
                        uncompressed.size = result.produced;
                        chunks.push(this.copyHeap(uncompressed));
                    }
                    if (result.remaining === 0) {
                        this._decompressFrameCompleted = true;
                        this._decompressRemaining = 0;
                    } else {
                        this._decompressRemaining = result.remaining;
                    }
                } finally {
                    this._mainModule.free(uncompressed);
                }
            }

            return concatUint8Arrays(chunks);
        } finally {
            this._mainModule.free(compressed);
        }
    }

    /**
     * Verifies that streaming decompression completed a full frame and was not truncated.
     * Empty intermediate output is not treated as completion; call this after the final chunk.
     */
    decompressEnd(): void {
        if (!this._decompressSawInput) {
            throw new Error("decompressEnd failed: empty compressed input is not a completed frame");
        }
        if (!this._decompressFrameCompleted || this._decompressRemaining !== 0) {
            throw new Error("decompressEnd failed: truncated Zstandard input");
        }
    }

    /**
     * @returns Default compression level (see notes above above).
     */
    defaultCLevel(): number {
        return this._zstdClass.defaultCLevel();
    }

    minCLevel(): number {
        return this._zstdClass.minCLevel();
    }

    maxCLevel(): number {
        return this._zstdClass.maxCLevel();
    }
}
