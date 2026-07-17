// @ts-expect-error importing from a wasm file is resolved via a custom esbuild plugin
import load, { reset } from "../../../build/packages/llama/llamalib.wasm";
import type { MainModule } from "../types/llamalib.js";
import llamaMeta from "../../../vcpkg-overlays/llama-cpp/vcpkg.json" with { type: "json" };

//  Ref:  https://github.com/ggerganov/llama.cpp
//  Ref:  http://facebook.github.io/llama/llama_manual.html
//  Ref:  https://github.com/facebook/llama

export interface LlamaMainResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

export interface LlamaChatOptions {
    systemPrompt?: string;
    chatTemplate?: string;
    jinja?: boolean;
    conversation?: boolean;
    args?: string[];
}

export type LlamaChatRole = "system" | "user" | "assistant";

export interface LlamaChatMessage {
    role: LlamaChatRole;
    content: string;
}

export interface LlamaChatSessionOptions {
    systemPrompt?: string;
    messages?: LlamaChatMessage[];
    promptBuilder?: (messages: LlamaChatMessage[]) => string;
    args?: string[];
}

export class LlamaChatSession {

    private _messages: LlamaChatMessage[];
    private _baseMessages: LlamaChatMessage[];

    constructor(
        private readonly _llama: Llama,
        private readonly _model: Uint8Array,
        private readonly _options: LlamaChatSessionOptions = {}
    ) {
        this._baseMessages = [];
        if (_options.systemPrompt) {
            this._baseMessages.push({ role: "system", content: _options.systemPrompt });
        }
        if (_options.messages?.length) {
            this._baseMessages.push(..._options.messages.map(message => ({ ...message })));
        }
        this._messages = this._baseMessages.map(message => ({ ...message }));
    }

    history(): LlamaChatMessage[] {
        return this._messages.map(message => ({ ...message }));
    }

    reset() {
        this._messages = this._baseMessages.map(message => ({ ...message }));
    }

    send(text: string): string {
        const nextMessages: LlamaChatMessage[] = [...this._messages, { role: "user", content: text }];
        const prompt = this._options.promptBuilder?.(nextMessages) ?? this.buildPrompt(nextMessages);
        try {
            const result = this._llama.main([
                "--log-disable",
                "--no-conversation",
                "--no-display-prompt",
                "-p",
                prompt,
                ...(this._options.args ?? []),
            ], this._model);
            if (result.exitCode !== 0) {
                throw new Error(result.stderr || "llama chat session failed");
            }
            const reply = this.extractReply(result.stdout);
            this._messages = [...nextMessages, { role: "assistant", content: reply }];
            return reply;
        } catch (e) {
            console.error(e);
            return "";
        }
    }

    private buildPrompt(messages: LlamaChatMessage[]): string {
        const lines = messages.map(message => `${this.roleLabel(message.role)}: ${message.content}`);
        lines.push(`${this.roleLabel("assistant")}:`);
        return lines.join("\n\n");
    }

    private extractReply(output: string): string {
        let reply = output;
        for (const marker of ["<|im_start|>assistant\n", "Assistant:"]) {
            const index = reply.lastIndexOf(marker);
            if (index >= 0) {
                reply = reply.slice(index + marker.length);
                break;
            }
        }

        const stopMarkers = ["<|im_end|>", "<|im_start|>user", "<|im_start|>system", "<|im_start|>assistant", "\n\nUser:", "\n\nSystem:", "\n\nAssistant:"];
        let stopIndex = reply.length;
        for (const marker of stopMarkers) {
            const index = reply.indexOf(marker);
            if (index >= 0) {
                stopIndex = Math.min(stopIndex, index);
            }
        }

        return reply.slice(0, stopIndex).trim();
    }

