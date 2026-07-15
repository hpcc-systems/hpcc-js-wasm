import { describe, it, expect } from "vitest";

/**
 * Browser-only checks for the external WASM entry.
 */
describe("zstd external (browser)", function () {

    it("loads exactly one WASM request per singleton, including concurrent load()", async function () {
        const wasmUrl = new URL("../dist/zstdlib.wasm", import.meta.url);
        const wasmRequests: string[] = [];
        const originalFetch = globalThis.fetch.bind(globalThis);
        globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            if (url.includes("zstdlib.wasm")) {
                wasmRequests.push(url);
            }
            return originalFetch(input, init);
        }) as typeof fetch;

        try {
            const { Zstd } = await import("@hpcc-js/wasm-zstd/external");
            await Zstd.unload();
            const [a, b] = await Promise.all([
                Zstd.load({ wasmUrl }),
                Zstd.load({ wasmUrl })
            ]);
            expect(a).to.equal(b);
            expect(wasmRequests.length).to.equal(1);

            const payload = new Uint8Array([7, 6, 5, 4, 3, 2, 1]);
            expect(a.decompress(a.compress(payload))).to.deep.equal(payload);
            await Zstd.unload();
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("classic Worker can initialize via importScripts() and an explicit WASM URL", async function () {
        const wasmUrl = new URL("../dist/zstdlib.wasm", import.meta.url).href;
        const umdUrl = new URL("../dist/external.umd.js", import.meta.url).href;
        const classicWorker = `
            importScripts(${JSON.stringify(umdUrl)});
            self.onmessage = async () => {
                try {
                    const { Zstd } = self.hpccWasmZstdExternal;
                    await Zstd.unload();
                    const zstd = await Zstd.load({
                        wasmUrl: ${JSON.stringify(wasmUrl)}
                    });
                    const data = new Uint8Array([9, 8, 7, 6]);
                    const out = zstd.decompress(zstd.compress(data));
                    self.postMessage({ ok: true, out: Array.from(out) });
                } catch (err) {
                    self.postMessage({ ok: false, error: String(err) });
                }
            };
        `;
        const workerBlob = new Blob([classicWorker], { type: "text/javascript" });
        const workerUrl = URL.createObjectURL(workerBlob);
        // Classic worker (no type: "module") — validates importScripts + UMD entry.
        const worker = new Worker(workerUrl);
        try {
            const result = await new Promise<{ ok: boolean; out?: number[]; error?: string }>((resolve, reject) => {
                worker.onmessage = (ev) => resolve(ev.data);
                worker.onerror = (ev) => reject(ev.error ?? new Error(ev.message));
                worker.postMessage("go");
            });
            expect(result.ok, result.error).to.equal(true);
            expect(result.out).to.deep.equal([9, 8, 7, 6]);
        } finally {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        }
    });
});
