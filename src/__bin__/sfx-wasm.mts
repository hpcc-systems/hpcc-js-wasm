import fs from "fs";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
import { Zstd, Base91 } from "../index-node";

const myYargs = yargs(hideBin(process.argv)) as yargs.Argv<{}>;
myYargs
    .usage("Usage: sfx-wasm [options] filePath")
    .demandCommand(0, 1)
    .example("sfx-wasm ./input.wasm", "Wrap file in a self extracting JavaScript file.")
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/hpcc-js-wasm")
    ;

const argv = await myYargs.argv;

try {
    const wasmPath = argv._[0] as string;
    let wasmContent;
    if (fs.existsSync(wasmPath)) {
        wasmContent = fs.readFileSync(wasmPath);
    }
    if (wasmContent) {
        const zstd = await Zstd.load();
        const compressed = zstd.compress(new Uint8Array(wasmContent))
        const base91 = await Base91.load();
        const str = base91.encode(compressed);
        console.log(`\
import { extract } from "./extract";
import wrapper from "../${wasmPath.replace(".wasm", ".js")}";

const blobStr = '${str}';

let g_module;
export function loadWasm() {
    if (!g_module) {
        g_module = wrapper({
            wasmBinary: extract(blobStr)
        });
    }
    return g_module;
}

        `);
    } else {
        throw new Error("'filePath' is required.")
    }
} catch (e: any) {
    console.error(`Error:  ${e?.message}\n`);
    myYargs.showHelp();
}
