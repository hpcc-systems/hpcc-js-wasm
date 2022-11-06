import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { createRequire } from "module";

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

export default [
    browserTpl("lib-es6/sfx-graphviz", "dist/sfx-graphviz", "dist/sfx-graphviz.esm"),
];
