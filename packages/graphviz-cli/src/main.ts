import fs from "fs";
import { Graphviz, Engine, Format, Options } from "@hpcc-js/wasm-graphviz";
import { HELP_TEXT, parseArgs } from "./cliArgs.ts";

export async function main() {

    try {
        const parsed = parseArgs(process.argv.slice(2));

        if (parsed.help) {
            console.log(HELP_TEXT);
            return;
        }

        if (parsed.positional.length > 1) {
            throw new Error("Only one 'fileOrDot' argument is allowed.");
        }

        let dot: string | undefined;
        const fileOrDot = parsed.positional[0];
        if (fileOrDot) {
            if (fs.existsSync(fileOrDot)) {
                dot = fs.readFileSync(fileOrDot, "utf8");
            } else {
                dot = fileOrDot;
            }
        }

        const graphviz = await Graphviz.load();

        if (parsed.version) {
            console.log(`GraphViz version:  ${graphviz.version()}`);
            return;
        }

        if (dot) {

            const layout = (parsed.layout ?? "dot").trim();
            const format = (parsed.format ?? "svg").trim();

            if (parsed.neatoNoOp && layout !== "neato") {
                throw new Error("-n option is only supported with -K neato");
            }

            const ext: Options = {
            };
            if (parsed.neatoNoOp) {
                ext.nop = parseInt(parsed.neatoNoOp, 10);
            }
            if (parsed.invertY) {
                ext.yInvert = true;
            }

            const response = graphviz.layout(dot, format as Format, layout as Engine, ext);
            console.log(response);
        } else {
            throw new Error("'fileOrDot' is required.");
        }
    } catch (e: any) {
        console.error(`Error:  ${e?.message}\n`);
        console.error(HELP_TEXT);
    }
}
