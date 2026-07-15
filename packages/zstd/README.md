---
title: Zstd
description: WebAssembly wrapper for the Zstandard compression library
outline: deep
---

# @hpcc-js/wasm-zstd

This package provides a WebAssembly wrapper around the [Zstandard](https://facebook.github.io/zstd/) library.  This provides efficient compression and decompression of data.

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

## Singleton / serialization warning

`Zstd.load()` returns a process-wide singleton. Compression and decompression contexts are stateful. Callers must serialize streaming operations on the shared instance—do not interleave concurrent streams on the same `Zstd` object. Prefer `resetCompression()` / `resetDecompression()` over the legacy `reset()` so one context is not cleared accidentally with the other.

## External WASM (Workers)

The default entry embeds WASM in JavaScript. For Workers (or any consumer that wants a separately cacheable asset):

### Module Worker / ESM

```typescript
import { Zstd } from "@hpcc-js/wasm-zstd/external";

const zstd = await Zstd.load({
    wasmUrl: new URL("zstdlib.wasm", self.location.href)
});
```

### Classic Worker (`importScripts`)

```javascript
importScripts("external.umd.js"); // @hpcc-js/wasm-zstd/external/umd

const { Zstd } = self.hpccWasmZstdExternal;
const zstd = await Zstd.load({
    wasmUrl: new URL("zstdlib.wasm", self.location.href)
});
```

Copy `zstdlib.wasm` next to your Worker script (exported as `@hpcc-js/wasm-zstd/zstdlib.wasm`). The external entry fetches that URL once per singleton load and does not embed a Base91/Base64 WASM payload. In Node.js, prefer the default embedded entry, or pass `{ wasmBinary }` if you already read the `.wasm` file from disk.

<!--@include: ../../docs/zstd/src/zstd/README.md-->

## Reference

* [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/zstd/src/zstd/classes/Zstd.html)
