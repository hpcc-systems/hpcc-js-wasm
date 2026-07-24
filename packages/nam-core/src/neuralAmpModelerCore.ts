// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/nam-core/namcorelib.wasm";
import type { MainModule, CNamModel } from "../types/namcorelib.js";
import { MainModuleEx } from "@hpcc-js/wasm-util";

let g_neuralAmpModelerCore: Promise<NeuralAmpModelerCore> | undefined;

export type NamAudioBuffer = ArrayLike<number>;

export interface LoadModelOptions {
    prewarm?: boolean;
}

interface HeapF64 {
    ptr: number;
    length: number;
    size: number;
}

export class NeuralAmpModel {

    constructor(private readonly _module: MainModule, private readonly _model: CNamModel) {
    }

    expectedSampleRate(): number {
        return this._model.expectedSampleRate();
    }

    inputChannels(): number {
        return this._model.inputChannels();
    }

    outputChannels(): number {
        return this._model.outputChannels();
    }

    maxBufferSize(): number {
        return this._model.maxBufferSize();
    }

    prewarmSamples(): number {
        return this._model.prewarmSamples();
    }

    hasInputLevel(): boolean {
        return this._model.hasInputLevel();
    }

    hasOutputLevel(): boolean {
        return this._model.hasOutputLevel();
    }

    hasLoudness(): boolean {
        return this._model.hasLoudness();
    }

    inputLevel(): number {
        return this._model.inputLevel();
    }

    outputLevel(): number {
        return this._model.outputLevel();
    }

    loudness(): number {
        return this._model.loudness();
    }

    reset(sampleRate: number, maxBufferSize: number): void {
        this._model.reset(sampleRate, maxBufferSize);
    }

    prewarm(): void {
        this._model.prewarm();
    }

    process(input: NamAudioBuffer, frames = input.length / this.inputChannels()): Float32Array {
        const output = this.processFloat64(input, frames);
        return Float32Array.from(output);
    }

    processFloat64(input: NamAudioBuffer, frames = input.length / this.inputChannels()): Float64Array {
        const inputChannels = this.inputChannels();
        const outputChannels = this.outputChannels();

        if (!Number.isInteger(frames) || frames < 0) {
            throw new Error("frames must be a non-negative integer");
        }
        if (input.length !== frames * inputChannels) {
            throw new Error(`input length must equal frames * inputChannels (${frames * inputChannels})`);
        }

        const inputHeap = this.dataToHeapF64(input);
        const outputHeap = this.mallocF64(frames * outputChannels);
        try {
            this._model.process(inputHeap.ptr, outputHeap.ptr, frames);
            return this.heapToFloat64Array(outputHeap);
        } finally {
            this.free(inputHeap);
            this.free(outputHeap);
        }
    }

    delete(): void {
        this._model.delete();
    }

    [Symbol.dispose](): void {
        this.delete();
    }

    private mallocF64(length: number): HeapF64 {
        const size = length * Float64Array.BYTES_PER_ELEMENT;
        return { ptr: this._module._malloc(size), length, size };
    }

    private free(data: HeapF64): void {
        this._module._free(data.ptr);
    }

    private dataToHeapF64(data: NamAudioBuffer): HeapF64 {
        const retVal = this.mallocF64(data.length);
        (this._module as any).HEAPF64.set(data, retVal.ptr / Float64Array.BYTES_PER_ELEMENT);
        return retVal;
    }

    private heapToFloat64Array(data: HeapF64): Float64Array {
        const view = (this._module as any).HEAPF64.subarray(
            data.ptr / Float64Array.BYTES_PER_ELEMENT,
            data.ptr / Float64Array.BYTES_PER_ELEMENT + data.length
        );
        return new Float64Array(view);
    }
}

/**
 * NeuralAmpModelerCore WASM bindings for loading and processing NAM DSP models.
 *
 * ```ts
 * import { NeuralAmpModelerCore } from "@hpcc-js/wasm-nam-core";
 *
 * const nam = await NeuralAmpModelerCore.load();
 * const model = nam.loadModel(modelJson);
 * const output = model.process(inputFrames);
 * model.delete();
 * ```
 */
export class NeuralAmpModelerCore {

    private _mainModule: MainModuleEx<MainModule>;

    private constructor(private readonly _module: MainModule) {
        this._mainModule = new MainModuleEx(_module);
    }

    static load(): Promise<NeuralAmpModelerCore> {
        if (!g_neuralAmpModelerCore) {
            g_neuralAmpModelerCore = (load() as Promise<MainModule>).then((module) => new NeuralAmpModelerCore(module));
        }
        return g_neuralAmpModelerCore;
    }

    static unload(): void {
        reset();
        g_neuralAmpModelerCore = undefined;
    }

    version(): string {
        return this._module.version();
    }

    loadModel(modelJson: string | Uint8Array, options: LoadModelOptions = {}): NeuralAmpModel {
        const json = typeof modelJson === "string" ? modelJson : new TextDecoder().decode(modelJson);
        return new NeuralAmpModel(this._module, new this._module.CNamModel(json, options.prewarm ?? false));
    }
}