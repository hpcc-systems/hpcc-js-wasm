---
title: Expat
description: WebAssembly wrapper for the libexpat XML parser
outline: deep
---

# @hpcc-js/wasm-expat

<script setup>
import ExpatDemo from "../../.vitepress/components/ExpatDemo.vue";
</script>

This package provides a WebAssembly wrapper around the [libexpat](https://libexpat.github.io/) library.  This provides efficent SAX XML parsing.

## Installation

::: code-group
```sh [npm]
npm install @hpcc-js/wasm-expat
```

```sh [yarn]
yarn add @hpcc-js/wasm-expat
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-expat
```
:::

## Usage

```typescript
import { Expat } from "@hpcc-js/wasm-expat";

const expat = await Expat.load();

const xml = ` \
    <root>
        <child xxx="yyy">content</child>
    </root>
`;

const callback = {
    startElement(tag, attrs) { console.log("start", tag, attrs); },
    endElement(tag) { console.log("end", tag); },
    characterData(content) { console.log("characterData", content); }
};

expat.parse(xml, callback);
```

## Try it

<ExpatDemo />

## Resource management

`Expat` supports `dispose()` and TypeScript's `using` declarations (TypeScript 5.2+ with `"ESNext.Disposable"` in `lib`). Leaving the scope is equivalent to calling `Expat.unload()`:

```typescript
import { Expat, StackParser } from "@hpcc-js/wasm-expat";

{
    using expat = await Expat.load();
    const parser = new StackParser();
    expat.parse(xml, parser);
} // Expat.unload() runs here
```

`Expat.load()` returns a singleton, so disposing it unloads the module for every caller in the current JavaScript context. Disposing an instance that has already been unloaded does nothing.

<!--@include: ../../docs/expat/src/expat/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/expat/src/expat/classes/Expat.html)
