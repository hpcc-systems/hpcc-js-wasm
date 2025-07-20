[**@hpcc-js/wasm-root**](../../../../README.md)

***

# Class: Llama

Defined in: [llama/src/llama.ts:27](https://github.com/GordonSmith/hpcc-js-wasm/blob/10467e7b89384555d9ecd41bd4f60b5c63687e4a/packages/llama/src/llama.ts#L27)

The llama WASM library, provides a simplified wrapper around the llama.cpp library.

See [llama.cpp](https://github.com/ggerganov/llama.cpp) for more details.

```ts
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";

let llama = await Llama.load();
const model = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";
const webBlob: Blob = await WebBlob.create(new URL(model));

const data: ArrayBuffer = await webBlob.arrayBuffer();

const embeddings = llama.embedding("Hello and Welcome!", new Uint8Array(data));
```

## Methods

### load()

> `static` **load**(): `Promise`\<`Llama`\>

Defined in: [llama/src/llama.ts:41](https://github.com/GordonSmith/hpcc-js-wasm/blob/10467e7b89384555d9ecd41bd4f60b5c63687e4a/packages/llama/src/llama.ts#L41)

Compiles and instantiates the raw wasm.

::: info
In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
:::

#### Returns

`Promise`\<`Llama`\>

A promise to an instance of the Llama class.

***

### unload()

> `static` **unload**(): `void`

Defined in: [llama/src/llama.ts:50](https://github.com/GordonSmith/hpcc-js-wasm/blob/10467e7b89384555d9ecd41bd4f60b5c63687e4a/packages/llama/src/llama.ts#L50)

Unloades the compiled wasm instance.

#### Returns

`void`

***

### version()

> **version**(): `string`

Defined in: [llama/src/llama.ts:57](https://github.com/GordonSmith/hpcc-js-wasm/blob/10467e7b89384555d9ecd41bd4f60b5c63687e4a/packages/llama/src/llama.ts#L57)

#### Returns

`string`

The Llama c++ version

***

### embedding()

> **embedding**(`text`, `model`, `format`): `number`[][]

Defined in: [llama/src/llama.ts:69](https://github.com/GordonSmith/hpcc-js-wasm/blob/10467e7b89384555d9ecd41bd4f60b5c63687e4a/packages/llama/src/llama.ts#L69)

Calculates the vector representation of the input text.

#### Parameters

##### text

`string`

The input text.

##### model

`Uint8Array`

The model to use for the embedding.

##### format

`string` = `"array"`

#### Returns

`number`[][]

The embedding of the text using the model.
