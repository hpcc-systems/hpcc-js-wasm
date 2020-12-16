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

const badDot = `
digraph G {
    node [shape=rect];

    subgraph cluster_0 {
        style=filled;
        color=lightgrey;
        node [style=filled,color=white];
        a0 -> a1 -> a2 -> a3;
        label = "process #1";
    ]

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
    it("circo", function () {
        return hpccWasm.graphviz.circo(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("dot", function () {
        return hpccWasm.graphviz.dot(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("blank-dot", function () {
        return hpccWasm.graphviz.dot("", "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("fdp", function () {
        return hpccWasm.graphviz.fdp(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("neato", function () {
        return hpccWasm.graphviz.neato(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("osage", function () {
        return hpccWasm.graphviz.osage(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("patchwork", function () {
        return hpccWasm.graphviz.patchwork(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("twopi", function () {
        return hpccWasm.graphviz.twopi(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
});

describe("graphvizSync", function () {
    let graphviz;
    it("create", function () {
        return hpccWasm.graphvizSync().then(gv => {
            graphviz = gv;
            expect(graphviz).to.exist;
        });
    });
    it("circo", function () {
        const svg = graphviz.circo(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("dot", function () {
        const svg = graphviz.dot(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("dot-blank", function () {
        const svg = graphviz.dot("", "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.be.empty;
    });
    it("fdp", function () {
        const svg = graphviz.fdp(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("neato", function () {
        const svg = graphviz.neato(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("osage", function () {
        const svg = graphviz.osage(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("patchwork", function () {
        const svg = graphviz.patchwork(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("twopi", function () {
        const svg = graphviz.twopi(dot, "svg")
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
});

describe("bad dot", function () {
    it("dot", function () {
        return hpccWasm.graphviz.dot(badDot, "svg").then(svg => {
            expect(true).to.be.false;
        }).catch(e => {
            expect(e.message).to.be.a.string;
            expect(e.message).to.not.be.empty;
        });
    });

    let graphviz;
    it("create", function () {
        return hpccWasm.graphvizSync().then(gv => {
            graphviz = gv;
            expect(graphviz).to.exist;
        });
    })
    it("dotSync", function () {
        let success;
        try {
            const svg = graphviz.dot(badDot, "svg");
            success = true;
        } catch (e) {
            success = false;
            expect(e.message).to.be.a.string;
            expect(e.message).to.not.be.empty;
        }
        expect(success).to.be.false;
    });
});

describe("yInvert", function () {
    let graphviz;
    let plain1;
    let plain2;
    it("create", function () {
        return hpccWasm.graphvizSync().then(gv => {
            graphviz = gv;
            expect(graphviz).to.exist;
        });
    });
    it("compare", function () {
        const plain1 = graphviz.dot(dot, "plain");
        const plain2 = graphviz.dot(dot, "plain", { yInvert: false });
        const plain3 = graphviz.dot(dot, "plain", { yInvert: true });
        expect(plain1).to.equal(plain2);
        expect(plain1).to.not.equal(plain3);
    });
});
