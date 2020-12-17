import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

const pkg = require("./package.json");

export default [{
    input: "lib-es6/index",
    output: [{
        file: pkg.main,
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: pkg.module + ".js",
        format: "es",
        sourcemap: true,
        name: pkg.name
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
    input: "lib-es6/__tests__/index",
    output: [{
        file: "dist/test.js",
        format: "umd",
        sourcemap: true,
        name: pkg.name
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
}];
