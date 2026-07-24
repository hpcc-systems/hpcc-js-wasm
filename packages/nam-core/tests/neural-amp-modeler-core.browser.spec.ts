import { describe, expect, it } from "vitest";
import { commands } from "vitest/browser";
import { NeuralAmpModel, NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";

interface WavData {
    sampleRate: number;
    channels: number;
    samples: Float32Array;
}

const inputWavUrl = "https://raw.githubusercontent.com/tone-3000/neural-amp-modeler-wasm/refs/heads/main/ui/public/inputs/Mayer%20-%20Guitar.wav";
const modelUrl = "https://raw.githubusercontent.com/tone-3000/neural-amp-modeler-wasm/refs/heads/main/ui/public/models/deluxe.nam";
const browserOutputPath = ".vitest-attachments/Mayer - Guitar.browser.out.wav";
const processChunkFrames = 2048;

interface NeuralAmpModelerCoreBrowserCommands {
    saveBinaryFile(path: string, base64: string): Promise<void>;
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    expect(response.ok).to.equal(true);
    return response.arrayBuffer();
}

function ascii(view: DataView, offset: number, length: number): string {
    let retVal = "";
    for (let i = 0; i < length; ++i) {
        retVal += String.fromCharCode(view.getUint8(offset + i));
    }
    return retVal;
}

function readWav(buffer: ArrayBuffer): WavData {
    const view = new DataView(buffer);
    expect(ascii(view, 0, 4)).to.equal("RIFF");
    expect(ascii(view, 8, 4)).to.equal("WAVE");

    let offset = 12;
    let sampleRate = 0;
    let channels = 0;
    let bitsPerSample = 0;
    let dataOffset = -1;
    let dataSize = 0;
    while (offset + 8 <= buffer.byteLength) {
        const chunkId = ascii(view, offset, 4);
        const chunkSize = view.getUint32(offset + 4, true);
        if (chunkId === "fmt ") {
            expect(view.getUint16(offset + 8, true)).to.equal(1);
            channels = view.getUint16(offset + 10, true);
            sampleRate = view.getUint32(offset + 12, true);
            bitsPerSample = view.getUint16(offset + 22, true);
        } else if (chunkId === "data") {
            dataOffset = offset + 8;
            dataSize = chunkSize;
            break;
        }
        offset += 8 + chunkSize + (chunkSize % 2);
    }

    expect(dataOffset).to.be.greaterThan(0);
    expect([16, 24, 32]).to.include(bitsPerSample);
    const bytesPerSample = bitsPerSample / 8;
    const samples = new Float32Array(dataSize / bytesPerSample);
    for (let i = 0; i < samples.length; ++i) {
        const sampleOffset = dataOffset + i * bytesPerSample;
        if (bitsPerSample === 16) {
            samples[i] = view.getInt16(sampleOffset, true) / 32768;
        } else if (bitsPerSample === 24) {
            const unsigned = view.getUint8(sampleOffset) |
                (view.getUint8(sampleOffset + 1) << 8) |
                (view.getUint8(sampleOffset + 2) << 16);
            const signed = unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
            samples[i] = signed / 8388608;
        } else {
            samples[i] = view.getInt32(sampleOffset, true) / 2147483648;
        }
    }
    return { sampleRate, channels, samples };
}

function writeWav({ sampleRate, channels, samples }: WavData): Blob {
    const dataBytes = samples.length * Int16Array.BYTES_PER_ELEMENT;
    const buffer = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(buffer);
    const writeAscii = (offset: number, value: string) => {
        for (let i = 0; i < value.length; ++i) {
            view.setUint8(offset + i, value.charCodeAt(i));
        }
    };

    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * Int16Array.BYTES_PER_ELEMENT, true);
    view.setUint16(32, channels * Int16Array.BYTES_PER_ELEMENT, true);
    view.setUint16(34, 16, true);
    writeAscii(36, "data");
    view.setUint32(40, dataBytes, true);

    for (let i = 0; i < samples.length; ++i) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(44 + i * Int16Array.BYTES_PER_ELEMENT, Math.round(sample * 32767), true);
    }
    return new Blob([buffer], { type: "audio/wav" });
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        for (let j = 0; j < chunk.length; ++j) {
            binary += String.fromCharCode(chunk[j]);
        }
    }
    return btoa(binary);
}

async function saveBrowserOutput(blob: Blob): Promise<void> {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await (commands as typeof commands & NeuralAmpModelerCoreBrowserCommands).saveBinaryFile(browserOutputPath, bytesToBase64(bytes));
}

function processWavSamples(model: NeuralAmpModel, inputWav: WavData): Float32Array {
    expect(inputWav.channels).to.equal(model.inputChannels());
    model.reset(inputWav.sampleRate, processChunkFrames);

    const outputChannels = model.outputChannels();
    const inputChannels = model.inputChannels();
    const frames = inputWav.samples.length / inputChannels;
    const outputSamples = new Float32Array(frames * outputChannels);
    let outputOffset = 0;

    for (let frame = 0; frame < frames; frame += processChunkFrames) {
        const chunkFrames = Math.min(processChunkFrames, frames - frame);
        const inputStart = frame * inputChannels;
        const inputEnd = inputStart + chunkFrames * inputChannels;
        const chunk = model.process(inputWav.samples.subarray(inputStart, inputEnd), chunkFrames);
        outputSamples.set(chunk, outputOffset);
        outputOffset += chunk.length;
    }

    return outputSamples;
}

function downloadOutput(blob: Blob): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "Mayer - Guitar.nam.out.wav";
    document.body.append(anchor);
    anchor.click();
    return anchor;
}

describe("nam-core browser", function () {

    it("downloads a processed guitar wav", async function () {
        const [inputBuffer, modelBuffer] = await Promise.all([
            fetchArrayBuffer(inputWavUrl),
            fetchArrayBuffer(modelUrl)
        ]);
        const inputWav = readWav(inputBuffer);
        const nam = await NeuralAmpModelerCore.load();
        const model = nam.loadModel(new Uint8Array(modelBuffer), { prewarm: false });
        let anchor: HTMLAnchorElement | undefined;
        try {
            const outputSamples = processWavSamples(model, inputWav);
            const outputBlob = writeWav({
                sampleRate: inputWav.sampleRate,
                channels: model.outputChannels(),
                samples: outputSamples
            });
            await saveBrowserOutput(outputBlob);
            anchor = downloadOutput(outputBlob);

            expect(outputBlob.size).to.be.greaterThan(44);
            expect(await commands.readFile(browserOutputPath, "base64")).to.equal(bytesToBase64(new Uint8Array(await outputBlob.arrayBuffer())));
            expect(anchor.download).to.equal("Mayer - Guitar.nam.out.wav");
            expect(anchor.href.startsWith("blob:")).to.equal(true);
            expect(outputSamples.some(sample => Math.abs(sample) > 0.0001)).to.equal(true);
        } finally {
            if (anchor) {
                URL.revokeObjectURL(anchor.href);
                anchor.remove();
            }
            model.delete();
            NeuralAmpModelerCore.unload();
        }
    }, 180_000);
});