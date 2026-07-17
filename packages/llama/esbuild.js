import { neutralTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { replaceFunction } from "../../utils/esbuild-plugins.js";

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
await writeFile(workerPath, workerContents.replace(
    'function findWasmBinary(){if(Module["locateFile"]){return locateFile("llamalib.wasm")}return new URL("llamalib.wasm",import.meta.url).href}',
    'function findWasmBinary(){return ""}'
));
