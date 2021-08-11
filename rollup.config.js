import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");
const globals = {
    'fs': 'fs',
    'crypto': 'crypto',
    'path': 'path'
};
const bundleTpl = (input, umdOutput, esOutput) => ({
    input: input,
    external: ["fs", "crypto", "path"],
    output: [{
        file: umdOutput,
        format: "umd",
        sourcemap: true,
        name: pkg.name,
        globals
    }, {
        file: esOutput + ".js",
        format: "es",
        sourcemap: true,
        globals
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
export default [
    bundleTpl("lib-es6/index", pkg.browser, pkg.module),
    bundleTpl("lib-es6/__tests__/index", "dist/test.js", "dist/test.es6")
];