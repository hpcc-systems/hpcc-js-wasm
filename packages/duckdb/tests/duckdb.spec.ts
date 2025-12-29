import { beforeAll, describe, expect, it } from "vitest";
import { DuckDB } from "@hpcc-js/wasm-duckdb";

describe("duckdb", () => {
    let duckdb: DuckDB;

    beforeAll(async () => {
        duckdb = await DuckDB.load();
    });

    describe("DuckDB static methods", () => {
        it("loads once and reports version", async () => {
            const secondLoad = await DuckDB.load();
            expect(secondLoad).toBe(duckdb);

            const v = duckdb.version();
            expect(typeof v).toBe("string");
            expect(v.length).toBeGreaterThan(0);
            expect(v).toMatch(/^v?\d/);
        });

        it("reports numberOfThreads", () => {
            expect(duckdb.numberOfThreads()).toBeGreaterThan(0);
        });
    });

    describe("Connection and Query Execution", () => {
        it("runs a simple query", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 3 + 4 AS value")!;

            expect(Number(result.rowCount())).toBe(1);
            expect(result.getValue(0, 0)).toBe(7);

            result.delete();
            con.delete();
        });

        it("supports interrupt", () => {
            const con = duckdb.connect();
            // Interrupt is a void method, just verify it doesn't throw
            con.interrupt();
            con.delete();
        });

        it("reports query progress", () => {
            const con = duckdb.connect();
            const progress = con.getQueryProgress();
            expect(progress).toBeDefined();
            con.delete();
        });
    });

    describe("PreparedStatement", () => {
        it("executes prepared statements with parameters", () => {
            const con = duckdb.connect()!;
            con.query("CREATE TABLE person (name VARCHAR, age BIGINT);")!.delete();
            con.query("INSERT INTO person VALUES ('Alice', 37), ('Ana', 35), ('Bob', 41), ('Bea', 25);")!.delete();

            const stmt = con.prepare("SELECT name, age FROM person WHERE starts_with(name, CAST(? AS VARCHAR)) ORDER BY age DESC")!;
            const result = stmt.execute(["B"])!;

            expect(Number(result.rowCount())).toBe(2);
            expect(result.getValue(0, 0)).toBe("Bob");
            expect(result.getValue(1, 0)).toBe(41);
            expect(result.getValue(0, 1)).toBe("Bea");
            expect(result.getValue(1, 1)).toBe(25);

            result.delete();
            stmt.delete();
            con.delete();
        });

        it("reports prepared statement metadata", () => {
            const con = duckdb.connect();
            con.query("CREATE TABLE test_table (id INTEGER, name VARCHAR);")!.delete();
            const stmt = con.prepare("SELECT * FROM test_table WHERE id = ?");

            expect(stmt.hasError()).toBe(false);
            expect(Number(stmt.columnCount())).toBe(2);

            const names = stmt.names();
            expect(names.length).toBe(2);
            expect(names[0]).toBe("id");
            expect(names[1]).toBe("name");

            const types = stmt.types();
            expect(types.length).toBe(2);
            expect(typeof types[0]).toBe("string");
            expect(typeof types[1]).toBe("string");

            const stmtType = stmt.statementType();
            expect(typeof stmtType).toBe("number");

            stmt.delete();
            con.delete();
        });

        it("supports binding different value types", () => {
            const con = duckdb.connect();
            const stmt = con.prepare("SELECT CAST(? AS VARCHAR) AS s, CAST(? AS BIGINT) AS n, CAST(? AS BOOLEAN) AS b, CAST(? AS VARCHAR) AS z");
            const result = stmt.execute(["x", 42, true, null]);

            expect(result.getValue(0, 0)).toBe("x");
            expect(result.getValue(1, 0)).toBe(42);
            expect(result.getValue(2, 0)).toBe(true);
            expect(result.getValue(3, 0)).toBeNull();

            result.delete();
            stmt.delete();
            con.delete();
        });
    });

    describe("MaterializedQueryResult", () => {
        it("provides row and column counts", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 AS a, 2 AS b UNION ALL SELECT 3, 4")!;

            expect(Number(result.rowCount())).toBe(2);
            expect(Number(result.columnCount())).toBe(2);

            result.delete();
            con.delete();
        });

        it("provides column names and types", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 AS num, 'text' AS str")!;

            const names = result.columnNames();
            expect(names.length).toBe(2);
            expect(names[0]).toBe("num");
            expect(names[1]).toBe("str");

            const types = result.columnTypes();
            expect(types.length).toBe(2);
            expect(typeof types[0]).toBe("string");
            expect(typeof types[1]).toBe("string");

            result.delete();
            con.delete();
        });

        it("provides result type and statement type", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 42")!;

            const resultType = result.resultType();
            expect(typeof resultType).toBe("number");

            const stmtType = result.statementType();
            expect(typeof stmtType).toBe("number");

            result.delete();
            con.delete();
        });

        it("supports error handling", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 42")!;

            expect(result.hasError()).toBe(false);

            const errorMsg = result.getError();
            expect(typeof errorMsg).toBe("string");
            expect(errorMsg.length).toBe(0);

            result.delete();
            con.delete();
        });

        it("provides string representation", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 AS val")!;

            const str = result.stringify();
            expect(typeof str).toBe("string");
            expect(str.length).toBeGreaterThan(0);

            result.delete();
            con.delete();
        });

        it("provides column names via columnName method", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 AS first, 2 AS second")!;

            expect(result.columnName(0n)).toBe("first");
            expect(result.columnName(1n)).toBe("second");

            result.delete();
            con.delete();
        });

        it("converts result to JSON", () => {
            const con = duckdb.connect();

            // Test basic types
            const result1 = con.query(`
                SELECT 
                    1 as int_val,
                    3.14 as float_val,
                    'test' as str_val,
                    true as bool_val,
                    NULL as null_val
            `)!;
            const json1 = result1.toJSON();
            expect(typeof json1).toBe("string");
            const parsed1 = JSON.parse(json1);
            expect(Array.isArray(parsed1)).toBe(true);
            expect(parsed1.length).toBe(1);
            expect(parsed1[0].int_val).toBe(1);
            expect(parsed1[0].str_val).toBe("test");
            expect(parsed1[0].bool_val).toBe(true);
            expect(parsed1[0].null_val).toBeNull();
            result1.delete();

            // Test multiple rows
            const result2 = con.query(`
                SELECT * FROM (VALUES 
                    (1, 'Alice'),
                    (2, 'Bob'),
                    (3, 'Charlie')
                ) AS t(id, name)
            `)!;
            const json2 = result2.toJSON();
            const parsed2 = JSON.parse(json2);
            expect(parsed2.length).toBe(3);
            expect(parsed2[0].id).toBe(1);
            expect(parsed2[0].name).toBe("Alice");
            expect(parsed2[1].id).toBe(2);
            expect(parsed2[1].name).toBe("Bob");
            expect(parsed2[2].id).toBe(3);
            expect(parsed2[2].name).toBe("Charlie");
            result2.delete();

            // Test special characters
            const result3 = con.query(`
                SELECT 
                    'hello\nworld' as newline,
                    '"quoted"' as quotes,
                    'back\\slash' as backslash
            `)!;
            const json3 = result3.toJSON();
            const parsed3 = JSON.parse(json3);
            expect(parsed3[0].newline).toBe("hello\nworld");
            expect(parsed3[0].quotes).toBe('"quoted"');
            expect(parsed3[0].backslash).toBe("back\\slash");
            result3.delete();

            con.delete();
        });

        it("provides collection access", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 UNION ALL SELECT 2")!;

            const collection = result.collection();
            expect(collection).toBeDefined();
            // Collection is a reference, verify methods exist
            expect(typeof collection.count).toBe("function");
            expect(Number(collection.columnCount())).toBe(1);

            result.delete();
            con.delete();
        });
    });

    describe("Transaction Management", () => {
        it("supports manual transactions", () => {
            const con = duckdb.connect();
            con.query("CREATE TABLE txn_test (id INTEGER);")!.delete();

            expect(con.hasActiveTransaction()).toBe(false);

            con.beginTransaction();
            expect(con.hasActiveTransaction()).toBe(true);

            con.query("INSERT INTO txn_test VALUES (1);")!.delete();
            con.commit();

            expect(con.hasActiveTransaction()).toBe(false);

            const result = con.query("SELECT COUNT(*) FROM txn_test")!;
            expect(result.getValue(0, 0)).toBe(1);

            result.delete();
            con.delete();
        });

        it("supports rollback", () => {
            const con = duckdb.connect();
            con.query("CREATE TABLE rollback_test (id INTEGER);")!.delete();

            con.beginTransaction();
            con.query("INSERT INTO rollback_test VALUES (99);")!.delete();
            con.rollback();

            const result = con.query("SELECT COUNT(*) FROM rollback_test")!;
            expect(result.getValue(0, 0)).toBe(0);

            result.delete();
            con.delete();
        });

        it("supports auto-commit mode", () => {
            const con = duckdb.connect();

            expect(con.isAutoCommit()).toBe(true);

            con.setAutoCommit(false);
            expect(con.isAutoCommit()).toBe(false);

            con.setAutoCommit(true);
            expect(con.isAutoCommit()).toBe(true);

            con.delete();
        });
    });

    describe("File Registration", () => {
        it("can query data from a registered file", () => {
            const con = duckdb.connect();
            const data = [
                { col1: 1, col2: "foo" },
                { col1: 2, col2: "bar" },
            ];

            duckdb.registerFileString("rows.json", JSON.stringify(data));

            const result = con.query("SELECT col1, col2 FROM read_json_auto('rows.json') ORDER BY col1");

            expect(Number(result.rowCount())).toBe(2);
            expect(result.getValue(0, 0)).toBe(1);
            expect(result.getValue(1, 0)).toBe("foo");
            expect(result.getValue(0, 1)).toBe(2);
            expect(result.getValue(1, 1)).toBe("bar");

            result.delete();
            con.delete();
        });

        it("supports registerFile with Uint8Array", () => {
            const con = duckdb.connect();
            const csvContent = "id,name\n1,Alice\n2,Bob";
            const encoder = new TextEncoder();
            const bytes = encoder.encode(csvContent);

            duckdb.registerFile("data.csv", bytes);

            const result = con.query("SELECT * FROM read_csv_auto('data.csv')");
            expect(Number(result.rowCount())).toBe(2);
            expect(result.getValue(0, 0)).toBe(1);
            expect(result.getValue(1, 0)).toBe("Alice");

            result.delete();
            con.delete();
        });
    });

    describe("ErrorData handling", () => {
        it("captures query errors", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT * FROM nonexistent_table");

            expect(result.hasError()).toBe(true);

            const errorMsg = result.getError();
            expect(typeof errorMsg).toBe("string");
            expect(errorMsg.length).toBeGreaterThan(0);
            expect(errorMsg).toContain("nonexistent_table");

            result.delete();
            con.delete();
        });

        it("captures prepared statement errors", () => {
            const con = duckdb.connect();
            const stmt = con.prepare("SELECT * FROM invalid_syntax_table WHERE");

            expect(stmt.hasError()).toBe(true);

            const errorMsg = stmt.getError();
            expect(typeof errorMsg).toBe("string");
            expect(errorMsg.length).toBeGreaterThan(0);

            stmt.delete();
            con.delete();
        });
    });

    describe("Value type handling", () => {
        it("handles boolean values", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT TRUE AS t, FALSE AS f")!;

            expect(result.getValue(0, 0)).toBe(true);
            expect(result.getValue(1, 0)).toBe(false);

            result.delete();
            con.delete();
        });

        it("handles integer values", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 42::TINYINT AS tiny, 1000::SMALLINT AS small, 100000::INTEGER AS int, 9999999999::BIGINT AS big")!;

            expect(result.getValue(0, 0)).toBe(42);
            expect(result.getValue(1, 0)).toBe(1000);
            expect(result.getValue(2, 0)).toBe(100000);
            expect(result.getValue(3, 0)).toBe(9999999999);

            result.delete();
            con.delete();
        });

        it("handles floating point values", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 3.14::FLOAT AS f, 2.71828::DOUBLE AS d")!;

            expect(typeof result.getValue(0, 0)).toBe("number");
            expect(typeof result.getValue(1, 0)).toBe("number");

            result.delete();
            con.delete();
        });

        it("handles string values", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 'hello'::VARCHAR AS str")!;

            expect(result.getValue(0, 0)).toBe("hello");

            result.delete();
            con.delete();
        });

        it("handles null values", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT NULL AS n")!;

            expect(result.getValue(0, 0)).toBeNull();

            result.delete();
            con.delete();
        });
    });

    describe("Extensions", () => {
        it("prints linked extensions", () => {
            const con = duckdb.connect();
            const result = con.query(`
SELECT extension_name, installed, description
FROM duckdb_extensions();
`)!;

            expect(Number(result.columnCount())).toBeGreaterThan(0);
            expect(Number(result.rowCount())).toBeGreaterThan(0);

            // result.print();

            result.delete();
            con.delete();
        });
    });

    describe("Print output", () => {
        it("supports print method on QueryResult", () => {
            const con = duckdb.connect();
            const result = con.query("SELECT 1 AS val")!;

            // print() returns void, just verify it doesn't throw
            result.print();

            result.delete();
            con.delete();
        });
    });
});
