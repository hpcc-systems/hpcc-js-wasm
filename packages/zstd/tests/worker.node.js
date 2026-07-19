import { parentPort } from "node:worker_threads";
import { Zstd } from "@hpcc-js/wasm-zstd";

parentPort?.on("message", async function (data) {
    try {
        const zstd = await Zstd.load();

        const compressed = zstd.compress(data);
        const restored = zstd.decompress(compressed);

        zstd.resetCompression();
        const streamingCompressed = new Uint8Array([
            ...zstd.compressChunk(data.subarray(0, 128)),
            ...zstd.compressChunk(data.subarray(128)),
            ...zstd.compressEnd()
        ]);
        const streamingRestored = zstd.decompress(streamingCompressed);

        parentPort?.postMessage({
            compressedLength: compressed.length,
            restored,
            streamingCompressedLength: streamingCompressed.length,
            streamingRestored,
            version: zstd.version()
        });
    } catch (e) {
        parentPort?.postMessage({
            error: e instanceof Error ? e.message : String(e)
        });
    } finally {
        await Zstd.unload();
        process.exit(0);
    }
});
