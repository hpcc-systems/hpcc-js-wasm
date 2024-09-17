import { parentPort } from "node:worker_threads";
import { Graphviz } from "@hpcc-js/wasm-graphviz";

parentPort?.on("message", async function (data) {
    const graphviz = await Graphviz.load();
    const v = graphviz.version();
    Graphviz.unload();
    parentPort?.postMessage(data + v);
    process.exit(0);
});

