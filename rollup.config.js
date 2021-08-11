import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import replace from "@rollup/plugin-replace";

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
                { find: "../build/graphviz/graphvizlib/graphvizlib", replacement: "../build/graphviz/graphvizlib/graphvizlib.node" },
                { find: "../build/expat/expatlib/expatlib", replacement: "../build/expat/expatlib/expatlib.node" }
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
    nodeTpl("lib-es6/index", pkg.main, pkg["module-node"]),
    nodeTpl("lib-es6/graphviz", "dist/graphviz.node.js", "dist/graphviz.node.es6"),
    nodeTpl("lib-es6/expat", "dist/expat.node.js", "dist/expat.node.es6"),
    browserTpl("lib-es6/__tests__/index", "dist/test.js", "dist/test.es6"),
    nodeTpl("lib-es6/__tests__/index", "dist/test.node.js", "dist/test.node.es6")
];