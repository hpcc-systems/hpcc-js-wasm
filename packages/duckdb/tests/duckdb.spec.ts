import { describe, expect, it } from "vitest";
import { DuckDB } from "@hpcc-js/wasm-duckdb";

describe("duckdb", function () {

    it("version", async function () {
        const duckdb = await DuckDB.load();
        const v = duckdb.version();
        expect(v).to.be.a("string");
        expect(v).to.equal("v1.4.3");       //  Update README.md if this changes
        console.log("duckdb version: " + v);
    });

    it("simple", async function () {
        const duckdb = await DuckDB.load();
        const con = duckdb.connect();
        con.query("CREATE TABLE integers(i INTEGER)").dispose();
        con.query("INSERT INTO integers VALUES (3)").dispose();
        const result = con.query("SELECT * FROM integers");
        const resultStr = result.toString();
        result.print();
        expect(resultStr).to.be.a("string");
        expect(resultStr).to.contain("3");
        result.dispose();
        con.close();
    });

    it("runQuery", async function () {
        const duckdb = await DuckDB.load();
        const con = duckdb.connect();
        const bytes = con.runQuery("SELECT 42 AS answer");
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.be.gt(0);
        const text = new TextDecoder().decode(bytes);
        expect(text).to.contain("42");
        con.close();
    });

    it("queryColumnar", async function () {
        const duckdb = await DuckDB.load();
        const con = duckdb.connect();
        const result = con.queryColumnar("SELECT 42 AS answer");
        expect(result.hasError()).to.equal(false);
        expect(result.rowCount()).to.equal(1);
        expect(result.columnCount()).to.equal(1);
        expect(result.columnName(0).toLowerCase()).to.contain("answer");
        expect(result.validity(0)).to.be.instanceOf(Uint8Array);
        const col = result.f64Column(0);
        expect(col).to.not.equal(null);
        if (!(col instanceof Float64Array)) {
            throw new Error("Expected f64Column(0) to return a Float64Array");
        }
        expect(col[0]).to.equal(42);
        result.dispose();
        con.close();
    });

    it("queryColumnar_toArray", async function () {
        const duckdb = await DuckDB.load();
        const con = duckdb.connect();

        const result = con.queryColumnar(
            "SELECT * FROM (VALUES (1, true, 'x'), (2, false, NULL)) t(a, b, c)"
        );
        expect(result.hasError()).to.equal(false);
        expect(result.toArray()).to.deep.equal([
            { a: 1, b: true, c: "x" },
            { a: 2, b: false, c: null }
        ]);

        result.dispose();
        con.close();
    });

    it("prepare", async function () {
        const duckdb = await DuckDB.load();
        const conn = duckdb.connect();
        conn.query("CREATE TABLE person (name VARCHAR, age BIGINT);").dispose();
        conn.query("INSERT INTO person VALUES ('Alice', 37), ('Ana', 35), ('Bob', 41), ('Bea', 25);").dispose();
        const stmt = conn.prepare("SELECT * FROM person WHERE starts_with(name, CAST(? AS VARCHAR))");
        const result = stmt.execute(["B"]);
        const resultStr = result.toString();
        expect(resultStr).to.contain("name");
        expect(resultStr).to.contain("age");
        expect(resultStr.toLowerCase()).to.not.contain("error");
        result.dispose();
        stmt.dispose();
        conn.close();
    });

    it("prepare_values", async function () {
        const duckdb = await DuckDB.load();
        const conn = duckdb.connect();
        const stmt = conn.prepare(
            "SELECT CAST(? AS VARCHAR) AS s, CAST(? AS BIGINT) AS n, CAST(? AS BOOLEAN) AS b, CAST(? AS VARCHAR) AS z"
        );
        const result = stmt.execute(["x", 42, true, null]);
        const resultStr = result.toString();
        expect(resultStr.toLowerCase()).to.not.contain("error");
        expect(resultStr).to.contain("s");
        expect(resultStr).to.contain("n");
        expect(resultStr).to.contain("b");
        expect(resultStr).to.contain("z");
        expect(resultStr).to.contain("42");
        result.dispose();
        stmt.dispose();
        conn.close();
    });

    it("json", async function () {
        const duckdb = await DuckDB.load();
        const c = duckdb.connect();

        const data = [
            { "col1": 1, "col2": "foo" },
            { "col1": 2, "col2": "bar" },
        ];
        duckdb.registerFileString("/rows.json", JSON.stringify(data));
        c.insertJSONFromPath("/rows.json", { name: "rows" });

        const resultObj = c.query("SELECT * FROM rows");
        const resultArr = resultObj.toArray();
        resultObj.dispose();
        expect(resultArr.length).to.equal(data.length);
        for (let i = 0; i < resultArr.length; i++) {
            expect(resultArr[i].col2).to.equal(data[i].col2);
        }

        c.close();
    });

    it("core_functions", async function () {
        const duckdb = await DuckDB.load();
        const c = duckdb.connect();

        // generate_series is provided by core_functions; should work without calling SQL LOAD.
        const result = c.query("SELECT * FROM generate_series(0, 3) AS t(v)");
        const rows = result.toArray();
        result.dispose();
        expect(rows.map((r: any) => r.v)).to.deep.equal([0, 1, 2, 3]);

        c.close();
    });

    it("extensions", async function () {
        const duckdb = await DuckDB.load();
        const con = duckdb.connect();
        const result = con.query(`SELECT extension_name, loaded, installed FROM duckdb_extensions() WHERE extension_name IN ('json', 'parquet')`);
        const extensions = result.toArray();
        result.dispose();

        expect(extensions.length).to.be.gt(0);
        const loadedExtensions = extensions.filter((ext: any) => ext.loaded);
        expect(loadedExtensions.length).to.be.gt(0);

        con.close();
    });
});
