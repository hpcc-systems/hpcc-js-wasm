import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import replace from "@rollup/plugin-replace";

const initRuntime = "initRuntime(asm);"
const initRuntimePatched = `\
initRuntime(asm) ;\
var _malloc=_malloc,_free=_free;\
Module['_malloc']=_malloc;\
Module['_free']=_free;\
`;

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        alias({}),
        replace({
            preventAssignment: true,
            delimiters: ['', ''],
            values: {
                [initRuntime]: initRuntimePatched
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
        alias({
            entries: [
                { find: "../build/cpp/graphviz/graphvizlib/graphvizlib", replacement: "../build/cpp/graphviz/graphvizlib/graphvizlib.node" },
                { find: "../build/cpp/expat/expatlib/expatlib", replacement: "../build/cpp/expat/expatlib/expatlib.node" }
            ]
        }),
        replace({
            preventAssignment: true,

            ".node.wasm": ".wasm"
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
    browserTpl("lib-es6/graphviz", "dist/graphviz.js", "dist/graphviz.es6"),
    browserTpl("lib-es6/expat", "dist/expat.js", "dist/expat.es6"),

    browserTpl("lib-es6/__tests__/index", "dist/test.js", "dist/test.es6"),
];
