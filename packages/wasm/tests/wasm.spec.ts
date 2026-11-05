import { describe, it, expect } from "vitest";
import { Base91, DuckDB, Expat, Graphviz, Zstd } from "@hpcc-js/wasm";

describe("wasm", function () {
    it("Base91", async function () {
        const base91 = await Base91.load();
        const v = base91.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });

    it("Expat", async function () {
        const expat = await Expat.load();
        const v = expat.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });

    it("DuckDB", async function () {
        const duckdb = await DuckDB.load();
        const v = duckdb.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });

    it("Graphviz", async function () {
        const graphviz = await Graphviz.load();
        const v = graphviz.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });

    it("Zstd", async function () {
        const zstd = await Zstd.load();
        const v = zstd.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });
});
