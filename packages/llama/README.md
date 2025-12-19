---
title: Llama
description: WebAssembly wrapper for llama.cpp AI models
outline: deep
---

# @hpcc-js/wasm-llama

## Installation

::: code-group
```sh [npm]
npm install @hpcc-js/wasm-llama
```

```sh [yarn]
yarn add @hpcc-js/wasm-llama
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-llama
```
:::

## Quick Start

```typescript
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";

let llama = await Llama.load();
const model = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";
const webBlob: Blob = await WebBlob.create(new URL(model));

const data: ArrayBuffer = await webBlob.arrayBuffer();

const embeddings = llama.embedding("Hello and Welcome!", new Uint8Array(data));
```

<!--@include: ../../docs/llama/src/llama/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/llama/src/llama/classes/llama.html)
