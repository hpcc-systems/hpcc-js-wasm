# @hpcc-js/wasm - Version 3

![Tests](https://github.com/hpcc-systems/hpcc-js-wasm/workflows/Test%20PR/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/GordonSmith/hpcc-js-wasm/badge.svg?branch=BUMP_VERSIONS)](https://coveralls.io/github/GordonSmith/hpcc-js-wasm?branch=BUMP_VERSIONS)

**Note:  @hpcc-js/wasm is now an ESM by default package** - this is a good thing, but does require some breaking changes.

This repository contains a collection of useful c++ libraries compiled to WASM for (re)use in Node JS, Web Browsers and JavaScript Libraries:
- [base91](https://base91.sourceforge.net/) - v0.6.0
- [duckdb](https://github.com/duckdb/duckdb) - v0.9.2
- [expat](https://libexpat.github.io/) - v2.6.2
- [graphviz](https://www.graphviz.org/) - v12.1.0
- [zstd](https://github.com/facebook/zstd) - v1.5.6
- ...more to follow...

Built with:
- [emsdk](https://github.com/emscripten-core/emsdk) - v3.1.64

## Homepage and Documents

* [Homepage](https://hpcc-systems.github.io/hpcc-js-wasm/)
    * [Base91](https://hpcc-systems.github.io/hpcc-js-wasm/base91/classes/Base91.html)
    * [DuckDB](https://hpcc-systems.github.io/hpcc-js-wasm/duckdb/classes/DuckDB.html)
    * [Expat](https://hpcc-systems.github.io/hpcc-js-wasm/expat/classes/Expat.html)
    * [Graphviz](https://hpcc-systems.github.io/hpcc-js-wasm/graphviz/classes/Graphviz.html)
    * [Zstd](https://hpcc-systems.github.io/hpcc-js-wasm/zstd/classes/Zstd.html)

## Version 3 Changes

Converted this repository to a monorepo with the following packages:
- @hpcc-js/wasm-base91
- @hpcc-js/wasm-duckdb
- @hpcc-js/wasm-expat
- @hpcc-js/wasm-graphviz
- @hpcc-js/wasm-graphviz-cli
- @hpcc-js/wasm-zstd
- @hpcc-js/wasm (meta package for backward compatibility)

## Quick Start

```ts
import { Base91 } from "@hpcc-js/wasm-base91";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { Zstd } from "@hpcc-js/wasm-zstd";

// Graphviz  ---
async function dot2svg() {
    const graphviz = await Graphviz.load();
    console.log("svg:  ", graphviz.dot('digraph G { Hello -> World }'));
}

dot2svg();

// Base91 + Zstd ---
const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.";
const data = new TextEncoder().encode(text);

async function compressDecompress() {
    const zstd = await Zstd.load();
    const compressed_data = zstd.compress(data);
    const base91 = await Base91.load();
    const base91Str = base91.encode(compressed_data);

    const compressed_data2 = base91.decode(base91Str);
    const data2 = zstd.decompress(compressed_data2);
    const text2 = new TextDecoder().decode(data2);

    console.log("Text Length:  ", text.length);
    console.log("Compressed Length:  ", compressed_data.length);
    console.log("Base91 Length:  ", base91Str.length);
    console.log("Passed:  ", text === text2);
}

compressDecompress();
```

## Quick Migration from v1

v1.x.x
```ts
import { graphviz, wasmFolder } from "@hpcc-js/wasm";

wasmFolder("https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist");

const dot = "digraph G { Hello -> World }";

graphviz.dot(dot).then(svg => {
    const div = document.getElementById("placeholder");
    div.innerHTML = svg;    
});

graphvizVersion.then(version => console.log(version));
```

v2.x.x
```ts
import { Graphviz } from "@hpcc-js/wasm";

const dot = "digraph G { Hello -> World }";

Graphviz.load().then(graphviz => {
    const svg = graphviz.dot(dot);
    const div = document.getElementById("placeholder");
    div.innerHTML = svg;    

    console.log(graphviz.version());
});
```

Notes:
* wasmFolder is no longer needed
* All wasm libraries have the same asynchronous load pattern
    - `const instance = await <Wasm>.load();`

v3.x.x
```ts
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const dot = "digraph G { Hello -> World }";

Graphviz.load().then(graphviz => {
    const svg = graphviz.dot(dot);
    const div = document.getElementById("placeholder");
    div.innerHTML = svg;    

    console.log(graphviz.version());
});
```
