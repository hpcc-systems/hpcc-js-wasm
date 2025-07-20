import { bothTpl } from "@hpcc-js/esbuild-plugins";
import { replaceFunction, replaceString } from "../../utils/esbuild-plugins.js";

const replaceConfig = {
    plugins: [
        replaceFunction({
            'findWasmBinary': 'const findWasmBinary=()=>"";'
        }),
        replaceString({
            "import.meta.url": "''",
        }),
    ]
};

//  config  ---
await Promise.all([
    bothTpl("src/base91.ts", "dist/base91", { libraryName: "@hpcc-js/wasm/base91", ...replaceConfig }),
    bothTpl("src/duckdb.ts", "dist/duckdb", { libraryName: "@hpcc-js/wasm/duckdb", ...replaceConfig }),
    bothTpl("src/graphviz.ts", "dist/graphviz", { libraryName: "@hpcc-js/wasm/graphviz", ...replaceConfig }),
    bothTpl("src/expat.ts", "dist/expat", { libraryName: "@hpcc-js/wasm/expat", ...replaceConfig }),
    bothTpl("src/zstd.ts", "dist/zstd", { libraryName: "@hpcc-js/wasm/zstd", ...replaceConfig })
]);
await bothTpl("src/index.ts", "dist/index", { libraryName: "@hpcc-js/wasm", external: ["./base91.js", "./duckdb.js", "./expat.js", "./graphviz.js", "./zstd.js"], ...replaceConfig });
