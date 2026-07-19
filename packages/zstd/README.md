---
title: Zstd
description: WebAssembly wrapper for the Zstandard compression library
outline: deep
---

# @hpcc-js/wasm-zstd

This package provides a WebAssembly wrapper around the [Zstandard](https://facebook.github.io/zstd/) library. This provides efficient compression and decompression of data.

## Installation

::: code-group

```sh [npm]
npm install @hpcc-js/wasm-zstd
```

```sh [yarn]
yarn add @hpcc-js/wasm-zstd
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-zstd
```

:::

## One-shot usage

```typescript
import { Zstd } from "@hpcc-js/wasm-zstd";

const zstd = await Zstd.load();

//  Generate some "data"
const data = new Uint8Array(Array.from({ length: 100000 }, (_, i) => i % 256));

const compressed_data = zstd.compress(data);
const decompressed_data = zstd.decompress(compressed_data);
```

`decompress()` uses a fast path when the frame records its content size. Frames with unknown content size (streaming compressors, stdin, many network streams) automatically fall back to the safe streaming decoder—no output-size guessing is required.

## Streaming compression

```typescript
import { Zstd } from "@hpcc-js/wasm-zstd";

const zstd = await Zstd.load();
zstd.resetCompression(3);

const parts: Uint8Array[] = [];
parts.push(zstd.compressChunk(chunk1)); // may be empty while Zstd buffers input
parts.push(zstd.compressChunk(chunk2));
parts.push(zstd.compressEnd());
```

## Streaming decompression

```typescript
import { Zstd } from "@hpcc-js/wasm-zstd";

const zstd = await Zstd.load();
zstd.resetDecompression();

const parts: Uint8Array[] = [];
parts.push(zstd.decompressChunk(compressedChunk1)); // may be empty
parts.push(zstd.decompressChunk(compressedChunk2));
zstd.decompressEnd(); // throws if the final frame is truncated
```

Call `decompressEnd()` after the last chunk. Intermediate empty output is valid and does **not** mean the frame is complete. Corrupt or truncated input throws an `Error` that includes the operation name and Zstandard error name when available.

## Workers

Use the default package entry from browser module workers or Node.js worker threads. The WASM payload is embedded in the bundled JavaScript, so there is no separate `.wasm` file to copy or URL to pass to `Zstd.load()`.

### Browser module worker

```typescript [worker.ts]
import { Zstd } from "@hpcc-js/wasm-zstd";

self.onmessage = async function (e: MessageEvent<Uint8Array>) {
  const zstd = await Zstd.load();
  const compressed = zstd.compress(e.data);
  const decompressed = zstd.decompress(compressed);

  self.postMessage(decompressed);
};
```

```typescript [main.ts]
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

worker.onmessage = function (e: MessageEvent<Uint8Array>) {
  console.log(e.data);
};

worker.postMessage(data);
```

### Node.js worker thread

```javascript [worker.js]
import { parentPort } from "node:worker_threads";
import { Zstd } from "@hpcc-js/wasm-zstd";

parentPort?.on("message", async function (data) {
  const zstd = await Zstd.load();
  const compressed = zstd.compress(data);
  const decompressed = zstd.decompress(compressed);

  parentPort?.postMessage(decompressed);
});
```

```typescript [main.ts]
import { Worker } from "node:worker_threads";

const worker = new Worker(new URL("./worker.js", import.meta.url));

worker.on("message", function (data: Uint8Array) {
  console.log(data);
});

worker.postMessage(data);
```

## Singleton / serialization warning

`Zstd.load()` returns a singleton within the current JavaScript context. Compression and decompression contexts are stateful. Callers must serialize streaming operations on the shared instance—do not interleave concurrent streams on the same `Zstd` object. Prefer `resetCompression()` / `resetDecompression()` over the legacy `reset()` so one context is not cleared accidentally with the other.

<!--@include: ../../docs/zstd/src/zstd/README.md-->

## Reference

- [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/zstd/src/zstd/classes/Zstd.html)
