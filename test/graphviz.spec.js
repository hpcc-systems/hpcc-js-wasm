const hpccWasm = window["@hpcc-js/wasm"];
hpccWasm.wasmFolder("base/dist");

const dot = `
digraph G {
    node [shape=rect];

    subgraph cluster_0 {
        style=filled;
        color=lightgrey;
        node [style=filled,color=white];
        a0 -> a1 -> a2 -> a3;
        label = "process #1";
    }

    subgraph cluster_1 {
        node [style=filled];
        b0 -> b1 -> b2 -> b3;
        label = "process #2";
        color=blue
    }

    start -> a0;
    start -> b0;
    a1 -> b3;
    b2 -> a3;
    a3 -> a0;
    a3 -> end;
    b3 -> end;

    start [shape=Mdiamond];
    end [shape=Msquare];
}
`;

describe("graphviz", function () {
    const placeholder = document.getElementById("placeholder");
    it("circo", function () {
        hpccWasm.graphviz.circo(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("dot", function () {
        return hpccWasm.graphviz.dot(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("fdp", function () {
        return hpccWasm.graphviz.fdp(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("neato", function () {
        return hpccWasm.graphviz.neato(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("osage", function () {
        return hpccWasm.graphviz.osage(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("patchwork", function () {
        return hpccWasm.graphviz.patchwork(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
    it("twopi", function () {
        return hpccWasm.graphviz.twopi(dot, "svg").then(svg => {
            expect(svg).to.exist;
            expect(svg).to.not.be.empty;
        });
    });
});
