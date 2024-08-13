import { expect } from "chai";
import { DuckDB } from "@hpcc-js/wasm-duckdb";

describe("duckdb", function () {
    this.timeout(5000);
    it("version", async function () {
        const duckdb = await DuckDB.load();
        const v = duckdb.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("v0.9.2");
        console.log("duckdb version: " + v);
    });

    it("simple", async function () {
        const duckdb = await DuckDB.load();
        const db = duckdb.db;
        const conn = await db.connect();
        const stmt = await conn.prepare("SELECT v + ? FROM generate_series(0, 10000) AS t(v);");
        await stmt.query(234);
        for await (const batch of await stmt.send(234)) {
            expect(batch).to.exist;
        }
        await stmt.close();
        await conn.close();
    });

    it("json", async function () {
        const duckdb = await DuckDB.load();
        const c = await duckdb.db.connect();

        const data = [
            { "col1": 1, "col2": "foo" },
            { "col1": 2, "col2": "bar" },
        ];
        await duckdb.db.registerFileText("rows.json", JSON.stringify(data));
        await c.insertJSONFromPath("rows.json", { name: "rows" });

        const arrowResult = await c.query("SELECT * FROM read_json_auto('rows.json')");
        const result = arrowResult.toArray().map((row: any) => row.toJSON());
        expect(result.length).to.equal(data.length);
        for (let i = 0; i < result.length; i++) {
            expect(result[i].col2).to.equal(data[i].col2);
        }

        c.close();
    });
});
