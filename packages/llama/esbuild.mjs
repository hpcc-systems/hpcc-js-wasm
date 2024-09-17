import { nodeTpl, browserTpl, neutralTpl } from "@hpcc-js/esbuild-plugins";

//  config  ---
await neutralTpl("src/index.ts", "dist/index");

await Promise.all([
    browserTpl("spec/index-browser.ts", "dist-test/index.browser"),
    nodeTpl("spec/index-node.ts", "dist-test/index.node"),
]);
