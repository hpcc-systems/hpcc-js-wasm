---
title: Base91
description: WebAssembly wrapper for the Base91 encoding library
outline: deep
---

# @hpcc-js/wasm-base91

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

<!--@include: ../../docs/base91/src/base91/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/base91/src/base91/classes/Base91.html)
