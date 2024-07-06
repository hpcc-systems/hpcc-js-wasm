import * as process from "process";
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import { umdWrapper } from "esbuild-plugin-umd-wrapper";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const myYargs = yargs(hideBin(process.argv));
myYargs
    .usage("Usage: esbuild [options]")
    .demandCommand(0, 0)
    .example("sfx-wasm --watch", "Bundle and watch for changes")
    .option("d", {
        alias: "debug",
        describe: "Debug build",
        boolean: true
    })
    .option("w", {
        alias: "watch",
        describe: "Watch for changes",
        boolean: true
    })
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/hpcc-js-wasm")
    ;
const argv = await myYargs.argv;

const excludeSourceMapPlugin = ({ filter }) => ({
    name: 'excludeSourceMapPlugin',
    setup(build) {
        build.onLoad({ filter }, (args) => {
            return {
                contents:
                    readFileSync(args.path, 'utf8') +
                    '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
                loader: 'default',
            };
        });
    },
});

function build(config) {
    argv.debug && console.log("Start:  ", config.entryPoints[0], config.outfile);
    return esbuild.build({
        ...config,
        sourcemap: "linked",
        plugins: [
            ...config.plugins ?? [],
            excludeSourceMapPlugin({ filter: /node_modules/ }),
        ]
    }).then(() => {
        argv.debug && console.log("Stop:   ", config.entryPoints[0], config.outfile);
    });
}

function watch(config) {
    return esbuild.context({
        ...config,
        sourcemap: "linked",
        plugins: [
            ...config.plugins ?? [],
            excludeSourceMapPlugin({ filter: /node_modules/ }),
            {
                name: "rebuild-notify",
                setup(build) {
                    build.onEnd(result => {
                        console.log(`Built ${config.outfile}`);
                    });
                },
            }
        ]
    }).then(ctx => {
        return ctx.watch();
    });
}

function browserTpl(input, umdOutput, esOutput, globalName = undefined, external = []) {
    const entryPoints = [input + ".js"];
    const promises = [];
    promises.push((argv.watch ? watch : build)({
        entryPoints,
        outfile: esOutput + ".js",
        platform: "browser",
        format: "esm",
        bundle: true,
        minify: !argv.debug,
        external
    }));
    if (globalName) {
        promises.push((argv.watch ? watch : build)({
            entryPoints,
            outfile: umdOutput + ".js",
            platform: "browser",
            format: "umd",
            globalName,
            bundle: true,
            minify: !argv.debug,
            external,
            plugins: [umdWrapper()]
        }));
    }
    return Promise.all(promises);
}

function nodeEsm(input, esOutput, external = [], extension = ".js") {
    const entryPoints = [input + ".js"];
    return (argv.watch ? watch : build)({
        entryPoints,
        outfile: esOutput + extension,
        platform: "node",
        format: "esm",
        bundle: true,
        minify: !argv.debug,
        external
    });
}

function nodeCjs(input, esOutput, external = []) {
    const entryPoints = [input + ".js"];
    return (argv.watch ? watch : build)({
        entryPoints,
        outfile: esOutput + ".cjs",
        platform: "node",
        format: "cjs",
        bundle: true,
        minify: !argv.debug,
        external
    });
}

function nodeTpl(input, esOutput, external = []) {
    return Promise.all([
        nodeEsm(input, esOutput, external),
        nodeCjs(input, esOutput, external)
    ]);
}

function bothTpl(input, umdOutput, esOutput, globalName = undefined, external = []) {
    return Promise.all([
        browserTpl(input, umdOutput, esOutput, globalName, external),
        nodeCjs(input, esOutput, external)
    ]);
}

await Promise.all([
    bothTpl("lib-esm/base91", "dist/base91.umd", "dist/base91", "hpccjs_wasm_base91"),
    bothTpl("lib-esm/duckdb", "dist/duckdb.umd", "dist/duckdb", "hpccjs_wasm_duckdb"),
    bothTpl("lib-esm/expat", "dist/expat.umd", "dist/expat", "hpccjs_wasm_expat"),
    bothTpl("lib-esm/graphviz", "dist/graphviz.umd", "dist/graphviz", "hpccjs_wasm_graphviz"),
    bothTpl("lib-esm/llama", "dist/llama.umd", "dist/llama", "hpccjs_wasm_llama"),
    bothTpl("lib-esm/zstd", "dist/zstd.umd", "dist/zstd", "hpccjs_wasm_zstd")
]);
await bothTpl("lib-esm/index", "dist/index.umd", "dist/index", "hpccjs_wasm", ["./base91.js", "./duckdb.js", "./expat.js", "./graphviz.js", "./llama.js", "./zstd.js"]);

browserTpl("lib-esm/__tests__/index-browser", "dist-test/index.umd", "dist-test/index", "hpccjs_wasm_test");
browserTpl("lib-esm/__tests__/worker-browser", "dist-test/worker.umd", "dist-test/worker", "hpccjs_wasm_test_worker");
nodeTpl("lib-esm/__tests__/index-node", "dist-test/index.node");
nodeTpl("lib-esm/__tests__/worker-node", "dist-test/worker.node");

nodeEsm("lib-esm/__bin__/dot-wasm", "bin/dot-wasm", ["@hpcc-js/wasm/graphviz"], ".js");
