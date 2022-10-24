#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const { exit } = require("process");
const gvMod = require("../dist/index.node.js");

const yargs = require("yargs/yargs")(process.argv.slice(2))
    .usage("Usage: dot-wasm [options] fileOrDot")
    .demandCommand(0, 1)
    .example("dot-wasm -K neato -T xdot ./input.dot", "Execute NEATO layout and outputs XDOT format.")
    .alias("K", "layout")
    .nargs("K", 1)
    .describe("K", "Set layout engine (circo | dot | fdp | sfdp | neato | osage | patchwork | twopi). By default, dot is used.")
    .alias("T", "format")
    .nargs("T", 1)
    .describe("T", "Set output language to one of the supported formats (svg, dot, json, dot_json, xdot_json, plain, plain-ext). By default, svg is produced.")
    .alias("n", "neato-no-op")
    .nargs("n", 1)
    .describe("n", "Sets no-op flag in neato.\n\"-n 1\" assumes neato nodes have already been positioned and all nodes have a pos attribute giving the positions. It then performs an optional adjustment to remove node-node overlap, depending on the value of the overlap attribute, computes the edge layouts, depending on the value of the splines attribute, and emits the graph in the appropriate format.\n\"-n 2\" Use node positions as specified, with no adjustment to remove node-node overlaps, and use any edge layouts already specified by the pos attribute. neato computes an edge layout for any edge that does not have a pos attribute. As usual, edge layout is guided by the splines attribute.")
    .alias("y", "invert-y")
    .nargs("y", 0)
    .describe("y", "By default, the coordinate system used in generic output formats, such as attributed dot, extended dot, plain and plain-ext, is the standard cartesian system with the origin in the lower left corner, and with increasing y coordinates as points move from bottom to top. If the -y flag is used, the coordinate system is inverted, so that increasing values of y correspond to movement from top to bottom.")
    .nargs("v", 0)
    .describe("v", "Echo GraphViz library version")
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/hpcc-js-wasm")
    ;

const argv = yargs.argv;

try {
    let dot;
    if (fs.existsSync(argv._[0])) {
        dot = fs.readFileSync(argv._[0], "utf8");
    } else {
        dot = argv._[0];
    }

    if (argv.v) {
        gvMod.graphvizVersion().then(version => {
            console.log(`GraphViz version:  ${version}`);
        }).catch(e => {
            console.error(e.message);
            exit(1);
        })
    } else {

        if (argv.n && argv.layout.trim() !== "neato") {
            throw new Error("-n option is only supported with -T neato");
        }

        const ext = {
        };
        if (argv.n) {
            ext.nop = parseInt(argv.n);
        }
        if (argv.y) {
            ext.yInvert = true;
        }

        gvMod.graphviz.layout(dot, argv.format?.trim() ?? "svg", argv.layout?.trim() ?? "dot", ext).then(response => {
            console.log(response);
        }).catch(e => {
            console.error(e.message);
            exit(1);
        });
    }
} catch (e) {
    console.error(`Error:  ${e.message}\n`);
    yargs.showHelp();
}
