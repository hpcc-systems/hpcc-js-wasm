import { neutralTpl } from "@hpcc-js/esbuild-plugins";
import { sfxWasm } from "@hpcc-js/esbuild-plugins/sfx-wrapper";

//  config  ---
await neutralTpl("src/index.ts", "dist/index", { plugins: [sfxWasm()] });
