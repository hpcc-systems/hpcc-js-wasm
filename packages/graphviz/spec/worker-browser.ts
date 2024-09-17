import { Graphviz } from "@hpcc-js/wasm-graphviz";

onmessage = async function (e) {
    const graphviz = await Graphviz.load();
    const v = graphviz.version();
    Graphviz.unload();
    postMessage(e.data + v);
};
