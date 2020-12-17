import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import replace from '@rollup/plugin-replace';

const pkg = require("./package.json");

export default [{
    input: "lib-es6/index",
    output: [{
        file: pkg.browser,
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: pkg.module + ".js",
        format: "es",
        sourcemap: true
    }],
    plugins: [
        alias({
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
        }),
        sourcemaps()
    ]
}, {
    input: "lib-es6/index",
    external: ["fs", "crypto", "path"],
    output: [{
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        name: pkg.name
    }, {
        file: pkg["module-node"] + ".js",
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
            ".node.wasm": ".wasm"
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
        }),
        sourcemaps()
    ]
}, {
    input: "lib-es6/__tests__/index",
    output: {
        file: "dist/test.js",
        format: "umd",
        sourcemap: true,
        name: pkg.name
    },
    plugins: [
        alias({
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
        }),
        sourcemaps()
    ]
}, {
    input: "lib-es6/__tests__/index",
    external: ["fs", "crypto", "path"],
    output: {
        file: "dist/test.node.js",
        format: "commonjs",
        sourcemap: true,
        name: pkg.name
    },
    plugins: [
        alias({
            entries: [
                { find: "../build/graphviz/graphvizlib/graphvizlib", replacement: "../build/graphviz/graphvizlib/graphvizlib.node" },
                { find: "../build/expat/expatlib/expatlib", replacement: "../build/expat/expatlib/expatlib.node" }
            ]
        }),
        replace({
            ".node.wasm": ".wasm"
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
        }),
        sourcemaps()
    ]
}];
