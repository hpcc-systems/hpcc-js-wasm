import { browserTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";
import { replaceFunction, replaceString } from "../../utils/esbuild-plugins.js";

//  config  ---
await browserTpl("src/index.ts", "dist/index", {
    plugins: [
        replaceFunction({
            'findWasmBinary': 'const findWasmBinary=()=>"";'
        }),
        replaceString({
            "import.meta.url": "''",
        }),
        sfxWasm()
    ]
});
