// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/duckdb/src-cpp/duckdblib.wasm";
import type { MainModule, DuckDB as DuckDBGlobals, Connection, PreparedStatement, MaterializedQueryResult, QueryResult, ColumnarQueryResult } from "../../../build/packages/duckdb/src-cpp/duckdblib.js";
import { WasmLibrary } from "./wasm-library.ts";

let g_duckdb: Promise<DuckDB>;
const textEncoder = new TextEncoder();

/**
 * DuckDB WASM library, a in-process SQL OLAP Database Management System..
 * 
 * See [DuckDB](https://github.com/duckdb/duckdb) for more details.
 *
 * ```ts
 * import { DuckDB } from "@hpcc-js/wasm-duckdb";
 * 
 * let duckdb = await DuckDB.load();
 * const c = await duckdb.connect();
 * 
 * const data = [
 *     { "col1": 1, "col2": "foo" },
 *     { "col1": 2, "col2": "bar" },
 * ];
 * await duckdb.registerFileText("rows.json", JSON.stringify(data));
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

export class DuckDBResult extends WasmLibrary<MainModule, MaterializedQueryResult> {

    constructor(_module: MainModule, result: MaterializedQueryResult) {
        super(_module, result);
    }

    toString(): string {
        return this._exports.toString_();
    }

    print(): void {
        // eslint-disable-next-line no-console
        console.log(this.toString());
    }

    toArray(): any[] {
        const rowCount = this._exports.rowCount();
        const colCount = this._exports.columnCount();
        const columns: string[] = [];
        for (let i = 0; i < colCount; ++i) {
            columns.push(this._exports.columnName(BigInt(i)));
        }

        const retVal: any[] = [];
        for (let index = 0; index < rowCount; ++index) {
            const row: any = {
            };
            for (let column = 0; column < colCount; ++column) {
                row[columns[column]] = this._exports.getValue(column, index);
            }
            retVal.push(row);
        }
        return retVal;
    }
}

export class DuckDBQueryResult extends WasmLibrary<MainModule, QueryResult> {

    constructor(_module: MainModule, result: QueryResult) {
        super(_module, result);
    }

    toString(): string {
        return this._exports.toString_();
    }

    print(): void {
        // eslint-disable-next-line no-console
        console.log(this.toString());
    }
}

export class DuckDBPreparedStatement extends WasmLibrary<MainModule, PreparedStatement> {

    constructor(_module: MainModule, stmt: PreparedStatement) {
        super(_module, stmt);
    }

    toString(): string {
        return "[DuckDBPreparedStatement]";
    }

    execute(args: Array<string | number | boolean | null>): DuckDBQueryResult {
        return new DuckDBQueryResult(this._module, this._exports.execute(args)!);
    }
}

export type DuckDBColumnKind = "f64" | "bool" | "string";

export class DuckDBColumnarResult extends WasmLibrary<MainModule, ColumnarQueryResult> {

    constructor(_module: MainModule, result: ColumnarQueryResult) {
        super(_module, result);
    }

    hasError(): boolean {
        return this._exports.hasError();
    }

    error(): string {
        return this._exports.error();
    }

    rowCount(): number {
        return Number(this._exports.rowCount());
    }

    columnCount(): number {
        return Number(this._exports.columnCount());
    }

    columnName(column: number): string {
        return this._exports.columnName(column);
    }

    columnType(column: number): string {
        return this._exports.columnType(column);
    }

    columnKind(column: number): DuckDBColumnKind {
        const k = Number(this._exports.columnKind(column));
        switch (k) {
            case 0: return "f64";
            case 1: return "bool";
            default: return "string";
        }
    }

    validity(column: number): Uint8Array {
        return this._exports.validity(column) as any;
    }

    f64Column(column: number): Float64Array | null {
        return (this._exports.f64Column(column) as any) ?? null;
    }

    boolColumn(column: number): Uint8Array | null {
        return (this._exports.boolColumn(column) as any) ?? null;
    }

    stringColumn(column: number): Array<string | null> | null {
        return (this._exports.stringColumn(column) as any) ?? null;
    }

    toArray(): any[] {
        if (this.hasError()) {
            throw new Error(this.error() || "DuckDB columnar query failed");
        }

        const rowCount = this.rowCount();
        const colCount = this.columnCount();
        const columns: string[] = [];
        const kinds: DuckDBColumnKind[] = [];
        const validity: Uint8Array[] = [];
        const f64Cols: Array<Float64Array | null> = [];
        const boolCols: Array<Uint8Array | null> = [];
        const strCols: Array<Array<string | null> | null> = [];

        for (let c = 0; c < colCount; ++c) {
            columns.push(this.columnName(c));
            const kind = this.columnKind(c);
            kinds.push(kind);
            validity.push(this.validity(c));
            f64Cols.push(kind === "f64" ? this.f64Column(c) : null);
            boolCols.push(kind === "bool" ? this.boolColumn(c) : null);
            strCols.push(kind === "string" ? this.stringColumn(c) : null);
        }

        const retVal: any[] = new Array(rowCount);
        for (let r = 0; r < rowCount; ++r) {
            retVal[r] = {};
        }

        for (let c = 0; c < colCount; ++c) {
            const name = columns[c];
            const kind = kinds[c];
            const valid = validity[c];

            if (kind === "f64") {
                const col = f64Cols[c];
                for (let r = 0; r < rowCount; ++r) {
                    retVal[r][name] = valid[r] ? (col ? col[r] : null) : null;
                }
            } else if (kind === "bool") {
                const col = boolCols[c];
                for (let r = 0; r < rowCount; ++r) {
                    retVal[r][name] = valid[r] ? Boolean(col && col[r]) : null;
                }
            } else {
                const col = strCols[c];
                for (let r = 0; r < rowCount; ++r) {
                    retVal[r][name] = valid[r] ? (col ? col[r] : null) : null;
                }
            }
        }

        return retVal;
    }
}

export class DuckDBConnection extends WasmLibrary<MainModule, Connection> {

    constructor(_module: MainModule, connection: Connection) {
        super(_module, connection);
    }

    prepare(sql: string): DuckDBPreparedStatement {
        return new DuckDBPreparedStatement(this._module, this._exports.prepare(sql)!);
    }

    query(sql: string): DuckDBResult {
        return new DuckDBResult(this._module, this._exports.query(sql)!);
    }

    /**
     * Executes a query and materializes the result in WASM memory, exposing columns
     * as typed-array views (plus a per-column validity mask).
     *
     * This is substantially faster than row-wise iteration (`getValue` per cell).
     * The returned typed arrays are views into WASM memory; clone them if you need
     * to keep data after disposing the result.
     */
    queryColumnar(sql: string): DuckDBColumnarResult {
        return new DuckDBColumnarResult(this._module, (this._exports as any).queryColumnar(sql)!);
    }

    /**
     * Convenience alias for `queryColumnar`.
     */
    runQueryColumnar(sql: string): DuckDBColumnarResult {
        return this.queryColumnar(sql);
    }

    /**
     * Execute a query and return the result as a binary payload.
     *
     * Note: unlike `DuckDB-Wasm`'s `runQuery` (which returns Arrow IPC bytes), this
     * implementation returns UTF-8 bytes of DuckDB's textual result representation.
     */
    runQuery(sql: string): Uint8Array {
        const result = this._exports.query(sql);
        if (!result) return new Uint8Array();
        try {
            const resultAny = result as any;
            const text = typeof resultAny.toString_ === "function" ? resultAny.toString_() : String(resultAny);
            return textEncoder.encode(text);
        } finally {
            const resultAny = result as any;
            if (typeof resultAny.delete === "function") {
                resultAny.delete();
            } else {
                const moduleAny = this._module as any;
                if (typeof moduleAny.destroy === "function") {
                    moduleAny.destroy(result);
                }
            }
        }
    }

    /**
     * Validate a SQL identifier (e.g., table name) to prevent injection.
     * Only allows unquoted identifiers like: letters/underscore followed by letters/digits/underscore.
     */
    private sanitizeIdentifier(name: string): string {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
            throw new Error("Invalid SQL identifier");
        }
        return name;
    }

    /**
     * Escape a string literal for inclusion in SQL single-quoted strings.
     * Escapes single quotes by doubling them, per standard SQL rules.
     */
    private escapeLiteral(value: string): string {
        return value.replace(/'/g, "''");
    }

    insertJSONFromPath(fileName: string, options: { name: string }): void {
        const tableName = this.sanitizeIdentifier(options.name);
        const escapedFileName = this.escapeLiteral(fileName);
        this.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_json('${escapedFileName}')`);
    }

    close() {
        this.dispose();
    }
}

export class DuckDB extends WasmLibrary<MainModule, DuckDBGlobals> {

    private constructor(_module: MainModule) {
        super(_module, _module.create()!);
        const { FS_createPath } = this._module;
        FS_createPath("/", "home/web_user", true, true);
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
        if (!g_duckdb) {
            g_duckdb = load().then((module: any) => {
                return new DuckDB(module)
            });
        }
        return g_duckdb;
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        reset();
    }

    /**
     * @returns The DuckDB version
     */
    version(): string {
        return this._module.libraryVersion();
    }

    connect(): DuckDBConnection {
        return new DuckDBConnection(this._module, this._exports.connect()!);
    }

    registerFile(path: string, content: Uint8Array): void {
        const { FS_createDataFile, FS_createPath } = this._module;
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const split = normalizedPath.lastIndexOf("/");
        const dir = split > 0 ? normalizedPath.substring(0, split) : "/";
        if (dir.length > 1 && FS_createPath) {
            FS_createPath("/", dir.slice(1), true, true);
        }
        FS_createDataFile(normalizedPath, undefined, content, true, true, true);
    }

    registerFileString(fileName: string, content: string): void {
        const encoded = textEncoder.encode(content);
        this.registerFile(fileName, encoded);
    }

}
