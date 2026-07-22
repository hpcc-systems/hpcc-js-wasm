import { Zstd } from "@hpcc-js/wasm-zstd";

self.onmessage = async function (e: MessageEvent<Uint8Array>) {
    try {
        const zstd = await Zstd.load();
        const input = e.data;

        const compressed = zstd.compress(input);
        const restored = zstd.decompress(compressed);

        zstd.resetCompression();
        const streamingCompressed = new Uint8Array([
            ...zstd.compressChunk(input.subarray(0, 128)),
            ...zstd.compressChunk(input.subarray(128)),
            ...zstd.compressEnd()
        ]);
        const streamingRestored = zstd.decompress(streamingCompressed);

        self.postMessage({
            compressedLength: compressed.length,
            restored,
            streamingCompressedLength: streamingCompressed.length,
            streamingRestored,
            version: zstd.version()
        });
    } catch (e) {
        self.postMessage({
            error: e instanceof Error ? e.message : String(e)
        });
    } finally {
        Zstd.unload();
    }
};
