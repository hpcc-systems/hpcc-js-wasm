// Embind/Emscripten glue; the binary is fetched from `wasmUrl` (not embedded).
import wrapper from "../../../build/packages/zstd/zstdlib.js";
import type { MainModule } from "../types/zstdlib.js";
import { bindZstdModule, Zstd } from "./zstd.ts";

let g_module: Promise<MainModule> | undefined;

function reset(): void {
    g_module = undefined;
}

async function readWasmBinary(wasmUrl: string | URL): Promise<Uint8Array> {
    const url = String(wasmUrl);
    let response: Response;
    try {
        response = await fetch(url);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to load Zstd WASM from ${url}: ${message}`, { cause: err });
    }
    if (!response.ok) {
        throw new Error(`Failed to load Zstd WASM from ${url}: HTTP ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
}

bindZstdModule(
    async (options) => {
        if (!options?.wasmUrl && !options?.wasmBinary) {
            throw new Error("Zstd.load() via @hpcc-js/wasm-zstd/external requires { wasmUrl } or { wasmBinary }");
        }
        if (!g_module) {
            const url = options.wasmUrl ? String(options.wasmUrl) : "zstdlib.wasm";
            g_module = (async () => {
                const wasmBinary = options.wasmBinary
                    ? options.wasmBinary
                    : await readWasmBinary(options.wasmUrl!);
                return wrapper({
                    wasmBinary,
                    locateFile: () => url
                }) as Promise<MainModule>;
            })().catch((err) => {
                g_module = undefined;
                throw err;
            });
        }
        return g_module;
    },
    reset
);

export { Zstd };
export type { ZstdLoadOptions } from "./zstd.ts";
