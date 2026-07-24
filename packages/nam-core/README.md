---
title: NAM-Core
description: WebAssembly wrapper for Neural Amp Modeler DSP models
outline: deep
---

# @hpcc-js/wasm-nam-core

This package provides a WebAssembly wrapper around [NeuralAmpModelerCore](https://github.com/sdatkinson/NeuralAmpModelerCore), the core DSP library used by Neural Amp Modeler plugins. It loads `.nam` model JSON and processes interleaved audio buffers in Node.js or the browser.

## Installation

::: code-group

```sh [npm]
npm install @hpcc-js/wasm-nam-core
```

```sh [yarn]
yarn add @hpcc-js/wasm-nam-core
```

```sh [pnpm]
pnpm add @hpcc-js/wasm-nam-core
```

:::

## Quick Start

```typescript
import { NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";

const nam = await NeuralAmpModelerCore.load();
const modelBytes = await fetch("/models/deluxe.nam").then(response => response.bytes());
const model = nam.loadModel(modelBytes, { prewarm: false });

try {
  const sampleRate = model.expectedSampleRate() > 0 ? model.expectedSampleRate() : 48000;
  const maxBufferSize = 2048;
  model.reset(sampleRate, maxBufferSize);

  const input = new Float32Array(maxBufferSize * model.inputChannels());
  const output = model.process(input, maxBufferSize);

  console.log(output.length);
} finally {
  model.delete();
  NeuralAmpModelerCore.unload();
}
```

## Processing Audio

`NeuralAmpModel.process()` accepts interleaved floating-point samples in the range `[-1, 1]` and returns interleaved `Float32Array` output. For long files, process in chunks and call `reset(sampleRate, maxBufferSize)` with the largest chunk size you plan to pass.

```typescript
const chunkFrames = 2048;
model.reset(sampleRate, chunkFrames);

const output = new Float32Array(totalFrames * model.outputChannels());
let outputOffset = 0;

for (let frame = 0; frame < totalFrames; frame += chunkFrames) {
  const frames = Math.min(chunkFrames, totalFrames - frame);
  const inputStart = frame * model.inputChannels();
  const inputEnd = inputStart + frames * model.inputChannels();
  const chunk = model.process(inputSamples.subarray(inputStart, inputEnd), frames);
  output.set(chunk, outputOffset);
  outputOffset += chunk.length;
}
```

## Browser Example

The browser build embeds the WASM payload in the JavaScript bundle, so there is no separate `.wasm` file to host.

```typescript
import { NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";

const [modelBytes, inputBytes] = await Promise.all([
  fetch("/models/deluxe.nam").then(response => response.bytes()),
  fetch("/inputs/guitar.wav").then(response => response.arrayBuffer())
]);

const nam = await NeuralAmpModelerCore.load();
const model = nam.loadModel(modelBytes, { prewarm: false });

// Decode the WAV to interleaved Float32 samples, process in chunks, then encode
// the result back to WAV for playback or download.
```

## Live Audio Processing (Browser)

Use the Web Audio graph to stream microphone input through a NAM model in real time.

```typescript
import { NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";

const nam = await NeuralAmpModelerCore.load();
const modelBytes = await fetch("/models/deluxe.nam").then(r => r.bytes());
const model = nam.loadModel(modelBytes, { prewarm: false });

const bufferSize = 1024;
const context = new AudioContext({ latencyHint: "interactive" });
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false
  }
});

const source = context.createMediaStreamSource(stream);
const processor = context.createScriptProcessor(bufferSize, source.channelCount, 2);

model.reset(context.sampleRate, bufferSize);
model.prewarm();

processor.onaudioprocess = event => {
  const frames = event.inputBuffer.length;
  const inputChannels = model.inputChannels();
  const outputChannels = model.outputChannels();
  const input = new Float32Array(frames * inputChannels);

  for (let f = 0; f < frames; ++f) {
    for (let c = 0; c < inputChannels; ++c) {
      const src = Math.min(c, event.inputBuffer.numberOfChannels - 1);
      input[f * inputChannels + c] = event.inputBuffer.getChannelData(src)[f];
    }
  }

  const output = model.process(input, frames);
  for (let c = 0; c < event.outputBuffer.numberOfChannels; ++c) {
    const ch = event.outputBuffer.getChannelData(c);
    const src = outputChannels === 1 ? 0 : Math.min(c, outputChannels - 1);
    for (let f = 0; f < frames; ++f) {
      ch[f] = output[f * outputChannels + src];
    }
  }
};

source.connect(processor);
processor.connect(context.destination);
if (context.state === "suspended") {
  await context.resume();
}
```

For best stability:

- Start at 1024-frame blocks, then tune downward only if your target device remains stable.
- Re-run `model.reset(sampleRate, maxBufferSize)` when device sample rate or block size changes.
- Call `model.prewarm()` before connecting to speakers to reduce startup spikes.
- Prefer AudioWorklet in production paths for lower jitter than ScriptProcessorNode.

Cleanup when stopping:

```typescript
processor.disconnect();
source.disconnect();
stream.getTracks().forEach(track => track.stop());
await context.close();
model.delete();
NeuralAmpModelerCore.unload();
```

## Memory Management

`NeuralAmpModelerCore.load()` returns a singleton for the current JavaScript context. Each loaded model owns a WASM-side DSP instance; call `model.delete()` when finished, or use TypeScript explicit resource management where available.

## Reference

- [NeuralAmpModelerCore project](https://github.com/sdatkinson/NeuralAmpModelerCore)
- [API Documentation](https://hpcc-systems.github.io/hpcc-js-wasm/docs/nam-core/src/neuralAmpModelerCore/classes/NeuralAmpModelerCore.html)