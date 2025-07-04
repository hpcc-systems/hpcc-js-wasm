import { browserTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";

//  config  ---
await browserTpl("src/index.ts", "dist/index", { plugins: [sfxWasm()] });
