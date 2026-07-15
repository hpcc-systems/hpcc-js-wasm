import { copyFile, mkdir } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { browserTpl, neutralTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";
import { replaceFunction, replaceString } from "../../utils/esbuild-plugins.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wasmBuildPath = resolve(__dirname, "../../build/packages/zstd/zstdlib.wasm");
const wasmDistPath = resolve(__dirname, "dist/zstdlib.wasm");

const commonReplacePlugins = [
    replaceFunction({
        "findWasmBinary": "const findWasmBinary=()=>\"\";"
    }),
    replaceString({
        "import.meta.url": "''",
    }),
];

// Default: embed WASM in JS (backward compatible)
await neutralTpl("src/index.ts", "dist/index", {
    plugins: [
        ...commonReplacePlugins,
        sfxWasm()
    ]
});

// External ESM: JS glue only; consumers fetch zstdlib.wasm via wasmUrl
await neutralTpl("src/external.ts", "dist/external", {
    plugins: [
        ...commonReplacePlugins
    ]
});

// External UMD/IIFE: classic Worker importScripts() consumers
await browserTpl("src/external.ts", "dist/external", {
    format: "umd",
    libraryName: "hpccWasmZstdExternal",
    globalName: "hpccWasmZstdExternal",
    plugins: [
        ...commonReplacePlugins
    ]
});

await mkdir(dirname(wasmDistPath), { recursive: true });
await copyFile(wasmBuildPath, wasmDistPath);
