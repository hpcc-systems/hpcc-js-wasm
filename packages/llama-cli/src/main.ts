import fs from "fs";
import { Worker } from "worker_threads";
import { Llama } from "@hpcc-js/wasm-llama";
import { HELP_TEXT, parseArgs } from "./cliArgs.ts";

export async function main() {
    let llama: Llama | undefined;
    try {
        const parsed = parseArgs(process.argv.slice(2));

        if (parsed.help) {
            console.log(HELP_TEXT);
            return;
        }

        ensureWorkerGlobal();
        llama = await Llama.load();

        if (parsed.version) {
            console.log(`llama.cpp version:  ${llama.version()}`);
            return;
        }

        if (parsed.llamaHelp) {
            const result = llama.main(["--help"]);
            writeResult(result.stdout, result.stderr);
            process.exitCode = result.exitCode;
            return;
        }

        const model = parsed.model ? await loadModel(parsed.model) : undefined;
        const result = llama.main(parsed.mainArgs, model);
        writeResult(result.stdout, result.stderr);
        process.exitCode = result.exitCode;
    } catch (e: any) {
        console.error(`Error:  ${e?.message}\n`);
        console.error(HELP_TEXT);
        process.exitCode = 1;
    } finally {
        if (llama) {
            Llama.unload();
        }
    }
}

function ensureWorkerGlobal() {
    (globalThis as any).Worker ??= Worker;
}

async function loadModel(model: string): Promise<Uint8Array> {
    const url = parseUrl(model);
    if (url) {
        const response = await fetch(normalizeModelUrl(url));
        if (!response.ok) {
            throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
        }
        return new Uint8Array(await response.arrayBuffer());
    }

    if (!fs.existsSync(model)) {
        throw new Error(`Model file does not exist: ${model}`);
    }

    const buffer = fs.readFileSync(model);
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function parseUrl(value: string): URL | undefined {
    try {
        const url = new URL(value);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return url;
        }
    } catch (_err) {
        void _err;
    }
    return undefined;
}

function normalizeModelUrl(url: URL): URL {
    if ((url.hostname === "huggingface.co" || url.hostname === "www.huggingface.co") && url.pathname.includes("/blob/")) {
        const normalized = new URL(url.href);
        normalized.pathname = normalized.pathname.replace("/blob/", "/resolve/");
        return normalized;
    }
    return url;
}

function writeResult(stdout: string, stderr: string) {
    if (stdout) {
        process.stdout.write(stdout);
        if (!stdout.endsWith("\n")) {
            process.stdout.write("\n");
        }
    }
    if (stderr) {
        process.stderr.write(stderr);
        if (!stderr.endsWith("\n")) {
            process.stderr.write("\n");
        }
    }
}
