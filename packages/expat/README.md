---
title: Expat
description: WebAssembly wrapper for the libexpat XML parser
outline: deep
---

# @hpcc-js/wasm-expat

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

<!--@include: ../../docs/expat/src/expat/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/expat/src/expat/classes/Expat.html)
