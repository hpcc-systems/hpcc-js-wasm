# @hpcc-js/wasm - Version 3

[![Test PR](https://github.com/hpcc-systems/hpcc-js-wasm/actions/workflows/test-pr.yml/badge.svg?branch=release-please--branches--trunk)](https://github.com/hpcc-systems/hpcc-js-wasm/actions/workflows/test-pr.yml)
[![release-please](https://github.com/hpcc-systems/hpcc-js-wasm/actions/workflows/release-please.yml/badge.svg)](https://github.com/hpcc-systems/hpcc-js-wasm/actions/workflows/release-please.yml)
[![Coverage Status](https://coveralls.io/repos/github/hpcc-systems/hpcc-js-wasm/badge.svg?branch=BUMP_VERSIONS)](https://coveralls.io/github/GordonSmith/hpcc-js-wasm?branch=BUMP_VERSIONS)

This repository contains a collection of useful c++ libraries compiled to WASM for (re)use in Node JS, Web Browsers and JavaScript Libraries:
- [base91](https://base91.sourceforge.net/) - v0.6.0
- [duckdb](https://github.com/duckdb/duckdb) - v1.4.0
- [expat](https://libexpat.github.io/) - v2.7.1
- [graphviz](https://www.graphviz.org/) - 14.1.0
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - b3718
- [zstd](https://github.com/facebook/zstd) - v1.5.7
- ...more to follow...

Built with:
- [emsdk](https://github.com/emscripten-core/emsdk) - v4.0.21

## Homepage and Documents

* [Homepage](https://hpcc-systems.github.io/hpcc-js-wasm/)
    * [Base91](https://hpcc-systems.github.io/hpcc-js-wasm/base91/src/base91/classes/Base91.html)
    * [DuckDB](https://hpcc-systems.github.io/hpcc-js-wasm/duckdb/src/duckdb/classes/DuckDB.html)
    * [Expat](https://hpcc-systems.github.io/hpcc-js-wasm/expat/src/expat/classes/Expat.html)
    * [Graphviz](https://hpcc-systems.github.io/hpcc-js-wasm/graphviz/src/graphviz/classes/Graphviz.html)
    * [Llama](https://hpcc-systems.github.io/hpcc-js-wasm/llama/src/llama/classes/Llama.html)
    * [Zstd](https://hpcc-systems.github.io/hpcc-js-wasm/zstd/src/zstd/classes/Zstd.html)

## AI Assistant / Copilot Instructions

This repository includes comprehensive instructions for AI assistants and GitHub Copilot:

* [Main Instructions](.github/instructions/main.md) - Repository overview and architecture
* [Development Workflow](.github/instructions/workflow.md) - Step-by-step development processes
* [Package Patterns](.github/instructions/patterns.md) - Common patterns and quick reference
* [Troubleshooting Guide](.github/instructions/troubleshooting.md) - Debugging and problem resolution
* Package-specific guides in `packages/*/` directories

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

## Build Instructions

The following instructions are for building the entire repository from scratch.  In general the instructions assume you are running from within a bash terminal.

* Windows (With WSL2 and Git Bash installed) 
* Linux (native or WSL2)
* MacOS 
* Docker

## Pre-requisites

To get an idea of what pre-requisites are required, please see the following files:

* [Dockerfile](docker/ubuntu-dev.dockerfile)
* [GH Action Ubuntu](.github/workflows/test-pr.yml)
* NodeJS

## Steps (Docker)

```bash
git clone https://github.com/hpcc-systems/hpcc-js-wasm.git
cd hpcc-js-wasm
npm ci
npm run build-docker
```

## Steps (Windows, Linux, MacOS)

```bash
git clone https://github.com/hpcc-systems/hpcc-js-wasm.git
cd hpcc-js-wasm
npm ci
npm run install-build-deps
npm run build
```
