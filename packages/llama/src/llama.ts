// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/llama/llamalib.wasm";
import type { MainModule } from "../types/llamalib.js";
import llamaMeta from "../../../vcpkg-overlays/llama-cpp/vcpkg.json" with { type: "json" };

//  Ref:  https://github.com/ggerganov/llama.cpp
//  Ref:  http://facebook.github.io/llama/llama_manual.html
//  Ref:  https://github.com/facebook/llama

/**
 * The llama WASM library, provides a simplified wrapper around the llama.cpp library.
 * 
 * See [llama.cpp](https://github.com/ggerganov/llama.cpp) for more details.
 * 
 * ```ts
 * import { Llama, WebBlob } from "@hpcc-js/wasm-llama";
 * 
 * let llama = await Llama.load();
 * const model = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";
 * const webBlob: Blob = await WebBlob.create(new URL(model));
 * 
 * const data: ArrayBuffer = await webBlob.arrayBuffer();
 * 
 * const embeddings = llama.embedding("Hello and Welcome!", new Uint8Array(data));
 * ```
 */
export class Llama {

    private _module: MainModule;

    private constructor(_module: MainModule) {
        this._module = _module;
    }

    private logRedirectedOutputFiles(fileNames: string[] = ["error.txt", "output.txt"]) {
        const fs: any = (this._module as any).FS;
        for (const fileName of fileNames) {
            try {
                const txt = fs?.readFile?.(fileName, { encoding: "utf8" });
                if (txt) console.error(txt);
            } catch (_err) {
                void _err;
            }
        }
    }

    /**
     * Compiles and instantiates the raw wasm.
     * 
     * ::: info
     * In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing `load` to be asynchronous;
     * :::
     * 
     * @returns A promise to an instance of the Llama class.
     */
    static load(): Promise<Llama> {
        return load().then((module: any) => {
            return new Llama(module);
        });
    }

    /**
     * Unloades the compiled wasm instance.
     */
    static unload() {
        reset();
    }

    /**
     * @returns The Llama c++ version
     */
    version(): string {
        return llamaMeta.version;
    }

    /**
     * Calculates the vector representation of the input text.
     * 
     * @param text The input text.
     * @param model The model to use for the embedding.
     * 
     * @returns The embedding of the text using the model.
     */
    embedding(text: string, model: Uint8Array, format: string = "array"): number[][] {
        try {
            this._module.FS_createDataFile("/", "embeddingModel.gguf", model, true, false, false);
        } catch (e) {
            console.error(e);
        }
        const args = new this._module.VectorString();
        args.push_back("-m"); args.push_back("/embeddingModel.gguf");
        args.push_back("--pooling"); args.push_back("mean");
        args.push_back("--log-disable");
        args.push_back("-p"); args.push_back(text);
        args.push_back("--embd-output-format"); args.push_back(format);
        const embeddingResult = new this._module.VectorString();
        let retVal: number[][] = [];
        try {
            const rc = this._module.embedding(args, embeddingResult);
            const stdout = embeddingResult.get(0) ?? "";
            const stderr = embeddingResult.get(1) ?? "";
            if (rc !== 0) {
                throw new Error(stderr || "llama.embedding failed");
            }
            retVal = JSON.parse(stdout || "[]");
        } catch (e) {
            console.error(e);
            // If the call aborted before returning, the embind out-params are not available.
            // Try to read the redirected output files for a useful error message.
            this.logRedirectedOutputFiles();
        } finally {
            embeddingResult.delete();
            args.delete();
            this._module.FS_unlink("/embeddingModel.gguf");
        }
        return retVal;
    }
}
