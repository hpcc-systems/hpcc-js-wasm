import { Graphviz } from "https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/graphviz.js";
// import { Graphviz } from "./dist/index.js";

onmessage = async e => {
    const graphviz = await Graphviz.load();
    const svg = graphviz.layout(e.data, "svg", "dot");
    postMessage(svg);
}