    private roleLabel(role: LlamaChatRole): string {
        switch (role) {
            case "system":
                return "System";
            case "user":
                return "User";
            case "assistant":
                return "Assistant";
        }
    }
}

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

    private unlinkIfPresent(path: string) {
        try {
            this._module.FS_unlink(path);
        } catch (_err) {
            void _err;
        }
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

    private normalizeThreadArgs(args: string[]): string[] {
        const supportsThreadWorkers = typeof Worker !== "undefined" && typeof SharedArrayBuffer !== "undefined";
        if (supportsThreadWorkers) {
            return args;
        }

        const normalized = [...args];
        for (let i = 0; i < normalized.length - 1; ++i) {
            const arg = normalized[i];
            if (arg === "-t" || arg === "--threads" || arg === "-tb" || arg === "--threads-batch") {
                const parsed = Number.parseInt(normalized[i + 1] ?? "", 10);
                if (Number.isFinite(parsed) && parsed > 1) {
                    normalized[i + 1] = "1";
                }
                i += 1;
            }
        }
        return normalized;
    }

    private readThreadCount(args: string[], shortFlag: string, longFlag: string): number | undefined {
        for (let i = 0; i < args.length - 1; ++i) {
            const arg = args[i];
            if (arg === shortFlag || arg === longFlag) {
                const parsed = Number.parseInt(args[i + 1] ?? "", 10);
                if (Number.isFinite(parsed)) {
                    return parsed;
                }
            }
        }
        return undefined;
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

    createChatSession(model: Uint8Array, options: LlamaChatSessionOptions = {}): LlamaChatSession {
        return new LlamaChatSession(this, model, options);
    }

    /**
     * Executes the wasm `main` entrypoint and returns its redirected stdout/stderr.
     *
     * If `model` is provided and `args` does not already specify `-m` or `--model`,
     * the model is mounted and passed to the CLI automatically.
     */
    main(args: string[], model?: Uint8Array): LlamaMainResult {
        args = this.normalizeThreadArgs(args);
        const threads = this.readThreadCount(args, "-t", "--threads");
        const threadsBatch = this.readThreadCount(args, "-tb", "--threads-batch");
        if (threads !== undefined || threadsBatch !== undefined) {
            console.log(`[Llama] Effective threads: ${threads ?? "default"}, batch threads: ${threadsBatch ?? "default"}`);
        }
        const mountedModelPath = "/mainModel.gguf";
        let mountedModel = false;
        if (model && !args.includes("-m") && !args.includes("--model")) {
            try {
                this._module.FS_createDataFile("/", "mainModel.gguf", model, true, false, false);
                mountedModel = true;
            } catch (e) {
                console.error(e);
            }
            args = ["-m", mountedModelPath, ...args];
        }

        const mainArgs = new this._module.VectorString();
        const mainResult = new this._module.VectorString();
        try {
            for (const arg of args) {
                mainArgs.push_back(arg);
            }
            const exitCode = this._module.main(mainArgs, mainResult);
            return {
                exitCode,
                stdout: mainResult.get(0) ?? "",
                stderr: mainResult.get(1) ?? "",
            };
        } finally {
            mainResult.delete();
            mainArgs.delete();
            if (mountedModel) {
                this.unlinkIfPresent(mountedModelPath);
            }
        }
    }

    /**
     * Runs a one-shot chat completion using llama.cpp's CLI entrypoint.
     *
     * The wrapper enables conversation mode by default to match `llama-cli` chat usage.
     */
    chat(text: string, model: Uint8Array, options: LlamaChatOptions = {}): string {
        const args = ["--log-disable", "--single-turn", "-p", text];
        if (options.systemPrompt) {
            args.push("--system-prompt", options.systemPrompt);
        }
        if (options.jinja) {
            args.push("--jinja");
        }
        if (options.chatTemplate) {
            args.push("--chat-template", options.chatTemplate);
        }
        if (options.conversation !== false) {
            args.push("--conversation");
        }
        if (options.args?.length) {
            args.push(...options.args);
        }

        try {
            const result = this.main(args, model);
            if (result.exitCode !== 0) {
                throw new Error(result.stderr || "llama.chat failed");
            }
            return result.stdout;
        } catch (e) {
            console.error(e);
            this.logRedirectedOutputFiles();
            return "";
        }
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
            this.unlinkIfPresent("/embeddingModel.gguf");
        }
        return retVal;
    }
}
