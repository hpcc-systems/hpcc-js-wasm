#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const gvMod = require("../dist/graphviz.node.js");

const yargs = require("yargs/yargs")(process.argv.slice(2))
    .usage("Usage: dot-wasm [options] fileOrDot")
    .demandCommand(1, 1)
    .example("dot-wasm -K neato -T xdot ./input.dot", "Execute NEATO layout and outputs XDOT format.")
    .alias("K", "layout")
    .nargs("K", 1)
    .describe("K", "Set layout engine (circo | dot | fdp | sfdp | neato | osage | patchwork | twopi). By default, dot is used.")
    .alias("T", "format")
    .nargs("T", 1)
    .describe("T", "Set output language to one of the supported formats (svg, dot, json, dot_json, xdot_json, plain, plain-ext). By default, svg is produced.")
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
    gvMod.graphviz.layout(dot, argv.format ?? "svg", argv.layout ?? "dot").then(response => {
        console.log(response);
    }).catch(e => {
        console.error(e.message);
    });
} catch (e) {
    console.error(`Error:  ${e.message}\n`);
    yargs.showHelp();
}
