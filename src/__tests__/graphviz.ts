import { expect } from "chai";
import { wasmFolder } from "..";
import { graphviz, graphvizSync, GraphvizSync } from "../graphviz";

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
        return graphviz.circo(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("dot", function () {
        return graphviz.dot(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("blank-dot", function () {
        return graphviz.dot("", "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("fdp", function () {
        return graphviz.fdp(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("sfdp", function () {
        return graphviz.sfdp(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("neato", function () {
        return graphviz.neato(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("osage", function () {
        return graphviz.osage(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("patchwork", function () {
        return graphviz.patchwork(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
    it("twopi", function () {
        return graphviz.twopi(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        }).catch(e => {
            expect(true).to.be.false;
        });
    });
});

describe("graphvizSync", function () {
    let gvSync: GraphvizSync;
    it("create", function () {
        return graphvizSync().then(gv => {
            gvSync = gv;
            expect(gvSync).to.exist;
        });
    });
    it("circo", function () {
        const svg = gvSync.circo(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("dot", function () {
        const svg = gvSync.dot(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("dot-blank", function () {
        const svg = gvSync.dot("", "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.be.empty;
    });
    it("fdp", function () {
        const svg = gvSync.fdp(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("sfdp", function () {
        const svg = gvSync.sfdp(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
        const svg2 = gvSync.fdp(dot, "svg");
        expect(svg).to.not.equal(svg2);
    });
    it("neato", function () {
        const svg = gvSync.neato(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("osage", function () {
        const svg = gvSync.osage(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("patchwork", function () {
        const svg = gvSync.patchwork(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
    it("twopi", function () {
        const svg = gvSync.twopi(dot, "svg");
        expect(svg).to.be.a("string");
        expect(svg).to.not.be.empty;
    });
});

describe("bad dot", function () {
    it("dot", function () {
        return graphviz.dot(badDot, "svg").then(svg => {
            expect(true).to.be.false;
        }).catch(e => {
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.not.be.empty;
        });
    });

    let gvSync: GraphvizSync;
    it("create", function () {
        return graphvizSync().then(gv => {
            gvSync = gv;
            expect(gvSync).to.exist;
        });
    });
    it("dotSync", function () {
        let success;
        try {
            const svg = gvSync.dot(badDot, "svg");
            success = true;
        } catch (e) {
            success = false;
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.not.be.empty;
        }
        expect(success).to.be.false;
    });
});

describe("yInvert", function () {
    let gvSync: GraphvizSync;

    it("create", function () {
        return graphvizSync().then(gv => {
            gvSync = gv;
            expect(gvSync).to.exist;
        });
    });

    it("compare", function () {
        const plain1 = gvSync.dot(dot, "plain");
        const plain2 = gvSync.dot(dot, "plain", { yInvert: false });
        const plain3 = gvSync.dot(dot, "plain", { yInvert: true });
        expect(plain1).to.equal(plain2);
        expect(plain1).to.not.equal(plain3);
    });
});

describe("wasmFolder", function () {
    it("default", function () {
        expect((globalThis as any).__hpcc_wasmFolder).to.be.undefined;
        expect(wasmFolder()).to.be.undefined;
    });

    it("wasmFolder", function () {
        const mol = "42";
        expect((globalThis as any).__hpcc_wasmFolder).to.be.undefined;
        expect(wasmFolder(mol)).to.be.undefined;
        expect(wasmFolder()).to.equal(mol);
        expect((globalThis as any).__hpcc_wasmFolder).to.be.undefined;
        expect(wasmFolder(undefined)).to.equal(mol);
        expect(wasmFolder()).to.be.undefined;
        expect((globalThis as any).__hpcc_wasmFolder).to.be.undefined;
    });
});
