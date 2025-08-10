import load, { reset } from "../build/duckdb-eh.wasm.ts";
import loadWasmWorker, { reset as resetWasmWorker } from "../build/duckdb-browser-eh.worker.ts";
import { AsyncDuckDB, ConsoleLogger } from "@duckdb/duckdb-wasm";

/**
 * DuckDB WASM library, a in-process SQL OLAP Database Management System..
 * 
 * See [DuckDB](https://github.com/duckdb/duckdb) for more details.
 *
 * ```ts
 * import { DuckDB } from "@hpcc-js/wasm-duckdb";
 * 
 * let duckdb = await DuckDB.load();
 * const c = await duckdb.db.connect();
 * 
 * const data = [
 *     { "col1": 1, "col2": "foo" },
 *     { "col1": 2, "col2": "bar" },
 * ];
 * await duckdb.db.registerFileText("rows.json", JSON.stringify(data));
 * await c.insertJSONFromPath('rows.json', { name: 'rows' });
 * 
 * const arrowResult = await c.query("SELECT * FROM read_json_auto('rows.json')");
 * const result = arrowResult.toArray().map((row) => row.toJSON());
 * expect(result.length).to.equal(data.length);
 * for (let i = 0; i < result.length; i++) {
 *     expect(result[i].col2).to.equal(data[i].col2);
 * }
 * 
 * c.close();
 * ```
 */
export class DuckDB {

    db: AsyncDuckDB;

    private constructor(db: AsyncDuckDB, protected _version: string) {
        this.db = db;
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the DuckDB class.
     */
    static load(): Promise<DuckDB> {
        const workerUrl = URL.createObjectURL(
            new Blob([new Uint8Array(loadWasmWorker())], { type: "text/javascript" })
        );
        const worker = new Worker(workerUrl);
        URL.revokeObjectURL(workerUrl);
        const logger = new ConsoleLogger();
        const db = new AsyncDuckDB(logger, worker);
        const wasmUrl = URL.createObjectURL(
            new Blob([new Uint8Array(load())], { "type": "application/wasm" })
        );
        return db.instantiate(wasmUrl, null).then(async () => {
            URL.revokeObjectURL(wasmUrl);
            return new DuckDB(db, await db.getVersion());
        });
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        resetWasmWorker();
        reset();
    }

    /**
     * @returns The DuckDB version
     */
    version(): string {
        return this._version;
    }
}
