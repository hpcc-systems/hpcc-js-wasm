import fs from "fs";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
import { Zstd, Base91, extract } from "../index-node";

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
const blobStr = '${str}';
export const wasmBinary = extract(blobStr);
        `);
        const test = extract(str);
        if (test.length !== wasmContent.length) {
            throw new Error("Oh oh");
        }
    } else {
        throw new Error("'filePath' is required.")
    }
} catch (e: any) {
    console.error(`Error:  ${e?.message}\n`);
    myYargs.showHelp();
}
