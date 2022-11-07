import { parentPort } from "node:worker_threads";
import { Base91 } from "@hpcc-js/wasm/base91";

parentPort?.on("message", async function (data) {
    const base91 = await Base91.load();
    const base91Str = base91.encode(data);
    const data2 = base91.decode(base91Str);
    parentPort?.postMessage(data2);
    process.exit(0);
});

