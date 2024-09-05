import { bothTpl, browserBoth, nodeBoth } from "@hpcc-js/esbuild-plugins";

//  config  ---
await Promise.all([
    bothTpl("src/base91.ts", "dist/base91", undefined, "@hpcc-js/wasm"),
    bothTpl("src/duckdb.ts", "dist/duckdb", undefined, "@hpcc-js/wasm"),
    bothTpl("src/graphviz.ts", "dist/graphviz", undefined, "@hpcc-js/wasm"),
    bothTpl("src/expat.ts", "dist/expat", undefined, "@hpcc-js/wasm"),
    bothTpl("src/zstd.ts", "dist/zstd", undefined, "@hpcc-js/wasm")
]);
await bothTpl("src/index.ts", "dist/index", undefined, "@hpcc-js/wasm", ["./base91.js", "./duckdb.js", "./expat.js", "./graphviz.js", "./zstd.js"]);

browserBoth("test/index-browser.ts", "dist-test/index.browser");
browserBoth("test/worker-browser.ts", "dist-test/worker.browser");
nodeBoth("test/index-node.ts", "dist-test/index.node");
nodeBoth("test/worker-node.ts", "dist-test/worker.node");

// nodeTpl("src/__bin__/dot-wasm.ts", "bin/dot-wasm", "esm", ["@hpcc-js/wasm/graphviz"]);
