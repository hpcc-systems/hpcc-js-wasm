---
title: WIT Bindgen
description: WebAssembly wrapper for the Rust wit-bindgen generators
outline: deep
---

# @hpcc-js/wasm-wit-bindgen

This package provides a WebAssembly wrapper around the Rust [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen) libraries.  It can validate [WIT](https://component-model.bytecodealliance.org/design/wit.html) (WebAssembly Interface Type) documents, inspect them, and generate language bindings (Rust, C, C++, C#, Go, MoonBit and Markdown) in browsers and Node.js.

## Installation

::: code-group

```sh [npm]
npm install @hpcc-js/wasm-wit-bindgen
```

```sh [yarn]
yarn add @hpcc-js/wasm-wit-bindgen
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-wit-bindgen
```

:::

## Validation

```typescript
import { WitBindgen } from "@hpcc-js/wasm-wit-bindgen";

const witBindgen = await WitBindgen.load();

const wit = `package example:test;

world test-world {
    export greet: func(name: string) -> string;
}`;

witBindgen.validate(wit);          // true
witBindgen.validateDetailed(wit);  // { valid: true }
witBindgen.extractInterfaces(wit); // []
```

WIT that references other files can be validated by supplying the files:

```typescript
witBindgen.validate(main, { sourcePath: "/a.wit", sourceFiles: { "/a.wit": main, "/b.wit": other } });
```

## Generating bindings

```typescript
const files = witBindgen.generateBindings(wit, "rust");

for (const [name, content] of Object.entries(files)) {
    // content is a Uint8Array, safe for both text and binary outputs
    console.log(name, new TextDecoder().decode(content));
}
```

Supported languages: `rust`, `c`, `cpp` (`c++`), `csharp` (`c#`), `go`, `moonbit` and `markdown` (`md`).

## Generating TypeScript

TypeScript declaration files (`.d.ts`) are produced with [jco](https://github.com/bytecodealliance/jco) rather than the Rust generators, so this is **Node.js only** and requires the optional peer dependency:

```sh
npm install @bytecodealliance/jco
```

```typescript
// Types for implementing the world ("guest", the default)
const guest = await witBindgen.generateTypeScript(wit);

// Types for consuming a component built from the world
const host = await witBindgen.generateTypeScript(wit, { mode: "host", worldName: "test-world" });

// From disk, resolving deps/ directories
const files = await witBindgen.generateTypeScriptFromPath("./wit", { mode: "guest" });
```

## Building from source

The component is written in Rust (`src-rs/`), compiled to a WebAssembly component with [wasm-tools](https://github.com/bytecodealliance/wasm-tools) and transpiled to JavaScript with [jco](https://github.com/bytecodealliance/jco).  It requires `cargo`, the `wasm32-unknown-unknown` target and `wasm-tools` (installed by `npm run install-build-deps`):

```sh
npm run build-rs   # from the repository root, or from packages/wit-bindgen
npm run build
npm test           # cargo test + vitest (node and browser)
```

`npm run update` (and `update-major`) bumps both the npm dependencies and the Rust crates (`update-rs` / `update-rs-major`), then syncs the matching `wasm-tools` version in `scripts/rs-install.sh` and the versions listed in the root README.

<!--@include: ../../docs/wit-bindgen/src/wit-bindgen/README.md-->

## Reference

- [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/wit-bindgen/src/wit-bindgen/classes/WitBindgen.html)
