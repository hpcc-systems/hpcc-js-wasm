import { expect } from "chai";
import { DuckDB } from "@hpcc-js/wasm";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe("wasm", function () {
    it("DuckDB", async function () {
        const duckdb = await DuckDB.load();
        const v = duckdb.version();
        expect(v).to.be.a.string;
        expect(v.length).to.be.gt(0);
    });
});
