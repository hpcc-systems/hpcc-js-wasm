import { describe, it, expect } from "vitest";
import { Llama, WebBlob } from "@hpcc-js/wasm-llama";

const EMBEDDING_MODEL_URL = "https://huggingface.co/CompendiumLabs/bge-base-en-v1.5-gguf/resolve/main/bge-base-en-v1.5-q4_k_m.gguf";
const CHAT_MODEL_URL = "https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories260K.gguf";

async function loadModel(modelUrl: string, cacheFileName: string): Promise<ArrayBuffer> {
    // In Node.js, use a local disk cache to avoid re-downloading on every test run.
    if (typeof process !== "undefined" && process.versions?.node) {
        const { existsSync, readFileSync, writeFileSync, mkdirSync } = await import("fs");
        const { resolve, dirname } = await import("path");
        const { fileURLToPath } = await import("url");
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const modelCache = resolve(__dirname, `../.vitest-attachments/${cacheFileName}`);
        if (existsSync(modelCache)) {
            const buf = readFileSync(modelCache);
            return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        }
        const webBlob = await WebBlob.create(new URL(modelUrl));
        const data = await webBlob.arrayBuffer();
        mkdirSync(dirname(modelCache), { recursive: true });
        writeFileSync(modelCache, Buffer.from(data));
        return data;
    }
    // Browser: always fetch directly.
    const webBlob = await WebBlob.create(new URL(modelUrl));
    return webBlob.arrayBuffer();
}

async function recordTranscript(transcript: string): Promise<void> {
    console.log("Chat transcript:\n%s", transcript);

    if (typeof process !== "undefined" && process.versions?.node) {
        const { appendFileSync, mkdirSync } = await import("fs");
        const { resolve, dirname } = await import("path");
        const { fileURLToPath } = await import("url");
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const transcriptPath = resolve(__dirname, "../.vitest-attachments/chat-transcript.log");

        mkdirSync(dirname(transcriptPath), { recursive: true });
        appendFileSync(transcriptPath, `${new Date().toISOString()}\n${transcript}\n\n`);
    }
}

function buildSmolLmPrompt(messages: { role: "system" | "user" | "assistant"; content: string; }[]): string {
    return `${messages.map(message => `<|im_start|>${message.role}\n${message.content}<|im_end|>`).join("\n")}\n<|im_start|>assistant\n`;
}

describe("llama", () => {
    it("version", async () => {
        let llama = await Llama.load();
        let v = llama.version();
        const v1 = v;
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).to.equal("10058");    //  Update README.md with the new version!!!

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).equals(v1);
        Llama.unload();

        llama = await Llama.load();
        v = llama.version();
        expect(v).to.be.a.string;
        expect(v).to.be.not.empty;
        expect(v).equals(v1);
        Llama.unload();
    });

    it("downloads a tiny Hugging Face chat model", async () => {
        const data = await loadModel(CHAT_MODEL_URL, "stories260K.gguf");
        const magic = new TextDecoder().decode(new Uint8Array(data.slice(0, 4)));

        expect(data).to.be.instanceOf(ArrayBuffer);
        expect(data.byteLength).to.be.greaterThan(0);
        expect(magic).to.equal("GGUF");
    });

    it("runs a full chat session against a tiny Hugging Face chat model", async () => {
        const llama = await Llama.load();
        const model = new Uint8Array(await loadModel(CHAT_MODEL_URL, "stories260K.gguf"));

        const mainResult = llama.main([
            "--help",
            "-t",
            "1",
            "-tb",
            "1",
        ], model);
        expect(mainResult.exitCode).to.equal(0);
        expect(mainResult.stdout).to.contain("usage:");
        expect(mainResult.stderr).to.be.a("string");

        const session = llama.createChatSession(model, {
            systemPrompt: "You are concise.",
            promptBuilder: buildSmolLmPrompt,
            args: ["--temp", "0.2", "--top-p", "0.9", "-n", "256", "--ctx-size", "4096", "--threads", "4", "--threads-batch", "1", "--gpu-layers", "99"],
        });

        const prompts = [
            "hello",
            "how are you?",
            "what is your job?",
            "answer in two short sentences",
        ];
        const replies = prompts.map(prompt => session.send(prompt));

        const transcript = [
            "system: You are concise.",
            ...prompts.flatMap((prompt, index) => [
                `user: ${prompt}`,
                `assistant: ${replies[index]}`,
            ]),
        ].join("\n");
        await recordTranscript(transcript);

        for (const reply of replies) {
            expect(reply).to.be.a("string");
            expect(reply.trim().length).to.be.greaterThan(0);
        }

        const history = session.history();
        expect(history.length).to.equal(1 + prompts.length * 2);
        expect(history[0]).to.deep.equal({ role: "system", content: "You are concise." });
        for (const [index, prompt] of prompts.entries()) {
            const userMessage = history[1 + index * 2];
            const assistantMessage = history[2 + index * 2];

            expect(userMessage).to.deep.equal({ role: "user", content: prompt });
            expect(assistantMessage.content).to.equal(replies[index]);
        }

        Llama.unload();
    });

    it("test", async () => {
        let llama = await Llama.load();
        const data: ArrayBuffer = await loadModel(EMBEDDING_MODEL_URL, "bge-base-en-v1.5-q4_k_m.gguf");
        expect(data).to.be.instanceOf(ArrayBuffer);
        expect(data.byteLength).to.be.greaterThan(0);

        const embeddings = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings).to.be.instanceOf(Array);
        expect(embeddings.length).equals(1);
        expect(embeddings[0]).to.be.a.instanceOf(Array);
        expect(embeddings[0].length).to.be.greaterThan(0);
        expect(embeddings[0][0]).to.be.a("number");

        const embeddings2 = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings2).to.be.instanceOf(Array);
        expect(embeddings2.length).equals(1);
        expect(embeddings2[0]).to.be.a.instanceOf(Array);
        expect(embeddings2[0].length).to.be.greaterThan(0);
        expect(embeddings2[0][0]).to.be.a("number");

        expect(embeddings).to.deep.equal(embeddings2);

        Llama.unload();
        llama = await Llama.load();

        const embeddings3 = llama.embedding("Hello and Welcome!", new Uint8Array(data));
        expect(embeddings3).to.be.instanceOf(Array);
        expect(embeddings3.length).equals(1);
        expect(embeddings3[0]).to.be.a.instanceOf(Array);
        expect(embeddings3[0].length).to.be.greaterThan(0);
        expect(embeddings3[0][0]).to.be.a("number");
        expect(embeddings).to.deep.equal(embeddings3);
    });
}, 180000);
