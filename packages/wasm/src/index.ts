export namespace Base91 {
    export function load() {
        return import("./base91.js").then(mod => mod.Base91.load());
    }
}
export namespace DuckDB {
    export function load() {
        return import("./duckdb.js").then(mod => mod.DuckDB.load());
    }
}
export namespace Expat {
    export function load() {
        return import("./expat.js").then(mod => mod.Expat.load());
    }
}
export namespace Graphviz {
    export function load() {
        return import("./graphviz.js").then(mod => mod.Graphviz.load());
    }
}
export namespace Zstd {
    export function load() {
        return import("./zstd.js").then(mod => mod.Zstd.load());
    }
}
