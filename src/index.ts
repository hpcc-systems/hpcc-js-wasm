export namespace Base91 {
    export function load() {
        return import("./base91.js").then(({ Base91 }) => Base91)
    }
}

// export namespace Expat {
//     export function load() {
//         return import("./expat.js").then(({ Expat }) => Expat)
//     }
// }

export namespace Graphviz {
    export function load() {
        return import("./graphviz.js").then(({ Graphviz }) => Graphviz);
    }
}

export namespace Zstd {
    export function load() {
        return import("./zstd.js").then(({ Zstd }) => Zstd);
    }
}
