// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/duckdb/duckdblib.wasm";
import type { MainModule, DuckDB as CPPDuckDB } from "../../../build/packages/duckdb/duckdblib.js";
import { MainModuleEx } from "@hpcc-js/wasm-util";

let g_duckdb: Promise<DuckDB>;
const textEncoder = new TextEncoder();

/**
 * DuckDB WASM library - an in-process SQL OLAP Database Management System.
 * 
 * DuckDB is designed for OLAP (Online Analytical Processing) workloads and provides:
 * - Full SQL support with rich analytical functions
 * - In-process execution (no server required)
 * - Efficient columnar storage
 * - Support for reading CSV, JSON, and other formats
 * - Transaction management
 * - Prepared statements with parameter binding
 * 
 * @example Basic Query
 * ```ts
 * import { DuckDB } from "@hpcc-js/wasm-duckdb";
 * 
 * const duckdb = await DuckDB.load();
 * const connection = duckdb.connect();
 * 
 * const result = connection.query("SELECT 'Hello, DuckDB!' AS message");
 * console.log(result.getValue(0, 0)); // "Hello, DuckDB!"
 * 
 * result.delete();
 * connection.delete();
 * ```
 * 
 * @example Working with JSON Files
 * ```ts
 * const duckdb = await DuckDB.load();
 * const connection = duckdb.connect();
 * 
 * const data = [
 *     { id: 1, name: "Alice", age: 30 },
 *     { id: 2, name: "Bob", age: 25 }
 * ];
 * duckdb.registerFileString("users.json", JSON.stringify(data));
 * 
 * const result = connection.query("SELECT * FROM read_json_auto('users.json') WHERE age > 26");
 * console.log(result.toJSON()); // [{"id":1,"name":"Alice","age":30}]
 * 
 * result.delete();
 * connection.delete();
 * ```
 * 
 * @example Prepared Statements
 * ```ts
 * const connection = duckdb.connect();
 * connection.query("CREATE TABLE users (id INTEGER, name VARCHAR, age INTEGER)").delete();
 * 
 * const insertStmt = connection.prepare("INSERT INTO users VALUES (?, ?, ?)");
 * insertStmt.execute([1, "Alice", 30]).delete();
 * insertStmt.execute([2, "Bob", 25]).delete();
 * insertStmt.delete();
 * 
 * const queryStmt = connection.prepare("SELECT * FROM users WHERE age > ?");
 * const result = queryStmt.execute([26]);
 * console.log(result.toJSON());
 * 
 * result.delete();
 * queryStmt.delete();
 * connection.delete();
 * ```
 * 
 * @example Transaction Management
 * ```ts
 * const connection = duckdb.connect();
 * 
 * connection.setAutoCommit(false);
 * connection.beginTransaction();
 * 
 * try {
 *     connection.query("UPDATE accounts SET balance = balance - 200 WHERE id = 1").delete();
 *     connection.query("UPDATE accounts SET balance = balance + 200 WHERE id = 2").delete();
 *     connection.commit();
 *     console.log("Transfer successful");
 * } catch (error) {
 *     connection.rollback();
 *     console.error("Transfer failed");
 * }
 * 
 * connection.delete();
 * ```
 * 
 * @see [DuckDB Documentation](https://duckdb.org/docs/)
 * @see [DuckDB GitHub](https://github.com/duckdb/duckdb)
 */



export class DuckDB extends MainModuleEx<MainModule> {

    db: CPPDuckDB

    private constructor(_module: MainModule) {
        super(_module);
        this.db = this._module.create()!;
        const { FS_createPath } = this._module;
        FS_createPath("/", "home/web_user", true, true);
    }

    /**
     * Loads and initializes the DuckDB WASM module.
     * 
     * This method compiles and instantiates the WebAssembly module. It returns a singleton
     * instance, so subsequent calls will return the same instance.
     * 
     * **Note:** WebAssembly compilation is disallowed on the main thread if the buffer size 
     * is larger than 4KB, which is why this method is asynchronous.
     * 
     * @returns A promise that resolves to the DuckDB instance
     * 
     * @example
     * ```ts
     * const duckdb = await DuckDB.load();
     * console.log(duckdb.version()); // e.g., "v1.4.3"
     * ```
     */
    static load(): Promise<DuckDB> {
        if (!g_duckdb) {
            g_duckdb = load().then((module: any) => {
                return new DuckDB(module)
            });
        }
        return g_duckdb;
    }

