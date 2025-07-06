import { neutralTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";
import { replaceFunction } from "../../utils/esbuild-plugins.js";

await neutralTpl("src/index.ts", "dist/index", {
    plugins: [
        replaceFunction({
            'findWasmBinary': 'const findWasmBinary=()=>"";'
        }),
        sfxWasm()
    ]
});
