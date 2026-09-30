# @hpcc-js/wasm

_This folder contains a rebundling the following WebAssembly libraries for backward compatability with v2.x.x:_

* [@hpcc-js/wasm-base91](../base91/README.md)
* [@hpcc-js/wasm-duckdb](../duckdb/README.md)
* [@hpcc-js/wasm-expat](../expat/README.md)
* [@hpcc-js/wasm-graphviz](../graphviz/README.md)
* [@hpcc-js/wasm-graphviz-cli](../graphviz-cli/README.md)
* [@hpcc-js/wasm-zstd](../zstd/README.md)

## Resource management

The re-exported loaders support `dispose()` and TypeScript `using` declarations (TypeScript 5.2+ with `"ESNext.Disposable"` in `lib`). Leaving the scope is equivalent to calling `X.unload()`:

```ts
import { Graphviz } from "@hpcc-js/wasm";

{
    using graphviz = await Graphviz.load();
    console.log(graphviz.dot("digraph G { Hello -> World }"));
} // Graphviz.unload() runs here
```

Each `load()` returns a shared singleton, so disposing it unloads the module for every caller in the current JavaScript context. Disposing an instance that has already been unloaded does nothing.
