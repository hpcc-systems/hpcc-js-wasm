import { Graphviz } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/sfx-graphviz.esm.js";

onmessage = async e => {
    const graphviz = await Graphviz.load();
    const svg = graphviz.layout(e.data, "svg", "dot");
    postMessage(svg);
}
