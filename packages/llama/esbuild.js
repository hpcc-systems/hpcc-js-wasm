import { neutralTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { replaceFunction, replaceFunctionByName } from "../../utils/esbuild-plugins.js";

//  config  ---
await neutralTpl("src/index.ts", "dist/index", {
    plugins: [
        replaceFunction({
            'findWasmBinary': 'const findWasmBinary=()=>"";'
        }),
        sfxWasm()
    ]
});

await mkdir("dist", { recursive: true });
await copyFile("../../build/packages/llama/llamalib.js", "dist/llamalib.js");

const workerPath = "dist/llamalib.js";
const workerContents = await readFile(workerPath, "utf8");
const rewrittenWorker = replaceFunctionByName(
    workerContents,
    "findWasmBinary",
    'function findWasmBinary(){return ""}',
    [/function\s+findWasmBinary\s*\([^)]*\)\s*\{/g]
);
if (rewrittenWorker === workerContents || rewrittenWorker.includes("llamalib.wasm")) {
    throw new Error("Failed to remove the external WASM reference from the Llama worker");
}
await writeFile(workerPath, rewrittenWorker);
