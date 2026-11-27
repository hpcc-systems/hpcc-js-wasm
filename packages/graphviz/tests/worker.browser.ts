import { Graphviz } from "@hpcc-js/wasm-graphviz";

self.onmessage = async function (e) {
    const graphviz = await Graphviz.load();
    if (e.data === "measure") {
        const result = JSON.parse(graphviz.dot('digraph { a [shape=box, width=0, height=0, margin=0, fontname="Arial", fontsize=18, label="Worker text"] }', "json"));
        Graphviz.unload();
        self.postMessage(Number(result.objects[0].width) * 72);
        return;
    }
    const v = graphviz.version();
    Graphviz.unload();
    self.postMessage(e.data + v);
};
