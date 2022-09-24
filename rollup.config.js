import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import replace from "@rollup/plugin-replace";

const pkg = require("./package.json");
const browserTpl = (input, umdOutput, esOutput) => ({
    input: input,
    output: [{
        file: umdOutput,
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true
    }],
    plugins: [
        replace({
            preventAssignment: true,
            include: ["build/**/*.js", "lib-es6/**/*.js"],
            delimiters: ['', ''],
            values: {
                "__filename": "undefined"
            }
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps()
    ]
});

const nodeTpl = (input, cjsOutput, esOutput) => ({
    input: input,
    external: ["fs", "crypto", "path"],
    output: [{
        file: cjsOutput,
        format: "cjs",
        sourcemap: true,
        name: pkg.name
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true
    }],
    plugins: [
        replace({
            preventAssignment: true,
            include: ["build/**/*.js", "lib-es6/**/*.js"],
            delimiters: ['', ''],
            values: {
                "graphvizlib/graphvizlib": "graphvizlib/graphvizlib_node",
                "expatlib/expatlib": "expatlib/expatlib_node",
                "await browserFetch(wasmUrl)": "await nodeFetch(wasmUrl)"
            }
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        sourcemaps()
    ]
});

export default [
    browserTpl("lib-es6/index", pkg.browser, pkg.module),
    nodeTpl("lib-es6/index", pkg.browser.split("index").join("index.node"), pkg.module.split("index").join("index.node")),

    browserTpl("lib-es6/graphviz", "dist/graphviz.js", "dist/graphviz.es6"),
    browserTpl("lib-es6/expat", "dist/expat.js", "dist/expat.es6"),

    browserTpl("lib-es6/__tests__/index", "dist/test.js", "dist/test.es6"),
    nodeTpl("lib-es6/__tests__/index", "dist/test.node.js", "dist/test.node.es6"),
];
