import type * as Base91Types from "./base91.js";
import type * as DuckDBTypes from "./duckdb.js";
import type * as ExpatTypes from "./expat.js";
import type * as GraphvizTypes from "./graphviz.js";
import type * as ZstdTypes from "./zstd.js";

export namespace Base91 {
    export function load(): Promise<Base91Types.Base91> {
        return import("./base91.js").then(mod => mod.Base91.load());
    }
}
export namespace DuckDB {
    export function load(): Promise<DuckDBTypes.DuckDB> {
        return import("./duckdb.js").then(mod => mod.DuckDB.load());
    }
}
export namespace Expat {
    export function load(): Promise<ExpatTypes.Expat> {
        return import("./expat.js").then(mod => mod.Expat.load());
    }
}
export namespace Graphviz {
    export function load(): Promise<GraphvizTypes.Graphviz> {
        return import("./graphviz.js").then(mod => mod.Graphviz.load());
    }
}
export namespace Zstd {
    export function load(): Promise<ZstdTypes.Zstd> {
        return import("./zstd.js").then(mod => mod.Zstd.load());
    }
}
