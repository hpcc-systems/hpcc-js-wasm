---
title: Graphviz
description: WebAssembly wrapper for the Graphviz graph visualization library
outline: deep
---

# @hpcc-js/wasm-graphviz

This package provides a WebAssembly wrapper around the [Graphviz](https://www.graphviz.org/) library.  This allows for the rendering of DOT language graphs directly within a browser or NodeJS type environment.

## Installation

::: code-group
```sh [npm]
npm install @hpcc-js/wasm-graphviz
```

```sh [yarn]
yarn add @hpcc-js/wasm-graphviz
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-graphviz
```
:::

## Quick Start

```typescript
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const graphviz = await Graphviz.load();
const svg = graphviz.dot(`digraph { a -> b; }`);
document.body.innerHTML = svg;
```

<!--@include: ../../docs/graphviz/src/graphviz/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/graphviz/src/graphviz/classes/Graphviz.html)