    /**
     * Unloads the compiled WASM instance.
     * 
     * This is primarily useful for cleanup in testing scenarios or when you need to
     * completely reset the DuckDB instance.
     * 
     * @example
     * ```ts
     * DuckDB.unload();
     * // The next call to DuckDB.load() will create a fresh instance
     * ```
     */
    static unload() {
        reset();
    }

    /**
     * Returns the DuckDB version string.
     * 
     * @returns The version string (e.g., "v1.4.3")
     * 
     * @example
     * ```ts
     * const duckdb = await DuckDB.load();
     * console.log(duckdb.version()); // "v1.4.3"
     * ```
     */
    version(): string {
        return this._module.libraryVersion();
    }

    /**
     * Creates a new database connection.
     * 
     * Each connection maintains its own transaction state and can execute queries
     * independently. Always call `.delete()` on the connection when done to free resources.
     * 
     * @returns A new Connection instance
     * 
     * @example
     * ```ts
     * const duckdb = await DuckDB.load();
     * const connection = duckdb.connect();
     * 
     * const result = connection.query("SELECT 42 AS answer");
     * console.log(result.getValue(0, 0)); // 42
     * 
     * result.delete();
     * connection.delete(); // Important: clean up!
     * ```
     */
    connect() {
        return this.db.connect()!;
    }

    /**
     * Returns the number of threads available to DuckDB.
     * 
     * @returns The number of threads
     * 
     * @example
     * ```ts
     * const duckdb = await DuckDB.load();
     * console.log(duckdb.numberOfThreads()); // 1
     * ```
     */
    numberOfThreads(): number {
        return Number(this.db.numberOfThreads());
    }

    /**
     * Registers a binary file in the virtual file system.
     * 
     * This allows DuckDB to read files as if they were on disk, which is useful for
     * reading CSV, JSON, Parquet, and other file formats using DuckDB's file readers.
     * 
     * The path is normalized to remove leading slashes and directories are created
     * automatically as needed.
     * 
     * @param path - The path where the file should be accessible (e.g., "data/users.csv")
     * @param content - The file content as a Uint8Array
     * 
     * @example
     * ```ts
     * const csvData = "id,name\n1,Alice\n2,Bob";
     * const bytes = new TextEncoder().encode(csvData);
     * duckdb.registerFile("data.csv", bytes);
     * 
     * const connection = duckdb.connect();
     * const result = connection.query("SELECT * FROM read_csv_auto('data.csv')");
     * console.log(result.rowCount()); // 2
     * result.delete();
     * connection.delete();
     * ```
     */
    registerFile(path: string, content: Uint8Array): void {
        const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
        const split = normalizedPath.lastIndexOf("/");
        const dir = split > 0 ? normalizedPath.substring(0, split) : "/";
        if (dir.length > 1 && this._module.FS_createPath) {
            this._module.FS_createPath(dir, true, true);
        }
        this._module.FS_createDataFile(normalizedPath, undefined, content, true, true, true);
    }

    /**
     * Registers a text file in the virtual file system.
     * 
     * This is a convenience method that encodes the string content to UTF-8 bytes
     * and calls {@link registerFile}. Useful for registering JSON, CSV, or other
     * text-based data files.
     * 
     * @param fileName - The path where the file should be accessible
     * @param content - The file content as a string
     * 
     * @example Register JSON data
     * ```ts
     * const users = [
     *     { id: 1, name: "Alice", age: 30 },
     *     { id: 2, name: "Bob", age: 25 }
     * ];
     * duckdb.registerFileString("users.json", JSON.stringify(users));
     * 
     * const connection = duckdb.connect();
     * const result = connection.query(`
     *     SELECT name, age 
     *     FROM read_json_auto('users.json') 
     *     WHERE age > 26
     * `);
     * console.log(result.toJSON()); // [{"name":"Alice","age":30}]
     * result.delete();
     * connection.delete();
     * ```
     * 
     * @example Register CSV data
     * ```ts
     * const csvData = `id,product,price
     * 1,Laptop,999.99
     * 2,Mouse,29.99`;
     * 
     * duckdb.registerFileString("products.csv", csvData);
     * 
     * const connection = duckdb.connect();
     * const result = connection.query("SELECT * FROM read_csv_auto('products.csv')");
     * result.print();
     * result.delete();
     * connection.delete();
     * ```
     */
    registerFileString(fileName: string, content: string): void {
        const encoded = textEncoder.encode(content);
        this.registerFile(fileName, encoded);
    }

}
