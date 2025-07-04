import { bothTpl } from "@hpcc-js/esbuild-plugins";

//  config  ---
await Promise.all([
    bothTpl("src/base91.ts", "dist/base91", { libraryName: "@hpcc-js/wasm/base91" }),
    bothTpl("src/duckdb.ts", "dist/duckdb", { libraryName: "@hpcc-js/wasm/duckdb" }),
    bothTpl("src/graphviz.ts", "dist/graphviz", { libraryName: "@hpcc-js/wasm/graphviz" }),
    bothTpl("src/expat.ts", "dist/expat", { libraryName: "@hpcc-js/wasm/expat" }),
    bothTpl("src/zstd.ts", "dist/zstd", { libraryName: "@hpcc-js/wasm/zstd" })
]);
await bothTpl("src/index.ts", "dist/index", { libraryName: "@hpcc-js/wasm", external: ["./base91.js", "./duckdb.js", "./expat.js", "./graphviz.js", "./zstd.js"] });
