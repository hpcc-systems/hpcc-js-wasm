import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";

interface WavData {
    sampleRate: number;
    channels: number;
    samples: Float32Array;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "..", ".vitest-attachments");
const inputWavUrl = "https://raw.githubusercontent.com/tone-3000/neural-amp-modeler-wasm/refs/heads/main/ui/public/inputs/Mayer%20-%20Guitar.wav";
const modelUrl = "https://raw.githubusercontent.com/tone-3000/neural-amp-modeler-wasm/refs/heads/main/ui/public/models/deluxe.nam";
const inputWavPath = join(outputDir, "Mayer - Guitar.in.wav");
const outputWavPath = join(outputDir, "Mayer - Guitar.node.out.wav");
const modelPath = join(outputDir, "deluxe.nam");
const processChunkFrames = 2048;

async function downloadAsset(url: string, path: string): Promise<Buffer> {
    await mkdir(dirname(path), { recursive: true });
    if (existsSync(path)) {
        return readFile(path);
    }

    const response = await fetch(url);
    expect(response.ok).to.equal(true);
    const data = Buffer.from(await response.arrayBuffer());
    await writeFile(path, data);
    return data;
}

function writeWav({ sampleRate, channels, samples }: WavData): Buffer {
    const dataBytes = samples.length * Int16Array.BYTES_PER_ELEMENT;
    const buffer = Buffer.alloc(44 + dataBytes);
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataBytes, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(channels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * channels * Int16Array.BYTES_PER_ELEMENT, 28);
    buffer.writeUInt16LE(channels * Int16Array.BYTES_PER_ELEMENT, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataBytes, 40);

    for (let i = 0; i < samples.length; ++i) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * Int16Array.BYTES_PER_ELEMENT);
    }
    return buffer;
}

function readWav(buffer: Buffer): WavData {
    expect(buffer.toString("ascii", 0, 4)).to.equal("RIFF");
    expect(buffer.toString("ascii", 8, 12)).to.equal("WAVE");

    let offset = 12;
    let sampleRate = 0;
    let channels = 0;
    let bitsPerSample = 0;
    let dataOffset = -1;
    let dataSize = 0;
    while (offset + 8 <= buffer.length) {
        const chunkId = buffer.toString("ascii", offset, offset + 4);
        const chunkSize = buffer.readUInt32LE(offset + 4);
        if (chunkId === "fmt ") {
            expect(buffer.readUInt16LE(offset + 8)).to.equal(1);
            channels = buffer.readUInt16LE(offset + 10);
            sampleRate = buffer.readUInt32LE(offset + 12);
            bitsPerSample = buffer.readUInt16LE(offset + 22);
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
            samples[i] = buffer.readInt16LE(sampleOffset) / 32768;
        } else if (bitsPerSample === 24) {
            const unsigned = buffer.readUIntLE(sampleOffset, bytesPerSample);
            const signed = unsigned & 0x800000 ? unsigned - 0x1000000 : unsigned;
            samples[i] = signed / 8388608;
        } else {
            samples[i] = buffer.readInt32LE(sampleOffset) / 2147483648;
        }
    }
    return { sampleRate, channels, samples };
}

function processWavSamples(model: ReturnType<NeuralAmpModelerCore["loadModel"]>, inputWav: WavData): Float32Array {
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

describe("nam-core", function () {

    it("version", async function () {
        const nam = await NeuralAmpModelerCore.load();
        expect(await NeuralAmpModelerCore.load()).to.equal(nam);
        expect(nam.version()).to.match(/^\d+\.\d+\.\d+$/);
        NeuralAmpModelerCore.unload();
    });

    it("reports invalid model JSON", async function () {
        const nam = await NeuralAmpModelerCore.load();
        expect(() => nam.loadModel("{}", { prewarm: false })).to.throw();
        NeuralAmpModelerCore.unload();
    });

    it("renders a guitar riff wav through an amp model", async function () {
        const inputWav = readWav(await downloadAsset(inputWavUrl, inputWavPath));
        const nam = await NeuralAmpModelerCore.load();
        const model = nam.loadModel(await downloadAsset(modelUrl, modelPath), { prewarm: false });
        try {
            const outputSamples = processWavSamples(model, inputWav);
            await writeFile(outputWavPath, writeWav({
                sampleRate: inputWav.sampleRate,
                channels: model.outputChannels(),
                samples: outputSamples
            }));

            const outputWav = readWav(await readFile(outputWavPath));
            expect(outputWav.channels).to.equal(model.outputChannels());
            expect(outputWav.sampleRate).to.equal(inputWav.sampleRate);
            expect(outputWav.samples.length).to.equal(inputWav.samples.length * model.outputChannels());
            expect(outputWav.samples.some(sample => Math.abs(sample) > 0.0001)).to.equal(true);
        } finally {
            model.delete();
            NeuralAmpModelerCore.unload();
        }
    });
});