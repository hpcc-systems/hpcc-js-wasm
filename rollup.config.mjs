import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { createRequire } from "module";
import replace from "@rollup/plugin-replace";
//import { wasm } from '@rollup/plugin-wasm';

const require = createRequire(import.meta.url);
const pkg = require("./package.json");
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
        sourcemaps()
    ]
});

const nodeTpl = (input, cjsOutput, esOutput) => ({
    input: input,
    // external: ["fs", "crypto", "path"],
    output: [{
        file: cjsOutput + ".js",
        format: "cjs",
        sourcemap: true,
        name: pkg.name,
        manualChunks: () => '__hack_for_single_file_.js'
    }, {
        file: esOutput + ".mjs",
        format: "es",
        sourcemap: true,
        manualChunks: () => '__hack_for_single_file_.js',

    }],
    plugins: [
        replace({
            preventAssignment: true,
            include: ["lib-es6/__tests__/*.js"],
            delimiters: ['', ''],
            values: {
                "\"../index\"": "\"../index-node\""
            }
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps()
    ]
});

const binTpl = (input, esOutput) => ({
    input,
    external: id => {
        if (id.indexOf("./") !== 0 && id.indexOf("__bin__") < 0) {
            console.log(id);
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
        replace({
            preventAssignment: true,
            include: ["lib-es6/__bin__/*.mjs"],
            delimiters: ["", ""],
            values: {
                "../index-node": "../dist/index.node.es6.mjs"
            }
        }),
        sourcemaps(),
    ]
});

export default [
    browserTpl("lib-es6/index", "dist/index", "dist/index.es6"),
    nodeTpl("lib-es6/index-node", "dist/index.node", "dist/index.node.es6"),

    browserTpl("lib-es6/graphviz", "dist/graphviz", "dist/graphviz.es6"),
    browserTpl("lib-es6/expat", "dist/expat", "dist/expat.es6"),
    browserTpl("lib-es6/zstd", "dist/zstd", "dist/zstd.es6"),

    browserTpl("lib-es6/__tests__/index", "dist-test/index", "dist-test/index.es6"),
    nodeTpl("lib-es6/__tests__/index-node", "dist-test/index.node", "dist-test/index.node.es6"),
    browserTpl("lib-es6/__tests__/worker-browser", "dist-test/worker", "dist-test/worker.es6"),
    nodeTpl("lib-es6/__tests__/worker-node", "dist-test/worker.node", "dist-test/worker.node.es6"),

    binTpl("lib-es6/__bin__/dot-wasm", "bin/dot-wasm.mjs"),
    binTpl("lib-es6/__bin__/sfx-wasm", "bin/sfx-wasm.mjs"),
    // {
    //     input: 'lib-es6/test-wasm.js',
    //     output: [{
    //         dir: 'output-node',
    //         format: 'es'
    //     }, {
    //         dir: 'output-node-cjs',
    //         format: 'cjs'
    //     }],
    //     plugins: [wasm({
    //         targetEnv: "node"
    //     })]
    // },
    // {
    //     input: 'lib-es6/test-wasm.js',
    //     output: [{
    //         dir: 'output-browser',
    //         format: 'es'
    //     }, {
    //         dir: 'output-browser-umd',
    //         format: 'umd'
    //     }],
    //     plugins: [wasm({
    //         targetEnv: "browser"
    //     })]
    // }
];
