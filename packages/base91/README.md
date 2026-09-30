---
title: Base91
description: WebAssembly wrapper for the Base91 encoding library
outline: deep
---

# @hpcc-js/wasm-base91

<script setup>
import Base91Demo from "../../.vitepress/components/Base91Demo.vue";
</script>

This package provides a WebAssembly wrapper around the [Base91](https://base91.sourceforge.net/) library.  This allows for the encoding and decoding of binary data to a more compact form than Base64.

## Installation

::: code-group
```sh [npm]
npm install @hpcc-js/wasm-base91
```

```sh [yarn]
yarn add @hpcc-js/wasm-base91
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-base91
```
:::

## Quick Start

```typescript
import { Base91 } from "@hpcc-js/wasm-base91";

const base91 = await Base91.load();

const encoded_data = await base91.encode(data);
const decoded_data = await base91.decode(encoded_data);
```

## Try it

<Base91Demo />

## Resource management

`Base91` supports `dispose()` and TypeScript's `using` declarations (TypeScript 5.2+ with `"ESNext.Disposable"` in `lib`). Leaving the scope is equivalent to calling `Base91.unload()`:

```typescript
import { Base91 } from "@hpcc-js/wasm-base91";

{
    using base91 = await Base91.load();
    const encoded_data = base91.encode(data);
    const decoded_data = base91.decode(encoded_data);
} // Base91.unload() runs here
```

`Base91.load()` returns a singleton, so disposing it unloads the module for every caller in the current JavaScript context. Disposing an instance that has already been unloaded does nothing.

<!--@include: ../../docs/base91/src/base91/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/base91/src/base91/classes/Base91.html)
