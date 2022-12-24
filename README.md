# @hpcc-js/wasm - Version 2

![Tests](https://github.com/hpcc-systems/hpcc-js-wasm/workflows/Test%20PR/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/GordonSmith/hpcc-js-wasm/badge.svg?branch=BUMP_VERSIONS)](https://coveralls.io/github/GordonSmith/hpcc-js-wasm?branch=BUMP_VERSIONS)

**@hpcc-js/wasm is now an ESM by default package** - this is a good thing, but does require some breaking changes.

This repository contains a collection of useful c++ libraries compiled to WASM for (re)use in Node JS, Web Browsers and JavaScript Libraries:
- [base91](https://base91.sourceforge.net/) - v0.6.0
- [expat](https://libexpat.github.io/) - v2.5.0
- [graphviz](https://www.graphviz.org/) - v7.0.5
- [zstd](https://github.com/facebook/zstd) - v1.5.2
- ...more to follow...

Built with:
- [emsdk](https://github.com/emscripten-core/emsdk) - v3.1.28

## Homepage and Documents

* [Homepage](https://hpcc-systems.github.io/hpcc-js-wasm/)
    * [Base91](https://hpcc-systems.github.io/hpcc-js-wasm/classes/base91.Base91.html)
    * [Expat](https://hpcc-systems.github.io/hpcc-js-wasm/classes/expat.Expat.html)
    * [Graphviz](https://hpcc-systems.github.io/hpcc-js-wasm/classes/base91.Base91.html)
    * [Zstd](https://hpcc-systems.github.io/hpcc-js-wasm/classes/zstd.Zstd.html)

## Quick Migration Example

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
import { Graphviz } from "@hpcc-js/wasm/graphviz";

const graphviz = await Graphviz.load();

const dot = "digraph G { Hello -> World }";
const svg = graphviz.dot(dot);
console.log(graphviz.version());
```

Notes:
* Import must specify which wasm library your using
* wasmFolder is no longer needed
* All wasm libraries have the same asynchronous load pattern
    - `const instance = await Wasm.load();`

### ⚠⚠⚠ TypeScript Notes ⚠⚠⚠ 

When importing an ESM package AND referencing explicit `exports` (like `@hpcc-js/wasm/graphviz` or `@hpcc-js/wasm/expat`), you should change the following tsconfig.json setting:
* `moduleResolution: Node16`

This will ensure the correct "types" are auto discovered.

