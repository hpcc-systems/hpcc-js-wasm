import { bothTpl, browserTpl, nodeTpl } from "@hpcc-js/esbuild-plugins";
import { copyFile } from "fs/promises";
import * as path from "path";

//  config  ---
await Promise.all([
    bothTpl("src/base91.ts", "dist/base91", undefined, "@hpcc-js/wasm"),
    bothTpl("src/duckdb.ts", "dist/duckdb", undefined, "@hpcc-js/wasm"),
    bothTpl("src/graphviz.ts", "dist/graphviz", undefined, "@hpcc-js/wasm"),
    bothTpl("src/expat.ts", "dist/expat", undefined, "@hpcc-js/wasm"),
    bothTpl("src/zstd.ts", "dist/zstd", undefined, "@hpcc-js/wasm")
]);
await bothTpl("src/index.ts", "dist/index", undefined, "@hpcc-js/wasm", ["./base91.js", "./duckdb.js", "./expat.js", "./graphviz.js", "./zstd.js"]);

await Promise.all([
    browserTpl("spec/index-browser.ts", "dist-test/index.browser"),
    nodeTpl("spec/index-node.ts", "dist-test/index.node"),
]);

await Promise.all([
    copyFile(path.resolve("../graphviz/dist-test/worker.browser.js"), path.resolve("./dist-test/worker.browser.js")),
    copyFile(path.resolve("../graphviz/dist-test/worker.node.js"), path.resolve("./dist-test/worker.node.js")),
]);
