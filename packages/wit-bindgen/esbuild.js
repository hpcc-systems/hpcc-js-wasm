import { neutralTpl } from "@hpcc-js/esbuild-plugins";

//  config  ---
await neutralTpl("src/index.ts", "dist/index", {
    external: ["@bytecodealliance/jco", "node:fs/promises", "node:os", "node:path"]
});
