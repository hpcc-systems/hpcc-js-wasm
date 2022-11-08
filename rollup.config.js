import { createRequire } from "module";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import terser from '@rollup/plugin-terser';

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

let debug = false;

const browserTplIndex = (input, umdOutput, esOutput) => ({
    input: input,
    external: id => {
        console.log(id);
        return id.indexOf("./") >= 0;
    },
    output: [{
        file: umdOutput + ".js",
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true
    }],
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps(),
        debug ? undefined : terser({})
    ]
});

const browserTpl = (input, umdOutput, esOutput) => ({
    input: input,
    output: [{
        file: umdOutput + ".js",
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true
    }],
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps(),
        debug ? undefined : terser({})
    ]
});

const nodeTpl = (input, cjsOutput, esOutput) => ({
    input: input,
    output: [{
        file: cjsOutput + ".cjs",
        format: "cjs",
        sourcemap: true,
        name: pkg.name,
        manualChunks: () => '__hack_for_single_file_.js'
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true,
        manualChunks: () => '__hack_for_single_file_.js',

    }],
    plugins: [
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps(),
        debug ? undefined : terser({})
    ]
});

const binTpl = (input, esOutput) => ({
    input,
    external: id => {
        if (id.indexOf("./") !== 0 && id.indexOf("__bin__") < 0) {
            return true;
        }
        return false;
    },
    output: [{
        file: esOutput,
        format: "es",
        sourcemap: true,
        name: pkg.name
    }],
    plugins: [
        sourcemaps()
    ]
});

export default args => {
    debug = args.configDebug ?? false;
    return [
        browserTplIndex("lib-esm/index", "dist/index.umd", "dist/index"),

        browserTpl("lib-esm/base91", "dist/base91.umd", "dist/base91"),
        browserTpl("lib-esm/graphviz", "dist/graphviz.umd", "dist/graphviz"),
        browserTpl("lib-esm/expat", "dist/expat.umd", "dist/expat"),
        browserTpl("lib-esm/zstd", "dist/zstd.umd", "dist/zstd"),

        browserTpl("lib-esm/__tests__/index-browser", "dist-test/index.umd", "dist-test/index"),
        nodeTpl("lib-esm/__tests__/index-node", "dist-test/index.node", "dist-test/index.node"),
        browserTpl("lib-esm/__tests__/worker-browser", "dist-test/worker.umd", "dist-test/worker"),
        nodeTpl("lib-esm/__tests__/worker-node", "dist-test/worker.node", "dist-test/worker.node"),

        binTpl("lib-esm/__bin__/dot-wasm", "bin/dot-wasm.js"),
    ];
};
