import { expect } from "chai";
import { wasmFolder } from "../util";
import { graphviz, graphvizSync, GraphvizSync, graphvizVersion } from "../graphviz";
import { badDot, dot } from "./dot001";
import { ortho } from "./dot002";

describe("graphviz", function () {
    it("version", async function () {
        const v = await graphvizVersion();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
    });

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
    it("dot", async () => {
        await graphviz.dot(badDot, "svg").then(svg => {
            expect(true).to.be.false;
        }).catch(e => {
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.equal("syntax error in line 11 near ']'\n");
        });
        await graphviz.dot(dot, "svg").then(svg => {
            expect(svg).to.be.a("string");
            expect(svg).to.not.be.empty;
        });
        await graphviz.dot(badDot, "svg").then(svg => {
            expect(true).to.be.false;
        }).catch(e => {
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.equal("syntax error in line 11 near ']'\n");
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
        } catch (e: any) {
            success = false;
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.not.be.empty;
        }
        expect(success).to.be.false;
    });
    it("ortho", function () {
        let success;
        try {
            const svg = gvSync.dot(ortho, "svg");
            success = true;
        } catch (e: any) {
            success = false;
            expect(typeof e.message).to.equal("string");
            expect(e.message).to.not.be.empty;
        }
        expect(success).to.be.true;
    });
});

describe("options", function () {
    let gvSync: GraphvizSync;

    it("create", function () {
        return graphvizSync().then(gv => {
            gvSync = gv;
            expect(gvSync).to.exist;
        });
    });

    it("yInvert", function () {
        const plain1 = gvSync.dot(dot, "plain");
        const plain2 = gvSync.dot(dot, "plain", { yInvert: false });
        const plain3 = gvSync.dot(dot, "plain", { yInvert: true });
        const plain4 = gvSync.dot(dot, "plain", { yInvert: false });
        const plain5 = gvSync.dot(dot, "plain", { yInvert: true });
        expect(plain1).to.equal(plain2);
        expect(plain1).to.not.equal(plain3);
        expect(plain1).to.equal(plain4);
        expect(plain1).to.not.equal(plain5);
    });

    it("nop", function () {
        const plain1 = gvSync.dot(dot, "svg");
        const plain2 = gvSync.dot(dot, "svg", { nop: 0 });
        const plain3 = gvSync.dot(dot, "svg", { nop: 1 });
        const plain4 = gvSync.dot(dot, "svg", { nop: 2 });
        expect(plain1).to.equal(plain2);
        expect(plain1).to.equal(plain3);
        expect(plain1).to.equal(plain4);
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
