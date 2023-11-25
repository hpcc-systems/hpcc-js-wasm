import fs from "fs";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Graphviz, Engine, Format, Options } from "@hpcc-js/wasm/graphviz";

const myYargs = yargs.default(hideBin(process.argv)) as yargs.Argv<{ vx: boolean, layout: Engine, format: Format, n: string }>;
myYargs
    .usage("Usage: dot-wasm [options] fileOrDot")
    .demandCommand(0, 1)
    .example("dot-wasm -K neato -T xdot ./input.dot", "Execute NEATO layout and outputs XDOT format.")
    .alias("K", "layout")
    .nargs("K", 1)
    .describe("K", "Set layout engine (circo | dot | fdp | sfdp | neato | osage | patchwork | twopi | nop | nop2). By default, dot is used.")
    .alias("T", "format")
    .nargs("T", 1)
    .describe("T", "Set output language to one of the supported formats (svg | dot | json | dot_json | xdot_json | plain | plain-ext). By default, svg is produced.")
    .alias("n", "neato-no-op")
    .nargs("n", 1)
    .describe("n", "Sets no-op flag in neato.  \"-n 1\" assumes neato nodes have already been positioned and all nodes have a pos attribute giving the positions. It then performs an optional adjustment to remove node-node overlap, depending on the value of the overlap attribute, computes the edge layouts, depending on the value of the splines attribute, and emits the graph in the appropriate format.\n\"-n 2\" Use node positions as specified, with no adjustment to remove node-node overlaps, and use any edge layouts already specified by the pos attribute. neato computes an edge layout for any edge that does not have a pos attribute. As usual, edge layout is guided by the splines attribute.")
    .alias("y", "invert-y")
    .nargs("y", 0)
    .describe("y", "By default, the coordinate system used in generic output formats, such as attributed dot, extended dot, plain and plain-ext, is the standard cartesian system with the origin in the lower left corner, and with increasing y coordinates as points move from bottom to top. If the -y flag is used, the coordinate system is inverted, so that increasing values of y correspond to movement from top to bottom.")
    .nargs("v", 0)
    .describe("v", "Echo GraphViz library version")
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/hpcc-js-wasm")
    ;

const argv = await myYargs.argv;

try {
    let dot;
    if (fs.existsSync(argv._[0] as string)) {
        dot = fs.readFileSync(argv._[0], "utf8");
    } else {
        dot = argv._[0] as string;
    }
    const graphviz = await Graphviz.load();

    if (argv.v) {
        console.log(`GraphViz version:  ${graphviz.version()}`);
    } else if (dot) {

        if (argv.n && argv.layout.trim() !== "neato") {
            throw new Error("-n option is only supported with -T neato");
        }

        const ext: Options = {
        };
        if (argv.n) {
            ext.nop = parseInt(argv.n);
        }
        if (argv.y) {
            ext.yInvert = true;
        }

        const response = graphviz.layout(dot, (argv.format?.trim() ?? "svg") as Format, (argv.layout?.trim() ?? "dot") as Engine, ext);
        console.log(response);
    } else {
        throw new Error("'fileOrDot' is required.");
    }
} catch (e: any) {
    console.error(`Error:  ${e?.message}\n`);
    myYargs.showHelp();
}
